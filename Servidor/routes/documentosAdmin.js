import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/config.db.js";

import {
  authenticateToken,
  checkRole
} from "./authMiddleware.js";

const router = express.Router();

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   MIDDLEWARE GLOBAL ADMIN
========================= */
router.use(authenticateToken);
router.use(checkRole(["admin"]));

/* =========================
   CONSTANTES DE SEGURIDAD
========================= */
const UPLOAD_DIR = path.resolve(__dirname, "../public/uploads/formatos");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".xlsx", ".doc", ".xls"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.ms-excel"
];

/* =========================
   UTILIDADES DE SEGURIDAD
========================= */
const sanitizeFilename = (filename) => {
  // Remover path traversal y caracteres peligrosos
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, "_")
    .substring(0, 255);
};

const isPathSafe = (filePath) => {
  const resolved = path.resolve(filePath);
  return resolved.startsWith(UPLOAD_DIR);
};

const validateDocumentName = (name) => {
  if (!name || typeof name !== "string") return false;
  if (name.length > 100) return false;
  if (name.includes("..") || name.includes("/") || name.includes("\\")) return false;
  return true;
};

/* =========================
   CONFIGURACIÓN MULTER
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true, mode: 0o755 });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const basename = path.basename(file.originalname, ext);
    const safeName = sanitizeFilename(basename);
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    cb(null, `${safeName}-${timestamp}-${random}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error(`Extensión no permitida. Permitidas: ${ALLOWED_EXTENSIONS.join(", ")}`));
    }
    
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Tipo MIME no permitido"));
    }
    
    cb(null, true);
  }
});

/* =========================
   MIDDLEWARE DE ERROR MULTER
========================= */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ 
        error: `Archivo demasiado grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      });
    }
    return res.status(400).json({ error: `Error de carga: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

/* =========================
   LISTAR FORMATOS
========================= */
router.get("/", async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT id, nombre_documento, nombre_archivo, estado, 
              DATE_FORMAT(ultima_modificacion_manual, '%Y-%m-%d %H:%i:%s') as ultima_modificacion
       FROM formatos_admin
       ORDER BY ultima_modificacion_manual DESC`
    );
    res.json(results);
  } catch (error) {
    console.error("Error en GET /documentosAdmin:", error);
    res.status(500).json({ error: "Error al obtener formatos" });
  }
});

/* =========================
   SUBIR / ACTUALIZAR FORMATO
========================= */
router.post(
  "/upload",
  upload.single("archivo"),
  handleMulterError,
  async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
      const { nombre_documento } = req.body;
      const file = req.file;

      if (!nombre_documento || !file) {
        if (file) {
          fs.unlinkSync(file.path); // Limpiar archivo subido
        }
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      if (!validateDocumentName(nombre_documento)) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: "Nombre de documento inválido" });
      }

      await connection.beginTransaction();

      // Verificar si existe
      const [existing] = await connection.query(
        "SELECT nombre_archivo FROM formatos_admin WHERE nombre_documento = ? FOR UPDATE",
        [nombre_documento]
      );

      if (existing.length > 0 && existing[0].nombre_archivo) {
        // Eliminar archivo antiguo de forma segura
        const oldFilename = existing[0].nombre_archivo;
        const oldPath = path.join(UPLOAD_DIR, oldFilename);
        
        if (isPathSafe(oldPath) && fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }

        // Actualizar registro
        await connection.query(
          `UPDATE formatos_admin
           SET nombre_archivo = ?, estado = 'Activo', ultima_modificacion_manual = NOW()
           WHERE nombre_documento = ?`,
          [file.filename, nombre_documento]
        );
      } else {
        // Insertar nuevo registro
        await connection.query(
          `INSERT INTO formatos_admin (nombre_documento, nombre_archivo, estado)
           VALUES (?, ?, 'Activo')`,
          [nombre_documento, file.filename]
        );
      }

      await connection.commit();
      
      res.json({ 
        success: true,
        message: "Formato subido correctamente",
        filename: file.filename
      });
    } catch (error) {
      await connection.rollback();
      
      // Limpiar archivo subido en caso de error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      console.error("Error en POST /documentosAdmin/upload:", error);
      res.status(500).json({ error: "Error al subir formato" });
    } finally {
      connection.release();
    }
  }
);

/* =========================
   CAMBIAR ESTADO FORMATO
========================= */
router.put("/estado", async (req, res) => {
  try {
    const { nombre_documento, estado } = req.body;

    if (!validateDocumentName(nombre_documento)) {
      return res.status(400).json({ error: "Nombre de documento inválido" });
    }

    if (!["Activo", "Bloqueado"].includes(estado)) {
      return res.status(400).json({ error: "Estado inválido. Use: Activo o Bloqueado" });
    }

    const [result] = await pool.query(
      `UPDATE formatos_admin
       SET estado = ?, ultima_modificacion_manual = NOW()
       WHERE nombre_documento = ?`,
      [estado, nombre_documento]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Formato no encontrado" });
    }

    res.json({ 
      success: true,
      message: "Estado actualizado correctamente"
    });
  } catch (error) {
    console.error("Error en PUT /documentosAdmin/estado:", error);
    res.status(500).json({ error: "Error al actualizar estado" });
  }
});

/* =========================
   DESCARGAR FORMATO
========================= */
router.get("/download/:nombre_documento", async (req, res) => {
  try {
    const { nombre_documento } = req.params;

    if (!validateDocumentName(nombre_documento)) {
      return res.status(400).json({ error: "Nombre de documento inválido" });
    }

    const [formato] = await pool.query(
      "SELECT nombre_archivo FROM formatos_admin WHERE nombre_documento = ?",
      [nombre_documento]
    );

    if (formato.length === 0 || !formato[0].nombre_archivo) {
      return res.status(404).json({ error: "Formato no encontrado" });
    }

    const filename = formato[0].nombre_archivo;
    const filePath = path.join(UPLOAD_DIR, filename);

    // PREVENCIÓN PATH TRAVERSAL
    if (!isPathSafe(filePath)) {
      console.error("Intento de path traversal:", filePath);
      return res.status(403).json({ error: "Acceso denegado" });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado en el servidor" });
    }

    // Establecer headers de seguridad
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    
    res.download(filePath, filename);
  } catch (error) {
    console.error("Error en GET /documentosAdmin/download:", error);
    res.status(500).json({ error: "Error al descargar formato" });
  }
});

/* =========================
   VER FORMATO (PREVIEW)
========================= */
router.get("/view/:nombre_documento", async (req, res) => {
  try {
    const { nombre_documento } = req.params;

    if (!validateDocumentName(nombre_documento)) {
      return res.status(400).json({ error: "Nombre de documento inválido" });
    }

    const [formato] = await pool.query(
      "SELECT nombre_archivo FROM formatos_admin WHERE nombre_documento = ?",
      [nombre_documento]
    );

    if (formato.length === 0 || !formato[0].nombre_archivo) {
      return res.status(404).json({ error: "Formato no encontrado" });
    }

    const filename = formato[0].nombre_archivo;
    const filePath = path.join(UPLOAD_DIR, filename);

    // PREVENCIÓN PATH TRAVERSAL
    if (!isPathSafe(filePath)) {
      console.error("Intento de path traversal:", filePath);
      return res.status(403).json({ error: "Acceso denegado" });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado en el servidor" });
    }

    // Headers de seguridad para vista previa
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error en GET /documentosAdmin/view:", error);
    res.status(500).json({ error: "Error al visualizar formato" });
  }
});

/* =========================
   ELIMINAR FORMATO
========================= */
router.delete("/:nombre_documento", async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { nombre_documento } = req.params;

    if (!validateDocumentName(nombre_documento)) {
      return res.status(400).json({ error: "Nombre de documento inválido" });
    }

    await connection.beginTransaction();

    const [formato] = await connection.query(
      "SELECT nombre_archivo FROM formatos_admin WHERE nombre_documento = ? FOR UPDATE",
      [nombre_documento]
    );

    if (formato.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Formato no encontrado" });
    }

    // Eliminar archivo físico de forma segura
    if (formato[0].nombre_archivo) {
      const filename = formato[0].nombre_archivo;
      const filePath = path.join(UPLOAD_DIR, filename);
      
      if (isPathSafe(filePath) && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Eliminar registro de BD
    await connection.query(
      "DELETE FROM formatos_admin WHERE nombre_documento = ?",
      [nombre_documento]
    );

    await connection.commit();
    
    res.json({ 
      success: true,
      message: "Formato eliminado correctamente"
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error en DELETE /documentosAdmin:", error);
    res.status(500).json({ error: "Error al eliminar formato" });
  } finally {
    connection.release();
  }
});

export default router;