/**
 * Script para probar conexión SQL Server y crear datos de auditorías
 * Ejecutar con: node backend/test-and-fix-db.js
 */

const { sequelize } = require('./src/shared/database/connection');

async function testAndFixDatabase() {
  try {
    console.log('🔄 Conectando a SQL Server...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a SQL Server');
    console.log(`   Host: ${sequelize.config.host}`);
    console.log(`   Database: ${sequelize.config.database}\n`);

    // 1. Verificar estructura de tablas
    console.log('📊 1. Verificando estructura de tablas...');

    // Verificar columnas de secciones_tecnicas
    const [seccionesCols] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'secciones_tecnicas'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n📋 Columnas de secciones_tecnicas:');
    seccionesCols.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    // Verificar columnas de periodos_auditoria
    const [periodosCols] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'periodos_auditoria'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n📅 Columnas de periodos_auditoria:');
    periodosCols.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    // Verificar columnas de auditorias
    const [auditoriasCols] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'auditorias'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n📝 Columnas de auditorias:');
    auditoriasCols.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    // 2. Verificar período activo
    console.log('\n\n📅 2. Verificando período activo...');
    const [periodosActivos] = await sequelize.query(`
      SELECT * FROM periodos_auditoria WHERE estado = 'activo'
    `);

    let periodoActivo;
    if (periodosActivos && periodosActivos.length > 0) {
      periodoActivo = periodosActivos[0];
      console.log(`✅ Período activo encontrado: ${periodoActivo.nombre} (${periodoActivo.codigo})`);
    } else {
      console.log('⚠️  No hay período activo, creando uno...');

      const columnsToUse = periodosCols.map(c => c.COLUMN_NAME);
      const hasCreatedBy = columnsToUse.includes('created_by');
      const hasCreatedAt = columnsToUse.includes('created_at');
      const hasUpdatedAt = columnsToUse.includes('updated_at');

      let insertQuery = `
        INSERT INTO periodos_auditoria
        (nombre, codigo, fecha_inicio, fecha_limite_carga, fecha_inicio_visitas, fecha_fin_visitas, estado, configuracion_especial
      `;

      if (hasCreatedBy) insertQuery += ', created_by';
      if (hasCreatedAt) insertQuery += ', created_at';
      if (hasUpdatedAt) insertQuery += ', updated_at';

      insertQuery += `) VALUES (?, ?, ?, ?, ?, ?, ?, ?`;

      if (hasCreatedBy) insertQuery += ', ?';
      if (hasCreatedAt) insertQuery += ', GETDATE()';
      if (hasUpdatedAt) insertQuery += ', GETDATE()';

      insertQuery += ')';

      const values = [
        'Mayo-Noviembre 2025',
        '2025-2S',
        '2025-05-01',
        '2025-06-15',
        '2025-07-01',
        '2025-11-30',
        'activo',
        null
      ];

      if (hasCreatedBy) values.push(1);

      await sequelize.query(insertQuery, {
        replacements: values
      });

      const [newPeriodo] = await sequelize.query(`
        SELECT * FROM periodos_auditoria WHERE codigo = '2025-2S'
      `);
      periodoActivo = newPeriodo[0];
      console.log(`✅ Período activo creado: ${periodoActivo.nombre}`);
    }

    // 3. Verificar proveedores y sitios
    console.log('\n🏢 3. Verificando proveedores y sitios...');
    const [proveedores] = await sequelize.query(`
      SELECT COUNT(*) as total FROM proveedores WHERE estado = 'activo'
    `);
    console.log(`✅ Proveedores activos: ${proveedores[0].total}`);

    const [sitios] = await sequelize.query(`
      SELECT COUNT(*) as total FROM sitios WHERE estado = 'activo'
    `);
    console.log(`✅ Sitios activos: ${sitios[0].total}`);

    if (sitios[0].total === 0) {
      console.log('❌ ERROR: No hay sitios activos. No se pueden crear auditorías.');
      process.exit(1);
    }

    // 4. Crear auditorías
    console.log('\n📋 4. Verificando auditorías...');
    const [auditoriasExistentes] = await sequelize.query(`
      SELECT COUNT(*) as total FROM auditorias WHERE periodo = ?
    `, {
      replacements: [periodoActivo.codigo]
    });

    if (auditoriasExistentes[0].total > 0) {
      console.log(`✅ Ya existen ${auditoriasExistentes[0].total} auditorías para el período`);
    } else {
      console.log('⚠️  No hay auditorías, creando...');

      const auditoriaColumns = auditoriasCols.map(c => c.COLUMN_NAME);
      const hasCreatedAt = auditoriaColumns.includes('created_at');
      const hasUpdatedAt = auditoriaColumns.includes('updated_at');

      let insertAuditoriaQuery = `
        INSERT INTO auditorias
        (sitio_id, periodo, fecha_inicio, fecha_limite_carga, fecha_visita_programada, fecha_visita_realizada, auditor_asignado_id, estado, puntaje_final, observaciones_generales
      `;

      if (hasCreatedAt) insertAuditoriaQuery += ', created_at';
      if (hasUpdatedAt) insertAuditoriaQuery += ', updated_at';

      insertAuditoriaQuery += `)
        SELECT
          s.id,
          ?,
          ?,
          ?,
          ?,
          NULL,
          NULL,
          ?,
          NULL,
          NULL
      `;

      if (hasCreatedAt) insertAuditoriaQuery += ', GETDATE()';
      if (hasUpdatedAt) insertAuditoriaQuery += ', GETDATE()';

      insertAuditoriaQuery += `
        FROM sitios s
        WHERE s.estado = 'activo'
      `;

      await sequelize.query(insertAuditoriaQuery, {
        replacements: [
          periodoActivo.codigo,
          '2025-05-01',
          '2025-06-15',
          '2025-07-15',
          'en_carga'
        ]
      });

      const [newAuditorias] = await sequelize.query(`
        SELECT COUNT(*) as total FROM auditorias WHERE periodo = ?
      `, {
        replacements: [periodoActivo.codigo]
      });

      console.log(`✅ Auditorías creadas: ${newAuditorias[0].total}`);
    }

    // 5. Crear secciones técnicas
    console.log('\n📚 5. Verificando secciones técnicas...');
    const [seccionesExistentes] = await sequelize.query(`
      SELECT COUNT(*) as total FROM secciones_tecnicas WHERE estado = 'activa'
    `);

    if (seccionesExistentes[0].total >= 13) {
      console.log(`✅ Ya existen ${seccionesExistentes[0].total} secciones técnicas`);
    } else {
      console.log('⚠️  Faltan secciones técnicas, creando...');

      // Limpiar secciones existentes
      await sequelize.query('DELETE FROM secciones_tecnicas');

      const seccionColumns = seccionesCols.map(c => c.COLUMN_NAME);
      const hasCreatedAt = seccionColumns.includes('created_at');
      const hasUpdatedAt = seccionColumns.includes('updated_at');

      const secciones = [
        ['topologia', 'Topología de Red', 'Diseño y distribución de la infraestructura de red', 'tiempo_real', 1, 1, 'activa'],
        ['documentacion', 'Documentación y Controles', 'Documentación necesaria para el control de la infraestructura', 'tiempo_real', 1, 2, 'activa'],
        ['energia', 'Energía CT', 'Sistema de energía del cuarto tecnológico', 'tiempo_real', 1, 3, 'activa'],
        ['temperatura', 'Temperatura CT', 'Control de temperatura del cuarto tecnológico', 'tiempo_real', 1, 4, 'activa'],
        ['servidores', 'Servidores', 'Información técnica de servidores', 'tiempo_real', 1, 5, 'activa'],
        ['internet', 'Internet', 'Conectividad y ancho de banda', 'tiempo_real', 1, 6, 'activa'],
        ['personal', 'Personal Capacitado', 'Personal técnico en sitio', 'tiempo_real', 1, 7, 'activa'],
        ['escalamiento', 'Escalamiento', 'Contactos de escalamiento técnico', 'tiempo_real', 1, 8, 'activa'],
        ['cuarto_tecnologia', 'Cuarto de Tecnología', 'Fotografías e inventario del Data Center', 'lotes', 1, 9, 'activa'],
        ['conectividad', 'Conectividad', 'Certificación de cableado de datos', 'lotes', 1, 10, 'activa'],
        ['hardware_software', 'Hardware/Software', 'Parque informático presencial y teletrabajo', 'lotes', 1, 11, 'activa'],
        ['seguridad', 'Seguridad de la Información', 'Políticas y procedimientos de seguridad', 'lotes', 1, 12, 'activa'],
        ['entorno', 'Entorno de la Información', 'Información del entorno tecnológico', 'lotes', 1, 13, 'activa']
      ];

      let insertSeccionQuery = `
        INSERT INTO secciones_tecnicas
        (codigo, nombre, descripcion, tipo_analisis, obligatoria, orden_presentacion, estado
      `;

      if (hasCreatedAt) insertSeccionQuery += ', created_at';
      if (hasUpdatedAt) insertSeccionQuery += ', updated_at';

      insertSeccionQuery += `) VALUES (?, ?, ?, ?, ?, ?, ?`;

      if (hasCreatedAt) insertSeccionQuery += ', GETDATE()';
      if (hasUpdatedAt) insertSeccionQuery += ', GETDATE()';

      insertSeccionQuery += ')';

      for (const seccion of secciones) {
        await sequelize.query(insertSeccionQuery, {
          replacements: seccion
        });
      }

      console.log(`✅ Secciones técnicas creadas: 13`);
    }

    // 6. Resumen final
    console.log('\n\n📊 RESUMEN FINAL:');
    console.log('============================================');

    const [resumen] = await sequelize.query(`
      SELECT
        (SELECT COUNT(*) FROM periodos_auditoria WHERE estado = 'activo') as periodos_activos,
        (SELECT COUNT(*) FROM proveedores WHERE estado = 'activo') as proveedores_activos,
        (SELECT COUNT(*) FROM sitios WHERE estado = 'activo') as sitios_activos,
        (SELECT COUNT(*) FROM auditorias WHERE periodo = ?) as auditorias_creadas,
        (SELECT COUNT(*) FROM secciones_tecnicas WHERE estado = 'activa') as secciones_tecnicas
    `, {
      replacements: [periodoActivo.codigo]
    });

    console.log(JSON.stringify(resumen[0], null, 2));
    console.log('============================================\n');

    console.log('🎯 Ahora puedes:');
    console.log('   1. Iniciar sesión con usuario proveedor (proveedor@activo.com / proveedor123)');
    console.log('   2. Ir a http://localhost:3010/auditorias');
    console.log('   3. Ver las auditorías asignadas y trabajar en ellas\n');

    console.log('✅ PROCESO COMPLETADO EXITOSAMENTE\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
testAndFixDatabase();
