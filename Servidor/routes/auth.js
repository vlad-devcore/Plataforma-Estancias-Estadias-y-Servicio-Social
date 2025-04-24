import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/config.db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "tu_secreto_super_seguro_123!";

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
      `SELECT id_user, email, nombre, apellido_paterno, apellido_materno, role, password
       FROM users
       WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      console.error(`Usuario no encontrado: ${email}`);
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const user = users[0];

    // Comparar contraseña con el hash almacenado
    const passwordMatch = await bcrypt.compare(password, user.password);
    //const passwordMatch = password === user.password; // Solo para pruebas

    if (!passwordMatch) {
      console.error(`Contraseña incorrecta para: ${email}`);
      return res.status(401).json({ error: "Credenciales incorrectas" });
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
        role: user.role,
        apellido_paterno: user.apellido_paterno,
        apellido_materno: user.apellido_materno,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/verify", (req, res) => {
  res.json({ message: "Ruta protegida accesible" });
});

export default router;