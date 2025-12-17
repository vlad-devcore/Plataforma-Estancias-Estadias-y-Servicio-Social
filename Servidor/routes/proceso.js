import express from "express";
import pool from "../config/config.db.js";
import ExcelJS from "exceljs";

import {
  authenticateToken,
  checkRole,
  validateNumericId
} from "./authMiddleware.js";

const router = express.Router();

/* =========================
   OBTENER PERIODOS (NUEVA RUTA)
========================= */
router.get(
  "/periodos",
  authenticateToken,
  async (req, res) => {
    try {
      const [periodos] = await pool.query(
        `SELECT 
          IdPeriodo,
          Año,
          Fase,
          CONCAT(Año, ' ', Fase) AS periodo_completo,
          Activo
         FROM periodos
         ORDER BY Año DESC, Fase DESC`
      );

      res.json(periodos);
    } catch (error) {
      console.error("Error al obtener periodos:", error);
      res.status(500).json({ error: "Error al obtener periodos" });
    }
  }
);

/* =========================
   CREAR PROCESO COMPLETO
========================= */
router.post(
  "/",
  authenticateToken,
  checkRole(["estudiante"]),
  async (req, res) => {
    const {
      id_empresa,
      id_asesor_academico,
      id_programa,
      tipo_proceso,
      id_periodo
    } = req.body;

    const id_user = req.user.id;

    if (!id_empresa || !id_asesor_academico || !id_programa || !tipo_proceso || !id_periodo) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
      const [[estudiante]] = await pool.query(
        "SELECT id_estudiante FROM estudiantes WHERE id_user = ?",
        [id_user]
      );

      if (!estudiante) {
        return res.status(404).json({ error: "Estudiante no encontrado" });
      }

      const [result] = await pool.query(
        `INSERT INTO proceso 
         (id_estudiante, id_empresa, id_asesor_academico, id_programa, tipo_proceso, id_periodo)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          estudiante.id_estudiante,
          id_empresa,
          id_asesor_academico,
          id_programa,
          tipo_proceso,
          id_periodo
        ]
      );

      res.status(201).json({ success: true, id_proceso: result.insertId });
    } catch (error) {
      res.status(500).json({ error: "Error al crear proceso" });
    }
  }
);

/* =========================
   CREAR PROCESO INICIAL
========================= */
router.post(
  "/inicial",
  authenticateToken,
  checkRole(["estudiante"]),
  async (req, res) => {
    const { id_programa, id_periodo } = req.body;
    const id_user = req.user.id;

    if (!id_programa || !id_periodo) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
      const [[estudiante]] = await pool.query(
        "SELECT id_estudiante FROM estudiantes WHERE id_user = ?",
        [id_user]
      );

      if (!estudiante) {
        return res.status(404).json({ error: "Estudiante no encontrado" });
      }

      const [result] = await pool.query(
        `INSERT INTO proceso (id_estudiante, id_programa, id_periodo)
         VALUES (?, ?, ?)`,
        [estudiante.id_estudiante, id_programa, id_periodo]
      );

      res.status(201).json({ success: true, id_proceso: result.insertId });
    } catch {
      res.status(500).json({ error: "Error al crear proceso inicial" });
    }
  }
);

/* =========================
   ACTUALIZAR PROCESO
========================= */
router.put(
  "/:id_proceso",
  authenticateToken,
  checkRole(["admin", "coordinador"]),
  validateNumericId,
  async (req, res) => {
    const { id_proceso } = req.params;
    const { id_empresa, id_asesor_academico, tipo_proceso } = req.body;

    if (!id_empresa || !id_asesor_academico || !tipo_proceso) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const [result] = await pool.query(
      `UPDATE proceso 
       SET id_empresa = ?, id_asesor_academico = ?, tipo_proceso = ?
       WHERE id_proceso = ?`,
      [id_empresa, id_asesor_academico, tipo_proceso, id_proceso]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proceso no encontrado" });
    }

    res.json({ success: true });
  }
);

/* =========================
   ELIMINAR PROCESO
========================= */
router.delete(
  "/:id_proceso",
  authenticateToken,
  checkRole(["admin"]),
  validateNumericId,
  async (req, res) => {
    const { id_proceso } = req.params;

    const [result] = await pool.query(
      "DELETE FROM proceso WHERE id_proceso = ?",
      [id_proceso]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proceso no encontrado" });
    }

    res.json({ success: true });
  }
);

/* =========================
   LISTAR PROCESOS
========================= */
router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    const isAdmin = ["admin", "coordinador"].includes(req.user.role);

    let query = `
      SELECT 
        p.id_proceso,
        p.tipo_proceso,
        e.matricula,
        em.empresa_nombre,
        u.nombre AS asesor_nombre,
        pr.nombre AS programa_nombre,
        CONCAT(pe.Año, ' ', pe.Fase) AS periodo
      FROM proceso p
      JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
      LEFT JOIN empresa em ON p.id_empresa = em.id_empresa
      LEFT JOIN asesores_academicos aa ON p.id_asesor_academico = aa.id_asesor
      LEFT JOIN users u ON aa.id_user = u.id_user
      LEFT JOIN programa_educativo pr ON p.id_programa = pr.id_programa
      LEFT JOIN periodos pe ON p.id_periodo = pe.IdPeriodo
    `;

    const params = [];

    if (!isAdmin) {
      query += " WHERE e.id_user = ?";
      params.push(req.user.id);
    }

    const [procesos] = await pool.query(query, params);
    res.json(procesos);
  }
);

/* =========================
   EXPORTAR EXCEL
========================= */
router.get(
  "/export",
  authenticateToken,
  checkRole(["admin", "coordinador"]),
  async (req, res) => {
    try {
      const { periodo } = req.query;

      if (!periodo) {
        return res.status(400).json({ error: "Periodo requerido" });
      }

      const [procesos] = await pool.query(
        `SELECT 
           e.matricula,
           em.empresa_nombre,
           u.nombre AS asesor,
           pr.nombre AS programa,
           p.tipo_proceso
         FROM proceso p
         JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
         LEFT JOIN empresa em ON p.id_empresa = em.id_empresa
         LEFT JOIN asesores_academicos aa ON p.id_asesor_academico = aa.id_asesor
         LEFT JOIN users u ON aa.id_user = u.id_user
         LEFT JOIN programa_educativo pr ON p.id_programa = pr.id_programa
         WHERE p.id_periodo = ?`,
        [periodo]
      );

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Procesos");

      sheet.addRow(["Matrícula", "Empresa", "Asesor", "Programa", "Tipo"]);
      procesos.forEach(p =>
        sheet.addRow([
          p.matricula,
          p.empresa_nombre || "-",
          p.asesor || "-",
          p.programa || "-",
          p.tipo_proceso
        ])
      );

      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=procesos.xlsx"
      );
      res.send(buffer);
    } catch {
      res.status(500).json({ error: "Error al exportar Excel" });
    }
  }
);

export default router;