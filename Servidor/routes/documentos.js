import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";
import { fileURLToPath } from "url";
import { authenticateToken, checkRole } from "./authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/* ============================
   MULTER
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
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedTypes = /pdf|jpg|jpeg|png|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Tipo de archivo no permitido"));
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

// 🔒 Helper para verificar pertenencia del documento
const verificarPerteneceUsuario = async (idDocumento, userId, role) => {
  const [rows] = await pool.query(`
    SELECT d.id_usuario, d.id_Documento
    FROM documentos d
    WHERE d.id_Documento = ?
  `, [idDocumento]);

  if (!rows.length) return false;
  
  // Admins y coordinadores pueden acceder a todo
  if (role === 'administrador' || role === 'coordinador') return true;
  
  // Usuarios solo sus propios documentos
  return rows[0].id_usuario === userId;
};

/* ============================
   🌐 CATÁLOGOS - PÚBLICOS (SIN AUTENTICACIÓN)
   Estos endpoints NO requieren token porque son datos de referencia
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
   🔒 ENDPOINTS PROTEGIDOS - REQUIEREN AUTENTICACIÓN
============================ */

/* UPLOAD - Usuario solo puede subir sus propios documentos */
router.post("/upload", authenticateToken, upload.single("archivo"), async (req, res) => {
  try {
    const { IdTipoDoc, id_usuario, id_proceso } = req.body;
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'administrador';

    // Validar datos obligatorios
    if (!IdTipoDoc || !id_usuario || !id_proceso || !req.file) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // 🔒 SEGURIDAD: Usuario común solo puede subir sus propios documentos
    if (!isAdmin && parseInt(id_usuario) !== currentUserId) {
      return res.status(403).json({ 
        error: "Acceso denegado. Solo puedes subir tus propios documentos" 
      });
    }

    const nombreArchivo = req.file.originalname;
    const rutaArchivo = `/Uploads/documentos/${req.file.filename}`;

    console.log("📤 Subiendo archivo:", nombreArchivo);
    console.log("📂 Ruta a guardar en DB:", rutaArchivo);

    const [existing] = await pool.query(
      `SELECT id_Documento, RutaArchivo 
       FROM documentos 
       WHERE id_proceso = ? AND IdTipoDoc = ? AND id_usuario = ?`,
      [id_proceso, IdTipoDoc, id_usuario]
    );

    if (existing.length) {
      const oldPath = resolveFilePath(existing[0].RutaArchivo);
      if (oldPath && fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log("🗑️ Archivo antiguo eliminado");
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
        [nombreArchivo, rutaArchivo, IdTipoDoc, id_usuario, id_proceso]
      );
      console.log("✅ Nuevo documento insertado");
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error en /upload:", err);
    res.status(500).json({ error: "Error al subir documento" });
  }
});

/* VISUALIZAR/DESCARGAR - Solo documentos propios o si eres admin */
router.get("/download/:id_Documento", authenticateToken, async (req, res) => {
  try {
    const { id_Documento } = req.params;
    const currentUserId = req.user.id;
    const userRole = req.user.role;

    console.log("🔎 Buscando documento ID:", id_Documento);
    console.log("👤 Usuario solicitante:", currentUserId, "Rol:", userRole);
    
    const [rows] = await pool.query(
      "SELECT NombreArchivo, RutaArchivo, id_usuario FROM documentos WHERE id_Documento = ?",
      [id_Documento]
    );

    if (!rows.length) {
      console.log("❌ Documento no encontrado en DB");
      return res.status(404).json({ error: "Documento no encontrado en base de datos" });
    }

    // 🔒 SEGURIDAD: Verificar pertenencia del documento
    const perteneceAlUsuario = await verificarPerteneceUsuario(id_Documento, currentUserId, userRole);
    if (!perteneceAlUsuario) {
      console.log("❌ Acceso denegado - documento no pertenece al usuario");
      return res.status(403).json({ 
        error: "Acceso denegado. No tienes permisos para ver este documento" 
      });
    }

    console.log("📄 Documento encontrado:", rows[0].NombreArchivo);
    
    const filePath = resolveFilePath(rows[0].RutaArchivo);

    if (!filePath || !fs.existsSync(filePath)) {
      console.log("❌ Archivo físico NO encontrado");
      console.log("📂 Listando archivos en la carpeta:");
      const uploadDir = path.join(__dirname, "..", "public", "Uploads", "documentos");
      if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        console.log("📁 Archivos disponibles:", files.slice(0, 10));
      }
      return res.status(404).json({ 
        error: "Archivo físico no encontrado",
        rutaBuscada: filePath 
      });
    }

    console.log("✅ Archivo encontrado, enviando...");

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

/* LISTADO - Admin ve todos, usuario común solo los suyos */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'administrador';

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

    // 🔒 SEGURIDAD: Usuario común solo ve sus propios documentos
    if (!isAdmin) {
      query += ` WHERE d.id_usuario = ?`;
      params.push(currentUserId);
    }

    query += ` ORDER BY d.id_Documento DESC`;

    const [rows] = await pool.query(query, params);
    
    console.log(`✅ Listado de documentos - Usuario: ${currentUserId}, Rol: ${req.user.role}, Documentos: ${rows.length}`);
    
    res.json(rows);
  } catch (err) {
    console.error("❌ Error en listado:", err);
    res.status(500).json({ error: "Error al obtener documentos" });
  }
});

export default router;  