/**
 * Configuración de conexión a base de datos - MySQL/SQL Server
 * Utiliza Sequelize ORM para manejo de modelos y consultas
 * Soporte para múltiples motores de base de datos via DB_TYPE
 */

const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Determinar tipo de base de datos
const DB_TYPE = process.env.DB_TYPE || 'mysql';

// Configuración base común
const commonConfig = {
  logging: process.env.NODE_ENV === 'development' ?
    (msg) => logger.debug(msg) : false,
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  timezone: '-03:00' // Timezone Argentina
};

// Configuración específica por tipo de BD
let config;

if (DB_TYPE.toLowerCase() === 'sqlserver' || DB_TYPE.toLowerCase() === 'mssql') {
  // Configuración SQL Server
  config = {
    host: process.env.SQLSERVER_HOST || 'dwin0293',
    port: parseInt(process.env.SQLSERVER_PORT) || 1433,
    database: process.env.SQLSERVER_DATABASE || 'sat_digital_v2',
    username: process.env.SQLSERVER_USERNAME || 'calidad',
    password: process.env.SQLSERVER_PASSWORD || 'passcalidad',
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: process.env.SQLSERVER_ENCRYPT === 'true',
        trustServerCertificate: process.env.SQLSERVER_TRUST_CERT !== 'false',
        enableArithAbort: true
      }
    },
    define: {
      ...commonConfig.define,
      charset: undefined,
      collate: undefined
    },
    ...commonConfig
  };
  logger.info(`🔄 Using SQL Server: ${config.host}:${config.port}/${config.database}`);
} else {
  // Configuración MySQL (default)
  config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'sat_digital_v2',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    dialect: 'mysql',
    define: {
      ...commonConfig.define,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    ...commonConfig
  };
  logger.info(`🔄 Using MySQL: ${config.host}:${config.port}/${config.database}`);
}

// Crear instancia de Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('❌ Unable to connect to database:', error);
    return false;
  }
};

// Función para cerrar la conexión
const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('📝 Database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
  }
};

module.exports = {
  sequelize,
  testConnection,
  closeConnection,
  config,
  DB_TYPE
};
