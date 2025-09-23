/**
 * Configuración específica para MySQL
 * Mantiene la configuración actual de Sequelize
 */

const { Sequelize } = require('sequelize');
const logger = require('../../../utils/logger');

class MySQLConfig {
  constructor() {
    this.config = {
      host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT) || 3306,
      database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'sat_digital_v2',
      username: process.env.MYSQL_USERNAME || process.env.DB_USER || 'root',
      password: process.env.MYSQL_PASSWORD || process.env.DB_PASS || '',
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ?
        (msg) => logger.debug(`[MySQL] ${msg}`) : false,
      pool: {
        max: 20,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
      },
      timezone: '-03:00' // Timezone Argentina
    };

    this.sequelize = null;
  }

  /**
   * Crear conexión a MySQL
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
      logger.info('✅ MySQL connection established successfully');
      return this.sequelize;
    } catch (error) {
      logger.error('❌ Unable to connect to MySQL:', error);
      throw error;
    }
  }

  /**
   * Obtener instancia de Sequelize
   */
  getSequelize() {
    if (!this.sequelize) {
      throw new Error('MySQL connection not established. Call createConnection() first.');
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
        logger.info('📝 MySQL connection closed');
      }
    } catch (error) {
      logger.error('❌ Error closing MySQL connection:', error);
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
      logger.error('❌ MySQL connection test failed:', error);
      return false;
    }
  }

  /**
   * Obtener configuración
   */
  getConfig() {
    return { ...this.config };
  }
}

module.exports = MySQLConfig;