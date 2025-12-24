import express from 'express';
import pool from '../config/config.db.js';
import multer from 'multer';
import { Readable } from 'stream';
import csv from 'csv-parser';
import bcrypt from 'bcrypt';
import path from 'path';
import iconv from 'iconv-lite';

const router = express.Router();

// Configuración de multer para procesar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname || path.extname(file.originalname).toLowerCase() !== '.csv') {
      return cb(new Error('Solo se permiten archivos CSV'));
    }
    cb(null, true);
  },
});

// Middleware para verificar JWT
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado, token requerido' });
  }
  try {
    // Asume que verificas el token con jwt.verify
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Validar datos del usuario
const validateUserData = (data, requirePassword = true) => {
  const { email, nombre, apellido_paterno, role, password } = data;
  if (!email || !nombre || !apellido_paterno || !role) {
    return 'Faltan campos obligatorios (email, nombre, apellido_paterno, role)';
  }
  if (requirePassword && (password === undefined || password === null || password.trim() === '')) {
    return 'La contraseña es obligatoria';
  }
  if (!['estudiante', 'administrador', 'asesor_academico', 'asesor_empresarial'].includes(role)) {
    return `Rol no válido: ${role}`;
  }
  if (data.genero) {
    const normalizedGenero = data.genero.toLowerCase();
    if (!['masculino', 'femenino', 'otro'].includes(normalizedGenero)) {
      return `Género no válido: ${data.genero}`;
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return `Email no válido: ${email}`;
  }
  return null;
};

// Función para extraer el prefijo del correo
const getEmailPrefix = (email) => {
  if (!email) return 'default';
  return email.split('@')[0] || 'default';
};

// Obtener usuarios con paginación, búsqueda y filtro por rol
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const role = req.query.role || null;

    let query = `
      SELECT id_user, email, nombre, apellido_paterno, apellido_materno, genero, role
      FROM users
      WHERE email LIKE ?
    `;
    const queryParams = [search];

    if (role && role !== 'Todos') {
      query += ` AND role = ?`;
      queryParams.push(role);
    }

    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    // Obtener usuarios filtrados
    const [users] = await pool.query(query, queryParams);

    // Obtener total de usuarios filtrados
    let countQuery = `SELECT COUNT(*) as total FROM users WHERE email LIKE ?`;
    const countParams = [search];

    if (role && role !== 'Todos') {
      countQuery += ` AND role = ?`;
      countParams.push(role);
    }

    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.json({
      users,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Inserción masiva desde CSV
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha proporcionado un archivo CSV' });
  }

  const connection = await pool.getConnection();
  let insertedCount = 0;
  let errors = [];
  let existingEmails = [];
  let duplicateEmails = [];
  let insertedEmails = [];
  const processedEmails = new Set();

  try {
    // Convertir el buffer de Windows-1252 a UTF-8
    const decodedBuffer = iconv.decode(req.file.buffer, 'win1252');
    const utf8Buffer = iconv.encode(decodedBuffer, 'utf8');

    // Leer el CSV
    const results = [];
    const stream = Readable.from(utf8Buffer);
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv({ separator: ',', mapHeaders: ({ header }) => header.trim().toLowerCase(), encoding: 'utf-8' }))
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    // Procesar cada usuario individualmente
    for (const [index, row] of results.entries()) {
      const userData = {
        email: row.email?.trim(),
        nombre: row.nombre?.trim(),
        apellido_paterno: row.apellido_paterno?.trim(),
        apellido_materno: row.apellido_materno?.trim() || null,
        genero: row.genero?.trim() || null,
        role: row.role?.trim(),
        password: row.password?.trim() || getEmailPrefix(row.email),
      };

      // Validar datos del usuario
      const validationError = validateUserData(userData, false); // No requerir password
      if (validationError) {
        errors.push(`Fila ${index + 2}: ${validationError}`);
        continue;
      }

      // Verificar si el correo está duplicado en el CSV
      if (processedEmails.has(userData.email)) {
        duplicateEmails.push(userData.email);
        errors.push(`Fila ${index + 2}: Correo duplicado en el CSV: ${userData.email}`);
        continue;
      }
      processedEmails.add(userData.email);

      // Iniciar transacción para este usuario
      await connection.beginTransaction();

      try {
        // Verificar si el correo ya existe en la base de datos
        const [existing] = await connection.query('SELECT email FROM users WHERE email = ?', [userData.email]);
        if (existing.length > 0) {
          existingEmails.push(userData.email);
          errors.push(`Fila ${index + 2}: Correo ya registrado: ${userData.email}`);
          await connection.rollback();
          continue;
        }

        // Generar contraseña
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Insertar usuario en `users`
        const [result] = await connection.query(
          'INSERT INTO users (email, password, nombre, apellido_paterno, apellido_materno, genero, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            userData.email,
            hashedPassword,
            userData.nombre,
            userData.apellido_paterno,
            userData.apellido_materno,
            userData.genero ? userData.genero.toLowerCase() : null,
            userData.role,
          ]
        );

        const userId = result.insertId;
        insertedEmails.push(userData.email);

        // Insertar en tabla específica según el rol
        switch (userData.role) {
          case 'estudiante':
            const matricula = getEmailPrefix(userData.email);
            await connection.query('INSERT INTO estudiantes (id_user, matricula) VALUES (?, ?)', [
              userId,
              matricula,
            ]);
            break;
          case 'administrador':
            await connection.query('INSERT INTO administradores (id_user) VALUES (?)', [userId]);
            break;
          case 'asesor_academico':
            await connection.query('INSERT INTO asesores_academicos (id_user) VALUES (?)', [userId]);
            break;
          case 'asesor_empresarial':
            await connection.query('INSERT INTO asesores_empresariales (id_user) VALUES (?)', [userId]);
            break;
        }

        await connection.commit();
        insertedCount++;
      } catch (userError) {
        await connection.rollback();
        errors.push(`Fila ${index + 2}: Error al insertar usuario: ${userError.message}`);
      }
    }

    // Preparar respuesta
    const response = {
      message: `Se procesaron ${insertedCount} usuarios nuevos`,
      insertedCount,
      insertedEmails,
    };
    if (existingEmails.length > 0) response.existingEmails = [...new Set(existingEmails)];
    if (duplicateEmails.length > 0) response.duplicateEmails = [...new Set(duplicateEmails)];
    if (errors.length > 0) response.errors = errors;

    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message || 'Error al procesar el archivo CSV', details: errors });
  } finally {
    connection.release();
  }
});

// Obtener usuario por ID
router.get('/:id_user', authMiddleware, async (req, res) => {
  const { id_user } = req.params;
  try {
    const [results] = await pool.query('SELECT * FROM users WHERE id_user = ?', [id_user]);
    if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json(results[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un usuario manualmente
router.post('/', authMiddleware, async (req, res) => {
  const { email, password, nombre, apellido_paterno, apellido_materno, genero, role } = req.body;

  const validationError = validateUserData(req.body, true); // Requerir password
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query('SELECT id_user FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      throw new Error('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.query(
      'INSERT INTO users (email, password, nombre, apellido_paterno, apellido_materno, genero, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, nombre, apellido_paterno, apellido_materno, genero ? genero.toLowerCase() : null, role]
    );

    const userId = result.insertId;

    switch (role) {
      case 'estudiante':
        const matricula = getEmailPrefix(email);
        await connection.query('INSERT INTO estudiantes (id_user, matricula) VALUES (?, ?)', [
          userId,
          matricula,
        ]);
        break;
      case 'administrador':
        await connection.query('INSERT INTO administradores (id_user) VALUES (?)', [userId]);
        break;
      case 'asesor_academico':
        await connection.query('INSERT INTO asesores_academicos (id_user) VALUES (?)', [userId]);
        break;
      case 'asesor_empresarial':
        await connection.query('INSERT INTO asesores_empresariales (id_user) VALUES (?)', [userId]);
        break;
    }

    await connection.commit();
    res.status(201).json({ message: 'Usuario añadido correctamente', id_user: userId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  } finally {
    connection.release();
  }
});

// Actualizar un usuario
router.put('/:id_user', authMiddleware, async (req, res) => {
  const { id_user } = req.params;
  const { email, nombre, apellido_paterno, apellido_materno, genero, role } = req.body;

  const validationError = validateUserData({ email, nombre, apellido_paterno, role }, false); // No requerir password
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query('SELECT id_user FROM users WHERE email = ? AND id_user != ?', [
      email,
      id_user,
    ]);
    if (existing.length > 0) {
      throw new Error('El email ya está registrado por otro usuario');
    }

    const [results] = await connection.query(
      'UPDATE users SET email = ?, nombre = ?, apellido_paterno = ?, apellido_materno = ?, genero = ?, role = ? WHERE id_user = ?',
      [email, nombre, apellido_paterno, apellido_materno, genero ? genero.toLowerCase() : null, role, id_user]
    );

    if (results.affectedRows === 0) {
      throw new Error('Usuario no encontrado');
    }

    await connection.commit();
    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    await connection.rollback();
    res.status(error.message === 'Usuario no encontrado' ? 404 : 500).json({
      error: error.message || 'Error interno del servidor',
    });
  } finally {
    connection.release();
  }
});

// Eliminar un usuario
router.delete('/:id_user', authMiddleware, async (req, res) => {
  const { id_user } = req.params;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [results] = await connection.query('DELETE FROM users WHERE id_user = ?', [id_user]);
    if (results.affectedRows === 0) {
      throw new Error('Usuario no encontrado');
    }

    await connection.commit();
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    await connection.rollback();
    res.status(error.message === 'Usuario no encontrado' ? 404 : 500).json({
      error: error.message || 'Error interno del servidor',
    });
  } finally {
    connection.release();
  }
});

export default router;