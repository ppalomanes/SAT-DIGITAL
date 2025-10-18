/**
 * Script para ACTUALIZAR tenant_id sin eliminar datos existentes
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

async function updateTenantsOnly() {
  let pool;

  try {
    console.log('🔧 ACTUALIZACIÓN DE TENANT_ID (sin eliminar datos)\n');
    console.log('=' .repeat(60) + '\n');

    pool = await sql.connect(config);

    // ESTRATEGIA: Actualizar tenant_id basado en CUIT y nombres de sitios

    console.log('1️⃣ Actualizando proveedores según CUIT...\n');

    const proveedorUpdates = [
      { cuit: '30-71044895-3', tenant_id: 1, nombre: 'GRUPO ACTIVO' },
      { cuit: '30-70827680-0', tenant_id: 2, nombre: 'APEX' },
      { cuit: '30-70949292-2', tenant_id: 3, nombre: 'CAT TECHNOLOGIES' },
      { cuit: '30-698477411', tenant_id: 4, nombre: 'KONECTA (Stratton)' },
      { cuit: '30-70908678-9', tenant_id: 5, nombre: 'TELEPERFORMANCE' }
    ];

    for (const p of proveedorUpdates) {
      await pool.request().query(`
        UPDATE proveedores
        SET tenant_id = ${p.tenant_id}
        WHERE cuit = '${p.cuit}';
      `);
      console.log(`✅ ${p.nombre} → tenant_id = ${p.tenant_id}`);
    }

    console.log('\n2️⃣ Actualizando sitios según proveedor...\n');

    // Sitios: Heredan tenant_id de su proveedor
    await pool.request().query(`
      UPDATE sitios
      SET tenant_id = (
        SELECT p.tenant_id
        FROM proveedores p
        WHERE p.id = sitios.proveedor_id
      )
      WHERE proveedor_id IS NOT NULL;
    `);
    console.log('✅ Sitios actualizados según su proveedor');

    // Corregir sitios específicos que pueden estar mal asignados
    const sitioUpdates = [
      // APEX sitios
      { nombre: 'APEX CBA%', tenant_id: 2 },
      { nombre: 'APEX RES%', tenant_id: 2 },
      // CAT sitios
      { nombre: 'CAT-TECHNOLOGIES%', tenant_id: 3 },
      { nombre: 'CAT TECHNOLOGIES%', tenant_id: 3 },
      // KONECTA sitios
      { nombre: 'KONECTA%', tenant_id: 4 },
      // TELEPERFORMANCE sitios
      { nombre: 'TELEPERFORMANCE%', tenant_id: 5 }
    ];

    for (const s of sitioUpdates) {
      await pool.request().query(`
        UPDATE sitios
        SET tenant_id = ${s.tenant_id}
        WHERE nombre LIKE N'${s.nombre}';
      `);
    }
    console.log('✅ Sitios corregidos por nombre\n');

    console.log('3️⃣ Actualizando usuarios...\n');

    // Usuarios de proveedores: heredan tenant_id del proveedor
    await pool.request().query(`
      UPDATE usuarios
      SET tenant_id = (
        SELECT p.tenant_id
        FROM proveedores p
        WHERE p.id = usuarios.proveedor_id
      )
      WHERE proveedor_id IS NOT NULL;
    `);
    console.log('✅ Usuarios de proveedores actualizados');

    // Usuarios admin/auditores: tenant_id = 1
    await pool.request().query(`
      UPDATE usuarios
      SET tenant_id = 1
      WHERE proveedor_id IS NULL;
    `);
    console.log('✅ Usuarios admin/auditores → tenant_id = 1\n');

    console.log('4️⃣ Verificando estructura final...\n');

    const resumen = await pool.request().query(`
      SELECT
        t.id as tenant_id,
        t.nombre as tenant,
        COUNT(DISTINCT p.id) as proveedores,
        COUNT(DISTINCT s.id) as sitios,
        COUNT(DISTINCT u.id) as usuarios
      FROM tenants t
      LEFT JOIN proveedores p ON p.tenant_id = t.id
      LEFT JOIN sitios s ON s.tenant_id = t.id
      LEFT JOIN usuarios u ON u.tenant_id = t.id
      GROUP BY t.id, t.nombre
      ORDER BY t.id;
    `);

    console.log('📊 RESUMEN POR TENANT:\n');
    console.table(resumen.recordset);

    // Detalle de cada tenant
    for (let i = 1; i <= 5; i++) {
      const detalle = await pool.request().query(`
        SELECT
          p.razon_social as proveedor,
          COUNT(s.id) as sitios
        FROM proveedores p
        LEFT JOIN sitios s ON s.proveedor_id = p.id
        WHERE p.tenant_id = ${i}
        GROUP BY p.razon_social;
      `);

      if (detalle.recordset.length > 0) {
        console.log(`\nTenant ${i}:`);
        detalle.recordset.forEach(d => {
          console.log(`  - ${d.proveedor}: ${d.sitios} sitios`);
        });
      }
    }

    console.log('\n\n✅ ¡Actualización completada!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

updateTenantsOnly()
  .then(() => {
    console.log('✅ Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script falló:', error.message);
    process.exit(1);
  });
