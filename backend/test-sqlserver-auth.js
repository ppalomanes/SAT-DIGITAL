/**
 * Test de autenticación SQL Server
 * Script para verificar credenciales sin base de datos específica
 */

require('dotenv').config({ path: '.env.sqlserver' });
const { Sequelize } = require('sequelize');

async function testSQLServerAuth() {
  console.log('🔄 Testing SQL Server authentication...');
  console.log(`📡 Server: ${process.env.SQLSERVER_HOST}:${process.env.SQLSERVER_PORT}`);
  console.log(`👤 User: ${process.env.SQLSERVER_USERNAME}`);
  console.log('');

  // Configuración sin base de datos específica
  const config = {
    host: process.env.SQLSERVER_HOST,
    port: parseInt(process.env.SQLSERVER_PORT) || 1433,
    database: 'master', // Usar master para test de autenticación
    username: process.env.SQLSERVER_USERNAME,
    password: process.env.SQLSERVER_PASSWORD,
    dialect: 'mssql',
    logging: false, // Silenciar logs para este test
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        requestTimeout: 30000,
        connectionTimeout: 60000,
        cancelTimeout: 5000
      }
    },
    pool: {
      max: 1,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };

  let sequelize;

  try {
    sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      config
    );

    console.log('⏳ Testing authentication with master database...');
    await sequelize.authenticate();
    console.log('✅ Authentication successful!');

    // Obtener información del usuario
    const [userInfo] = await sequelize.query(`
      SELECT
        SYSTEM_USER as SystemUser,
        USER_NAME() as UserName,
        IS_SRVROLEMEMBER('sysadmin') as IsSysAdmin,
        IS_SRVROLEMEMBER('dbcreator') as IsDbCreator
    `);

    console.log('\n👤 User Information:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔐 System User: ${userInfo[0].SystemUser}`);
    console.log(`👥 User Name: ${userInfo[0].UserName}`);
    console.log(`⚡ Is SysAdmin: ${userInfo[0].IsSysAdmin ? 'Yes' : 'No'}`);
    console.log(`🏗️  Is DbCreator: ${userInfo[0].IsDbCreator ? 'Yes' : 'No'}`);

    // Listar bases de datos accesibles
    console.log('\n📚 Accessible Databases:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      const [databases] = await sequelize.query(`
        SELECT
          d.name as DatabaseName,
          CASE
            WHEN HAS_DBACCESS(d.name) = 1 THEN 'Yes'
            ELSE 'No'
          END as HasAccess
        FROM sys.databases d
        WHERE d.name NOT IN ('tempdb')
        ORDER BY d.name
      `);

      databases.forEach((db, index) => {
        const accessIcon = db.HasAccess === 'Yes' ? '✅' : '❌';
        console.log(`${index + 1}. ${db.DatabaseName} ${accessIcon}`);
      });

      // Verificar acceso específico a nuestra base de datos
      const targetDb = process.env.SQLSERVER_DATABASE;
      const targetDbAccess = databases.find(db => db.DatabaseName === targetDb);

      if (targetDbAccess) {
        console.log(`\n🎯 Target Database '${targetDb}': ${targetDbAccess.HasAccess === 'Yes' ? '✅ Accessible' : '❌ No Access'}`);

        if (targetDbAccess.HasAccess === 'Yes') {
          // Intentar conectar específicamente a nuestra base de datos
          console.log(`\n⏳ Testing connection to '${targetDb}'...`);

          const targetConfig = { ...config, database: targetDb };
          const targetSequelize = new Sequelize(
            targetConfig.database,
            targetConfig.username,
            targetConfig.password,
            targetConfig
          );

          try {
            await targetSequelize.authenticate();
            console.log(`✅ Successfully connected to '${targetDb}'!`);

            // Obtener información de la base de datos
            const [dbInfo] = await targetSequelize.query(`
              SELECT
                DB_NAME() as DatabaseName,
                COUNT(*) as TableCount
              FROM INFORMATION_SCHEMA.TABLES
              WHERE TABLE_TYPE = 'BASE TABLE'
            `);

            console.log(`📊 Tables in database: ${dbInfo[0].TableCount}`);

            await targetSequelize.close();
          } catch (error) {
            console.log(`❌ Could not connect to '${targetDb}': ${error.message}`);
          }
        } else {
          console.log(`💡 User '${config.username}' does not have access to '${targetDb}'`);
          console.log('   Contact your DBA to grant access permissions.');
        }
      } else {
        console.log(`\n❌ Database '${targetDb}' not found on server!`);

        // Sugerir crear la base de datos si tiene permisos
        if (userInfo[0].IsDbCreator || userInfo[0].IsSysAdmin) {
          console.log('\n💡 You have permissions to create databases.');
          console.log(`   Would you like to create '${targetDb}'?`);
        }
      }

    } catch (error) {
      console.log('⚠️  Could not list databases:', error.message);
    }

  } catch (error) {
    console.error('\n❌ Authentication failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`🚨 Error: ${error.message}`);

    if (error.code) {
      console.error(`📋 Code: ${error.code}`);
    }

    // Sugerencias específicas
    if (error.message.includes('Login failed')) {
      console.error('\n💡 Authentication Issues:');
      console.error('   • Verify username and password are correct');
      console.error('   • Check if SQL Server uses mixed authentication mode');
      console.error('   • Ensure the user account exists and is enabled');
      console.error('   • Check if the user has login permissions');
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
  testSQLServerAuth()
    .then(() => {
      console.log('\n🏁 Authentication test completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = testSQLServerAuth;