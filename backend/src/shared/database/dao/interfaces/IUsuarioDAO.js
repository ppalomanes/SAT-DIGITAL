/**
 * Interfaz específica para operaciones de Usuario
 * Extiende IBaseDAO con métodos específicos de usuarios
 */

const IBaseDAO = require('./IBaseDAO');

class IUsuarioDAO extends IBaseDAO {
  /**
   * Buscar usuario por email
   * @param {string} email - Email del usuario
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findByEmail(email, options = {}) {
    throw new Error('Method findByEmail() must be implemented');
  }

  /**
   * Buscar usuarios por rol
   * @param {string} rol - Rol a buscar
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>} Array de usuarios con el rol especificado
   */
  async findByRole(rol, options = {}) {
    throw new Error('Method findByRole() must be implemented');
  }

  /**
   * Buscar usuarios por proveedor
   * @param {number} proveedorId - ID del proveedor
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>} Array de usuarios del proveedor
   */
  async findByProveedor(proveedorId, options = {}) {
    throw new Error('Method findByProveedor() must be implemented');
  }

  /**
   * Buscar usuarios activos
   * @param {Object} criteria - Criterios adicionales
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>} Array de usuarios activos
   */
  async findActive(criteria = {}, options = {}) {
    throw new Error('Method findActive() must be implemented');
  }

  /**
   * Actualizar último acceso del usuario
   * @param {number} userId - ID del usuario
   * @param {Date} timestamp - Timestamp del acceso
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<boolean>} true si se actualizó
   */
  async updateLastAccess(userId, timestamp = new Date(), options = {}) {
    throw new Error('Method updateLastAccess() must be implemented');
  }

  /**
   * Incrementar intentos fallidos de login
   * @param {number} userId - ID del usuario
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<number>} Número actual de intentos fallidos
   */
  async incrementFailedAttempts(userId, options = {}) {
    throw new Error('Method incrementFailedAttempts() must be implemented');
  }

  /**
   * Resetear intentos fallidos de login
   * @param {number} userId - ID del usuario
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<boolean>} true si se reseteó
   */
  async resetFailedAttempts(userId, options = {}) {
    throw new Error('Method resetFailedAttempts() must be implemented');
  }

  /**
   * Cambiar estado del usuario
   * @param {number} userId - ID del usuario
   * @param {string} newState - Nuevo estado ('activo', 'inactivo', 'bloqueado')
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Usuario actualizado
   */
  async changeStatus(userId, newState, options = {}) {
    throw new Error('Method changeStatus() must be implemented');
  }

  /**
   * Buscar usuarios por múltiples criterios con filtros avanzados
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Paginación
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Resultados paginados
   */
  async searchUsers(filters = {}, pagination = {}, options = {}) {
    throw new Error('Method searchUsers() must be implemented');
  }

  /**
   * Obtener estadísticas de usuarios por rol
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Estadísticas por rol
   */
  async getStatsByRole(options = {}) {
    throw new Error('Method getStatsByRole() must be implemented');
  }

  /**
   * Obtener estadísticas de usuarios por proveedor
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Estadísticas por proveedor
   */
  async getStatsByProveedor(options = {}) {
    throw new Error('Method getStatsByProveedor() must be implemented');
  }

  /**
   * Validar datos específicos de usuario
   * @param {Object} userData - Datos del usuario
   * @param {string} operation - Operación ('create', 'update')
   * @returns {Promise<Object>} Datos validados
   */
  async validate(userData, operation = 'create') {
    // Validaciones específicas de usuario
    if (operation === 'create' && !userData.email) {
      throw new Error('Email is required for user creation');
    }

    if (userData.email && !this.isValidEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    if (!userData.rol || !this.isValidRole(userData.rol)) {
      throw new Error('Valid role is required');
    }

    return super.validate(userData, operation);
  }

  /**
   * Validar formato de email
   * @param {string} email - Email a validar
   * @returns {boolean} true si es válido
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar rol
   * @param {string} rol - Rol a validar
   * @returns {boolean} true si es válido
   */
  isValidRole(rol) {
    const validRoles = ['admin', 'auditor_general', 'auditor_interno', 'jefe_proveedor', 'tecnico_proveedor', 'visualizador'];
    return validRoles.includes(rol);
  }
}

module.exports = IUsuarioDAO;