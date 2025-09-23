/**
 * Interfaz específica para operaciones de Proveedor
 * Extiende IBaseDAO con métodos específicos de proveedores
 */

const IBaseDAO = require('./IBaseDAO');

class IProveedorDAO extends IBaseDAO {
  /**
   * Buscar proveedor por CUIT
   * @param {string} cuit - CUIT del proveedor
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Object|null>} Proveedor encontrado o null
   */
  async findByCuit(cuit, options = {}) {
    throw new Error('Method findByCuit() must be implemented');
  }

  /**
   * Buscar proveedores por razón social (búsqueda parcial)
   * @param {string} razonSocial - Razón social o parte de ella
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>} Array de proveedores encontrados
   */
  async findByRazonSocial(razonSocial, options = {}) {
    throw new Error('Method findByRazonSocial() must be implemented');
  }

  /**
   * Buscar proveedores activos
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>} Array de proveedores activos
   */
  async findActive(options = {}) {
    throw new Error('Method findActive() must be implemented');
  }

  /**
   * Buscar proveedor con sus sitios
   * @param {number} proveedorId - ID del proveedor
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Object|null>} Proveedor con sitios
   */
  async findWithSitios(proveedorId, options = {}) {
    throw new Error('Method findWithSitios() must be implemented');
  }

  /**
   * Buscar proveedor con sus usuarios
   * @param {number} proveedorId - ID del proveedor
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Object|null>} Proveedor con usuarios
   */
  async findWithUsuarios(proveedorId, options = {}) {
    throw new Error('Method findWithUsuarios() must be implemented');
  }

  /**
   * Buscar proveedor con datos completos (sitios, usuarios, auditorías)
   * @param {number} proveedorId - ID del proveedor
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Object|null>} Proveedor con datos completos
   */
  async findComplete(proveedorId, options = {}) {
    throw new Error('Method findComplete() must be implemented');
  }

  /**
   * Obtener estadísticas del proveedor
   * @param {number} proveedorId - ID del proveedor
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Estadísticas del proveedor
   */
  async getProveedorStats(proveedorId, options = {}) {
    throw new Error('Method getProveedorStats() must be implemented');
  }

  /**
   * Buscar proveedores con filtros avanzados
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Paginación
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Resultados paginados
   */
  async searchProveedores(filters = {}, pagination = {}, options = {}) {
    throw new Error('Method searchProveedores() must be implemented');
  }

  /**
   * Obtener proveedores con resumen de auditorías
   * @param {string} periodo - Período de auditorías (opcional)
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Array>} Proveedores con resumen de auditorías
   */
  async getProveedoresWithAuditoriasSummary(periodo = null, options = {}) {
    throw new Error('Method getProveedoresWithAuditoriasSummary() must be implemented');
  }

  /**
   * Activar/Desactivar proveedor
   * @param {number} proveedorId - ID del proveedor
   * @param {boolean} isActive - true para activar, false para desactivar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Proveedor actualizado
   */
  async toggleStatus(proveedorId, isActive, options = {}) {
    throw new Error('Method toggleStatus() must be implemented');
  }

  /**
   * Validar datos específicos de proveedor
   * @param {Object} proveedorData - Datos del proveedor
   * @param {string} operation - Operación ('create', 'update')
   * @returns {Promise<Object>} Datos validados
   */
  async validate(proveedorData, operation = 'create') {
    // Validaciones específicas de proveedor
    if (operation === 'create' && !proveedorData.razon_social) {
      throw new Error('Razón social is required for proveedor creation');
    }

    if (operation === 'create' && !proveedorData.cuit) {
      throw new Error('CUIT is required for proveedor creation');
    }

    if (proveedorData.cuit && !this.isValidCuit(proveedorData.cuit)) {
      throw new Error('Invalid CUIT format');
    }

    if (proveedorData.email_contacto && !this.isValidEmail(proveedorData.email_contacto)) {
      throw new Error('Invalid email format');
    }

    return super.validate(proveedorData, operation);
  }

  /**
   * Validar formato de CUIT
   * @param {string} cuit - CUIT a validar
   * @returns {boolean} true si es válido
   */
  isValidCuit(cuit) {
    // Remover guiones y espacios
    const cleanCuit = cuit.replace(/[-\s]/g, '');

    // Verificar que tenga 11 dígitos
    if (!/^\d{11}$/.test(cleanCuit)) {
      return false;
    }

    // Validación del dígito verificador
    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;

    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCuit[i]) * multipliers[i];
    }

    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? remainder : 11 - remainder;

    return parseInt(cleanCuit[10]) === checkDigit;
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
}

module.exports = IProveedorDAO;