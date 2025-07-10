import express from "express";
import pool from "../config/config.db.js";
import { parse } from 'csv-parse';
import multer from 'multer';
import iconv from 'iconv-lite';
import { Readable } from 'stream';

const router = express.Router();

// Configuración de multer para procesar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname || !file.originalname.toLowerCase().endsWith('.csv')) {
      return cb(new Error('Solo se permiten archivos CSV'));
    }
    cb(null, true);
  },
});

// Validaciones
const isValidEmail = (email) => {
  if (!email || email.trim() === '') return true; // Correo vacío es válido
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Normalizar texto para manejar tildes mal codificadas
const normalizeText = (text) => {
  if (!text) return text;
  return text
    .replace(/�/g, '') // Eliminar carácter de reemplazo
    .replace(/á|à|â|ã/g, 'á')
    .replace(/é|è|ê/g, 'é')
    .replace(/í|ì|î/g, 'í')
    .replace(/ó|ò|ô|õ/g, 'ó')
    .replace(/ú|ù|û/g, 'ú')
    .replace(/ñ|Ñ/g, 'ñ')
    .trim();
};

// Generar RFC automáticamente basado en nombre con autoincremento global de 5 dígitos
const generateRFC = async (nombre) => {
  const nombrePrefix = normalizeText(nombre)
    .toUpperCase()
    .replace(/[^A-Z]/g, '') // Solo letras mayúsculas
    .slice(0, 3)
    .padEnd(3, 'X'); // 3 letras del nombre, rellena con X si es menor
  const [nextIdResult] = await pool.query('SELECT AUTO_INCREMENT AS next_id FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = "empresa"');
  const nextNumber = nextIdResult[0].next_id || 1; // Usa el próximo id_empresa como base
  return `${nombrePrefix}${String(nextNumber).padStart(5, '0')}`;
};

// Listas de valores permitidos
const tamanosPermitidos = ["Grande", "Mediana", "Pequeña"];
const sociedadesPermitidas = ["Privada", "Pública"];

// Obtener todas las empresas
const getEmpresas = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM empresa");
    res.status(200).json(results);
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener empresa por ID
const getEmpresaById = async (req, res) => {
  const { id_empresa } = req.params;
  try {
    const [results] = await pool.query("SELECT * FROM empresa WHERE id_empresa = ?", [id_empresa]);
    if (results.length === 0) return res.status(404).json({ error: "Empresa no encontrada" });
    res.status(200).json(results[0]);
  } catch (error) {
    console.error("Error al obtener la empresa:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Crear una nueva empresa
const postEmpresa = async (req, res) => {
  const { empresa_nombre, empresa_direccion, empresa_email, empresa_telefono, empresa_tamano, empresa_sociedad, empresa_pagina_web } = req.body;

  // Validar campos obligatorios
  if (!empresa_nombre || !empresa_tamano || !empresa_sociedad) {
    return res.status(400).json({ error: "Faltan campos obligatorios (nombre, tamaño o sociedad)" });
  }

  // Validar valores permitidos para empresa_tamano
  if (!tamanosPermitidos.includes(empresa_tamano)) {
    return res.status(400).json({ error: "El tamaño debe ser 'Grande', 'Mediana' o 'Pequeña'" });
  }

  // Validar valores permitidos para empresa_sociedad
  if (!sociedadesPermitidas.includes(empresa_sociedad)) {
    return res.status(400).json({ error: "La sociedad debe ser 'Privada' o 'Pública'" });
  }

  // Validar correo
  if (!isValidEmail(empresa_email)) {
    return res.status(400).json({ error: "El correo electrónico no es válido" });
  }

  // Generar RFC automáticamente
  const empresa_rfc = await generateRFC(empresa_nombre);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Verificar si el nombre ya existe
    const [existingEmpresa] = await connection.query("SELECT id_empresa FROM empresa WHERE empresa_nombre = ?", [empresa_nombre]);
    if (existingEmpresa.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: "Ya existe una empresa con este nombre" });
    }

    // Insertar empresa
    const [results] = await connection.query(
      "INSERT INTO empresa (empresa_rfc, empresa_nombre, empresa_direccion, empresa_email, empresa_telefono, empresa_tamano, empresa_sociedad, empresa_pagina_web) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [empresa_rfc, empresa_nombre, empresa_direccion || null, empresa_email || null, empresa_telefono || null, empresa_tamano, empresa_sociedad, empresa_pagina_web || null]
    );

    // Obtener la empresa creada
    const [newEmpresa] = await connection.query("SELECT * FROM empresa WHERE id_empresa = ?", [results.insertId]);
    await connection.commit();
    res.status(201).json(newEmpresa[0]);
  } catch (error) {
    await connection.rollback();
    console.error("Error al agregar empresa:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    connection.release();
  }
};

// Actualizar una empresa
const updateEmpresa = async (req, res) => {
  const { id_empresa } = req.params;
  const { empresa_nombre, empresa_direccion, empresa_email, empresa_telefono, empresa_tamano, empresa_sociedad, empresa_pagina_web } = req.body;

  // Validar campos obligatorios
  if (!empresa_nombre || !empresa_tamano || !empresa_sociedad) {
    return res.status(400).json({ error: "Faltan campos obligatorios (nombre, tamaño o sociedad)" });
  }

  // Validar valores permitidos para empresa_tamano
  if (!tamanosPermitidos.includes(empresa_tamano)) {
    return res.status(400).json({ error: "El tamaño debe ser 'Grande', 'Mediana' o 'Pequeña'" });
  }

  // Validar valores permitidos para empresa_sociedad
  if (!sociedadesPermitidas.includes(empresa_sociedad)) {
    return res.status(400).json({ error: "La sociedad debe ser 'Privada' o 'Pública'" });
  }

  // Validar correo
  if (!isValidEmail(empresa_email)) {
    return res.status(400).json({ error: "El correo electrónico no es válido" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Verificar si la empresa existe
    const [empresaExistente] = await connection.query("SELECT id_empresa FROM empresa WHERE id_empresa = ?", [id_empresa]);
    if (empresaExistente.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    // Verificar si el nombre ya existe en otra empresa
    const [existingEmpresa] = await connection.query("SELECT id_empresa FROM empresa WHERE empresa_nombre = ? AND id_empresa != ?", [empresa_nombre, id_empresa]);
    if (existingEmpresa.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: "Ya existe una empresa con este nombre" });
    }

    // Generar nuevo RFC si el nombre cambió
    const currentEmpresa = await connection.query("SELECT empresa_nombre FROM empresa WHERE id_empresa = ?", [id_empresa]);
    const new_rfc = (currentEmpresa[0][0].empresa_nombre !== empresa_nombre) 
      ? await generateRFC(empresa_nombre)
      : currentEmpresa[0][0].empresa_rfc;

    // Actualizar empresa
    const [results] = await connection.query(
      "UPDATE empresa SET empresa_rfc = ?, empresa_nombre = ?, empresa_direccion = ?, empresa_email = ?, empresa_telefono = ?, empresa_tamano = ?, empresa_sociedad = ?, empresa_pagina_web = ? WHERE id_empresa = ?",
      [new_rfc, empresa_nombre, empresa_direccion || null, empresa_email || null, empresa_telefono || null, empresa_tamano, empresa_sociedad, empresa_pagina_web || null, id_empresa]
    );

    if (results.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    // Obtener la empresa actualizada
    const [updatedEmpresa] = await connection.query("SELECT * FROM empresa WHERE id_empresa = ?", [id_empresa]);
    await connection.commit();
    res.status(200).json(updatedEmpresa[0]);
  } catch (error) {
    await connection.rollback();
    console.error("Error al actualizar empresa:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    connection.release();
  }
};

// Eliminar empresa
const deleteEmpresa = async (req, res) => {
  const { id_empresa } = req.params;
  try {
    const [results] = await pool.query("DELETE FROM empresa WHERE id_empresa = ?", [id_empresa]);
    if (results.affectedRows === 0) return res.status(404).json({ error: "Empresa no encontrada" });
    res.status(200).json({ message: "Empresa eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar empresa:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Importar empresas desde CSV
const uploadEmpresas = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se proporcionó un archivo CSV" });
  }

  const results = {
    insertedCount: 0,
    existingCount: 0,
    invalidEmailCount: 0,
    invalidTamanoCount: 0,
    invalidSociedadCount: 0,
    missingFieldsCount: 0,
  };

  // Convertir el buffer y manejar múltiples codificaciones
  let decodedBuffer;
  try {
    // Intentar UTF-8 primero y eliminar BOM si existe
    decodedBuffer = iconv.decode(req.file.buffer, 'utf8');
    if (decodedBuffer.startsWith('\uFEFF')) {
      decodedBuffer = decodedBuffer.substring(1); // Eliminar BOM
    }
  } catch (error) {
    console.error("Error al decodificar con UTF-8, intentando win1252:", error);
    try {
      decodedBuffer = iconv.decode(req.file.buffer, 'win1252');
    } catch (error2) {
      console.error("Error al decodificar con win1252, intentando latin1:", error2);
      decodedBuffer = iconv.decode(req.file.buffer, 'latin1');
    }
  }
  const utf8Buffer = iconv.encode(decodedBuffer, 'utf8');
  const stream = Readable.from(utf8Buffer);

  try {
    const records = [];
    await new Promise((resolve, reject) => {
      stream
        .pipe(parse({ columns: true, skip_empty_lines: true, trim: true, bom: true }))
        .on('data', (record) => records.push(record))
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Procesando ${records.length} registros del CSV`);

    for (let rowIndex = 2; rowIndex <= records.length + 1; rowIndex++) {
      const record = records[rowIndex - 2];
      const cleanField = (field) => {
        if (!field) return null;
        let cleaned = String(field)
          .replace(/[\x00-\x1F\x7F-\x9F\u200B-\u200F\u2028-\u202F\uFEFF\r\n]/g, '') // Eliminar BOM, caracteres de control, y saltos de línea
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

      console.log(`Fila ${rowIndex} (cruda):`, record);
      console.log(`Fila ${rowIndex} (limpia):`, {
        empresa_nombre,
        empresa_direccion,
        empresa_email,
        empresa_telefono,
        empresa_tamano,
        empresa_sociedad,
        empresa_pagina_web,
      });

      // Validar campos obligatorios
      if (!empresa_nombre || !empresa_tamano || !empresa_sociedad) {
        console.log(`Fila ${rowIndex}: Faltan campos obligatorios`);
        results.missingFieldsCount++;
        continue;
      }

      // Validar correo
      if (!isValidEmail(empresa_email)) {
        console.log(`Fila ${rowIndex}: Correo inválido`);
        results.invalidEmailCount++;
        continue;
      }

      // Validar empresa_tamano
      if (!tamanosPermitidos.includes(empresa_tamano)) {
        console.log(`Fila ${rowIndex}: Tamaño inválido`);
        results.invalidTamanoCount++;
        continue;
      }

      // Validar empresa_sociedad
      if (!sociedadesPermitidas.includes(empresa_sociedad)) {
        console.log(`Fila ${rowIndex}: Sociedad inválida`);
        results.invalidSociedadCount++;
        continue;
      }

      // Verificar si el nombre ya existe
      const [existingEmpresa] = await pool.query("SELECT id_empresa FROM empresa WHERE empresa_nombre = ?", [empresa_nombre]);
      if (existingEmpresa.length > 0) {
        console.log(`Fila ${rowIndex}: Ya existe una empresa con el nombre '${empresa_nombre}'`);
        results.existingCount++;
        continue;
      }

      // Generar RFC automáticamente
      const empresa_rfc = await generateRFC(empresa_nombre);

      // Procesar inserción con transacción individual
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // Insertar la empresa
        const [insertResult] = await connection.query(
          "INSERT INTO empresa (empresa_rfc, empresa_nombre, empresa_direccion, empresa_email, empresa_telefono, empresa_tamano, empresa_sociedad, empresa_pagina_web) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [empresa_rfc, empresa_nombre, empresa_direccion || null, empresa_email || null, empresa_telefono || null, empresa_tamano, empresa_sociedad, empresa_pagina_web || null]
        );

        if (insertResult.affectedRows === 1) {
          results.insertedCount++;
          console.log(`Empresa insertada en fila ${rowIndex}: ${empresa_rfc} (id_empresa: ${insertResult.insertId})`);
          await connection.commit();
        } else {
          console.error(`Fila ${rowIndex}: Inserción fallida, no se afectaron filas`);
          results.missingFieldsCount++;
          await connection.rollback();
        }
      } catch (error) {
        console.error(`Error al insertar en fila ${rowIndex}:`, error);
        results.missingFieldsCount++;
        await connection.rollback();
      } finally {
        connection.release();
      }
    }

    console.log('Procesamiento del CSV finalizado. Resultados:', results);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error al importar empresas:", error);
    res.status(500).json({ error: "Error al procesar el archivo CSV" });
  }
};

router.post('/upload', upload.single('file'), uploadEmpresas);
router.get("/", getEmpresas);
router.get("/:id_empresa", getEmpresaById);
router.post("/", postEmpresa);
router.put("/:id_empresa", updateEmpresa);
router.delete("/:id_empresa", deleteEmpresa);

export default router;