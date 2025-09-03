// Script para ejecutar seeder de secciones técnicas
const { seedSeccionesTecnicas } = require('./src/shared/database/seeders/secciones-tecnicas.seeder');
const { sequelize } = require('./src/shared/database/connection');

async function ejecutarSeeder() {
  try {
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // Ejecutar seeder
    await seedSeccionesTecnicas();
    
    console.log('🎉 Seeder completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando seeder:', error);
    process.exit(1);
  }
}

ejecutarSeeder();