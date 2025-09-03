const mysql = require('mysql2/promise');

async function fixUsersDirectSQL() {
  let connection;
  try {
    console.log('🔧 Corrigiendo roles con SQL directo...');
    
    // Crear conexión directa
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'sat_digital'
    });

    console.log('✅ Conectado a MySQL');

    // Actualizar roles directamente
    const updates = [
      {
        email: 'admin@satdigital.com',
        rol: 'administrador',
        descripcion: 'Admin principal'
      },
      {
        email: 'auditor@satdigital.com', 
        rol: 'auditor_general',
        descripcion: 'Auditor general'
      },
      {
        email: 'proveedor@activo.com',
        rol: 'jefe_proveedor',
        descripcion: 'Jefe de proveedor'
      }
    ];

    for (const update of updates) {
      const [result] = await connection.execute(
        'UPDATE usuarios SET rol = ? WHERE email = ?',
        [update.rol, update.email]
      );
      
      console.log(`✅ ${update.descripcion} (${update.email}): ${result.affectedRows} filas actualizadas`);
    }

    // Verificar resultados
    console.log('\n📋 Verificando usuarios corregidos...');
    const [rows] = await connection.execute(
      'SELECT email, nombre, rol, estado FROM usuarios WHERE email IN (?, ?, ?)',
      ['admin@satdigital.com', 'auditor@satdigital.com', 'proveedor@activo.com']
    );

    rows.forEach((user, index) => {
      console.log(`\n${index + 1}. 📧 ${user.email}`);
      console.log(`   👤 Nombre: ${user.nombre}`);
      console.log(`   🎭 Rol: ${user.rol}`);
      console.log(`   📊 Estado: ${user.estado}`);
    });

    console.log('\n🎉 ROLES CORREGIDOS CON SQL DIRECTO');
    console.log('=======================================');
    console.log('🔑 Credenciales listas:');
    console.log('   • admin@satdigital.com / admin123');
    console.log('   • auditor@satdigital.com / auditor123');  
    console.log('   • proveedor@activo.com / proveedor123');
    console.log('=======================================\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

fixUsersDirectSQL();
