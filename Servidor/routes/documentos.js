import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";
import { fileURLToPath } from "url";
import { authenticateToken } from "./authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/* ===================== HELPERS ===================== */
const resolverRutaArchivo = (rutaBD) => {
  if (!rutaBD) return null;
  const rutaRelativa = rutaBD.replace(/^\//, "");

  const intentos = [
    path.join(__dirname, "..", "public", rutaRelativa.replace(/^uploads\//, "Uploads/")),
    path.join(__dirname, "..", "public", rutaRelativa),
  ];

  for (const ruta of intentos) {
    if (fs.existsSync(ruta)) return ruta;
  }
  return null;
};

/* ===================== MULTER ===================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "public/Uploads/documentos";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

/* ===================== CATÁLOGOS ===================== */
router.get("/tipo_documento", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT IdTipoDoc, Nombre_TipoDoc FROM tipo_documento ORDER BY Nombre_TipoDoc"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener tipos de documentos" });
  }
});

router.get("/programas_educativos",  async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DISTINCT nombre FROM programa_educativo WHERE nombre IS NOT NULL ORDER BY nombre"
    );
    res.json(rows.map(r => r.nombre));
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ error: "Error al obtener periodos" });
  }
});

/* ===================== SUBIR DOCUMENTO ===================== */
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

      if (req.user.role !== "administrador" && req.user.id !== Number(id_usuario)) {
        return res.status(403).json({ error: "Acceso denegado" });
      }

      const nombreArchivo = decodeURIComponent(escape(file.originalname));
      const rutaArchivo = `/Uploads/documentos/${file.filename}`;

      const [existente] = await pool.query(
        `SELECT id_Documento, RutaArchivo 
         FROM documentos 
         WHERE id_proceso = ? AND IdTipoDoc = ? AND id_usuario = ?`,
        [id_proceso, IdTipoDoc, id_usuario]
      );

      if (existente.length > 0) {
        const oldPath = resolverRutaArchivo(existente[0].RutaArchivo);
        if (oldPath) fs.unlinkSync(oldPath);

        await pool.query(
          `UPDATE documentos
           SET NombreArchivo = ?, RutaArchivo = ?, Estatus = 'Pendiente', Comentarios = NULL
           WHERE id_Documento = ?`,
          [nombreArchivo, rutaArchivo, existente[0].id_Documento]
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
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al subir documento" });
    }
  }
);

/* ===================== DESCARGAR ===================== */
router.get("/download/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT NombreArchivo, RutaArchivo, id_usuario FROM documentos WHERE id_Documento = ?",
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: "Documento no encontrado" });

    const doc = rows[0];

    if (req.user.role !== "administrador" && doc.id_usuario !== req.user.id) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const filePath = resolverRutaArchivo(doc.RutaArchivo);
    if (!filePath) return res.status(404).json({ error: "Archivo no encontrado" });

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(doc.NombreArchivo)}"`
    );

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al descargar documento" });
  }
});

/* ===================== ELIMINAR ===================== */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT RutaArchivo, id_usuario FROM documentos WHERE id_Documento = ?",
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: "Documento no encontrado" });

    if (req.user.role !== "administrador" && rows[0].id_usuario !== req.user.id) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const filePath = resolverRutaArchivo(rows[0].RutaArchivo);
    if (filePath) fs.unlinkSync(filePath);

    await pool.query("DELETE FROM documentos WHERE id_Documento = ?", [id]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar documento" });
  }
});

/* ===================== LISTADO ===================== */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { estatus, idPeriodo, id_proceso, idTipoDoc, programaEducativo } = req.query;

    let query = `
      SELECT d.*, t.Nombre_TipoDoc, pe.nombre AS ProgramaEducativo
      FROM documentos d
      JOIN proceso p ON d.id_proceso = p.id_proceso
      JOIN tipo_documento t ON d.IdTipoDoc = t.IdTipoDoc
      JOIN periodos per ON p.id_periodo = per.IdPeriodo
      JOIN programa_educativo pe ON p.id_programa = pe.id_programa
    `;

    const conditions = [];
    const params = [];

    if (req.user.role !== "administrador") {
      conditions.push("d.id_usuario = ?");
      params.push(req.user.id);
    }

    if (estatus) { conditions.push("d.Estatus = ?"); params.push(estatus); }
    if (idPeriodo) { conditions.push("per.IdPeriodo = ?"); params.push(idPeriodo); }
    if (id_proceso) { conditions.push("d.id_proceso = ?"); params.push(id_proceso); }
    if (idTipoDoc) { conditions.push("d.IdTipoDoc = ?"); params.push(idTipoDoc); }
    if (programaEducativo) { conditions.push("pe.nombre = ?"); params.push(programaEducativo); }

    if (conditions.length) query += " WHERE " + conditions.join(" AND ");

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener documentos" });
  }
});

export default router;
