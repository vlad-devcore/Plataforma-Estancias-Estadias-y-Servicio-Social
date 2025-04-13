import express from "express";
import pool from "../config/config.db.js";

const router = express.Router();

// Obtener todos los programas educativos
router.get("/", async (req, res) => {
    try {
        const [results] = await pool.query("SELECT * FROM programa_educativo");
        res.status(200).json(results);
    } catch (error) {
        console.error("Error al obtener programas:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router;
