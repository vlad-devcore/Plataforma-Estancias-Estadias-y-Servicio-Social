import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ===== FUNCIÓN HELPER PARA RESOLVER RUTAS =====
// Esta función intenta encontrar el archivo en ambas carpetas (Uploads y uploads)
const resolverRutaArchivo = (rutaBD) => {
  // Limpiar la ruta (quitar / inicial)
  let rutaRelativa = rutaBD.replace(/^\//, '');
  
  // Intentar primero con Uploads (mayúscula) - carpeta actual
  let filePath = path.join(__dirname, "..", "public", rutaRelativa.replace(/^uploads\//, 'Uploads/'));
  
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  
  // Si no existe, intentar con minúscula
  filePath = path.join(__dirname, "..", "public", rutaRelativa);
  
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  
  // No se encontró el archivo
  return null;
};

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // IMPORTANTE: Cambiar a Uploads (mayúscula) para que coincida con donde están los archivos
    const uploadDir = "public/Uploads/documentos";
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
    console.error("Error al obtener tipos de documentos:", error);
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
    console.error("Error al obtener programas educativos:", error);
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
    console.error("Error al obtener periodos:", error);
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
    // CORREGIDO: Guardar con Uploads (mayúscula) en la BD
    const rutaArchivo = `/Uploads/documentos/${file.filename}`;

    console.log(`📤 Subiendo documento: ${nombreArchivo}`);
    console.log(`   Ruta física: public/Uploads/documentos/${file.filename}`);
    console.log(`   Ruta BD: ${rutaArchivo}`);

    // Verificar si ya existe un documento
    const [existing] = await pool.query(
      `SELECT id_Documento, RutaArchivo FROM documentos WHERE id_proceso = ? AND IdTipoDoc = ? AND id_usuario = ?`,
      [id_proceso, IdTipoDoc, id_usuario]
    );

    if (existing.length > 0) {
      // Eliminar archivo antiguo usando la función helper
      const oldFilePath = resolverRutaArchivo(existing[0].RutaArchivo);
      if (oldFilePath && fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
        console.log(`   🗑️  Archivo antiguo eliminado: ${oldFilePath}`);
      }

      // Actualizar documento existente
      await pool.query(
        `UPDATE documentos SET NombreArchivo = ?, RutaArchivo = ?, Estatus = 'Pendiente', Comentarios = NULL
         WHERE id_Documento = ?`,
        [nombreArchivo, rutaArchivo, existing[0].id_Documento]
      );
      console.log(`   ✅ Documento ${existing[0].id_Documento} actualizado`);
    } else {
      // Insertar nuevo documento
      const [result] = await pool.query(
        `INSERT INTO documentos (NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nombreArchivo, rutaArchivo, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso]
      );
      console.log(`   ✅ Nuevo documento creado con ID: ${result.insertId}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al subir documento:", error);
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

    console.log(`✅ Documento ${id_Documento} aprobado`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al aprobar documento:", error);
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

    console.log(`❌ Documento ${id_Documento} rechazado: ${comentarios}`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al rechazar documento:", error);
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

    console.log(`🔄 Documento ${id_Documento} revertido a Pendiente`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al revertir documento:", error);
    res.status(500).json({ error: "Error al revertir documento" });
  }
});

// Descargar documento
router.get("/download/:id_Documento", async (req, res) => {
  try {
    const { id_Documento } = req.params;
    
    console.log(`📥 Solicitando descarga del documento ${id_Documento}`);
    
    const [documento] = await pool.query(
      `SELECT NombreArchivo, RutaArchivo FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      console.error(`❌ Documento ${id_Documento} no encontrado en BD`);
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    console.log(`   📄 Nombre: ${documento[0].NombreArchivo}`);
    console.log(`   📍 Ruta BD: ${documento[0].RutaArchivo}`);

    // Usar la función helper para resolver la ruta
    const filePath = resolverRutaArchivo(documento[0].RutaArchivo);

    if (!filePath) {
      console.error(`❌ Archivo físico no encontrado para documento ${id_Documento}`);
      console.error(`   Ruta en BD: ${documento[0].RutaArchivo}`);
      return res.status(404).json({ 
        error: "Archivo no encontrado",
        ruta_bd: documento[0].RutaArchivo
      });
    }

    console.log(`   ✅ Archivo encontrado: ${filePath}`);

    // Determinar tipo de contenido
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
      case '.xls':
        contentType = 'application/vnd.ms-excel';
        break;
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(documento[0].NombreArchivo)}"`);
    res.setHeader('Content-Length', fs.statSync(filePath).size);

    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (error) => {
      console.error('❌ Error al leer el archivo:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al leer el archivo' });
      }
    });
    fileStream.pipe(res);
    
    console.log(`   ✅ Archivo enviado correctamente`);
  } catch (error) {
    console.error("❌ Error al descargar documento:", error);
    res.status(500).json({ error: "Error al descargar documento" });
  }
});

// Eliminar documento
router.delete("/:id_Documento", async (req, res) => {
  try {
    const { id_Documento } = req.params;

    console.log(`🗑️  Intentando eliminar documento ${id_Documento}`);

    const [documento] = await pool.query(
      `SELECT NombreArchivo, RutaArchivo FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    // Usar la función helper para resolver la ruta
    const filePath = resolverRutaArchivo(documento[0].RutaArchivo);
    
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`   ✅ Archivo físico eliminado: ${filePath}`);
    } else {
      console.log(`   ⚠️  Archivo físico no encontrado, continuando con eliminación en BD`);
    }

    await pool.query(
      `DELETE FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    console.log(`   ✅ Documento ${id_Documento} eliminado de la BD`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al eliminar documento:", error);
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
    console.error("❌ Error al obtener documentos:", error);
    res.status(500).json({ error: "Error al obtener documentos" });
  }
});

export default router;