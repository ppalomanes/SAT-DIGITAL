/**
 * Script para mostrar estructura actual vs esperada
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

const ESTRUCTURA_ESPERADA = {
  1: { proveedor: 'GRUPO ACTIVO SRL', sitios: 1 },
  2: { proveedor: 'APEX AMERICA', sitios: 3 },
  3: { proveedor: 'CAT TECHNOLOGIES', sitios: 1 },
  4: { proveedor: 'KONECTA (Stratton)', sitios: 3 },
  5: { proveedor: 'TELEPERFORMANCE', sitios: 3 }
};

async function showStructure() {
  let pool;

  try {
    pool = await sql.connect(config);

    console.log('\n📊 ESTRUCTURA ACTUAL DE LA BASE DE DATOS\n');
    console.log('=' .repeat(80) + '\n');

    // Obtener estructura completa
    const estructura = await pool.request().query(`
      SELECT
        t.id as tenant_id,
        t.nombre as tenant_nombre,
        p.id as proveedor_id,
        p.razon_social as proveedor_nombre,
        p.cuit as proveedor_cuit,
        s.id as sitio_id,
        s.nombre as sitio_nombre,
        s.localidad as sitio_localidad
      FROM tenants t
      LEFT JOIN proveedores p ON p.tenant_id = t.id
      LEFT JOIN sitios s ON s.proveedor_id = p.id
      ORDER BY t.id, p.id, s.id;
    `);

    let currentTenant = null;
    let currentProveedor = null;

    console.log('🏢 ESTRUCTURA ACTUAL:\n');
    estructura.recordset.forEach(row => {
      if (row.tenant_id !== currentTenant) {
        currentTenant = row.tenant_id;
        console.log(`\n📍 TENANT ${row.tenant_id}: ${row.tenant_nombre}`);
        console.log('─'.repeat(70));
      }

      if (row.proveedor_id !== currentProveedor) {
        currentProveedor = row.proveedor_id;
        if (row.proveedor_nombre) {
          console.log(`\n   🏭 PROVEEDOR: ${row.proveedor_nombre}`);
          console.log(`      CUIT: ${row.proveedor_cuit}`);
          console.log(`      ID: ${row.proveedor_id}`);
        }
      }

      if (row.sitio_nombre) {
        console.log(`      └─ Sitio: ${row.sitio_nombre} (${row.sitio_localidad})`);
      }
    });

    console.log('\n\n' + '=' .repeat(80));
    console.log('\n📋 ESTRUCTURA ESPERADA (MODELO ORIGINAL):\n');
    console.log('=' .repeat(80) + '\n');

    console.log('📍 TENANT 1: Grupo Activo SRL');
    console.log('   🏭 GRUPO ACTIVO SRL (30-71044895-3)');
    console.log('      └─ Sitio: ACTIVO (CABA)\n');

    console.log('📍 TENANT 2: Apex America');
    console.log('   🏭 CENTRO DE INTERACCION MULTIMEDIA S.A. (30-70827680-0)');
    console.log('      └─ Sitio: APEX CBA (Edf. Correo) (CORDOBA)');
    console.log('      └─ Sitio: APEX RES (Edf. Mitre) (CHACO)');
    console.log('      └─ Sitio: APEX RES (Edf. A y Blanco) (CHACO)\n');

    console.log('📍 TENANT 3: CAT Technologies');
    console.log('   🏭 CAT TECHNOLOGIES ARGENTINA S.A (30-70949292-2)');
    console.log('      └─ Sitio: CAT-TECHNOLOGIES (CABA)\n');

    console.log('📍 TENANT 4: Konecta');
    console.log('   🏭 STRATTON ARGENTINA SA (30-698477411)');
    console.log('      └─ Sitio: KONECTA CBA (CORDOBA)');
    console.log('      └─ Sitio: KONECTA RES (CHACO)');
    console.log('      └─ Sitio: KONECTA ROS (ROSARIO)\n');

    console.log('📍 TENANT 5: Teleperformance');
    console.log('   🏭 CITYTECH SOCIEDAD ANONIMA (30-70908678-9)');
    console.log('      └─ Sitio: TELEPERFORMANCE RES (CHACO)');
    console.log('      └─ Sitio: TELEPERFORMANCE TUC 1 (TUCUMAN)');
    console.log('      └─ Sitio: TELEPERFORMANCE TUC 3 (TUCUMAN)\n');

    console.log('\n' + '=' .repeat(80));
    console.log('\n❓ DIFERENCIAS Y PROBLEMAS:\n');
    console.log('=' .repeat(80) + '\n');

    // Contar proveedores por tenant
    const count = await pool.request().query(`
      SELECT
        tenant_id,
        COUNT(DISTINCT id) as cant_proveedores
      FROM proveedores
      GROUP BY tenant_id
      ORDER BY tenant_id;
    `);

    count.recordset.forEach(row => {
      const esperado = ESTRUCTURA_ESPERADA[row.tenant_id];
      if (row.cant_proveedores > 1) {
        console.log(`❌ TENANT ${row.tenant_id}: Tiene ${row.cant_proveedores} proveedores (esperado: 1)`);
      } else if (row.cant_proveedores === 0) {
        console.log(`❌ TENANT ${row.tenant_id}: No tiene proveedores (esperado: 1)`);
      } else {
        console.log(`✅ TENANT ${row.tenant_id}: OK (1 proveedor)`);
      }
    });

    // Listar proveedores que NO deberían existir
    console.log('\n🗑️  PROVEEDORES QUE NO ESTÁN EN EL MODELO ORIGINAL:\n');

    const proveedoresExtra = await pool.request().query(`
      SELECT id, razon_social, cuit, tenant_id
      FROM proveedores
      WHERE cuit NOT IN (
        '30-71044895-3',
        '30-70827680-0',
        '30-70949292-2',
        '30-698477411',
        '30-70908678-9'
      );
    `);

    if (proveedoresExtra.recordset.length > 0) {
      proveedoresExtra.recordset.forEach(p => {
        console.log(`   - ${p.razon_social} (${p.cuit}) - Tenant ${p.tenant_id}`);
      });
    } else {
      console.log('   ✅ No hay proveedores extras');
    }

    console.log('\n' + '=' .repeat(80));
    console.log('\n💡 OPCIONES PARA CORREGIR:\n');
    console.log('=' .repeat(80) + '\n');

    console.log('OPCIÓN 1: MANTENER DATOS ACTUALES');
    console.log('  - Conserva todos los proveedores y sitios existentes');
    console.log('  - Solo ajusta tenant_id para que cada proveedor sea un tenant');
    console.log('  - Resultado: Más de 5 tenants (tantos como proveedores haya)\n');

    console.log('OPCIÓN 2: LIMPIAR Y USAR MODELO ORIGINAL');
    console.log('  - Elimina proveedores y sitios que no están en el modelo');
    console.log('  - Deja exactamente 5 tenants con 1 proveedor cada uno');
    console.log('  - Resultado: Estructura limpia según diseño original');
    console.log('  - ⚠️  RIESGO: Se perderán datos de proveedores extras si hay auditorías asociadas\n');

    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

showStructure().then(() => process.exit(0)).catch(() => process.exit(1));
