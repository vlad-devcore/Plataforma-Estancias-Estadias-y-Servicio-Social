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

    // Verificar que el usuario exista
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
   VERIFICACIÓN DE ROLES
===================================================== */
export const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: "Información de usuario no disponible" });
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
   VERIFICACIÓN DE PROPIEDAD (OWNERSHIP)
===================================================== */
export const checkOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const resourceId = parseInt(req.params.id_Documento || req.params.id, 10);

      if (!resourceId || isNaN(resourceId)) {
        return res.status(400).json({ error: "ID de recurso inválido" });
      }

      // Admin y coordinador pueden acceder a todo
      if (["admin", "coordinador"].includes(req.user.role)) {
        return next();
      }

      let query;
      let params;

      switch (resourceType) {
        case "documento":
          query = `SELECT id_usuario FROM documentos WHERE id_Documento = ?`;
          params = [resourceId];
          break;

        default:
          return res.status(500).json({ error: "Tipo de recurso no soportado" });
      }

      const [results] = await pool.query(query, params);

      if (results.length === 0) {
        return res.status(404).json({ error: "Recurso no encontrado" });
      }

      if (results[0].id_usuario !== userId) {
        return res.status(403).json({ error: "No tienes permiso para este recurso" });
      }

      next();
    } catch (error) {
      console.error("Error en checkOwnership:", error.message);
      res.status(500).json({ error: "Error verificando permisos" });
    }
  };
};

/* =====================================================
   VALIDACIÓN DE IDS NUMÉRICOS
===================================================== */
export const validateNumericId = (req, res, next) => {
  const id = req.params.id || req.params.id_Documento;

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
