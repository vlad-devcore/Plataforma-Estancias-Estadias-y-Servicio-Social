import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import pool from "../config/config.db.js";
import { authenticateToken } from "./authMiddleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "tu_secreto_super_seguro_123!";

// ============================================================================
// 🔐 LOGIN
// ============================================================================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Correo electrónico y contraseña son obligatorios" });
    }

    const [users] = await pool.query(
      `SELECT id_user, email, nombre, apellido_paterno, apellido_materno, role, password, genero
       FROM users
       WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Correo electrónico no registrado" });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

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

// ============================================================================
// 🚪 LOGOUT - ¡NUEVA RUTA AGREGADA!
// ============================================================================
/**
 * POST /api/auth/logout
 * Cierra la sesión del usuario de forma segura
 * Requiere: Token JWT válido en el header Authorization
 */
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    // Información del usuario desde el token (proporcionada por authenticateToken)
    const userId = req.user.id;
    const userEmail = req.user.email;

    // OPCIONAL: Puedes registrar el logout en una tabla de auditoría
    // await pool.query(
    //   'INSERT INTO audit_log (user_id, action, timestamp) VALUES (?, ?, NOW())',
    //   [userId, 'LOGOUT']
    // );

    // Log del logout exitoso (para debugging/auditoría)
    console.log(`✅ Logout exitoso - Usuario: ${userEmail} (ID: ${userId})`);

    // Respuesta exitosa
    res.status(200).json({
      success: true,
      message: "Sesión cerrada exitosamente",
      user: {
        id: userId,
        email: userEmail
      }
    });

  } catch (error) {
    console.error("❌ Error en logout:", error);
    
    // Aunque falle algo en el servidor, permitimos que el logout continúe
    // El frontend limpiará el token de todas formas
    res.status(200).json({
      success: true,
      message: "Sesión cerrada (con advertencia)",
      warning: "El logout se completó pero hubo un error en el registro"
    });
  }
});

// ============================================================================
// ✅ VERIFY - Verifica token y obtiene información del usuario
// ============================================================================
router.get("/verify", authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id_user, email, nombre, apellido_paterno, apellido_materno, role, genero
       FROM users
       WHERE id_user = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
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

// ============================================================================
// 🔑 CHANGE PASSWORD - Cambiar contraseña estando autenticado
// ============================================================================
router.post("/change-password", authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const id_user = req.user.id;

  try {
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Se requieren ambas contraseñas" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "La nueva contraseña debe tener al menos 8 caracteres" });
    }

    const [users] = await pool.query('SELECT password FROM users WHERE id_user = ?', [id_user]);
    if (users.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, users[0].password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Contraseña actual incorrecta" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE id_user = ?',
      [hashedPassword, id_user]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Contraseña cambiada correctamente" });
  } catch (error) {
    console.error("Error en change-password:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ============================================================================
// 📧 REQUEST PASSWORD RESET - Solicitar enlace de recuperación
// ============================================================================
router.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Correo electrónico inválido' });
  }

  try {
    const [users] = await pool.query('SELECT id_user FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
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
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
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
    res.status(200).json({ message: 'Enlace de recuperación enviado al correo' });
  } catch (error) {
    console.error("Error en request-password-reset:", error);
    if (error.code === 'EAUTH') {
      return res.status(500).json({ error: 'Error de autenticación en el servidor de correo' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================================
// 🔓 RESET PASSWORD - Restablecer contraseña con token
// ============================================================================
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
    }

    const [tokens] = await pool.query(
      'SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = ?',
      [token]
    );
    if (tokens.length === 0 || tokens[0].used || new Date() > new Date(tokens[0].expires_at)) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query('UPDATE users SET password = ? WHERE id_user = ?', [hashedPassword, tokens[0].user_id]);

    await pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE token = ?', [token]);

    res.status(200).json({ message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    console.error("Error en reset-password:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;