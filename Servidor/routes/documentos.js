import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/* ============================
   MULTER
============================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "public", "Uploads", "documentos");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `archivo-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

/* ============================
   HELPERS
============================ */
const resolveFilePath = (rutaArchivo) => {
  if (!rutaArchivo) return null;

  // quitar slash inicial
  let relativePath = rutaArchivo.replace(/^\/+/, "");

  // forzar Uploads/documentos (case-insensitive)
  relativePath = relativePath.replace(/^uploads/i, "Uploads");

  return path.join(__dirname, "..", "public", relativePath);
};

/* ============================
   CATÁLOGOS
============================ */
router.get("/tipo_documento", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT IdTipoDoc, Nombre_TipoDoc FROM tipo_documento ORDER BY Nombre_TipoDoc"
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error al obtener tipos de documentos" });
  }
});

router.get("/programas_educativos", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DISTINCT nombre FROM programa_educativo WHERE nombre IS NOT NULL ORDER BY nombre"
    );
    res.json(rows.map(r => r.nombre));
  } catch {
    res.status(500).json({ error: "Error al obtener programas educativos" });
  }
});

router.get("/periodos", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT IdPeriodo, Año, Fase FROM periodos ORDER BY Año DESC, Fase"
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error al obtener periodos" });
  }
});

/* ============================
   UPLOAD
============================ */
router.post("/upload", upload.single("archivo"), async (req, res) => {
  try {
    const { IdTipoDoc, id_usuario, id_proceso } = req.body;
    if (!IdTipoDoc || !id_usuario || !id_proceso || !req.file) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const nombreArchivo = req.file.originalname;
    const rutaArchivo = `/uploads/documentos/${req.file.filename}`;

    const [existing] = await pool.query(
      `SELECT id_Documento, RutaArchivo 
       FROM documentos 
       WHERE id_proceso = ? AND IdTipoDoc = ? AND id_usuario = ?`,
      [id_proceso, IdTipoDoc, id_usuario]
    );

    if (existing.length) {
      const oldPath = resolveFilePath(existing[0].RutaArchivo);
      if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      await pool.query(
        `UPDATE documentos 
         SET NombreArchivo = ?, RutaArchivo = ?, Estatus = 'Pendiente', Comentarios = NULL
         WHERE id_Documento = ?`,
        [nombreArchivo, rutaArchivo, existing[0].id_Documento]
      );
    } else {
      await pool.query(
        `INSERT INTO documentos 
         (NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Estatus, id_proceso)
         VALUES (?, ?, ?, ?, 'Pendiente', ?)`,
        [nombreArchivo, rutaArchivo, IdTipoDoc, id_usuario, id_proceso]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al subir documento" });
  }
});

/* ============================
   DOWNLOAD (FIX CLAVE)
============================ */
router.get("/download/:id_Documento", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT NombreArchivo, RutaArchivo FROM documentos WHERE id_Documento = ?",
      [req.params.id_Documento]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const filePath = resolveFilePath(rows[0].RutaArchivo);

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(rows[0].NombreArchivo)}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al descargar documento" });
  }
});

/* ============================
   LISTADO
============================ */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.*, t.Nombre_TipoDoc, pe.nombre AS ProgramaEducativo
      FROM documentos d
      JOIN tipo_documento t ON d.IdTipoDoc = t.IdTipoDoc
      JOIN proceso p ON d.id_proceso = p.id_proceso
      JOIN programa_educativo pe ON p.id_programa = pe.id_programa
    `);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error al obtener documentos" });
  }
});

export default router;
