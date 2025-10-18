/**
 * Script para crear tablas de chat en MySQL
 */

require('dotenv').config();
const { sequelize } = require('./src/shared/database/connection');

async function createChatTables() {
  try {
    console.log('🔄 Creando tablas de chat en MySQL...');

    // Crear tabla conversaciones
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS conversaciones (
        id int NOT NULL AUTO_INCREMENT,
        auditoria_id int NOT NULL,
        seccion_id int NULL,
        titulo varchar(255) NOT NULL,
        categoria varchar(50) DEFAULT 'tecnico',
        estado varchar(50) DEFAULT 'abierta',
        prioridad varchar(50) DEFAULT 'normal',
        iniciada_por int NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (auditoria_id) REFERENCES auditorias(id),
        FOREIGN KEY (iniciada_por) REFERENCES usuarios(id)
      )
    `);

    // Crear tabla mensajes
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS mensajes (
        id int NOT NULL AUTO_INCREMENT,
        conversacion_id int NOT NULL,
        usuario_id int NOT NULL,
        contenido text NOT NULL,
        tipo_mensaje varchar(50) DEFAULT 'texto',
        archivo_adjunto varchar(255) NULL,
        referencia_documento_id int NULL,
        responde_a_mensaje_id int NULL,
        ip_origen varchar(45) NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (responde_a_mensaje_id) REFERENCES mensajes(id)
      )
    `);

    console.log('✅ Tablas de chat creadas exitosamente');

    // Crear algunas conversaciones de ejemplo
    console.log('📝 Creando conversaciones de ejemplo...');

    // Verificar si ya existen conversaciones
    const [existing] = await sequelize.query('SELECT COUNT(*) as count FROM conversaciones');

    if (existing[0].count === 0) {
      // Conversación para auditoría 1
      await sequelize.query(`
        INSERT INTO conversaciones (auditoria_id, titulo, categoria, prioridad, iniciada_por)
        VALUES (1, 'Consulta técnica - Infraestructura de red', 'tecnico', 'normal', 1)
      `);

      // Conversación para auditoría 2
      await sequelize.query(`
        INSERT INTO conversaciones (auditoria_id, titulo, categoria, prioridad, iniciada_por)
        VALUES (2, 'Documentación faltante - Sección Power', 'administrativo', 'alta', 2)
      `);

      console.log('✅ Conversaciones de ejemplo creadas');
    } else {
      console.log('ℹ️ Ya existen conversaciones en la base de datos');
    }

    await sequelize.close();
    console.log('🏁 Script completado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createChatTables();