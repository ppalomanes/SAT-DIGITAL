/**
 * Script para arreglar la tabla de notificaciones
 * Actualiza la estructura para que coincida con el modelo
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const { sequelize } = require('./src/shared/database/connection');
const logger = require('./src/shared/utils/logger');

async function fixNotificationsTable() {
  try {
    logger.info('🔧 Arreglando tabla notificaciones_usuario...');

    // Eliminar tabla anterior si existe
    await sequelize.query(`
      IF EXISTS (SELECT * FROM sysobjects WHERE name='notificaciones_usuario' AND xtype='U')
      DROP TABLE notificaciones_usuario
    `);
    logger.info('✅ Tabla anterior eliminada');

    // Crear tabla con estructura correcta
    await sequelize.query(`
      CREATE TABLE notificaciones_usuario (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        usuario_id INT NOT NULL,
        tipo_notificacion NVARCHAR(50) CHECK (tipo_notificacion IN ('mensaje_nuevo', 'respuesta_recibida', 'estado_cambiado', 'plazo_venciendo')) NOT NULL,
        titulo NVARCHAR(255) NOT NULL,
        contenido NTEXT NOT NULL,
        enlace_accion NVARCHAR(500) NULL,
        leida BIT DEFAULT 0,
        leida_en DATETIME NULL,
        data_adicional NTEXT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )
    `);
    logger.info('✅ Tabla notificaciones_usuario recreada con estructura correcta');

    // Insertar notificaciones de ejemplo
    await sequelize.query(`
      INSERT INTO notificaciones_usuario (usuario_id, tipo_notificacion, titulo, contenido, leida)
      VALUES
        (1, 'estado_cambiado', 'Bienvenido al Sistema', 'El sistema SAT-Digital ha sido configurado correctamente', 0),
        (1, 'mensaje_nuevo', 'Nueva Auditoría Asignada', 'Se ha asignado una nueva auditoría para revisión', 0),
        (1, 'plazo_venciendo', 'Plazo Próximo a Vencer', 'La auditoría ID 1 vence en 3 días', 0),
        (2, 'estado_cambiado', 'Actualización Disponible', 'Nueva versión del sistema disponible', 0)
    `);
    logger.info('✅ Notificaciones de ejemplo insertadas');

    logger.info('🎉 Tabla de notificaciones arreglada exitosamente');

  } catch (error) {
    logger.error('❌ Error arreglando tabla de notificaciones:', error);
    throw error;
  }
}

async function main() {
  try {
    await fixNotificationsTable();
    logger.info('✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error en el proceso:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixNotificationsTable };