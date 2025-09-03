/**
 * Validadores de Autenticación - SAT-Digital
 * Validaciones con Zod para endpoints de autenticación
 * 
 * @author SAT-Digital Team
 * @version 1.0.0
 * @since Checkpoint 1.3
 */

const { z } = require('zod');

/**
 * Schema para validar login
 */
const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email es requerido'
    })
    .email({
      message: 'Formato de email inválido'
    })
    .toLowerCase()
    .trim(),
  password: z
    .string({
      required_error: 'Password es requerido'
    })
    .min(6, {
      message: 'Password debe tener al menos 6 caracteres'
    })
});

/**
 * Schema para validar refresh token
 */
const refreshTokenSchema = z.object({
  refreshToken: z
    .string({
      required_error: 'Refresh token es requerido'
    })
    .min(1, {
      message: 'Refresh token no puede estar vacío'
    })
});

/**
 * Schema para validar registro de usuario
 */
const registerSchema = z.object({
  email: z
    .string({
      required_error: 'Email es requerido'
    })
    .email({
      message: 'Formato de email inválido'
    })
    .toLowerCase()
    .trim(),
  password: z
    .string({
      required_error: 'Password es requerido'
    })
    .min(8, {
      message: 'Password debe tener al menos 8 caracteres'
    })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
      message: 'Password debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'
    }),
  confirmPassword: z
    .string({
      required_error: 'Confirmación de password es requerida'
    }),
  nombre: z
    .string({
      required_error: 'Nombre es requerido'
    })
    .min(2, {
      message: 'Nombre debe tener al menos 2 caracteres'
    })
    .max(100, {
      message: 'Nombre no puede exceder 100 caracteres'
    })
    .trim(),
  rol: z
    .enum(['admin', 'auditor_general', 'auditor_interno', 'jefe_proveedor', 'tecnico_proveedor', 'visualizador'], {
      required_error: 'Rol es requerido',
      invalid_type_error: 'Rol inválido'
    }),
  proveedor_id: z
    .number({
      invalid_type_error: 'Proveedor ID debe ser un número'
    })
    .positive({
      message: 'Proveedor ID debe ser positivo'
    })
    .optional()
    .nullable()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
}).refine((data) => {
  // Validar que proveedores tengan proveedor_id
  const rolesQueRequierenProveedor = ['jefe_proveedor', 'tecnico_proveedor'];
  if (rolesQueRequierenProveedor.includes(data.rol)) {
    return data.proveedor_id && data.proveedor_id > 0;
  }
  return true;
}, {
  message: 'Usuarios tipo proveedor deben tener un proveedor asignado',
  path: ['proveedor_id']
}).refine((data) => {
  // Validar que no-proveedores no tengan proveedor_id
  const rolesQueNoRequierenProveedor = ['admin', 'auditor_general', 'auditor_interno', 'visualizador'];
  if (rolesQueNoRequierenProveedor.includes(data.rol)) {
    return !data.proveedor_id;
  }
  return true;
}, {
  message: 'Este tipo de usuario no debe tener proveedor asignado',
  path: ['proveedor_id']
});

/**
 * Schema para validar cambio de password
 */
const changePasswordSchema = z.object({
  currentPassword: z
    .string({
      required_error: 'Password actual es requerido'
    })
    .min(1, {
      message: 'Password actual no puede estar vacío'
    }),
  newPassword: z
    .string({
      required_error: 'Nuevo password es requerido'
    })
    .min(8, {
      message: 'Nuevo password debe tener al menos 8 caracteres'
    })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
      message: 'Nuevo password debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'
    }),
  confirmNewPassword: z
    .string({
      required_error: 'Confirmación de nuevo password es requerida'
    })
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Las contraseñas nuevas no coinciden',
  path: ['confirmNewPassword']
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'El nuevo password debe ser diferente al actual',
  path: ['newPassword']
});

/**
 * Middleware para validar esquemas con Zod
 * @param {z.ZodSchema} schema - Esquema Zod a validar
 * @returns {Function} Middleware de validación
 */
const validateSchema = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Errores de validación en los datos enviados',
          errors: errors
        });
      }

      // Reemplazar req.body con datos validados y transformados
      req.body = result.data;
      next();

    } catch (error) {
      console.error('Error en validación:', error);
      return res.status(500).json({
        success: false,
        error: 'VALIDATION_SYSTEM_ERROR',
        message: 'Error interno en sistema de validación'
      });
    }
  };
};

/**
 * Middleware específicos para cada endpoint
 */
const validateLogin = validateSchema(loginSchema);
const validateRefreshToken = validateSchema(refreshTokenSchema);
const validateRegister = validateSchema(registerSchema);
const validateChangePassword = validateSchema(changePasswordSchema);

/**
 * Validar datos de usuario para actualización (sin password)
 */
const updateUserSchema = z.object({
  nombre: z
    .string()
    .min(2, { message: 'Nombre debe tener al menos 2 caracteres' })
    .max(100, { message: 'Nombre no puede exceder 100 caracteres' })
    .trim()
    .optional(),
  rol: z
    .enum(['admin', 'auditor_general', 'auditor_interno', 'jefe_proveedor', 'tecnico_proveedor', 'visualizador'])
    .optional(),
  proveedor_id: z
    .number()
    .positive({ message: 'Proveedor ID debe ser positivo' })
    .optional()
    .nullable(),
  estado: z
    .enum(['activo', 'inactivo', 'bloqueado'])
    .optional()
});

const validateUpdateUser = validateSchema(updateUserSchema);

/**
 * Validaciones adicionales para reglas de negocio
 */
const businessRules = {
  /**
   * Validar que el email no esté en uso
   */
  checkEmailAvailable: async (email, excludeUserId = null) => {
    const { Usuario } = require('../../../shared/database/models');
    
    const whereClause = { email: email.toLowerCase().trim() };
    if (excludeUserId) {
      whereClause.id = { [require('sequelize').Op.ne]: excludeUserId };
    }

    const existingUser = await Usuario.findOne({ where: whereClause });
    return !existingUser;
  },

  /**
   * Validar que el proveedor existe
   */
  checkProviderExists: async (providerId) => {
    if (!providerId) return true; // Es opcional para algunos roles
    
    const { Proveedor } = require('../../../shared/database/models');
    const proveedor = await Proveedor.findByPk(providerId);
    return !!proveedor;
  },

  /**
   * Validar coherencia rol-proveedor
   */
  validateRoleProviderConsistency: (rol, proveedor_id) => {
    const rolesQueRequierenProveedor = ['jefe_proveedor', 'tecnico_proveedor'];
    const rolesQueNoRequierenProveedor = ['admin', 'auditor_general', 'auditor_interno', 'visualizador'];

    if (rolesQueRequierenProveedor.includes(rol)) {
      return !!proveedor_id;
    }

    if (rolesQueNoRequierenProveedor.includes(rol)) {
      return !proveedor_id;
    }

    return false; // Rol no reconocido
  }
};

module.exports = {
  // Schemas
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  changePasswordSchema,
  updateUserSchema,
  
  // Middleware de validación
  validateLogin,
  validateRefreshToken,
  validateRegister,
  validateChangePassword,
  validateUpdateUser,
  validateSchema,
  
  // Reglas de negocio
  businessRules
};
