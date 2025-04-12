import express from "express";
import pool from "../config/config.db.js";

const router = express.Router();

// Crear un nuevo proceso
router.post("/", async (req, res) => {
    const {
        id_estudiante,
        id_empresa,
        id_asesor_academico,
        id_asesor_empresarial,
        id_programa,
        tipo_proceso,
        id_periodo
    } = req.body;

    if (!id_estudiante || !id_empresa || !id_asesor_academico || !id_asesor_empresarial || !id_programa || !tipo_proceso || !id_periodo) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO proceso (id_estudiante, id_empresa, id_asesor_academico, id_asesor_empresarial, id_programa, tipo_proceso, id_periodo)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id_estudiante, id_empresa, id_asesor_academico, id_asesor_empresarial, id_programa, tipo_proceso, id_periodo]
        );
        res.status(201).json({ message: "Proceso creado correctamente", id_proceso: result.insertId });
    } catch (error) {
        console.error("Error al registrar proceso:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Obtener proceso por id_estudiante y periodo
router.get("/estudiante/:id_estudiante/periodo/:id_periodo", async (req, res) => {
    const { id_estudiante, id_periodo } = req.params;
    try {
        const [results] = await pool.query(
            `SELECT * FROM proceso WHERE id_estudiante = ? AND id_periodo = ?`,
            [id_estudiante, id_periodo]
        );
        if (results.length === 0) return res.status(404).json({ error: "Proceso no encontrado" });
        res.status(200).json(results[0]);
    } catch (error) {
        console.error("Error al obtener proceso:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router;
