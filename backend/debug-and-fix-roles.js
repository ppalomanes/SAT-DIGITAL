const mysql = require('mysql2/promise');

async function debugAndFixRoles() {
  let connection;
  try {
    console.log('🔍 DIAGNÓSTICO Y CORRECCIÓN DE ROLES');
    console.log('=====================================\n');
    
    // Crear conexión directa
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'sat_digital'
    });

    console.log('✅ Conectado a MySQL\n');

    // 1. DIAGNÓSTICO: Ver estructura de la tabla
    console.log('📋 ESTRUCTURA DE LA TABLA usuarios:');
    const [columns] = await connection.execute('DESCRIBE usuarios');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : '(NULL)'} ${col.Default ? `DEFAULT: ${col.Default}` : ''}`);
    });

    // 2. Ver usuarios actuales
    console.log('\n👥 USUARIOS ACTUALES EN LA BASE DE DATOS:');
    const [currentUsers] = await connection.execute(
      'SELECT id, email, nombre, rol, estado FROM usuarios ORDER BY id'
    );
    
    currentUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ID: ${user.id}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Nombre: ${user.nombre}`);
      console.log(`   🎭 Rol: "${user.rol}" ${!user.rol || user.rol === '' ? '⚠️  VACÍO!' : '✅'}`);
      console.log(`   📊 Estado: ${user.estado}`);
    });

    // 3. CORRECCIÓN: Actualizar roles uno por uno
    console.log('\n🔧 INICIANDO CORRECCIÓN DE ROLES...\n');
    
    const updates = [
      {
        email: 'admin@satdigital.com',
        rol: 'administrador',
        descripcion: '🔑 Admin principal'
      },
      {
        email: 'auditor@satdigital.com', 
        rol: 'auditor_general',
        descripcion: '🔍 Auditor general'
      },
      {
        email: 'proveedor@activo.com',
        rol: 'jefe_proveedor',
        descripcion: '🏢 Jefe de proveedor'
      }
    ];

    for (const update of updates) {
      console.log(`🔄 Actualizando: ${update.descripcion}`);
      
      // Verificar si el usuario existe
      const [existingUser] = await connection.execute(
        'SELECT id, email, rol FROM usuarios WHERE email = ?',
        [update.email]
      );
      
      if (existingUser.length === 0) {
        console.log(`   ❌ Usuario no encontrado: ${update.email}`);
        continue;
      }
      
      console.log(`   📧 Usuario encontrado: ID ${existingUser[0].id}, Rol actual: "${existingUser[0].rol}"`);
      
      // Actualizar rol
      const [result] = await connection.execute(
        'UPDATE usuarios SET rol = ? WHERE email = ? AND id = ?',
        [update.rol, update.email, existingUser[0].id]
      );
      
      console.log(`   ✅ Resultado: ${result.affectedRows} filas actualizadas (de ${result.changedRows} cambios)`);
      
      // Verificar la actualización
      const [verifiedUser] = await connection.execute(
        'SELECT rol FROM usuarios WHERE email = ?',
        [update.email]
      );
      
      console.log(`   🔍 Verificación: Nuevo rol = "${verifiedUser[0].rol}"\n`);
    }

    // 4. VERIFICACIÓN FINAL
    console.log('🎯 VERIFICACIÓN FINAL:');
    console.log('======================\n');
    
    const [finalUsers] = await connection.execute(
      'SELECT email, nombre, rol, estado FROM usuarios WHERE email IN (?, ?, ?)',
      ['admin@satdigital.com', 'auditor@satdigital.com', 'proveedor@activo.com']
    );

    finalUsers.forEach((user, index) => {
      const rolValid = user.rol && user.rol !== '';
      console.log(`${index + 1}. 📧 ${user.email}`);
      console.log(`   👤 ${user.nombre}`);
      console.log(`   🎭 Rol: "${user.rol}" ${rolValid ? '✅' : '❌ VACÍO!'}`);
      console.log(`   📊 Estado: ${user.estado}\n`);
    });

    // 5. CREDENCIALES
    console.log('🔐 CREDENCIALES PARA PRUEBAS:');
    console.log('==============================');
    console.log('🔑 admin@satdigital.com / admin123');
    console.log('🔍 auditor@satdigital.com / auditor123');  
    console.log('🏢 proveedor@activo.com / proveedor123');
    console.log('==============================\n');
    
    console.log('✅ PROCESO COMPLETADO');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión MySQL cerrada');
    }
  }
}

debugAndFixRoles();
