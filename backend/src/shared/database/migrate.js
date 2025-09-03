const { sequelize } = require('./models');

const migrate = async () => {
  try {
    console.log('🚀 Conectando a base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    console.log('📋 Creando tablas...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Tablas creadas');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

migrate();
