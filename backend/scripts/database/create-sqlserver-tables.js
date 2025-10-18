/**
 * Script para crear tablas en SQL Server
 * Crea todas las tablas necesarias para SAT-Digital
 */

const { Sequelize } = require('sequelize');

// Configuración SQL Server
const sequelize = new Sequelize(
  'sat_digital_v2',
  'calidad',
  'passcalidad',
  {
    host: 'dwin0293',
    port: 1433,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
      }
    },
    logging: console.log
  }
);

const createTables = async () => {
  try {
    console.log('🔗 Conectando a SQL Server...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    console.log('🏗️ Creando tablas...');

    // TABLA USUARIOS
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='usuarios' AND xtype='U')
      CREATE TABLE usuarios (
        id int IDENTITY(1,1) PRIMARY KEY,
        email nvarchar(255) NOT NULL UNIQUE,
        password_hash nvarchar(255) NOT NULL,
        nombre nvarchar(255) NOT NULL,
        rol nvarchar(50) NOT NULL DEFAULT 'tecnico_proveedor',
        proveedor_id int NULL,
        estado nvarchar(50) NOT NULL DEFAULT 'activo',
        last_login datetime2 NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE()
      );
    `);
    console.log('✅ Tabla usuarios creada');

    // TABLA PROVEEDORES
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='proveedores' AND xtype='U')
      CREATE TABLE proveedores (
        id int IDENTITY(1,1) PRIMARY KEY,
        razon_social nvarchar(255) NOT NULL,
        cuit nvarchar(20) NOT NULL UNIQUE,
        nombre_comercial nvarchar(255) NOT NULL,
        email_contacto nvarchar(255) NULL,
        telefono_principal nvarchar(100) NULL,
        direccion_principal ntext NULL,
        contacto_principal ntext NULL,
        estado nvarchar(50) NOT NULL DEFAULT 'activo',
        configuracion_especial ntext NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE()
      );
    `);
    console.log('✅ Tabla proveedores creada');

    // TABLA SITIOS
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='sitios' AND xtype='U')
      CREATE TABLE sitios (
        id int IDENTITY(1,1) PRIMARY KEY,
        proveedor_id int NOT NULL,
        nombre nvarchar(255) NOT NULL,
        localidad nvarchar(255) NOT NULL,
        domicilio ntext NOT NULL,
        estado nvarchar(50) NOT NULL DEFAULT 'activo',
        configuracion_especial ntext NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
      );
    `);
    console.log('✅ Tabla sitios creada');

    // TABLA PERÍODOS AUDITORÍA
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='periodos_auditoria' AND xtype='U')
      CREATE TABLE periodos_auditoria (
        id int IDENTITY(1,1) PRIMARY KEY,
        nombre nvarchar(255) NOT NULL,
        codigo nvarchar(50) NOT NULL UNIQUE,
        fecha_inicio date NOT NULL,
        fecha_limite_carga date NOT NULL,
        fecha_inicio_visitas date NOT NULL,
        fecha_fin_visitas date NOT NULL,
        estado nvarchar(50) NOT NULL DEFAULT 'planificado',
        configuracion_especial ntext NULL,
        created_by int NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (created_by) REFERENCES usuarios(id)
      );
    `);
    console.log('✅ Tabla periodos_auditoria creada');

    // TABLA SECCIONES TÉCNICAS
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='secciones_tecnicas' AND xtype='U')
      CREATE TABLE secciones_tecnicas (
        id int IDENTITY(1,1) PRIMARY KEY,
        codigo nvarchar(50) NOT NULL UNIQUE,
        nombre nvarchar(255) NOT NULL,
        descripcion ntext NULL,
        tipo_analisis nvarchar(50) NOT NULL DEFAULT 'tiempo_real',
        orden_presentacion int NOT NULL DEFAULT 1,
        obligatoria bit NOT NULL DEFAULT 1,
        formatos_permitidos nvarchar(255) NULL DEFAULT 'pdf,jpg,jpeg,png,xlsx,xls,docx,doc',
        peso_maximo_mb int NOT NULL DEFAULT 10,
        configuracion_validacion ntext NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE()
      );
    `);
    console.log('✅ Tabla secciones_tecnicas creada');

    // TABLA AUDITORÍAS
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='auditorias' AND xtype='U')
      CREATE TABLE auditorias (
        id int IDENTITY(1,1) PRIMARY KEY,
        sitio_id int NOT NULL,
        periodo_id int NOT NULL,
        codigo nvarchar(100) NOT NULL UNIQUE,
        estado nvarchar(50) NOT NULL DEFAULT 'pendiente',
        fecha_asignacion datetime2 NULL,
        fecha_inicio_carga datetime2 NULL,
        fecha_fin_carga datetime2 NULL,
        fecha_visita_programada datetime2 NULL,
        fecha_visita_real datetime2 NULL,
        puntuacion_final decimal(5,2) NULL,
        observaciones_generales ntext NULL,
        estado_documentos nvarchar(50) NOT NULL DEFAULT 'pendiente',
        progreso_carga decimal(5,2) NOT NULL DEFAULT 0.00,
        alertas_activas int NOT NULL DEFAULT 0,
        metadatos_auditoria ntext NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (sitio_id) REFERENCES sitios(id),
        FOREIGN KEY (periodo_id) REFERENCES periodos_auditoria(id)
      );
    `);
    console.log('✅ Tabla auditorias creada');

    // TABLA ASIGNACIONES AUDITOR
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='asignaciones_auditor' AND xtype='U')
      CREATE TABLE asignaciones_auditor (
        id int IDENTITY(1,1) PRIMARY KEY,
        auditor_id int NOT NULL,
        auditoria_id int NOT NULL,
        fecha_asignacion datetime2 NOT NULL DEFAULT GETDATE(),
        estado nvarchar(50) NOT NULL DEFAULT 'asignado',
        observaciones ntext NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (auditor_id) REFERENCES usuarios(id),
        FOREIGN KEY (auditoria_id) REFERENCES auditorias(id)
      );
    `);
    console.log('✅ Tabla asignaciones_auditor creada');

    // TABLA DOCUMENTOS
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='documentos' AND xtype='U')
      CREATE TABLE documentos (
        id int IDENTITY(1,1) PRIMARY KEY,
        auditoria_id int NOT NULL,
        seccion_tecnica_id int NOT NULL,
        nombre_archivo nvarchar(500) NOT NULL,
        nombre_original nvarchar(500) NOT NULL,
        ruta_archivo ntext NOT NULL,
        tipo_archivo nvarchar(100) NOT NULL,
        tamaño_archivo_mb decimal(8,2) NOT NULL,
        estado nvarchar(50) NOT NULL DEFAULT 'subido',
        hash_archivo nvarchar(255) NULL,
        version int NOT NULL DEFAULT 1,
        puntuacion_ia decimal(5,2) NULL,
        observaciones_ia ntext NULL,
        validado_por int NULL,
        fecha_validacion datetime2 NULL,
        observaciones_auditor ntext NULL,
        metadatos_procesamiento ntext NULL,
        uploaded_by int NOT NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (auditoria_id) REFERENCES auditorias(id),
        FOREIGN KEY (seccion_tecnica_id) REFERENCES secciones_tecnicas(id),
        FOREIGN KEY (validado_por) REFERENCES usuarios(id),
        FOREIGN KEY (uploaded_by) REFERENCES usuarios(id)
      );
    `);
    console.log('✅ Tabla documentos creada');

    // TABLA CONVERSACIONES (CHAT)
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='conversaciones' AND xtype='U')
      CREATE TABLE conversaciones (
        id int IDENTITY(1,1) PRIMARY KEY,
        auditoria_id int NOT NULL,
        tipo nvarchar(50) NOT NULL DEFAULT 'auditoria',
        estado nvarchar(50) NOT NULL DEFAULT 'activa',
        ultimo_mensaje_id int NULL,
        ultima_actividad datetime2 NOT NULL DEFAULT GETDATE(),
        participantes ntext NULL,
        metadatos ntext NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (auditoria_id) REFERENCES auditorias(id)
      );
    `);
    console.log('✅ Tabla conversaciones creada');

    // TABLA MENSAJES (CHAT)
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='mensajes' AND xtype='U')
      CREATE TABLE mensajes (
        id int IDENTITY(1,1) PRIMARY KEY,
        conversacion_id int NOT NULL,
        usuario_id int NOT NULL,
        contenido ntext NOT NULL,
        tipo nvarchar(50) NOT NULL DEFAULT 'texto',
        adjuntos ntext NULL,
        responde_a int NULL,
        editado bit NOT NULL DEFAULT 0,
        fecha_edicion datetime2 NULL,
        metadatos ntext NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (responde_a) REFERENCES mensajes(id)
      );
    `);
    console.log('✅ Tabla mensajes creada');

    // TABLA BITÁCORA
    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='bitacora' AND xtype='U')
      CREATE TABLE bitacora (
        id int IDENTITY(1,1) PRIMARY KEY,
        usuario_id int NULL,
        accion nvarchar(255) NOT NULL,
        entidad nvarchar(100) NOT NULL,
        entidad_id int NULL,
        detalles ntext NULL,
        ip_address nvarchar(45) NULL,
        user_agent ntext NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      );
    `);
    console.log('✅ Tabla bitacora creada');

    console.log('🎉 Todas las tablas creadas exitosamente en SQL Server');

  } catch (error) {
    console.error('❌ Error creando tablas:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { createTables };