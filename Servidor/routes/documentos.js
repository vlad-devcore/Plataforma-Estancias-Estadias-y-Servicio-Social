import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";
import { fileURLToPath } from "url";
import { 
  authenticateToken, 
  isAdmin, 
  validateDocumentOwnership 
} from "./authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/* ============================
   MULTER - Configuración de almacenamiento
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

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Límite de 10MB
  },
  fileFilter: (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

/* ============================
   HELPERS
============================ */
const resolveFilePath = (rutaArchivo) => {
  if (!rutaArchivo) return null;

  console.log("🔍 Ruta original desde DB:", rutaArchivo);

  // quitar slash inicial
  let relativePath = rutaArchivo.replace(/^\/+/, "");
  console.log("📝 Después de quitar slash inicial:", relativePath);

  // forzar Uploads/documentos (case-insensitive)
  relativePath = relativePath.replace(/^uploads/i, "Uploads");
  console.log("📝 Después de normalizar Uploads:", relativePath);

  const finalPath = path.join(__dirname, "..", "public", relativePath);
  console.log("📂 Ruta final completa:", finalPath);
  console.log("✅ ¿Existe el archivo?", fs.existsSync(finalPath));

  return finalPath;
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
   CATÁLOGOS - Requieren autenticación
============================ */

/**
 * GET /api/documentos/tipo_documento
 * Obtiene el catálogo de tipos de documentos
 * Acceso: Público (catálogo de referencia)
 * TODO: Mover a authenticateToken cuando se corrija el frontend
 */
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

/**
 * GET /api/documentos/programas_educativos
 * Obtiene el catálogo de programas educativos
 * Acceso: Público (catálogo de referencia)
 * TODO: Mover a authenticateToken cuando se corrija el frontend
 */
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

/**
 * GET /api/documentos/periodos
 * Obtiene el catálogo de periodos
 * Acceso: Público (catálogo de referencia)
 * TODO: Mover a authenticateToken cuando se corrija el frontend
 */
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
   UPLOAD - Subir documentos
============================ */

/**
 * POST /api/documentos/upload
 * Sube un documento para el usuario autenticado
 * Acceso: Usuario autenticado (solo puede subir sus propios documentos)
 * 
 * SEGURIDAD: Ya NO se permite subir documentos en nombre de otros usuarios
 */
router.post("/upload", authenticateToken, upload.single("archivo"), async (req, res) => {
  try {
    const { IdTipoDoc, id_proceso } = req.body;
    const userId = req.user.id; // Siempre usar el ID del usuario autenticado
    
    if (!IdTipoDoc || !id_proceso || !req.file) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // VALIDACIÓN DE SEGURIDAD: Verificar que el proceso pertenece al usuario
    const [procesoCheck] = await pool.query(
      `SELECT p.id_proceso 
       FROM proceso p 
       INNER JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
       WHERE p.id_proceso = ? AND e.id_estudiante = ?`,
      [id_proceso, userId]
    );

    if (procesoCheck.length === 0) {
      // Eliminar el archivo subido si la validación falla
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ 
        error: "No tienes permiso para subir documentos a este proceso" 
      });
    }

    const nombreArchivo = req.file.originalname;
    const rutaArchivo = `/Uploads/documentos/${req.file.filename}`;

    console.log("📤 Subiendo archivo:", nombreArchivo);
    console.log("📂 Ruta a guardar en DB:", rutaArchivo);
    console.log("👤 Usuario:", userId);

    // Verificar si ya existe un documento del mismo tipo para este proceso y usuario
    const [existing] = await pool.query(
      `SELECT id_Documento, RutaArchivo 
       FROM documentos 
       WHERE id_proceso = ? AND IdTipoDoc = ? AND id_usuario = ?`,
      [id_proceso, IdTipoDoc, userId]
    );

    if (existing.length) {
      // Eliminar archivo anterior
      const oldPath = resolveFilePath(existing[0].RutaArchivo);
      if (oldPath && fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log("🗑️ Archivo antiguo eliminado");
      }

      // Actualizar documento existente
      await pool.query(
        `UPDATE documentos 
         SET NombreArchivo = ?, RutaArchivo = ?, Estatus = 'Pendiente', Comentarios = NULL
         WHERE id_Documento = ?`,
        [nombreArchivo, rutaArchivo, existing[0].id_Documento]
      );
      console.log("✅ Documento actualizado");
    } else {
      // Insertar nuevo documento
      await pool.query(
        `INSERT INTO documentos 
         (NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Estatus, id_proceso)
         VALUES (?, ?, ?, ?, 'Pendiente', ?)`,
        [nombreArchivo, rutaArchivo, IdTipoDoc, userId, id_proceso]
      );
      console.log("✅ Nuevo documento insertado");
    }

    res.json({ success: true, message: "Documento subido correctamente" });
  } catch (err) {
    console.error("❌ Error en /upload:", err);
    
    // Limpiar archivo si hubo error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: "Error al subir documento" });
  }
});

/* ============================
   VISUALIZAR/DESCARGAR - Con validación de pertenencia
============================ */

/**
 * GET /api/documentos/download/:id_Documento
 * Descarga/visualiza un documento
 * Acceso: Usuario autenticado que sea dueño del documento O administrador
 * 
 * SEGURIDAD: Verifica que el documento pertenezca al usuario o que sea admin
 */
router.get("/download/:id_Documento", 
  authenticateToken, 
  async (req, res) => {
    try {
      const documentId = req.params.id_Documento;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';

      console.log("🔎 Buscando documento ID:", documentId);
      console.log("👤 Usuario solicitante:", userId, "| Admin:", isAdmin);
      
      // Obtener información del documento
      const [rows] = await pool.query(
        "SELECT NombreArchivo, RutaArchivo, id_usuario FROM documentos WHERE id_Documento = ?",
        [documentId]
      );

      if (!rows.length) {
        console.log("❌ Documento no encontrado en DB");
        return res.status(404).json({ error: "Documento no encontrado" });
      }

      // VALIDACIÓN DE SEGURIDAD: Verificar pertenencia
      if (!isAdmin && rows[0].id_usuario !== userId) {
        console.log("🚫 Acceso denegado: El documento no pertenece al usuario");
        return res.status(403).json({ 
          error: "No tienes permiso para acceder a este documento" 
        });
      }

      console.log("📄 Documento encontrado:", rows[0].NombreArchivo);
      
      const filePath = resolveFilePath(rows[0].RutaArchivo);

      if (!filePath || !fs.existsSync(filePath)) {
        console.log("❌ Archivo físico NO encontrado");
        return res.status(404).json({ 
          error: "Archivo físico no encontrado"
        });
      }

      console.log("✅ Archivo encontrado, enviando...");

      // Usar el Content-Type correcto
      const contentType = getMimeType(rows[0].NombreArchivo);
      res.setHeader("Content-Type", contentType);
      
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(rows[0].NombreArchivo)}"`
      );

      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      console.error("❌ Error en /download:", err);
      res.status(500).json({ error: "Error al visualizar documento" });
    }
  }
);

/* ============================
   LISTADO - Filtrado por usuario o admin
============================ */

/**
 * GET /api/documentos
 * Lista documentos del usuario autenticado
 * Acceso: Usuario autenticado ve solo SUS documentos, Admin ve TODOS
 * 
 * SEGURIDAD: Los estudiantes solo ven sus propios documentos
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let query = `
      SELECT 
        d.*,
        t.Nombre_TipoDoc,
        pe.nombre AS ProgramaEducativo,
        e.Matricula
      FROM documentos d
      INNER JOIN tipo_documento t ON d.IdTipoDoc = t.IdTipoDoc
      INNER JOIN proceso p ON d.id_proceso = p.id_proceso
      INNER JOIN programa_educativo pe ON p.id_programa = pe.id_programa
      INNER JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
    `;

    let params = [];

    // Si NO es admin, filtrar solo sus documentos
    if (!isAdmin) {
      query += " WHERE d.id_usuario = ?";
      params.push(userId);
    }

    query += " ORDER BY d.id_Documento DESC";

    const [rows] = await pool.query(query, params);
    
    console.log(`📋 Documentos encontrados: ${rows.length} | Usuario: ${userId} | Admin: ${isAdmin}`);
    
    res.json(rows);
  } catch (err) {
    console.error("❌ Error en listado:", err);
    res.status(500).json({ error: "Error al obtener documentos" });
  }
});

/* ============================
   ACCIONES ADMINISTRATIVAS - Solo Admin
============================ */

/**
 * PUT /api/documentos/approve/:id
 * Aprueba un documento
 * Acceso: Solo administradores
 */
router.put("/approve/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { comentarios } = req.body;

    const [result] = await pool.query(
      `UPDATE documentos 
       SET Estatus = 'Aprobado', Comentarios = ?
       WHERE id_Documento = ?`,
      [comentarios || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    console.log(`✅ Documento ${id} aprobado por admin ${req.user.id}`);
    res.json({ success: true, message: "Documento aprobado correctamente" });
  } catch (err) {
    console.error("❌ Error al aprobar documento:", err);
    res.status(500).json({ error: "Error al aprobar documento" });
  }
});

/**
 * PUT /api/documentos/reject/:id
 * Rechaza un documento
 * Acceso: Solo administradores
 */
router.put("/reject/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { comentarios } = req.body;

    if (!comentarios || comentarios.trim() === '') {
      return res.status(400).json({ 
        error: "Debes proporcionar un comentario al rechazar un documento" 
      });
    }

    const [result] = await pool.query(
      `UPDATE documentos 
       SET Estatus = 'Rechazado', Comentarios = ?
       WHERE id_Documento = ?`,
      [comentarios, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    console.log(`❌ Documento ${id} rechazado por admin ${req.user.id}`);
    res.json({ success: true, message: "Documento rechazado correctamente" });
  } catch (err) {
    console.error("❌ Error al rechazar documento:", err);
    res.status(500).json({ error: "Error al rechazar documento" });
  }
});

/**
 * PUT /api/documentos/revert/:id
 * Revierte un documento a estado Pendiente
 * Acceso: Solo administradores
 */
router.put("/revert/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE documentos 
       SET Estatus = 'Pendiente', Comentarios = NULL
       WHERE id_Documento = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    console.log(`🔄 Documento ${id} revertido a Pendiente por admin ${req.user.id}`);
    res.json({ success: true, message: "Documento revertido a pendiente" });
  } catch (err) {
    console.error("❌ Error al revertir documento:", err);
    res.status(500).json({ error: "Error al revertir documento" });
  }
});

/**
 * DELETE /api/documentos/:id
 * Elimina un documento
 * Acceso: Usuario dueño del documento O administrador
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Obtener información del documento
    const [documento] = await pool.query(
      "SELECT id_usuario, RutaArchivo FROM documentos WHERE id_Documento = ?",
      [documentId]
    );

    if (documento.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    // VALIDACIÓN DE SEGURIDAD: Solo el dueño o admin puede eliminar
    if (!isAdmin && documento[0].id_usuario !== userId) {
      return res.status(403).json({ 
        error: "No tienes permiso para eliminar este documento" 
      });
    }

    // Eliminar archivo físico
    const filePath = resolveFilePath(documento[0].RutaArchivo);
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("🗑️ Archivo físico eliminado");
    }

    // Eliminar registro de la base de datos
    await pool.query("DELETE FROM documentos WHERE id_Documento = ?", [documentId]);

    console.log(`🗑️ Documento ${documentId} eliminado por usuario ${userId}`);
    res.json({ success: true, message: "Documento eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar documento:", err);
    res.status(500).json({ error: "Error al eliminar documento" });
  }
});

export default router;