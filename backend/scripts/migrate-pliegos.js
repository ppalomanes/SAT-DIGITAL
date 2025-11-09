/**
 * Migración: Creación de tabla pliegos_requisitos
 *
 * Descripción:
 * Sistema centralizado de definición de requisitos técnicos que aplican
 * a períodos completos de auditoría (multi-tenant).
 *
 * Un Pliego define los umbrales mínimos para:
 * - Parque Informático (CPU, RAM, SSD, Headsets)
 * - Conectividad (Velocidades internet hogar/sitio)
 * - Infraestructura (UPS, Generador, Climatización)
 * - Seguridad (Controles obligatorios)
 *
 * Los Períodos de Auditoría se asocian a un Pliego, y todas las auditorías
 * de ese período heredan los mismos requisitos, garantizando consistencia.
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.SQLSERVER_DATABASE,
  process.env.SQLSERVER_USERNAME,
  process.env.SQLSERVER_PASSWORD,
  {
    host: process.env.SQLSERVER_HOST,
    port: parseInt(process.env.SQLSERVER_PORT) || 1433,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: process.env.SQLSERVER_ENCRYPT === 'true',
        trustServerCertificate: process.env.SQLSERVER_TRUST_CERT !== 'false'
      }
    },
    logging: console.log
  }
);

async function migrate() {
  try {
    console.log('🔄 Conectando a SQL Server...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // ========================================================================
    // TABLA: pliegos_requisitos
    // ========================================================================
    console.log('📋 Creando tabla pliegos_requisitos...');

    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pliegos_requisitos')
      CREATE TABLE pliegos_requisitos (
        id INT PRIMARY KEY IDENTITY(1,1),
        tenant_id INT NOT NULL,

        -- Identificación del pliego
        codigo NVARCHAR(50) NOT NULL,
        nombre NVARCHAR(200) NOT NULL,
        descripcion NVARCHAR(MAX),

        -- Vigencia
        vigencia_desde DATE NOT NULL,
        vigencia_hasta DATE NULL,

        -- Estado
        estado NVARCHAR(20) NOT NULL DEFAULT 'borrador',
        -- Estados: 'borrador', 'activo', 'vencido', 'archivado'

        es_vigente BIT NOT NULL DEFAULT 0,
        -- Solo un pliego puede estar marcado como vigente a la vez por tenant

        -- Configuraciones por sección técnica (JSON)
        parque_informatico NVARCHAR(MAX) NULL,
        conectividad NVARCHAR(MAX) NULL,
        infraestructura NVARCHAR(MAX) NULL,
        seguridad NVARCHAR(MAX) NULL,
        documentacion NVARCHAR(MAX) NULL,
        personal NVARCHAR(MAX) NULL,

        -- Archivo de headsets homologados
        archivo_headsets_path NVARCHAR(500) NULL,
        archivo_headsets_nombre NVARCHAR(200) NULL,
        total_headsets INT NULL DEFAULT 0,

        -- Auditoría
        creado_por INT NULL,
        creado_en DATETIME NOT NULL DEFAULT GETDATE(),
        modificado_por INT NULL,
        modificado_en DATETIME NULL,

        -- Versión para control de cambios
        version INT NOT NULL DEFAULT 1,
        pliego_padre_id INT NULL,
        -- Para duplicar pliegos y mantener trazabilidad

        activo BIT NOT NULL DEFAULT 1
      );
    `);

    console.log('✅ Tabla pliegos_requisitos creada\n');

    // Crear índices
    console.log('📊 Creando índices...');

    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_pliegos_tenant')
      CREATE INDEX idx_pliegos_tenant ON pliegos_requisitos(tenant_id);
    `);

    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_pliegos_vigente')
      CREATE INDEX idx_pliegos_vigente ON pliegos_requisitos(tenant_id, es_vigente);
    `);

    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_pliegos_codigo')
      CREATE INDEX idx_pliegos_codigo ON pliegos_requisitos(tenant_id, codigo);
    `);

    console.log('✅ Índices creados\n');

    // ========================================================================
    // TABLA: pliegos_historial
    // ========================================================================
    console.log('📋 Creando tabla pliegos_historial...');

    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pliegos_historial')
      CREATE TABLE pliegos_historial (
        id INT PRIMARY KEY IDENTITY(1,1),
        pliego_id INT NOT NULL,

        version INT NOT NULL,

        -- Snapshot completo del pliego en esta versión
        pliego_snapshot NVARCHAR(MAX) NOT NULL,

        -- Descripción de cambios
        cambios_descripcion NVARCHAR(MAX) NULL,
        cambios_diff NVARCHAR(MAX) NULL,

        -- Quién hizo el cambio
        usuario_id INT NULL,
        fecha DATETIME NOT NULL DEFAULT GETDATE()
      );
    `);

    console.log('✅ Tabla pliegos_historial creada\n');

    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_historial_pliego')
      CREATE INDEX idx_historial_pliego ON pliegos_historial(pliego_id, version);
    `);

    // ========================================================================
    // MODIFICAR TABLA: periodos_auditoria
    // ========================================================================
    console.log('📋 Añadiendo pliego_requisitos_id a periodos_auditoria...');

    await sequelize.query(`
      IF NOT EXISTS (
        SELECT * FROM sys.columns
        WHERE object_id = OBJECT_ID('periodos_auditoria')
        AND name = 'pliego_requisitos_id'
      )
      ALTER TABLE periodos_auditoria ADD pliego_requisitos_id INT NULL;
    `);

    console.log('✅ Campo pliego_requisitos_id añadido\n');

    // ========================================================================
    // CREAR PLIEGO POR DEFECTO
    // ========================================================================
    console.log('📋 Creando pliego por defecto...');

    const requisitosDefecto = {
      procesador: {
        marcasAceptadas: ['Intel', 'AMD'],
        modelosMinimos: ['i5', 'i7', 'Ryzen 5', 'Ryzen 7'],
        velocidadMinima: 2.0,
        nucleosMinimos: 4
      },
      memoria: {
        capacidadMinima: 8,
        tiposAceptados: ['DDR4', 'DDR5']
      },
      almacenamiento: {
        opcionesValidas: [
          { tipo: 'SSD', capacidadMinima: 240 },
          { tipo: 'NVMe', capacidadMinima: 240 }
        ]
      },
      sistemaOperativo: {
        versionesAceptadas: ['Windows 10', 'Windows 11'],
        edicionesAceptadas: ['Pro', 'Enterprise', 'Home']
      },
      headset: {
        validacionEstricta: true,
        tiposConexion: ['USB', 'Bluetooth', '3.5mm', 'QD']
      }
    };

    await sequelize.query(`
      IF NOT EXISTS (SELECT * FROM pliegos_requisitos WHERE codigo = 'DEFAULT-2025')
      INSERT INTO pliegos_requisitos (
        tenant_id, codigo, nombre, descripcion,
        vigencia_desde, estado, es_vigente,
        parque_informatico, version
      ) VALUES (
        1,
        'DEFAULT-2025',
        'Requisitos Técnicos Estándar 2025',
        'Pliego de requisitos técnicos por defecto para auditorías 2025',
        GETDATE(),
        'activo',
        1,
        '${JSON.stringify(requisitosDefecto).replace(/'/g, "''")}',
        1
      );
    `);

    console.log('✅ Pliego por defecto creado\n');

    console.log('🎉 ¡Migración completada exitosamente!\n');
    console.log('📊 Tablas creadas:');
    console.log('   ✓ pliegos_requisitos');
    console.log('   ✓ pliegos_historial');
    console.log('   ✓ periodos_auditoria (modificada)');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

migrate();
