const { Usuario } = require('./src/shared/database/models');
const { sequelize } = require('./src/shared/database/connection');

async function checkUsers() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    
    console.log('📋 Consultando usuarios...');
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'email', 'nombre', 'rol', 'estado', 'proveedor_id'],
      raw: true
    });
    
    console.log('\n=======================================');
    console.log('👥 USUARIOS EN LA BASE DE DATOS:');
    console.log('=======================================');
    
    if (usuarios.length === 0) {
      console.log('❌ NO HAY USUARIOS EN LA BASE DE DATOS');
      console.log('🚀 Necesitas ejecutar: node src/shared/database/seeders.js');
    } else {
      usuarios.forEach((user, index) => {
        console.log(`\n${index + 1}. 📧 Email: ${user.email}`);
        console.log(`   👤 Nombre: ${user.nombre}`);
        console.log(`   🎭 Rol: ${user.rol}`);
        console.log(`   📊 Estado: ${user.estado}`);
        console.log(`   🏢 Proveedor ID: ${user.proveedor_id || 'N/A'}`);
      });
    }
    
    console.log('\n=======================================\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error consultando usuarios:', error.message);
    console.error('💡 Asegúrate de que MySQL esté ejecutándose en XAMPP');
    process.exit(1);
  }
}

checkUsers();
