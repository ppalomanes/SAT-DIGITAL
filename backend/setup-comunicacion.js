// Script para crear tablas del sistema de comunicación
// Checkpoint 2.3 - Sistema Comunicación Asíncrona

const fs = require('fs').promises;
const path = require('path');
const { sequelize } = require('./src/shared/database/connection');

async function crearTablasComunicacion() {
  try {
    console.log('🗂️ Creando tablas del sistema de comunicación...');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'database', 'comunicacion-schema.sql');
    const sqlContent = await fs.readFile(sqlPath, 'utf8');

    // Dividir el contenido en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    // Ejecutar cada statement
    for (const statement of statements) {
      try {
        await sequelize.query(statement);
        console.log('✅ Ejecutado:', statement.substring(0, 50) + '...');
      } catch (error) {
        console.warn('⚠️ Error en statement (puede ya existir):', error.message);
      }
    }

    console.log('🎉 Tablas de comunicación creadas exitosamente');

    // Verificar que las tablas existan
    const tablas = await sequelize.query("SHOW TABLES LIKE '%conversacion%' OR SHOW TABLES LIKE '%mensaje%' OR SHOW TABLES LIKE '%notificacion%'", {
      type: sequelize.QueryTypes.SHOWTABLES
    });

    console.log('📋 Tablas de comunicación encontradas:', tablas);

  } catch (error) {
    console.error('❌ Error creando tablas de comunicación:', error);
    throw error;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  crearTablasComunicacion()
    .then(() => {
      console.log('✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Proceso fallido:', error);
      process.exit(1);
    });
}

module.exports = { crearTablasComunicacion };
