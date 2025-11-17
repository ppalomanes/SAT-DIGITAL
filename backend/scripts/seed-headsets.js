/**
 * Script para poblar la tabla headsets_homologados con datos iniciales
 */

// Configurar para usar SQL Server
process.env.DB_TYPE = 'sqlserver';

const { HeadsetHomologado } = require('../src/shared/database/models');

// Datos de headsets homologados
const headsetsIniciales = [
  { marca: 'Accutone', modelo: 'WT980 Inalámbrico', conector: 'Base Inalámbrica', activo: true },
  { marca: 'Diqsa', modelo: 'Audio D02', conector: 'Plug', activo: true },
  { marca: 'Jabra', modelo: 'Jabra Cord-Supervisor', conector: 'Plug', activo: true },
  { marca: 'Jabra', modelo: 'Biz 1500 QD Duo', conector: 'Plug', activo: true },
  { marca: 'Jabra', modelo: 'Ninja', conector: 'Plug', activo: true },
  { marca: 'Noga', modelo: 'NG-8620', conector: 'Plug', activo: true },
  { marca: 'Plantronics', modelo: '326/z', conector: 'Plug', activo: true },
  { marca: 'Plantronics', modelo: 'Audio 326', conector: 'Plug', activo: true },
  { marca: 'Accutone', modelo: 'WT880', conector: 'QD', activo: true },
  { marca: 'Jabra', modelo: 'GN2000 QD mono/duo', conector: 'RJ9', activo: true },
  { marca: 'Jabra', modelo: 'Biz 1900 Duo', conector: 'RJ9', activo: true },
  { marca: 'Accutone', modelo: 'PWM710', conector: 'USB', activo: true },
  { marca: 'Accutone', modelo: 'M1000', conector: 'USB', activo: true },
  { marca: 'Accutone', modelo: 'E-USBM610 - Monoauricular', conector: 'USB', activo: true },
  { marca: 'Accutone', modelo: 'E-USBB610 - Biauricular', conector: 'USB', activo: true },
  { marca: 'Diqsa', modelo: 'D02U', conector: 'USB', activo: true },
  { marca: 'Eurocase', modelo: 'Sparta UEHP-103', conector: 'USB', activo: true },
  { marca: 'Jabra', modelo: 'Biz 2300 Duo', conector: 'USB', activo: true },
  { marca: 'Jabra', modelo: 'Ninja Duo USB', conector: 'USB', activo: true },
  { marca: 'Jabra', modelo: 'Jabra BIZ 1500 Duo USB', conector: 'USB', activo: true },
  { marca: 'Jabra', modelo: 'UC Voice 150 Duo', conector: 'USB', activo: true },
  { marca: 'Jabra', modelo: 'Biz 1100 Duo', conector: 'USB', activo: true },
  { marca: 'Logitech', modelo: 'H340', conector: 'USB', activo: true },
  { marca: 'Logitech', modelo: 'H390', conector: 'USB', activo: true },
  { marca: 'Logitech', modelo: 'Logitech USB Headset H330', conector: 'USB', activo: true },
  { marca: 'Plantronics', modelo: 'SupraElite USB AH450', conector: 'USB', activo: true },
  { marca: 'Plantronics', modelo: 'Plantronics audio 628 USB', conector: 'USB', activo: true },
  { marca: 'IMICRO', modelo: 'SP-IMME282', conector: 'USB', activo: true },
  { marca: 'Jabra', modelo: 'PRO 930 Duo', conector: 'Wireless', activo: true },
  { marca: 'Plantronics', modelo: 'HW251', conector: 'USB', activo: true },
  { marca: 'Plantronics', modelo: 'HW261', conector: 'USB', activo: true },
  { marca: 'Plantronics', modelo: 'HW510v', conector: 'USB', activo: true },
  { marca: 'Plantronics', modelo: 'HW520v', conector: 'USB', activo: true },
  { marca: 'Plantronics', modelo: 'C3210', conector: 'USB', activo: true },
  { marca: 'Plantronics', modelo: 'C3220', conector: 'USB', activo: true }
];

async function seed() {
  try {
    console.log('🔌 Conectando a base de datos...');
    await HeadsetHomologado.sequelize.authenticate();
    console.log('✅ Conexión establecida');

    console.log('\n📋 Cargando headsets homologados...');

    // Verificar si ya hay datos
    const existingCount = await HeadsetHomologado.count();

    if (existingCount > 0) {
      console.log(`⚠️ Ya existen ${existingCount} headsets en la base de datos.`);
      console.log('¿Desea eliminarlos y cargar los datos iniciales? (Cancelar con Ctrl+C)');

      // Esperar 3 segundos antes de continuar
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log('Eliminando datos existentes...');
      await HeadsetHomologado.destroy({ where: {} });
      console.log('✅ Datos eliminados');
    }

    // Agregar tenant_id a cada headset
    const headsetsConTenant = headsetsIniciales.map(h => ({
      ...h,
      tenant_id: 1
    }));

    // Insertar los headsets
    const result = await HeadsetHomologado.bulkCreate(headsetsConTenant);

    console.log(`\n✅ ${result.length} headsets homologados insertados correctamente`);

    // Mostrar resumen por marca
    const resumenPorMarca = headsetsIniciales.reduce((acc, h) => {
      acc[h.marca] = (acc[h.marca] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Resumen por marca:');
    Object.entries(resumenPorMarca)
      .sort((a, b) => b[1] - a[1])
      .forEach(([marca, cantidad]) => {
        console.log(`   ${marca}: ${cantidad} modelos`);
      });

    // Mostrar resumen por conector
    const resumenPorConector = headsetsIniciales.reduce((acc, h) => {
      acc[h.conector] = (acc[h.conector] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Resumen por tipo de conector:');
    Object.entries(resumenPorConector)
      .sort((a, b) => b[1] - a[1])
      .forEach(([conector, cantidad]) => {
        console.log(`   ${conector}: ${cantidad} modelos`);
      });

    await HeadsetHomologado.sequelize.close();
    console.log('\n✅ Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando seed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seed();
