/**
 * Script para actualizar solo sitios con datos completos
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const { sequelize } = require('./src/shared/database/connection');

async function updateSitios() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a SQL Server');

    // Limpiar sitios existentes
    console.log('\n🧹 Limpiando sitios existentes...');
    await sequelize.query('DELETE FROM [sitios]');
    await sequelize.query('DBCC CHECKIDENT(\'sitios\', RESEED, 0)');

    // Crear todos los sitios según la tabla completa
    console.log('\n🏢 Creando sitios completos...');

    const sitios = [
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
        nombre: 'APEX CBA (Edf. Correo)',
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

    for (const sitio of sitios) {
      await sequelize.query(`
        INSERT INTO [sitios]
        ([proveedor_id], [nombre], [localidad], [domicilio], [estado])
        VALUES (:proveedor_id, :nombre, :localidad, :domicilio, 'activo')
      `, {
        replacements: sitio
      });
      console.log(`   ✅ ${sitio.nombre} - ${sitio.localidad}`);
    }

    // Crear auditorías de ejemplo
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

    // Mostrar distribución completa
    console.log('\n📈 Distribución de sitios por proveedor:');
    const [distribucion] = await sequelize.query(`
      SELECT
        p.nombre_comercial,
        p.razon_social,
        COUNT(s.id) as total_sitios,
        STRING_AGG(s.nombre, ', ') as sitios
      FROM [proveedores] p
      LEFT JOIN [sitios] s ON p.id = s.proveedor_id
      GROUP BY p.id, p.nombre_comercial, p.razon_social
      ORDER BY p.id
    `);

    distribucion.forEach(item => {
      console.log(`\n   🏢 ${item.nombre_comercial} (${item.razon_social})`);
      console.log(`      📊 ${item.total_sitios} sitios`);
      console.log(`      🏠 ${item.sitios || 'Sin sitios'}`);
    });

    console.log('\n🎉 Sitios actualizados correctamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

updateSitios();