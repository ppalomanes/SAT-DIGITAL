/**
 * Rutas de autenticación - SAT-Digital
 * Endpoints actualizados con controladores y validaciones completas
 * 
 * @author SAT-Digital Team
 * @version 1.0.0
 * @since Checkpoint 1.3
 */

const express = require('express');
const router = express.Router();

// Controladores y middleware
const AuthController = require('../controllers/AuthController');
const { 
  validateLogin, 
  validateRefreshToken, 
  validateRegister,
  validateChangePassword
} = require('../validators/authValidators');
const { 
  verificarToken, 
  verificarRol
} = require('../../../shared/middleware/authMiddleware');

/**
 * POST /api/auth/login
 * Autenticación de usuario
 */
router.post('/login', 
  validateLogin,
  AuthController.login
);

/**
 * POST /api/auth/refresh
 * Renovar token JWT
 */
router.post('/refresh',
  validateRefreshToken,
  AuthController.refreshToken
);

/**
 * POST /api/auth/register  
 * Registro de nuevo usuario (solo admin y roles autorizados)
 */
router.post('/register',
  verificarToken,
  verificarRol('administrador', 'auditor_general', 'jefe_proveedor'),
  validateRegister,
  AuthController.register
);

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
router.post('/logout',
  verificarToken,
  AuthController.logout
);

/**
 * GET /api/auth/me
 * Obtener información del usuario actual
 */
router.get('/me',
  verificarToken,
  AuthController.me
);

/**
 * POST /api/auth/change-password
 * Cambiar password del usuario actual
 */
router.post('/change-password',
  verificarToken,
  validateChangePassword,
  AuthController.changePassword
);

/**
 * GET /api/auth/roles
 * Obtener roles disponibles (solo admin)
 */
router.get('/roles',
  verificarToken,
  verificarRol('administrador'),
  AuthController.getRoles
);

/**
 * GET /api/auth/health
 * Health check del sistema de autenticación
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'SAT-Digital Authentication',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    features: {
      jwt_auth: true,
      rbac: true,
      refresh_tokens: true,
      rate_limiting: true,
      role_segregation: true
    }
  });
});

module.exports = router;
