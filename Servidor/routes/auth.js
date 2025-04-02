import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/config.db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "tu_secreto_super_seguro_123!";

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query(
      `SELECT u.*, 
       CASE 
         WHEN u.role = 'estudiante' THEN e.matricula
         WHEN u.role = 'asesor_academico' THEN aa.id_asesor
         WHEN u.role = 'asesor_empresarial' THEN ae.id_asesor_empresarial
         WHEN u.role = 'administrador' THEN ad.id_admin
       END AS id_entidad
       FROM users u
       LEFT JOIN estudiantes e ON u.id_user = e.id_user
       LEFT JOIN asesores_academicos aa ON u.id_user = aa.id_user
       LEFT JOIN asesores_empresariales ae ON u.id_user = ae.id_user
       LEFT JOIN administradores ad ON u.id_user = ad.id_user
       WHERE u.email = ?`, 
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      {
        id: user.id_user,
        email: user.email,
        role: user.role,
        nombre: user.nombre,
        id_entidad: user.id_entidad
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
        role: user.role,
        apellido_paterno: user.apellido_paterno,
        apellido_materno: user.apellido_materno
      }
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