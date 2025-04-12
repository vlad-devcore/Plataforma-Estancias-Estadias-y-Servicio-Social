import express from "express";
import pool from "../config/config.db.js";

const router = express.Router();

// Obtener asesores académicos
const getAsesoresAcademicos = async (req, res) => {
    try {
        const [results] = await pool.query(`
            SELECT 
                aa.id_asesor,
                u.id_user,
                u.nombre,
                u.apellido_paterno,
                u.apellido_materno,
                u.email
            FROM asesores_academicos aa
            JOIN users u ON aa.id_user = u.id_user
            WHERE u.role = 'asesor_academico'
        `);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error al obtener asesores académicos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Obtener asesores empresariales
const getAsesoresEmpresariales = async (req, res) => {
    try {
        const [results] = await pool.query(`
            SELECT 
                ae.id_asesor_emp,
                u.id_user,
                u.nombre,
                u.apellido_paterno,
                u.apellido_materno,
                u.email
            FROM asesores_empresariales ae
            JOIN users u ON ae.id_user = u.id_user
            WHERE u.role = 'asesor_empresarial'
        `);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error al obtener asesores empresariales:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

router.get("/academicos", getAsesoresAcademicos);
router.get("/empresariales", getAsesoresEmpresariales);

export default router;
