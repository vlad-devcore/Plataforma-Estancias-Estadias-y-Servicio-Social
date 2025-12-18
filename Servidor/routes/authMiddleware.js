// backend/src/routes/authMiddleware.js
import jwt from "jsonwebtoken";
import pool from "../config/config.db.js";
import { authenticateToken, checkRole } from "./authMiddleware.js";


const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [users] = await pool.query("SELECT * FROM users WHERE id_user = ?", [decoded.id]);
    if (users.length === 0) return res.sendStatus(403);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error en autenticación:", error);
    res.sendStatus(403);
  }
};

export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acceso no autorizado para tu rol" });
    }
    next();
  };
};