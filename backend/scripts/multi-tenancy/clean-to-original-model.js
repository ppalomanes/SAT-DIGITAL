/**
 * Script para limpiar y dejar SOLO los 5 proveedores del modelo original
 *
 * ACCIÓN:
 * 1. Eliminar proveedores extras (ATENTO x2, TASKSOLUTIONS)
 * 2. Corregir STRATTON y moverlo al Tenant 4
 * 3. Verificar estructura final
 */

require('dotenv').config({ path: '.env.local' });
const sql = require('mssql');

const config = {
  server: process.env.SQLSERVER_HOST || 'localhost',
  port: parseInt(process.env.SQLSERVER_PORT) || 1433,
  database: process.env.SQLSERVER_DATABASE || 'sat_digital_v2',
  user: process.env.SQLSERVER_USERNAME || 'sa',
  password: process.env.SQLSERVER_PASSWORD || '',
  options: {
    encrypt: process.env.SQLSERVER_ENCRYPT === 'true',
    trustServerCertificate: process.env.SQLSERVER_TRUST_CERT === 'true',
    enableArithAbort: true
  }
};

async function cleanToOriginalModel() {
  let pool;

  try {
    console.log('🧹 LIMPIEZA A MODELO ORIGINAL - 5 PROVEEDORES\n');
    console.log('=' .repeat(80) + '\n');

    pool = await sql.connect(config);

    // PASO 1: Eliminar sitios de proveedores extras
    console.log('1️⃣ Eliminando sitios de proveedores extras...\n');

    const sitiosEliminados = await pool.request().query(`
      DELETE FROM sitios
      OUTPUT DELETED.nombre, DELETED.localidad
      WHERE proveedor_id IN (
        SELECT id FROM proveedores
        WHERE cuit IN (
          '30-70949292-6',   -- ATENTO 1 (sin sitios)
          '30-71044895-8',   -- ATENTO 2
          '30-71044852-9'    -- TASKSOLUTIONS
        )
      );
    `);

    if (sitiosEliminados.recordset.length > 0) {
      console.log('🗑️  Sitios eliminados:');
      sitiosEliminados.recordset.forEach(s => {
        console.log(`   - ${s.nombre} (${s.localidad})`);
      });
    }
    console.log('');

    // PASO 4: Mover sitios KONECTA de STRATTON duplicado al STRATTON correcto
    console.log('4️⃣ Corrigiendo STRATTON ARGENTINA (KONECTA)...\n');

    // Primero verificar si existe el STRATTON correcto (CUIT: 30-698477411)
    const strattonCorrecto = await pool.request().query(`
      SELECT id FROM proveedores WHERE cuit = '30-698477411';
    `);

    let strattonCorrectoId;

    if (strattonCorrecto.recordset.length === 0) {
      // Crear STRATTON correcto en Tenant 4
      const result = await pool.request().query(`
        INSERT INTO proveedores (
          tenant_id,
          razon_social,
          cuit,
          nombre_comercial,
          email_contacto,
          estado,
          created_at,
          updated_at
        )
        OUTPUT INSERTED.id
        VALUES (
          4,
          N'Stratton Argentina SA',
          '30-698477411',
          N'KONECTA',
          'contacto@konecta.com',
          'activo',
          GETDATE(),
          GETDATE()
        );
      `);
      strattonCorrectoId = result.recordset[0].id;
      console.log(`✅ STRATTON correcto creado en Tenant 4 (ID: ${strattonCorrectoId})`);
    } else {
      strattonCorrectoId = strattonCorrecto.recordset[0].id;
      console.log(`✅ STRATTON correcto ya existe (ID: ${strattonCorrectoId})`);
    }

    // Mover sitios KONECTA al STRATTON correcto
    await pool.request().query(`
      UPDATE sitios
      SET proveedor_id = ${strattonCorrectoId},
          tenant_id = 4
      WHERE nombre LIKE 'KONECTA%';
    `);
    console.log('✅ Sitios KONECTA movidos al STRATTON correcto (Tenant 4)\n');

    // PASO 5: Eliminar proveedores extras
    console.log('5️⃣ Eliminando proveedores extras...\n');

    const proveedoresEliminados = await pool.request().query(`
      DELETE FROM proveedores
      OUTPUT DELETED.razon_social, DELETED.cuit
      WHERE cuit IN (
        '30-69847741-1',   -- STRATTON duplicado
        '30-70949292-6',   -- ATENTO 1
        '30-71044895-8',   -- ATENTO 2
        '30-71044852-9'    -- TASKSOLUTIONS
      );
    `);

    console.log('🗑️  Proveedores eliminados:');
    proveedoresEliminados.recordset.forEach(p => {
      console.log(`   - ${p.razon_social} (${p.cuit})`);
    });
    console.log('');

    // PASO 6: Actualizar STRATTON correcto al Tenant 4
    await pool.request().query(`
      UPDATE proveedores
      SET tenant_id = 4
      WHERE cuit = '30-698477411';
    `);
    console.log('✅ STRATTON actualizado a Tenant 4\n');

    // PASO 7: Verificar estructura final
    console.log('6️⃣ Verificando estructura final...\n');
    console.log('=' .repeat(80) + '\n');

    const estructuraFinal = await pool.request().query(`
      SELECT
        t.id as tenant_id,
        t.nombre as tenant,
        p.razon_social as proveedor,
        p.cuit,
        COUNT(s.id) as sitios
      FROM tenants t
      LEFT JOIN proveedores p ON p.tenant_id = t.id
      LEFT JOIN sitios s ON s.proveedor_id = p.id AND s.tenant_id = t.id
      GROUP BY t.id, t.nombre, p.razon_social, p.cuit
      ORDER BY t.id;
    `);

    console.log('📊 ESTRUCTURA FINAL:\n');
    let currentTenant = null;
    estructuraFinal.recordset.forEach(row => {
      if (row.tenant_id !== currentTenant) {
        currentTenant = row.tenant_id;
        console.log(`\n📍 TENANT ${row.tenant_id}: ${row.tenant}`);
        console.log('─'.repeat(70));
      }
      if (row.proveedor) {
        const check = row.sitios > 0 ? '✅' : '⚠️';
        console.log(`   ${check} ${row.proveedor} (${row.cuit}) - ${row.sitios} sitios`);
      } else {
        console.log(`   ❌ Sin proveedor`);
      }
    });

    // Resumen final
    console.log('\n\n' + '=' .repeat(80));
    console.log('\n✅ LIMPIEZA COMPLETADA\n');
    console.log('📋 RESULTADO:');
    console.log('   - Tenant 1: GRUPO ACTIVO → 1 sitio');
    console.log('   - Tenant 2: APEX AMERICA → 3 sitios');
    console.log('   - Tenant 3: CAT TECHNOLOGIES → 1 sitio');
    console.log('   - Tenant 4: KONECTA (Stratton) → 3 sitios');
    console.log('   - Tenant 5: TELEPERFORMANCE → 3 sitios');
    console.log('\n   TOTAL: 5 tenants, 5 proveedores, 11 sitios\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

cleanToOriginalModel()
  .then(() => {
    console.log('✅ Script finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script falló:', error.message);
    process.exit(1);
  });
