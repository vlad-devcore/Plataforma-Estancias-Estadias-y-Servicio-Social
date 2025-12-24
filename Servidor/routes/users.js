import express from 'express';
import pool from '../config/config.db.js';
import multer from 'multer';
import { Readable } from 'stream';
import csv from 'csv-parser';
import bcrypt from 'bcrypt';
import path from 'path';
import iconv from 'iconv-lite';
import { authenticateToken, checkRole } from './authMiddleware.js';

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

// ============= ENDPOINTS SEGUROS =============

// Obtener usuarios con paginación, búsqueda y filtro por rol (SOLO ADMIN)
router.get('/', authenticateToken, checkRole(['administrador']), async (req, res) => {
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

    const [users] = await pool.query(query, queryParams);

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
    console.error('Error en GET /users:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Inserción masiva desde CSV (SOLO ADMIN)
router.post('/upload', authenticateToken, checkRole(['administrador']), upload.single('file'), async (req, res) => {
  try {
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

        const validationError = validateUserData(userData, false);
        if (validationError) {
          errors.push(`Fila ${index + 2}: ${validationError}`);
          continue;
        }

        if (processedEmails.has(userData.email)) {
          duplicateEmails.push(userData.email);
          errors.push(`Fila ${index + 2}: Correo duplicado en el CSV: ${userData.email}`);
          continue;
        }
        processedEmails.add(userData.email);

        await connection.beginTransaction();

        try {
          const [existing] = await connection.query('SELECT email FROM users WHERE email = ?', [userData.email]);
          if (existing.length > 0) {
            existingEmails.push(userData.email);
            errors.push(`Fila ${index + 2}: Correo ya registrado: ${userData.email}`);
            await connection.rollback();
            continue;
          }

          const hashedPassword = await bcrypt.hash(userData.password, 10);

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
  } catch (error) {
    console.error('Error en POST /users/upload:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener usuario por ID (Admin ve cualquiera, usuario común solo ve su propio perfil)
router.get('/:id_user', authenticateToken, async (req, res) => {
  try {
    const { id_user } = req.params;
    const requestedId = parseInt(id_user);
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'administrador';

    // Usuario común solo puede ver su propio perfil
    if (!isAdmin && currentUserId !== requestedId) {
      return res.status(403).json({ error: 'Acceso denegado. Solo puedes ver tu propio perfil' });
    }

    const [results] = await pool.query(
      'SELECT id_user, email, nombre, apellido_paterno, apellido_materno, genero, role FROM users WHERE id_user = ?',
      [requestedId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Error en GET /users/:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un usuario manualmente (SOLO ADMIN)
router.post('/', authenticateToken, checkRole(['administrador']), async (req, res) => {
  try {
    const { email, password, nombre, apellido_paterno, apellido_materno, genero, role } = req.body;

    const validationError = validateUserData(req.body, true);
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
          await connection.query('INSERT INTO estudiantes (id_user, matricula) VALUES (?, ?)', [userId, matricula]);
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
  } catch (error) {
    console.error('Error en POST /users:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar un usuario (Admin actualiza cualquiera, usuario común solo su perfil Y NO PUEDE CAMBIAR ROL)
router.put('/:id_user', authenticateToken, async (req, res) => {
  try {
    const { id_user } = req.params;
    const requestedId = parseInt(id_user);
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'administrador';
    const { email, nombre, apellido_paterno, apellido_materno, genero, role } = req.body;

    // Usuario común solo puede editar su propio perfil
    if (!isAdmin && currentUserId !== requestedId) {
      return res.status(403).json({ error: 'Acceso denegado. Solo puedes editar tu propio perfil' });
    }

    // CRÍTICO: Usuario común NO puede cambiar su rol
    if (!isAdmin && role) {
      return res.status(403).json({ 
        error: 'Acceso denegado. No tienes permisos para modificar el rol de usuario' 
      });
    }

    // Obtener datos actuales del usuario
    const [currentUser] = await pool.query('SELECT role FROM users WHERE id_user = ?', [requestedId]);
    if (currentUser.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si no es admin, mantener el rol actual
    const finalRole = isAdmin && role ? role : currentUser[0].role;

    const validationError = validateUserData(
      { email, nombre, apellido_paterno, role: finalRole }, 
      false
    );
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Verificar email duplicado
      const [existing] = await connection.query(
        'SELECT id_user FROM users WHERE email = ? AND id_user != ?',
        [email, requestedId]
      );
      if (existing.length > 0) {
        throw new Error('El email ya está registrado por otro usuario');
      }

      const [results] = await connection.query(
        'UPDATE users SET email = ?, nombre = ?, apellido_paterno = ?, apellido_materno = ?, genero = ?, role = ? WHERE id_user = ?',
        [
          email, 
          nombre, 
          apellido_paterno, 
          apellido_materno, 
          genero ? genero.toLowerCase() : null, 
          finalRole, 
          requestedId
        ]
      );

      if (results.affectedRows === 0) {
        throw new Error('Usuario no encontrado');
      }

      await connection.commit();
      res.status(200).json({ 
        message: 'Usuario actualizado correctamente',
        warning: !isAdmin && role ? 'El cambio de rol fue ignorado. Solo administradores pueden modificar roles.' : null
      });
    } catch (error) {
      await connection.rollback();
      res.status(error.message === 'Usuario no encontrado' ? 404 : 500).json({
        error: error.message || 'Error interno del servidor',
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error en PUT /users/:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar un usuario (SOLO ADMIN)
router.delete('/:id_user', authenticateToken, checkRole(['administrador']), async (req, res) => {
  try {
    const { id_user } = req.params;
    const requestedId = parseInt(id_user);

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [results] = await connection.query('DELETE FROM users WHERE id_user = ?', [requestedId]);
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
  } catch (error) {
    console.error('Error en DELETE /users/:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;