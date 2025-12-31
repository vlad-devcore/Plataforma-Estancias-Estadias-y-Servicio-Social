// backend/src/routes/authMiddleware.js
import jwt from "jsonwebtoken";
import pool from "../config/config.db.js";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * ✅ MIDDLEWARE PRINCIPAL DE AUTENTICACIÓN
 * Verifica el token JWT y carga los datos del usuario en req.user
 * Uso: authenticateToken
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Extraer el token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: "Token no proporcionado",
        message: "Debes iniciar sesión para acceder a este recurso"
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar que el usuario existe y obtener sus datos actualizados
    const [users] = await pool.query(
      `SELECT id_user, email, role, nombre, apellido_paterno, apellido_materno 
       FROM users 
       WHERE id_user = ?`, 
      [decoded.id]
    );
    
    if (users.length === 0) {
      return res.status(403).json({ 
        error: "Usuario no encontrado",
        message: "El usuario asociado a este token no existe"
      });
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
    console.error("Error en autenticación:", error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: "Token inválido",
        message: "El token proporcionado no es válido"
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        error: "Token expirado",
        message: "Tu sesión ha expirado, por favor inicia sesión nuevamente"
      });
    }
    
    return res.status(500).json({ 
      error: "Error de autenticación",
      message: "Ocurrió un error al verificar tu identidad"
    });
  }
};

/**
 * ✅ VERIFICAR ROL ADMIN
 * Permite acceso SOLO a administradores
 * Uso: authenticateToken, requireAdmin
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: "No autenticado",
      message: "Debes estar autenticado para acceder"
    });
  }
  
  if (req.user.role !== 'administrador') {
    return res.status(403).json({ 
      error: "Acceso denegado",
      message: "Solo administradores pueden realizar esta acción",
      requiredRole: "administrador",
      yourRole: req.user.role
    });
  }
  
  next();
};

/**
 * ✅ VERIFICAR MÚLTIPLES ROLES
 * Permite acceso a usuarios con ciertos roles
 * Uso: authenticateToken, requireRoles(['administrador', 'estudiante'])
 */
export const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: "No autenticado",
        message: "Debes estar autenticado para acceder"
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: "Acceso denegado",
        message: `Necesitas uno de estos roles: ${allowedRoles.join(', ')}`,
        requiredRoles: allowedRoles,
        yourRole: req.user.role
      });
    }
    
    next();
  };
};

/**
 * ✅ VERIFICAR PROPIEDAD O ADMIN
 * Admin: acceso total
 * Usuario normal: solo acceso si req.params.id coincide con su user id
 * Uso: authenticateToken, requireOwnerOrAdmin
 */
export const requireOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: "No autenticado",
      message: "Debes estar autenticado para acceder"
    });
  }

  const resourceUserId = parseInt(req.params.id);
  const currentUserId = req.user.id;
  const isAdmin = req.user.role === 'administrador';

  // Admin tiene acceso total
  if (isAdmin) {
    return next();
  }

  // Usuario normal solo puede acceder a sus propios recursos
  if (resourceUserId !== currentUserId) {
    return res.status(403).json({ 
      error: "Acceso denegado",
      message: "No tienes permiso para acceder a este recurso"
    });
  }
  
  next();
};

/**
 * ✅ VALIDAR PROPIEDAD DE DOCUMENTO (SIMPLIFICADA Y SEGURA)
 * Admin: acceso a todos los documentos
 * Estudiante: solo acceso a sus propios documentos
 * Uso: authenticateToken, validateDocumentOwnership
 */
export const validateDocumentOwnership = async (req, res, next) => {
  try {
    // Verificar que req.user existe
    if (!req.user) {
      console.error('❌ req.user no existe en validateDocumentOwnership');
      return res.status(401).json({ 
        error: 'No autenticado',
        message: 'Debes estar autenticado para acceder'
      });
    }

    const { id_Documento } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`🔍 Validando documento ${id_Documento}`);
    console.log(`   Usuario: ${userId} (${userRole})`);

    // 1️⃣ Admin puede ver todo
    if (userRole === 'administrador') {
      console.log(`   ✅ Admin bypass`);
      return next();
    }

    // 2️⃣ Estudiante: validar propiedad directa
    const [rows] = await pool.query(
      `SELECT id_usuario
       FROM documentos
       WHERE id_Documento = ?`,
      [id_Documento]
    );

    if (rows.length === 0) {
      console.log(`   ❌ Documento ${id_Documento} no encontrado`);
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    console.log(`   Dueño del documento: ${rows[0].id_usuario}`);
    console.log(`   Usuario actual: ${userId}`);

    if (rows[0].id_usuario !== userId) {
      console.log(`   ❌ Acceso denegado (no es el dueño)`);
      return res.status(403).json({ error: 'Acceso denegado al documento' });
    }

    console.log(`   ✅ Validación exitosa`);
    next();
  } catch (error) {
    console.error('❌ Error validando propiedad de documento:', error);
    res.status(500).json({ error: 'Error validando acceso al documento' });
  }
};

/**
 * ✅ VALIDAR PROPIEDAD DE PROCESO
 * Admin: acceso a todos los procesos
 * Estudiante: solo acceso a sus propios procesos
 * Uso: authenticateToken, validateProcesoOwnership
 */
export const validateProcesoOwnership = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "No autenticado",
        message: "Debes estar autenticado para acceder"
      });
    }

    const procesoId = req.params.id || req.params.id_proceso;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'administrador';

    // ✅ Admin tiene acceso a cualquier proceso
    if (isAdmin) {
      return next();
    }

    // ❌ Verificar que el proceso pertenece al usuario
    const [procesos] = await pool.query(
      `SELECT e.id_usuario 
       FROM proceso p
       JOIN estudiantes e ON p.id_estudiante = e.id_estudiante
       WHERE p.id_proceso = ?`,
      [procesoId]
    );

    if (procesos.length === 0) {
      return res.status(404).json({ 
        error: "Proceso no encontrado",
        message: "El proceso que buscas no existe"
      });
    }

    if (procesos[0].id_usuario !== userId) {
      return res.status(403).json({ 
        error: "Acceso denegado",
        message: "No tienes permiso para acceder a este proceso"
      });
    }

    next();
  } catch (error) {
    console.error("Error validando propiedad de proceso:", error);
    return res.status(500).json({ 
      error: "Error al validar permisos",
      message: "Ocurrió un error al verificar los permisos del proceso"
    });
  }
};

/**
 * ✅ VALIDAR PROPIEDAD DE EMPRESA
 * Admin: acceso a todas las empresas
 * Estudiante: solo puede modificar/eliminar sus propias empresas (pero puede VER todas)
 * Uso: authenticateToken, validateEmpresaOwnership
 */
export const validateEmpresaOwnership = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "No autenticado",
        message: "Debes estar autenticado para acceder"
      });
    }

    const empresaId = req.params.id || req.params.id_empresa;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'administrador';

    // ✅ Admin tiene acceso a cualquier empresa
    if (isAdmin) {
      return next();
    }

    // ❌ Verificar que la empresa pertenece al usuario
    const [empresas] = await pool.query(
      `SELECT e.id_usuario 
       FROM empresas emp
       JOIN estudiantes e ON emp.id_estudiante = e.id_estudiante
       WHERE emp.id_empresa = ?`,
      [empresaId]
    );

    if (empresas.length === 0) {
      return res.status(404).json({ 
        error: "Empresa no encontrada",
        message: "La empresa que buscas no existe"
      });
    }

    if (empresas[0].id_usuario !== userId) {
      return res.status(403).json({ 
        error: "Acceso denegado",
        message: "No tienes permiso para modificar esta empresa"
      });
    }

    next();
  } catch (error) {
    console.error("Error validando propiedad de empresa:", error);
    return res.status(500).json({ 
      error: "Error al validar permisos",
      message: "Ocurrió un error al verificar los permisos de la empresa"
    });
  }
};

/**
 * ✅ MIDDLEWARE GENÉRICO PARA VALIDAR PROPIEDAD DE RECURSOS
 * Permite crear validaciones personalizadas para cualquier tabla
 * Uso: authenticateToken, validateResourceOwnership('tabla', 'campo_id', 'campo_usuario')
 */
export const validateResourceOwnership = (tableName, idField = 'id', userField = 'id_usuario') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: "No autenticado",
          message: "Debes estar autenticado para acceder"
        });
      }

      const resourceId = req.params[idField] || req.params.id;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'administrador';

      // ✅ Admin tiene acceso total
      if (isAdmin) {
        return next();
      }

      // ❌ Verificar propiedad del recurso
      const [rows] = await pool.query(
        `SELECT ${userField} FROM ${tableName} WHERE ${idField} = ?`,
        [resourceId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ 
          error: "Recurso no encontrado",
          message: `El recurso en ${tableName} no existe`
        });
      }

      if (rows[0][userField] !== userId) {
        return res.status(403).json({ 
          error: "Acceso denegado",
          message: "No tienes permiso para acceder a este recurso"
        });
      }

      next();
    } catch (error) {
      console.error(`Error validando propiedad en ${tableName}:`, error);
      return res.status(500).json({ 
        error: "Error al validar permisos",
        message: "Ocurrió un error al verificar los permisos"
      });
    }
  };
};

// ============================================================================
// EXPORTS LEGACY (para compatibilidad con código existente)
// ============================================================================

export const checkRole = requireRoles; // Alias
export const isAdmin = requireAdmin; // Alias
export const isOwnerOrAdmin = requireOwnerOrAdmin; // Alias