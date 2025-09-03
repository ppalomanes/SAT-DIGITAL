// Prueba de conexión MySQL directa
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Probando conexión MySQL...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '', // XAMPP por defecto no tiene password
      database: 'sat_digital'
    });

    console.log('✅ Conexión MySQL exitosa!');
    
    // Probar una query simple
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query de prueba exitosa:', rows);
    
    await connection.end();
    console.log('✅ Conexión cerrada correctamente');
    
  } catch (error) {
    console.error('❌ Error de conexión MySQL:', error.message);
    console.error('Detalles:', {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    });
    
    // Intentar conectar sin database específica
    console.log('\n🔄 Intentando conexión sin base de datos específica...');
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: ''
      });
      
      console.log('✅ MySQL está funcionando, pero la DB sat_digital no existe');
      
      // Crear la base de datos
      await connection.execute('CREATE DATABASE IF NOT EXISTS sat_digital CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci');
      console.log('✅ Base de datos sat_digital creada exitosamente');
      
      await connection.end();
      
    } catch (innerError) {
      console.error('❌ MySQL no está funcionando:', innerError.message);
      console.log('\n🔧 Soluciones posibles:');
      console.log('1. Iniciar MySQL en XAMPP');
      console.log('2. Verificar puerto 3306 no esté ocupado');
      console.log('3. Reiniciar XAMPP completamente');
    }
  }
}

testConnection();