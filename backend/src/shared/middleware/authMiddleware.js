const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { Usuario, Proveedor } = require('../database/models');
const logger = require('../utils/logger');

/**
 * Middleware para verificar token JWT
 */
const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Acceso denegado. Token requerido.',
        code: 'TOKEN_REQUIRED'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Obtener usuario actualizado de la base de datos
      const usuario = await Usuario.findByPk(decoded.id, {
        include: [{
          model: Proveedor,
          as: 'proveedor',
          attributes: ['id', 'razon_social', 'nombre_comercial', 'estado']
        }],
        attributes: { exclude: ['password_hash', 'token_refresh'] }
      });

      if (!usuario) {
        return res.status(401).json({
          message: 'Token inválido. Usuario no encontrado.',
          code: 'USER_NOT_FOUND'
        });
      }

      if (usuario.estado !== 'activo') {
        return res.status(403).json({
          message: 'Usuario inactivo.',
          code: 'USER_INACTIVE'
        });
      }

      // Verificar si el proveedor está activo (para usuarios de proveedor)
      if (usuario.proveedor && usuario.proveedor.estado !== 'activo') {
        return res.status(403).json({
          message: 'Proveedor inactivo.',
          code: 'PROVIDER_INACTIVE'
        });
      }

      req.usuario = usuario;
      req.token = token;
      
      next();

    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Token expirado.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: 'Token inválido.',
          code: 'TOKEN_INVALID'
        });
      }

      throw jwtError;
    }

  } catch (error) {
    logger.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Middleware para verificar rol específico
 */
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        message: 'Usuario no autenticado',
        code: 'USER_NOT_AUTHENTICATED'
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      logger.warn(`Intento de acceso denegado - Usuario: ${req.usuario.email}, Rol: ${req.usuario.rol}, Roles permitidos: ${rolesPermitidos.join(', ')}`);
      
      return res.status(403).json({
        message: 'Permisos insuficientes para esta operación',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: rolesPermitidos,
        userRole: req.usuario.rol
      });
    }

    next();
  };
};

/**
 * Middleware para verificar permisos específicos
 */
const verificarPermiso = (permisoRequerido) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        message: 'Usuario no autenticado',
        code: 'USER_NOT_AUTHENTICATED'
      });
    }

    const permisosPorRol = {
      'admin': ['*'], // Acceso total
      'auditor_general': [
        'read_audits', 'write_audits', 'read_providers', 'read_sites', 
        'read_users', 'write_reports', 'read_analytics', 'manage_periods'
      ],
      'auditor_interno': [
        'read_audits', 'write_audits', 'read_providers', 'read_sites', 
        'write_reports', 'read_analytics'
      ],
      'jefe_proveedor': [
        'read_own_audits', 'write_documents', 'read_own_sites', 
        'read_own_reports', 'manage_provider_users'
      ],
      'tecnico_proveedor': [
        'read_own_audits', 'write_documents', 'read_own_sites', 
        'read_own_reports'
      ],
      'visualizador': [
        'read_reports', 'read_analytics', 'read_audits'
      ]
    };

    const permisosUsuario = permisosPorRol[req.usuario.rol] || [];
    
    if (!permisosUsuario.includes('*') && !permisosUsuario.includes(permisoRequerido)) {
      return res.status(403).json({
        message: 'Permisos insuficientes para esta operación',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredPermission: permisoRequerido
      });
    }

    next();
  };
};

/**
 * Middleware para verificar segregación por proveedor
 * Los usuarios de proveedor solo pueden acceder a datos de su proveedor
 */
const verificarSegregacionProveedor = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      message: 'Usuario no autenticado',
      code: 'USER_NOT_AUTHENTICATED'
    });
  }

  // Admin y auditores pueden acceder a todo
  if (['admin', 'auditor_general', 'auditor_interno', 'visualizador'].includes(req.usuario.rol)) {
    return next();
  }

  // Para usuarios de proveedor, agregar filtro automático
  if (['jefe_proveedor', 'tecnico_proveedor'].includes(req.usuario.rol)) {
    if (!req.usuario.proveedor_id) {
      return res.status(403).json({
        message: 'Usuario de proveedor sin proveedor asignado',
        code: 'PROVIDER_NOT_ASSIGNED'
      });
    }

    // Agregar filtro de proveedor a la query
    req.filtroProveedor = req.usuario.proveedor_id;
  }

  next();
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero establece req.usuario si existe
 */
const usuarioOpcional = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const usuario = await Usuario.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash', 'token_refresh'] }
      });

      if (usuario && usuario.estado === 'activo') {
        req.usuario = usuario;
      }
    } catch (jwtError) {
      // Ignorar errores de JWT en middleware opcional
    }

    next();
  } catch (error) {
    logger.error('Error en middleware de usuario opcional:', error);
    next(); // Continuar sin usuario
  }
};

/**
 * Rate limiting por usuario
 */
const rateLimitUsuario = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana por usuario
  keyGenerator: (req) => {
    return req.usuario ? req.usuario.id.toString() : req.ip;
  },
  message: {
    message: 'Demasiadas solicitudes desde este usuario',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  verificarToken,
  verificarRol,
  verificarPermiso,
  verificarSegregacionProveedor,
  usuarioOpcional,
  rateLimitUsuario
};
