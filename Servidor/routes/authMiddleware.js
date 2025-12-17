// routes/authMiddleware.js
import jwt from "jsonwebtoken";
import pool from "../config/config.db.js";

const JWT_SECRET = process.env.JWT_SECRET || "tu_secreto_super_seguro_123!";

/* =====================================================
   AUTENTICACIÓN JWT
===================================================== */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token de autenticación requerido" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const [users] = await pool.query(
      `SELECT id_user, email, role
       FROM users
       WHERE id_user = ?`,
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Usuario no válido" });
    }

    req.user = {
      id: users[0].id_user,
      email: users[0].email,
      role: users[0].role
    };

    next();
  } catch (error) {
    console.error("Error en authenticateToken:", error.message);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

/* =====================================================
   CONTROL DE ROLES
===================================================== */
export const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: "Rol de usuario no disponible" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Acceso no autorizado",
        requiredRoles: roles,
        yourRole: req.user.role
      });
    }

    next();
  };
};

/* =====================================================
   PREVENCIÓN DE ESCALAMIENTO DE PRIVILEGIOS
===================================================== */
export const preventPrivilegeEscalation = (req, res, next) => {
  const forbiddenFields = ["role", "id_user", "password"];

  for (const field of forbiddenFields) {
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, field)) {
      return res.status(403).json({
        error: `No está permitido modificar el campo: ${field}`
      });
    }
  }

  next();
};

/* =====================================================
   VALIDACIÓN DE IDS NUMÉRICOS
===================================================== */
export const validateNumericId = (req, res, next) => {
  const id = req.params.id || req.params.id_user;

  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: "ID inválido" });
  }

  next();
};

/* =====================================================
   ALIASES DE ROLES
===================================================== */
export const adminOnly = checkRole(["admin"]);
export const adminOrCoordinator = checkRole(["admin", "coordinador"]);
