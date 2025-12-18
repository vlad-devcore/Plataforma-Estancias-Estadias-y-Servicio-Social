import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configuración de Multer
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

// Obtener tipos de documentos
router.get("/tipo_documento", async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT IdTipoDoc, Nombre_TipoDoc FROM tipo_documento ORDER BY Nombre_TipoDoc`
    );
    res.json(results);
  } catch (error) {
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
    res.status(500).json({ error: "Error al obtener periodos" });
  }
});

// Subir/actualizar documento
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
      const oldFilePath = path.join(__dirname, "..", "public", existing[0].RutaArchivo.replace(/^\/Uploads\//, 'uploads/'));
      if (fs.existsSync(oldFilePath)) {
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
    res.status(500).json({ error: "Error al subir documento" });
  }
});

// Aprobar documento
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
    res.status(500).json({ error: "Error al aprobar documento" });
  }
});

// Rechazar documento
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
    res.status(500).json({ error: "Error al rechazar documento" });
  }
});

// Revertir documento a Pendiente
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
    res.status(500).json({ error: "Error al revertir documento" });
  }
});

// Descargar documento
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

    const filePath = path.join(__dirname, "..", "public", documento[0].RutaArchivo.replace(/^\/Uploads\//, 'uploads/'));

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    let contentType;
    const fileExtension = path.extname(filePath).toLowerCase();
    switch(fileExtension) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(documento[0].NombreArchivo)}"`);
    res.setHeader('Content-Length', fs.statSync(filePath).size);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: "Error al descargar documento" });
  }
});

// Eliminar documento
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

    const filePath = path.join(__dirname, "..", "public", documento[0].RutaArchivo.replace(/^\/Uploads\//, 'uploads/'));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query(
      `DELETE FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar documento" });
  }
});

// Obtener todos los documentos
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
        t.Nombre_TipoDoc AS Nombre_TipoDoc,
        pe.nombre AS ProgramaEducativo
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

    const [results] = await pool.query(query, queryParams);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener documentos" });
  }
});

export default router;