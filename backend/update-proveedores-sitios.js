/**
 * Script para actualizar proveedores y crear todos los sitios según tabla proporcionada
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const { sequelize } = require('./src/shared/database/connection');

async function updateProveedoresSitios() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a SQL Server');

    // Limpiar datos existentes respetando foreign keys
    console.log('\n🧹 Limpiando datos existentes...');
    await sequelize.query('DELETE FROM [documentos]');
    await sequelize.query('DELETE FROM [auditorias]');
    await sequelize.query('DELETE FROM [sitios]');
    await sequelize.query('DELETE FROM [proveedores]');
    await sequelize.query('DBCC CHECKIDENT(\'documentos\', RESEED, 0)');
    await sequelize.query('DBCC CHECKIDENT(\'auditorias\', RESEED, 0)');
    await sequelize.query('DBCC CHECKIDENT(\'sitios\', RESEED, 0)');
    await sequelize.query('DBCC CHECKIDENT(\'proveedores\', RESEED, 0)');

    // Crear proveedores actualizados
    console.log('\n🏢 Creando proveedores actualizados...');

    const proveedores = [
      {
        razon_social: 'GRUPO ACTIVO SRL',
        cuit: '30-71044895-3',
        nombre_comercial: 'ACTIVO',
        domicilio: 'Florida 141 - CABA',
        contacto_principal: 'Luis Horosuck',
        email_contacto: 'luis.horosuck@activo.com',
        telefono: '11-1234-5678',
        estado: 'activo'
      },
      {
        razon_social: 'CENTRO DE INTERACCION MULTIMEDIA S.A.',
        cuit: '30-70827680-0',
        nombre_comercial: 'APEX',
        domicilio: 'Entre Rios 11 - Córdoba',
        contacto_principal: 'Federico Borda',
        email_contacto: 'federico.borda@apex.com',
        telefono: '351-2345-6789',
        estado: 'activo'
      },
      {
        razon_social: 'CAT TECHNOLOGIES ARGENTINA S.A',
        cuit: '30-70949292-2',
        nombre_comercial: 'CAT TECHNOLOGIES',
        domicilio: 'Mitre 853 piso 1 - CABA',
        contacto_principal: 'Paulo Desimone',
        email_contacto: 'paulo.desimone@cattech.com',
        telefono: '11-3456-7890',
        estado: 'activo'
      },
      {
        razon_social: 'STRATTON ARGENTINA SA',
        cuit: '30-69847741-1',
        nombre_comercial: 'KONECTA',
        domicilio: 'Rosario de Santa Fe 67 - Córdoba',
        contacto_principal: 'Andres Frumento',
        email_contacto: 'andres.frumento@konecta.com',
        telefono: '351-4567-8901',
        estado: 'activo'
      },
      {
        razon_social: 'CITYTECH SOCIEDAD ANONIMA',
        cuit: '30-70908678-9',
        nombre_comercial: 'TELEPERFORMANCE',
        domicilio: 'Av. Bouchard 680 - CABA',
        contacto_principal: 'Veronica Luna',
        email_contacto: 'veronica.luna@teleperformance.com',
        telefono: '11-5678-9012',
        estado: 'activo'
      }
    ];

    for (let i = 0; i < proveedores.length; i++) {
      const prov = proveedores[i];
      await sequelize.query(`
        INSERT INTO [proveedores]
        ([razon_social], [cuit], [nombre_comercial], [domicilio], [contacto_principal], [email_contacto], [telefono], [estado])
        VALUES (:razon_social, :cuit, :nombre_comercial, :domicilio, :contacto_principal, :email_contacto, :telefono, :estado)
      `, {
        replacements: prov
      });
      console.log(`   ✅ ${prov.nombre_comercial} - ${prov.razon_social}`);
    }

    // Crear todos los sitios según la tabla
    console.log('\n🏢 Creando sitios por proveedor...');

    const sitios = [
      // GRUPO ACTIVO SRL (ID: 1)
      {
        proveedor_id: 1,
        nombre: 'ACTIVO',
        localidad: 'CABA',
        domicilio: 'Florida 141-CABA',
        jefe_proveedor: 'Luis Horosuck',
        tecnico_proveedor: 'Eber Cuello',
        estado: 'activo'
      },

      // CENTRO DE INTERACCION MULTIMEDIA S.A. (ID: 2)
      {
        proveedor_id: 2,
        nombre: 'APEX CBA (Edf. Correo)',
        localidad: 'CORDOBA',
        domicilio: 'Avenida Colon 210 6° Piso',
        jefe_proveedor: 'Federico Borda',
        tecnico_proveedor: 'Hernan Covarrubias',
        estado: 'activo'
      },
      {
        proveedor_id: 2,
        nombre: 'APEX RES (Edf. Mitre)',
        localidad: 'CHACO',
        domicilio: 'Mitre 1754 - Resistencia',
        jefe_proveedor: 'Federico Borda',
        tecnico_proveedor: 'Gustavo Panyagua',
        estado: 'activo'
      },
      {
        proveedor_id: 2,
        nombre: 'APEX RES (Edf. A y Blanco)',
        localidad: 'CHACO',
        domicilio: 'Arbo y Blanco 236 -Resistencia',
        jefe_proveedor: 'Federico Borda',
        tecnico_proveedor: 'Mauro Gallardo',
        estado: 'activo'
      },

      // CAT TECHNOLOGIES ARGENTINA S.A (ID: 3)
      {
        proveedor_id: 3,
        nombre: 'CAT TECHNOLOGIES',
        localidad: 'CABA',
        domicilio: 'Mitre 853 piso 1 - CABA',
        jefe_proveedor: 'Paulo Desimone',
        tecnico_proveedor: 'Nahuel Mongussi',
        estado: 'activo'
      },

      // STRATTON ARGENTINA SA (ID: 4)
      {
        proveedor_id: 4,
        nombre: 'KONECTA CBA',
        localidad: 'CORDOBA',
        domicilio: 'Rosario de Santa Fe 67 - Córdoba',
        jefe_proveedor: 'Andres Frumento',
        tecnico_proveedor: 'Marcos Bissio',
        estado: 'activo'
      },
      {
        proveedor_id: 4,
        nombre: 'KONECTA RES',
        localidad: 'CHACO',
        domicilio: 'Monteagudo 55 - Resistencia',
        jefe_proveedor: 'Andres Frumento',
        tecnico_proveedor: 'Adrian Posnisick',
        estado: 'activo'
      },
      {
        proveedor_id: 4,
        nombre: 'KONECTA ROS',
        localidad: 'ROSARIO',
        domicilio: 'Av. Corrientes 2265 E/P Rosario',
        jefe_proveedor: 'Andres Frumento',
        tecnico_proveedor: 'Andres Frumento',
        estado: 'activo'
      },

      // CITYTECH SOCIEDAD ANONIMA (ID: 5)
      {
        proveedor_id: 5,
        nombre: 'TELEPERFORMANCE TUC 1',
        localidad: 'TUCUMAN',
        domicilio: 'Adolfo de la Vega 345 -San Miguel de Tucumán',
        jefe_proveedor: 'Veronica Luna',
        tecnico_proveedor: 'Adrian Avellato',
        estado: 'activo'
      },
      {
        proveedor_id: 5,
        nombre: 'TELEPERFORMANCE TUC 3',
        localidad: 'TUCUMAN',
        domicilio: 'Adolfo de la Vega 400 -San Miguel de Tucumán',
        jefe_proveedor: 'Veronica Luna',
        tecnico_proveedor: 'José Luís Vaca',
        estado: 'activo'
      },
      {
        proveedor_id: 5,
        nombre: 'TELEPERFORMANCE RES',
        localidad: 'CHACO',
        domicilio: 'Av. 9 de Julio 4175, Barranqueras',
        jefe_proveedor: 'Veronica Luna',
        tecnico_proveedor: 'Sergio Lepez',
        estado: 'activo'
      }
    ];

    for (const sitio of sitios) {
      await sequelize.query(`
        INSERT INTO [sitios]
        ([proveedor_id], [nombre], [localidad], [domicilio], [estado])
        VALUES (:proveedor_id, :nombre, :localidad, :domicilio, :estado)
      `, {
        replacements: {
          proveedor_id: sitio.proveedor_id,
          nombre: sitio.nombre,
          localidad: sitio.localidad,
          domicilio: sitio.domicilio,
          estado: sitio.estado
        }
      });
      console.log(`   ✅ ${sitio.nombre} - ${sitio.localidad}`);
    }

    // Verificar datos creados
    console.log('\n📊 Resumen final:');
    const [proveedoresCount] = await sequelize.query('SELECT COUNT(*) as count FROM [proveedores]');
    const [sitiosCount] = await sequelize.query('SELECT COUNT(*) as count FROM [sitios]');

    console.log(`   👥 Proveedores: ${proveedoresCount[0].count}`);
    console.log(`   🏢 Sitios: ${sitiosCount[0].count}`);

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

    console.log('\n🎉 Base de datos actualizada correctamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

updateProveedoresSitios();