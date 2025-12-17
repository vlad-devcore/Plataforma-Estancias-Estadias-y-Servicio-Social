import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";

import {
  authenticateToken,
  checkRole
} from "./authMiddleware.js";

const router = express.Router();

/* =========================
   MIDDLEWARE GLOBAL
   TODO ESTE MÓDULO ES ADMIN
========================= */
router.use(authenticateToken);
router.use(checkRole(["admin"]));

/* =========================
   CONFIGURACIÓN MULTER
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "public/uploads/formatos";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/* =========================
   LISTAR FORMATOS
========================= */
router.get("/", async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT id, nombre_documento, nombre_archivo, estado, ultima_modificacion_manual
       FROM formatos_admin`
    );
    res.json(results);
  } catch {
    res.status(500).json({ error: "Error al obtener formatos" });
  }
});

/* =========================
   SUBIR / ACTUALIZAR FORMATO
========================= */
router.post("/upload", upload.single("archivo"), async (req, res) => {
  try {
    const { nombre_documento } = req.body;
    const file = req.file;

    if (!nombre_documento || !file) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const [existing] = await pool.query(
      "SELECT nombre_archivo FROM formatos_admin WHERE nombre_documento = ?",
      [nombre_documento]
    );

    if (existing.length > 0 && existing[0].nombre_archivo) {
      const oldPath = path.join("public/uploads/formatos", existing[0].nombre_archivo);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      await pool.query(
        `UPDATE formatos_admin
         SET nombre_archivo = ?, estado = 'Activo', ultima_modificacion_manual = NOW()
         WHERE nombre_documento = ?`,
        [file.filename, nombre_documento]
      );
    } else {
      await pool.query(
        `INSERT INTO formatos_admin (nombre_documento, nombre_archivo, estado)
         VALUES (?, ?, 'Activo')`,
        [nombre_documento, file.filename]
      );
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Error al subir formato" });
  }
});

/* =========================
   CAMBIAR ESTADO FORMATO
========================= */
router.put("/estado", async (req, res) => {
  try {
    const { nombre_documento, estado } = req.body;

    if (!nombre_documento || !["Activo", "Bloqueado"].includes(estado)) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const [result] = await pool.query(
      `UPDATE formatos_admin
       SET estado = ?, ultima_modificacion_manual = NOW()
       WHERE nombre_documento = ?`,
      [estado, nombre_documento]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Formato no encontrado" });
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Error al actualizar estado" });
  }
});

/* =========================
   DESCARGAR FORMATO
========================= */
router.get("/download/:nombre_documento", async (req, res) => {
  try {
    const { nombre_documento } = req.params;

    const [formato] = await pool.query(
      "SELECT nombre_archivo FROM formatos_admin WHERE nombre_documento = ?",
      [nombre_documento]
    );

    if (!formato.length || !formato[0].nombre_archivo) {
      return res.status(404).json({ error: "Formato no encontrado" });
    }

    const filePath = path.join("public/uploads/formatos", formato[0].nombre_archivo);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    res.download(filePath, formato[0].nombre_archivo);
  } catch {
    res.status(500).json({ error: "Error al descargar formato" });
  }
});

/* =========================
   VER FORMATO
========================= */
router.get("/view/:nombre_documento", async (req, res) => {
  try {
    const { nombre_documento } = req.params;

    const [formato] = await pool.query(
      "SELECT nombre_archivo FROM formatos_admin WHERE nombre_documento = ?",
      [nombre_documento]
    );

    if (!formato.length || !formato[0].nombre_archivo) {
      return res.status(404).json({ error: "Formato no encontrado" });
    }

    const filePath = path.join("public/uploads/formatos", formato[0].nombre_archivo);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    res.sendFile(path.resolve(filePath));
  } catch {
    res.status(500).json({ error: "Error al visualizar formato" });
  }
});

/* =========================
   ELIMINAR FORMATO
========================= */
router.delete("/:nombre_documento", async (req, res) => {
  try {
    const { nombre_documento } = req.params;

    const [formato] = await pool.query(
      "SELECT nombre_archivo FROM formatos_admin WHERE nombre_documento = ?",
      [nombre_documento]
    );

    if (!formato.length) {
      return res.status(404).json({ error: "Formato no encontrado" });
    }

    if (formato[0].nombre_archivo) {
      const filePath = path.join("public/uploads/formatos", formato[0].nombre_archivo);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await pool.query(
      "DELETE FROM formatos_admin WHERE nombre_documento = ?",
      [nombre_documento]
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Error al eliminar formato" });
  }
});

export default router;
