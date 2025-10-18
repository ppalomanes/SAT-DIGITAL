/**
 * Script para crear tablas de chat en SQL Server
 */

require('dotenv').config();
const { sequelize } = require('./src/shared/database/connection');

async function createChatTables() {
  try {
    console.log('🔄 Creando tablas de chat...');
    console.log('🔗 DB Config:', {
      host: sequelize.config.host,
      database: sequelize.config.database,
      dialect: sequelize.config.dialect
    });

    // Primer paso: verificar qué tablas existen
    console.log('📋 Verificando tablas existentes...');
    try {
      const [tables] = await sequelize.query(
        sequelize.config.dialect === 'mssql'
          ? "SELECT name FROM sys.tables ORDER BY name"
          : "SHOW TABLES"
      );
      console.log('📊 Tablas existentes:', tables.map(t => t.name || Object.values(t)[0]));
    } catch (e) {
      console.log('⚠️ Error verificando tablas:', e.message);
    }

    // Crear tabla conversaciones (compatible con ambos motores)
    if (sequelize.config.dialect === 'mssql') {
      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name='conversaciones')
        BEGIN
          CREATE TABLE conversaciones (
            id int IDENTITY(1,1) PRIMARY KEY,
            auditoria_id int NOT NULL,
            seccion_id int NULL,
            titulo nvarchar(255) NOT NULL,
            categoria nvarchar(50) DEFAULT 'tecnico',
            estado nvarchar(50) DEFAULT 'abierta',
            prioridad nvarchar(50) DEFAULT 'normal',
            iniciada_por int NOT NULL,
            created_at datetime2 DEFAULT GETDATE(),
            updated_at datetime2 DEFAULT GETDATE()
          )
          PRINT 'Tabla conversaciones creada'
        END
      `);

      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name='mensajes')
        BEGIN
          CREATE TABLE mensajes (
            id int IDENTITY(1,1) PRIMARY KEY,
            conversacion_id int NOT NULL,
            usuario_id int NOT NULL,
            contenido nvarchar(max) NOT NULL,
            tipo_mensaje nvarchar(50) DEFAULT 'texto',
            archivo_adjunto nvarchar(255) NULL,
            referencia_documento_id int NULL,
            responde_a_mensaje_id int NULL,
            ip_origen nvarchar(45) NULL,
            created_at datetime2 DEFAULT GETDATE(),
            updated_at datetime2 DEFAULT GETDATE()
          )
          PRINT 'Tabla mensajes creada'
        END
      `);
    } else {
      // MySQL
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
          PRIMARY KEY (id)
        )
      `);

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
          PRIMARY KEY (id)
        )
      `);
    }

    console.log('✅ Tablas de chat creadas exitosamente');

    // Crear algunas conversaciones de ejemplo si no existen
    console.log('📝 Verificando conversaciones de ejemplo...');

    const [existing] = await sequelize.query('SELECT COUNT(*) as count FROM conversaciones');
    const count = existing[0].count || existing[0]['COUNT(*)'] || 0;

    if (count === 0) {
      await sequelize.query(`
        INSERT INTO conversaciones (auditoria_id, titulo, categoria, prioridad, iniciada_por)
        VALUES (1, 'Consulta técnica - Infraestructura de red', 'tecnico', 'normal', 1)
      `);

      await sequelize.query(`
        INSERT INTO conversaciones (auditoria_id, titulo, categoria, prioridad, iniciada_por)
        VALUES (2, 'Documentación faltante - Sección Power', 'administrativo', 'alta', 2)
      `);

      console.log('✅ Conversaciones de ejemplo creadas');
    } else {
      console.log(`ℹ️ Ya existen ${count} conversaciones en la base de datos`);
    }

    await sequelize.close();
    console.log('🏁 Script completado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📝 Stack:', error.stack);
    process.exit(1);
  }
}

createChatTables();