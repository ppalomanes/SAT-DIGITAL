/**
 * Script para verificar usuarios en SQL Server
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const { sequelize } = require('./src/shared/database/connection');

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a SQL Server');

    const [usuarios] = await sequelize.query('SELECT email, nombre, rol, password_hash FROM [usuarios]');
    console.log('\n👥 Usuarios en SQL Server:');
    usuarios.forEach(user => {
      console.log(`   📧 ${user.email}`);
      console.log(`   👤 ${user.nombre}`);
      console.log(`   🎭 ${user.rol}`);
      console.log(`   🔑 Hash: ${user.password_hash}`);
      console.log('   ---');
    });

    console.log(`\n📊 Total usuarios: ${usuarios.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

checkUsers();