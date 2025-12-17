// routes/empresas.js
import express from "express";
import pool from "../config/config.db.js";
import { parse } from "csv-parse";
import multer from "multer";
import iconv from "iconv-lite";
import { Readable } from "stream";
import {
  authenticateToken,
  adminOnly,
  adminOrCoordinator,
  validateNumericId
} from "./authMiddleware.js";

const router = express.Router();

/* =========================
   CONFIGURACIÓN MULTER
========================= */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname?.toLowerCase().endsWith(".csv")) {
      return cb(new Error("Solo se permiten archivos CSV"));
    }
    cb(null, true);
  },
});

/* =========================
   VALIDACIONES
========================= */
const tamanosPermitidos = ["Grande", "Mediana", "Pequeña"];
const sociedadesPermitidas = ["Privada", "Pública"];

const isValidEmail = (email) => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const normalizeText = (text) => {
  if (!text) return null;
  return String(text)
    .replace(/[\x00-\x1F\x7F-\x9F\u200B-\u200F\uFEFF]/g, "")
    .trim();
};

/* =========================
   RFC AUTOMÁTICO
========================= */
const generateRFC = async (nombre) => {
  const prefix = normalizeText(nombre)
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3)
    .padEnd(3, "X");

  const [[{ next_id }]] = await pool.query(
    "SELECT AUTO_INCREMENT AS next_id FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'empresa'"
  );

  return `${prefix}${String(next_id || 1).padStart(5, "0")}`;
};

/* =========================
   RUTAS
========================= */

// Obtener empresas
router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    const [results] = await pool.query("SELECT * FROM empresa");
    res.json(results);
  }
);

// Obtener empresa por ID
router.get(
  "/:id_empresa",
  authenticateToken,
  validateNumericId,
  async (req, res) => {
    const [results] = await pool.query(
      "SELECT * FROM empresa WHERE id_empresa = ?",
      [req.params.id_empresa]
    );

    if (!results.length) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    res.json(results[0]);
  }
);

// Crear empresa
router.post(
  "/",
  authenticateToken,
  adminOrCoordinator,
  async (req, res) => {
    const {
      empresa_nombre,
      empresa_direccion,
      empresa_email,
      empresa_telefono,
      empresa_tamano,
      empresa_sociedad,
      empresa_pagina_web
    } = req.body;

    if (!empresa_nombre || !empresa_tamano || !empresa_sociedad) {
      return res.status(400).json({ error: "Campos obligatorios faltantes" });
    }

    if (!tamanosPermitidos.includes(empresa_tamano)) {
      return res.status(400).json({ error: "Tamaño no válido" });
    }

    if (!sociedadesPermitidas.includes(empresa_sociedad)) {
      return res.status(400).json({ error: "Sociedad no válida" });
    }

    if (!isValidEmail(empresa_email)) {
      return res.status(400).json({ error: "Email no válido" });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [exists] = await connection.query(
        "SELECT id_empresa FROM empresa WHERE empresa_nombre = ?",
        [empresa_nombre]
      );
      if (exists.length) {
        throw new Error("Empresa ya existente");
      }

      const empresa_rfc = await generateRFC(empresa_nombre);

      const [result] = await connection.query(
        `INSERT INTO empresa 
        (empresa_rfc, empresa_nombre, empresa_direccion, empresa_email, empresa_telefono, empresa_tamano, empresa_sociedad, empresa_pagina_web)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          empresa_rfc,
          empresa_nombre,
          empresa_direccion || null,
          empresa_email || null,
          empresa_telefono || null,
          empresa_tamano,
          empresa_sociedad,
          empresa_pagina_web || null
        ]
      );

      await connection.commit();
      res.status(201).json({ id_empresa: result.insertId });
    } catch (error) {
      await connection.rollback();
      res.status(400).json({ error: error.message });
    } finally {
      connection.release();
    }
  }
);

// Actualizar empresa
router.put(
  "/:id_empresa",
  authenticateToken,
  adminOrCoordinator,
  validateNumericId,
  async (req, res) => {
    const [result] = await pool.query(
      "UPDATE empresa SET ? WHERE id_empresa = ?",
      [req.body, req.params.id_empresa]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    res.json({ success: true });
  }
);

// Eliminar empresa
router.delete(
  "/:id_empresa",
  authenticateToken,
  adminOnly,
  validateNumericId,
  async (req, res) => {
    const [result] = await pool.query(
      "DELETE FROM empresa WHERE id_empresa = ?",
      [req.params.id_empresa]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    res.json({ success: true });
  }
);

// Importar CSV
router.post(
  "/upload",
  authenticateToken,
  adminOnly,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Archivo CSV requerido" });
    }

    const decoded = iconv.decode(req.file.buffer, "utf8");
    const stream = Readable.from(decoded);

    const records = [];
    stream.pipe(parse({ columns: true, trim: true }))
      .on("data", (row) => records.push(row))
      .on("end", async () => {
        let inserted = 0;

        for (const row of records) {
          if (!row.empresa_nombre) continue;

          const rfc = await generateRFC(row.empresa_nombre);
          await pool.query(
            "INSERT IGNORE INTO empresa (empresa_rfc, empresa_nombre) VALUES (?, ?)",
            [rfc, row.empresa_nombre]
          );
          inserted++;
        }

        res.json({ inserted });
      });
  }
);

export default router;
