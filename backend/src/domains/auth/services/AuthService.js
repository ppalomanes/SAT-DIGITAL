/**
 * Servicio de Autenticación - SAT-Digital
 * Maneja lógica de autenticación, JWT, refresh tokens y RBAC
 * 
 * @author SAT-Digital Team
 * @version 1.0.0
 * @since Checkpoint 1.3
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Usuario, Proveedor } = require('../../../shared/database/models');
const { registrarBitacora } = require('../../../shared/utils/bitacora');
const logger = require('../../../shared/utils/logger');

class AuthService {
  
  /**
   * Autenticar usuario con email y password
   * @param {string} email - Email del usuario
   * @param {string} password - Password en texto plano
   * @param {Object} requestInfo - Información de la petición (IP, user-agent)
   * @returns {Promise<Object>} Resultado de autenticación con tokens y usuario
   */
  static async authenticateUser(email, password, requestInfo = {}) {
    try {
      logger.info(`🔐 Intento de login para: ${email}`, {
        ip: requestInfo.ip,
        userAgent: requestInfo.userAgent
      });

      // Buscar usuario activo por email
      const usuario = await Usuario.findOne({
        where: { 
          email: email.toLowerCase().trim(),
          estado: 'activo'
        },
        include: [{
          model: Proveedor,
          as: 'proveedor',
          attributes: ['id', 'razon_social', 'nombre_comercial']
        }]
      });

      if (!usuario) {
        await registrarBitacora(
          null, 
          'LOGIN_FALLIDO', 
          'Usuario', 
          null,
          `Intento de login con email inexistente: ${email}`,
          requestInfo
        );
        
        logger.warn(`❌ Login fallido - Usuario no encontrado: ${email}`, {
          ip: requestInfo.ip
        });

        return {
          success: false,
          error: 'CREDENCIALES_INVALIDAS',
          message: 'Credenciales inválidas'
        };
      }

      // Verificar si usuario está bloqueado por intentos fallidos
      if (usuario.intentos_fallidos >= 5) {
        await registrarBitacora(
          usuario.id,
          'LOGIN_BLOQUEADO',
          'Usuario',
          usuario.id,
          `Usuario bloqueado por ${usuario.intentos_fallidos} intentos fallidos`,
          requestInfo
        );

        logger.warn(`🚫 Usuario bloqueado por intentos fallidos: ${email}`, {
          intentos: usuario.intentos_fallidos,
          ip: requestInfo.ip
        });

        return {
          success: false,
          error: 'USUARIO_BLOQUEADO',
          message: 'Usuario bloqueado por múltiples intentos fallidos. Contacte al administrador.'
        };
      }

      // Verificar password
      const passwordValido = await bcrypt.compare(password, usuario.password_hash);
      
      if (!passwordValido) {
        // Incrementar intentos fallidos
        await usuario.increment('intentos_fallidos');
        
        await registrarBitacora(
          usuario.id,
          'LOGIN_FALLIDO',
          'Usuario',
          usuario.id,
          `Password incorrecto. Intentos fallidos: ${usuario.intentos_fallidos + 1}`,
          requestInfo
        );

        logger.warn(`❌ Password incorrecto para: ${email}`, {
          intentosFallidos: usuario.intentos_fallidos + 1,
          ip: requestInfo.ip
        });

        return {
          success: false,
          error: 'CREDENCIALES_INVALIDAS',
          message: 'Credenciales inválidas'
        };
      }

      // Login exitoso - resetear intentos fallidos y actualizar último acceso
      await usuario.update({
        intentos_fallidos: 0,
        ultimo_acceso: new Date()
      });

      // Generar tokens JWT
      const tokens = await this.generateTokens(usuario);

      // Guardar refresh token en base de datos
      await usuario.update({
        token_refresh: tokens.refreshToken
      });

      // Registrar login exitoso
      await registrarBitacora(
        usuario.id,
        'LOGIN_EXITOSO',
        'Usuario',
        usuario.id,
        `Login exitoso para ${usuario.rol}`,
        requestInfo
      );

      logger.info(`✅ Login exitoso para: ${email}`, {
        rol: usuario.rol,
        proveedor: usuario.proveedor?.razon_social || 'N/A',
        ip: requestInfo.ip
      });

      // Preparar datos de respuesta (sin información sensible)
      const usuarioSeguro = {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        tenant_id: usuario.tenant_id,  // ✅ Incluir tenant_id en respuesta
        proveedor: usuario.proveedor ? {
          id: usuario.proveedor.id,
          razon_social: usuario.proveedor.razon_social,
          nombre_comercial: usuario.proveedor.nombre_comercial
        } : null,
        ultimo_acceso: usuario.ultimo_acceso,
        estado: usuario.estado
      };

      return {
        success: true,
        usuario: usuarioSeguro,
        tokens: tokens,
        permisos: this.getPermissionsByRole(usuario.rol)
      };

    } catch (error) {
      logger.error('💥 Error durante autenticación:', {
        error: error.message,
        email,
        stack: error.stack
      });

      throw new Error(`Error durante autenticación: ${error.message}`);
    }
  }

  /**
   * Generar tokens JWT (access + refresh)
   * @param {Object} usuario - Objeto usuario de la BD
   * @returns {Promise<Object>} Access token y refresh token
   */
  static async generateTokens(usuario) {
    try {
      const payload = {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        proveedor_id: usuario.proveedor_id,
        tenant_id: usuario.tenant_id  // ✅ Agregar tenant_id al JWT
      };

      // Access Token (1 hora)
      const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'sat-digital-secret-key',
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '1h',
          issuer: 'sat-digital',
          audience: 'sat-digital-users'
        }
      );

      // Refresh Token (7 días)
      const refreshToken = jwt.sign(
        { id: usuario.id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || 'sat-digital-refresh-secret',
        { 
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
          issuer: 'sat-digital',
          audience: 'sat-digital-refresh'
        }
      );

      logger.info(`🔑 Tokens generados para usuario ID: ${usuario.id}`, {
        email: usuario.email,
        rol: usuario.rol
      });

      return {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
      };

    } catch (error) {
      logger.error('💥 Error generando tokens JWT:', {
        error: error.message,
        usuario_id: usuario.id
      });
      throw new Error(`Error generando tokens: ${error.message}`);
    }
  }

  /**
   * Renovar access token usando refresh token
   * @param {string} refreshToken - Refresh token válido
   * @param {Object} requestInfo - Información de la petición
   * @returns {Promise<Object>} Nuevo access token
   */
  static async refreshAccessToken(refreshToken, requestInfo = {}) {
    try {
      if (!refreshToken) {
        return {
          success: false,
          error: 'REFRESH_TOKEN_REQUERIDO',
          message: 'Refresh token es requerido'
        };
      }

      // Verificar refresh token
      let decoded;
      try {
        decoded = jwt.verify(
          refreshToken, 
          process.env.JWT_REFRESH_SECRET || 'sat-digital-refresh-secret'
        );
      } catch (jwtError) {
        logger.warn('❌ Refresh token inválido o expirado', {
          error: jwtError.message,
          ip: requestInfo.ip
        });

        return {
          success: false,
          error: 'REFRESH_TOKEN_INVALIDO',
          message: 'Refresh token inválido o expirado'
        };
      }

      // Buscar usuario y verificar que el refresh token coincida
      const usuario = await Usuario.findOne({
        where: {
          id: decoded.id,
          token_refresh: refreshToken,
          estado: 'activo'
        }
      });

      if (!usuario) {
        logger.warn('❌ Usuario no encontrado para refresh token', {
          usuario_id: decoded.id,
          ip: requestInfo.ip
        });

        return {
          success: false,
          error: 'REFRESH_TOKEN_INVALIDO',
          message: 'Refresh token inválido'
        };
      }

      // Generar nuevo access token
      const payload = {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        proveedor_id: usuario.proveedor_id,
        tenant_id: usuario.tenant_id  // ✅ Agregar tenant_id al JWT
      };

      const nuevoAccessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'sat-digital-secret-key',
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '1h',
          issuer: 'sat-digital',
          audience: 'sat-digital-users'
        }
      );

      await registrarBitacora(
        usuario.id,
        'TOKEN_RENOVADO',
        'Usuario',
        usuario.id,
        'Access token renovado exitosamente',
        requestInfo
      );

      logger.info(`🔄 Token renovado para usuario: ${usuario.email}`, {
        usuario_id: usuario.id,
        ip: requestInfo.ip
      });

      return {
        success: true,
        accessToken: nuevoAccessToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
      };

    } catch (error) {
      logger.error('💥 Error renovando token:', {
        error: error.message,
        stack: error.stack
      });

      throw new Error(`Error renovando token: ${error.message}`);
    }
  }

  /**
   * Cerrar sesión (invalidar refresh token)
   * @param {number} usuarioId - ID del usuario
   * @param {Object} requestInfo - Información de la petición
   * @returns {Promise<Object>} Resultado del logout
   */
  static async logout(usuarioId, requestInfo = {}) {
    try {
      const usuario = await Usuario.findByPk(usuarioId);
      
      if (!usuario) {
        return {
          success: false,
          error: 'USUARIO_NO_ENCONTRADO',
          message: 'Usuario no encontrado'
        };
      }

      // Invalidar refresh token
      await usuario.update({
        token_refresh: null
      });

      await registrarBitacora(
        usuarioId,
        'LOGOUT',
        'Usuario',
        usuarioId,
        'Logout exitoso - Refresh token invalidado',
        requestInfo
      );

      logger.info(`👋 Logout exitoso para usuario: ${usuario.email}`, {
        usuario_id: usuarioId,
        ip: requestInfo.ip
      });

      return {
        success: true,
        message: 'Logout exitoso'
      };

    } catch (error) {
      logger.error('💥 Error durante logout:', {
        error: error.message,
        usuario_id: usuarioId
      });

      throw new Error(`Error durante logout: ${error.message}`);
    }
  }

  /**
   * Obtener permisos basados en rol de usuario
   * @param {string} rol - Rol del usuario
   * @returns {Array<string>} Lista de permisos
   */
  static getPermissionsByRole(rol) {
    const permisos = {
      admin: [
        'usuarios.crear',
        'usuarios.editar',
        'usuarios.eliminar',
        'usuarios.listar',
        'proveedores.crear',
        'proveedores.editar',
        'proveedores.listar',
        'sitios.crear',
        'sitios.editar',
        'sitios.listar',
        'auditorias.crear',
        'auditorias.editar',
        'auditorias.listar',
        'auditorias.asignar',
        'documentos.ver_todos',
        'reportes.ver_todos',
        'bitacora.ver',
        'configuracion.editar'
      ],
      auditor: [
        'auditorias.listar_asignadas',
        'auditorias.evaluar',
        'documentos.revisar',
        'documentos.validar',
        'visitas.realizar',
        'reportes.generar',
        'chat.responder'
      ],
      proveedor: [
        'auditorias.listar_propias',
        'documentos.cargar',
        'documentos.ver_propios',
        'chat.consultar',
        'reportes.ver_propios'
      ],
      visualizador: [
        'dashboards.ver',
        'reportes.ver_publicos',
        'metricas.consultar'
      ]
    };

    return permisos[rol] || [];
  }

  /**
   * Verificar si usuario tiene un permiso específico
   * @param {string} rol - Rol del usuario
   * @param {string} permiso - Permiso a verificar
   * @returns {boolean} True si tiene el permiso
   */
  static hasPermission(rol, permiso) {
    const permisos = this.getPermissionsByRole(rol);
    return permisos.includes(permiso);
  }

  /**
   * Registrar nuevo usuario (solo admin)
   * @param {Object} datosUsuario - Datos del nuevo usuario
   * @param {Object} usuarioCreador - Usuario que crea (debe ser admin)
   * @param {Object} requestInfo - Información de la petición
   * @returns {Promise<Object>} Usuario creado
   */
  static async registerUser(datosUsuario, usuarioCreador, requestInfo = {}) {
    try {
      // Verificar que quien crea sea admin
      if (usuarioCreador.rol !== 'admin') {
        return {
          success: false,
          error: 'PERMISOS_INSUFICIENTES',
          message: 'Solo administradores pueden crear usuarios'
        };
      }

      // Verificar que no existe usuario con ese email
      const usuarioExistente = await Usuario.findOne({
        where: { email: datosUsuario.email.toLowerCase().trim() }
      });

      if (usuarioExistente) {
        return {
          success: false,
          error: 'EMAIL_YA_EXISTE',
          message: 'Ya existe un usuario con ese email'
        };
      }

      // Hash del password
      const passwordHash = await bcrypt.hash(datosUsuario.password, 12);

      // Crear usuario
      const nuevoUsuario = await Usuario.create({
        email: datosUsuario.email.toLowerCase().trim(),
        password_hash: passwordHash,
        nombre: datosUsuario.nombre,
        rol: datosUsuario.rol,
        proveedor_id: datosUsuario.proveedor_id || null,
        estado: 'activo'
      });

      await registrarBitacora(
        usuarioCreador.id,
        'USUARIO_CREADO',
        'Usuario',
        nuevoUsuario.id,
        `Usuario ${nuevoUsuario.email} creado con rol ${nuevoUsuario.rol}`,
        requestInfo
      );

      logger.info(`👤 Usuario creado exitosamente: ${nuevoUsuario.email}`, {
        rol: nuevoUsuario.rol,
        creado_por: usuarioCreador.email,
        ip: requestInfo.ip
      });

      // Retornar sin información sensible
      return {
        success: true,
        usuario: {
          id: nuevoUsuario.id,
          email: nuevoUsuario.email,
          nombre: nuevoUsuario.nombre,
          rol: nuevoUsuario.rol,
          proveedor_id: nuevoUsuario.proveedor_id,
          estado: nuevoUsuario.estado
        }
      };

    } catch (error) {
      logger.error('💥 Error registrando usuario:', {
        error: error.message,
        datos: datosUsuario,
        stack: error.stack
      });

      throw new Error(`Error registrando usuario: ${error.message}`);
    }
  }
}

module.exports = AuthService;
