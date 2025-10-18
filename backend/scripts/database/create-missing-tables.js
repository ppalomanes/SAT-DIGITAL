/**
 * Script para crear tablas faltantes en la base de datos
 * Arregla problemas del dashboard de auditorías y notificaciones
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const { sequelize } = require('./src/shared/database/connection');
const logger = require('./src/shared/utils/logger');

async function createMissingTables() {
  try {
    logger.info('🔧 Iniciando creación de tablas faltantes...');

    // Crear tabla asignaciones_auditor
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='asignaciones_auditor' AND xtype='U')
      CREATE TABLE asignaciones_auditor (
        id INT IDENTITY(1,1) PRIMARY KEY,
        auditoria_id INT NOT NULL,
        auditor_id INT NOT NULL,
        fecha_asignacion DATETIME DEFAULT GETDATE(),
        fecha_visita_programada DATETIME NULL,
        prioridad NVARCHAR(10) CHECK (prioridad IN ('baja', 'normal', 'alta')) DEFAULT 'normal',
        observaciones NTEXT NULL,
        estado_asignacion NVARCHAR(20) CHECK (estado_asignacion IN ('asignado', 'confirmado', 'reagendado', 'completado')) DEFAULT 'asignado',
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (auditoria_id) REFERENCES auditorias(id),
        FOREIGN KEY (auditor_id) REFERENCES usuarios(id),
        UNIQUE (auditoria_id, auditor_id)
      )
    `);
    logger.info('✅ Tabla asignaciones_auditor creada');

    // Crear tabla notificaciones_usuario
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='notificaciones_usuario' AND xtype='U')
      CREATE TABLE notificaciones_usuario (
        id INT IDENTITY(1,1) PRIMARY KEY,
        usuario_id INT NOT NULL,
        tipo NVARCHAR(50) NOT NULL,
        titulo NVARCHAR(255) NOT NULL,
        mensaje NTEXT NOT NULL,
        leida BIT DEFAULT 0,
        fecha_creacion DATETIME DEFAULT GETDATE(),
        fecha_leida DATETIME NULL,
        datos_adicionales NTEXT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )
    `);
    logger.info('✅ Tabla notificaciones_usuario creada');

    // Insertar datos de ejemplo en asignaciones_auditor
    await sequelize.query(`
      IF NOT EXISTS (SELECT 1 FROM asignaciones_auditor)
      INSERT INTO asignaciones_auditor (auditoria_id, auditor_id, fecha_asignacion, prioridad, estado_asignacion)
      SELECT
        a.id as auditoria_id,
        (SELECT TOP 1 id FROM usuarios WHERE rol IN ('admin', 'auditor_general', 'auditor_interno')) as auditor_id,
        GETDATE() as fecha_asignacion,
        'normal' as prioridad,
        'asignado' as estado_asignacion
      FROM auditorias a
      WHERE a.id <= 5
    `);
    logger.info('✅ Datos de ejemplo insertados en asignaciones_auditor');

    // Insertar notificaciones de ejemplo
    await sequelize.query(`
      IF NOT EXISTS (SELECT 1 FROM notificaciones_usuario)
      INSERT INTO notificaciones_usuario (usuario_id, tipo, titulo, mensaje, leida)
      VALUES
        (1, 'info', 'Bienvenido al Sistema', 'El sistema SAT-Digital ha sido configurado correctamente', 0),
        (1, 'auditoria', 'Nueva Auditoría Asignada', 'Se ha asignado una nueva auditoría para revisión', 0),
        (2, 'sistema', 'Actualización Disponible', 'Nueva versión del sistema disponible', 0)
    `);
    logger.info('✅ Notificaciones de ejemplo insertadas');

    logger.info('🎉 Todas las tablas faltantes han sido creadas exitosamente');

  } catch (error) {
    logger.error('❌ Error creando tablas faltantes:', error);
    throw error;
  }
}

async function main() {
  try {
    await createMissingTables();
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

module.exports = { createMissingTables };