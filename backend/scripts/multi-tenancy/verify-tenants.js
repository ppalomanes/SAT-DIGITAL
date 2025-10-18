/**
 * Script para verificar estructura Multi-Tenancy
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

async function verifyTenants() {
  let pool;

  try {
    pool = await sql.connect(config);

    console.log('📊 VERIFICACIÓN ESTRUCTURA MULTI-TENANCY\n');
    console.log('=' .repeat(60) + '\n');

    // 1. Tenants
    const tenants = await pool.request().query(`
      SELECT * FROM tenants ORDER BY id;
    `);

    console.log('1️⃣ TENANTS:\n');
    tenants.recordset.forEach(t => {
      console.log(`   ID ${t.id}: ${t.nombre}`);
      console.log(`   Slug: ${t.slug}`);
      console.log(`   Dominio: ${t.dominio || 'N/A'}`);
      console.log(`   Activo: ${t.activo ? '✅' : '❌'}\n`);
    });

    // 2. Proveedores
    const proveedores = await pool.request().query(`
      SELECT
        id,
        tenant_id,
        razon_social,
        cuit,
        nombre_comercial
      FROM proveedores
      ORDER BY tenant_id, id;
    `);

    console.log('2️⃣ PROVEEDORES POR TENANT:\n');
    proveedores.recordset.forEach(p => {
      console.log(`   Tenant ${p.tenant_id} - ${p.razon_social} (${p.cuit})`);
    });

    // 3. Sitios
    const sitios = await pool.request().query(`
      SELECT
        s.id,
        s.tenant_id,
        s.nombre,
        s.localidad,
        p.razon_social as proveedor
      FROM sitios s
      LEFT JOIN proveedores p ON p.id = s.proveedor_id
      ORDER BY s.tenant_id, s.id;
    `);

    console.log('\n3️⃣ SITIOS POR TENANT:\n');
    let currentTenant = null;
    sitios.recordset.forEach(s => {
      if (s.tenant_id !== currentTenant) {
        currentTenant = s.tenant_id;
        console.log(`\n   📍 Tenant ${s.tenant_id} (${s.proveedor}):`);
      }
      console.log(`      - ${s.nombre} (${s.localidad})`);
    });

    // 4. Resumen
    const resumen = await pool.request().query(`
      SELECT
        t.id as tenant_id,
        t.nombre as tenant_nombre,
        COUNT(DISTINCT p.id) as cant_proveedores,
        COUNT(DISTINCT s.id) as cant_sitios
      FROM tenants t
      LEFT JOIN proveedores p ON p.tenant_id = t.id
      LEFT JOIN sitios s ON s.tenant_id = t.id
      GROUP BY t.id, t.nombre
      ORDER BY t.id;
    `);

    console.log('\n\n4️⃣ RESUMEN POR TENANT:\n');
    console.table(resumen.recordset);

    console.log('\n✅ Verificación completada\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

verifyTenants().then(() => process.exit(0)).catch(() => process.exit(1));
