// En tu archivo de rutas (documentosAdmin.js)
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";

const router = express.Router();

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "public/uploads/formatos";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Obtener todos los formatos
router.get("/", async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM formatos_admin");
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subir/actualizar formato
router.post("/upload", upload.single("archivo"), async (req, res) => {
  try {
    const { nombre_documento } = req.body;
    const file = req.file;

    if (!nombre_documento || !file) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Verificar si ya existe
    const [existing] = await pool.query(
      "SELECT * FROM formatos_admin WHERE nombre_documento = ?",
      [nombre_documento]
    );

    if (existing.length > 0) {
      // Eliminar archivo antiguo si existe
      if (existing[0].nombre_archivo) {
        const oldFilePath = path.join("public/uploads/formatos", existing[0].nombre_archivo);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Actualizar registro
      await pool.query(
        "UPDATE formatos_admin SET nombre_archivo = ? WHERE nombre_documento = ?",
        [file.filename, nombre_documento]
      );
    } else {
      // Insertar nuevo registro
      await pool.query(
        "INSERT INTO formatos_admin (nombre_documento, nombre_archivo) VALUES (?, ?)",
        [nombre_documento, file.filename]
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Descargar formato
router.get("/download/:nombre_documento", async (req, res) => {
  try {
    const { nombre_documento } = req.params;
    
    const [formato] = await pool.query(
      "SELECT nombre_archivo FROM formatos_admin WHERE nombre_documento = ?", 
      [nombre_documento]
    );

    if (formato.length === 0 || !formato[0].nombre_archivo) {
      return res.status(404).json({ error: "Formato no encontrado" });
    }

    const filePath = path.join("public/uploads/formatos", formato[0].nombre_archivo);
    const fileExtension = path.extname(formato[0].nombre_archivo).toLowerCase();
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    // Determinar el tipo de contenido según la extensión
    let contentType;
    switch(fileExtension) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    // Configurar headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${formato[0].nombre_archivo}"`);
    res.setHeader('Content-Length', fs.statSync(filePath).size);

    // Stream el archivo
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ver formato en el navegador
router.get("/view/:nombre_documento", async (req, res) => {
  try {
    const { nombre_documento } = req.params;
    
    const [formato] = await pool.query(
      "SELECT nombre_archivo FROM formatos_admin WHERE nombre_documento = ?", 
      [nombre_documento]
    );

    if (formato.length === 0 || !formato[0].nombre_archivo) {
      return res.status(404).json({ error: "Formato no encontrado" });
    }

    const filePath = path.join("public/uploads/formatos", formato[0].nombre_archivo);
    const fileExtension = path.extname(formato[0].nombre_archivo).toLowerCase();
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    // Solo permitimos visualizar PDFs directamente en el navegador
    if (fileExtension === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${formato[0].nombre_archivo}"`);
      res.sendFile(path.resolve(filePath));
    } else {
      // Para otros tipos de archivo, forzar descarga
      res.redirect(`/api/documentosAdmin/download/${nombre_documento}`);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar formato
router.delete("/:nombre_documento", async (req, res) => {
  try {
    const { nombre_documento } = req.params;

    // Obtener nombre del archivo
    const [formato] = await pool.query(
      "SELECT nombre_archivo FROM formatos_admin WHERE nombre_documento = ?",
      [nombre_documento]
    );

    if (formato.length === 0) {
      return res.status(404).json({ error: "Formato no encontrado" });
    }

    // Eliminar archivo físico
    if (formato[0].nombre_archivo) {
      const filePath = path.join("public/uploads/formatos", formato[0].nombre_archivo);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Eliminar registro de la BD
    await pool.query(
      "DELETE FROM formatos_admin WHERE nombre_documento = ?",
      [nombre_documento]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;