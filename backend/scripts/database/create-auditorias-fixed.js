/**
 * Script para crear auditorías para todos los sitios activos
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

async function createAuditorias() {
  try {
    console.log('🔄 Conectando a SQL Server...\n');

    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a SQL Server\n');

    // 1. Verificar período activo
    console.log('📅 1. Verificando período activo...');
    const [periodosActivos] = await sequelize.query(`
      SELECT id, nombre, codigo, fecha_inicio, fecha_limite_carga, fecha_inicio_visitas, fecha_fin_visitas, estado
      FROM periodos_auditoria
      WHERE estado = 'activo'
    `);

    if (!periodosActivos || periodosActivos.length === 0) {
      console.log('❌ ERROR: No hay período activo en el sistema');
      process.exit(1);
    }

    const periodo = periodosActivos[0];
    console.log(`✅ Período activo encontrado: ${periodo.nombre} (${periodo.codigo})`);
    console.log(`   Código: ${periodo.codigo}`);
    console.log(`   Fecha inicio: ${periodo.fecha_inicio}`);
    console.log(`   Fecha límite carga: ${periodo.fecha_limite_carga}\n`);

    // 2. Verificar sitios activos
    console.log('🏢 2. Verificando sitios activos...');
    const [sitios] = await sequelize.query(`
      SELECT s.id, s.nombre, s.localidad, p.nombre_comercial
      FROM sitios s
      INNER JOIN proveedores p ON s.proveedor_id = p.id
      WHERE s.estado = 'activo'
      ORDER BY p.nombre_comercial, s.nombre
    `);

    console.log(`✅ Encontrados ${sitios.length} sitios activos:`);
    sitios.forEach((s, i) => {
      console.log(`   ${i+1}. ${s.nombre} (${s.localidad}) - Proveedor: ${s.nombre_comercial}`);
    });
    console.log('');

    if (sitios.length === 0) {
      console.log('❌ ERROR: No hay sitios activos. No se pueden crear auditorías.');
      process.exit(1);
    }

    // 3. Verificar si ya existen auditorías para este período
    console.log('📋 3. Verificando auditorías existentes...');
    const [auditoriasExistentes] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM auditorias
      WHERE periodo = ?
    `, {
      replacements: [periodo.codigo]
    });

    const totalExistentes = auditoriasExistentes[0].total;
    console.log(`   Auditorías existentes: ${totalExistentes}`);

    if (totalExistentes > 0) {
      console.log('⚠️  Ya existen auditorías para este período. Eliminándolas primero...');
      await sequelize.query(`
        DELETE FROM auditorias WHERE periodo = ?
      `, {
        replacements: [periodo.codigo]
      });
      console.log('✅ Auditorías anteriores eliminadas\n');
    } else {
      console.log('✅ No hay auditorías anteriores\n');
    }

    // 4. Crear auditorías para cada sitio activo
    console.log('🚀 4. Creando auditorías para cada sitio...');

    for (const sitio of sitios) {
      const [result] = await sequelize.query(`
        INSERT INTO auditorias
        (sitio_id, periodo, fecha_inicio, fecha_limite_carga, fecha_visita_programada, estado, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, GETDATE(), GETDATE())
      `, {
        replacements: [
          sitio.id,
          periodo.codigo,
          periodo.fecha_inicio,
          periodo.fecha_limite_carga,
          periodo.fecha_inicio_visitas,
          'en_carga'
        ]
      });

      console.log(`   ✅ Auditoría creada para sitio: ${sitio.nombre}`);
    }

    // 5. Verificar creación
    console.log('\n📊 5. Verificando creación...');
    const [nuevasAuditorias] = await sequelize.query(`
      SELECT a.id, a.sitio_id, a.periodo, a.estado, s.nombre as sitio_nombre, p.nombre_comercial
      FROM auditorias a
      INNER JOIN sitios s ON a.sitio_id = s.id
      INNER JOIN proveedores p ON s.proveedor_id = p.id
      WHERE a.periodo = ?
      ORDER BY p.nombre_comercial, s.nombre
    `, {
      replacements: [periodo.codigo]
    });

    console.log(`✅ Total de auditorías creadas: ${nuevasAuditorias.length}\n`);

    console.log('📋 Detalle de auditorías por proveedor:');
    const porProveedor = {};
    nuevasAuditorias.forEach(a => {
      if (!porProveedor[a.nombre_comercial]) {
        porProveedor[a.nombre_comercial] = [];
      }
      porProveedor[a.nombre_comercial].push(a);
    });

    Object.keys(porProveedor).forEach(proveedor => {
      console.log(`\n   ${proveedor}: ${porProveedor[proveedor].length} auditoría(s)`);
      porProveedor[proveedor].forEach(a => {
        console.log(`      - ID ${a.id}: ${a.sitio_nombre} (Estado: ${a.estado})`);
      });
    });

    console.log('\n\n✅ PROCESO COMPLETADO EXITOSAMENTE\n');
    console.log('🎯 Próximos pasos:');
    console.log('   1. Refresca la página http://localhost:3010/auditorias');
    console.log('   2. Deberías ver las auditorías asignadas al proveedor\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.original) {
      console.error('Original error:', error.original.message);
    }
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
createAuditorias();
