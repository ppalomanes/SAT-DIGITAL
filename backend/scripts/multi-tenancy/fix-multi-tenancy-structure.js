/**
 * Script para corregir la estructura Multi-Tenancy
 *
 * Modelo correcto:
 * - Telecom Argentina: Dueño de la herramienta (NO es tenant)
 * - Proveedores: Son los clientes/tenants (5 empresas tercerizadas)
 * - Sitios: Pertenecen al tenant de su proveedor
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

async function fixMultiTenancyStructure() {
  let pool;

  try {
    console.log('🔧 Iniciando corrección de estructura multi-tenancy...\n');

    pool = await sql.connect(config);

    // 1. CREAR 5 TENANTS CORRECTOS (UNO POR PROVEEDOR)
    // Nota: No eliminamos el tenant 1, lo reutilizamos para GRUPO ACTIVO
    console.log('2️⃣ Creando 5 tenants correctos (proveedores como clientes)...\n');

    const tenants = [
      {
        id: 1,
        nombre: 'Grupo Activo SRL',
        slug: 'grupo-activo',
        cuit: '30-71044895-3',
        dominio: 'activo.satdigital.com'
      },
      {
        id: 2,
        nombre: 'Apex America',
        slug: 'apex-america',
        cuit: '30-70827680-0',
        dominio: 'apex.satdigital.com'
      },
      {
        id: 3,
        nombre: 'CAT Technologies',
        slug: 'cat-technologies',
        cuit: '30-70949292-2',
        dominio: 'cat.satdigital.com'
      },
      {
        id: 4,
        nombre: 'Konecta',
        slug: 'konecta',
        cuit: '30-698477411',
        dominio: 'konecta.satdigital.com'
      },
      {
        id: 5,
        nombre: 'Teleperformance',
        slug: 'teleperformance',
        cuit: '30-70908678-9',
        dominio: 'teleperformance.satdigital.com'
      }
    ];

    for (const tenant of tenants) {
      // Actualizar o insertar tenant
      const existingTenant = await pool.request().query(`
        SELECT id FROM tenants WHERE id = ${tenant.id};
      `);

      if (existingTenant.recordset.length > 0) {
        // Actualizar tenant existente
        await pool.request().query(`
          UPDATE tenants
          SET nombre = N'${tenant.nombre}',
              slug = '${tenant.slug}',
              dominio = '${tenant.dominio}',
              activo = 1,
              updated_at = GETDATE()
          WHERE id = ${tenant.id};
        `);
        console.log(`✅ Tenant ${tenant.id}: ${tenant.nombre} (${tenant.cuit}) - ACTUALIZADO`);
      } else {
        // Insertar nuevo tenant con IDENTITY_INSERT
        await pool.request().query(`
          SET IDENTITY_INSERT tenants ON;

          INSERT INTO tenants (id, nombre, slug, dominio, activo, created_at, updated_at)
          VALUES (
            ${tenant.id},
            N'${tenant.nombre}',
            '${tenant.slug}',
            '${tenant.dominio}',
            1,
            GETDATE(),
            GETDATE()
          );

          SET IDENTITY_INSERT tenants OFF;
        `);
        console.log(`✅ Tenant ${tenant.id}: ${tenant.nombre} (${tenant.cuit}) - CREADO`);
      }
    }

    console.log('\n3️⃣ Actualizando proveedores con tenant_id correcto...\n');

    // Mapeo: CUIT -> tenant_id
    const proveedorTenantMap = {
      '30-71044895-3': 1,  // GRUPO ACTIVO
      '30-70827680-0': 2,  // APEX
      '30-70949292-2': 3,  // CAT TECHNOLOGIES
      '30-698477411': 4,   // KONECTA
      '30-70908678-9': 5   // TELEPERFORMANCE
    };

    for (const [cuit, tenantId] of Object.entries(proveedorTenantMap)) {
      await pool.request().query(`
        UPDATE proveedores
        SET tenant_id = ${tenantId}
        WHERE cuit = '${cuit}';
      `);
      console.log(`✅ Proveedor ${cuit} → tenant_id = ${tenantId}`);
    }

    console.log('\n4️⃣ Actualizando sitios con tenant_id según su proveedor...\n');

    // Mapeo específico de sitios (algunos tienen nombres ambiguos)
    const sitiosTenantMap = [
      // Tenant 1: GRUPO ACTIVO (1 sitio)
      { nombre: 'ACTIVO', tenant_id: 1 },

      // Tenant 2: APEX AMERICA (3 sitios)
      { nombre: 'APEX CBA (Edf. Correo)', tenant_id: 2 },
      { nombre: 'APEX RES (Edf. Mitre)', tenant_id: 2 },
      { nombre: 'APEX RES (Edf. A y Blanco)', tenant_id: 2 },

      // Tenant 3: CAT TECHNOLOGIES (1 sitio)
      { nombre: 'CAT-TECHNOLOGIES', tenant_id: 3 },

      // Tenant 4: KONECTA (3 sitios)
      { nombre: 'KONECTA CBA', tenant_id: 4 },
      { nombre: 'KONECTA RES', tenant_id: 4 },
      { nombre: 'KONECTA ROS', tenant_id: 4 },

      // Tenant 5: TELEPERFORMANCE (3 sitios)
      { nombre: 'TELEPERFORMANCE RES', tenant_id: 5 },
      { nombre: 'TELEPERFORMANCE TUC 1', tenant_id: 5 },
      { nombre: 'TELEPERFORMANCE TUC 3', tenant_id: 5 }
    ];

    for (const sitio of sitiosTenantMap) {
      await pool.request().query(`
        UPDATE sitios
        SET tenant_id = ${sitio.tenant_id}
        WHERE nombre LIKE N'${sitio.nombre}%';
      `);
      console.log(`✅ Sitio "${sitio.nombre}" → tenant_id = ${sitio.tenant_id}`);
    }

    console.log('\n5️⃣ Actualizando usuarios con tenant_id según su proveedor...\n');

    // Usuarios admin/auditores → Sin tenant específico (pueden ver todos)
    // Usuarios de proveedor → tenant_id según su proveedor_id

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

    // Usuarios admin/auditores sin proveedor → Asignar tenant_id = 1 temporal
    await pool.request().query(`
      UPDATE usuarios
      SET tenant_id = 1
      WHERE proveedor_id IS NULL;
    `);
    console.log('✅ Usuarios admin/auditores asignados a tenant_id = 1\n');

    console.log('6️⃣ Actualizando demás tablas con tenant_id...\n');

    // Auditorías: Heredan tenant_id del proveedor
    await pool.request().query(`
      UPDATE auditorias
      SET tenant_id = (
        SELECT p.tenant_id
        FROM proveedores p
        WHERE p.id = auditorias.proveedor_id
      )
      WHERE proveedor_id IS NOT NULL;
    `);
    console.log('✅ Auditorías actualizadas');

    // Documentos: Heredan tenant_id de la auditoría
    await pool.request().query(`
      UPDATE documentos
      SET tenant_id = (
        SELECT a.tenant_id
        FROM auditorias a
        WHERE a.id = documentos.auditoria_id
      )
      WHERE auditoria_id IS NOT NULL;
    `);
    console.log('✅ Documentos actualizados');

    // Conversaciones: Heredan tenant_id de la auditoría
    await pool.request().query(`
      UPDATE conversaciones
      SET tenant_id = (
        SELECT a.tenant_id
        FROM auditorias a
        WHERE a.id = conversaciones.auditoria_id
      )
      WHERE auditoria_id IS NOT NULL;
    `);
    console.log('✅ Conversaciones actualizadas');

    // Mensajes: Heredan tenant_id de la conversación
    await pool.request().query(`
      UPDATE mensajes
      SET tenant_id = (
        SELECT c.tenant_id
        FROM conversaciones c
        WHERE c.id = mensajes.conversacion_id
      )
      WHERE conversacion_id IS NOT NULL;
    `);
    console.log('✅ Mensajes actualizados');

    // Periodos de auditoría: tenant_id = 1 por defecto (períodos globales)
    await pool.request().query(`
      UPDATE periodos_auditoria
      SET tenant_id = 1
      WHERE tenant_id IS NULL OR tenant_id = 0;
    `);
    console.log('✅ Períodos de auditoría actualizados');

    // Bitácora: Mantener tenant_id existente o asignar según usuario
    await pool.request().query(`
      UPDATE bitacora
      SET tenant_id = (
        SELECT u.tenant_id
        FROM usuarios u
        WHERE u.id = bitacora.usuario_id
      )
      WHERE usuario_id IS NOT NULL AND (tenant_id IS NULL OR tenant_id = 0);
    `);
    console.log('✅ Bitácora actualizada');

    console.log('\n7️⃣ Verificando estructura final...\n');

    const verificacion = await pool.request().query(`
      SELECT
        t.id as tenant_id,
        t.nombre as tenant_nombre,
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

    console.log('📊 ESTRUCTURA FINAL:\n');
    console.table(verificacion.recordset);

    console.log('\n✅ ¡Estructura multi-tenancy corregida exitosamente!\n');
    console.log('🎯 Modelo aplicado:');
    console.log('   - Telecom: Dueño de la herramienta (NO tenant)');
    console.log('   - Proveedores: Clientes/Tenants (5 empresas)');
    console.log('   - Sitios: Asignados al tenant de su proveedor\n');

  } catch (error) {
    console.error('❌ Error corrigiendo estructura:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// Ejecutar script
fixMultiTenancyStructure()
  .then(() => {
    console.log('✅ Script finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script falló:', error);
    process.exit(1);
  });
