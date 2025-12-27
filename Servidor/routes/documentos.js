import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";
import { fileURLToPath } from 'url';
import { 
  authenticateToken, 
  requireAdmin 
} from "./authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ============================================================================
// 🛠️ FUNCIÓN HELPER PARA RESOLVER RUTAS
// ============================================================================
const resolverRutaArchivo = (rutaBD) => {
  let rutaRelativa = rutaBD.replace(/^\//, '');
  let filePath = path.join(__dirname, "..", "public", rutaRelativa.replace(/^uploads\//, 'Uploads/'));
  
  if (fs.existsSync(filePath)) return filePath;
  
  filePath = path.join(__dirname, "..", "public", rutaRelativa);
  if (fs.existsSync(filePath)) return filePath;
  
  return null;
};

// ============================================================================
// 📤 CONFIGURACIÓN DE MULTER
// ============================================================================
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
// 🔓 RUTAS PÚBLICAS DE CATÁLOGOS (Solo lectura de configuración)
// ============================================================================

/**
 * GET /api/documentos/tipo_documento
 * Obtiene tipos de documentos (catálogo público)
 * NOTA: Esto es configuración, no datos sensibles
 */
router.get("/tipo_documento", authenticateToken, async (req, res) => {
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

/**
 * GET /api/documentos/programas_educativos
 * Obtiene programas educativos (catálogo público)
 */
router.get("/programas_educativos", authenticateToken, async (req, res) => {
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

/**
 * GET /api/documentos/periodos
 * Obtiene periodos (catálogo público)
 */
router.get("/periodos", authenticateToken, async (req, res) => {
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
// 📋 LISTAR DOCUMENTOS (PRINCIPAL)
// ============================================================================

/**
 * GET /api/documentos
 * 🔒 SEGURIDAD:
 * - Admin: Ve TODOS los documentos
 * - Estudiante: Solo ve SUS documentos
 * - Sin auth: RECHAZADO (401)
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const { estatus, idPeriodo, id_proceso, idTipoDoc, programaEducativo } = req.query;

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
        e.id_estudiante,
        t.Nombre_TipoDoc AS Nombre_TipoDoc,
        pe.nombre AS ProgramaEducativo,
        u.nombre as NombreUsuario,
        u.apellido_paterno,
        u.apellido_materno
      FROM documentos d
      JOIN proceso p ON d.id_proceso = p.id_proceso
      JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
      JOIN users u ON d.id_usuario = u.id_user
      JOIN tipo_documento t ON d.IdTipoDoc = t.IdTipoDoc
      JOIN periodos per ON p.id_periodo = per.IdPeriodo
      JOIN programa_educativo pe ON p.id_programa = pe.id_programa
    `;
    
    const queryParams = [];
    const conditions = [];

    // 🔐 FILTRO DE SEGURIDAD: Estudiantes solo ven sus documentos
    if (!isAdmin) {
      conditions.push('d.id_usuario = ?');
      queryParams.push(userId);
    }

    // Filtros adicionales
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
    
    console.log(`📋 Documentos listados: ${results.length} (Usuario: ${req.user.email}, Admin: ${isAdmin})`);
    
    res.json(results);
  } catch (error) {
    console.error("❌ Error al obtener documentos:", error);
    res.status(500).json({ error: "Error al obtener documentos" });
  }
});

// ============================================================================
// 📤 SUBIR/ACTUALIZAR DOCUMENTO
// ============================================================================

/**
 * POST /api/documentos/upload
 * 🔒 SEGURIDAD:
 * - Usuario solo puede subir documentos a SU NOMBRE
 * - Admin puede subir para cualquier usuario
 * - Se valida que el id_usuario en el body sea el mismo que el token (excepto admin)
 */
router.post("/upload", authenticateToken, upload.single("archivo"), async (req, res) => {
  try {
    const { IdTipoDoc, id_usuario, Comentarios = "", Estatus = "Pendiente", id_proceso } = req.body;
    const file = req.file;
    const requestUserId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Validación de campos obligatorios
    if (!IdTipoDoc || !id_usuario || !id_proceso || !file) {
      return res.status(400).json({ error: "Faltan campos obligatorios o archivo" });
    }

    // 🔐 SEGURIDAD: Estudiantes solo pueden subir documentos a su nombre
    if (!isAdmin && parseInt(id_usuario) !== requestUserId) {
      console.warn(`⚠️  Intento de suplantación: Usuario ${requestUserId} intentó subir como ${id_usuario}`);
      return res.status(403).json({ 
        error: "No autorizado",
        message: "No puedes subir documentos en nombre de otro usuario"
      });
    }

    // 🔐 SEGURIDAD ADICIONAL: Verificar que el proceso pertenece al estudiante
    if (!isAdmin) {
      const [proceso] = await pool.query(
        `SELECT p.id_proceso, e.id_usuario 
         FROM proceso p 
         JOIN estudiantes e ON p.id_estudiante = e.id_estudiante 
         WHERE p.id_proceso = ?`,
        [id_proceso]
      );

      if (proceso.length === 0 || proceso[0].id_usuario !== requestUserId) {
        return res.status(403).json({ 
          error: "No autorizado",
          message: "No puedes subir documentos a un proceso que no te pertenece"
        });
      }
    }

    const nombreArchivo = decodeURIComponent(escape(file.originalname));
    const rutaArchivo = `/Uploads/documentos/${file.filename}`;

    console.log(`📤 Subiendo documento: ${nombreArchivo}`);
    console.log(`   Usuario: ${req.user.email} (ID: ${requestUserId})`);
    console.log(`   Para usuario_id: ${id_usuario}`);
    console.log(`   Proceso: ${id_proceso}`);

    // Verificar si ya existe un documento
    const [existing] = await pool.query(
      `SELECT id_Documento, RutaArchivo FROM documentos 
       WHERE id_proceso = ? AND IdTipoDoc = ? AND id_usuario = ?`,
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
      console.log(`   ✅ Documento actualizado (ID: ${existing[0].id_Documento})`);
    } else {
      // Insertar nuevo documento
      const [result] = await pool.query(
        `INSERT INTO documentos (NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nombreArchivo, rutaArchivo, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso]
      );
      console.log(`   ✅ Nuevo documento creado (ID: ${result.insertId})`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al subir documento:", error);
    res.status(500).json({ error: "Error al subir documento" });
  }
});

// ============================================================================
// ✅ APROBAR DOCUMENTO (SOLO ADMIN)
// ============================================================================

/**
 * PUT /api/documentos/approve/:id_Documento
 * 🔒 SEGURIDAD: Solo administradores
 */
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

// ============================================================================
// ❌ RECHAZAR DOCUMENTO (SOLO ADMIN)
// ============================================================================

/**
 * PUT /api/documentos/reject/:id_Documento
 * 🔒 SEGURIDAD: Solo administradores
 */
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

    console.log(`❌ Documento ${id_Documento} rechazado por ${req.user.email}: ${comentarios}`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al rechazar documento:", error);
    res.status(500).json({ error: "Error al rechazar documento" });
  }
});

// ============================================================================
// 🔄 REVERTIR DOCUMENTO A PENDIENTE (SOLO ADMIN)
// ============================================================================

/**
 * PUT /api/documentos/revert/:id_Documento
 * 🔒 SEGURIDAD: Solo administradores
 */
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

    console.log(`🔄 Documento ${id_Documento} revertido a Pendiente por ${req.user.email}`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al revertir documento:", error);
    res.status(500).json({ error: "Error al revertir documento" });
  }
});

// ============================================================================
// 📥 DESCARGAR DOCUMENTO
// ============================================================================

/**
 * GET /api/documentos/download/:id_Documento
 * 🔒 SEGURIDAD:
 * - Admin: Puede descargar cualquier documento
 * - Estudiante: Solo puede descargar SUS documentos
 */
router.get("/download/:id_Documento", authenticateToken, async (req, res) => {
  try {
    const { id_Documento } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    console.log(`📥 Descarga solicitada: Doc ${id_Documento} por ${req.user.email}`);
    
    // Obtener documento y verificar propiedad
    const [documento] = await pool.query(
      `SELECT d.NombreArchivo, d.RutaArchivo, d.id_usuario, e.id_usuario as propietario_usuario
       FROM documentos d
       JOIN proceso p ON d.id_proceso = p.id_proceso
       JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
       WHERE d.id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      console.error(`❌ Documento ${id_Documento} no encontrado`);
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    // 🔐 SEGURIDAD: Verificar que el documento pertenece al usuario (excepto admin)
    if (!isAdmin && documento[0].propietario_usuario !== userId) {
      console.warn(`⚠️  Acceso denegado: Usuario ${userId} intentó descargar documento de usuario ${documento[0].propietario_usuario}`);
      return res.status(403).json({ 
        error: "No autorizado",
        message: "No tienes permiso para descargar este documento"
      });
    }

    const filePath = resolverRutaArchivo(documento[0].RutaArchivo);

    if (!filePath) {
      console.error(`❌ Archivo físico no encontrado: ${documento[0].RutaArchivo}`);
      return res.status(404).json({ 
        error: "Archivo no encontrado",
        ruta_bd: documento[0].RutaArchivo
      });
    }

    // Determinar tipo de contenido
    const fileExtension = path.extname(filePath).toLowerCase();
    const contentTypeMap = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png'
    };
    const contentType = contentTypeMap[fileExtension] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(documento[0].NombreArchivo)}"`);
    res.setHeader('Content-Length', fs.statSync(filePath).size);

    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (error) => {
      console.error('❌ Error al leer archivo:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al leer el archivo' });
      }
    });
    fileStream.pipe(res);
    
    console.log(`   ✅ Descarga exitosa`);
  } catch (error) {
    console.error("❌ Error al descargar documento:", error);
    res.status(500).json({ error: "Error al descargar documento" });
  }
});

// ============================================================================
// 🗑️ ELIMINAR DOCUMENTO
// ============================================================================

/**
 * DELETE /api/documentos/:id_Documento
 * 🔒 SEGURIDAD:
 * - Admin: Puede eliminar cualquier documento
 * - Estudiante: Solo puede eliminar SUS documentos
 */
router.delete("/:id_Documento", authenticateToken, async (req, res) => {
  try {
    const { id_Documento } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    console.log(`🗑️  Eliminación solicitada: Doc ${id_Documento} por ${req.user.email}`);

    // Obtener documento y verificar propiedad
    const [documento] = await pool.query(
      `SELECT d.NombreArchivo, d.RutaArchivo, d.id_usuario, e.id_usuario as propietario_usuario
       FROM documentos d
       JOIN proceso p ON d.id_proceso = p.id_proceso
       JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
       WHERE d.id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    // 🔐 SEGURIDAD: Verificar propiedad (excepto admin)
    if (!isAdmin && documento[0].propietario_usuario !== userId) {
      console.warn(`⚠️  Acceso denegado: Usuario ${userId} intentó eliminar documento de usuario ${documento[0].propietario_usuario}`);
      return res.status(403).json({ 
        error: "No autorizado",
        message: "No tienes permiso para eliminar este documento"
      });
    }

    // Eliminar archivo físico
    const filePath = resolverRutaArchivo(documento[0].RutaArchivo);
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`   ✅ Archivo físico eliminado`);
    } else {
      console.log(`   ⚠️  Archivo físico no encontrado, continuando...`);
    }

    // Eliminar de la BD
    await pool.query(`DELETE FROM documentos WHERE id_Documento = ?`, [id_Documento]);

    console.log(`   ✅ Documento ${id_Documento} eliminado de BD`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al eliminar documento:", error);
    res.status(500).json({ error: "Error al eliminar documento" });
  }
});

export default router;