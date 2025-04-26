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

// Inserción masiva desde CSV
router.post('/upload', upload.single('file'), async (req, res) => {
  console.log('POST /api/users/upload - Iniciar carga de CSV:', req.file?.originalname);
  if (!req.file) {
    console.error('No se proporcionó un archivo CSV');
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
    let headersLogged = false;
    const stream = Readable.from(utf8Buffer);
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv({ separator: ',', mapHeaders: ({ header }) => {
          const normalizedHeader = header.trim().toLowerCase();
          if (!headersLogged) {
            console.log('Encabezados del CSV:', normalizedHeader);
            headersLogged = true;
          }
          return normalizedHeader;
        }, encoding: 'utf-8' }))
        .on('data', (data) => {
          console.log('Fila cruda del CSV:', data);
          results.push(data);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Procesando ${results.length} filas del CSV`);

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

      console.log(`Validando fila ${index + 2}:`, userData);

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
        console.log(`Generando contraseña para ${userData.email}: ${userData.password}`);
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
        console.log(`Usuario insertado: ${userData.email}, id_user: ${userId}`);
      } catch (userError) {
        await connection.rollback();
        console.error(`Error al insertar usuario en fila ${index + 2} (${userData.email}):`, userError.message);
        errors.push(`Fila ${index + 2}: Error al insertar usuario: ${userError.message}`);
      }
    }

    console.log(`Usuarios insertados: ${insertedCount}, Existentes: ${existingEmails.length}, Duplicados: ${duplicateEmails.length}, Errores: ${errors.length}`);

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
    console.error('Error general al procesar el archivo CSV:', error.message);
    res.status(400).json({ error: error.message || 'Error al procesar el archivo CSV', details: errors });
  } finally {
    connection.release();
  }
});

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/users - Obtener todos los usuarios');
    const [results] = await pool.query('SELECT * FROM users');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener usuario por ID
router.get('/:id_user', async (req, res) => {
  const { id_user } = req.params;
  try {
    console.log(`GET /api/users/${id_user} - Obtener usuario por ID`);
    const [results] = await pool.query('SELECT * FROM users WHERE id_user = ?', [id_user]);
    if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un usuario manualmente
router.post('/', async (req, res) => {
  const { email, password, nombre, apellido_paterno, apellido_materno, genero, role } = req.body;
  console.log('POST /api/users - Datos recibidos:', { email, password, nombre, apellido_paterno, apellido_materno, genero, role });

  const validationError = validateUserData(req.body, true); // Requerir password
  if (validationError) {
    console.error('Error de validación:', validationError);
    return res.status(400).json({ error: validationError });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query('SELECT id_user FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      throw new Error('El email ya está registrado');
    }

    console.log('Hasheando contraseña:', password);
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
    console.log(`Usuario creado con id_user: ${userId}`);
    res.status(201).json({ message: 'Usuario añadido correctamente', id_user: userId });
  } catch (error) {
    await connection.rollback();
    console.error('Error al agregar usuario:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  } finally {
    connection.release();
  }
});

// Actualizar un usuario
router.put('/:id_user', async (req, res) => {
  const { id_user } = req.params;
  const { email, nombre, apellido_paterno, apellido_materno, genero, role } = req.body;

  console.log(`PUT /api/users/${id_user} - Datos recibidos:`, req.body);

  const validationError = validateUserData({ email, nombre, apellido_paterno, role }, false); // No requerir password
  if (validationError) {
    console.error('Error de validación:', validationError);
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
    console.log(`Usuario actualizado con id_user: ${id_user}`);
    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar usuario:', error);
    res.status(error.message === 'Usuario no encontrado' ? 404 : 500).json({
      error: error.message || 'Error interno del servidor',
    });
  } finally {
    connection.release();
  }
});

// Eliminar un usuario
router.delete('/:id_user', async (req, res) => {
  const { id_user } = req.params;
  console.log(`DELETE /api/users/${id_user} - Eliminar usuario`);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [results] = await connection.query('DELETE FROM users WHERE id_user = ?', [id_user]);
    if (results.affectedRows === 0) {
      throw new Error('Usuario no encontrado');
    }

    await connection.commit();
    console.log(`Usuario eliminado con id_user: ${id_user}`);
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar usuario:', error);
    res.status(error.message === 'Usuario no encontrado' ? 404 : 500).json({
      error: error.message || 'Error interno del servidor',
    });
  } finally {
    connection.release();
  }
});

export default router;