import express from "express";
import pool from "../config/config.db.js";
import { authenticateToken, checkRole } from "./authMiddleware.js";

const router = express.Router();

/* ============================
   CONTROLADORES
============================ */

// ADMIN: todos los periodos
const getPeriodos = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT IdPeriodo, Año, FechaInicio, FechaFin, Fase, EstadoActivo
      FROM periodos
      ORDER BY Año DESC, Fase
    `);
    res.json(results);
  } catch (error) {
    console.error("Error al obtener periodos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ADMIN: periodo por ID
const getPeriodoById = async (req, res) => {
  try {
    const { IdPeriodo } = req.params;
    const [results] = await pool.query(
      "SELECT * FROM periodos WHERE IdPeriodo = ?",
      [IdPeriodo]
    );

    if (!results.length) {
      return res.status(404).json({ error: "Periodo no encontrado" });
    }

    res.json(results[0]);
  } catch (error) {
    console.error("Error al obtener periodo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ESTUDIANTE / GENERAL: periodo activo
const getPeriodoActivo = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT *
      FROM periodos
      WHERE EstadoActivo = 'Activo'
      ORDER BY FechaInicio DESC
      LIMIT 1
    `);

    if (!results.length) {
      return res.status(404).json({ error: "No hay periodo activo" });
    }

    res.json(results[0]);
  } catch (error) {
    console.error("Error al obtener periodo activo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ADMIN: crear
const postPeriodo = async (req, res) => {
  const { Año, FechaInicio, FechaFin, EstadoActivo, Fase } = req.body;

  if (!Año || !FechaInicio || !FechaFin || EstadoActivo == null || !Fase) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO periodos (Año, FechaInicio, FechaFin, EstadoActivo, Fase)
       VALUES (?, ?, ?, ?, ?)`,
      [Año, FechaInicio, FechaFin, EstadoActivo, Fase]
    );

    res.status(201).json({
      message: "Periodo creado correctamente",
      IdPeriodo: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear periodo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ADMIN: actualizar
const updatePeriodo = async (req, res) => {
  const { IdPeriodo } = req.params;
  const { Año, FechaInicio, FechaFin, EstadoActivo, Fase } = req.body;

  if (!Año || !FechaInicio || !FechaFin || EstadoActivo == null || !Fase) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const [result] = await pool.query(
      `UPDATE periodos
       SET Año = ?, FechaInicio = ?, FechaFin = ?, EstadoActivo = ?, Fase = ?
       WHERE IdPeriodo = ?`,
      [Año, FechaInicio, FechaFin, EstadoActivo, Fase, IdPeriodo]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Periodo no encontrado" });
    }

    res.json({ message: "Periodo actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar periodo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ADMIN: eliminar
const deletePeriodo = async (req, res) => {
  try {
    const { IdPeriodo } = req.params;
    const [result] = await pool.query(
      "DELETE FROM periodos WHERE IdPeriodo = ?",
      [IdPeriodo]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Periodo no encontrado" });
    }

    res.json({ message: "Periodo eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar periodo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ADMIN: cambiar estado
const cambiarEstadoPeriodo = async (req, res) => {
  const { IdPeriodo } = req.params;
  const { nuevoEstado } = req.body;

  if (!["Activo", "Inactivo"].includes(nuevoEstado)) {
    return res.status(400).json({ error: "Estado no válido" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE periodos SET EstadoActivo = ? WHERE IdPeriodo = ?",
      [nuevoEstado, IdPeriodo]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Periodo no encontrado" });
    }

    res.json({ message: `Periodo actualizado a ${nuevoEstado}` });
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* ============================
   RUTAS
============================ */

// ESTUDIANTE
router.get(
  "/",
  authenticateToken,
  checkRole("estudiante"),
  getPeriodoActivo
);

// ADMIN
router.get(
  "/admin",
  authenticateToken,
  checkRole("admin"),
  getPeriodos
);

router.get(
  "/:IdPeriodo",
  authenticateToken,
  checkRole("admin"),
  getPeriodoById
);

router.post(
  "/",
  authenticateToken,
  checkRole("admin"),
  postPeriodo
);

router.put(
  "/:IdPeriodo",
  authenticateToken,
  checkRole("admin"),
  updatePeriodo
);

router.delete(
  "/:IdPeriodo",
  authenticateToken,
  checkRole("admin"),
  deletePeriodo
);

router.patch(
  "/:IdPeriodo/estado",
  authenticateToken,
  checkRole("admin"),
  cambiarEstadoPeriodo
);

export default router;
