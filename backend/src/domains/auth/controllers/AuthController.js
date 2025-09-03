/**
 * Controlador de Autenticación - SAT-Digital
 * Maneja endpoints de login, registro, refresh, logout
 * 
 * @author SAT-Digital Team
 * @version 1.0.0
 * @since Checkpoint 1.3
 */

const AuthService = require('../services/AuthService');
const { businessRules } = require('../validators/authValidators');
const { registrarBitacora } = require('../../../shared/utils/bitacora');
const logger = require('../../../shared/utils/logger');

class AuthController {
  
  /**
   * POST /api/v1/auth/login
   * Autenticación de usuario
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Información de la petición para logs
      const requestInfo = {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      };

      logger.info(`Intento de login para: ${email}`, {
        ip: requestInfo.ip,
        userAgent: requestInfo.userAgent
      });

      // Autenticar usuario
      const resultado = await AuthService.authenticateUser(email, password, requestInfo);

      if (!resultado.success) {
        return res.status(401).json({
          success: false,
          error: resultado.error,
          message: resultado.message
        });
      }

      // Login exitoso - configurar cookies (opcional para mayor seguridad)
      if (process.env.NODE_ENV === 'production') {
        res.cookie('sat_refresh_token', resultado.tokens.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });
      }

      logger.info(`Login exitoso para: ${email}`, {
        usuario_id: resultado.usuario.id,
        rol: resultado.usuario.rol,
        ip: requestInfo.ip
      });

      res.json({
        usuario: resultado.usuario,
        token: resultado.tokens.accessToken,
        refreshToken: resultado.tokens.refreshToken
      });

    } catch (error) {
      logger.error('Error en endpoint login:', {
        error: error.message,
        stack: error.stack,
        body: req.body
      });

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Renovar token JWT
   */
  static async refreshToken(req, res) {
    try {
      let { refreshToken } = req.body;

      // Si no viene en body, intentar obtener de cookies
      if (!refreshToken && req.cookies) {
        refreshToken = req.cookies.sat_refresh_token;
      }

      const requestInfo = {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      };

      const resultado = await AuthService.refreshAccessToken(refreshToken, requestInfo);

      if (!resultado.success) {
        return res.status(401).json({
          success: false,
          error: resultado.error,
          message: resultado.message
        });
      }

      logger.info('Token renovado exitosamente', {
        ip: requestInfo.ip
      });

      res.json({
        success: true,
        message: 'Token renovado exitosamente',
        data: {
          accessToken: resultado.accessToken,
          expiresIn: resultado.expiresIn,
          renewed_at: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error en endpoint refresh:', {
        error: error.message,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /api/v1/auth/register
   * Registro de nuevo usuario (solo admin)
   */
  static async register(req, res) {
    try {
      const datosUsuario = req.body;
      const usuarioCreador = req.usuario; // Viene del middleware de autenticación

      // Información de la petición
      const requestInfo = {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      };

      // Validaciones de reglas de negocio
      const emailDisponible = await businessRules.checkEmailAvailable(datosUsuario.email);
      if (!emailDisponible) {
        return res.status(400).json({
          success: false,
          error: 'EMAIL_ALREADY_EXISTS',
          message: 'Ya existe un usuario con ese email'
        });
      }

      const proveedorExiste = await businessRules.checkProviderExists(datosUsuario.proveedor_id);
      if (!proveedorExiste) {
        return res.status(400).json({
          success: false,
          error: 'PROVIDER_NOT_FOUND',
          message: 'El proveedor especificado no existe'
        });
      }

      // Verificar que el usuario creador puede asignar ese rol
      const puedeCrearRol = AuthService.canCreateRole(usuarioCreador.rol, datosUsuario.rol);
      if (!puedeCrearRol) {
        return res.status(403).json({
          success: false,
          error: 'INSUFFICIENT_PERMISSIONS',
          message: `No tiene permisos para crear usuarios con rol: ${datosUsuario.rol}`
        });
      }

      // Registrar usuario
      const resultado = await AuthService.registerUser(datosUsuario, usuarioCreador, requestInfo);

      if (!resultado.success) {
        return res.status(400).json({
          success: false,
          error: resultado.error,
          message: resultado.message
        });
      }

      logger.info(`Usuario registrado exitosamente: ${resultado.usuario.email}`, {
        nuevo_usuario_id: resultado.usuario.id,
        rol: resultado.usuario.rol,
        creado_por: usuarioCreador.email,
        ip: requestInfo.ip
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          usuario: resultado.usuario,
          created_at: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error en endpoint register:', {
        error: error.message,
        stack: error.stack,
        body: req.body
      });

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Cerrar sesión
   */
  static async logout(req, res) {
    try {
      const usuarioId = req.usuario.id;

      const requestInfo = {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      };

      const resultado = await AuthService.logout(usuarioId, requestInfo);

      if (!resultado.success) {
        return res.status(400).json({
          success: false,
          error: resultado.error,
          message: resultado.message
        });
      }

      // Limpiar cookies si existen
      if (req.cookies && req.cookies.sat_refresh_token) {
        res.clearCookie('sat_refresh_token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }

      logger.info(`Logout exitoso para usuario: ${req.usuario.email}`, {
        usuario_id: usuarioId,
        ip: requestInfo.ip
      });

      res.json({
        success: true,
        message: 'Logout exitoso',
        data: {
          logged_out_at: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error en endpoint logout:', {
        error: error.message,
        stack: error.stack,
        usuario_id: req.usuario?.id
      });

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/auth/me
   * Obtener información del usuario actual
   */
  static async me(req, res) {
    try {
      const usuario = req.usuario; // Viene del middleware de autenticación

      logger.debug(`Consulta de perfil para usuario: ${usuario.email}`, {
        usuario_id: usuario.id,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Información de usuario obtenida',
        data: {
          usuario: {
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol,
            proveedor: usuario.proveedor,
            estado: usuario.estado,
            permisos: usuario.permisos,
            ultimo_acceso: usuario.ultimo_acceso
          },
          session: {
            authenticated_at: new Date().toISOString(),
            ip: req.ip
          }
        }
      });

    } catch (error) {
      logger.error('Error en endpoint me:', {
        error: error.message,
        stack: error.stack,
        usuario_id: req.usuario?.id
      });

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /api/v1/auth/change-password
   * Cambiar password del usuario actual
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const usuario = req.usuario;

      const requestInfo = {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      };

      // Verificar password actual
      const bcrypt = require('bcryptjs');
      const { Usuario } = require('../../../shared/database/models');
      
      const usuarioCompleto = await Usuario.findByPk(usuario.id);
      const passwordValido = await bcrypt.compare(currentPassword, usuarioCompleto.password_hash);

      if (!passwordValido) {
        await registrarBitacora(
          usuario.id,
          'CAMBIO_PASSWORD_FALLIDO',
          'Usuario',
          usuario.id,
          'Intento de cambio de password con password actual incorrecto',
          requestInfo
        );

        return res.status(400).json({
          success: false,
          error: 'CURRENT_PASSWORD_INVALID',
          message: 'Password actual incorrecto'
        });
      }

      // Actualizar password
      const nuevoPasswordHash = await bcrypt.hash(newPassword, 12);
      await usuarioCompleto.update({
        password_hash: nuevoPasswordHash,
        token_refresh: null // Invalidar todas las sesiones
      });

      await registrarBitacora(
        usuario.id,
        'CAMBIO_PASSWORD_EXITOSO',
        'Usuario',
        usuario.id,
        'Password cambiado exitosamente',
        requestInfo
      );

      logger.info(`Password cambiado para usuario: ${usuario.email}`, {
        usuario_id: usuario.id,
        ip: requestInfo.ip
      });

      res.json({
        success: true,
        message: 'Password cambiado exitosamente. Debe iniciar sesión nuevamente.',
        data: {
          password_changed_at: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error en endpoint change-password:', {
        error: error.message,
        stack: error.stack,
        usuario_id: req.usuario?.id
      });

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/auth/roles
   * Obtener roles disponibles (solo admin)
   */
  static async getRoles(req, res) {
    try {
      const roles = AuthService.getAvailableRoles();

      res.json({
        success: true,
        message: 'Roles disponibles obtenidos',
        data: {
          roles: roles,
          total_roles: Object.values(roles).flat().length
        }
      });

    } catch (error) {
      logger.error('Error en endpoint roles:', {
        error: error.message,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = AuthController;
