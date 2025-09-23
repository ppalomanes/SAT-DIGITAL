/**
 * Interfaz específica para operaciones de Auditoría
 * Extiende IBaseDAO con métodos específicos de auditorías
 */

const IBaseDAO = require('./IBaseDAO');

class IAuditoriaDAO extends IBaseDAO {
  /**
   * Buscar auditorías por sitio
   * @param {number} sitioId - ID del sitio
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>} Array de auditorías del sitio
   */
  async findBySitio(sitioId, options = {}) {
    throw new Error('Method findBySitio() must be implemented');
  }

  /**
   * Buscar auditorías por período
   * @param {string} periodo - Período en formato YYYY-MM
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>} Array de auditorías del período
   */
  async findByPeriodo(periodo, options = {}) {
    throw new Error('Method findByPeriodo() must be implemented');
  }

  /**
   * Buscar auditorías por proveedor
   * @param {number} proveedorId - ID del proveedor
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>} Array de auditorías del proveedor
   */
  async findByProveedor(proveedorId, options = {}) {
    throw new Error('Method findByProveedor() must be implemented');
  }

  /**
   * Buscar auditorías asignadas a un auditor
   * @param {number} auditorId - ID del auditor
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>} Array de auditorías asignadas
   */
  async findByAuditor(auditorId, options = {}) {
    throw new Error('Method findByAuditor() must be implemented');
  }

  /**
   * Buscar auditorías por estado
   * @param {string} estado - Estado de la auditoría
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>} Array de auditorías con el estado
   */
  async findByEstado(estado, options = {}) {
    throw new Error('Method findByEstado() must be implemented');
  }

  /**
   * Buscar auditoría específica por sitio y período
   * @param {number} sitioId - ID del sitio
   * @param {string} periodo - Período en formato YYYY-MM
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Object|null>} Auditoría encontrada o null
   */
  async findBySitioAndPeriodo(sitioId, periodo, options = {}) {
    throw new Error('Method findBySitioAndPeriodo() must be implemented');
  }

  /**
   * Buscar auditoría con documentos completos
   * @param {number} auditoriaId - ID de la auditoría
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Object|null>} Auditoría con documentos
   */
  async findWithDocumentos(auditoriaId, options = {}) {
    throw new Error('Method findWithDocumentos() must be implemented');
  }

  /**
   * Buscar auditoría con datos completos (sitio, proveedor, documentos, evaluaciones)
   * @param {number} auditoriaId - ID de la auditoría
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Object|null>} Auditoría completa
   */
  async findComplete(auditoriaId, options = {}) {
    throw new Error('Method findComplete() must be implemented');
  }

  /**
   * Cambiar estado de auditoría
   * @param {number} auditoriaId - ID de la auditoría
   * @param {string} newEstado - Nuevo estado
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Auditoría actualizada
   */
  async changeEstado(auditoriaId, newEstado, options = {}) {
    throw new Error('Method changeEstado() must be implemented');
  }

  /**
   * Asignar auditor a auditoría
   * @param {number} auditoriaId - ID de la auditoría
   * @param {number} auditorId - ID del auditor
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Auditoría actualizada
   */
  async assignAuditor(auditoriaId, auditorId, options = {}) {
    throw new Error('Method assignAuditor() must be implemented');
  }

  /**
   * Registrar fecha de visita
   * @param {number} auditoriaId - ID de la auditoría
   * @param {Date} fechaVisita - Fecha de la visita
   * @param {boolean} isProgramada - true para programada, false para realizada
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Auditoría actualizada
   */
  async setFechaVisita(auditoriaId, fechaVisita, isProgramada = true, options = {}) {
    throw new Error('Method setFechaVisita() must be implemented');
  }

  /**
   * Obtener estadísticas de auditorías por período
   * @param {string} periodo - Período en formato YYYY-MM
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Estadísticas del período
   */
  async getStatsByPeriodo(periodo, options = {}) {
    throw new Error('Method getStatsByPeriodo() must be implemented');
  }

  /**
   * Obtener estadísticas de auditorías por proveedor
   * @param {number} proveedorId - ID del proveedor
   * @param {string} periodo - Período opcional
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Estadísticas del proveedor
   */
  async getStatsByProveedor(proveedorId, periodo = null, options = {}) {
    throw new Error('Method getStatsByProveedor() must be implemented');
  }

  /**
   * Buscar auditorías con filtros avanzados
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Paginación
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Resultados paginados
   */
  async searchAuditorias(filters = {}, pagination = {}, options = {}) {
    throw new Error('Method searchAuditorias() must be implemented');
  }

  /**
   * Obtener auditorías próximas a vencer
   * @param {number} days - Días de anticipación
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Array>} Auditorías próximas a vencer
   */
  async findExpiringAuditorias(days = 7, options = {}) {
    throw new Error('Method findExpiringAuditorias() must be implemented');
  }

  /**
   * Calcular progreso de carga de documentos
   * @param {number} auditoriaId - ID de la auditoría
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Progreso de carga
   */
  async getUploadProgress(auditoriaId, options = {}) {
    throw new Error('Method getUploadProgress() must be implemented');
  }

  /**
   * Validar datos específicos de auditoría
   * @param {Object} auditoriaData - Datos de la auditoría
   * @param {string} operation - Operación ('create', 'update')
   * @returns {Promise<Object>} Datos validados
   */
  async validate(auditoriaData, operation = 'create') {
    // Validaciones específicas de auditoría
    if (operation === 'create' && !auditoriaData.sitio_id) {
      throw new Error('Sitio ID is required for auditoría creation');
    }

    if (operation === 'create' && !auditoriaData.periodo) {
      throw new Error('Período is required for auditoría creation');
    }

    if (auditoriaData.periodo && !this.isValidPeriodo(auditoriaData.periodo)) {
      throw new Error('Invalid período format. Use YYYY-MM');
    }

    if (auditoriaData.estado && !this.isValidEstado(auditoriaData.estado)) {
      throw new Error('Invalid estado');
    }

    if (auditoriaData.puntaje_final && (auditoriaData.puntaje_final < 0 || auditoriaData.puntaje_final > 100)) {
      throw new Error('Puntaje final must be between 0 and 100');
    }

    return super.validate(auditoriaData, operation);
  }

  /**
   * Validar formato de período
   * @param {string} periodo - Período a validar
   * @returns {boolean} true si es válido
   */
  isValidPeriodo(periodo) {
    const periodoRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    return periodoRegex.test(periodo);
  }

  /**
   * Validar estado de auditoría
   * @param {string} estado - Estado a validar
   * @returns {boolean} true si es válido
   */
  isValidEstado(estado) {
    const validEstados = ['programada', 'en_carga', 'pendiente_evaluacion', 'evaluada', 'cerrada'];
    return validEstados.includes(estado);
  }
}

module.exports = IAuditoriaDAO;