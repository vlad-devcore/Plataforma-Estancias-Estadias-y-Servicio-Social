import express from "express";
import pool from "../config/config.db.js";

const router = express.Router();

// Crear un nuevo proceso (usando id_user → obtener id_estudiante)
router.post("/", async (req, res) => {
  const {
    id_user,
    id_empresa,
    id_asesor_academico,
    id_asesor_empresarial,
    id_programa,
    tipo_proceso,
    id_periodo
  } = req.body;

  if (!id_user || !id_empresa || !id_asesor_academico || !id_asesor_empresarial || !id_programa || !tipo_proceso || !id_periodo) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    // Obtener el id_estudiante a partir del id_user
    const [rows] = await pool.query(
      "SELECT id_estudiante FROM estudiantes WHERE id_user = ?",
      [id_user]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "No se encontró un estudiante con ese usuario" });
    }

    const id_estudiante = rows[0].id_estudiante;

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

// Obtener procesos usando el id_user
router.get("/por-usuario/:id_user", async (req, res) => {
    const { id_user } = req.params;
  
    try {
      const [estudianteRows] = await pool.query(
        "SELECT id_estudiante FROM estudiantes WHERE id_user = ?",
        [id_user]
      );
  
      if (estudianteRows.length === 0) {
        return res.status(404).json({ error: "Estudiante no encontrado" });
      }
  
      const id_estudiante = estudianteRows[0].id_estudiante;
  
      const [procesos] = await pool.query(
        "SELECT * FROM proceso WHERE id_estudiante = ?",
        [id_estudiante]
      );
  
      res.status(200).json(procesos);
    } catch (error) {
      console.error("Error al obtener procesos por usuario:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  


// Validar si ya existe un proceso por usuario y periodo
router.get("/validar/:id_user/:id_periodo", async (req, res) => {
    const { id_user, id_periodo } = req.params;
  
    try {
      // Buscar id del estudiante
      const [rows] = await pool.query("SELECT id_estudiante FROM estudiantes WHERE id_user = ?", [id_user]);
      if (rows.length === 0) return res.status(404).json({ error: "Estudiante no encontrado" });
  
      const id_estudiante = rows[0].id_estudiante;
  
      // Buscar si ya hay proceso para ese periodo
      const [proceso] = await pool.query(
        "SELECT * FROM proceso WHERE id_estudiante = ? AND id_periodo = ?",
        [id_estudiante, id_periodo]
      );
  
      if (proceso.length > 0) {
        return res.json({ registrado: true, proceso: proceso[0] });
      } else {
        return res.json({ registrado: false });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
export default router;
