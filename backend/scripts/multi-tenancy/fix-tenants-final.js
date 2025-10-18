/**
 * Script DEFINITIVO para corregir estructura Multi-Tenancy
 *
 * Modelo correcto:
 * - Tenant 1: GRUPO ACTIVO SRL → 1 sitio
 * - Tenant 2: APEX AMERICA → 3 sitios
 * - Tenant 3: CAT TECHNOLOGIES → 1 sitio
 * - Tenant 4: KONECTA → 3 sitios
 * - Tenant 5: TELEPERFORMANCE → 3 sitios
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

// Estructura correcta según modelo de negocio
const ESTRUCTURA_CORRECTA = {
  proveedores: [
    {
      tenant_id: 1,
      razon_social: 'GRUPO ACTIVO SRL',
      cuit: '30-71044895-3',
      nombre_comercial: 'ACTIVO',
      sitios: [
        { nombre: 'ACTIVO', localidad: 'CABA', domicilio: 'Florida 141-CABA' }
      ]
    },
    {
      tenant_id: 2,
      razon_social: 'Centro de Interacción Multimedia S.A.',
      cuit: '30-70827680-0',
      nombre_comercial: 'APEX AMERICA',
      sitios: [
        { nombre: 'APEX CBA (Edf. Correo)', localidad: 'CORDOBA', domicilio: 'Avenida Colon 210 6° Piso' },
        { nombre: 'APEX RES (Edf. Mitre)', localidad: 'CHACO', domicilio: 'Mitre 1754 - Resistencia' },
        { nombre: 'APEX RES (Edf. A y Blanco)', localidad: 'CHACO', domicilio: 'Arbo y Blanco 236 -Resistencia' }
      ]
    },
    {
      tenant_id: 3,
      razon_social: 'CAT TECHNOLOGIES ARGENTINA S.A',
      cuit: '30-70949292-2',
      nombre_comercial: 'CAT TECHNOLOGIES',
      sitios: [
        { nombre: 'CAT-TECHNOLOGIES', localidad: 'CABA', domicilio: 'Mitre 853 piso 1 - CABA' }
      ]
    },
    {
      tenant_id: 4,
      razon_social: 'Stratton Argentina SA',
      cuit: '30-698477411',
      nombre_comercial: 'KONECTA',
      sitios: [
        { nombre: 'KONECTA CBA', localidad: 'CORDOBA', domicilio: 'Rosario de Santa Fe 877 - Córdoba' },
        { nombre: 'KONECTA RES', localidad: 'CHACO', domicilio: 'Monteagudo 55 - Resistencia' },
        { nombre: 'KONECTA ROS', localidad: 'ROSARIO', domicilio: 'Av. Corrientes 2265 EP Rosario' }
      ]
    },
    {
      tenant_id: 5,
      razon_social: 'CITYTECH SOCIEDAD ANONIMA',
      cuit: '30-70908678-9',
      nombre_comercial: 'TELEPERFORMANCE',
      sitios: [
        { nombre: 'TELEPERFORMANCE RES', localidad: 'CHACO', domicilio: 'Av. 9 de Julio 4175, Barranqueras' },
        { nombre: 'TELEPERFORMANCE TUC 1', localidad: 'TUCUMAN', domicilio: 'Adolfo de la Vega 345 -San Miguel de Tucumán' },
        { nombre: 'TELEPERFORMANCE TUC 3', localidad: 'TUCUMAN', domicilio: 'Adolfo de la Vega 400 -San Miguel de Tucumán' }
      ]
    }
  ]
};

async function fixTenantsStructure() {
  let pool;

  try {
    console.log('🔧 CORRECCIÓN FINAL DE ESTRUCTURA MULTI-TENANCY\n');
    console.log('=' .repeat(60) + '\n');

    pool = await sql.connect(config);

    // PASO 1: ELIMINAR TODOS LOS SITIOS Y PROVEEDORES EXISTENTES
    console.log('1️⃣ Limpiando sitios y proveedores existentes...\n');

    await pool.request().query(`DELETE FROM sitios;`);
    console.log('✅ Sitios eliminados');

    await pool.request().query(`DELETE FROM proveedores;`);
    console.log('✅ Proveedores eliminados\n');

    // PASO 2: CREAR PROVEEDORES Y SITIOS CORRECTOS
    console.log('2️⃣ Creando estructura correcta...\n');

    for (const proveedorData of ESTRUCTURA_CORRECTA.proveedores) {
      // Insertar proveedor
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
          ${proveedorData.tenant_id},
          N'${proveedorData.razon_social}',
          '${proveedorData.cuit}',
          N'${proveedorData.nombre_comercial}',
          'contacto@${proveedorData.nombre_comercial.toLowerCase().replace(/\s+/g, '')}.com',
          'activo',
          GETDATE(),
          GETDATE()
        );
      `);

      const proveedorId = result.recordset[0].id;
      console.log(`✅ Proveedor creado: ${proveedorData.razon_social} (Tenant ${proveedorData.tenant_id}, ID: ${proveedorId})`);

      // Insertar sitios del proveedor
      for (const sitioData of proveedorData.sitios) {
        await pool.request().query(`
          INSERT INTO sitios (
            tenant_id,
            proveedor_id,
            nombre,
            localidad,
            domicilio,
            estado,
            created_at,
            updated_at
          )
          VALUES (
            ${proveedorData.tenant_id},
            ${proveedorId},
            N'${sitioData.nombre}',
            N'${sitioData.localidad}',
            N'${sitioData.domicilio}',
            'activo',
            GETDATE(),
            GETDATE()
          );
        `);
        console.log(`   → Sitio: ${sitioData.nombre} (${sitioData.localidad})`);
      }
      console.log('');
    }

    // PASO 3: ACTUALIZAR USUARIOS CON TENANT_ID CORRECTO
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
    console.log('✅ Usuarios de proveedores actualizados según su proveedor');

    // Usuarios admin/auditores (sin proveedor): tenant_id NULL o valor especial
    // Para propósitos de testing, los asignamos al tenant 1
    await pool.request().query(`
      UPDATE usuarios
      SET tenant_id = 1
      WHERE proveedor_id IS NULL;
    `);
    console.log('✅ Usuarios admin/auditores asignados a tenant_id = 1 (temporal)\n');

    // PASO 4: VERIFICAR ESTRUCTURA FINAL
    console.log('4️⃣ Verificando estructura final...\n');

    const resumen = await pool.request().query(`
      SELECT
        t.id as tenant_id,
        t.nombre as tenant,
        p.razon_social as proveedor,
        COUNT(s.id) as sitios
      FROM tenants t
      LEFT JOIN proveedores p ON p.tenant_id = t.id
      LEFT JOIN sitios s ON s.tenant_id = t.id AND s.proveedor_id = p.id
      GROUP BY t.id, t.nombre, p.razon_social
      ORDER BY t.id;
    `);

    console.log('📊 ESTRUCTURA FINAL:\n');
    console.table(resumen.recordset);

    // Verificación por tenant
    for (let i = 1; i <= 5; i++) {
      const verificacion = await pool.request().query(`
        SELECT
          t.nombre as tenant,
          p.razon_social as proveedor,
          COUNT(s.id) as cant_sitios
        FROM tenants t
        LEFT JOIN proveedores p ON p.tenant_id = t.id
        LEFT JOIN sitios s ON s.tenant_id = t.id AND s.proveedor_id = p.id
        WHERE t.id = ${i}
        GROUP BY t.nombre, p.razon_social;
      `);

      const result = verificacion.recordset[0];
      if (result) {
        const esperado = ESTRUCTURA_CORRECTA.proveedores.find(p => p.tenant_id === i).sitios.length;
        const actual = result.cant_sitios;
        const status = actual === esperado ? '✅' : '❌';
        console.log(`${status} Tenant ${i}: ${result.cant_sitios} sitios (esperado: ${esperado})`);
      }
    }

    console.log('\n✅ ¡Estructura corregida exitosamente!\n');
    console.log('📋 MODELO APLICADO:');
    console.log('   - Tenant 1: GRUPO ACTIVO → 1 sitio');
    console.log('   - Tenant 2: APEX AMERICA → 3 sitios');
    console.log('   - Tenant 3: CAT TECHNOLOGIES → 1 sitio');
    console.log('   - Tenant 4: KONECTA → 3 sitios');
    console.log('   - Tenant 5: TELEPERFORMANCE → 3 sitios\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

fixTenantsStructure()
  .then(() => {
    console.log('✅ Script finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script falló:', error);
    process.exit(1);
  });
