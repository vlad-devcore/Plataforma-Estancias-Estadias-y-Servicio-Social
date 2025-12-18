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
   HELPER: Obtener id_estudiante
============================ */
const getEstudianteId = async (userId, role) => {
  if (role === "admin") return null;

  const [rows] = await pool.query(
    "SELECT id_estudiante FROM estudiantes WHERE id_user = ?",
    [userId]
  );

  return rows.length ? rows[0].id_estudiante : null;
};

/* ============================
   MULTER
============================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "..", "public", "Uploads", "documentos");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `archivo-${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

/* ============================
   HELPERS
============================ */
const resolveFilePath = (ruta) => {
  if (!ruta) return null;
  return path.join(__dirname, "..", "public", ruta.replace(/^\/+/, ""));
};

/* ============================
   CATÁLOGOS (PÚBLICOS)
============================ */
router.get("/tipo_documento", async (_, res) => {
  const [rows] = await pool.query(
    "SELECT IdTipoDoc, Nombre_TipoDoc FROM tipo_documento"
  );
  res.json(rows);
});

router.get("/programas_educativos", async (_, res) => {
  const [rows] = await pool.query(
    "SELECT DISTINCT nombre FROM programa_educativo WHERE nombre IS NOT NULL"
  );
  res.json(rows.map(r => r.nombre));
});

router.get("/periodos", async (_, res) => {
  const [rows] = await pool.query(
    "SELECT IdPeriodo, Año, Fase FROM periodos"
  );
  res.json(rows);
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
      const { id, role } = req.user;

      const estudianteId = await getEstudianteId(id, role);
      if (!estudianteId && role !== "admin") {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(403).json({ error: "No autorizado" });
      }

      const ruta = `/Uploads/documentos/${req.file.filename}`;

      await pool.query(
        `INSERT INTO documentos 
         (NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Estatus, id_proceso)
         VALUES (?, ?, ?, ?, 'Pendiente', ?)`,
        [req.file.originalname, ruta, IdTipoDoc, estudianteId, id_proceso]
      );

      res.json({ success: true });
    } catch (e) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: "Error al subir documento" });
    }
  }
);

/* ============================
   DOWNLOAD
============================ */
router.get("/download/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const [rows] = await pool.query(
    "SELECT * FROM documentos WHERE id_Documento = ?",
    [id]
  );

  if (!rows.length) return res.sendStatus(404);

  if (user.role !== "admin") {
    const estudianteId = await getEstudianteId(user.id, user.role);
    if (rows[0].id_usuario !== estudianteId) return res.sendStatus(403);
  }

  const filePath = resolveFilePath(rows[0].RutaArchivo);
  res.sendFile(filePath);
});

/* ============================
   ADMIN
============================ */
router.put("/approve/:id", authenticateToken, isAdmin, async (req, res) => {
  await pool.query(
    "UPDATE documentos SET Estatus='Aprobado' WHERE id_Documento=?",
    [req.params.id]
  );
  res.json({ success: true });
});

/* ============================
   DELETE
============================ */
router.delete("/:id", authenticateToken, async (req, res) => {
  const user = req.user;

  const [rows] = await pool.query(
    "SELECT * FROM documentos WHERE id_Documento = ?",
    [req.params.id]
  );

  if (!rows.length) return res.sendStatus(404);

  if (user.role !== "admin") {
    const estudianteId = await getEstudianteId(user.id, user.role);
    if (rows[0].id_usuario !== estudianteId) return res.sendStatus(403);
  }

  const filePath = resolveFilePath(rows[0].RutaArchivo);
  if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await pool.query("DELETE FROM documentos WHERE id_Documento=?", [req.params.id]);
  res.json({ success: true });
});

/* ============================
   LISTADO (🔑 FIX DEFINITIVO)
============================ */
router.get("/", async (req, res) => {
  try {
    // 🔐 autenticación opcional
    await new Promise(resolve => authenticateToken(req, res, resolve));

    if (!req.user) return res.json([]);

    const { id, role } = req.user;
    const admin = role === "admin";

    let query = `
      SELECT d.*, t.Nombre_TipoDoc
      FROM documentos d
      INNER JOIN tipo_documento t ON d.IdTipoDoc = t.IdTipoDoc
    `;
    let params = [];

    if (!admin) {
      const estudianteId = await getEstudianteId(id, role);
      if (!estudianteId) return res.json([]);
      query += " WHERE d.id_usuario = ?";
      params.push(estudianteId);
    }

    query += " ORDER BY d.id_Documento DESC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch {
    res.json([]);
  }
});

export default router;
