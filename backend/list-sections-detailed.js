const { sequelize } = require('./src/shared/database/models');

async function listSections() {
  try {
    const secciones = await sequelize.query(
      'SELECT id, codigo, nombre, tipo_analisis FROM secciones_tecnicas ORDER BY orden_presentacion',
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('\n=== SECCIONES TÉCNICAS ===\n');
    secciones.forEach(s => {
      console.log(`ID: ${s.id.toString().padEnd(3)} | Código: ${s.codigo.padEnd(25)} | Tipo: ${s.tipo_analisis.padEnd(12)} | ${s.nombre}`);
    });

    console.log('\n=== MAPEO PARA FORMS ===\n');
    const mapping = {
      'topologia': 'TopologiaForm.jsx',
      'documentacion': 'DocumentacionForm.jsx',
      'energia': 'EnergiaForm.jsx',
      'temperatura': 'TemperaturaForm.jsx',
      'servidores': 'ServidoresForm.jsx',
      'internet': 'InternetForm.jsx',
      'personal_capacitado': 'PersonalCapacitadoForm.jsx',
      'escalamiento': 'EscalamientoForm.jsx',
      'cuarto_tecnologia': 'CuartoTecnologiaForm.jsx',
      'conectividad': 'ConectividadForm.jsx',
      'hardware_software': 'HardwareSoftwareForm.jsx',
      'seguridad_informacion': 'SeguridadInformacionForm.jsx',
      'entorno_informacion': 'EntornoInformacionForm.jsx'
    };

    secciones.forEach(s => {
      const formFile = mapping[s.codigo];
      if (formFile) {
        console.log(`${s.codigo.padEnd(25)} → ${formFile.padEnd(35)} (ID: ${s.id})`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listSections();
