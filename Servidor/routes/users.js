import express from 'express';
import pool from '../config/config.db.js';
import multer from 'multer';
import { Readable } from 'stream';
import csv from 'csv-parser';

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

// Obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    console.log('GET /api/users - Obtener todos los usuarios');
    const [results] = await pool.query('SELECT * FROM users');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener usuario por ID
const getUserById = async (req, res) => {
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
};

// Función para extraer los números antes del @ en el correo
const extractNumbersFromEmail = (email) => {
  if (!email) return '0000';
  const numbers = email.split('@')[0].replace(/\D/g, '');
  return numbers || '0000';
};

// Validar datos del usuario
const validateUserData = (data) => {
  const { email, password, nombre, apellido_paterno, role } = data;
  if (!email || !password || !nombre || !apellido_paterno || !role) {
    return 'Faltan campos obligatorios (email, password, nombre, apellido_paterno, role)';
  }
  if (!['estudiante', 'administrador', 'asesor_academico', 'asesor_empresarial'].includes(role)) {
    return `Rol no válido: ${role}`;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return `Email no válido: ${email}`;
  }
  return null;
};

// Agregar un nuevo usuario
const postUser = async (req, res) => {
  const { email, password, nombre, apellido_paterno, apellido_materno, genero, role } = req.body;
  console.log('POST /api/users - Datos recibidos:', req.body);

  const validationError = validateUserData(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Verificar si el email ya existe
    const [existing] = await connection.query('SELECT id_user FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      throw new Error('El email ya está registrado');
    }

    // Insertar usuario en `users`
    const [result] = await connection.query(
      'INSERT INTO users (email, password, nombre, apellido_paterno, apellido_materno, genero, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, password, nombre, apellido_paterno, apellido_materno, genero, role]
    );

    const userId = result.insertId;

    // Insertar en la tabla correspondiente según el rol
    switch (role) {
      case 'estudiante':
        const matricula = `${extractNumbersFromEmail(email)}`;
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
      default:
        throw new Error(`Rol no válido: ${role}`);
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
};

// Actualizar usuario
const updateUser = async (req, res) => {
  const { id_user } = req.params;
  const { email, password, nombre, apellido_paterno, apellido_materno, genero, role } = req.body;

  console.log(`PUT /api/users/${id_user} - Datos recibidos:`, req.body);

  const validationError = validateUserData(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Verificar si el email ya existe en otro usuario
    const [existing] = await connection.query('SELECT id_user FROM users WHERE email = ? AND id_user != ?', [
      email,
      id_user,
    ]);
    if (existing.length > 0) {
      throw new Error('El email ya está registrado por otro usuario');
    }

    const [results] = await connection.query(
      'UPDATE users SET email = ?, password = ?, nombre = ?, apellido_paterno = ?, apellido_materno = ?, genero = ?, role = ? WHERE id_user = ?',
      [email, password, nombre, apellido_paterno, apellido_materno, genero, role, id_user]
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
};

// Eliminar usuario
const deleteUser = async (req, res) => {
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
};

// Inserción masiva desde CSV
router.post('/upload', upload.single('file'), async (req, res) => {
  console.log('POST /api/users/upload - Iniciar carga de CSV');
  if (!req.file) {
    console.error('No se proporcionó un archivo CSV');
    return res.status(400).json({ error: 'No se ha proporcionado un archivo CSV' });
  }

  const connection = await pool.getConnection();
  const validRoles = ['estudiante', 'administrador', 'asesor_academico', 'asesor_empresarial'];
  let processedRows = 0;
  let errors = [];

  try {
    await connection.beginTransaction();

    const results = [];
    const stream = Readable.from(req.file.buffer);
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv({ separator: ',', mapHeaders: ({ header }) => header.trim().toLowerCase() }))
        .on('data', (data) => {
          console.log('Fila cruda del CSV:', data);
          results.push(data);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Procesando ${results.length} filas del CSV`);

    for (const [index, row] of results.entries()) {
      const userData = {
        email: row.email?.trim(),
        password: row.password?.trim(),
        nombre: row.nombre?.trim(),
        apellido_paterno: row.apellido_paterno?.trim(),
        apellido_materno: row.apellido_materno?.trim() || null,
        genero: row.genero?.trim() || null,
        role: row.role?.trim(),
      };

      console.log(`Validando fila ${index + 2}:`, userData);

      const validationError = validateUserData(userData);
      if (validationError) {
        errors.push(`Fila ${index + 2}: ${validationError}`);
        continue;
      }

      try {
        // Verificar si el email ya existe
        const [existing] = await connection.query('SELECT id_user FROM users WHERE email = ?', [
          userData.email,
        ]);
        if (existing.length > 0) {
          errors.push(`Fila ${index + 2}: El email ${userData.email} ya está registrado`);
          continue;
        }

        // Insertar usuario en `users`
        const [result] = await connection.query(
          'INSERT INTO users (email, password, nombre, apellido_paterno, apellido_materno, genero, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            userData.email,
            userData.password,
            userData.nombre,
            userData.apellido_paterno,
            userData.apellido_materno,
            userData.genero,
            userData.role,
          ]
        );

        const userId = result.insertId;
        processedRows++;

        // Insertar en la tabla correspondiente según el rol
        switch (userData.role) {
          case 'estudiante':
            const matricula = `${extractNumbersFromEmail(userData.email)}`;
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
          default:
            throw new Error(`Rol no válido: ${userData.role}`);
        }
        console.log(`Usuario insertado con id_user: ${userId}`);
      } catch (err) {
        errors.push(`Fila ${index + 2}: ${err.message}`);
      }
    }
 
    if (errors.length > 0 && processedRows === 0) {
      await connection.rollback();
      console.error('Errores al procesar CSV:', errors);
      return res.status(400).json({ error: 'No se procesaron usuarios', details: errors });
    } 
 
    await connection.commit();
    console.log(`Usuarios procesados: ${processedRows}, Errores: ${errors.length}`);
    res.status(201).json({
      message: `Se procesaron ${processedRows} usuarios`,
      total: processedRows,
      errors: errors.length > 0 ? errors : undefined,
    }); 
  } catch (error) {
    await connection.rollback();
    console.error('Error al procesar el archivo CSV:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  } finally {
    connection.release();
  }
});

// Definir rutas
router.get('/', getUsers);
router.get('/:id_user', getUserById);
router.post('/', postUser);
router.put('/:id_user', updateUser);
router.delete('/:id_user', deleteUser);

export default router;