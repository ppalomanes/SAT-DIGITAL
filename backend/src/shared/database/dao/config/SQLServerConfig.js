/**
 * Configuración específica para SQL Server
 * Configuración optimizada para Microsoft SQL Server
 */

const { Sequelize } = require('sequelize');
const logger = require('../../../utils/logger');

class SQLServerConfig {
  constructor() {
    this.config = {
      host: process.env.SQLSERVER_HOST || 'localhost',
      port: parseInt(process.env.SQLSERVER_PORT) || 1433,
      database: process.env.SQLSERVER_DATABASE || 'sat_digital_v2',
      username: process.env.SQLSERVER_USERNAME || 'sa',
      password: process.env.SQLSERVER_PASSWORD || '',
      dialect: 'mssql',
      logging: process.env.NODE_ENV === 'development' ?
        (msg) => logger.debug(`[SQL Server] ${msg}`) : false,
      pool: {
        max: 15,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: {
        options: {
          // Configuraciones específicas de SQL Server
          encrypt: process.env.SQLSERVER_ENCRYPT === 'true' || false,
          trustServerCertificate: process.env.SQLSERVER_TRUST_CERT === 'true' || true,
          enableArithAbort: true,
          instanceName: process.env.SQLSERVER_INSTANCE || null,
          requestTimeout: 30000,
          connectionTimeout: 60000,
          cancelTimeout: 5000
        }
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      },
      timezone: '-03:00' // Timezone Argentina
    };

    this.sequelize = null;
  }

  /**
   * Crear conexión a SQL Server
   */
  async createConnection() {
    try {
      this.sequelize = new Sequelize(
        this.config.database,
        this.config.username,
        this.config.password,
        this.config
      );

      await this.sequelize.authenticate();
      logger.info('✅ SQL Server connection established successfully');
      return this.sequelize;
    } catch (error) {
      logger.error('❌ Unable to connect to SQL Server:', error);
      throw error;
    }
  }

  /**
   * Obtener instancia de Sequelize
   */
  getSequelize() {
    if (!this.sequelize) {
      throw new Error('SQL Server connection not established. Call createConnection() first.');
    }
    return this.sequelize;
  }

  /**
   * Cerrar conexión
   */
  async closeConnection() {
    try {
      if (this.sequelize) {
        await this.sequelize.close();
        logger.info('📝 SQL Server connection closed');
      }
    } catch (error) {
      logger.error('❌ Error closing SQL Server connection:', error);
    }
  }

  /**
   * Test de conexión
   */
  async testConnection() {
    try {
      if (!this.sequelize) {
        await this.createConnection();
      }
      await this.sequelize.authenticate();
      return true;
    } catch (error) {
      logger.error('❌ SQL Server connection test failed:', error);
      return false;
    }
  }

  /**
   * Obtener configuración
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Configurar instancia específica de SQL Server
   */
  setInstance(instanceName) {
    this.config.dialectOptions.options.instanceName = instanceName;
  }

  /**
   * Configurar encriptación SSL
   */
  setEncryption(encrypt = true, trustCert = true) {
    this.config.dialectOptions.options.encrypt = encrypt;
    this.config.dialectOptions.options.trustServerCertificate = trustCert;
  }
}

module.exports = SQLServerConfig;