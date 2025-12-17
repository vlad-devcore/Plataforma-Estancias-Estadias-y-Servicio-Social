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
   CONFIGURACIÓN MULTER CSV
========================= */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== ".csv") {
      return cb(new Error("Solo se permiten archivos CSV"));
    }
    cb(null, true);
  }
});

/* =========================
   UTILIDADES
========================= */
const getEmailPrefix = (email) => email?.split("@")[0] || "default";

const validateUserData = (data, requirePassword = true) => {
  const { email, nombre, apellido_paterno, role, password } = data;

  if (!email || !nombre || !apellido_paterno) {
    return "Faltan campos obligatorios";
  }

  if (requirePassword && (!password || password.trim() === "")) {
    return "La contraseña es obligatoria";
  }

  if (role && !["estudiante", "administrador", "asesor_academico", "asesor_empresarial"].includes(role)) {
    return "Rol no válido";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Email no válido";
  }

  return null;
};

/* =========================
   LISTAR USUARIOS (SOLO ADMIN)
========================= */
router.get(
  "/",
  authenticateToken,
  checkRole(["admin"]),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search ? `%${req.query.search}%` : "%";

      const [users] = await pool.query(
        `SELECT id_user, email, nombre, apellido_paterno, apellido_materno, genero, role
         FROM users
         WHERE email LIKE ?
         LIMIT ? OFFSET ?`,
        [search, limit, offset]
      );

      const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) as total FROM users WHERE email LIKE ?`,
        [search]
      );

      res.json({
        users,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      });
    } catch {
      res.status(500).json({ error: "Error interno del servidor" });
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
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Archivo CSV requerido" });
    }

    const connection = await pool.getConnection();
    let inserted = 0;
    const errors = [];

    try {
      const decoded = iconv.decode(req.file.buffer, "win1252");
      const buffer = iconv.encode(decoded, "utf8");

      const rows = [];
      await new Promise((resolve, reject) => {
        Readable.from(buffer)
          .pipe(csv({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
          .on("data", data => rows.push(data))
          .on("end", resolve)
          .on("error", reject);
      });

      for (const row of rows) {
        const password = row.password?.trim() || getEmailPrefix(row.email);
        const error = validateUserData({ ...row, password }, false);
        if (error) {
          errors.push(error);
          continue;
        }

        await connection.beginTransaction();

        try {
          const [exists] = await connection.query(
            "SELECT id_user FROM users WHERE email = ?",
            [row.email]
          );
          if (exists.length) throw new Error("Email duplicado");

          const hash = await bcrypt.hash(password, 10);
          const [result] = await connection.query(
            `INSERT INTO users (email, password, nombre, apellido_paterno, apellido_materno, genero, role)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              row.email,
              hash,
              row.nombre,
              row.apellido_paterno,
              row.apellido_materno || null,
              row.genero || null,
              row.role
            ]
          );

          const userId = result.insertId;

          if (row.role === "estudiante") {
            await connection.query(
              "INSERT INTO estudiantes (id_user, matricula) VALUES (?, ?)",
              [userId, getEmailPrefix(row.email)]
            );
          }

          await connection.commit();
          inserted++;
        } catch (e) {
          await connection.rollback();
          errors.push(e.message);
        }
      }

      res.status(201).json({ inserted, errors });
    } catch {
      res.status(500).json({ error: "Error al procesar CSV" });
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
    const [user] = await pool.query(
      "SELECT id_user, email, nombre, apellido_paterno, apellido_materno, genero, role FROM users WHERE id_user = ?",
      [req.params.id_user]
    );

    if (!user.length) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user[0]);
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
    const { email, nombre, apellido_paterno, apellido_materno, genero } = req.body;

    const error = validateUserData({ email, nombre, apellido_paterno }, false);
    if (error) {
      return res.status(400).json({ error });
    }

    const [result] = await pool.query(
      `UPDATE users
       SET email = ?, nombre = ?, apellido_paterno = ?, apellido_materno = ?, genero = ?
       WHERE id_user = ?`,
      [email, nombre, apellido_paterno, apellido_materno, genero || null, req.params.id_user]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ success: true });
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
    const [result] = await pool.query(
      "DELETE FROM users WHERE id_user = ?",
      [req.params.id_user]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ success: true });
  }
);

export default router;
