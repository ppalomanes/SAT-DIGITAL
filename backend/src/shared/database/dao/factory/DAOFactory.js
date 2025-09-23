/**
 * Factory Pattern para crear instancias de DAO
 * Selecciona automáticamente entre MySQL y SQL Server según configuración
 */

const logger = require('../../../utils/logger');
const { DatabaseConnectionManager } = require('../config/DatabaseConnectionManager');

class DAOFactory {
  constructor() {
    this.dbConnectionManager = null;
    this.currentDbType = null;
    this.daoInstances = new Map(); // Cache de instancias DAO
  }

  /**
   * Inicializar el factory con el tipo de base de datos
   */
  async initialize() {
    try {
      this.dbConnectionManager = require('../config/DatabaseConnectionManager').getInstance();
      await this.dbConnectionManager.initialize();
      this.currentDbType = this.dbConnectionManager.getDbType();

      logger.info(`✅ DAOFactory initialized for ${this.currentDbType.toUpperCase()}`);
      return this;
    } catch (error) {
      logger.error('❌ Failed to initialize DAOFactory:', error);
      throw error;
    }
  }

  /**
   * Crear instancia de UsuarioDAO
   * @param {Object} options - Opciones adicionales
   * @returns {IUsuarioDAO} Instancia del DAO de usuarios
   */
  createUsuarioDAO(options = {}) {
    const cacheKey = `usuario_${this.currentDbType}`;

    if (!options.forceNew && this.daoInstances.has(cacheKey)) {
      return this.daoInstances.get(cacheKey);
    }

    let dao;
    switch (this.currentDbType.toLowerCase()) {
      case 'mysql':
        const MySQLUsuarioDAO = require('../mysql/MySQLUsuarioDAO');
        dao = new MySQLUsuarioDAO(this.dbConnectionManager.getConnection());
        break;
      case 'sqlserver':
      case 'mssql':
        const SQLServerUsuarioDAO = require('../sqlserver/SQLServerUsuarioDAO');
        dao = new SQLServerUsuarioDAO(this.dbConnectionManager.getConnection());
        break;
      default:
        throw new Error(`Unsupported database type for UsuarioDAO: ${this.currentDbType}`);
    }

    if (!options.forceNew) {
      this.daoInstances.set(cacheKey, dao);
    }

    return dao;
  }

  /**
   * Crear instancia de ProveedorDAO
   * @param {Object} options - Opciones adicionales
   * @returns {IProveedorDAO} Instancia del DAO de proveedores
   */
  createProveedorDAO(options = {}) {
    const cacheKey = `proveedor_${this.currentDbType}`;

    if (!options.forceNew && this.daoInstances.has(cacheKey)) {
      return this.daoInstances.get(cacheKey);
    }

    let dao;
    switch (this.currentDbType.toLowerCase()) {
      case 'mysql':
        const MySQLProveedorDAO = require('../mysql/MySQLProveedorDAO');
        dao = new MySQLProveedorDAO(this.dbConnectionManager.getConnection());
        break;
      case 'sqlserver':
      case 'mssql':
        const SQLServerProveedorDAO = require('../sqlserver/SQLServerProveedorDAO');
        dao = new SQLServerProveedorDAO(this.dbConnectionManager.getConnection());
        break;
      default:
        throw new Error(`Unsupported database type for ProveedorDAO: ${this.currentDbType}`);
    }

    if (!options.forceNew) {
      this.daoInstances.set(cacheKey, dao);
    }

    return dao;
  }

  /**
   * Crear instancia de AuditoriaDAO
   * @param {Object} options - Opciones adicionales
   * @returns {IAuditoriaDAO} Instancia del DAO de auditorías
   */
  createAuditoriaDAO(options = {}) {
    const cacheKey = `auditoria_${this.currentDbType}`;

    if (!options.forceNew && this.daoInstances.has(cacheKey)) {
      return this.daoInstances.get(cacheKey);
    }

    let dao;
    switch (this.currentDbType.toLowerCase()) {
      case 'mysql':
        const MySQLAuditoriaDAO = require('../mysql/MySQLAuditoriaDAO');
        dao = new MySQLAuditoriaDAO(this.dbConnectionManager.getConnection());
        break;
      case 'sqlserver':
      case 'mssql':
        const SQLServerAuditoriaDAO = require('../sqlserver/SQLServerAuditoriaDAO');
        dao = new SQLServerAuditoriaDAO(this.dbConnectionManager.getConnection());
        break;
      default:
        throw new Error(`Unsupported database type for AuditoriaDAO: ${this.currentDbType}`);
    }

    if (!options.forceNew) {
      this.daoInstances.set(cacheKey, dao);
    }

    return dao;
  }

  /**
   * Crear instancia de cualquier DAO por nombre
   * @param {string} daoName - Nombre del DAO (Usuario, Proveedor, Auditoria, etc.)
   * @param {Object} options - Opciones adicionales
   * @returns {Object} Instancia del DAO solicitado
   */
  createDAO(daoName, options = {}) {
    const methodName = `create${daoName}DAO`;

    if (typeof this[methodName] === 'function') {
      return this[methodName](options);
    } else {
      throw new Error(`DAO ${daoName} not supported by factory`);
    }
  }

  /**
   * Obtener todas las instancias DAO disponibles
   * @returns {Object} Objeto con todas las instancias DAO
   */
  getAllDAOs() {
    return {
      usuario: this.createUsuarioDAO(),
      proveedor: this.createProveedorDAO(),
      auditoria: this.createAuditoriaDAO()
    };
  }

  /**
   * Cambiar tipo de base de datos en tiempo de ejecución
   * @param {string} newDbType - Nuevo tipo de base de datos
   */
  async switchDatabase(newDbType) {
    try {
      logger.info(`🔄 DAOFactory switching from ${this.currentDbType} to ${newDbType}`);

      // Limpiar cache de instancias
      this.clearCache();

      // Cambiar base de datos en el connection manager
      await this.dbConnectionManager.switchDatabase(newDbType);
      this.currentDbType = newDbType;

      logger.info(`✅ DAOFactory successfully switched to ${newDbType}`);
    } catch (error) {
      logger.error(`❌ Failed to switch DAOFactory to ${newDbType}:`, error);
      throw error;
    }
  }

  /**
   * Limpiar cache de instancias DAO
   */
  clearCache() {
    this.daoInstances.clear();
    logger.debug('🧹 DAOFactory cache cleared');
  }

  /**
   * Obtener información sobre el factory
   * @returns {Object} Información del factory
   */
  getInfo() {
    return {
      currentDbType: this.currentDbType,
      cachedInstances: Array.from(this.daoInstances.keys()),
      supportedDatabases: ['mysql', 'sqlserver'],
      availableDAOs: ['Usuario', 'Proveedor', 'Auditoria']
    };
  }

  /**
   * Health check del factory y conexiones
   * @returns {Promise<Object>} Estado de salud del factory
   */
  async healthCheck() {
    try {
      const dbHealth = await this.dbConnectionManager.healthCheck();

      return {
        factory: {
          status: 'healthy',
          currentDbType: this.currentDbType,
          cachedInstances: this.daoInstances.size
        },
        database: dbHealth
      };
    } catch (error) {
      return {
        factory: {
          status: 'unhealthy',
          error: error.message,
          currentDbType: this.currentDbType
        },
        database: null
      };
    }
  }

  /**
   * Cerrar conexiones y limpiar recursos
   */
  async close() {
    try {
      this.clearCache();
      if (this.dbConnectionManager) {
        await this.dbConnectionManager.closeConnection();
      }
      logger.info('📝 DAOFactory closed successfully');
    } catch (error) {
      logger.error('❌ Error closing DAOFactory:', error);
    }
  }
}

// Singleton pattern para mantener una sola instancia del factory
let factoryInstance = null;

module.exports = {
  DAOFactory,
  getInstance: async () => {
    if (!factoryInstance) {
      factoryInstance = new DAOFactory();
      await factoryInstance.initialize();
    }
    return factoryInstance;
  },
  createNewInstance: async () => {
    const newInstance = new DAOFactory();
    await newInstance.initialize();
    return newInstance;
  }
};