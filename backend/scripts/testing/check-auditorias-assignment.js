/**
 * Script para verificar asignación de auditorías a proveedores
 */

// Forzar SQL Server como base de datos
process.env.DB_TYPE = 'sqlserver';
process.env.SQLSERVER_HOST = 'dwin0293';
process.env.SQLSERVER_PORT = '1433';
process.env.SQLSERVER_DATABASE = 'sat_digital_v2';
process.env.SQLSERVER_USERNAME = 'calidad';
process.env.SQLSERVER_PASSWORD = 'passcalidad';
process.env.SQLSERVER_ENCRYPT = 'false';
process.env.SQLSERVER_TRUST_CERT = 'true';

const { sequelize } = require('./src/shared/database/connection');

async function checkAssignments() {
  try {
    console.log('🔍 Verificando asignación de auditorías...\n');

    // 1. Verificar proveedor GRUPO ACTIVO SRL
    console.log('📋 1. Información del Proveedor:');
    const [proveedor] = await sequelize.query(`
      SELECT id, nombre_comercial, razon_social
      FROM proveedores
      WHERE id = 1
    `);
    console.log(JSON.stringify(proveedor, null, 2));

    // 2. Verificar sitios de este proveedor
    console.log('\n🏢 2. Sitios del Proveedor ID 1:');
    const [sitios] = await sequelize.query(`
      SELECT id, nombre, localidad, estado, proveedor_id
      FROM sitios
      WHERE proveedor_id = 1
    `);
    console.log(`Total: ${sitios.length} sitios`);
    sitios.forEach(s => {
      console.log(`   - ID: ${s.id} | Nombre: ${s.nombre} | Estado: ${s.estado}`);
    });

    // 3. Verificar auditorías creadas
    console.log('\n📝 3. Auditorías del período 2025-2S:');
    const [auditorias] = await sequelize.query(`
      SELECT a.id, a.sitio_id, a.periodo, s.nombre as sitio_nombre, s.proveedor_id, p.nombre_comercial
      FROM auditorias a
      LEFT JOIN sitios s ON a.sitio_id = s.id
      LEFT JOIN proveedores p ON s.proveedor_id = p.id
      WHERE a.periodo = '2025-2S'
    `);
    console.log(`Total: ${auditorias.length} auditorías`);
    auditorias.forEach(a => {
      console.log(`   - ID: ${a.id} | Sitio: ${a.sitio_nombre} | Proveedor: ${a.nombre_comercial} (ID: ${a.proveedor_id})`);
    });

    // 4. Auditorías específicas del proveedor ID 1
    console.log('\n✅ 4. Auditorías ASIGNADAS al Proveedor ID 1:');
    const [asignadas] = await sequelize.query(`
      SELECT a.id, a.sitio_id, s.nombre as sitio_nombre
      FROM auditorias a
      INNER JOIN sitios s ON a.sitio_id = s.id
      WHERE a.periodo = '2025-2S'
        AND s.proveedor_id = 1
    `);
    console.log(`Total: ${asignadas.length} auditorías`);
    if (asignadas.length > 0) {
      asignadas.forEach(a => {
        console.log(`   - ID: ${a.id} | Sitio: ${a.sitio_nombre}`);
      });
    } else {
      console.log('   ⚠️  NO HAY AUDITORÍAS ASIGNADAS A ESTE PROVEEDOR');
    }

    // 5. Todos los sitios activos (para ver qué tiene el sistema)
    console.log('\n🌐 5. TODOS los Sitios Activos en el Sistema:');
    const [todosSitios] = await sequelize.query(`
      SELECT s.id, s.nombre, s.localidad, p.nombre_comercial, p.id as proveedor_id
      FROM sitios s
      INNER JOIN proveedores p ON s.proveedor_id = p.id
      WHERE s.estado = 'activo'
      ORDER BY p.nombre_comercial
    `);
    console.log(`Total: ${todosSitios.length} sitios activos`);
    todosSitios.forEach(s => {
      console.log(`   - ID: ${s.id} | ${s.nombre} (${s.localidad}) | Proveedor: ${s.nombre_comercial} (ID: ${s.proveedor_id})`);
    });

    console.log('\n✅ Verificación completada\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkAssignments();
