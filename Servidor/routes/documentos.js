import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";
import { fileURLToPath } from "url";
import { 
  authenticateToken, 
  isAdmin
} from "./authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/* ============================
   HELPER: Obtener id_estudiante desde id_user
============================ */
const getEstudianteId = async (userId, userRole) => {
  // Si es admin, no necesita id_estudiante
  if (userRole === 'admin') {
    return null;
  }
  
  // Buscar id_estudiante en la tabla estudiantes
  const [estudiante] = await pool.query(
    "SELECT id_estudiante FROM estudiantes WHERE id_estudiante = ?",
    [userId]
  );
  
  if (estudiante.length > 0) {
    return estudiante[0].id_estudiante;
  }
  
  return null;
};

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
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
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
  let relativePath = rutaArchivo.replace(/^\/+/, "");
  relativePath = relativePath.replace(/^uploads/i, "Uploads");
  const finalPath = path.join(__dirname, "..", "public", relativePath);
  return finalPath;
};

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
   CATÁLOGOS - Sin autenticación
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

router.post("/upload", authenticateToken, upload.single("archivo"), async (req, res) => {
  try {
    const { IdTipoDoc, id_proceso } = req.body;
    const userId = req.user.id; // id_user de la tabla users
    const userRole = req.user.role;
    
    console.log("📤 Upload iniciado - userId:", userId, "role:", userRole);
    
    if (!IdTipoDoc || !id_proceso || !req.file) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // Obtener id_estudiante
    const estudianteId = await getEstudianteId(userId, userRole);
    
    if (!estudianteId && userRole !== 'admin') {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      console.error("❌ No se encontró id_estudiante para userId:", userId);
      return res.status(403).json({ error: "Usuario no encontrado como estudiante" });
    }

    console.log("🎓 id_estudiante encontrado:", estudianteId);

    // Verificar que el proceso pertenece al estudiante
    const [procesoCheck] = await pool.query(
      `SELECT p.id_proceso 
       FROM proceso p 
       WHERE p.id_proceso = ? AND p.id_estudiante = ?`,
      [id_proceso, estudianteId]
    );

    if (procesoCheck.length === 0) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      console.error("❌ Proceso no pertenece al estudiante");
      return res.status(403).json({ 
        error: "No tienes permiso para subir documentos a este proceso" 
      });
    }

    const nombreArchivo = req.file.originalname;
    const rutaArchivo = `/Uploads/documentos/${req.file.filename}`;

    // Verificar si ya existe un documento del mismo tipo
    const [existing] = await pool.query(
      `SELECT id_Documento, RutaArchivo 
       FROM documentos 
       WHERE id_proceso = ? AND IdTipoDoc = ? AND id_usuario = ?`,
      [id_proceso, IdTipoDoc, estudianteId]
    );

    if (existing.length) {
      const oldPath = resolveFilePath(existing[0].RutaArchivo);
      if (oldPath && fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }

      await pool.query(
        `UPDATE documentos 
         SET NombreArchivo = ?, RutaArchivo = ?, Estatus = 'Pendiente', Comentarios = NULL
         WHERE id_Documento = ?`,
        [nombreArchivo, rutaArchivo, existing[0].id_Documento]
      );
      console.log("✅ Documento actualizado");
    } else {
      await pool.query(
        `INSERT INTO documentos 
         (NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Estatus, id_proceso)
         VALUES (?, ?, ?, ?, 'Pendiente', ?)`,
        [nombreArchivo, rutaArchivo, IdTipoDoc, estudianteId, id_proceso]
      );
      console.log("✅ Nuevo documento insertado");
    }

    res.json({ success: true, message: "Documento subido correctamente" });
  } catch (err) {
    console.error("❌ Error en /upload:", err);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Error al subir documento" });
  }
});

/* ============================
   DOWNLOAD
============================ */

router.get("/download/:id_Documento", authenticateToken, async (req, res) => {
  try {
    const documentId = req.params.id_Documento;
    const userId = req.user.id;
    const userRole = req.user.role;
    const isAdmin = userRole === 'admin';

    console.log("🔎 Download - documentId:", documentId, "userId:", userId, "isAdmin:", isAdmin);
    
    const [rows] = await pool.query(
      `SELECT d.NombreArchivo, d.RutaArchivo, d.id_usuario 
       FROM documentos d
       WHERE d.id_Documento = ?`,
      [documentId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    // Obtener id_estudiante para comparar
    if (!isAdmin) {
      const estudianteId = await getEstudianteId(userId, userRole);
      
      if (rows[0].id_usuario !== estudianteId) {
        console.log("🚫 Acceso denegado - doc.id_usuario:", rows[0].id_usuario, "estudianteId:", estudianteId);
        return res.status(403).json({ 
          error: "No tienes permiso para acceder a este documento" 
        });
      }
    }

    const filePath = resolveFilePath(rows[0].RutaArchivo);

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo físico no encontrado" });
    }

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
});

/* ============================
   ACCIONES ADMINISTRATIVAS
============================ */

router.put("/approve/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { comentarios } = req.body;

    const [checkDoc] = await pool.query(
      "SELECT id_Documento FROM documentos WHERE id_Documento = ?",
      [id]
    );

    if (checkDoc.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    await pool.query(
      `UPDATE documentos 
       SET Estatus = 'Aprobado', Comentarios = ?
       WHERE id_Documento = ?`,
      [comentarios || null, id]
    );

    res.json({ success: true, message: "Documento aprobado correctamente" });
  } catch (err) {
    console.error("❌ Error al aprobar:", err);
    res.status(500).json({ error: "Error al aprobar documento" });
  }
});

router.put("/reject/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { comentarios } = req.body;

    if (!comentarios || comentarios.trim() === '') {
      return res.status(400).json({ 
        error: "Debes proporcionar un comentario al rechazar" 
      });
    }

    const [checkDoc] = await pool.query(
      "SELECT id_Documento FROM documentos WHERE id_Documento = ?",
      [id]
    );

    if (checkDoc.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    await pool.query(
      `UPDATE documentos 
       SET Estatus = 'Rechazado', Comentarios = ?
       WHERE id_Documento = ?`,
      [comentarios, id]
    );

    res.json({ success: true, message: "Documento rechazado correctamente" });
  } catch (err) {
    console.error("❌ Error al rechazar:", err);
    res.status(500).json({ error: "Error al rechazar documento" });
  }
});

router.put("/revert/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [checkDoc] = await pool.query(
      "SELECT id_Documento FROM documentos WHERE id_Documento = ?",
      [id]
    );

    if (checkDoc.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    await pool.query(
      `UPDATE documentos 
       SET Estatus = 'Pendiente', Comentarios = NULL
       WHERE id_Documento = ?`,
      [id]
    );

    res.json({ success: true, message: "Documento revertido a pendiente" });
  } catch (err) {
    console.error("❌ Error al revertir:", err);
    res.status(500).json({ error: "Error al revertir documento" });
  }
});

/* ============================
   DELETE
============================ */

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    const isAdmin = userRole === 'admin';

    const [documento] = await pool.query(
      "SELECT id_usuario, RutaArchivo FROM documentos WHERE id_Documento = ?",
      [documentId]
    );

    if (documento.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    // Validar pertenencia si no es admin
    if (!isAdmin) {
      const estudianteId = await getEstudianteId(userId, userRole);
      
      if (documento[0].id_usuario !== estudianteId) {
        return res.status(403).json({ 
          error: "No tienes permiso para eliminar este documento" 
        });
      }
    }

    const filePath = resolveFilePath(documento[0].RutaArchivo);
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query("DELETE FROM documentos WHERE id_Documento = ?", [documentId]);

    res.json({ success: true, message: "Documento eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar:", err);
    res.status(500).json({ error: "Error al eliminar documento" });
  }
});

/* ============================
   LISTADO - AL FINAL (Ruta genérica)
============================ */

router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log("🔍 GET /api/documentos");
    console.log("  - req.user:", req.user);
    
    if (!req.user || !req.user.id) {
      console.error("❌ req.user inválido");
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const userId = req.user.id; // id_user de tabla users
    const userRole = req.user.role;
    const isAdmin = userRole === 'admin';

    console.log("  - userId:", userId, "| role:", userRole, "| isAdmin:", isAdmin);

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

    if (!isAdmin) {
      // Obtener id_estudiante para filtrar
      const estudianteId = await getEstudianteId(userId, userRole);
      
      if (!estudianteId) {
        console.error("❌ No se encontró id_estudiante");
        return res.status(403).json({ error: "Usuario no encontrado como estudiante" });
      }
      
      console.log("  - Filtrando por id_estudiante:", estudianteId);
      query += " WHERE d.id_usuario = ?";
      params.push(estudianteId);
    }

    query += " ORDER BY d.id_Documento DESC";

    const [rows] = await pool.query(query, params);
    
    console.log(`✅ Documentos encontrados: ${rows.length}`);
    
    res.json(rows);
  } catch (err) {
    console.error("❌ Error en listado:", err);
    res.status(500).json({ error: "Error al obtener documentos" });
  }
});

export default router;