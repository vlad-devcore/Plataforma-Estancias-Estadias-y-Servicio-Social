import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";
import { fileURLToPath } from "url";

import {
  authenticateToken,
  checkRole,
  checkOwnership,
  validateNumericId
} from "./authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/* =========================
   CONFIGURACIÓN MULTER
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "public/uploads/documentos";
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
   CATÁLOGOS (AUTENTICADOS)
========================= */
router.get("/tipo_documento", authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT IdTipoDoc, Nombre_TipoDoc FROM tipo_documento ORDER BY Nombre_TipoDoc`
    );
    res.json(results);
  } catch {
    res.status(500).json({ error: "Error al obtener tipos de documentos" });
  }
});

router.get("/programas_educativos", authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT DISTINCT nombre FROM programa_educativo WHERE nombre IS NOT NULL ORDER BY nombre`
    );
    res.json(results.map(r => r.nombre));
  } catch {
    res.status(500).json({ error: "Error al obtener programas educativos" });
  }
});

router.get("/periodos", authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT IdPeriodo, Año, Fase FROM periodos ORDER BY Año DESC, Fase`
    );
    res.json(results);
  } catch {
    res.status(500).json({ error: "Error al obtener periodos" });
  }
});

/* =========================
   SUBIR DOCUMENTO (SEGURO)
========================= */
router.post(
  "/upload",
  authenticateToken,
  upload.single("archivo"),
  async (req, res) => {
    try {
      const { IdTipoDoc, Comentarios = "", id_proceso } = req.body;
      const file = req.file;
      const id_usuario = req.user.id; // 🔐 FORZADO

      if (!IdTipoDoc || !id_proceso || !file) {
        return res.status(400).json({ error: "Faltan campos obligatorios o archivo" });
      }

      const nombreArchivo = decodeURIComponent(escape(file.originalname));
      const rutaArchivo = `/uploads/documentos/${file.filename}`;

      const [existing] = await pool.query(
        `SELECT id_Documento, RutaArchivo 
         FROM documentos 
         WHERE id_proceso = ? AND IdTipoDoc = ? AND id_usuario = ?`,
        [id_proceso, IdTipoDoc, id_usuario]
      );

      if (existing.length > 0) {
        const oldFilePath = path.join(__dirname, "..", "public", existing[0].RutaArchivo);
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);

        await pool.query(
          `UPDATE documentos 
           SET NombreArchivo = ?, RutaArchivo = ?, Estatus = 'Pendiente', Comentarios = NULL
           WHERE id_Documento = ?`,
          [nombreArchivo, rutaArchivo, existing[0].id_Documento]
        );
      } else {
        await pool.query(
          `INSERT INTO documentos 
           (NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso)
           VALUES (?, ?, ?, ?, ?, 'Pendiente', ?)`,
          [nombreArchivo, rutaArchivo, IdTipoDoc, id_usuario, Comentarios, id_proceso]
        );
      }

      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Error al subir documento" });
    }
  }
);

/* =========================
   ACCIONES ADMINISTRATIVAS
========================= */
router.put(
  "/approve/:id_Documento",
  authenticateToken,
  checkRole(["admin", "coordinador"]),
  validateNumericId,
  async (req, res) => {
    const { id_Documento } = req.params;
    const [result] = await pool.query(
      `UPDATE documentos SET Estatus = 'Aprobado', Comentarios = NULL WHERE id_Documento = ?`,
      [id_Documento]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }
    res.json({ success: true });
  }
);

router.put(
  "/reject/:id_Documento",
  authenticateToken,
  checkRole(["admin", "coordinador"]),
  validateNumericId,
  async (req, res) => {
    const { id_Documento } = req.params;
    const { comentarios } = req.body;

    if (!comentarios) {
      return res.status(400).json({ error: "Falta el motivo del rechazo" });
    }

    const [result] = await pool.query(
      `UPDATE documentos SET Estatus = 'Rechazado', Comentarios = ? WHERE id_Documento = ?`,
      [comentarios, id_Documento]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    res.json({ success: true });
  }
);

router.put(
  "/revert/:id_Documento",
  authenticateToken,
  checkRole(["admin", "coordinador"]),
  validateNumericId,
  async (req, res) => {
    const { id_Documento } = req.params;
    const [result] = await pool.query(
      `UPDATE documentos SET Estatus = 'Pendiente', Comentarios = NULL WHERE id_Documento = ?`,
      [id_Documento]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }
    res.json({ success: true });
  }
);

/* =========================
   DESCARGAR DOCUMENTO
========================= */
router.get(
  "/download/:id_Documento",
  authenticateToken,
  validateNumericId,
  checkOwnership("documento"),
  async (req, res) => {
    const { id_Documento } = req.params;

    const [documento] = await pool.query(
      `SELECT NombreArchivo, RutaArchivo FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const filePath = path.join(__dirname, "..", "public", documento[0].RutaArchivo);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(documento[0].NombreArchivo)}"`
    );
    res.sendFile(filePath);
  }
);

/* =========================
   ELIMINAR DOCUMENTO
========================= */
router.delete(
  "/:id_Documento",
  authenticateToken,
  validateNumericId,
  checkOwnership("documento"),
  async (req, res) => {
    const { id_Documento } = req.params;

    const [documento] = await pool.query(
      `SELECT RutaArchivo FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const filePath = path.join(__dirname, "..", "public", documento[0].RutaArchivo);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query(`DELETE FROM documentos WHERE id_Documento = ?`, [id_Documento]);

    res.json({ success: true });
  }
);

/* =========================
   LISTAR DOCUMENTOS
========================= */
router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      const isAdmin = ["admin", "coordinador"].includes(req.user.role);

      let query = `
        SELECT 
          d.id_Documento,
          d.NombreArchivo,
          d.IdTipoDoc,
          d.id_usuario,
          d.Comentarios,
          d.Estatus,
          d.id_proceso
        FROM documentos d
      `;

      const params = [];

      if (!isAdmin) {
        query += " WHERE d.id_usuario = ?";
        params.push(req.user.id);
      }

      const [results] = await pool.query(query, params);
      res.json(results);
    } catch {
      res.status(500).json({ error: "Error al obtener documentos" });
    }
  }
);

export default router;
