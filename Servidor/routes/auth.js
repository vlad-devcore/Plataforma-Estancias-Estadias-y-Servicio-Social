import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import pool from "../config/config.db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "tu_secreto_super_seguro_123!";

// Middleware para verificar JWT
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.error('Token no proporcionado');
    return res.status(401).json({ error: 'Acceso denegado, token requerido' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, nombre, id_entidad }
    next();
  } catch (error) {
    console.error('Token inválido:', error.message);
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log(`POST /api/auth/login - Intento de login con email: ${email}`);

  try {
    // Validar entrada
    if (!email || !password) {
      console.error('Faltan email o contraseña');
      return res.status(400).json({ error: "Email y contraseña son obligatorios" });
    }

    // Buscar usuario por email
    const [users] = await pool.query(
      `SELECT id_user, email, nombre, apellido_paterno, apellido_materno, role, password, genero
       FROM users
       WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      console.error(`Usuario no encontrado: ${email}`);
      return res.status(401).json({ error: "Correo electrónico no registrado" });
    }

    const user = users[0];

    // Comparar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.error(`Contraseña incorrecta para: ${email}`);
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id_user,
        email: user.email,
        role: user.role,
        nombre: user.nombre,
        id_entidad: user.id_user,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    console.log(`Login exitoso para: ${email}`);
    res.json({
      token,
      user: {
        id: user.id_user,
        email: user.email,
        nombre: user.nombre,
        apellido_paterno: user.apellido_paterno,
        apellido_materno: user.apellido_materno,
        role: user.role,
        genero: user.genero,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Verify
router.get("/verify", authMiddleware, async (req, res) => {
  try {
    console.log(`GET /api/auth/verify - Verificando usuario: ${req.user.email}`);
    const [users] = await pool.query(
      `SELECT id_user, email, nombre, apellido_paterno, apellido_materno, role, genero
       FROM users
       WHERE id_user = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      console.error(`Usuario no encontrado: id_user ${req.user.id}`);
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const user = users[0];
    res.json({
      user: {
        id: user.id_user,
        email: user.email,
        nombre: user.nombre,
        apellido_paterno: user.apellido_paterno,
        apellido_materno: user.apellido_materno,
        role: user.role,
        genero: user.genero,
      },
    });
  } catch (error) {
    console.error("Error en verify:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Change Password
router.post("/change-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const id_user = req.user.id;

  console.log(`POST /api/auth/change-password - Intento de cambio de contraseña para id_user: ${id_user}`);

  try {
    // Validar entrada
    if (!oldPassword || !newPassword) {
      console.error('Faltan oldPassword o newPassword');
      return res.status(400).json({ error: "Se requieren ambas contraseñas" });
    }

    if (newPassword.length < 8) {
      console.error('Nueva contraseña demasiado corta');
      return res.status(400).json({ error: "La nueva contraseña debe tener al menos 8 caracteres" });
    }

    // Verificar contraseña actual
    const [users] = await pool.query('SELECT password FROM users WHERE id_user = ?', [id_user]);
    if (users.length === 0) {
      console.error(`Usuario no encontrado: id_user ${id_user}`);
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, users[0].password);
    if (!passwordMatch) {
      console.error('Contraseña actual incorrecta');
      return res.status(401).json({ error: "Contraseña actual incorrecta" });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE id_user = ?',
      [hashedPassword, id_user]
    );

    if (result.affectedRows === 0) {
      console.error(`Error al actualizar contraseña para id_user: ${id_user}`);
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    console.log(`Contraseña cambiada para id_user: ${id_user}`);
    res.json({ message: "Contraseña cambiada correctamente" });
  } catch (error) {
    console.error("Error en change-password:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Solicitar enlace de recuperación
router.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;
  try {
    const [users] = await pool.query('SELECT id_user FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      console.error(`Usuario no encontrado para recuperación: ${email}`);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const userId = users[0].id_user;
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperación de Contraseña - UPQROO',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <img src="http://localhost:3000/logo512.png" alt="UPQROO Logo" style="height: 80px; margin-bottom: 20px;">
          <h2>Restablecer tu contraseña</h2>
          <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
          <a href="http://localhost:3000/reset-password?token=${token}" style="display: inline-block; padding: 10px 20px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
          <p>Este enlace expira en 1 hora.</p>
          <p>Si no solicitaste esto, ignora este correo.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Enlace de recuperación enviado a: ${email}`);
    res.status(200).json({ message: 'Enlace de recuperación enviado al correo' });
  } catch (error) {
    console.error('Error en solicitud de recuperación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Restablecer contraseña
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const [tokens] = await pool.query(
      'SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = ?',
      [token]
    );
    if (tokens.length === 0 || tokens[0].used || new Date() > new Date(tokens[0].expires_at)) {
      console.error('Token inválido o expirado:', token);
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }
    if (newPassword.length < 8) {
      console.error('Nueva contraseña demasiado corta');
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id_user = ?', [hashedPassword, tokens[0].user_id]);
    await pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE token = ?', [token]);
    console.log(`Contraseña restablecida para user_id: ${tokens[0].user_id}`);
    res.status(200).json({ message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    console.error('Error en restablecimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;