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

/* =========================
   MULTER CONFIG
========================= */
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

/* =========================
   CATÁLOGOS (PÚBLICOS)
========================= */
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

/* =========================
   SUBIR DOCUMENTO (ESTUDIANTE)
========================= */
router.post(
  "/upload",
  authenticateToken,
  upload.single("archivo"),
  async (req, res) => {
    try {
      const { IdTipoDoc, id_usuario, id_proceso } = req.body;
      const file = req.file;

      if (!IdTipoDoc || !id_usuario || !id_proceso || !file) {
        return res.status(400).json({ error: "Datos incompletos" });
      }

      // 🔐 Solo puede subir documentos propios
      if (req.user.role !== "administrador" && Number(req.user.id) !== Number(id_usuario)) {
        return res.status(403).json({ error: "No autorizado" });
      }

      const nombreArchivo = file.originalname;
      const rutaArchivo = `/uploads/documentos/${file.filename}`;

      const [existing] = await pool.query(
        `SELECT id_Documento, RutaArchivo FROM documentos 
         WHERE id_proceso = ? AND IdTipoDoc = ? AND id_usuario = ?`,
        [id_proceso, IdTipoDoc, id_usuario]
      );

      if (existing.length > 0) {
        const oldPath = path.join(__dirname, "..", "public", existing[0].RutaArchivo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

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
          [nombreArchivo, rutaArchivo, IdTipoDoc, id_usuario, id_proceso]
        );
      }

      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Error al subir documento" });
    }
  }
);

/* =========================
   ACCIONES ADMIN
========================= */
router.put(
  "/approve/:id_Documento",
  authenticateToken,
  checkRole(["administrador"]),
  async (req, res) => {
    const { id_Documento } = req.params;
    const [r] = await pool.query(
      `UPDATE documentos SET Estatus='Aprobado', Comentarios=NULL WHERE id_Documento=?`,
      [id_Documento]
    );
    if (!r.affectedRows) return res.status(404).json({ error: "No encontrado" });
    res.json({ success: true });
  }
);

router.put(
  "/reject/:id_Documento",
  authenticateToken,
  checkRole(["administrador"]),
  async (req, res) => {
    const { id_Documento } = req.params;
    const { comentarios } = req.body;
    if (!comentarios) return res.status(400).json({ error: "Motivo requerido" });

    const [r] = await pool.query(
      `UPDATE documentos SET Estatus='Rechazado', Comentarios=? WHERE id_Documento=?`,
      [comentarios, id_Documento]
    );
    if (!r.affectedRows) return res.status(404).json({ error: "No encontrado" });
    res.json({ success: true });
  }
);

router.put(
  "/revert/:id_Documento",
  authenticateToken,
  checkRole(["administrador"]),
  async (req, res) => {
    const { id_Documento } = req.params;
    const [r] = await pool.query(
      `UPDATE documentos SET Estatus='Pendiente', Comentarios=NULL WHERE id_Documento=?`,
      [id_Documento]
    );
    if (!r.affectedRows) return res.status(404).json({ error: "No encontrado" });
    res.json({ success: true });
  }
);

/* =========================
   DESCARGAR DOCUMENTO
========================= */
router.get("/download/:id_Documento", authenticateToken, async (req, res) => {
  const { id_Documento } = req.params;

  const [doc] = await pool.query(
    `SELECT RutaArchivo, id_usuario FROM documentos WHERE id_Documento=?`,
    [id_Documento]
  );

  if (!doc.length) return res.status(404).json({ error: "No encontrado" });

  if (req.user.role !== "administrador" && Number(req.user.id) !== doc[0].id_usuario) {
    return res.status(403).json({ error: "No autorizado" });
  }

  const filePath = path.join(__dirname, "..", "public", doc[0].RutaArchivo);
  res.sendFile(filePath);
});

/* =========================
   ELIMINAR DOCUMENTO
========================= */
router.delete(
  "/:id_Documento",
  authenticateToken,
  checkRole(["administrador"]),
  async (req, res) => {
    const { id_Documento } = req.params;

    const [doc] = await pool.query(
      `SELECT RutaArchivo FROM documentos WHERE id_Documento=?`,
      [id_Documento]
    );

    if (!doc.length) return res.status(404).json({ error: "No encontrado" });

    const filePath = path.join(__dirname, "..", "public", doc[0].RutaArchivo);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query(`DELETE FROM documentos WHERE id_Documento=?`, [id_Documento]);
    res.json({ success: true });
  }
);

/* =========================
   LISTAR DOCUMENTOS
========================= */
router.get("/", authenticateToken, async (req, res) => {
  let query = `
    SELECT d.*, t.Nombre_TipoDoc
    FROM documentos d
    JOIN tipo_documento t ON d.IdTipoDoc = t.IdTipoDoc
  `;
  const params = [];

  if (req.user.role !== "administrador") {
    query += " WHERE d.id_usuario = ?";
    params.push(req.user.id);
  }

  const [rows] = await pool.query(query, params);
  res.json(rows);
});

export default router;
