/**
 * Script para ejecutar migraciones específicas de calendario
 */

const { sequelize } = require('../database/connection');

const runCalendarioMigrations = async () => {
  try {
    console.log('🚀 Ejecutando migraciones de calendario...');

    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Ejecutar migraciones de calendario
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS periodos_auditoria (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(50) NOT NULL,
        codigo VARCHAR(20) NOT NULL UNIQUE,
        fecha_inicio DATE NOT NULL,
        fecha_limite_carga DATE NOT NULL,
        fecha_inicio_visitas DATE NOT NULL,
        fecha_fin_visitas DATE NOT NULL,
        estado ENUM('planificacion', 'activo', 'carga', 'visitas', 'cerrado') DEFAULT 'planificacion',
        configuracion_especial JSON,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES usuarios(id)
      );
    `);

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS asignaciones_auditor (
        id INT PRIMARY KEY AUTO_INCREMENT,
        auditoria_id INT NOT NULL,
        auditor_id INT NOT NULL,
        fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_visita_programada DATE,
        prioridad ENUM('baja', 'normal', 'alta') DEFAULT 'normal',
        observaciones TEXT,
        estado_asignacion ENUM('asignado', 'confirmado', 'reagendado', 'completado') DEFAULT 'asignado',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (auditoria_id) REFERENCES auditorias(id),
        FOREIGN KEY (auditor_id) REFERENCES usuarios(id),
        UNIQUE KEY unique_asignacion (auditoria_id, auditor_id)
      );
    `);

    console.log('✅ Tablas de calendario creadas');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

runCalendarioMigrations();
