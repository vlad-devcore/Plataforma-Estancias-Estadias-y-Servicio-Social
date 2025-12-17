import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import pool from "../config/config.db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "tu_secreto_super_seguro_123!";

/* =====================================================
   UTILIDAD: NORMALIZAR ROLES
   BD → sistema interno
===================================================== */
const normalizeRole = (role) => {
  if (!role) return null;

  const map = {
    administrador: "admin",
    coordinador: "coordinador",
    asesor_academico: "asesor_academico",
    asesor_empresarial: "asesor_empresarial",
    estudiante: "estudiante",
  };

  return map[role] || role;
};

/* =====================================================
   MIDDLEWARE JWT
===================================================== */
const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Acceso denegado, token requerido" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, nombre, id_entidad }
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

/* =====================================================
   LOGIN
===================================================== */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Correo electrónico y contraseña son obligatorios" });
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

    const normalizedRole = normalizeRole(user.role);

    const token = jwt.sign(
      {
        id: user.id_user,
        email: user.email,
        role: normalizedRole,
        nombre: user.nombre,
        id_entidad: user.id_user,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id_user,
        email: user.email,
        nombre: user.nombre,
        apellido_paterno: user.apellido_paterno,
        apellido_materno: user.apellido_materno,
        role: normalizedRole,
        genero: user.genero,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* =====================================================
   VERIFY TOKEN
===================================================== */
router.get("/verify", authMiddleware, async (req, res) => {
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
        role: normalizeRole(user.role),
        genero: user.genero,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* =====================================================
   CHANGE PASSWORD
===================================================== */
router.post("/change-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const id_user = req.user.id;

  try {
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Se requieren ambas contraseñas" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "La nueva contraseña debe tener al menos 8 caracteres" });
    }

    const [users] = await pool.query(
      "SELECT password FROM users WHERE id_user = ?",
      [id_user]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const passwordMatch = await bcrypt.compare(
      oldPassword,
      users[0].password
    );

    if (!passwordMatch) {
      return res.status(401).json({ error: "Contraseña actual incorrecta" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = ? WHERE id_user = ?",
      [hashedPassword, id_user]
    );

    res.json({ message: "Contraseña cambiada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* =====================================================
   REQUEST PASSWORD RESET
===================================================== */
router.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await pool.query(
      "SELECT id_user FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at, used)
       VALUES (?, ?, ?, false)`,
      [users[0].id_user, token, expiresAt]
    );

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"UPQROO" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Restablecimiento de contraseña",
      html: `<p>Haz clic aquí para restablecer tu contraseña:</p>
             <a href="${resetUrl}">${resetUrl}</a>`,
    });

    res.json({ message: "Enlace enviado al correo" });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;