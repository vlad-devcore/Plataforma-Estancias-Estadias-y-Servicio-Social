import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";
import { fileURLToPath } from 'url';
import { authenticateToken, checkRole } from './authMiddleware.js';

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

// ============================================
// 🔓 ENDPOINTS PÚBLICOS (catálogos básicos)
// ============================================

// Obtener tipos de documentos - Necesario para que estudiantes vean opciones
router.get("/tipo_documento", authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT IdTipoDoc, Nombre_TipoDoc FROM tipo_documento ORDER BY Nombre_TipoDoc`
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tipos de documentos" });
  }
});

// Obtener programas educativos - Necesario para filtros
router.get("/programas_educativos", authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT DISTINCT nombre FROM programa_educativo WHERE nombre IS NOT NULL ORDER BY nombre`
    );
    res.json(results.map(row => row.nombre));
  } catch (error) {
    res.status(500).json({ error: "Error al obtener programas educativos" });
  }
});

// Obtener periodos - Necesario para filtros
router.get("/periodos", authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT IdPeriodo, Año, Fase FROM periodos ORDER BY Año DESC, Fase`
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener periodos" });
  }
});

// ============================================
// 🔒 ENDPOINTS PROTEGIDOS
// ============================================

// ✅ CORREGIDO: Subir/actualizar documento (con autenticación)
router.post("/upload", authenticateToken, upload.single("archivo"), async (req, res) => {
  try {
    const { IdTipoDoc, id_usuario, Comentarios = "", Estatus = "Pendiente", id_proceso } = req.body;
    const file = req.file;
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'administrador';

    if (!IdTipoDoc || !id_usuario || !id_proceso || !file) {
      return res.status(400).json({ error: "Faltan campos obligatorios o archivo" });
    }

    // Validar que el usuario solo suba sus propios documentos (excepto admin)
    if (!isAdmin && parseInt(id_usuario) !== currentUserId) {
      return res.status(403).json({ error: "No puedes subir documentos en nombre de otro usuario" });
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

// ✅ CORREGIDO: Aprobar documento (SOLO ADMIN)
router.put("/approve/:id_Documento", authenticateToken, checkRole(['administrador']), async (req, res) => {
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

// ✅ CORREGIDO: Rechazar documento (SOLO ADMIN)
router.put("/reject/:id_Documento", authenticateToken, checkRole(['administrador']), async (req, res) => {
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

// ✅ CORREGIDO: Revertir documento a Pendiente (SOLO ADMIN)
router.put("/revert/:id_Documento", authenticateToken, checkRole(['administrador']), async (req, res) => {
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

// ✅ CORREGIDO: Descargar documento (con validación de ownership)
router.get("/download/:id_Documento", authenticateToken, async (req, res) => {
  try {
    const { id_Documento } = req.params;
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'administrador';
    
    const [documento] = await pool.query(
      `SELECT NombreArchivo, RutaArchivo, id_usuario FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    // Validar que solo el dueño o admin pueda descargar
    if (!isAdmin && documento[0].id_usuario !== currentUserId) {
      return res.status(403).json({ error: "No tienes permiso para descargar este documento" });
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

// ✅ CORREGIDO: Eliminar documento (Owner o Admin)
router.delete("/:id_Documento", authenticateToken, async (req, res) => {
  try {
    const { id_Documento } = req.params;
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'administrador';

    const [documento] = await pool.query(
      `SELECT NombreArchivo, RutaArchivo, id_usuario FROM documentos WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (documento.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    // Validar que solo el dueño o admin pueda eliminar
    if (!isAdmin && documento[0].id_usuario !== currentUserId) {
      return res.status(403).json({ error: "No tienes permiso para eliminar este documento" });
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

// ✅ CORREGIDO: Obtener todos los documentos (filtrado por usuario)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { estatus, idPeriodo, id_proceso, id_usuario, idTipoDoc, programaEducativo } = req.query;
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'administrador';

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

    // Si NO es admin, solo puede ver sus propios documentos
    if (!isAdmin) {
      conditions.push('d.id_usuario = ?');
      queryParams.push(currentUserId);
    }
    
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
    // Si es admin, puede filtrar por id_usuario específico
    if (isAdmin && id_usuario && !isNaN(id_usuario)) {
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