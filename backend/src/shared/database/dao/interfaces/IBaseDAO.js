/**
 * Interfaz base para todos los DAOs
 * Define operaciones CRUD comunes para cualquier entidad
 */

class IBaseDAO {
  /**
   * Crear un nuevo registro
   * @param {Object} data - Datos para crear el registro
   * @param {Object} options - Opciones adicionales (transaction, etc.)
   * @returns {Promise<Object>} Registro creado
   */
  async create(data, options = {}) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * Buscar registro por ID
   * @param {number|string} id - ID del registro
   * @param {Object} options - Opciones de búsqueda (include, attributes, etc.)
   * @returns {Promise<Object|null>} Registro encontrado o null
   */
  async findById(id, options = {}) {
    throw new Error('Method findById() must be implemented');
  }

  /**
   * Buscar un registro por criterios
   * @param {Object} criteria - Criterios de búsqueda
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Object|null>} Primer registro encontrado o null
   */
  async findOne(criteria = {}, options = {}) {
    throw new Error('Method findOne() must be implemented');
  }

  /**
   * Buscar múltiples registros
   * @param {Object} criteria - Criterios de búsqueda
   * @param {Object} options - Opciones de búsqueda (limit, offset, order, etc.)
   * @returns {Promise<Array>} Array de registros encontrados
   */
  async findAll(criteria = {}, options = {}) {
    throw new Error('Method findAll() must be implemented');
  }

  /**
   * Buscar con paginación
   * @param {Object} criteria - Criterios de búsqueda
   * @param {Object} pagination - Opciones de paginación {page, limit}
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} {rows: Array, count: number, page: number, limit: number}
   */
  async findAndCountAll(criteria = {}, pagination = {}, options = {}) {
    throw new Error('Method findAndCountAll() must be implemented');
  }

  /**
   * Actualizar registro por ID
   * @param {number|string} id - ID del registro a actualizar
   * @param {Object} data - Datos a actualizar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Registro actualizado
   */
  async update(id, data, options = {}) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * Actualizar múltiples registros
   * @param {Object} criteria - Criterios para seleccionar registros
   * @param {Object} data - Datos a actualizar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<number>} Número de registros actualizados
   */
  async updateMany(criteria, data, options = {}) {
    throw new Error('Method updateMany() must be implemented');
  }

  /**
   * Eliminar registro por ID
   * @param {number|string} id - ID del registro a eliminar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<boolean>} true si se eliminó, false si no se encontró
   */
  async delete(id, options = {}) {
    throw new Error('Method delete() must be implemented');
  }

  /**
   * Eliminar múltiples registros
   * @param {Object} criteria - Criterios para seleccionar registros
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<number>} Número de registros eliminados
   */
  async deleteMany(criteria, options = {}) {
    throw new Error('Method deleteMany() must be implemented');
  }

  /**
   * Contar registros
   * @param {Object} criteria - Criterios de conteo
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<number>} Número de registros
   */
  async count(criteria = {}, options = {}) {
    throw new Error('Method count() must be implemented');
  }

  /**
   * Verificar si existe un registro
   * @param {Object} criteria - Criterios de búsqueda
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<boolean>} true si existe, false si no
   */
  async exists(criteria, options = {}) {
    throw new Error('Method exists() must be implemented');
  }

  /**
   * Crear o actualizar (upsert)
   * @param {Object} data - Datos del registro
   * @param {Object} criteria - Criterios para encontrar registro existente
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} {record: Object, created: boolean}
   */
  async upsert(data, criteria, options = {}) {
    throw new Error('Method upsert() must be implemented');
  }

  /**
   * Ejecutar operación en transacción
   * @param {Function} operation - Función a ejecutar en transacción
   * @param {Object} options - Opciones de transacción
   * @returns {Promise<any>} Resultado de la operación
   */
  async transaction(operation, options = {}) {
    throw new Error('Method transaction() must be implemented');
  }

  /**
   * Obtener estadísticas de la tabla
   * @returns {Promise<Object>} Estadísticas básicas
   */
  async getStats() {
    throw new Error('Method getStats() must be implemented');
  }

  /**
   * Validar datos antes de operaciones CRUD
   * @param {Object} data - Datos a validar
   * @param {string} operation - Tipo de operación ('create', 'update')
   * @returns {Promise<Object>} Datos validados
   */
  async validate(data, operation = 'create') {
    // Implementación base opcional
    return data;
  }

  /**
   * Limpiar/sanitizar datos
   * @param {Object} data - Datos a limpiar
   * @returns {Object} Datos limpiados
   */
  sanitize(data) {
    // Implementación base opcional
    return data;
  }
}

module.exports = IBaseDAO;