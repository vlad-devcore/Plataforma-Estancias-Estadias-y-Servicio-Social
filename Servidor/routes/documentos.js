import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// =======================
// CONFIGURACIÓN DE MULTER
// =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "public", "uploads", "documentos");
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

// =======================
// UTILIDAD: resolver ruta real
// =======================
const resolveFilePath = (rutaArchivo) => {
  const posiblesRutas = [
    path.join(__dirname, "..", "public", rutaArchivo),
    path.join(__dirname, "..", "public", rutaArchivo.replace("/uploads/", "/Uploads/")),
  ];
  return posiblesRutas.find(p => fs.existsSync(p));
};

// =======================
// CATÁLOGOS
// =======================
router.get("/tipo_documento", async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT IdTipoDoc, Nombre_TipoDoc FROM tipo_documento ORDER BY Nombre_TipoDoc`
    );
    res.json(results);
  } catch {
    res.status(500).json({ error: "Error al obtener tipos de documentos" });
  }
});

router.get("/programas_educativos", async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT DISTINCT nombre FROM programa_educativo WHERE nombre IS NOT NULL ORDER BY nombre`
    );
    res.json(results.map(r => r.nombre));
  } catch {
    res.status(500).json({ error: "Error al obtener programas educativos" });
  }
});

router.get("/periodos", async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT IdPeriodo, Año, Fase FROM periodos ORDER BY Año DESC, Fase`
    );
    res.json(results);
  } catch {
    res.status(500).json({ error: "Error al obtener periodos" });
  }
});

// =======================
// SUBIR / ACTUALIZAR
// =======================
router.post("/upload", upload.single("archivo"), async (req, res) => {
  try {
    const { IdTipoDoc, id_usuario, id_proceso } = req.body;
    const file = req.file;

    if (!IdTipoDoc || !id_usuario || !id_proceso || !file) {
      return res.status(400).json({ error: "Faltan campos obligatorios o archivo" });
    }

    const nombreArchivo = decodeURIComponent(escape(file.originalname));
    const rutaArchivo = `/uploads/documentos/${file.filename}`;

    const [existing] = await pool.query(
      `SELECT id_Documento, RutaArchivo FROM documentos
       WHERE id_proceso = ? AND IdTipoDoc = ? AND id_usuario = ?`,
      [id_proceso, IdTipoDoc, id_usuario]
    );

    if (existing.length > 0) {
      const oldPath = resolveFilePath(existing[0].RutaArchivo);
      if (oldPath) fs.unlinkSync(oldPath);

      await pool.query(
        `UPDATE documentos
         SET NombreArchivo = ?, RutaArchivo = ?, Estatus = 'Pendiente', Comentarios = NULL
         WHERE id_Documento = ?`,
        [nombreArchivo, rutaArchivo, existing[0].id_Documento]
      );
    } else {
      await pool.query(
        `INSERT INTO documentos
         (NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Estatus, id_proceso)
         VALUES (?, ?, ?, ?, 'Pendiente', ?)`,
        [nombreArchivo, rutaArchivo, IdTipoDoc, id_usuario, id_proceso]
      );
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Error al subir documento" });
  }
});

// =======================
// APROBAR / RECHAZAR
// =======================
router.put("/approve/:id_Documento", async (req, res) => {
  const [r] = await pool.query(
    `UPDATE documentos SET Estatus='Aprobado', Comentarios=NULL WHERE id_Documento=?`,
    [req.params.id_Documento]
  );
  r.affectedRows ? res.json({ success: true }) : res.sendStatus(404);
});

router.put("/reject/:id_Documento", async (req, res) => {
  if (!req.body.comentarios) return res.sendStatus(400);
  const [r] = await pool.query(
    `UPDATE documentos SET Estatus='Rechazado', Comentarios=? WHERE id_Documento=?`,
    [req.body.comentarios, req.params.id_Documento]
  );
  r.affectedRows ? res.json({ success: true }) : res.sendStatus(404);
});

// =======================
// DESCARGAR (PARCHE CLAVE)
// =======================
router.get("/download/:id_Documento", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT NombreArchivo, RutaArchivo FROM documentos WHERE id_Documento=?`,
      [req.params.id_Documento]
    );

    if (!rows.length) return res.sendStatus(404);

    const filePath = resolveFilePath(rows[0].RutaArchivo);
    if (!filePath) return res.sendStatus(404);

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(rows[0].NombreArchivo)}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    fs.createReadStream(filePath).pipe(res);
  } catch {
    res.status(500).json({ error: "Error al descargar documento" });
  }
});

// =======================
// ELIMINAR
// =======================
router.delete("/:id_Documento", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT RutaArchivo FROM documentos WHERE id_Documento=?`,
    [req.params.id_Documento]
  );
  if (!rows.length) return res.sendStatus(404);

  const filePath = resolveFilePath(rows[0].RutaArchivo);
  if (filePath) fs.unlinkSync(filePath);

  await pool.query(`DELETE FROM documentos WHERE id_Documento=?`, [req.params.id_Documento]);
  res.json({ success: true });
});

// =======================
// LISTADO
// =======================
router.get("/", async (req, res) => {
  const [results] = await pool.query(`SELECT * FROM documentos`);
  res.json(results);
});

export default router;
