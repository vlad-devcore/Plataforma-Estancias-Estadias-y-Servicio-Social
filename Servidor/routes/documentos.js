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

const upload = multer({ storage });

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
   CATÁLOGOS
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
router.post(
  "/upload",
  authenticateToken,
  checkRole("alumno"),
  upload.single("archivo"),
  async (req, res) => {

  try {
    const { IdTipoDoc, id_proceso } = req.body;
const id_usuario = req.user.id;

    if (!IdTipoDoc || !id_proceso || !req.file)
 {
      return res.status(400).json({ error: "Datos incompletos" });
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
   VISUALIZAR
============================ */
router.get(
  "/download/:id_Documento",
  authenticateToken,
  async (req, res) => {
    try {
      const id_usuario = req.user.id;

      const [rows] = await pool.query(
        `SELECT NombreArchivo, RutaArchivo 
         FROM documentos 
         WHERE id_Documento = ? AND id_usuario = ?`,
        [req.params.id_Documento, id_usuario]
      );

      if (!rows.length) {
        return res.status(403).json({
          error: "No tienes permiso para acceder a este documento"
        });
      }

      const filePath = resolveFilePath(rows[0].RutaArchivo);
    

    if (!filePath || !fs.existsSync(filePath)) {
      console.log("❌ Archivo físico NO encontrado");
      console.log("📂 Listando archivos en la carpeta:");
      const uploadDir = path.join(__dirname, "..", "public", "Uploads", "documentos");
      if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        console.log("📁 Archivos disponibles:", files.slice(0, 10)); // primeros 10
      }
      return res.status(404).json({ 
        error: "Archivo físico no encontrado",
        rutaBuscada: filePath 
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
});

/* ============================
   LISTADO
============================ */
router.get(
  "/",
  authenticateToken,
  checkRole("alumno"),
  async (req, res) => {
    try {
      const id_usuario = req.user.id;

      const [rows] = await pool.query(`
        SELECT 
          d.*,
          t.Nombre_TipoDoc
        FROM documentos d
        INNER JOIN tipo_documento t ON d.IdTipoDoc = t.IdTipoDoc
        WHERE d.id_usuario = ?
      `, [id_usuario]);

      res.json(rows);
    } catch (err) {
      console.error("❌ Error en listado:", err);
      res.status(500).json({ error: "Error al obtener documentos" });
    }
  }
);


export default router;  