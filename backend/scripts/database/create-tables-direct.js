// Direct table creation using backend connection
const express = require('express');
const app = express();

// Add a simple endpoint to create tables
app.get('/create-tables', async (req, res) => {
  try {
    // Import the same connection the backend uses
    const { sequelize } = require('./src/shared/database/connection');

    console.log('Creating chat tables...');

    // Create conversaciones table
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
      ELSE
        PRINT 'Tabla conversaciones ya existe'
    `);

    // Create mensajes table
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
      ELSE
        PRINT 'Tabla mensajes ya existe'
    `);

    res.json({ success: true, message: 'Chat tables created successfully' });
  } catch (error) {
    console.error('Error creating tables:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3002, () => {
  console.log('Table creation server running on port 3002');
  console.log('Visit http://localhost:3002/create-tables');
});