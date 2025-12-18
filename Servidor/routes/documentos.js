import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";
import { fileURLToPath } from "url";
import {
  authenticateToken,
  isAdmin as isAdminMiddleware
} from "./authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/* ============================
   HELPER: Obtener id_estudiante desde id_user
============================ */
const getEstudianteId = async (userId, userRole) => {
  if (userRole === "admin") return null;

  const [rows] = await pool.query(
    "SELECT id_estudiante FROM estudiantes WHERE id_user = ?",
    [userId]
  );

  return rows.length ? rows[0].id_estudiante : null;
};

/* ============================
   MULTER - Configuración
============================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(
      __dirname,
      "..",
      "public",
      "Uploads",
      "documentos"
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `archivo-${unique}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Tipo de archivo no permitido"));
  }
});

/* ============================
   HELPERS
============================ */
const resolveFilePath = (rutaArchivo) => {
  if (!rutaArchivo) return null;
  const relative = rutaArchivo.replace(/^\/+/, "");
  return path.join(__dirname, "..", "public", relative);
};

const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  };
  return map[ext] || "application/octet-stream";
};

/* ============================
   CATÁLOGOS (sin auth)
============================ */
router.get("/tipo_documento", async (_, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT IdTipoDoc, Nombre_TipoDoc FROM tipo_documento ORDER BY Nombre_TipoDoc"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Error al obtener tipos" });
  }
});

router.get("/programas_educativos", async (_, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DISTINCT nombre FROM programa_educativo WHERE nombre IS NOT NULL ORDER BY nombre"
    );
    res.json(rows.map(r => r.nombre));
  } catch {
    res.status(500).json({ error: "Error al obtener programas" });
  }
});

router.get("/periodos", async (_, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT IdPeriodo, Año, Fase FROM periodos ORDER BY Año DESC, Fase"
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error al obtener periodos" });
  }
});

/* ============================
   UPLOAD
============================ */
router.post(
  "/upload",
  authenticateToken,
  upload.single("archivo"),
  async (req, res) => {
    try {
      const { IdTipoDoc, id_proceso } = req.body;
      const userId = req.user.id;
      const role = req.user.role;
      const admin = role === "admin";

      if (!IdTipoDoc || !id_proceso || !req.file) {
        return res.status(400).json({ error: "Datos incompletos" });
      }

      const estudianteId = await getEstudianteId(userId, role);

      if (!admin && !estudianteId) {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ error: "Estudiante no válido" });
      }

      // Validar proceso SOLO para estudiantes
      if (!admin) {
        const [check] = await pool.query(
          "SELECT id_proceso FROM proceso WHERE id_proceso = ? AND id_estudiante = ?",
          [id_proceso, estudianteId]
        );
        if (!check.length) {
          fs.unlinkSync(req.file.path);
          return res.status(403).json({ error: "Proceso no autorizado" });
        }
      }

      const rutaArchivo = `/Uploads/documentos/${req.file.filename}`;
      const nombreArchivo = req.file.originalname;
      const ownerId = admin ? null : estudianteId;

      const [existing] = await pool.query(
        "SELECT id_Documento, RutaArchivo FROM documentos WHERE id_proceso = ? AND IdTipoDoc = ? AND id_usuario <=> ?",
        [id_proceso, IdTipoDoc, ownerId]
      );

      if (existing.length) {
        const oldPath = resolveFilePath(existing[0].RutaArchivo);
        if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

        await pool.query(
          `UPDATE documentos
           SET NombreArchivo=?, RutaArchivo=?, Estatus='Pendiente', Comentarios=NULL
           WHERE id_Documento=?`,
          [nombreArchivo, rutaArchivo, existing[0].id_Documento]
        );
      } else {
        await pool.query(
          `INSERT INTO documentos
           (NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Estatus, id_proceso)
           VALUES (?, ?, ?, ?, 'Pendiente', ?)`,
          [nombreArchivo, rutaArchivo, IdTipoDoc, ownerId, id_proceso]
        );
      }

      res.json({ success: true });
    } catch (e) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error(e);
      res.status(500).json({ error: "Error al subir documento" });
    }
  }
);

/* ============================
   DOWNLOAD
============================ */
router.get("/download/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user.role;
    const admin = role === "admin";

    const [rows] = await pool.query(
      "SELECT NombreArchivo, RutaArchivo, id_usuario FROM documentos WHERE id_Documento = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    if (!admin) {
      const estudianteId = await getEstudianteId(req.user.id, role);
      if (rows[0].id_usuario !== estudianteId) {
        return res.status(403).json({ error: "Acceso denegado" });
      }
    }

    const filePath = resolveFilePath(rows[0].RutaArchivo);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    res.setHeader("Content-Type", getMimeType(rows[0].NombreArchivo));
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(rows[0].NombreArchivo)}"`
    );

    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    res.status(500).json({ error: "Error al descargar" });
  }
});

/* ============================
   ADMIN
============================ */
router.put("/approve/:id", authenticateToken, isAdminMiddleware, async (req, res) => {
  await pool.query(
    "UPDATE documentos SET Estatus='Aprobado', Comentarios=? WHERE id_Documento=?",
    [req.body.comentarios || null, req.params.id]
  );
  res.json({ success: true });
});

router.put("/reject/:id", authenticateToken, isAdminMiddleware, async (req, res) => {
  if (!req.body.comentarios) {
    return res.status(400).json({ error: "Comentario requerido" });
  }
  await pool.query(
    "UPDATE documentos SET Estatus='Rechazado', Comentarios=? WHERE id_Documento=?",
    [req.body.comentarios, req.params.id]
  );
  res.json({ success: true });
});

/* ============================
   LISTADO
============================ */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const role = req.user.role;
    const admin = role === "admin";

    let query = `
      SELECT d.*, t.Nombre_TipoDoc
      FROM documentos d
      INNER JOIN tipo_documento t ON d.IdTipoDoc = t.IdTipoDoc
    `;
    const params = [];

    if (!admin) {
      const estudianteId = await getEstudianteId(req.user.id, role);
      query += " WHERE d.id_usuario = ?";
      params.push(estudianteId);
    }

    query += " ORDER BY d.id_Documento DESC";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error al listar documentos" });
  }
});

export default router;
