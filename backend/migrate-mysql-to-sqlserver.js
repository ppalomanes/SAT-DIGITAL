/**
 * Script de migración de MySQL a SQL Server
 * Replica la estructura y datos de la base de datos SAT-Digital
 */

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Configuraciones de conexión
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'sat_digital_v2',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  dialect: 'mysql',
  logging: false
};

const sqlServerConfig = {
  host: process.env.SQLSERVER_HOST || 'dwin0293',
  port: parseInt(process.env.SQLSERVER_PORT) || 1433,
  database: process.env.SQLSERVER_DATABASE || 'sat_digital_v2',
  username: process.env.SQLSERVER_USERNAME || 'calidad',
  password: process.env.SQLSERVER_PASSWORD || 'passcalidad',
  dialect: 'mssql',
  logging: false,
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true
    }
  }
};

class MySQLToSQLServerMigrator {
  constructor() {
    this.mysqlConnection = null;
    this.sqlServerConnection = null;
    this.masterConnection = null;
  }

  async initialize() {
    console.log('🔄 Initializing migration connections...');

    try {
      // Conexión a MySQL
      this.mysqlConnection = new Sequelize(
        mysqlConfig.database,
        mysqlConfig.username,
        mysqlConfig.password,
        mysqlConfig
      );
      await this.mysqlConnection.authenticate();
      console.log('✅ MySQL connection established');

      // Conexión a SQL Server master (para crear BD)
      this.masterConnection = new Sequelize(
        'master',
        sqlServerConfig.username,
        sqlServerConfig.password,
        { ...sqlServerConfig, database: 'master' }
      );
      await this.masterConnection.authenticate();
      console.log('✅ SQL Server master connection established');

    } catch (error) {
      console.error('❌ Failed to initialize connections:', error.message);
      throw error;
    }
  }

  async createDatabase() {
    console.log(`\n🏗️  Creating database '${sqlServerConfig.database}'...`);

    try {
      // Verificar si la base de datos ya existe
      const [existing] = await this.masterConnection.query(`
        SELECT name FROM sys.databases WHERE name = '${sqlServerConfig.database}'
      `);

      if (existing.length > 0) {
        console.log(`⚠️  Database '${sqlServerConfig.database}' already exists. Dropping it...`);
        await this.masterConnection.query(`
          IF EXISTS(SELECT * FROM sys.databases WHERE name = '${sqlServerConfig.database}')
          BEGIN
            ALTER DATABASE [${sqlServerConfig.database}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
            DROP DATABASE [${sqlServerConfig.database}];
          END
        `);
      }

      // Crear nueva base de datos
      await this.masterConnection.query(`
        CREATE DATABASE [${sqlServerConfig.database}]
        COLLATE SQL_Latin1_General_CP1_CI_AS;
      `);

      console.log(`✅ Database '${sqlServerConfig.database}' created successfully`);

      // Conectar a la nueva base de datos
      this.sqlServerConnection = new Sequelize(
        sqlServerConfig.database,
        sqlServerConfig.username,
        sqlServerConfig.password,
        sqlServerConfig
      );
      await this.sqlServerConnection.authenticate();
      console.log('✅ Connected to new SQL Server database');

    } catch (error) {
      console.error('❌ Failed to create database:', error.message);
      throw error;
    }
  }

  async getTableStructure() {
    console.log('\n📋 Analyzing MySQL table structure...');

    try {
      // Obtener lista de tablas
      const [tables] = await this.mysqlConnection.query(`
        SELECT TABLE_NAME, TABLE_COMMENT
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = '${mysqlConfig.database}'
          AND TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `);

      console.log(`📊 Found ${tables.length} tables to migrate:`);
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.TABLE_NAME}`);
      });

      return tables;
    } catch (error) {
      console.error('❌ Failed to analyze table structure:', error.message);
      throw error;
    }
  }

  async createTableStructure() {
    console.log('\n🏗️  Creating SQL Server table structure...');

    const createTableSQL = `
      -- Crear tabla de proveedores
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[proveedores]') AND type in (N'U'))
      BEGIN
        CREATE TABLE [dbo].[proveedores] (
          [id] int IDENTITY(1,1) NOT NULL,
          [razon_social] nvarchar(255) NOT NULL,
          [cuit] nvarchar(15) NOT NULL,
          [nombre_comercial] nvarchar(255) NULL,
          [contacto_principal] nvarchar(255) NULL,
          [email_contacto] nvarchar(255) NULL,
          [telefono] nvarchar(50) NULL,
          [estado] nvarchar(10) NOT NULL DEFAULT 'activo',
          [created_at] datetime2 NOT NULL DEFAULT GETDATE(),
          [updated_at] datetime2 NOT NULL DEFAULT GETDATE(),
          CONSTRAINT [PK_proveedores] PRIMARY KEY ([id]),
          CONSTRAINT [UQ_proveedores_cuit] UNIQUE ([cuit])
        );
      END

      -- Crear tabla de sitios
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sitios]') AND type in (N'U'))
      BEGIN
        CREATE TABLE [dbo].[sitios] (
          [id] int IDENTITY(1,1) NOT NULL,
          [proveedor_id] int NOT NULL,
          [nombre] nvarchar(255) NOT NULL,
          [localidad] nvarchar(255) NOT NULL,
          [domicilio] nvarchar(500) NULL,
          [estado] nvarchar(10) NOT NULL DEFAULT 'activo',
          [created_at] datetime2 NOT NULL DEFAULT GETDATE(),
          [updated_at] datetime2 NOT NULL DEFAULT GETDATE(),
          CONSTRAINT [PK_sitios] PRIMARY KEY ([id]),
          CONSTRAINT [FK_sitios_proveedor] FOREIGN KEY ([proveedor_id]) REFERENCES [dbo].[proveedores]([id])
        );
      END

      -- Crear tabla de usuarios
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usuarios]') AND type in (N'U'))
      BEGIN
        CREATE TABLE [dbo].[usuarios] (
          [id] int IDENTITY(1,1) NOT NULL,
          [email] nvarchar(255) NOT NULL,
          [password_hash] nvarchar(255) NOT NULL,
          [nombre] nvarchar(255) NOT NULL,
          [rol] nvarchar(50) NOT NULL,
          [proveedor_id] int NULL,
          [estado] nvarchar(20) NOT NULL DEFAULT 'activo',
          [ultimo_acceso] datetime2 NULL,
          [intentos_fallidos] int NOT NULL DEFAULT 0,
          [token_refresh] nvarchar(500) NULL,
          [created_at] datetime2 NOT NULL DEFAULT GETDATE(),
          [updated_at] datetime2 NOT NULL DEFAULT GETDATE(),
          CONSTRAINT [PK_usuarios] PRIMARY KEY ([id]),
          CONSTRAINT [UQ_usuarios_email] UNIQUE ([email]),
          CONSTRAINT [FK_usuarios_proveedor] FOREIGN KEY ([proveedor_id]) REFERENCES [dbo].[proveedores]([id])
        );
      END

      -- Crear tabla de secciones técnicas
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[secciones_tecnicas]') AND type in (N'U'))
      BEGIN
        CREATE TABLE [dbo].[secciones_tecnicas] (
          [id] int IDENTITY(1,1) NOT NULL,
          [codigo] nvarchar(50) NOT NULL,
          [nombre] nvarchar(255) NOT NULL,
          [descripcion] ntext NULL,
          [tipo_analisis] nvarchar(20) NOT NULL,
          [obligatoria] bit NOT NULL DEFAULT 0,
          [orden_presentacion] int NOT NULL,
          [estado] nvarchar(10) NOT NULL DEFAULT 'activa',
          CONSTRAINT [PK_secciones_tecnicas] PRIMARY KEY ([id]),
          CONSTRAINT [UQ_secciones_codigo] UNIQUE ([codigo])
        );
      END

      -- Crear tabla de auditorías
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[auditorias]') AND type in (N'U'))
      BEGIN
        CREATE TABLE [dbo].[auditorias] (
          [id] int IDENTITY(1,1) NOT NULL,
          [sitio_id] int NOT NULL,
          [periodo] nvarchar(20) NOT NULL,
          [fecha_inicio] date NOT NULL,
          [fecha_limite_carga] date NOT NULL,
          [fecha_visita_programada] date NULL,
          [fecha_visita_realizada] date NULL,
          [auditor_asignado_id] int NULL,
          [estado] nvarchar(30) NOT NULL DEFAULT 'programada',
          [puntaje_final] decimal(5,2) NULL,
          [observaciones_generales] ntext NULL,
          [created_at] datetime2 NOT NULL DEFAULT GETDATE(),
          [updated_at] datetime2 NOT NULL DEFAULT GETDATE(),
          CONSTRAINT [PK_auditorias] PRIMARY KEY ([id]),
          CONSTRAINT [FK_auditorias_sitio] FOREIGN KEY ([sitio_id]) REFERENCES [dbo].[sitios]([id]),
          CONSTRAINT [FK_auditorias_auditor] FOREIGN KEY ([auditor_asignado_id]) REFERENCES [dbo].[usuarios]([id]),
          CONSTRAINT [UQ_auditorias_sitio_periodo] UNIQUE ([sitio_id], [periodo])
        );
      END

      -- Crear tabla de documentos
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[documentos]') AND type in (N'U'))
      BEGIN
        CREATE TABLE [dbo].[documentos] (
          [id] int IDENTITY(1,1) NOT NULL,
          [auditoria_id] int NOT NULL,
          [seccion_id] int NOT NULL,
          [nombre_archivo] nvarchar(255) NOT NULL,
          [nombre_original] nvarchar(255) NOT NULL,
          [tipo_archivo] nvarchar(10) NOT NULL,
          [tamaño_bytes] bigint NOT NULL,
          [ruta_almacenamiento] nvarchar(500) NOT NULL,
          [hash_archivo] nvarchar(64) NOT NULL,
          [version] int NOT NULL DEFAULT 1,
          [fecha_ultima_revision] date NULL,
          [observaciones_carga] ntext NULL,
          [usuario_carga_id] int NOT NULL,
          [estado_analisis] nvarchar(20) NOT NULL DEFAULT 'pendiente',
          [created_at] datetime2 NOT NULL DEFAULT GETDATE(),
          CONSTRAINT [PK_documentos] PRIMARY KEY ([id]),
          CONSTRAINT [FK_documentos_auditoria] FOREIGN KEY ([auditoria_id]) REFERENCES [dbo].[auditorias]([id]),
          CONSTRAINT [FK_documentos_seccion] FOREIGN KEY ([seccion_id]) REFERENCES [dbo].[secciones_tecnicas]([id]),
          CONSTRAINT [FK_documentos_usuario] FOREIGN KEY ([usuario_carga_id]) REFERENCES [dbo].[usuarios]([id])
        );
      END

      -- Crear tabla de bitácora
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[bitacora]') AND type in (N'U'))
      BEGIN
        CREATE TABLE [dbo].[bitacora] (
          [id] bigint IDENTITY(1,1) NOT NULL,
          [usuario_id] int NULL,
          [accion] nvarchar(100) NOT NULL,
          [entidad_tipo] nvarchar(50) NOT NULL,
          [entidad_id] int NULL,
          [descripcion] ntext NOT NULL,
          [datos_antes] nvarchar(max) NULL,
          [datos_despues] nvarchar(max) NULL,
          [ip_address] nvarchar(45) NULL,
          [user_agent] nvarchar(500) NULL,
          [timestamp] datetime2 NOT NULL DEFAULT GETDATE(),
          CONSTRAINT [PK_bitacora] PRIMARY KEY ([id]),
          CONSTRAINT [FK_bitacora_usuario] FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[usuarios]([id])
        );
      END

      PRINT 'Tables created successfully';
    `;

    try {
      await this.sqlServerConnection.query(createTableSQL);
      console.log('✅ SQL Server table structure created successfully');
    } catch (error) {
      console.error('❌ Failed to create table structure:', error.message);
      throw error;
    }
  }

  async migrateData() {
    console.log('\n📦 Migrating data from MySQL to SQL Server...');

    // Tablas en orden de dependencias
    const tables = [
      'proveedores',
      'sitios',
      'usuarios',
      'secciones_tecnicas',
      'auditorias',
      'documentos',
      'bitacora'
    ];

    let totalRecords = 0;

    for (const tableName of tables) {
      try {
        console.log(`\n📋 Migrating table: ${tableName}`);

        // Leer datos de MySQL
        const [mysqlData] = await this.mysqlConnection.query(`SELECT * FROM ${tableName}`);

        if (mysqlData.length === 0) {
          console.log(`   ⚠️  Table ${tableName} is empty - skipping`);
          continue;
        }

        console.log(`   📊 Found ${mysqlData.length} records`);

        // Limpiar tabla SQL Server si tiene datos
        await this.sqlServerConnection.query(`DELETE FROM [${tableName}]`);

        // Si la tabla tiene IDENTITY, habilitar inserción de valores explícitos
        const identityTables = ['proveedores', 'sitios', 'usuarios', 'secciones_tecnicas', 'auditorias', 'documentos', 'bitacora'];
        if (identityTables.includes(tableName)) {
          await this.sqlServerConnection.query(`SET IDENTITY_INSERT [${tableName}] ON`);
        }

        // Insertar datos en lotes para mejor rendimiento
        const batchSize = 100;
        let insertedCount = 0;

        for (let i = 0; i < mysqlData.length; i += batchSize) {
          const batch = mysqlData.slice(i, i + batchSize);

          // Preparar valores para inserción
          const columns = Object.keys(batch[0]);
          const values = batch.map(row =>
            `(${columns.map(col => {
              const value = row[col];
              if (value === null) return 'NULL';
              if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
              if (value instanceof Date) return `'${value.toISOString()}'`;
              if (typeof value === 'boolean') return value ? '1' : '0';
              return value;
            }).join(', ')})`
          ).join(', ');

          const insertSQL = `
            INSERT INTO [${tableName}] ([${columns.join('], [')}])
            VALUES ${values}
          `;

          await this.sqlServerConnection.query(insertSQL);
          insertedCount += batch.length;

          if (insertedCount % 500 === 0) {
            console.log(`   ⏳ Inserted ${insertedCount}/${mysqlData.length} records...`);
          }
        }

        // Deshabilitar IDENTITY_INSERT después de la inserción
        if (identityTables.includes(tableName)) {
          await this.sqlServerConnection.query(`SET IDENTITY_INSERT [${tableName}] OFF`);
        }

        console.log(`   ✅ Successfully migrated ${insertedCount} records`);
        totalRecords += insertedCount;

      } catch (error) {
        console.error(`   ❌ Failed to migrate table ${tableName}:`, error.message);
        throw error;
      }
    }

    console.log(`\n🎉 Migration completed! Total records migrated: ${totalRecords}`);
  }

  async validateMigration() {
    console.log('\n🔍 Validating migration...');

    try {
      const tables = ['proveedores', 'sitios', 'usuarios', 'secciones_tecnicas', 'auditorias', 'documentos', 'bitacora'];

      for (const tableName of tables) {
        const [mysqlCount] = await this.mysqlConnection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        const [sqlServerCount] = await this.sqlServerConnection.query(`SELECT COUNT(*) as count FROM [${tableName}]`);

        const mysqlTotal = mysqlCount[0].count;
        const sqlServerTotal = sqlServerCount[0].count;

        if (mysqlTotal === sqlServerTotal) {
          console.log(`   ✅ ${tableName}: ${mysqlTotal} records (match)`);
        } else {
          console.log(`   ❌ ${tableName}: MySQL=${mysqlTotal}, SQL Server=${sqlServerTotal} (mismatch)`);
        }
      }

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      throw error;
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up connections...');

    if (this.mysqlConnection) {
      await this.mysqlConnection.close();
      console.log('   ✅ MySQL connection closed');
    }

    if (this.sqlServerConnection) {
      await this.sqlServerConnection.close();
      console.log('   ✅ SQL Server connection closed');
    }

    if (this.masterConnection) {
      await this.masterConnection.close();
      console.log('   ✅ SQL Server master connection closed');
    }
  }
}

// Ejecutar migración
async function runMigration() {
  const migrator = new MySQLToSQLServerMigrator();

  try {
    await migrator.initialize();
    await migrator.createDatabase();
    await migrator.getTableStructure();
    await migrator.createTableStructure();
    await migrator.migrateData();
    await migrator.validateMigration();

    console.log('\n🎉 Migration completed successfully!');
    console.log('💡 You can now use DB_TYPE=sqlserver to use SQL Server database');

  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    console.error(error.stack);
  } finally {
    await migrator.cleanup();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runMigration();
}

module.exports = { MySQLToSQLServerMigrator, runMigration };