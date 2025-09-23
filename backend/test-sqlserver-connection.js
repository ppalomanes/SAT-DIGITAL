/**
 * Test de conectividad a SQL Server
 * Script para verificar la conexión al servidor dwin0293
 */

require('dotenv').config({ path: '.env.sqlserver' });
const { Sequelize } = require('sequelize');

async function testSQLServerConnection() {
  console.log('🔄 Testing SQL Server connection...');
  console.log(`📡 Server: ${process.env.SQLSERVER_HOST}:${process.env.SQLSERVER_PORT}`);
  console.log(`👤 User: ${process.env.SQLSERVER_USERNAME}`);
  console.log(`💾 Database: ${process.env.SQLSERVER_DATABASE}`);
  console.log('');

  // Configuración de conexión
  const config = {
    host: process.env.SQLSERVER_HOST,
    port: parseInt(process.env.SQLSERVER_PORT) || 1433,
    database: process.env.SQLSERVER_DATABASE,
    username: process.env.SQLSERVER_USERNAME,
    password: process.env.SQLSERVER_PASSWORD,
    dialect: 'mssql',
    logging: console.log, // Para ver las consultas SQL
    dialectOptions: {
      options: {
        encrypt: process.env.SQLSERVER_ENCRYPT === 'true',
        trustServerCertificate: process.env.SQLSERVER_TRUST_CERT === 'true',
        enableArithAbort: true,
        requestTimeout: 30000,
        connectionTimeout: 60000,
        cancelTimeout: 5000
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };

  let sequelize;

  try {
    // Crear instancia de Sequelize
    sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      config
    );

    console.log('⏳ Attempting to connect...');

    // Test de autenticación
    await sequelize.authenticate();
    console.log('✅ Connection to SQL Server successful!');

    // Obtener información del servidor
    const [results] = await sequelize.query(`
      SELECT
        @@VERSION as Version,
        @@SERVERNAME as ServerName,
        DB_NAME() as DatabaseName,
        SYSTEM_USER as SystemUser,
        GETDATE() as CurrentDateTime
    `);

    console.log('\n📊 Server Information:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🖥️  Server: ${results[0].ServerName}`);
    console.log(`💾 Database: ${results[0].DatabaseName}`);
    console.log(`👤 User: ${results[0].SystemUser}`);
    console.log(`🕐 DateTime: ${results[0].CurrentDateTime}`);
    console.log(`📦 Version: ${results[0].Version.split('\n')[0]}`);

    // Listar bases de datos disponibles
    console.log('\n📚 Available Databases:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const [databases] = await sequelize.query(`
      SELECT name FROM sys.databases
      WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb')
      ORDER BY name
    `);

    databases.forEach((db, index) => {
      console.log(`${index + 1}. ${db.name}`);
    });

    // Verificar si existe nuestra base de datos
    const dbExists = databases.find(db => db.name === config.database);
    if (dbExists) {
      console.log(`\n✅ Database '${config.database}' exists!`);

      // Listar tablas existentes en nuestra base de datos
      console.log('\n📋 Existing tables:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      try {
        const [tables] = await sequelize.query(`
          SELECT TABLE_NAME
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_TYPE = 'BASE TABLE'
          ORDER BY TABLE_NAME
        `);

        if (tables.length > 0) {
          tables.forEach((table, index) => {
            console.log(`${index + 1}. ${table.TABLE_NAME}`);
          });
        } else {
          console.log('📝 No tables found - database is empty');
        }
      } catch (error) {
        console.log('⚠️  Could not list tables:', error.message);
      }
    } else {
      console.log(`\n⚠️  Database '${config.database}' does not exist!`);
      console.log('💡 You may need to create it first.');
    }

  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`🚨 Error: ${error.message}`);

    if (error.code) {
      console.error(`📋 Code: ${error.code}`);
    }

    if (error.originalError) {
      console.error(`🔍 Original: ${error.originalError.message}`);
    }

    // Sugerencias según el tipo de error
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Possible solutions:');
      console.error('   • Check if SQL Server is running on dwin0293');
      console.error('   • Verify network connectivity to the server');
      console.error('   • Check firewall settings');
      console.error('   • Ensure port 1433 is open');
    } else if (error.message.includes('Login failed')) {
      console.error('\n💡 Possible solutions:');
      console.error('   • Verify username and password');
      console.error('   • Check if SQL Server authentication is enabled');
      console.error('   • Ensure user has proper permissions');
    }

  } finally {
    if (sequelize) {
      await sequelize.close();
      console.log('\n📝 Connection closed.');
    }
  }
}

// Ejecutar test
if (require.main === module) {
  testSQLServerConnection()
    .then(() => {
      console.log('\n🏁 Test completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = testSQLServerConnection;