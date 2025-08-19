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
      console.error('Faltan correo electrónico o contraseña');
      return res.status(400).json({ error: "Correo electrónico y contraseña son obligatorios" });
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
      console.error('Faltan contraseña actual o nueva contraseña');
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

  console.log(`POST /api/auth/request-password-reset - Solicitud de recuperación para: ${email}`);

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    console.error(`Correo electrónico inválido: ${email}`);
    return res.status(400).json({ error: 'Correo electrónico inválido' });
  }

  try {
    const [users] = await pool.query('SELECT id_user FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      console.error(`Usuario no encontrado para recuperación: ${email}`);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userId = users[0].id_user;
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 900000); // 15 minutos

    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at, used) VALUES (?, ?, ?, ?)',
      [userId, token, expiresAt, false]
    );

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // false para 587, true para 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Opcional, para evitar problemas con certificados no confiables (usa con precaución)
      },
    });

    // Verifica la conexión antes de enviar
    transporter.verify((error, success) => {
      if (error) {
        console.error('Error al conectar con el servidor de correo:', error);
      } else {
        console.log('Conexión exitosa al servidor de correo');
      }
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const mailOptions = {
      from: `"Universidad Politécnica de Quintana Roo" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Restablecimiento de Contraseña - UPQROO',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <img src="https://i.imgur.com/dJtjnin.png" alt="UPQROO Logo" style="display: block; margin: 0 auto; height: 80px;">
            <h2 style="color: #1a202c; text-align: center; margin-top: 20px;">Restablecimiento de Contraseña</h2>
            <p style="color: #4a5568; line-height: 1.6; text-align: center;">
              Estimado usuario, hemos recibido una solicitud para restablecer la contraseña de tu cuenta en el sistema de la Universidad Politécnica de Quintana Roo.
            </p>
            <p style="color: #4a5568; line-height: 1.6; text-align: center;">
              Por favor, haz clic en el siguiente botón para proceder con el restablecimiento:
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer Contraseña</a>
            </div>
            <p style="color: #4a5568; line-height: 1.6; text-align: center;">
              Este enlace es válido por 15 minutos. Si no solicitaste este cambio, por favor ignora este correo o contacta a nuestro equipo de soporte.
            </p>
          </div>
          <div style="margin-top: 20px; text-align: center; color: #718096;">
            <p>Universidad Politécnica de Quintana Roo</p>
            <p><a href="mailto:soporte@upqroo.edu.mx" style="color: #f97316; text-decoration: none;">soporte@upqroo.edu.mx</a> | <a href="https://www.upqroo.edu.mx" style="color: #f97316; text-decoration: none;">www.upqroo.edu.mx</a></p>
            <p style="font-size: 12px; margin-top: 10px;">© 2025 UPQROO. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Enlace de recuperación enviado a: ${email}`);
    res.status(200).json({ message: 'Enlace de recuperación enviado al correo' });
  } catch (error) {
    console.error('Error en solicitud de recuperación:', error);
    if (error.code === 'EAUTH') {
      return res.status(500).json({ error: 'Error de autenticación en el servidor de correo' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Restablecer contraseña
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  console.log(`POST /api/auth/reset-password - Intento de restablecimiento con token`);

  try {
    // Validar entrada
    if (!token || !newPassword) {
      console.error('Faltan token o nueva contraseña');
      return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
    }

    if (newPassword.length < 8) {
      console.error('Nueva contraseña demasiado corta');
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
    }

    // Verificar token
    const [tokens] = await pool.query(
      'SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = ?',
      [token]
    );
    if (tokens.length === 0 || tokens[0].used || new Date() > new Date(tokens[0].expires_at)) {
      console.error('Token inválido o expirado:', token);
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await pool.query('UPDATE users SET password = ? WHERE id_user = ?', [hashedPassword, tokens[0].user_id]);

    // Marcar token como usado
    await pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE token = ?', [token]);

    console.log(`Contraseña restablecida para user_id: ${tokens[0].user_id}`);
    res.status(200).json({ message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    console.error('Error en restablecimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;