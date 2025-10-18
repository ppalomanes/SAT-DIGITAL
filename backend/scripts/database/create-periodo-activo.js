/**
 * Script para crear período activo y auditorías de prueba
 * Ejecutar con: node create-periodo-activo.js
 */

const { sequelize } = require('./src/shared/database/connection');

async function crearPeriodoYAuditorias() {
  try {
    console.log('🔄 Conectando a base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // 1. Verificar si ya existe un período activo
    console.log('\n📅 Verificando períodos activos...');
    const [periodosActivos] = await sequelize.query(`
      SELECT * FROM periodos_auditoria WHERE activo = 1
    `);

    if (periodosActivos && periodosActivos.length > 0) {
      console.log(`✅ Ya existe un período activo: ${periodosActivos[0].nombre}`);
      console.log(JSON.stringify(periodosActivos[0], null, 2));
    } else {
      console.log('⚠️  No hay período activo, creando uno...');

      // Crear período activo (Mayo-Noviembre 2025)
      const periodo = {
        nombre: 'Mayo-Noviembre 2025',
        codigo: '2025-2S',
        fecha_inicio: '2025-05-01',
        fecha_limite_carga: '2025-06-15',
        fecha_inicio_visitas: '2025-07-01',
        fecha_fin_visitas: '2025-11-30',
        activo: 1,
        estado: 'activo',
        created_by: 1
      };

      const [result] = await sequelize.query(`
        INSERT INTO periodos_auditoria
        (nombre, codigo, fecha_inicio, fecha_limite_carga, fecha_inicio_visitas, fecha_fin_visitas, activo, estado, created_by, created_at, updated_at)
        VALUES
        (:nombre, :codigo, :fecha_inicio, :fecha_limite_carga, :fecha_inicio_visitas, :fecha_fin_visitas, :activo, :estado, :created_by, NOW(), NOW())
      `, {
        replacements: periodo
      });

      console.log('✅ Período activo creado exitosamente');
    }

    // 2. Verificar proveedores y sitios
    console.log('\n🏢 Verificando proveedores...');
    const [proveedores] = await sequelize.query(`
      SELECT id, nombre_comercial FROM proveedores WHERE estado = 'activo' LIMIT 5
    `);
    console.log(`✅ Encontrados ${proveedores.length} proveedores activos`);

    if (proveedores.length === 0) {
      console.log('❌ ERROR: No hay proveedores activos. Ejecuta el seeder primero.');
      process.exit(1);
    }

    console.log('\n🏠 Verificando sitios...');
    const [sitios] = await sequelize.query(`
      SELECT s.id, s.nombre, p.nombre_comercial as proveedor
      FROM sitios s
      INNER JOIN proveedores p ON s.proveedor_id = p.id
      WHERE s.estado = 'activo'
      LIMIT 10
    `);
    console.log(`✅ Encontrados ${sitios.length} sitios activos`);

    if (sitios.length === 0) {
      console.log('❌ ERROR: No hay sitios activos. Ejecuta el seeder primero.');
      process.exit(1);
    }

    // 3. Crear auditorías para el período activo
    console.log('\n📋 Verificando auditorías...');
    const [auditoriasExistentes] = await sequelize.query(`
      SELECT COUNT(*) as total FROM auditorias WHERE periodo = '2025-2S'
    `);

    if (auditoriasExistentes[0].total > 0) {
      console.log(`✅ Ya existen ${auditoriasExistentes[0].total} auditorías para el período`);
    } else {
      console.log('⚠️  No hay auditorías, creando...');

      // Crear una auditoría por cada sitio
      for (const sitio of sitios) {
        await sequelize.query(`
          INSERT INTO auditorias
          (sitio_id, periodo, fecha_inicio, fecha_limite_carga, fecha_visita_programada, estado, created_by, created_at, updated_at)
          VALUES
          (:sitio_id, '2025-2S', '2025-05-01', '2025-06-15', '2025-07-15', 'en_carga', 1, NOW(), NOW())
        `, {
          replacements: {
            sitio_id: sitio.id
          }
        });

        console.log(`  ✅ Auditoría creada para sitio: ${sitio.nombre} (${sitio.proveedor})`);
      }
    }

    // 4. Verificar resultado final
    console.log('\n📊 RESUMEN FINAL:');
    const [resumen] = await sequelize.query(`
      SELECT
        (SELECT COUNT(*) FROM periodos_auditoria WHERE activo = 1) as periodos_activos,
        (SELECT COUNT(*) FROM proveedores WHERE estado = 'activo') as proveedores_activos,
        (SELECT COUNT(*) FROM sitios WHERE estado = 'activo') as sitios_activos,
        (SELECT COUNT(*) FROM auditorias WHERE periodo = '2025-2S') as auditorias_creadas
    `);

    console.log(JSON.stringify(resumen[0], null, 2));
    console.log('\n✅ PROCESO COMPLETADO EXITOSAMENTE\n');
    console.log('🎯 Ahora puedes:\n');
    console.log('   1. Iniciar sesión con usuario proveedor (proveedor@activo.com / proveedor123)');
    console.log('   2. Ir a /auditorias');
    console.log('   3. Ver las auditorías asignadas y trabajar en ellas\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
crearPeriodoYAuditorias();
