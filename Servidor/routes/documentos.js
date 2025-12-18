import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

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

  let relativePath = rutaArchivo.replace(/^\/+/, "");
  console.log("📝 Después de quitar slash inicial:", relativePath);

  relativePath = relativePath.replace(/^uploads/i, "Uploads");
  console.log("📝 Después de normalizar Uploads:", relativePath);

  const finalPath = path.join(__dirname, "..", "public", relativePath);
  console.log("📂 Ruta final completa:", finalPath);
  console.log("✅ ¿Existe el archivo?", fs.existsSync(finalPath));

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

// 🔒 Middleware OPCIONAL: Intenta extraer usuario del token SI existe
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log('✅ Usuario autenticado:', decoded.id, decoded.role);
    } catch (err) {
      console.log('⚠️ Token inválido o expirado, continuando sin autenticación');
      req.user = null;
    }
  } else {
    console.log('ℹ️ Sin token, continuando como usuario anónimo');
    req.user = null;
  }
  
  next();
};

// Helper para verificar pertenencia
const verificarPerteneceUsuario = async (idDocumento, userId, role) => {
  const [rows] = await pool.query(`
    SELECT d.id_usuario, d.id_Documento
    FROM documentos d
    WHERE d.id_Documento = ?
  `, [idDocumento]);

  if (!rows.length) return false;
  
  if (role === 'administrador' || role === 'coordinador') return true;
  
  return rows[0].id_usuario === userId;
};

/* ============================
   CATÁLOGOS - PÚBLICOS
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
   LISTADO - USA AUTENTICACIÓN OPCIONAL
   Si hay token → filtra por usuario
   Si NO hay token → retorna array vacío (seguro)
============================ */
router.get("/", optionalAuth, async (req, res) => {
  try {
    // Si NO hay usuario autenticado, retornar array vacío
    if (!req.user) {
      console.log('⚠️ Petición sin autenticación a /api/documentos - retornando vacío');
      return res.json([]);
    }

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

    // Usuario común solo ve sus propios documentos
    if (!isAdmin) {
      query += ` WHERE d.id_usuario = ?`;
      params.push(currentUserId);
    }

    query += ` ORDER BY d.id_Documento DESC`;

    const [rows] = await pool.query(query, params);
    
    console.log(`✅ Listado - Usuario: ${currentUserId}, Rol: ${req.user.role}, Docs: ${rows.length}`);
    
    res.json(rows);
  } catch (err) {
    console.error("❌ Error en listado:", err);
    res.status(500).json({ error: "Error al obtener documentos" });
  }
});

/* ============================
   UPLOAD - REQUIERE TOKEN
============================ */
router.post("/upload", optionalAuth, upload.single("archivo"), async (req, res) => {
  try {
    // Validar que esté autenticado
    if (!req.user) {
      return res.status(401).json({ error: "Autenticación requerida" });
    }

    const { IdTipoDoc, id_usuario, id_proceso } = req.body;
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'administrador';

    if (!IdTipoDoc || !id_usuario || !id_proceso || !req.file) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // Usuario común solo puede subir sus propios documentos
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

/* ============================
   DOWNLOAD - REQUIERE TOKEN Y PERTENENCIA
============================ */
router.get("/download/:id_Documento", optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Autenticación requerida para descargar documentos" });
    }

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
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    // Verificar pertenencia
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
      return res.status(404).json({ 
        error: "Archivo físico no encontrado"
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

export default router;