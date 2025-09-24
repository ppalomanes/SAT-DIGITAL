/**
 * Script para corregir datos de proveedores según tabla correcta
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

// Forzar uso de SQL Server
process.env.DB_TYPE = 'sqlserver';
process.env.SQLSERVER_HOST = 'dwin0293';
process.env.SQLSERVER_PORT = '1433';
process.env.SQLSERVER_DATABASE = 'sat_digital_v2';
process.env.SQLSERVER_USERNAME = 'calidad';
process.env.SQLSERVER_PASSWORD = 'passcalidad';
process.env.SQLSERVER_ENCRYPT = 'false';
process.env.SQLSERVER_TRUST_CERT = 'true';

const { sequelize } = require('./src/shared/database/connection');

async function corregirProveedores() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a SQL Server');

    // Limpiar datos existentes - manejar foreign keys
    console.log('\n🧹 Limpiando datos existentes...');

    // Primero limpiar referencias de usuarios a proveedores
    await sequelize.query('UPDATE [usuarios] SET proveedor_id = NULL WHERE proveedor_id IS NOT NULL');

    // Luego eliminar auditorías, sitios y proveedores
    await sequelize.query('DELETE FROM [auditorias]');
    await sequelize.query('DELETE FROM [sitios]');
    await sequelize.query('DELETE FROM [proveedores]');

    // Resetear identity seeds
    await sequelize.query('DBCC CHECKIDENT(\'auditorias\', RESEED, 0)');
    await sequelize.query('DBCC CHECKIDENT(\'sitios\', RESEED, 0)');
    await sequelize.query('DBCC CHECKIDENT(\'proveedores\', RESEED, 0)');

    // Datos corregidos según la tabla proporcionada
    const proveedoresCorrectos = [
      {
        razon_social: 'GRUPO ACTIVO SRL',
        cuit: '30-71044895-3',
        domicilio: 'Florida 141 - CABA',
        nombre_comercial: 'ACTIVO'
      },
      {
        razon_social: 'CENTRO DE INTERACCION MULTIMEDIA S.A.',
        cuit: '30-70827680-0',
        domicilio: 'Entre Rios 11 - Córdoba',
        nombre_comercial: 'APEX'
      },
      {
        razon_social: 'CAT TECHNOLOGIES ARGENTINA S.A',
        cuit: '30-70949292-2',
        domicilio: 'Mitre 853 piso 1 - CABA',
        nombre_comercial: 'CAT TECHNOLOGIES'
      },
      {
        razon_social: 'STRATTON ARGENTINA SA',
        cuit: '30-69847741-1',
        domicilio: 'Rosario de Santa Fe 67 - Córdoba',
        nombre_comercial: 'KONECTA'
      },
      {
        razon_social: 'CITYTECH SOCIEDAD ANONIMA',
        cuit: '30-70908678-9',
        domicilio: 'Av. Bouchard 680 - CABA',
        nombre_comercial: 'TELEPERFORMANCE'
      }
    ];

    console.log('\n🏢 Creando proveedores corregidos...');
    for (const proveedor of proveedoresCorrectos) {
      await sequelize.query(`
        INSERT INTO [proveedores]
        ([razon_social], [cuit], [nombre_comercial], [contacto_principal], [email_contacto], [telefono], [estado])
        VALUES (:razon_social, :cuit, :nombre_comercial, 'Contacto Principal', 'contacto@email.com', '(011) 1234-5678', 'activo')
      `, {
        replacements: proveedor
      });
      console.log(`   ✅ ${proveedor.nombre_comercial} - ${proveedor.razon_social}`);
    }

    // Sitios corregidos según la tabla
    const sitiosCorrectos = [
      // GRUPO ACTIVO SRL (ID: 1)
      {
        proveedor_id: 1,
        nombre: 'ACTIVO',
        localidad: 'CABA',
        domicilio: 'Florida 141-CABA'
      },

      // CENTRO DE INTERACCION MULTIMEDIA S.A. (ID: 2)
      {
        proveedor_id: 2,
        nombre: 'APEX CBA (Edf. Sgra. Familia)',
        localidad: 'CORDOBA',
        domicilio: 'Avenida Colon 210 6° Piso'
      },
      {
        proveedor_id: 2,
        nombre: 'APEX RES (Edf. Mitre)',
        localidad: 'CHACO',
        domicilio: 'Mitre 1754 - Resistencia'
      },
      {
        proveedor_id: 2,
        nombre: 'APEX RES (Edf. A y Blanco)',
        localidad: 'CHACO',
        domicilio: 'Arbo y Blanco 236 -Resistencia'
      },

      // CAT TECHNOLOGIES ARGENTINA S.A (ID: 3)
      {
        proveedor_id: 3,
        nombre: 'CAT TECHNOLOGIES',
        localidad: 'CABA',
        domicilio: 'Mitre 853 piso 1 - CABA'
      },

      // STRATTON ARGENTINA SA (ID: 4)
      {
        proveedor_id: 4,
        nombre: 'KONECTA CBA',
        localidad: 'CORDOBA',
        domicilio: 'Rosario de Santa Fe 67 - Córdoba'
      },
      {
        proveedor_id: 4,
        nombre: 'KONECTA RES',
        localidad: 'CHACO',
        domicilio: 'Monteagudo 55 - Resistencia'
      },
      {
        proveedor_id: 4,
        nombre: 'KONECTA ROS',
        localidad: 'ROSARIO',
        domicilio: 'Av. Corrientes 2265 E/P Rosario'
      },

      // CITYTECH SOCIEDAD ANONIMA (ID: 5)
      {
        proveedor_id: 5,
        nombre: 'TELEPERFORMANCE TUC 1',
        localidad: 'TUCUMAN',
        domicilio: 'Adolfo de la Vega 345 -San Miguel de Tucumán'
      },
      {
        proveedor_id: 5,
        nombre: 'TELEPERFORMANCE TUC 3',
        localidad: 'TUCUMAN',
        domicilio: 'Adolfo de la Vega 400 -San Miguel de Tucumán'
      },
      {
        proveedor_id: 5,
        nombre: 'TELEPERFORMANCE RES',
        localidad: 'CHACO',
        domicilio: 'Av. 9 de Julio 4175, Barranqueras'
      }
    ];

    console.log('\n🏢 Creando sitios corregidos...');
    for (const sitio of sitiosCorrectos) {
      await sequelize.query(`
        INSERT INTO [sitios]
        ([proveedor_id], [nombre], [localidad], [domicilio], [estado])
        VALUES (:proveedor_id, :nombre, :localidad, :domicilio, 'activo')
      `, {
        replacements: sitio
      });
      console.log(`   ✅ ${sitio.nombre} - ${sitio.localidad}`);
    }

    // Crear algunas auditorías de ejemplo
    console.log('\n📋 Creando auditorías de ejemplo...');
    const [sitiosCreados] = await sequelize.query('SELECT id, nombre FROM [sitios] ORDER BY id');

    // Crear auditorías para los primeros 5 sitios
    for (let i = 0; i < Math.min(5, sitiosCreados.length); i++) {
      const sitio = sitiosCreados[i];
      await sequelize.query(`
        INSERT INTO [auditorias]
        ([sitio_id], [periodo], [fecha_inicio], [fecha_limite_carga], [auditor_asignado_id], [estado])
        VALUES (:sitio_id, '2025-11', '2025-11-01', '2025-11-15', 2, 'programada')
      `, {
        replacements: { sitio_id: sitio.id }
      });
      console.log(`   📋 Auditoría para ${sitio.nombre}`);
    }

    // Verificar resultado final
    console.log('\n📊 Resumen final:');
    const [proveedoresCount] = await sequelize.query('SELECT COUNT(*) as count FROM [proveedores]');
    const [sitiosCount] = await sequelize.query('SELECT COUNT(*) as count FROM [sitios]');
    const [auditoriasCount] = await sequelize.query('SELECT COUNT(*) as count FROM [auditorias]');

    console.log(`   👥 Proveedores: ${proveedoresCount[0].count}`);
    console.log(`   🏢 Sitios: ${sitiosCount[0].count}`);
    console.log(`   📋 Auditorías: ${auditoriasCount[0].count}`);

    // Reasignar usuarios a proveedores corregidos
    console.log('\n👤 Reasignando usuarios a proveedores...');
    await sequelize.query(`
      UPDATE [usuarios] SET proveedor_id = 1
      WHERE email IN ('proveedor@activo.com', 'tecnico@activo.com')
    `);
    console.log('   ✅ Usuarios de ACTIVO reasignados');

    await sequelize.query(`
      UPDATE [usuarios] SET proveedor_id = 2
      WHERE email LIKE '%@apex.com'
    `);
    console.log('   ✅ Usuarios de APEX reasignados');

    await sequelize.query(`
      UPDATE [usuarios] SET proveedor_id = 3
      WHERE email LIKE '%@cat.com'
    `);
    console.log('   ✅ Usuarios de CAT TECHNOLOGIES reasignados');

    await sequelize.query(`
      UPDATE [usuarios] SET proveedor_id = 4
      WHERE email LIKE '%@konecta.com'
    `);
    console.log('   ✅ Usuarios de KONECTA reasignados');

    await sequelize.query(`
      UPDATE [usuarios] SET proveedor_id = 5
      WHERE email LIKE '%@teleperformance.com'
    `);
    console.log('   ✅ Usuarios de TELEPERFORMANCE reasignados');

    // Mostrar distribución corregida
    console.log('\n📈 Distribución corregida por proveedor:');
    const [distribucion] = await sequelize.query(`
      SELECT
        p.razon_social,
        p.cuit,
        p.nombre_comercial,
        COUNT(s.id) as total_sitios
      FROM [proveedores] p
      LEFT JOIN [sitios] s ON p.id = s.proveedor_id
      GROUP BY p.id, p.razon_social, p.cuit, p.nombre_comercial
      ORDER BY p.id
    `);

    // Obtener sitios por cada proveedor por separado
    const [allSitios] = await sequelize.query(`
      SELECT
        s.proveedor_id,
        s.nombre
      FROM [sitios] s
      ORDER BY s.proveedor_id, s.nombre
    `);

    distribucion.forEach(item => {
      console.log(`\n   🏢 ${item.nombre_comercial}`);
      console.log(`      📋 ${item.razon_social}`);
      console.log(`      🔢 CUIT: ${item.cuit}`);
      console.log(`      📊 ${item.total_sitios} sitios`);

      // Filtrar sitios de este proveedor
      const sitiosProveedor = allSitios.filter(s => s.proveedor_id === distribucion.indexOf(item) + 1);
      if (sitiosProveedor.length > 0) {
        const nombresSitios = sitiosProveedor.map(s => s.nombre).join(', ');
        console.log(`      🏠 Sitios: ${nombresSitios}`);
      }
    });

    console.log('\n🎉 Datos corregidos exitosamente según tabla proporcionada!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

corregirProveedores();