import express from "express";
import pool from "../config/config.db.js";
import multer from "multer";
import { Readable } from "stream";
import csv from "csv-parser";
import bcrypt from "bcrypt";
import path from "path";
import iconv from "iconv-lite";

import {
  authenticateToken,
  checkRole,
  checkOwnership,
  preventPrivilegeEscalation,
  validateNumericId
} from "./authMiddleware.js";

const router = express.Router();

/* =========================
   RATE LIMITING
========================= */
const uploadAttempts = new Map();
const MAX_UPLOADS_PER_HOUR = 5;

const checkUploadRateLimit = (req, res, next) => {
  const userId = req.user.id;
  const now = Date.now();
  const userAttempts = uploadAttempts.get(userId) || [];
  
  const recentAttempts = userAttempts.filter(time => now - time < 3600000);
  
  if (recentAttempts.length >= MAX_UPLOADS_PER_HOUR) {
    return res.status(429).json({ 
      error: "Límite de cargas CSV alcanzado. Intenta en 1 hora." 
    });
  }
  
  recentAttempts.push(now);
  uploadAttempts.set(userId, recentAttempts);
  next();
};

/* =========================
   CONFIGURACIÓN MULTER CSV
========================= */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".csv") {
      return cb(new Error("Solo archivos CSV permitidos"));
    }
    cb(null, true);
  }
});

/* =========================
   UTILIDADES
========================= */
const getEmailPrefix = (email) => {
  if (!email || typeof email !== 'string') return "default";
  const parts = email.split("@");
  return parts[0] || "default";
};

const sanitizeString = (str) => {
  if (!str) return null;
  return String(str).trim().substring(0, 255);
};

const validateUserData = (data, requirePassword = true) => {
  const { email, nombre, apellido_paterno, role, password } = data;

  if (!email || !nombre || !apellido_paterno) {
    return "Campos obligatorios: email, nombre, apellido_paterno";
  }

  if (requirePassword && (!password || password.trim() === "")) {
    return "La contraseña es obligatoria";
  }

  const validRoles = ["estudiante", "administrador", "asesor_academico", "asesor_empresarial"];
  if (role && !validRoles.includes(role)) {
    return `Rol inválido. Permitidos: ${validRoles.join(", ")}`;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Formato de email inválido";
  }

  if (nombre.length > 100 || apellido_paterno.length > 100) {
    return "Nombre o apellido demasiado largo (máx 100 caracteres)";
  }

  return null;
};

/* =========================
   LISTAR USUARIOS (ADMIN)
========================= */
router.get(
  "/",
  authenticateToken,
  checkRole(["admin"]),
  async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
      const offset = (page - 1) * limit;
      
      // PREVENCIÓN SQL INJECTION: Sin LIKE con input directo
      const search = req.query.search ? sanitizeString(req.query.search) : null;

      let query, params;
      
      if (search) {
        query = `
          SELECT id_user, email, nombre, apellido_paterno, apellido_materno, genero, role
          FROM users
          WHERE email LIKE CONCAT('%', ?, '%') OR nombre LIKE CONCAT('%', ?, '%')
          LIMIT ? OFFSET ?
        `;
        params = [search, search, limit, offset];
      } else {
        query = `
          SELECT id_user, email, nombre, apellido_paterno, apellido_materno, genero, role
          FROM users
          LIMIT ? OFFSET ?
        `;
        params = [limit, offset];
      }

      const [users] = await pool.query(query, params);

      // Count total
      let countQuery, countParams;
      if (search) {
        countQuery = `
          SELECT COUNT(*) as total 
          FROM users 
          WHERE email LIKE CONCAT('%', ?, '%') OR nombre LIKE CONCAT('%', ?, '%')
        `;
        countParams = [search, search];
      } else {
        countQuery = "SELECT COUNT(*) as total FROM users";
        countParams = [];
      }

      const [[{ total }]] = await pool.query(countQuery, countParams);

      res.json({
        users,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error("Error en GET /users:", error);
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  }
);

/* =========================
   CARGA MASIVA CSV (ADMIN)
========================= */
router.post(
  "/upload",
  authenticateToken,
  checkRole(["admin"]),
  checkUploadRateLimit,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Archivo CSV requerido" });
    }

    const connection = await pool.getConnection();
    let inserted = 0;
    const errors = [];
    const MAX_ROWS = 1000; // Límite de filas por CSV

    try {
      // Decodificar archivo
      const decoded = iconv.decode(req.file.buffer, "win1252");
      const buffer = iconv.encode(decoded, "utf8");

      const rows = [];
      await new Promise((resolve, reject) => {
        Readable.from(buffer)
          .pipe(csv({ 
            mapHeaders: ({ header }) => header.trim().toLowerCase(),
            maxRows: MAX_ROWS
          }))
          .on("data", data => rows.push(data))
          .on("end", resolve)
          .on("error", reject);
      });

      if (rows.length === 0) {
        return res.status(400).json({ error: "CSV vacío o sin datos válidos" });
      }

      if (rows.length > MAX_ROWS) {
        return res.status(400).json({ 
          error: `Máximo ${MAX_ROWS} filas por archivo` 
        });
      }

      // Procesar filas
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // Sanitizar inputs
        const email = sanitizeString(row.email);
        const nombre = sanitizeString(row.nombre);
        const apellido_paterno = sanitizeString(row.apellido_paterno);
        const apellido_materno = sanitizeString(row.apellido_materno);
        const genero = sanitizeString(row.genero);
        const role = sanitizeString(row.role);
        
        const password = row.password?.trim() || getEmailPrefix(email);
        
        const error = validateUserData(
          { email, nombre, apellido_paterno, role, password }, 
          false
        );
        
        if (error) {
          errors.push(`Fila ${i + 2}: ${error}`);
          continue;
        }

        await connection.beginTransaction();

        try {
          // Verificar duplicados
          const [exists] = await connection.query(
            "SELECT id_user FROM users WHERE email = ?",
            [email]
          );
          
          if (exists.length > 0) {
            throw new Error("Email ya existe");
          }

          // Hash de contraseña
          const hash = await bcrypt.hash(password, 10);
          
          // Insertar usuario
          const [result] = await connection.query(
            `INSERT INTO users (email, password, nombre, apellido_paterno, apellido_materno, genero, role)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [email, hash, nombre, apellido_paterno, apellido_materno, genero, role]
          );

          const userId = result.insertId;

          // Si es estudiante, crear registro en estudiantes
          if (role === "estudiante") {
            const matricula = getEmailPrefix(email);
            await connection.query(
              "INSERT INTO estudiantes (id_user, matricula) VALUES (?, ?)",
              [userId, matricula]
            );
          }

          await connection.commit();
          inserted++;
        } catch (e) {
          await connection.rollback();
          errors.push(`Fila ${i + 2}: ${e.message}`);
        }
      }

      res.status(201).json({ 
        inserted, 
        failed: errors.length,
        errors: errors.slice(0, 10) // Solo primeros 10 errores
      });
    } catch (error) {
      console.error("Error en upload CSV:", error);
      res.status(500).json({ error: "Error al procesar archivo CSV" });
    } finally {
      connection.release();
    }
  }
);

/* =========================
   VER PERFIL (OWNERSHIP)
========================= */
router.get(
  "/:id_user",
  authenticateToken,
  validateNumericId,
  checkOwnership("user"),
  async (req, res) => {
    try {
      const [user] = await pool.query(
        `SELECT id_user, email, nombre, apellido_paterno, apellido_materno, genero, role 
         FROM users 
         WHERE id_user = ?`,
        [req.params.id_user]
      );

      if (user.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json(user[0]);
    } catch (error) {
      console.error("Error en GET /users/:id", error);
      res.status(500).json({ error: "Error al obtener usuario" });
    }
  }
);

/* =========================
   ACTUALIZAR PERFIL
========================= */
router.put(
  "/:id_user",
  authenticateToken,
  validateNumericId,
  checkOwnership("user"),
  preventPrivilegeEscalation,
  async (req, res) => {
    try {
      const { email, nombre, apellido_paterno, apellido_materno, genero } = req.body;

      // Sanitizar inputs
      const cleanEmail = sanitizeString(email);
      const cleanNombre = sanitizeString(nombre);
      const cleanApellidoP = sanitizeString(apellido_paterno);
      const cleanApellidoM = sanitizeString(apellido_materno);
      const cleanGenero = sanitizeString(genero);

      const error = validateUserData(
        { email: cleanEmail, nombre: cleanNombre, apellido_paterno: cleanApellidoP }, 
        false
      );
      
      if (error) {
        return res.status(400).json({ error });
      }

      // Verificar que el email no esté en uso por otro usuario
      const [emailExists] = await pool.query(
        "SELECT id_user FROM users WHERE email = ? AND id_user != ?",
        [cleanEmail, req.params.id_user]
      );

      if (emailExists.length > 0) {
        return res.status(400).json({ error: "El email ya está en uso" });
      }

      const [result] = await pool.query(
        `UPDATE users
         SET email = ?, nombre = ?, apellido_paterno = ?, apellido_materno = ?, genero = ?
         WHERE id_user = ?`,
        [cleanEmail, cleanNombre, cleanApellidoP, cleanApellidoM, cleanGenero, req.params.id_user]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json({ 
        success: true,
        message: "Perfil actualizado correctamente"
      });
    } catch (error) {
      console.error("Error en PUT /users/:id", error);
      res.status(500).json({ error: "Error al actualizar usuario" });
    }
  }
);

/* =========================
   ELIMINAR USUARIO (ADMIN)
========================= */
router.delete(
  "/:id_user",
  authenticateToken,
  checkRole(["admin"]),
  validateNumericId,
  async (req, res) => {
    try {
      // No permitir que un admin se elimine a sí mismo
      if (parseInt(req.params.id_user) === req.user.id) {
        return res.status(400).json({ 
          error: "No puedes eliminar tu propia cuenta" 
        });
      }

      const [result] = await pool.query(
        "DELETE FROM users WHERE id_user = ?",
        [req.params.id_user]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json({ 
        success: true,
        message: "Usuario eliminado correctamente"
      });
    } catch (error) {
      console.error("Error en DELETE /users/:id", error);
      res.status(500).json({ error: "Error al eliminar usuario" });
    }
  }
);

export default router;