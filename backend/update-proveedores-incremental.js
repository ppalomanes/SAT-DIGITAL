/**
 * Script para actualizar proveedores y sitios de forma incremental
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const { sequelize } = require('./src/shared/database/connection');

async function updateIncremental() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a SQL Server');

    // Verificar proveedores existentes
    console.log('\n📊 Verificando proveedores existentes...');
    const [existingProveedores] = await sequelize.query('SELECT id, razon_social, nombre_comercial FROM [proveedores] ORDER BY id');

    console.log('Proveedores actuales:');
    existingProveedores.forEach(p => {
      console.log(`   ${p.id}. ${p.nombre_comercial} - ${p.razon_social}`);
    });

    // Actualizar proveedores existentes con información completa
    console.log('\n🔄 Actualizando información de proveedores...');

    const proveedoresUpdate = [
      {
        id: 1,
        razon_social: 'GRUPO ACTIVO SRL',
        cuit: '30-71044895-3',
        nombre_comercial: 'ACTIVO',
        domicilio: 'Florida 141 - CABA',
        contacto_principal: 'Luis Horosuck',
        email_contacto: 'luis.horosuck@activo.com',
        telefono: '11-1234-5678'
      },
      {
        id: 2,
        razon_social: 'CENTRO DE INTERACCION MULTIMEDIA S.A.',
        cuit: '30-70827680-0',
        nombre_comercial: 'APEX',
        domicilio: 'Entre Rios 11 - Córdoba',
        contacto_principal: 'Federico Borda',
        email_contacto: 'federico.borda@apex.com',
        telefono: '351-2345-6789'
      },
      {
        id: 3,
        razon_social: 'CAT TECHNOLOGIES ARGENTINA S.A',
        cuit: '30-70949292-2',
        nombre_comercial: 'CAT TECHNOLOGIES',
        domicilio: 'Mitre 853 piso 1 - CABA',
        contacto_principal: 'Paulo Desimone',
        email_contacto: 'paulo.desimone@cattech.com',
        telefono: '11-3456-7890'
      },
      {
        id: 4,
        razon_social: 'STRATTON ARGENTINA SA',
        cuit: '30-69847741-1',
        nombre_comercial: 'KONECTA',
        domicilio: 'Rosario de Santa Fe 67 - Córdoba',
        contacto_principal: 'Andres Frumento',
        email_contacto: 'andres.frumento@konecta.com',
        telefono: '351-4567-8901'
      },
      {
        id: 5,
        razon_social: 'CITYTECH SOCIEDAD ANONIMA',
        cuit: '30-70908678-9',
        nombre_comercial: 'TELEPERFORMANCE',
        domicilio: 'Av. Bouchard 680 - CABA',
        contacto_principal: 'Veronica Luna',
        email_contacto: 'veronica.luna@teleperformance.com',
        telefono: '11-5678-9012'
      }
    ];

    // Insertar proveedores faltantes
    for (const prov of proveedoresUpdate) {
      const existing = existingProveedores.find(e => e.id === prov.id);
      if (!existing) {
        await sequelize.query(`
          SET IDENTITY_INSERT [proveedores] ON;
          INSERT INTO [proveedores]
          ([id], [razon_social], [cuit], [nombre_comercial], [domicilio], [contacto_principal], [email_contacto], [telefono], [estado])
          VALUES (:id, :razon_social, :cuit, :nombre_comercial, :domicilio, :contacto_principal, :email_contacto, :telefono, 'activo');
          SET IDENTITY_INSERT [proveedores] OFF;
        `, {
          replacements: prov
        });
        console.log(`   ➕ Creado: ${prov.nombre_comercial}`);
      } else {
        await sequelize.query(`
          UPDATE [proveedores] SET
            razon_social = :razon_social,
            cuit = :cuit,
            domicilio = :domicilio,
            contacto_principal = :contacto_principal,
            email_contacto = :email_contacto,
            telefono = :telefono
          WHERE id = :id
        `, {
          replacements: prov
        });
        console.log(`   🔄 Actualizado: ${prov.nombre_comercial}`);
      }
    }

    // Limpiar sitios existentes solo
    console.log('\n🧹 Limpiando sitios existentes...');
    await sequelize.query('DELETE FROM [sitios]');
    await sequelize.query('DBCC CHECKIDENT(\'sitios\', RESEED, 0)');

    // Crear todos los sitios según la tabla completa
    console.log('\n🏢 Creando sitios actualizados...');

    const sitios = [
      // GRUPO ACTIVO SRL (ID: 1)
      {
        proveedor_id: 1,
        nombre: 'ACTIVO',
        localidad: 'CABA',
        domicilio: 'Florida 141-CABA',
        estado: 'activo'
      },

      // CENTRO DE INTERACCION MULTIMEDIA S.A. (ID: 2)
      {
        proveedor_id: 2,
        nombre: 'APEX CBA (Edf. Correo)',
        localidad: 'CORDOBA',
        domicilio: 'Avenida Colon 210 6° Piso',
        estado: 'activo'
      },
      {
        proveedor_id: 2,
        nombre: 'APEX RES (Edf. Mitre)',
        localidad: 'CHACO',
        domicilio: 'Mitre 1754 - Resistencia',
        estado: 'activo'
      },
      {
        proveedor_id: 2,
        nombre: 'APEX RES (Edf. A y Blanco)',
        localidad: 'CHACO',
        domicilio: 'Arbo y Blanco 236 -Resistencia',
        estado: 'activo'
      },

      // CAT TECHNOLOGIES ARGENTINA S.A (ID: 3)
      {
        proveedor_id: 3,
        nombre: 'CAT TECHNOLOGIES',
        localidad: 'CABA',
        domicilio: 'Mitre 853 piso 1 - CABA',
        estado: 'activo'
      },

      // STRATTON ARGENTINA SA (ID: 4)
      {
        proveedor_id: 4,
        nombre: 'KONECTA CBA',
        localidad: 'CORDOBA',
        domicilio: 'Rosario de Santa Fe 67 - Córdoba',
        estado: 'activo'
      },
      {
        proveedor_id: 4,
        nombre: 'KONECTA RES',
        localidad: 'CHACO',
        domicilio: 'Monteagudo 55 - Resistencia',
        estado: 'activo'
      },
      {
        proveedor_id: 4,
        nombre: 'KONECTA ROS',
        localidad: 'ROSARIO',
        domicilio: 'Av. Corrientes 2265 E/P Rosario',
        estado: 'activo'
      },

      // CITYTECH SOCIEDAD ANONIMA (ID: 5)
      {
        proveedor_id: 5,
        nombre: 'TELEPERFORMANCE TUC 1',
        localidad: 'TUCUMAN',
        domicilio: 'Adolfo de la Vega 345 -San Miguel de Tucumán',
        estado: 'activo'
      },
      {
        proveedor_id: 5,
        nombre: 'TELEPERFORMANCE TUC 3',
        localidad: 'TUCUMAN',
        domicilio: 'Adolfo de la Vega 400 -San Miguel de Tucumán',
        estado: 'activo'
      },
      {
        proveedor_id: 5,
        nombre: 'TELEPERFORMANCE RES',
        localidad: 'CHACO',
        domicilio: 'Av. 9 de Julio 4175, Barranqueras',
        estado: 'activo'
      }
    ];

    for (const sitio of sitios) {
      await sequelize.query(`
        INSERT INTO [sitios]
        ([proveedor_id], [nombre], [localidad], [domicilio], [estado])
        VALUES (:proveedor_id, :nombre, :localidad, :domicilio, :estado)
      `, {
        replacements: sitio
      });
      console.log(`   ✅ ${sitio.nombre} - ${sitio.localidad}`);
    }

    // Crear algunas auditorías de ejemplo para los nuevos sitios
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

    // Mostrar resumen final
    console.log('\n📊 Resumen final:');
    const [proveedoresCount] = await sequelize.query('SELECT COUNT(*) as count FROM [proveedores]');
    const [sitiosCount] = await sequelize.query('SELECT COUNT(*) as count FROM [sitios]');
    const [auditoriasCount] = await sequelize.query('SELECT COUNT(*) as count FROM [auditorias]');

    console.log(`   👥 Proveedores: ${proveedoresCount[0].count}`);
    console.log(`   🏢 Sitios: ${sitiosCount[0].count}`);
    console.log(`   📋 Auditorías: ${auditoriasCount[0].count}`);

    // Mostrar distribución por proveedor
    console.log('\n📈 Distribución de sitios por proveedor:');
    const [distribucion] = await sequelize.query(`
      SELECT
        p.nombre_comercial,
        COUNT(s.id) as total_sitios
      FROM [proveedores] p
      LEFT JOIN [sitios] s ON p.id = s.proveedor_id
      GROUP BY p.id, p.nombre_comercial
      ORDER BY p.id
    `);

    distribucion.forEach(item => {
      console.log(`   🏢 ${item.nombre_comercial}: ${item.total_sitios} sitios`);
    });

    console.log('\n🎉 Actualización incremental completada!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

updateIncremental();