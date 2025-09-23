/**
 * Gestor centralizado de conexiones de base de datos
 * Maneja alternar entre MySQL y SQL Server de forma transparente
 */

const MySQLConfig = require('./MySQLConfig');
const SQLServerConfig = require('./SQLServerConfig');
const logger = require('../../../utils/logger');

class DatabaseConnectionManager {
  constructor() {
    this.currentDbType = process.env.DB_TYPE || 'mysql';
    this.mysqlConfig = null;
    this.sqlServerConfig = null;
    this.activeConnection = null;
  }

  /**
   * Inicializar conexión según tipo de base de datos configurada
   */
  async initialize() {
    try {
      switch (this.currentDbType.toLowerCase()) {
        case 'mysql':
          this.mysqlConfig = new MySQLConfig();
          this.activeConnection = await this.mysqlConfig.createConnection();
          logger.info('🐬 Database Connection Manager: MySQL initialized');
          break;

        case 'sqlserver':
        case 'mssql':
          this.sqlServerConfig = new SQLServerConfig();
          this.activeConnection = await this.sqlServerConfig.createConnection();
          logger.info('🏢 Database Connection Manager: SQL Server initialized');
          break;

        default:
          throw new Error(`Unsupported database type: ${this.currentDbType}`);
      }

      return this.activeConnection;
    } catch (error) {
      logger.error('❌ Failed to initialize database connection:', error);
      throw error;
    }
  }

  /**
   * Obtener conexión activa
   */
  getConnection() {
    if (!this.activeConnection) {
      throw new Error('Database connection not initialized. Call initialize() first.');
    }
    return this.activeConnection;
  }

  /**
   * Obtener tipo de base de datos activo
   */
  getDbType() {
    return this.currentDbType;
  }

  /**
   * Cambiar tipo de base de datos en tiempo de ejecución
   */
  async switchDatabase(newDbType) {
    logger.info(`🔄 Switching database from ${this.currentDbType} to ${newDbType}`);

    try {
      // Cerrar conexión actual
      await this.closeConnection();

      // Actualizar tipo de DB
      this.currentDbType = newDbType;
      process.env.DB_TYPE = newDbType;

      // Reinicializar con nuevo tipo
      await this.initialize();

      logger.info(`✅ Successfully switched to ${newDbType}`);
      return this.activeConnection;
    } catch (error) {
      logger.error(`❌ Failed to switch to ${newDbType}:`, error);
      throw error;
    }
  }

  /**
   * Test de conexión de la base de datos activa
   */
  async testConnection() {
    try {
      switch (this.currentDbType.toLowerCase()) {
        case 'mysql':
          return this.mysqlConfig ? await this.mysqlConfig.testConnection() : false;
        case 'sqlserver':
        case 'mssql':
          return this.sqlServerConfig ? await this.sqlServerConfig.testConnection() : false;
        default:
          return false;
      }
    } catch (error) {
      logger.error('❌ Connection test failed:', error);
      return false;
    }
  }

  /**
   * Obtener configuración de la base de datos activa
   */
  getConfig() {
    switch (this.currentDbType.toLowerCase()) {
      case 'mysql':
        return this.mysqlConfig ? this.mysqlConfig.getConfig() : null;
      case 'sqlserver':
      case 'mssql':
        return this.sqlServerConfig ? this.sqlServerConfig.getConfig() : null;
      default:
        return null;
    }
  }

  /**
   * Cerrar conexión activa
   */
  async closeConnection() {
    try {
      switch (this.currentDbType.toLowerCase()) {
        case 'mysql':
          if (this.mysqlConfig) {
            await this.mysqlConfig.closeConnection();
          }
          break;
        case 'sqlserver':
        case 'mssql':
          if (this.sqlServerConfig) {
            await this.sqlServerConfig.closeConnection();
          }
          break;
      }

      this.activeConnection = null;
      logger.info('📝 Database connection closed');
    } catch (error) {
      logger.error('❌ Error closing database connection:', error);
    }
  }

  /**
   * Health check completo del sistema de bases de datos
   */
  async healthCheck() {
    const health = {
      mysql: { available: false, latency: null, error: null },
      sqlserver: { available: false, latency: null, error: null }
    };

    // Test MySQL
    try {
      const mysqlTest = new MySQLConfig();
      const start = Date.now();
      const isMySQL = await mysqlTest.testConnection();
      const latency = Date.now() - start;
      await mysqlTest.closeConnection();

      health.mysql = { available: isMySQL, latency, error: null };
    } catch (error) {
      health.mysql = { available: false, latency: null, error: error.message };
    }

    // Test SQL Server
    try {
      const sqlServerTest = new SQLServerConfig();
      const start = Date.now();
      const isSQLServer = await sqlServerTest.testConnection();
      const latency = Date.now() - start;
      await sqlServerTest.closeConnection();

      health.sqlserver = { available: isSQLServer, latency, error: null };
    } catch (error) {
      health.sqlserver = { available: false, latency: null, error: error.message };
    }

    return {
      current: this.currentDbType,
      health,
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton pattern para mantener una sola instancia
let instance = null;

module.exports = {
  DatabaseConnectionManager,
  getInstance: () => {
    if (!instance) {
      instance = new DatabaseConnectionManager();
    }
    return instance;
  }
};