import express from "express";
import pool from "../config/config.db.js";
import {
  authenticateToken,
  checkRole,
  validateNumericId
} from "./authMiddleware.js";

const router = express.Router();

/* =========================
   OBTENER TODOS LOS PERIODOS
   ✅ Protegido - requiere autenticación
========================= */
router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      const [results] = await pool.query(`
        SELECT IdPeriodo, Año, FechaInicio, FechaFin, Fase, EstadoActivo
        FROM periodos
        ORDER BY Año DESC, Fase
      `);
      res.json(results);
    } catch (error) {
      console.error('Error al obtener periodos:', error.message);
      res.status(500).json({ error: error.message });
    }
  }
);

/* =========================
   OBTENER PERIODO ACTIVO
   ✅ Protegido
========================= */
router.get(
  "/activo",
  authenticateToken,
  async (req, res) => {
    try {
      const [results] = await pool.query(
        "SELECT * FROM periodos WHERE EstadoActivo = 'Activo' ORDER BY FechaInicio DESC LIMIT 1"
      );
      if (results.length === 0) {
        return res.status(404).json({ error: "No hay un periodo activo actualmente" });
      }
      res.status(200).json(results[0]);
    } catch (error) {
      console.error("Error al obtener el periodo activo:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

/* =========================
   OBTENER UN PERIODO POR ID
   ✅ Protegido
========================= */
router.get(
  "/:IdPeriodo",
  authenticateToken,
  validateNumericId,
  async (req, res) => {
    const { IdPeriodo } = req.params;
    try {
      const [results] = await pool.query(
        "SELECT * FROM periodos WHERE IdPeriodo = ?",
        [IdPeriodo]
      );
      if (results.length === 0) {
        return res.status(404).json({ error: "Periodo no encontrado" });
      }
      res.status(200).json(results[0]);
    } catch (error) {
      console.error("Error al obtener el periodo:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

/* =========================
   CREAR PERIODO
   🔒 Solo admin
========================= */
router.post(
  "/",
  authenticateToken,
  checkRole(["admin"]),
  async (req, res) => {
    const { Año, FechaInicio, FechaFin, EstadoActivo, Fase } = req.body;
    
    if (!Año || !FechaInicio || !FechaFin || EstadoActivo == null || !Fase) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
      const [results] = await pool.query(
        "INSERT INTO periodos (Año, FechaInicio, FechaFin, EstadoActivo, Fase) VALUES (?, ?, ?, ?, ?)",
        [Año, FechaInicio, FechaFin, EstadoActivo, Fase]
      );
      res.status(201).json({ 
        message: "Periodo creado correctamente", 
        IdPeriodo: results.insertId 
      });
    } catch (error) {
      console.error("Error al agregar periodo:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

/* =========================
   ACTUALIZAR PERIODO
   🔒 Solo admin
========================= */
router.put(
  "/:IdPeriodo",
  authenticateToken,
  checkRole(["admin"]),
  validateNumericId,
  async (req, res) => {
    const { IdPeriodo } = req.params;
    const { Año, FechaInicio, FechaFin, EstadoActivo, Fase } = req.body;
    
    if (!Año || !FechaInicio || !FechaFin || EstadoActivo == null || !Fase) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
      const [results] = await pool.query(
        "UPDATE periodos SET Año = ?, FechaInicio = ?, FechaFin = ?, EstadoActivo = ?, Fase = ? WHERE IdPeriodo = ?",
        [Año, FechaInicio, FechaFin, EstadoActivo, Fase, IdPeriodo]
      );
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Periodo no encontrado" });
      }
      res.status(200).json({ message: "Periodo actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar periodo:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

/* =========================
   ELIMINAR PERIODO
   🔒 Solo admin
========================= */
router.delete(
  "/:IdPeriodo",
  authenticateToken,
  checkRole(["admin"]),
  validateNumericId,
  async (req, res) => {
    const { IdPeriodo } = req.params;
    try {
      const [results] = await pool.query(
        "DELETE FROM periodos WHERE IdPeriodo = ?",
        [IdPeriodo]
      );
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Periodo no encontrado" });
      }
      res.status(200).json({ message: "Periodo eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar periodo:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

/* =========================
   CAMBIAR ESTADO DE PERIODO
   🔒 Solo admin
========================= */
router.patch(
  "/:IdPeriodo/estado",
  authenticateToken,
  checkRole(["admin"]),
  validateNumericId,
  async (req, res) => {
    const { IdPeriodo } = req.params;
    const { nuevoEstado } = req.body;

    if (!["Activo", "Inactivo"].includes(nuevoEstado)) {
      return res.status(400).json({ 
        error: "Estado no válido. Debe ser 'Activo' o 'Inactivo'" 
      });
    }

    try {
      const [result] = await pool.query(
        "UPDATE periodos SET EstadoActivo = ? WHERE IdPeriodo = ?",
        [nuevoEstado, IdPeriodo]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Periodo no encontrado" });
      }

      res.status(200).json({ 
        message: `Periodo actualizado a estado '${nuevoEstado}'` 
      });
    } catch (error) {
      console.error("Error al cambiar el estado del periodo:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

export default router;