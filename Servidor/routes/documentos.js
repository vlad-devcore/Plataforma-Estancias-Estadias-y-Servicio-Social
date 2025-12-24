import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";
import { fileURLToPath } from 'url';
import { authenticateToken } from './authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ============================================================================
// MIDDLEWARES DE SEGURIDAD ESPECÍFICOS PARA DOCUMENTOS
// ============================================================================

// Verificar permisos del usuario sobre un documento específico
const verificarPermisoDocumento = async (req, res, next) => {
  try {
    const { id_Documento } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    console.log('Verificando permiso documento:', { id_Documento, userId, userRole });

    // Si es admin, tiene acceso a todo
    if (userRole === 'admin') {
      return next();
    }

    // Si es estudiante, verificar que el documento le pertenece
    const [documento] = await pool.query(
      `SELECT d.id_usuario, d.id_proceso, p.id_estudiante, e.id_usuario as estudiante_user_id
       FROM documentos d
       JOIN proceso p ON d.id_proceso = p.id_proceso
       JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
       WHERE d.id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    // Verificar que el usuario es dueño del documento
    if (documento[0].estudiante_user_id !== userId && documento[0].id_usuario !== userId) {
      return res.status(403).json({ error: "No tienes permiso para acceder a este documento" });
    }

    next();
  } catch (error) {
    console.error('Error al verificar permisos:', error);
    res.status(500).json({ error: "Error al verificar permisos" });
  }
};

// Verificar que solo admin puede aprobar/rechazar
const verificarRolAdmin = (req, res, next) => {
  console.log('Verificando rol admin:', req.user);
  
  if (!req.user) {
    return res.status(401).json({ error: "No autenticado" });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Solo administradores pueden realizar esta acción" });
  }
  next();
};

// ============================================================================
// CONFIGURACIÓN DE MULTER
// ============================================================================

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

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB límite
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF, DOC, DOCX, JPG, JPEG, PNG'));
    }
  }
});

// ============================================================================
// RUTAS DE CATÁLOGOS (requieren autenticación)
// ============================================================================

// Obtener tipos de documentos
router.get("/tipo_documento", authenticateToken, async (req, res) => {
  try {
    console.log('Usuario autenticado en tipo_documento:', req.user);
    
    const [results] = await pool.query(
      `SELECT IdTipoDoc, Nombre_TipoDoc FROM tipo_documento ORDER BY Nombre_TipoDoc`
    );
    res.json(results);
  } catch (error) {
    console.error('Error al obtener tipos de documentos:', error);
    res.status(500).json({ error: "Error al obtener tipos de documentos" });
  }
});

// Obtener programas educativos
router.get("/programas_educativos", authenticateToken, async (req, res) => {
  try {
    console.log('Usuario autenticado en programas_educativos:', req.user);
    
    const [results] = await pool.query(
      `SELECT DISTINCT nombre FROM programa_educativo WHERE nombre IS NOT NULL ORDER BY nombre`
    );
    res.json(results.map(row => row.nombre));
  } catch (error) {
    console.error('Error al obtener programas educativos:', error);
    res.status(500).json({ error: "Error al obtener programas educativos" });
  }
});

// Obtener periodos
router.get("/periodos", authenticateToken, async (req, res) => {
  try {
    console.log('Usuario autenticado en periodos:', req.user);
    
    const [results] = await pool.query(
      `SELECT IdPeriodo, Año, Fase FROM periodos ORDER BY Año DESC, Fase`
    );
    res.json(results);
  } catch (error) {
    console.error('Error al obtener periodos:', error);
    res.status(500).json({ error: "Error al obtener periodos" });
  }
});

// ============================================================================
// OBTENER DOCUMENTOS CON FILTROS DE SEGURIDAD
// ============================================================================

router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log('Usuario autenticado en GET documentos:', req.user);
    console.log('Headers:', req.headers.authorization);
    
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { estatus, idPeriodo, id_proceso, idTipoDoc, programaEducativo } = req.query;

    if (!userId || !userRole) {
      return res.status(401).json({ error: "Usuario no autenticado correctamente" });
    }

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
        e.Nombre as NombreEstudiante,
        e.Apellido_Paterno,
        e.Apellido_Materno,
        t.Nombre_TipoDoc AS Nombre_TipoDoc,
        pe.nombre AS ProgramaEducativo,
        per.Año,
        per.Fase
      FROM documentos d
      JOIN proceso p ON d.id_proceso = p.id_proceso
      JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
      JOIN tipo_documento t ON d.IdTipoDoc = t.IdTipoDoc
      JOIN periodos per ON p.id_periodo = per.IdPeriodo
      JOIN programa_educativo pe ON p.id_programa = pe.id_programa
    `;
    
    const queryParams = [];
    const conditions = [];

    // FILTRO DE SEGURIDAD: Si NO es admin, solo ver sus propios documentos
    if (userRole !== 'admin') {
      conditions.push('e.id_usuario = ?');
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
    res.json(results);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ error: "Error al obtener documentos" });
  }
});

// ============================================================================
// SUBIR/ACTUALIZAR DOCUMENTO
// ============================================================================

router.post("/upload", authenticateToken, upload.single("archivo"), async (req, res) => {
  try {
    const { IdTipoDoc, id_usuario, Comentarios = "", Estatus = "Pendiente", id_proceso } = req.body;
    const file = req.file;
    const currentUserId = req.user.id;
    const userRole = req.user.role;

    if (!IdTipoDoc || !id_proceso || !file) {
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ error: "Faltan campos obligatorios o archivo" });
    }

    // Verificar que el estudiante está subiendo su propio documento
    if (userRole !== 'admin') {
      const [proceso] = await pool.query(
        `SELECT e.id_usuario FROM proceso p
         JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
         WHERE p.id_proceso = ?`,
        [id_proceso]
      );

      if (proceso.length === 0 || proceso[0].id_usuario !== currentUserId) {
        // Eliminar archivo subido si no tiene permiso
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return res.status(403).json({ error: "No tienes permiso para subir documentos a este proceso" });
      }
    }

    const nombreArchivo = decodeURIComponent(escape(file.originalname));
    const rutaArchivo = `/uploads/documentos/${file.filename}`;

    // Verificar si ya existe un documento
    const [existing] = await pool.query(
      `SELECT id_Documento, RutaArchivo FROM documentos 
       WHERE id_proceso = ? AND IdTipoDoc = ?`,
      [id_proceso, IdTipoDoc]
    );

    if (existing.length > 0) {
      // Eliminar archivo antiguo
      const oldFilePath = path.join(__dirname, "..", "public", existing[0].RutaArchivo.replace(/^\/[Uu]ploads\//, 'uploads/'));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      // Actualizar documento existente
      await pool.query(
        `UPDATE documentos 
         SET NombreArchivo = ?, RutaArchivo = ?, Estatus = 'Pendiente', 
             Comentarios = NULL, id_usuario = ?
         WHERE id_Documento = ?`,
        [nombreArchivo, rutaArchivo, currentUserId, existing[0].id_Documento]
      );

      res.json({ 
        success: true, 
        message: "Documento actualizado correctamente",
        id_Documento: existing[0].id_Documento 
      });
    } else {
      // Insertar nuevo documento
      const [result] = await pool.query(
        `INSERT INTO documentos (NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nombreArchivo, rutaArchivo, IdTipoDoc, currentUserId, Comentarios, Estatus, id_proceso]
      );

      res.json({ 
        success: true, 
        message: "Documento subido correctamente",
        id_Documento: result.insertId 
      });
    }
  } catch (error) {
    console.error('Error al subir documento:', error);
    // Si hay error, eliminar el archivo subido
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Error al subir documento" });
  }
});

// ============================================================================
// VISUALIZAR DOCUMENTO (Admin puede ver todos, Estudiante solo los suyos)
// ============================================================================

router.get("/view/:id_Documento", authenticateToken, verificarPermisoDocumento, async (req, res) => {
  try {
    const { id_Documento } = req.params;
    
    const [documento] = await pool.query(
      `SELECT NombreArchivo, RutaArchivo FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const filePath = path.join(__dirname, "..", "public", documento[0].RutaArchivo.replace(/^\/[Uu]ploads\//, 'uploads/'));

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado en el servidor" });
    }

    // Configurar headers para visualización en navegador
    let contentType;
    const fileExtension = path.extname(filePath).toLowerCase();
    switch(fileExtension) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
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
    res.setHeader('Cache-Control', 'no-cache');

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error al visualizar documento:', error);
    res.status(500).json({ error: "Error al visualizar documento" });
  }
});

// ============================================================================
// DESCARGAR DOCUMENTO (Admin puede descargar todos, Estudiante solo los suyos)
// ============================================================================

router.get("/download/:id_Documento", authenticateToken, verificarPermisoDocumento, async (req, res) => {
  try {
    const { id_Documento } = req.params;
    
    const [documento] = await pool.query(
      `SELECT NombreArchivo, RutaArchivo FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const filePath = path.join(__dirname, "..", "public", documento[0].RutaArchivo.replace(/^\/[Uu]ploads\//, 'uploads/'));

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado en el servidor" });
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

    // Para descarga forzada
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(documento[0].NombreArchivo)}"`);
    res.setHeader('Content-Length', fs.statSync(filePath).size);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error al descargar documento:', error);
    res.status(500).json({ error: "Error al descargar documento" });
  }
});

// ============================================================================
// APROBAR DOCUMENTO (Solo Admin)
// ============================================================================

router.put("/approve/:id_Documento", authenticateToken, verificarRolAdmin, async (req, res) => {
  try {
    const { id_Documento } = req.params;

    const [result] = await pool.query(
      `UPDATE documentos SET Estatus = 'Aprobado', Comentarios = NULL WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    res.json({ success: true, message: "Documento aprobado correctamente" });
  } catch (error) {
    console.error('Error al aprobar documento:', error);
    res.status(500).json({ error: "Error al aprobar documento" });
  }
});

// ============================================================================
// RECHAZAR DOCUMENTO (Solo Admin)
// ============================================================================

router.put("/reject/:id_Documento", authenticateToken, verificarRolAdmin, async (req, res) => {
  try {
    const { id_Documento } = req.params;
    const { comentarios } = req.body;

    if (!comentarios || comentarios.trim() === '') {
      return res.status(400).json({ error: "El motivo del rechazo es obligatorio" });
    }

    const [result] = await pool.query(
      `UPDATE documentos SET Estatus = 'Rechazado', Comentarios = ? WHERE id_Documento = ?`,
      [comentarios.trim(), id_Documento]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    res.json({ success: true, message: "Documento rechazado correctamente" });
  } catch (error) {
    console.error('Error al rechazar documento:', error);
    res.status(500).json({ error: "Error al rechazar documento" });
  }
});

// ============================================================================
// REVERTIR DOCUMENTO A PENDIENTE (Solo Admin)
// ============================================================================

router.put("/revert/:id_Documento", authenticateToken, verificarRolAdmin, async (req, res) => {
  try {
    const { id_Documento } = req.params;

    const [result] = await pool.query(
      `UPDATE documentos SET Estatus = 'Pendiente', Comentarios = NULL WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    res.json({ success: true, message: "Documento revertido a pendiente" });
  } catch (error) {
    console.error('Error al revertir documento:', error);
    res.status(500).json({ error: "Error al revertir documento" });
  }
});

// ============================================================================
// ELIMINAR DOCUMENTO (Admin puede eliminar cualquiera, Estudiante solo los suyos)
// ============================================================================

router.delete("/:id_Documento", authenticateToken, verificarPermisoDocumento, async (req, res) => {
  try {
    const { id_Documento } = req.params;

    const [documento] = await pool.query(
      `SELECT NombreArchivo, RutaArchivo FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    // Eliminar archivo físico
    const filePath = path.join(__dirname, "..", "public", documento[0].RutaArchivo.replace(/^\/[Uu]ploads\//, 'uploads/'));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Eliminar registro de base de datos
    await pool.query(
      `DELETE FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    res.json({ success: true, message: "Documento eliminado correctamente" });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({ error: "Error al eliminar documento" });
  }
});

export default router;