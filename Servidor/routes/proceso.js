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
   UTILIDADES
========================= */
const sanitizeString = (str) => {
  if (!str) return null;
  return String(str).trim().substring(0, 255);
};

const validateProcesoData = (data) => {
  const { id_empresa, id_asesor_academico, id_programa, tipo_proceso, id_periodo } = data;
  
  if (!id_empresa || !id_asesor_academico || !id_programa || !tipo_proceso || !id_periodo) {
    return "Faltan campos obligatorios";
  }
  
  const tiposValidos = ["Estadía", "Servicio Social", "Prácticas"];
  if (!tiposValidos.includes(tipo_proceso)) {
    return `Tipo de proceso inválido. Permitidos: ${tiposValidos.join(", ")}`;
  }
  
  return null;
};

/* =========================
   OBTENER PERIODOS
   ⚠️ RUTA PÚBLICA PARA DEBUG
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
      console.error("Error en GET /procesos/periodos:", error);
      res.status(500).json({ 
        error: "Error al obtener periodos",
        message: error.message 
      });
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
    try {
      const {
        id_empresa,
        id_asesor_academico,
        id_programa,
        tipo_proceso,
        id_periodo
      } = req.body;

      const id_user = req.user.id;

      // Validar datos
      const error = validateProcesoData(req.body);
      if (error) {
        return res.status(400).json({ error });
      }

      // Obtener id_estudiante
      const [[estudiante]] = await pool.query(
        "SELECT id_estudiante FROM estudiantes WHERE id_user = ?",
        [id_user]
      );

      if (!estudiante) {
        return res.status(404).json({ error: "Estudiante no encontrado" });
      }

      // Verificar que el periodo existe y está activo
      const [[periodo]] = await pool.query(
        "SELECT IdPeriodo, Activo FROM periodos WHERE IdPeriodo = ?",
        [id_periodo]
      );

      if (!periodo) {
        return res.status(404).json({ error: "Periodo no encontrado" });
      }

      if (periodo.Activo !== 1) {
        return res.status(400).json({ error: "El periodo no está activo" });
      }

      // Verificar que no existe un proceso duplicado
      const [[existente]] = await pool.query(
        `SELECT id_proceso FROM proceso 
         WHERE id_estudiante = ? AND id_periodo = ?`,
        [estudiante.id_estudiante, id_periodo]
      );

      if (existente) {
        return res.status(400).json({ 
          error: "Ya existe un proceso para este estudiante en este periodo" 
        });
      }

      // Insertar proceso
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

      res.status(201).json({ 
        success: true, 
        id_proceso: result.insertId,
        message: "Proceso creado exitosamente"
      });
    } catch (error) {
      console.error("Error en POST /procesos:", error);
      res.status(500).json({ 
        error: "Error al crear proceso",
        message: error.message
      });
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
    try {
      const { id_programa, id_periodo } = req.body;
      const id_user = req.user.id;

      if (!id_programa || !id_periodo) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      // Obtener id_estudiante
      const [[estudiante]] = await pool.query(
        "SELECT id_estudiante FROM estudiantes WHERE id_user = ?",
        [id_user]
      );

      if (!estudiante) {
        return res.status(404).json({ error: "Estudiante no encontrado" });
      }

      // Verificar duplicados
      const [[existente]] = await pool.query(
        `SELECT id_proceso FROM proceso 
         WHERE id_estudiante = ? AND id_periodo = ?`,
        [estudiante.id_estudiante, id_periodo]
      );

      if (existente) {
        return res.status(400).json({ 
          error: "Ya existe un proceso inicial para este periodo" 
        });
      }

      // Insertar proceso inicial
      const [result] = await pool.query(
        `INSERT INTO proceso (id_estudiante, id_programa, id_periodo)
         VALUES (?, ?, ?)`,
        [estudiante.id_estudiante, id_programa, id_periodo]
      );

      res.status(201).json({ 
        success: true, 
        id_proceso: result.insertId,
        message: "Proceso inicial creado"
      });
    } catch (error) {
      console.error("Error en POST /procesos/inicial:", error);
      res.status(500).json({ 
        error: "Error al crear proceso inicial",
        message: error.message
      });
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
    try {
      const { id_proceso } = req.params;
      const { id_empresa, id_asesor_academico, tipo_proceso } = req.body;

      if (!id_empresa || !id_asesor_academico || !tipo_proceso) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      const tiposValidos = ["Estadía", "Servicio Social", "Prácticas"];
      if (!tiposValidos.includes(tipo_proceso)) {
        return res.status(400).json({ 
          error: `Tipo inválido. Permitidos: ${tiposValidos.join(", ")}` 
        });
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

      res.json({ 
        success: true,
        message: "Proceso actualizado correctamente"
      });
    } catch (error) {
      console.error("Error en PUT /procesos/:id", error);
      res.status(500).json({ 
        error: "Error al actualizar proceso",
        message: error.message
      });
    }
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
    try {
      const { id_proceso } = req.params;

      const [result] = await pool.query(
        "DELETE FROM proceso WHERE id_proceso = ?",
        [id_proceso]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Proceso no encontrado" });
      }

      res.json({ 
        success: true,
        message: "Proceso eliminado correctamente"
      });
    } catch (error) {
      console.error("Error en DELETE /procesos/:id", error);
      res.status(500).json({ 
        error: "Error al eliminar proceso",
        message: error.message
      });
    }
  }
);

/* =========================
   LISTAR PROCESOS
========================= */
router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
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
    } catch (error) {
      console.error("Error en GET /procesos:", error);
      res.status(500).json({ 
        error: "Error al obtener procesos",
        message: error.message
      });
    }
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

      if (isNaN(periodo)) {
        return res.status(400).json({ error: "ID de periodo inválido" });
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

      if (procesos.length === 0) {
        return res.status(404).json({ 
          error: "No hay procesos para el periodo seleccionado" 
        });
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Procesos");

      // Encabezados
      sheet.addRow(["Matrícula", "Empresa", "Asesor", "Programa", "Tipo"]);
      
      // Estilo de encabezados
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" }
      };

      // Datos
      procesos.forEach(p =>
        sheet.addRow([
          p.matricula || "-",
          p.empresa_nombre || "-",
          p.asesor || "-",
          p.programa || "-",
          p.tipo_proceso || "-"
        ])
      );

      // Ajustar ancho de columnas
      sheet.columns.forEach(column => {
        column.width = 20;
      });

      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=procesos_${periodo}.xlsx`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(buffer);
    } catch (error) {
      console.error("Error en GET /procesos/export:", error);
      res.status(500).json({ 
        error: "Error al exportar Excel",
        message: error.message
      });
    }
  }
);

// Agregar al final de proceso.js ANTES del export default
router.get("/test-auth", (req, res) => {
  res.json({ 
    message: "Ruta sin autenticación funciona",
    timestamp: new Date().toISOString()
  });
});

router.get("/test-auth-protected", authenticateToken, (req, res) => {
  res.json({ 
    message: "Autenticación exitosa",
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

export default router;