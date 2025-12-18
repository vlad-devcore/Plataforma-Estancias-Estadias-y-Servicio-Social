// backend/src/routes/authMiddleware.js
import jwt from "jsonwebtoken";
import pool from "../config/config.db.js";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware principal de autenticación
 * Verifica el token JWT y carga los datos del usuario
 */
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar que el usuario existe y está activo
    const [users] = await pool.query(
      "SELECT id_user, email, role, nombre, apellido_paterno, apellido_materno FROM users WHERE id_user = ?", 
      [decoded.id]
    );
    
    if (users.length === 0) {
      return res.status(403).json({ error: "Usuario no encontrado" });
    }

    // Guardar información completa del usuario en req.user
    req.user = {
      id: users[0].id_user,
      email: users[0].email,
      role: users[0].role,
      nombre: users[0].nombre,
      apellido_paterno: users[0].apellido_paterno,
      apellido_materno: users[0].apellido_materno
    };
    
    next();
  } catch (error) {
    console.error("Error en autenticación:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: "Token inválido" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: "Token expirado" });
    }
    
    return res.status(403).json({ error: "Error de autenticación" });
  }
};

/**
 * Middleware para validar roles específicos
 * Uso: checkRole(['admin', 'estudiante'])
 */
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: "Usuario no autenticado correctamente" });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: "Acceso no autorizado para tu rol",
        requiredRoles: roles,
        userRole: req.user.role
      });
    }
    
    next();
  };
};

/**
 * Middleware para validar que solo ADMIN puede acceder
 */
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: "Acceso restringido: Solo administradores" 
    });
  }
  next();
};

/**
 * Middleware para validar que el usuario solo accede a sus propios recursos
 * Compara req.user.id con req.params.id
 */
export const isOwnerOrAdmin = (req, res, next) => {
  const resourceUserId = parseInt(req.params.id);
  const currentUserId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isAdmin && resourceUserId !== currentUserId) {
    return res.status(403).json({ 
      error: "No tienes permiso para acceder a este recurso" 
    });
  }
  
  next();
};

/**
 * Validación de pertenencia de documento
 * Verifica que el documento pertenece al usuario actual (o que es admin)
 */
export const validateDocumentOwnership = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Si es admin, puede acceder a cualquier documento
    if (isAdmin) {
      return next();
    }

    // Verificar que el documento pertenece al usuario
    const [documents] = await pool.query(
      "SELECT id_user FROM documentos WHERE id_documento = ?",
      [documentId]
    );

    if (documents.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    if (documents[0].id_user !== userId) {
      return res.status(403).json({ 
        error: "No tienes permiso para acceder a este documento" 
      });
    }

    next();
  } catch (error) {
    console.error("Error validando pertenencia de documento:", error);
    return res.status(500).json({ error: "Error al validar permisos" });
  }
};

/**
 * Validación de pertenencia de empresa
 * Verifica que la empresa pertenece al usuario actual (o que es admin)
 */
export const validateEmpresaOwnership = async (req, res, next) => {
  try {
    const empresaId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Si es admin, puede acceder a cualquier empresa
    if (isAdmin) {
      return next();
    }

    // Verificar que la empresa pertenece al usuario
    const [empresas] = await pool.query(
      "SELECT id_estudiante FROM empresas WHERE id_empresa = ?",
      [empresaId]
    );

    if (empresas.length === 0) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    if (empresas[0].id_estudiante !== userId) {
      return res.status(403).json({ 
        error: "No tienes permiso para acceder a esta empresa" 
      });
    }

    next();
  } catch (error) {
    console.error("Error validando pertenencia de empresa:", error);
    return res.status(500).json({ error: "Error al validar permisos" });
  }
};

/**
 * Validación para operaciones que requieren ser el dueño del recurso
 * Uso genérico verificando campo user_id en cualquier tabla
 */
export const validateResourceOwnership = (tableName, idField = 'id', userField = 'id_user') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idField];
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';

      if (isAdmin) {
        return next();
      }

      const [rows] = await pool.query(
        `SELECT ${userField} FROM ${tableName} WHERE ${idField} = ?`,
        [resourceId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Recurso no encontrado" });
      }

      if (rows[0][userField] !== userId) {
        return res.status(403).json({ 
          error: "No tienes permiso para acceder a este recurso" 
        });
      }

      next();
    } catch (error) {
      console.error(`Error validando pertenencia en ${tableName}:`, error);
      return res.status(500).json({ error: "Error al validar permisos" });
    }
  };
};