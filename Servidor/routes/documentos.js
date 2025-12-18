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

// Helper para obtener el tipo MIME correcto
const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.txt': 'text/plain',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
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
  } catch (err) {
    console.error("Error en /tipo_documento:", err);
    res.status(500).json({ error: "Error al obtener tipos de documentos" });
  }
});

router.get("/programas_educativos", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DISTINCT nombre FROM programa_educativo WHERE nombre IS NOT NULL ORDER BY nombre"
    );
    res.json(rows.map(r => r.nombre));
  } catch (err) {
    console.error("Error en /programas_educativos:", err);
    res.status(500).json({ error: "Error al obtener programas educativos" });
  }
});

router.get("/periodos", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT IdPeriodo, Año, Fase FROM periodos ORDER BY Año DESC, Fase"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error en /periodos:", err);
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
    console.error("Error en /upload:", err);
    res.status(500).json({ error: "Error al subir documento" });
  }
});

/* ============================
   VISUALIZAR
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

    // Usar el Content-Type correcto
    const contentType = getMimeType(rows[0].NombreArchivo);
    res.setHeader("Content-Type", contentType);
    
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(rows[0].NombreArchivo)}"`
    );

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error("Error en /download:", err);
    res.status(500).json({ error: "Error al visualizar documento" });
  }
});

/* ============================
   LISTADO
============================ */
router.get("/", async (req, res) => {
  try {
    console.log("Iniciando query de listado...");
    
    const query = `
      SELECT 
        d.id_Documento,
        d.NombreArchivo,
        d.RutaArchivo,
        d.IdTipoDoc,
        d.id_usuario,
        d.Comentarios,
        d.Estatus,
        d.id_proceso,
        t.Nombre_TipoDoc,
        pe.nombre AS ProgramaEducativo,
        e.Matricula,
        e.Nombre AS NombreEstudiante,
        e.Apellido_Paterno,
        e.Apellido_Materno
      FROM documentos d
      INNER JOIN tipo_documento t ON d.IdTipoDoc = t.IdTipoDoc
      INNER JOIN proceso p ON d.id_proceso = p.id_proceso
      INNER JOIN programa_educativo pe ON p.id_programa = pe.id_programa
      INNER JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
    `;
    
    console.log("Ejecutando query...");
    const [rows] = await pool.query(query);
    console.log(`Query exitoso. Registros encontrados: ${rows.length}`);
    
    res.json(rows);
  } catch (err) {
    console.error("Error COMPLETO en listado:", err);
    console.error("Error mensaje:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({ 
      error: "Error al obtener documentos",
      detalle: err.message 
    });
  }
});

export default router;