/**
 * Test script para verificar la conexión de base de datos
 */

// Set environment variables for SQL Server
process.env.DB_TYPE = 'sqlserver';
process.env.SQLSERVER_HOST = 'dwin0293';
process.env.SQLSERVER_PORT = '1433';
process.env.SQLSERVER_DATABASE = 'sat_digital_v2';
process.env.SQLSERVER_USERNAME = 'calidad';
process.env.SQLSERVER_PASSWORD = 'passcalidad';
process.env.SQLSERVER_ENCRYPT = 'false';
process.env.SQLSERVER_TRUST_CERT = 'true';

const { sequelize, config, DB_TYPE } = require('./src/shared/database/connection');

console.log('🔧 Test de conexión de base de datos');
console.log('📊 Configuración actual:');
console.log(`   🔧 DB_TYPE: ${DB_TYPE}`);
console.log(`   🏢 Host: ${config.host}:${config.port}`);
console.log(`   💾 Database: ${config.database}`);
console.log(`   👤 Username: ${config.username}`);
console.log(`   🔧 Dialect: ${config.dialect}`);

async function testConnection() {
  try {
    console.log('\n🔄 Probando conexión...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa!');

    // Test simple query
    const [results] = await sequelize.query('SELECT COUNT(*) as total_proveedores FROM [proveedores]');
    console.log(`📊 Total proveedores: ${results[0].total_proveedores}`);

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  } finally {
    await sequelize.close();
    console.log('📝 Conexión cerrada.');
  }
}

testConnection();