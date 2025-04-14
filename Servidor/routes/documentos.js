import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../config/config.db.js";
import { fileURLToPath } from 'url'; // Añadir para __dirname

// Definir __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "public/Uploads/documentos";
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

// Obtener todos los documentos
router.get("/", async (req, res) => {
  try {
    console.log("GET /api/documentos - Obtener todos los documentos");
    const [results] = await pool.query("SELECT * FROM documentos");
    console.log("Documentos obtenidos:", results);
    res.json(results);
  } catch (error) {
    console.error("Error al obtener documentos:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Subir/actualizar documento
router.post("/upload", upload.single("archivo"), async (req, res) => {
  try {
    console.log("POST /api/documentos/upload - Subir/actualizar documento");
    console.log("Datos recibidos en el body:", req.body);
    console.log("Archivo recibido:", req.file);

    const { IdTipoDoc, id_usuario, Comentarios = "", Estatus = "Pendiente", id_proceso } = req.body;
    const file = req.file;

    if (!IdTipoDoc || !id_usuario || !id_proceso || !file) {
      console.log("Faltan campos obligatorios o archivo");
      return res.status(400).json({ error: "Faltan campos obligatorios o archivo" });
    }

    // Decodificar el nombre original del archivo para manejar caracteres especiales
    const nombreArchivo = decodeURIComponent(escape(file.originalname));

    // Insertar nuevo documento
    await pool.query(
      "INSERT INTO documentos (NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [nombreArchivo, `/Uploads/documentos/${file.filename}`, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso]
    );

    console.log("Documento subido exitosamente");
    res.json({ success: true });
  } catch (error) {
    console.error("Error al subir documento:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Descargar documento
router.get("/download/:id_Documento", async (req, res) => {
  try {
    console.log(`GET /api/documentos/download/:id_Documento - Descargar documento con ID ${req.params.id_Documento}`);
    const { id_Documento } = req.params;
    
    const [documento] = await pool.query(
      "SELECT NombreArchivo, RutaArchivo FROM documentos WHERE id_Documento = ?", 
      [id_Documento]
    );

    if (documento.length === 0) {
      console.log(`Documento con ID ${id_Documento} no encontrado`);
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    console.log("Documento encontrado:", documento[0]);

    const filePath = path.join(__dirname, "..", "public", "Uploads", documento[0].RutaArchivo.replace(/^\/Uploads\//, ''));

    if (!fs.existsSync(filePath)) {
      console.log(`Archivo no encontrado en la ruta: ${filePath}`);
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    // Determinar el tipo de contenido según la extensión
    let contentType;
    const fileExtension = path.extname(filePath).toLowerCase();
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
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(documento[0].NombreArchivo)}"`);
    res.setHeader('Content-Length', fs.statSync(filePath).size);

    // Stream el archivo
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error al descargar documento:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar documento
router.delete("/:id_Documento", async (req, res) => {
  try {
    console.log(`DELETE /api/documentos/:id_Documento - Eliminar documento con ID ${req.params.id_Documento}`);
    const { id_Documento } = req.params;

    // Obtener nombre del archivo
    const [documento] = await pool.query(
      "SELECT NombreArchivo, RutaArchivo FROM documentos WHERE id_Documento = ?",
      [id_Documento]
    );

    if (documento.length === 0) {
      console.log(`Documento con ID ${id_Documento} no encontrado`);
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    console.log("Documento encontrado para eliminación:", documento[0]);

    // Eliminar archivo físico
    const filePath = path.join(__dirname, "..", "public", "Uploads", documento[0].RutaArchivo.replace(/^\/Uploads\//, ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Archivo ${filePath} eliminado correctamente`);
    } else {
      console.log(`Archivo no encontrado en ${filePath}, continuando con eliminación en BD`);
    }

    // Eliminar registro de la BD
    await pool.query(
      "DELETE FROM documentos WHERE id_Documento = ?",
      [id_Documento]
    );

    console.log(`Documento con ID ${id_Documento} eliminado de la base de datos`);
    res.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar documento:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;