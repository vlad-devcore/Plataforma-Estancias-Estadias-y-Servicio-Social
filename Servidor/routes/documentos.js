import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/* ============================
   MULTER CONFIGURATION
============================ */
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
  },
});

const upload = multer({ storage });

/* ============================
   HELPER FUNCTIONS
============================ */
const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.xml': 'application/xml'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
};

const resolveFilePath = (rutaArchivo) => {
  if (!rutaArchivo) return null;
  
  // Normalizar la ruta
  let relativePath = rutaArchivo.replace(/^\/+/, '');
  relativePath = relativePath.replace(/^Uploads\//i, 'uploads/');
  
  return path.join(__dirname, "..", "public", relativePath);
};

/* ============================
   CATÁLOGOS
============================ */
// Obtener tipos de documentos
router.get("/tipo_documento", async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT IdTipoDoc, Nombre_TipoDoc FROM tipo_documento ORDER BY Nombre_TipoDoc`
    );
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener tipos de documentos" });
  }
});

// Obtener programas educativos
router.get("/programas_educativos", async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT DISTINCT nombre FROM programa_educativo WHERE nombre IS NOT NULL ORDER BY nombre`
    );
    res.json(results.map(row => row.nombre));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener programas educativos" });
  }
});

// Obtener periodos
router.get("/periodos", async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT IdPeriodo, Año, Fase FROM periodos ORDER BY Año DESC, Fase`
    );
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener periodos" });
  }
});

/* ============================
   UPLOAD
============================ */
router.post("/upload", upload.single("archivo"), async (req, res) => {
  try {
    const { IdTipoDoc, id_usuario, Comentarios = "", Estatus = "Pendiente", id_proceso } = req.body;
    const file = req.file;

    if (!IdTipoDoc || !id_usuario || !id_proceso || !file) {
      return res.status(400).json({ error: "Faltan campos obligatorios o archivo" });
    }

    const nombreArchivo = decodeURIComponent(escape(file.originalname));
    const rutaArchivo = `/uploads/documentos/${file.filename}`;

    // Verificar si ya existe un documento
    const [existing] = await pool.query(
      `SELECT id_Documento, RutaArchivo FROM documentos WHERE id_proceso = ? AND IdTipoDoc = ? AND id_usuario = ?`,
      [id_proceso, IdTipoDoc, id_usuario]
    );

    if (existing.length > 0) {
      // Eliminar archivo antiguo
      const oldFilePath = resolveFilePath(existing[0].RutaArchivo);
      if (oldFilePath && fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      // Actualizar documento existente
      await pool.query(
        `UPDATE documentos SET NombreArchivo = ?, RutaArchivo = ?, Estatus = 'Pendiente', Comentarios = NULL
         WHERE id_Documento = ?`,
        [nombreArchivo, rutaArchivo, existing[0].id_Documento]
      );
    } else {
      // Insertar nuevo documento
      await pool.query(
        `INSERT INTO documentos (NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nombreArchivo, rutaArchivo, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al subir documento" });
  }
});

/* ============================
   VISUALIZAR DOCUMENTO (SIN DESCARGA)
============================ */
router.get("/view/:id_Documento", async (req, res) => {
  try {
    const { id_Documento } = req.params;
    
    const [documento] = await pool.query(
      `SELECT NombreArchivo, RutaArchivo FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado en la base de datos" });
    }

    const filePath = resolveFilePath(documento[0].RutaArchivo);

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo físico no encontrado" });
    }

    // Establecer el tipo de contenido correcto
    const contentType = getMimeType(documento[0].NombreArchivo);
    res.setHeader('Content-Type', contentType);
    
    // Usar 'inline' para visualizar en el navegador (NO descargar)
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(documento[0].NombreArchivo)}"`
    );

    // Headers adicionales para mejor visualización
    res.setHeader('Content-Length', fs.statSync(filePath).size);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Enviar el archivo
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al visualizar documento" });
  }
});

/* ============================
   DESCARGAR DOCUMENTO (OPCIONAL)
============================ */
router.get("/download/:id_Documento", async (req, res) => {
  try {
    const { id_Documento } = req.params;
    
    const [documento] = await pool.query(
      `SELECT NombreArchivo, RutaArchivo FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const filePath = resolveFilePath(documento[0].RutaArchivo);

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    const contentType = getMimeType(documento[0].NombreArchivo);
    
    // Usar 'attachment' para FORZAR la descarga
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(documento[0].NombreArchivo)}"`);
    res.setHeader('Content-Length', fs.statSync(filePath).size);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al descargar documento" });
  }
});

/* ============================
   APROBAR DOCUMENTO
============================ */
router.put("/approve/:id_Documento", async (req, res) => {
  try {
    const { id_Documento } = req.params;

    const [result] = await pool.query(
      `UPDATE documentos SET Estatus = 'Aprobado', Comentarios = NULL WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al aprobar documento" });
  }
});

/* ============================
   RECHAZAR DOCUMENTO
============================ */
router.put("/reject/:id_Documento", async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al rechazar documento" });
  }
});

/* ============================
   REVERTIR DOCUMENTO A PENDIENTE
============================ */
router.put("/revert/:id_Documento", async (req, res) => {
  try {
    const { id_Documento } = req.params;

    const [result] = await pool.query(
      `UPDATE documentos SET Estatus = 'Pendiente', Comentarios = NULL WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al revertir documento" });
  }
});

/* ============================
   ELIMINAR DOCUMENTO
============================ */
router.delete("/:id_Documento", async (req, res) => {
  try {
    const { id_Documento } = req.params;

    const [documento] = await pool.query(
      `SELECT NombreArchivo, RutaArchivo FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const filePath = resolveFilePath(documento[0].RutaArchivo);
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query(
      `DELETE FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar documento" });
  }
});

/* ============================
   OBTENER TODOS LOS DOCUMENTOS CON MATRÍCULA
============================ */
router.get("/", async (req, res) => {
  try {
    const { estatus, idPeriodo, id_proceso, id_usuario, idTipoDoc, programaEducativo } = req.query;

    let query = `
      SELECT 
        d.id_Documento,
        d.NombreArchivo,
        d.RutaArchivo,
        d.IdTipoDoc,
        d.id_usuario,
        d.Comentarios,
        d.Estatus,
        d.id_proceso,
        e.Matricula,
        CONCAT(e.Nombre, ' ', e.Apellido_Paterno, ' ', IFNULL(e.Apellido_Materno, '')) AS NombreCompleto,
        t.Nombre_TipoDoc,
        pe.nombre AS ProgramaEducativo,
        per.Año AS Periodo_Año,
        per.Fase AS Periodo_Fase
      FROM documentos d
      JOIN proceso p ON d.id_proceso = p.id_proceso
      JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
      JOIN tipo_documento t ON d.IdTipoDoc = t.IdTipoDoc
      JOIN periodos per ON p.id_periodo = per.IdPeriodo
      JOIN programa_educativo pe ON p.id_programa = pe.id_programa
    `;
    
    const queryParams = [];
    const conditions = [];
    
    if (estatus && ['Pendiente', 'Aprobado', 'Rechazado'].includes(estatus)) {
      conditions.push('d.Estatus = ?');
      queryParams.push(estatus);
    }
    if (idPeriodo && !isNaN(idPeriodo)) {
      conditions.push('per.IdPeriodo = ?');
      queryParams.push(Number(idPeriodo));
    }
    if (id_proceso && !isNaN(id_proceso)) {
      conditions.push('d.id_proceso = ?');
      queryParams.push(Number(id_proceso));
    }
    if (id_usuario && !isNaN(id_usuario)) {
      conditions.push('d.id_usuario = ?');
      queryParams.push(Number(id_usuario));
    }
    if (idTipoDoc && !isNaN(idTipoDoc)) {
      conditions.push('d.IdTipoDoc = ?');
      queryParams.push(Number(idTipoDoc));
    }
    if (programaEducativo) {
      conditions.push('pe.nombre = ?');
      queryParams.push(programaEducativo);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY d.id_Documento DESC';

    const [results] = await pool.query(query, queryParams);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener documentos" });
  }
});

export default router;