import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";
import { fileURLToPath } from 'url';
import { authenticateToken, requireAdmin } from "./authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ===== FUNCIÓN HELPER PARA RESOLVER RUTAS =====
const resolverRutaArchivo = (rutaBD) => {
  let rutaRelativa = rutaBD.replace(/^\//, '');
  let filePath = path.join(__dirname, "..", "public", rutaRelativa.replace(/^uploads\//, 'Uploads/'));
  
  if (fs.existsSync(filePath)) return filePath;
  
  filePath = path.join(__dirname, "..", "public", rutaRelativa);
  if (fs.existsSync(filePath)) return filePath;
  
  return null;
};

// ===== FUNCIÓN HELPER PARA VALIDAR PROPIEDAD =====
const validarPropiedadDocumento = async (id_Documento, userId, userRole) => {
  if (userRole === 'admin') return true;

  const [docs] = await pool.query(
    `SELECT d.id_usuario, e.id_usuario as estudiante_user_id
     FROM documentos d
     LEFT JOIN proceso p ON d.id_proceso = p.id_proceso
     LEFT JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
     WHERE d.id_Documento = ?`,
    [id_Documento]
  );

  if (docs.length === 0) return false;
  return docs[0].id_usuario === userId || docs[0].estudiante_user_id === userId;
};

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
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

// ============================================================================
// 🔓 RUTAS PÚBLICAS (sin autenticación - solo metadatos)
// ============================================================================

// Obtener tipos de documentos (metadatos públicos)
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

// Obtener programas educativos (metadatos públicos)
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

// Obtener periodos (metadatos públicos)
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

// ============================================================================
// 🔒 RUTAS PROTEGIDAS (requieren autenticación)
// ============================================================================

// 🔒 Subir/actualizar documento - PROTEGIDO
router.post("/upload", authenticateToken, upload.single("archivo"), async (req, res) => {
  try {
    const { IdTipoDoc, id_usuario, Comentarios = "", Estatus = "Pendiente", id_proceso } = req.body;
    const file = req.file;

    if (!IdTipoDoc || !id_usuario || !id_proceso || !file) {
      return res.status(400).json({ error: "Faltan campos obligatorios o archivo" });
    }

    // ✅ Verificar que el usuario solo suba documentos para sí mismo (excepto admin)
    if (req.user.role !== 'admin' && parseInt(id_usuario) !== req.user.id) {
      return res.status(403).json({ error: "No puedes subir documentos para otros usuarios" });
    }

    const nombreArchivo = decodeURIComponent(escape(file.originalname));
    const rutaArchivo = `/Uploads/documentos/${file.filename}`;

    console.log(`📤 Subiendo documento: ${nombreArchivo}`);
    console.log(`   Usuario: ${req.user.email} (ID: ${req.user.id})`);

    // Verificar si ya existe un documento
    const [existing] = await pool.query(
      `SELECT id_Documento, RutaArchivo FROM documentos WHERE id_proceso = ? AND IdTipoDoc = ? AND id_usuario = ?`,
      [id_proceso, IdTipoDoc, id_usuario]
    );

    if (existing.length > 0) {
      // Eliminar archivo antiguo
      const oldFilePath = resolverRutaArchivo(existing[0].RutaArchivo);
      if (oldFilePath && fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
        console.log(`   🗑️  Archivo antiguo eliminado`);
      }

      // Actualizar documento existente
      await pool.query(
        `UPDATE documentos SET NombreArchivo = ?, RutaArchivo = ?, Estatus = 'Pendiente', Comentarios = NULL
         WHERE id_Documento = ?`,
        [nombreArchivo, rutaArchivo, existing[0].id_Documento]
      );
      console.log(`   ✅ Documento actualizado`);
    } else {
      // Insertar nuevo documento
      await pool.query(
        `INSERT INTO documentos (NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nombreArchivo, rutaArchivo, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso]
      );
      console.log(`   ✅ Nuevo documento creado`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al subir documento:", error);
    res.status(500).json({ error: "Error al subir documento" });
  }
});

// 🔒 Aprobar documento - SOLO ADMIN
router.put("/approve/:id_Documento", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id_Documento } = req.params;

    const [result] = await pool.query(
      `UPDATE documentos SET Estatus = 'Aprobado', Comentarios = NULL WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    console.log(`✅ Documento ${id_Documento} aprobado por ${req.user.email}`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al aprobar documento:", error);
    res.status(500).json({ error: "Error al aprobar documento" });
  }
});

// 🔒 Rechazar documento - SOLO ADMIN
router.put("/reject/:id_Documento", authenticateToken, requireAdmin, async (req, res) => {
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

    console.log(`❌ Documento ${id_Documento} rechazado por ${req.user.email}`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al rechazar documento:", error);
    res.status(500).json({ error: "Error al rechazar documento" });
  }
});

// 🔒 Revertir documento a Pendiente - SOLO ADMIN
router.put("/revert/:id_Documento", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id_Documento } = req.params;

    const [result] = await pool.query(
      `UPDATE documentos SET Estatus = 'Pendiente', Comentarios = NULL WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    console.log(`🔄 Documento ${id_Documento} revertido por ${req.user.email}`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al revertir documento:", error);
    res.status(500).json({ error: "Error al revertir documento" });
  }
});

// 🔒 Descargar documento - PROTEGIDO con validación de propiedad
router.get("/download/:id_Documento", authenticateToken, async (req, res) => {
  try {
    const { id_Documento } = req.params;
    
    console.log(`📥 Descarga solicitada por ${req.user.email} (ID: ${req.user.id})`);
    
    // ✅ Validar propiedad del documento
    const tieneAcceso = await validarPropiedadDocumento(id_Documento, req.user.id, req.user.role);
    
    if (!tieneAcceso) {
      console.log(`   ❌ Acceso denegado al documento ${id_Documento}`);
      return res.status(403).json({ error: "No tienes permiso para descargar este documento" });
    }
    
    const [documento] = await pool.query(
      `SELECT NombreArchivo, RutaArchivo FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const filePath = resolverRutaArchivo(documento[0].RutaArchivo);

    if (!filePath) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    // Determinar tipo de contenido
    const fileExtension = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
    };
    const contentType = contentTypes[fileExtension] || 'application/octet-stream';

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

// 🔒 Eliminar documento - PROTEGIDO con validación de propiedad
router.delete("/:id_Documento", authenticateToken, async (req, res) => {
  try {
    const { id_Documento } = req.params;

    console.log(`🗑️  Eliminación solicitada por ${req.user.email}`);

    // ✅ Validar propiedad del documento
    const tieneAcceso = await validarPropiedadDocumento(id_Documento, req.user.id, req.user.role);
    
    if (!tieneAcceso) {
      return res.status(403).json({ error: "No tienes permiso para eliminar este documento" });
    }

    const [documento] = await pool.query(
      `SELECT NombreArchivo, RutaArchivo FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const filePath = resolverRutaArchivo(documento[0].RutaArchivo);
    
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`   ✅ Archivo físico eliminado`);
    }

    await pool.query(
      `DELETE FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    console.log(`   ✅ Documento eliminado de la BD`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al eliminar documento:", error);
    res.status(500).json({ error: "Error al eliminar documento" });
  }
});

// 🔒 Obtener documentos - PROTEGIDO con filtrado por usuario
router.get("/", authenticateToken, async (req, res) => {
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

    // ✅ SEGURIDAD: Si NO es admin, SOLO ver sus propios documentos
    if (req.user.role !== 'admin') {
      conditions.push('e.id_usuario = ?');
      queryParams.push(req.user.id);
      console.log(`🔒 Estudiante ${req.user.email} - Filtrando solo sus documentos`);
    } else {
      console.log(`👨‍💼 Admin ${req.user.email} - Acceso completo a documentos`);
    }

    // Aplicar filtros adicionales
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
    
    console.log(`   ✅ Devueltos ${results.length} documentos`);
    res.json(results);
  } catch (error) {
    console.error("❌ Error al obtener documentos:", error);
    res.status(500).json({ error: "Error al obtener documentos" });
  }
});

export default router; 