import express from "express";
import pool from "../config/config.db.js";

import {
  authenticateToken,
  checkRole,
  validateNumericId
} from "./authMiddleware.js";

const router = express.Router();

/* =========================
   LISTAR ESTUDIANTES
========================= */
router.get(
  "/",
  authenticateToken,
  checkRole(["admin", "coordinador"]),
  async (req, res) => {
    try {
      const [results] = await pool.query(
        "SELECT id_estudiante, id_user, matricula FROM estudiantes"
      );
      res.json(results);
    } catch {
      res.status(500).json({ error: "Error al obtener estudiantes" });
    }
  }
);

/* =========================
   OBTENER ESTUDIANTE POR ID
========================= */
router.get(
  "/:id_estudiante",
  authenticateToken,
  checkRole(["admin", "coordinador"]),
  validateNumericId,
  async (req, res) => {
    const { id_estudiante } = req.params;

    const [results] = await pool.query(
      "SELECT id_estudiante, id_user, matricula FROM estudiantes WHERE id_estudiante = ?",
      [id_estudiante]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }

    res.json(results[0]);
  }
);

/* =========================
   OBTENER ESTUDIANTE PROPIO
========================= */
router.get(
  "/me/profile",
  authenticateToken,
  checkRole(["estudiante"]),
  async (req, res) => {
    const id_user = req.user.id;

    const [[estudiante]] = await pool.query(
      "SELECT id_estudiante, matricula FROM estudiantes WHERE id_user = ?",
      [id_user]
    );

    if (!estudiante) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }

    const [[proceso]] = await pool.query(
      `SELECT id_programa 
       FROM proceso 
       WHERE id_estudiante = ?
       ORDER BY id_proceso DESC
       LIMIT 1`,
      [estudiante.id_estudiante]
    );

    res.json({
      ...estudiante,
      id_programa: proceso?.id_programa || null
    });
  }
);

/* =========================
   CREAR ESTUDIANTE
========================= */
router.post(
  "/",
  authenticateToken,
  checkRole(["admin"]),
  async (req, res) => {
    const { id_user, matricula } = req.body;

    if (!id_user || !matricula) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
      const [result] = await pool.query(
        "INSERT INTO estudiantes (id_user, matricula) VALUES (?, ?)",
        [id_user, matricula]
      );

      res.status(201).json({
        success: true,
        id_estudiante: result.insertId
      });
    } catch {
      res.status(500).json({ error: "Error al crear estudiante" });
    }
  }
);

/* =========================
   ACTUALIZAR ESTUDIANTE
========================= */
router.put(
  "/:id_estudiante",
  authenticateToken,
  checkRole(["admin"]),
  validateNumericId,
  async (req, res) => {
    const { id_estudiante } = req.params;
    const { matricula } = req.body;

    if (!matricula) {
      return res.status(400).json({ error: "Matrícula requerida" });
    }

    const [result] = await pool.query(
      "UPDATE estudiantes SET matricula = ? WHERE id_estudiante = ?",
      [matricula, id_estudiante]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }

    res.json({ success: true });
  }
);

/* =========================
   ELIMINAR ESTUDIANTE
========================= */
router.delete(
  "/:id_estudiante",
  authenticateToken,
  checkRole(["admin"]),
  validateNumericId,
  async (req, res) => {
    const { id_estudiante } = req.params;

    const [result] = await pool.query(
      "DELETE FROM estudiantes WHERE id_estudiante = ?",
      [id_estudiante]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }

    res.json({ success: true });
  }
);

export default router;
