import express from "express";
import pool from "../config/config.db.js";
import { authenticateToken, requireAdmin } from "../routes/authMiddleware.js";

const router = express.Router();

// 👀 VISUALIZAR - Estudiante y Admin
const getPeriodos = async (req, res) => {
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
};

// 👀 VISUALIZAR - Estudiante y Admin
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

// 👀 VISUALIZAR PERIODO ACTIVO - Estudiante y Admin
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

// 🔐 SOLO ADMIN - Crear periodo
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

// 🔐 SOLO ADMIN - Actualizar periodo
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

// 🔐 SOLO ADMIN - Eliminar periodo con opción de forzado
const deletePeriodo = async (req, res) => {
    const { IdPeriodo } = req.params;
    const force = req.query.force === "true";
    
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 🛡️ Verificar si tiene procesos asociados
        const [procesos] = await connection.query(
            "SELECT COUNT(*) as count FROM proceso WHERE id_periodo = ?", 
            [IdPeriodo]
        );

        const procesosCount = procesos[0].count;

        // Si tiene procesos y NO es forzado, avisar al usuario
        if (procesosCount > 0 && !force) {
            await connection.rollback();
            return res.status(400).json({ 
                error: `No se puede eliminar el periodo porque tiene ${procesosCount} proceso(s) asociado(s).`,
                canForceDelete: true,
                procesosCount: procesosCount
            });
        }

        // 🔥 Si es forzado, eliminar en cascada
        if (force && procesosCount > 0) {
            // Primero eliminar documentos asociados a los procesos
            await connection.query(
                "DELETE FROM documentos WHERE id_proceso IN (SELECT id_proceso FROM proceso WHERE id_periodo = ?)",
                [IdPeriodo]
            );

            // Luego eliminar los procesos
            await connection.query(
                "DELETE FROM proceso WHERE id_periodo = ?",
                [IdPeriodo]
            );
        }

        // Finalmente eliminar el periodo
        const [results] = await connection.query(
            "DELETE FROM periodos WHERE IdPeriodo = ?", 
            [IdPeriodo]
        );
        
        if (results.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Periodo no encontrado" });
        }

        await connection.commit();
        
        res.status(200).json({ 
            message: force 
                ? `Periodo y ${procesosCount} proceso(s) eliminados correctamente`
                : "Periodo eliminado correctamente"
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error al eliminar periodo:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    } finally {
        connection.release();
    }
};

// 🔐 SOLO ADMIN - Cambiar estado del periodo
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

// 🔒 RUTAS CON AUTENTICACIÓN Y AUTORIZACIÓN
router.get("/", authenticateToken, getPeriodos);
router.get("/activo", authenticateToken, getPeriodoActivo);
router.get("/:IdPeriodo", authenticateToken, getPeriodoById);
router.post("/", authenticateToken, requireAdmin, postPeriodo);
router.put("/:IdPeriodo", authenticateToken, requireAdmin, updatePeriodo);
router.delete("/:IdPeriodo", authenticateToken, requireAdmin, deletePeriodo);
router.patch("/:IdPeriodo/estado", authenticateToken, requireAdmin, cambiarEstadoPeriodo);

export default router;