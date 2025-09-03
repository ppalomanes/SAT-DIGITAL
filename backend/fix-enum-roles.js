const mysql = require('mysql2/promise');

async function fixRolesWithCorrectEnum() {
  let connection;
  try {
    console.log('🔧 CORRECCIÓN DEFINITIVA DE ROLES');
    console.log('==================================\n');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'sat_digital'
    });

    console.log('✅ Conectado a MySQL\n');

    // Ver los valores ENUM permitidos
    console.log('📋 Verificando valores ENUM permitidos...');
    const [enumInfo] = await connection.execute(
      `SHOW COLUMNS FROM usuarios LIKE 'rol'`
    );
    console.log('   Valores ENUM permitidos:', enumInfo[0].Type);

    // Los valores correctos del ENUM son: 'admin', 'auditor', 'proveedor', 'visualizador'
    const updates = [
      {
        email: 'admin@satdigital.com',
        rol: 'admin',  // ✅ Coincide con ENUM
        descripcion: '🔑 Admin principal'
      },
      {
        email: 'auditor@satdigital.com', 
        rol: 'auditor',  // ✅ Coincide con ENUM
        descripcion: '🔍 Auditor general'
      },
      {
        email: 'proveedor@activo.com',
        rol: 'proveedor',  // ✅ Coincide con ENUM
        descripcion: '🏢 Jefe de proveedor'
      }
    ];

    console.log('\n🔄 ACTUALIZANDO ROLES CON VALORES ENUM CORRECTOS:\n');

    for (const update of updates) {
      console.log(`${update.descripcion} (${update.email})`);
      
      // Buscar el usuario
      const [users] = await connection.execute(
        'SELECT id, email, rol FROM usuarios WHERE email = ?',
        [update.email]
      );
      
      if (users.length === 0) {
        console.log(`   ❌ Usuario no encontrado\n`);
        continue;
      }

      const user = users[0];
      console.log(`   📍 Usuario ID: ${user.id}, Rol actual: "${user.rol}"`);
      
      // Actualizar con el valor ENUM correcto
      const [result] = await connection.execute(
        'UPDATE usuarios SET rol = ? WHERE id = ?',
        [update.rol, user.id]
      );
      
      console.log(`   ✅ Actualizado: ${result.affectedRows} filas afectadas`);
      
      // Verificar inmediatamente
      const [verifyUsers] = await connection.execute(
        'SELECT rol FROM usuarios WHERE id = ?',
        [user.id]
      );
      
      console.log(`   🔍 Verificación: Nuevo rol = "${verifyUsers[0].rol}"\n`);
    }

    // VERIFICACIÓN FINAL COMPLETA
    console.log('🎯 VERIFICACIÓN FINAL DE TODOS LOS USUARIOS:');
    console.log('=============================================\n');
    
    const [allUsers] = await connection.execute(
      'SELECT id, email, nombre, rol, estado FROM usuarios ORDER BY id'
    );

    allUsers.forEach((user) => {
      const rolStatus = user.rol && user.rol !== '' ? '✅' : '❌';
      console.log(`ID: ${user.id} | ${user.email}`);
      console.log(`   👤 ${user.nombre}`);
      console.log(`   🎭 Rol: "${user.rol}" ${rolStatus}`);
      console.log(`   📊 Estado: ${user.estado}\n`);
    });

    // CREDENCIALES ACTUALIZADAS
    console.log('🔐 CREDENCIALES CORREGIDAS:');
    console.log('===========================');
    console.log('🔑 admin@satdigital.com / admin123 (rol: admin)');
    console.log('🔍 auditor@satdigital.com / auditor123 (rol: auditor)');  
    console.log('🏢 proveedor@activo.com / proveedor123 (rol: proveedor)');
    console.log('===========================\n');
    
    console.log('✅ CORRECCIÓN COMPLETADA CON VALORES ENUM VÁLIDOS');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

fixRolesWithCorrectEnum();
