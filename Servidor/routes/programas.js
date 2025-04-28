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

// Obtener tipos de proceso permitidos por programa
router.get("/:id_programa/procesos", async (req, res) => {
  const { id_programa } = req.params;
  try {
    const [results] = await pool.query(
      "SELECT tipo_proceso FROM programa_proceso WHERE id_programa = ?",
      [id_programa]
    );
    res.status(200).json(results.map((row) => row.tipo_proceso));
  } catch (error) {
    console.error("Error al obtener procesos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;