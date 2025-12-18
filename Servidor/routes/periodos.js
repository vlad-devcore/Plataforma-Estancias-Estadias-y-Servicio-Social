import express from "express";
import pool from "../config/config.db.js";
import { authenticateToken, checkRole } from "./authMiddleware.js";

const router = express.Router();

/* ============================
   BLOQUEO GLOBAL
============================ */
router.use(authenticateToken);

/* ============================
   CONTROLADORES
============================ */

const getPeriodoActivo = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM periodos
      WHERE EstadoActivo = 'Activo'
      ORDER BY FechaInicio DESC
      LIMIT 1
    `);

    if (!rows.length) {
      return res.status(404).json({ error: "No hay periodo activo" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error periodo activo:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

const getPeriodos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT IdPeriodo, Año, FechaInicio, FechaFin, Fase, EstadoActivo
      FROM periodos
      ORDER BY Año DESC, Fase
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error periodos:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

/* ============================
   RUTAS
============================ */

// ESTUDIANTE
router.get(
  "/",
  checkRole("estudiante"),
  getPeriodoActivo
);

// ADMIN
router.get(
  "/admin",
  checkRole("admin"),
  getPeriodos
);

export default router;
