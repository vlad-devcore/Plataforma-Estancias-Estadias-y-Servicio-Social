import express from "express";
import pool from "../config/config.db.js";

const router = express.Router();

// Obtener todos los periodos
const getPeriodos = async (req, res) => {
    try {
        const [results] = await pool.query("SELECT * FROM periodos ORDER BY Año DESC, FechaInicio DESC");
        res.status(200).json(results);
    } catch (error) {
        console.error("Error al obtener periodos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Obtener un periodo por ID
const getPeriodoById = async (req, res) => {
    const { IdPeriodo } = req.params;
    try {
        const [results] = await pool.query("SELECT * FROM periodos WHERE IdPeriodo = ?", [IdPeriodo]);
        if (results.length === 0) return res.status(404).json({ error: "Periodo no encontrado" });
        res.status(200).json(results[0]);
    } catch (error) {
        console.error("Error al obtener el periodo:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Agregar un nuevo periodo
const postPeriodo = async (req, res) => {
    const { Año, FechaInicio, FechaFin, EstadoActivo, Fase } = req.body;
    if (!Año || !FechaInicio || !FechaFin || EstadoActivo == null || !Fase) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const [results] = await pool.query(
            "INSERT INTO periodos (Año, FechaInicio, FechaFin, EstadoActivo, Fase) VALUES (?, ?, ?, ?, ?)",
            [Año, FechaInicio, FechaFin, EstadoActivo, Fase]
        );
        res.status(201).json({ message: "Periodo creado correctamente", IdPeriodo: results.insertId });
    } catch (error) {
        console.error("Error al agregar periodo:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Actualizar un periodo
const updatePeriodo = async (req, res) => {
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
        if (results.affectedRows === 0) return res.status(404).json({ error: "Periodo no encontrado" });
        res.status(200).json({ message: "Periodo actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar periodo:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Eliminar un periodo
const deletePeriodo = async (req, res) => {
    const { IdPeriodo } = req.params;
    try {
        const [results] = await pool.query("DELETE FROM periodos WHERE IdPeriodo = ?", [IdPeriodo]);
        if (results.affectedRows === 0) return res.status(404).json({ error: "Periodo no encontrado" });
        res.status(200).json({ message: "Periodo eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar periodo:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};



// Obtener el periodo activo
const getPeriodoActivo = async (req, res) => {
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
};


// Cambiar estado manualmente de un periodo (por el admin)
const cambiarEstadoPeriodo = async (req, res) => {
    const { IdPeriodo } = req.params;
    const { nuevoEstado } = req.body;

    if (!["Activo", "Inactivo"].includes(nuevoEstado)) {
        return res.status(400).json({ error: "Estado no válido. Debe ser 'Activo' o 'Inactivo'" });
    }

    try {
        const [result] = await pool.query(
            "UPDATE periodos SET EstadoActivo = ? WHERE IdPeriodo = ?",
            [nuevoEstado, IdPeriodo]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Periodo no encontrado" });
        }

        res.status(200).json({ message: `Periodo actualizado a estado '${nuevoEstado}'` });
    } catch (error) {
        console.error("Error al cambiar el estado del periodo:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};


// Rutas
router.get("/", getPeriodos);
router.get("/activo", getPeriodoActivo);
router.get("/:IdPeriodo", getPeriodoById);
router.post("/", postPeriodo);
router.put("/:IdPeriodo", updatePeriodo);
router.delete("/:IdPeriodo", deletePeriodo);
router.patch("/:IdPeriodo/estado", cambiarEstadoPeriodo);


export default router; 