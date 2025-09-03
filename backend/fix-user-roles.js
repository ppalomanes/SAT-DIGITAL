const { Usuario } = require('./src/shared/database/models');
const { sequelize } = require('./src/shared/database/connection');
const bcrypt = require('bcryptjs');

async function fixUsers() {
  try {
    console.log('🔧 Corrigiendo usuarios con roles vacíos...');
    await sequelize.authenticate();
    
    // 1. Corregir admin@satdigital.com
    const adminUpdate = await Usuario.update(
      { rol: 'administrador' },
      { where: { email: 'admin@satdigital.com' } }
    );
    console.log(`✅ Admin actualizado: ${adminUpdate[0]} filas`);

    // 2. Corregir auditor@satdigital.com  
    const auditorUpdate = await Usuario.update(
      { rol: 'auditor_general' },
      { where: { email: 'auditor@satdigital.com' } }
    );
    console.log(`✅ Auditor actualizado: ${auditorUpdate[0]} filas`);

    // 3. Corregir proveedor@activo.com
    const proveedorUpdate = await Usuario.update(
      { rol: 'jefe_proveedor' },
      { where: { email: 'proveedor@activo.com' } }
    );
    console.log(`✅ Proveedor actualizado: ${proveedorUpdate[0]} filas`);

    // 4. Verificar resultado
    console.log('\n📋 Verificando usuarios corregidos...');
    const usuariosCorregidos = await Usuario.findAll({
      where: {
        email: ['admin@satdigital.com', 'auditor@satdigital.com', 'proveedor@activo.com']
      },
      attributes: ['email', 'nombre', 'rol', 'estado'],
      raw: true
    });

    usuariosCorregidos.forEach((user, index) => {
      console.log(`\n${index + 1}. 📧 ${user.email}`);
      console.log(`   🎭 Rol: ${user.rol}`);
      console.log(`   📊 Estado: ${user.estado}`);
    });

    console.log('\n🎉 USUARIOS CORREGIDOS EXITOSAMENTE');
    console.log('=======================================');
    console.log('🔑 Credenciales listas para usar:');
    console.log('   • admin@satdigital.com / admin123 (Administrador)');
    console.log('   • auditor@satdigital.com / auditor123 (Auditor General)');  
    console.log('   • proveedor@activo.com / proveedor123 (Jefe Proveedor)');
    console.log('=======================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error corrigiendo usuarios:', error);
    process.exit(1);
  }
}

fixUsers();
