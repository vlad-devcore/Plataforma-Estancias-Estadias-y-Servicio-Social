import express from "express";
import pool from "../config/config.db.js";
import ExcelJS from 'exceljs'; 
const workbook = new ExcelJS.Workbook(); 

const router = express.Router();

// Crear un nuevo proceso (completo)
router.post("/", async (req, res) => {
  const {
    id_user,
    id_empresa,
    id_asesor_academico,
    id_programa,
    tipo_proceso,
    id_periodo
  } = req.body;

  if (!id_user || !id_empresa || !id_asesor_academico || !id_programa || !tipo_proceso || !id_periodo) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id_estudiante FROM estudiantes WHERE id_user = ?",
      [id_user]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }
    const id_estudiante = rows[0].id_estudiante;

    const [result] = await pool.query(
      `INSERT INTO proceso (id_estudiante, id_empresa, id_asesor_academico, id_programa, tipo_proceso, id_periodo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_estudiante, id_empresa, id_asesor_academico, id_programa, tipo_proceso, id_periodo]
    );

    res.status(201).json({ message: "Proceso creado correctamente", id_proceso: result.insertId });
  } catch (error) {
    console.error("Error al registrar proceso:", error);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

// Crear proceso inicial (mínimo)
router.post("/inicial", async (req, res) => {
  const { id_user, id_programa, id_periodo } = req.body;

  if (!id_user || !id_programa || !id_periodo) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id_estudiante FROM estudiantes WHERE id_user = ?",
      [id_user]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }
    const id_estudiante = rows[0].id_estudiante;

    const [result] = await pool.query(
      `INSERT INTO proceso (id_estudiante, id_programa, id_periodo)
       VALUES (?, ?, ?)`,
      [id_estudiante, id_programa, id_periodo]
    );

    res.status(201).json({ message: "Proceso inicial creado", id_proceso: result.insertId });
  } catch (error) {
    console.error("Error al crear proceso inicial:", error);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

// Actualizar proceso existente
router.put("/:id_proceso", async (req, res) => {
  const { id_proceso } = req.params;
  const { id_empresa, id_asesor_academico, tipo_proceso } = req.body;

  if (!id_empresa || !id_asesor_academico || !tipo_proceso) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const [result] = await pool.query(
      `UPDATE proceso SET id_empresa = ?, id_asesor_academico = ?, tipo_proceso = ? WHERE id_proceso = ?`,
      [id_empresa, id_asesor_academico, tipo_proceso, id_proceso]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proceso no encontrado" });
    }

    res.status(200).json({ message: "Proceso actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar proceso:", error);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

// Eliminar proceso
router.delete("/:id_proceso", async (req, res) => {
  const { id_proceso } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM proceso WHERE id_proceso = ?", [id_proceso]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proceso no encontrado" });
    }
    res.status(200).json({ message: "Proceso eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar proceso:", error);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

// Obtener todos los procesos
router.get("/", async (req, res) => {
  try {    
    const [procesos] = await pool.query(
      `SELECT 
         p.id_proceso,
         p.id_periodo, -- Añadido
         p.tipo_proceso,
         e.matricula,
         em.empresa_nombre,
         COALESCE(u.nombre, 'Sin asesor') AS asesor_nombre,
         COALESCE(pr.nombre, 'Sin programa') AS programa_nombre,
         COALESCE(CONCAT(pe.Año, ' ', pe.Fase), 'Sin periodo') AS periodo_nombre
       FROM proceso p
       JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
       LEFT JOIN empresa em ON p.id_empresa = em.id_empresa
       LEFT JOIN asesores_academicos aa ON p.id_asesor_academico = aa.id_asesor
       LEFT JOIN users u ON aa.id_user = u.id_user
       LEFT JOIN programa_educativo pr ON p.id_programa = pr.id_programa
       LEFT JOIN periodos pe ON p.id_periodo = pe.IdPeriodo`
    );    
    res.status(200).json(procesos);
  } catch (error) {
    console.error("Error al obtener procesos:", error);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
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
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

// Obtener procesos por id_user
router.get("/por-usuario/:id_user", async (req, res) => {
  const { id_user } = req.params;
  try {    
    const [procesos] = await pool.query(
      `SELECT 
         p.id_proceso,
         p.id_periodo, -- Añadido
         p.tipo_proceso,
         e.matricula,
         em.empresa_nombre,
         COALESCE(u.nombre, 'Sin asesor') AS asesor_nombre,
         COALESCE(pr.nombre, 'Sin programa') AS programa_nombre,
         COALESCE(CONCAT(pe.Año, ' ', pe.Fase), 'Sin periodo') AS periodo_nombre
       FROM proceso p
       JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
       LEFT JOIN empresa em ON p.id_empresa = em.id_empresa
       LEFT JOIN asesores_academicos aa ON p.id_asesor_academico = aa.id_asesor
       LEFT JOIN users u ON aa.id_user = u.id_user
       LEFT JOIN programa_educativo pr ON p.id_programa = pr.id_programa
       LEFT JOIN periodos pe ON p.id_periodo = pe.IdPeriodo
       WHERE e.id_user = ?`,
      [id_user]
    );
    res.status(200).json(procesos);
  } catch (error) {
    console.error("Error al obtener procesos por usuario:", error);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

// Validar si ya existe un proceso por usuario, periodo y (opcionalmente) tipo_proceso
router.get("/validar/:id_user/:id_periodo", async (req, res) => {
  const { id_user, id_periodo } = req.params;
  const { tipo_proceso } = req.query;

  try {
    const [rows] = await pool.query(
      "SELECT id_estudiante FROM estudiantes WHERE id_user = ?",
      [id_user]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Estudiante no encontrado" });

    const id_estudiante = rows[0].id_estudiante;

    let query = "SELECT * FROM proceso WHERE id_estudiante = ? AND id_periodo = ?";
    const params = [id_estudiante, id_periodo];

    if (tipo_proceso) {
      query += " AND tipo_proceso = ?";
      params.push(tipo_proceso);
    }

    const [proceso] = await pool.query(query, params);

    if (proceso.length > 0) {
      return res.json({ registrado: true, proceso: proceso[0] });
    }
    return res.json({ registrado: false, proceso: proceso[0] || null });
  } catch (error) {
    console.error("Error al validar proceso:", error);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});


// 🆕 NUEVA RUTA PARA EXPORTAR EXCEL - AGREGAR AQUÍ
router.get('/export', async (req, res) => {
  try {
    console.log('🔄 Iniciando exportación de procesos a Excel...');
    
    // 📊 OBTENER TODOS LOS PROCESOS (MISMA QUERY QUE YA TIENES)
    const [allProcesos] = await pool.query(
      `SELECT 
         p.id_proceso,
         p.id_periodo,
         p.tipo_proceso,
         e.matricula,
         COALESCE(em.empresa_nombre, 'Sin empresa') AS empresa_nombre,
         COALESCE(u.nombre, 'Sin asesor') AS asesor_nombre,
         COALESCE(pr.nombre, 'Sin programa') AS programa_nombre,
         COALESCE(CONCAT(pe.Año, ' ', pe.Fase), 'Sin periodo') AS periodo_nombre
       FROM proceso p
       JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
       LEFT JOIN empresa em ON p.id_empresa = em.id_empresa
       LEFT JOIN asesores_academicos aa ON p.id_asesor_academico = aa.id_asesor
       LEFT JOIN users u ON aa.id_user = u.id_user
       LEFT JOIN programa_educativo pr ON p.id_programa = pr.id_programa
       LEFT JOIN periodos pe ON p.id_periodo = pe.IdPeriodo
       ORDER BY p.id_proceso DESC` // Ordenar por más reciente
    );

    console.log(`📊 Encontrados ${allProcesos.length} procesos para exportar`);

    if (allProcesos.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron procesos para exportar' 
      });
    }


    const worksheet = workbook.addWorksheet('Procesos');

    // 🏷️ HEADERS (EXACTAMENTE COMO TU TABLA)
    const headers = [
      'Matrícula',
      'Empresa',
      'Asesor',
      'Programa',
      'Tipo de Proceso',
      'Periodo',
      'ID Proceso'
    ];

    const headerRow = worksheet.addRow(headers);

    // 🎨 ESTILOS PROFESIONALES PARA HEADERS
    headerRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' } // Azul profesional
      };
      cell.alignment = { 
        vertical: 'middle', 
        horizontal: 'center',
        wrapText: true 
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // 📊 AGREGAR TODOS LOS DATOS (FILAS)
    allProcesos.forEach((proceso, index) => {
      const row = worksheet.addRow([
        proceso.matricula || '',
        proceso.empresa_nombre || '-',
        proceso.asesor_nombre || '-',
        proceso.programa_nombre || '-',
        proceso.tipo_proceso || '-',
        proceso.periodo_nombre || '-',
        proceso.id_proceso || ''
      ]);

      // 🎨 Estilos para datos
      row.eachCell((cell) => {
        cell.alignment = { 
          vertical: 'middle', 
          horizontal: 'left',
          wrapText: true 
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE8E8E8' } },
          left: { style: 'thin', color: { argb: 'FFE8E8E8' } },
          bottom: { style: 'thin', color: { argb: 'FFE8E8E8' } },
          right: { style: 'thin', color: { argb: 'FFE8E8E8' } }
        };
      });

      // 💚 Filas alternadas
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' } // Gris súper claro
        };
      }
    });

    // 📏 ANCHO DE COLUMNAS OPTIMIZADO
    worksheet.columns = [
      { width: 15 }, // Matrícula
      { width: 25 }, // Empresa
      { width: 20 }, // Asesor
      { width: 25 }, // Programa
      { width: 18 }, // Tipo de Proceso
      { width: 15 }, // Periodo
      { width: 12 }  // ID Proceso
    ];

    // 📈 TOTALES Y METADATOS
    const lastRow = allProcesos.length + 2;
    
    // Fila de total
    const totalRow = worksheet.addRow([
      '', '', '', '', 
      `TOTAL DE PROCESOS:`, 
      allProcesos.length.toString()
    ]);
    
    totalRow.getCell(5).font = { bold: true, size: 11, color: { argb: 'FF155E75' } };
    totalRow.getCell(6).font = { bold: true, size: 11, color: { argb: 'FF059669' } };
    totalRow.getCell(6).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE8F5E8' } // Verde claro
    };

    // 📄 Líneas vacías y metadatos
    worksheet.addRow([]);
    const infoRow1 = worksheet.addRow(['📅 Exportado el:', new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })]);
    const infoRow2 = worksheet.addRow(['⚙️ Sistema de Gestión de Procesos']);
    const infoRow3 = worksheet.addRow(['📊 Total registros exportados:', allProcesos.length.toString()]);
    
    // Estilo para metadatos
    [infoRow1, infoRow2, infoRow3].forEach(row => {
      row.getCell(1).font = { italic: true, color: { argb: 'FF6B7280' }, size: 10 };
      row.getCell(2).font = { italic: true, color: { argb: 'FF374151' }, size: 10 };
    });

    // 💾 GENERAR Y ENVIAR BUFFER
    console.log('✨ Generando archivo Excel...');
    const buffer = await workbook.xlsx.writeBuffer();

    // 📥 HEADERS PARA DESCARGA
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=procesos_${new Date().toISOString().split('T')[0]}.xlsx`,
      'Content-Length': buffer.length,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });

    console.log('✅ Excel exportado exitosamente -', allProcesos.length, 'registros');
    res.send(buffer);

  } catch (error) {
    console.error('❌ Error exportando Excel:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al generar Excel',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

export default router;