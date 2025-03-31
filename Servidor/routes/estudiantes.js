import express from "express";
import pool from "../config/config.db.js";

const router = express.Router();

// Obtener todos los estudiantes
const getEstudiantes = async (req, res) => {
    try {
        const [results] = await pool.query("SELECT * FROM estudiantes");
        res.status(200).json(results);
    } catch (error) {
        console.error("Error al obtener estudiantes:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Obtener estudiante por ID
const getEstudianteById = async (req, res) => {
    const { id_estudiante } = req.params;
    try {
        const [results] = await pool.query("SELECT * FROM estudiantes WHERE id_estudiante = ?", [id_estudiante]);
        if (results.length === 0) return res.status(404).json({ error: "Estudiante no encontrado" });
        res.status(200).json(results[0]);
    } catch (error) {
        console.error("Error al obtener el estudiante:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Agregar un nuevo estudiante
const postEstudiante = async (req, res) => {
    const { id_user, matricula } = req.body;
    if (!id_user || !matricula) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const [results] = await pool.query(
            "INSERT INTO estudiantes (id_user, matricula) VALUES (?, ?)",
            [id_user, matricula]
        );
        res.status(201).json({ message: "Estudiante añadido correctamente", id_estudiante: results.insertId });
    } catch (error) {
        console.error("Error al agregar estudiante:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Actualizar estudiante
const updateEstudiante = async (req, res) => {
    const { id_estudiante } = req.params;
    const { id_user, matricula } = req.body;
    if (!id_user || !matricula) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const [results] = await pool.query(
            "UPDATE estudiantes SET id_user = ?, matricula = ? WHERE id_estudiante = ?",
            [id_user, matricula, id_estudiante]
        );
        if (results.affectedRows === 0) return res.status(404).json({ error: "Estudiante no encontrado" });
        res.status(200).json({ message: "Estudiante actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar estudiante:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Eliminar estudiante
const deleteEstudiante = async (req, res) => {
    const { id_estudiante } = req.params;
    try {
        const [results] = await pool.query("DELETE FROM estudiantes WHERE id_estudiante = ?", [id_estudiante]);
        if (results.affectedRows === 0) return res.status(404).json({ error: "Estudiante no encontrado" });
        res.status(200).json({ message: "Estudiante eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar estudiante:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Definir rutas
router.get("/", getEstudiantes);
router.get("/:id_estudiante", getEstudianteById);
router.post("/", postEstudiante);
router.put("/:id_estudiante", updateEstudiante);
router.delete("/:id_estudiante", deleteEstudiante);

export default router;