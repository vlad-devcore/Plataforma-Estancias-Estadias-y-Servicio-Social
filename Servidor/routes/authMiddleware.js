// backend/src/routes/authMiddleware.js
import jwt from "jsonwebtoken";
import pool from "../config/config.db.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware de autenticación mejorado
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Token de autenticación requerido" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar que el usuario existe y está activo
    const [users] = await pool.query(
      "SELECT id_user, email, role, status FROM users WHERE id_user = ?", 
      [decoded.id]
    );
    
    if (users.length === 0) {
      return res.status(403).json({ error: "Usuario no encontrado" });
    }

    // Verificar si el usuario está activo (opcional, depende de tu DB)
    if (users[0].status === 'inactive' || users[0].status === 'blocked') {
      return res.status(403).json({ error: "Cuenta inactiva o bloqueada" });
    }

    // Agregar información completa del usuario al request
    req.user = {
      id: users[0].id_user,
      email: users[0].email,
      role: users[0].role
    };
    
    next();
  } catch (error) {
    console.error("Error en autenticación:", error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expirado" });
    }
    return res.status(403).json({ error: "Token inválido" });
  }
};

// Middleware para verificar roles específicos
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: "Información de usuario no disponible" });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: "Acceso no autorizado para tu rol",
        requiredRoles: roles,
        yourRole: req.user.role
      });
    }
    next();
  };
};

// Middleware para verificar que el usuario solo accede a sus propios recursos
export const checkOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const resourceId = req.params.id;

      let query;
      let params;

      switch (resourceType) {
        case 'documento':
          query = "SELECT id_user FROM documentos WHERE id_documento = ?";
          params = [resourceId];
          break;
        
        case 'user':
          // Para usuarios, solo pueden modificar su propio perfil
          if (parseInt(resourceId) !== parseInt(userId)) {
            return res.status(403).json({ 
              error: "Solo puedes modificar tu propio perfil" 
            });
          }
          return next();
        
        default:
          return res.status(500).json({ error: "Tipo de recurso no especificado" });
      }

      const [results] = await pool.query(query, params);

      if (results.length === 0) {
        return res.status(404).json({ error: "Recurso no encontrado" });
      }

      // Verificar que el recurso pertenece al usuario o es admin
      if (results[0].id_user !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: "No tienes permiso para acceder a este recurso" 
        });
      }

      next();
    } catch (error) {
      console.error("Error verificando propiedad:", error);
      res.status(500).json({ error: "Error verificando permisos" });
    }
  };
};

// Middleware para solo admin
export const adminOnly = checkRole(['admin']);

// Middleware para admin y coordinador
export const adminOrCoordinator = checkRole(['admin', 'coordinador']);

// Middleware para prevenir modificación de campos sensibles
export const preventPrivilegeEscalation = (req, res, next) => {
  const sensitiveFields = ['role', 'status', 'permissions', 'is_admin'];
  
  // Si no es admin, remover campos sensibles del body
  if (req.user.role !== 'admin') {
    sensitiveFields.forEach(field => {
      if (req.body[field] !== undefined) {
        delete req.body[field];
        console.warn(`Usuario ${req.user.id} intentó modificar campo sensible: ${field}`);
      }
    });
  }
  
  next();
};

// Middleware para validar IDs numéricos
export const validateNumericId = (req, res, next) => {
  const id = req.params.id;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "ID inválido" });
  }
  
  next();
};