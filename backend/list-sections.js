const { sequelize } = require('./src/shared/database/models');

async function listSections() {
  try {
    const secciones = await sequelize.query(
      'SELECT id, codigo, nombre FROM secciones_tecnicas ORDER BY id',
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('\nSecciones Técnicas:');
    secciones.forEach(s => {
      console.log(`  ${s.id}. ${s.codigo} - ${s.nombre}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listSections();
