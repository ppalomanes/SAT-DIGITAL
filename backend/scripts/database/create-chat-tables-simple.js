require('dotenv').config();
const { sequelize } = require('./src/shared/database/connection');

async function createChatTables() {
  try {
    console.log('🔄 Creating chat tables...');
    console.log('Using:', sequelize.config.dialect, sequelize.config.host, sequelize.config.database);

    // Create conversaciones table
    if (sequelize.config.dialect === 'mssql') {
      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name='conversaciones')
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
      `);

      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name='mensajes')
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
      `);
    } else {
      await sequelize.query(`CREATE TABLE IF NOT EXISTS conversaciones (
        id int AUTO_INCREMENT PRIMARY KEY,
        auditoria_id int NOT NULL,
        seccion_id int NULL,
        titulo varchar(255) NOT NULL,
        categoria varchar(50) DEFAULT 'tecnico',
        estado varchar(50) DEFAULT 'abierta',
        prioridad varchar(50) DEFAULT 'normal',
        iniciada_por int NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);

      await sequelize.query(`CREATE TABLE IF NOT EXISTS mensajes (
        id int AUTO_INCREMENT PRIMARY KEY,
        conversacion_id int NOT NULL,
        usuario_id int NOT NULL,
        contenido text NOT NULL,
        tipo_mensaje varchar(50) DEFAULT 'texto',
        archivo_adjunto varchar(255) NULL,
        referencia_documento_id int NULL,
        responde_a_mensaje_id int NULL,
        ip_origen varchar(45) NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
    }

    console.log('✅ Chat tables created successfully');

    // Create sample conversations
    const [existing] = await sequelize.query('SELECT COUNT(*) as count FROM conversaciones');
    const count = existing[0].count || existing[0]['COUNT(*)'] || 0;

    if (count === 0) {
      await sequelize.query(`INSERT INTO conversaciones (auditoria_id, titulo, categoria, prioridad, iniciada_por)
        VALUES (1, 'Consulta técnica - Infraestructura de red', 'tecnico', 'normal', 1)`);
      await sequelize.query(`INSERT INTO conversaciones (auditoria_id, titulo, categoria, prioridad, iniciada_por)
        VALUES (2, 'Documentación faltante - Sección Power', 'administrativo', 'alta', 2)`);
      console.log('✅ Sample conversations created');
    } else {
      console.log(`ℹ️ ${count} conversations already exist`);
    }

    await sequelize.close();
    console.log('🏁 Script completed successfully');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

createChatTables();