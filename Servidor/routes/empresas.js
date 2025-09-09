import express from "express";
import pool from "../config/config.db.js";
import { parse } from "csv-parse";
import multer from "multer";
import iconv from "iconv-lite";
import { Readable } from "stream";

const router = express.Router();

// Configuración de multer para procesar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname || !file.originalname.toLowerCase().endsWith(".csv")) {
      const error = new Error("Solo se permiten archivos CSV");
      error.status = 400;
      return cb(error);
    }
    cb(null, true);
  },
});

// Middleware de manejo de errores
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  const errorDetails = {
    message: err.message || "Error interno del servidor",
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  };

  // Log detallado en consola
  console.error("Error en la solicitud:", JSON.stringify(errorDetails, null, 2));

  res.status(statusCode).json({
    error: errorDetails.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// Validaciones
const isValidEmail = (email) => {
  if (!email || email.trim() === "") return true; // Correo vacío es válido
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Normalizar texto para manejar tildes mal codificadas
const normalizeText = (text) => {
  if (!text) return text;
  return text
    .replace(/�/g, "")
    .replace(/á|à|â|ã/g, "á")
    .replace(/é|è|ê/g, "é")
    .replace(/í|ì|î/g, "í")
    .replace(/ó|ò|ô|õ/g, "ó")
    .replace(/ú|ù|û/g, "ú")
    .replace(/ñ|Ñ/g, "ñ")
    .trim();
};

// Generar RFC automáticamente basado en nombre con autoincremento global de 5 dígitos
const generateRFC = async (nombre) => {
  try {
    const nombrePrefix = normalizeText(nombre)
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 3)
      .padEnd(3, "X");
    const [nextIdResult] = await pool.query(
      "SELECT AUTO_INCREMENT AS next_id FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'empresa'"
    );
    const nextNumber = nextIdResult[0].next_id || 1;
    return `${nombrePrefix}${String(nextNumber).padStart(5, "0")}`;
  } catch (error) {
    const err = new Error("Error al generar RFC");
    err.status = 500;
    throw err;
  }
};

// Listas de valores permitidos
const tamanosPermitidos = ["Grande", "Mediana", "Pequeña"];
const sociedadesPermitidas = ["Privada", "Pública"];

// Obtener todas las empresas
const getEmpresas = async (req, res, next) => {
  try {
    const [results] = await pool.query("SELECT * FROM empresa");
    res.status(200).json(results || []);
  } catch (error) {
    const err = new Error("Error al obtener empresas");
    err.status = 500;
    err.cause = error;
    next(err);
  }
};

// Obtener empresa por ID
const getEmpresaById = async (req, res, next) => {
  const { id_empresa } = req.params;
  try {
    const [results] = await pool.query("SELECT * FROM empresa WHERE id_empresa = ?", [id_empresa]);
    if (!results.length) {
      const error = new Error("Empresa no encontrada");
      error.status = 404;
      throw error;
    }
    res.status(200).json(results[0]);
  } catch (error) {
    const err = error.status ? error : new Error("Error al obtener la empresa");
    err.status = error.status || 500;
    err.cause = error;
    next(err);
  }
};

// Crear una nueva empresa
const postEmpresa = async (req, res, next) => {
  const { empresa_nombre, empresa_direccion, empresa_email, empresa_telefono, empresa_tamano, empresa_sociedad, empresa_pagina_web } = req.body;

  try {
    // Validar campos obligatorios
    if (!empresa_nombre || !empresa_tamano || !empresa_sociedad) {
      const error = new Error("Faltan campos obligatorios (nombre, tamaño o sociedad)");
      error.status = 400;
      throw error;
    }

    // Validar valores permitidos
    if (!tamanosPermitidos.includes(empresa_tamano)) {
      const error = new Error("El tamaño debe ser 'Grande', 'Mediana' o 'Pequeña'");
      error.status = 400;
      throw error;
    }

    if (!sociedadesPermitidas.includes(empresa_sociedad)) {
      const error = new Error("La sociedad debe ser 'Privada' o 'Pública'");
      error.status = 400;
      throw error;
    }

    if (!isValidEmail(empresa_email)) {
      const error = new Error("El correo electrónico no es válido");
      error.status = 400;
      throw error;
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Verificar si el nombre ya existe
      const [existingEmpresa] = await connection.query("SELECT id_empresa FROM empresa WHERE empresa_nombre = ?", [empresa_nombre]);
      if (existingEmpresa.length > 0) {
        const error = new Error("Ya existe una empresa con este nombre");
        error.status = 400;
        throw error;
      }

      // Generar RFC
      const empresa_rfc = await generateRFC(empresa_nombre);

      // Insertar empresa
      const [results] = await connection.query(
        "INSERT INTO empresa (empresa_rfc, empresa_nombre, empresa_direccion, empresa_email, empresa_telefono, empresa_tamano, empresa_sociedad, empresa_pagina_web) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          empresa_rfc,
          empresa_nombre,
          empresa_direccion || null,
          empresa_email || null,
          empresa_telefono || null,
          empresa_tamano,
          empresa_sociedad,
          empresa_pagina_web || null,
        ]
      );

      // Obtener la empresa creada
      const [newEmpresa] = await connection.query("SELECT * FROM empresa WHERE id_empresa = ?", [results.insertId]);
      await connection.commit();
      res.status(201).json(newEmpresa[0]);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    const err = error.status ? error : new Error("Error al crear empresa");
    err.status = error.status || 500;
    err.cause = error;
    next(err);
  }
};

// Actualizar una empresa
const updateEmpresa = async (req, res, next) => {
  const { id_empresa } = req.params;
  const { empresa_nombre, empresa_direccion, empresa_email, empresa_telefono, empresa_tamano, empresa_sociedad, empresa_pagina_web } = req.body;

  try {
    // Validar campos obligatorios
    if (!empresa_nombre || !empresa_tamano || !empresa_sociedad) {
      const error = new Error("Faltan campos obligatorios (nombre, tamaño o sociedad)");
      error.status = 400;
      throw error;
    }

    // Validar valores permitidos
    if (!tamanosPermitidos.includes(empresa_tamano)) {
      const error = new Error("El tamaño debe ser 'Grande', 'Mediana' o 'Pequeña'");
      error.status = 400;
      throw error;
    }

    if (!sociedadesPermitidas.includes(empresa_sociedad)) {
      const error = new Error("La sociedad debe ser 'Privada' o 'Pública'");
      error.status = 400;
      throw error;
    }

    if (!isValidEmail(empresa_email)) {
      const error = new Error("El correo electrónico no es válido");
      error.status = 400;
      throw error;
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Verificar si la empresa existe
      const [empresaExistente] = await connection.query("SELECT id_empresa FROM empresa WHERE id_empresa = ?", [id_empresa]);
      if (!empresaExistente.length) {
        const error = new Error("Empresa no encontrada");
        error.status = 404;
        throw error;
      }

      // Verificar si el nombre ya existe en otra empresa
      const [existingNombre] = await connection.query("SELECT id_empresa FROM empresa WHERE empresa_nombre = ? AND id_empresa != ?", [empresa_nombre, id_empresa]);
      if (existingNombre.length > 0) {
        const error = new Error("Ya existe una empresa con este nombre");
        error.status = 400;
        throw error;
      }

      // Obtener el nombre y RFC actuales
      const [currentEmpresa] = await connection.query("SELECT empresa_nombre, empresa_rfc FROM empresa WHERE id_empresa = ?", [id_empresa]);
      if (!currentEmpresa.length) {
        const error = new Error("Empresa no encontrada");
        error.status = 404;
        throw error;
      }

      // Generar nuevo RFC si el nombre cambió
      const new_rfc = currentEmpresa[0].empresa_nombre !== empresa_nombre
        ? await generateRFC(empresa_nombre)
        : currentEmpresa[0].empresa_rfc;

      // Actualizar empresa
      const [results] = await connection.query(
        "UPDATE empresa SET empresa_rfc = ?, empresa_nombre = ?, empresa_direccion = ?, empresa_email = ?, empresa_telefono = ?, empresa_tamano = ?, empresa_sociedad = ?, empresa_pagina_web = ? WHERE id_empresa = ?",
        [
          new_rfc,
          empresa_nombre,
          empresa_direccion || null,
          empresa_email || null,
          empresa_telefono || null,
          empresa_tamano,
          empresa_sociedad,
          empresa_pagina_web || null,
          id_empresa,
        ]
      );

      if (results.affectedRows === 0) {
        const error = new Error("No se pudo actualizar la empresa");
        error.status = 404;
        throw error;
      }

      // Obtener la empresa actualizada
      const [updatedEmpresa] = await connection.query("SELECT * FROM empresa WHERE id_empresa = ?", [id_empresa]);
      await connection.commit();
      res.status(200).json(updatedEmpresa[0]);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    const err = error.status ? error : new Error("Error al actualizar empresa");
    err.status = error.status || 500;
    err.cause = error;
    next(err);
  }
};

// Eliminar empresa
const deleteEmpresa = async (req, res, next) => {
  const { id_empresa } = req.params;
  try {
    const [results] = await pool.query("DELETE FROM empresa WHERE id_empresa = ?", [id_empresa]);
    if (results.affectedRows === 0) {
      const error = new Error("Empresa no encontrada");
      error.status = 404;
      throw error;
    }
    res.status(200).json({ message: "Empresa eliminada correctamente" });
  } catch (error) {
    const err = error.status ? error : new Error("Error al eliminar empresa");
    err.status = error.status || 500;
    err.cause = error;
    next(err);
  }
};

// Importar empresas desde CSV
const uploadEmpresas = async (req, res, next) => {
  if (!req.file) {
    const error = new Error("No se proporcionó un archivo CSV");
    error.status = 400;
    return next(error);
  }

  const results = {
    insertedCount: 0,
    existingCount: 0,
    invalidEmailCount: 0,
    invalidTamanoCount: 0,
    invalidSociedadCount: 0,
    missingFieldsCount: 0,
  };

  let decodedBuffer;
  try {
    decodedBuffer = iconv.decode(req.file.buffer, "utf8").replace(/^\uFEFF/, "");
  } catch (error) {
    try {
      decodedBuffer = iconv.decode(req.file.buffer, "win1252");
    } catch (error2) {
      decodedBuffer = iconv.decode(req.file.buffer, "latin1");
    }
  }
  const utf8Buffer = iconv.encode(decodedBuffer, "utf8");
  const stream = Readable.from(utf8Buffer);

  try {
    const records = [];
    await new Promise((resolve, reject) => {
      stream
        .pipe(parse({ columns: true, skip_empty_lines: true, trim: true, bom: true }))
        .on("data", (record) => records.push(record))
        .on("end", resolve)
        .on("error", reject);
    });

    for (let rowIndex = 2; rowIndex <= records.length + 1; rowIndex++) {
      const record = records[rowIndex - 2];
      const cleanField = (field) => {
        if (!field) return null;
        let cleaned = String(field)
          .replace(/[\x00-\x1F\x7F-\x9F\u200B-\u200F\u2028-\u202F\uFEFF\r\n]/g, "")
          .trim();
        return normalizeText(cleaned) || null;
      };
      const empresa_nombre = cleanField(record.empresa_nombre);
      const empresa_direccion = cleanField(record.empresa_direccion);
      const empresa_email = cleanField(record.empresa_email);
      const empresa_telefono = cleanField(record.empresa_telefono);
      const empresa_tamano = cleanField(record.empresa_tamano);
      const empresa_sociedad = cleanField(record.empresa_sociedad);
      const empresa_pagina_web = cleanField(record.empresa_pagina_web);

      // Validar campos obligatorios
      if (!empresa_nombre || !empresa_tamano || !empresa_sociedad) {
        results.missingFieldsCount++;
        continue;
      }

      // Validar correo
      if (!isValidEmail(empresa_email)) {
        results.invalidEmailCount++;
        continue;
      }

      // Validar empresa_tamano
      if (!tamanosPermitidos.includes(empresa_tamano)) {
        results.invalidTamanoCount++;
        continue;
      }

      // Validar empresa_sociedad
      if (!sociedadesPermitidas.includes(empresa_sociedad)) {
        results.invalidSociedadCount++;
        continue;
      }

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // Verificar si el nombre ya existe
        const [existingEmpresa] = await connection.query("SELECT id_empresa FROM empresa WHERE empresa_nombre = ?", [empresa_nombre]);
        if (existingEmpresa.length > 0) {
          results.existingCount++;
          await connection.rollback();
          continue;
        }

        // Generar RFC
        const empresa_rfc = await generateRFC(empresa_nombre);

        // Insertar la empresa
        const [insertResult] = await connection.query(
          "INSERT INTO empresa (empresa_rfc, empresa_nombre, empresa_direccion, empresa_email, empresa_telefono, empresa_tamano, empresa_sociedad, empresa_pagina_web) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            empresa_rfc,
            empresa_nombre,
            empresa_direccion || null,
            empresa_email || null,
            empresa_telefono || null,
            empresa_tamano,
            empresa_sociedad,
            empresa_pagina_web || null,
          ]
        );

        if (insertResult.affectedRows === 1) {
          results.insertedCount++;
          await connection.commit();
        } else {
          results.missingFieldsCount++;
          await connection.rollback();
        }
      } catch (error) {
        await connection.rollback();
        results.missingFieldsCount++;
        console.error(`Error en fila ${rowIndex}:`, error.message);
      } finally {
        connection.release();
      }
    }

    res.status(200).json(results);
  } catch (error) {
    const err = new Error("Error al procesar el archivo CSV");
    err.status = 500;
    err.cause = error;
    next(err);
  }
};

// Rutas
router.get("/", getEmpresas);
router.get("/:id_empresa", getEmpresaById);
router.post("/", postEmpresa);
router.put("/:id_empresa", updateEmpresa);
router.delete("/:id_empresa", deleteEmpresa);
router.post("/upload", upload.single("file"), uploadEmpresas);

// Exportar router y middleware
export { router as default, errorHandler };