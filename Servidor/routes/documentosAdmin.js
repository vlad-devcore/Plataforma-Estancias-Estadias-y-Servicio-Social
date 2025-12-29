// ============================================================================
// 📦 documentosAdmin.js - VERSIÓN SEGURA
// ============================================================================
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";
import { authenticateToken, requireAdmin } from "./authMiddleware.js"; // ✅ IMPORTAR MIDDLEWARES

const router = express.Router();

// ==============================
// Multer (SUBIDA)
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "Uploads",
      "formatos"
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `archivo-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// ============================================================================
// 🔓 RUTA PÚBLICA (solo lectura de metadatos - estudiantes pueden ver formatos)
// ============================================================================

// ✅ Listar formatos - PÚBLICO (estudiantes necesitan ver qué formatos están disponibles)
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log(`📋 Consulta de formatos por ${req.user.email}`);
    
    const [results] = await pool.query(`
      SELECT 
        id,
        nombre_documento,
        nombre_archivo,
        estado,
        ultima_modificacion_manual
      FROM formatos_admin
    `);
    
    console.log(`   ✅ Devueltos ${results.length} formatos`);
    res.json(results);
  } catch (error) {
    console.error("❌ Error al listar formatos:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Ver formato (inline) - PROTEGIDO (autenticado puede ver)
router.get("/view/:nombre_documento", authenticateToken, async (req, res) => {
  try {
    const { nombre_documento } = req.params;
    
    console.log(`👁️  Vista de formato "${nombre_documento}" por ${req.user.email}`);

    const [rows] = await pool.query(
      "SELECT nombre_archivo FROM formatos_admin WHERE nombre_documento = ?",
      [nombre_documento]
    );

    if (rows.length === 0 || !rows[0].nombre_archivo) {
      return res.status(404).json({ error: "Formato no encontrado" });
    }

    const filePath = path.join(
      process.cwd(),
      "public",
      "Uploads",
      "formatos",
      rows[0].nombre_archivo
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado en disco" });
    }

    const ext = path.extname(filePath).toLowerCase();

    if (ext === ".pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(rows[0].nombre_archivo)}"`
      );
      console.log(`   ✅ PDF enviado en línea`);
      return res.sendFile(filePath);
    }

    // Otros → descarga
    console.log(`   ✅ Archivo enviado para descarga`);
    res.download(filePath, rows[0].nombre_archivo);
  } catch (error) {
    console.error("❌ Error al ver formato:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Descargar formato - PROTEGIDO (autenticado puede descargar)
router.get("/download/:nombre_documento", authenticateToken, async (req, res) => {
  try {
    const { nombre_documento } = req.params;
    
    console.log(`⬇️  Descarga de formato "${nombre_documento}" por ${req.user.email}`);

    const [rows] = await pool.query(
      "SELECT nombre_archivo FROM formatos_admin WHERE nombre_documento = ?",
      [nombre_documento]
    );

    if (rows.length === 0 || !rows[0].nombre_archivo) {
      return res.status(404).json({ error: "Formato no encontrado" });
    }

    const filePath = path.join(
      process.cwd(),
      "public",
      "Uploads",
      "formatos",
      rows[0].nombre_archivo
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    console.log(`   ✅ Archivo enviado`);
    res.download(filePath, rows[0].nombre_archivo);
  } catch (error) {
    console.error("❌ Error al descargar formato:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// 🔒 RUTAS ADMINISTRATIVAS (SOLO ADMIN)
// ============================================================================

// 🔒 Subir/actualizar formato - SOLO ADMIN
router.post("/upload", authenticateToken, requireAdmin, upload.single("archivo"), async (req, res) => {
  try {
    const { nombre_documento } = req.body;
    const file = req.file;

    if (!nombre_documento || !file) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    console.log(`📤 Admin ${req.user.email} subiendo formato: ${nombre_documento}`);

    const [existing] = await pool.query(
      "SELECT nombre_archivo FROM formatos_admin WHERE nombre_documento = ?",
      [nombre_documento]
    );

    if (existing.length > 0 && existing[0].nombre_archivo) {
      const oldPath = path.join(
        process.cwd(),
        "public",
        "Uploads",
        "formatos",
        existing[0].nombre_archivo
      );

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log(`   🗑️  Archivo antiguo eliminado`);
      }

      await pool.query(
        `UPDATE formatos_admin 
         SET nombre_archivo = ?, estado = 'Activo'
         WHERE nombre_documento = ?`,
        [file.filename, nombre_documento]
      );
      console.log(`   ✅ Formato actualizado`);
    } else {
      await pool.query(
        `INSERT INTO formatos_admin 
         (nombre_documento, nombre_archivo, estado)
         VALUES (?, ?, 'Activo')`,
        [nombre_documento, file.filename]
      );
      console.log(`   ✅ Nuevo formato creado`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al subir formato:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🔒 Cambiar estado - SOLO ADMIN
router.put("/estado", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nombre_documento, estado } = req.body;

    if (!nombre_documento || !["Activo", "Bloqueado"].includes(estado)) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    console.log(`🔄 Admin ${req.user.email} cambiando estado de "${nombre_documento}" a ${estado}`);

    const [result] = await pool.query(
      `UPDATE formatos_admin 
       SET estado = ?, ultima_modificacion_manual = NOW()
       WHERE nombre_documento = ?`,
      [estado, nombre_documento]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Formato no encontrado" });
    }

    console.log(`   ✅ Estado actualizado`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al cambiar estado:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🔒 Eliminar formato - SOLO ADMIN
router.delete("/:nombre_documento", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nombre_documento } = req.params;
    
    console.log(`🗑️  Admin ${req.user.email} eliminando formato: ${nombre_documento}`);

    const [rows] = await pool.query(
      "SELECT nombre_archivo FROM formatos_admin WHERE nombre_documento = ?",
      [nombre_documento]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Formato no encontrado" });
    }

    if (rows[0].nombre_archivo) {
      const filePath = path.join(
        process.cwd(),
        "public",
        "Uploads",
        "formatos",
        rows[0].nombre_archivo
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`   🗑️  Archivo físico eliminado`);
      }
    }

    await pool.query(
      "DELETE FROM formatos_admin WHERE nombre_documento = ?",
      [nombre_documento]
    );

    console.log(`   ✅ Formato eliminado de la BD`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al eliminar formato:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;