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

router.get("/", async (req, res) => {
  try {
    console.log("GET /api/documentos - Obtener todos los documentos");
    const { estatus, idPeriodo, id_proceso, id_usuario } = req.query;

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
        t.Nombre_TipoDoc AS Nombre_TipoDoc
      FROM documentos d
      JOIN proceso p ON d.id_proceso = p.id_proceso
      JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
      JOIN tipo_documento t ON d.IdTipoDoc = t.IdTipoDoc
      JOIN periodos per ON p.id_periodo = per.IdPeriodo
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
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    console.log("Consulta SQL:", query);
    console.log("Parámetros:", queryParams);

    const [results] = await pool.query(query, queryParams);
    console.log("Documentos obtenidos:", results);
    res.json(results);
  } catch (error) {
    console.error("Error al obtener documentos:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Subir/actualizar documento
router.post("/upload", upload.single("archivo"), async (req, res) => {
  try {
    console.log("POST /api/documentos/upload - Subir/actualizar documento");
    console.log("Datos recibidos en el body:", req.body);
    console.log("Archivo recibido:", req.file);

    const { IdTipoDoc, id_usuario, Comentarios = "", Estatus = "Pendiente", id_proceso } = req.body;
    const file = req.file;

    if (!IdTipoDoc || !id_usuario || !id_proceso || !file) {
      console.log("Faltan campos obligatorios o archivo");
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
        console.log(`Archivo antiguo ${oldFilePath} eliminado`);
      }

      // Actualizar documento existente
      await pool.query(
        `UPDATE documentos SET NombreArchivo = ?, RutaArchivo = ?, Estatus = 'Pendiente', Comentarios = NULL
         WHERE id_Documento = ?`,
        [nombreArchivo, rutaArchivo, existing[0].id_Documento]
      );
      console.log(`Documento con ID ${existing[0].id_Documento} actualizado`);
    } else {
      // Insertar nuevo documento
      await pool.query(
        `INSERT INTO documentos (NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nombreArchivo, rutaArchivo, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso]
      );
      console.log("Documento insertado");
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error al subir documento:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Aprobar documento
router.put("/approve/:id_Documento", async (req, res) => {
  try {
    console.log(`PUT /api/documentos/approve/:id_Documento - Aprobar documento con ID ${req.params.id_Documento}`);
    const { id_Documento } = req.params;

    const [result] = await pool.query(
      `UPDATE documentos SET Estatus = 'Aprobado', Comentarios = NULL WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (result.affectedRows === 0) {
      console.log(`Documento con ID ${id_Documento} no encontrado`);
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    console.log(`Documento con ID ${id_Documento} aprobado`);
    res.json({ success: true });
  } catch (error) {
    console.error("Error al aprobar documento:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Rechazar documento
router.put("/reject/:id_Documento", async (req, res) => {
  try {
    console.log(`PUT /api/documentos/reject/:id_Documento - Rechazar documento con ID ${req.params.id_Documento}`);
    const { id_Documento } = req.params;
    const { comentarios } = req.body;

    if (!comentarios) {
      console.log("Falta el motivo del rechazo");
      return res.status(400).json({ error: "Falta el motivo del rechazo" });
    }

    const [result] = await pool.query(
      `UPDATE documentos SET Estatus = 'Rechazado', Comentarios = ? WHERE id_Documento = ?`,
      [comentarios, id_Documento]
    );

    if (result.affectedRows === 0) {
      console.log(`Documento con ID ${id_Documento} no encontrado`);
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    console.log(`Documento con ID ${id_Documento} rechazado`);
    res.json({ success: true });
  } catch (error) {
    console.error("Error al rechazar documento:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Descargar documento
router.get("/download/:id_Documento", async (req, res) => {
  try {
    console.log(`GET /api/documentos/download/:id_Documento - Descargar documento con ID ${req.params.id_Documento}`);
    const { id_Documento } = req.params;
    
    const [documento] = await pool.query(
      `SELECT NombreArchivo, RutaArchivo FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      console.log(`Documento con ID ${id_Documento} no encontrado`);
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    console.log("Documento encontrado:", documento[0]);

    const filePath = path.join(__dirname, "..", "public", documento[0].RutaArchivo.replace(/^\/Uploads\//, 'uploads/'));

    if (!fs.existsSync(filePath)) {
      console.log(`Archivo no encontrado en la ruta: ${filePath}`);
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
    console.error("Error al descargar documento:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar documento
router.delete("/:id_Documento", async (req, res) => {
  try {
    console.log(`DELETE /api/documentos/:id_Documento - Eliminar documento con ID ${req.params.id_Documento}`);
    const { id_Documento } = req.params;

    const [documento] = await pool.query(
      `SELECT NombreArchivo, RutaArchivo FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      console.log(`Documento con ID ${id_Documento} no encontrado`);
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    console.log("Documento encontrado para eliminación:", documento[0]);

    const filePath = path.join(__dirname, "..", "public", documento[0].RutaArchivo.replace(/^\/Uploads\//, 'uploads/'));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Archivo ${filePath} eliminado correctamente`);
    } else {
      console.log(`Archivo no encontrado en ${filePath}, continuando con eliminación en BD`);
    }

    await pool.query(
      `DELETE FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    console.log(`Documento con ID ${id_Documento} eliminado de la base de datos`);
    res.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar documento:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;