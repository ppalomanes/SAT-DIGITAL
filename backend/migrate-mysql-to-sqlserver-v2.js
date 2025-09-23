/**
 * Script de migración MySQL a SQL Server v2.0
 * Versión mejorada con manejo específico de tablas IDENTITY
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

// Configuraciones
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

class MySQLToSQLServerMigratorV2 {
  constructor() {
    this.mysqlConnection = null;
    this.sqlServerConnection = null;
    this.masterConnection = null;
  }

  async initialize() {
    console.log('🔄 Initializing migration connections v2.0...');

    // Conexión a MySQL
    this.mysqlConnection = new Sequelize(
      mysqlConfig.database,
      mysqlConfig.username,
      mysqlConfig.password,
      mysqlConfig
    );
    await this.mysqlConnection.authenticate();
    console.log('✅ MySQL connection established');

    // Conexión a SQL Server master
    this.masterConnection = new Sequelize(
      'master',
      sqlServerConfig.username,
      sqlServerConfig.password,
      { ...sqlServerConfig, database: 'master' }
    );
    await this.masterConnection.authenticate();
    console.log('✅ SQL Server master connection established');
  }

  async createDatabase() {
    console.log(`\n🏗️  Creating database '${sqlServerConfig.database}'...`);

    // Verificar y eliminar base de datos existente
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
  }

  async createTables() {
    console.log('\n🏗️  Creating SQL Server tables...');

    const createTablesSQL = `
      -- 1. Proveedores
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

      -- 2. Sitios
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

      -- 3. Usuarios
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

      -- 4. Secciones Técnicas
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

      -- 5. Auditorías
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

      -- 6. Documentos
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

      -- 7. Bitácora
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

      PRINT 'Core tables created successfully';
    `;

    await this.sqlServerConnection.query(createTablesSQL);
    console.log('✅ Core tables created successfully');
  }

  async migrateDataTable(tableName) {
    console.log(`\n📋 Migrating table: ${tableName}`);

    // Leer datos de MySQL
    const [mysqlData] = await this.mysqlConnection.query(`SELECT * FROM ${tableName}`);

    if (mysqlData.length === 0) {
      console.log(`   ⚠️  Table ${tableName} is empty - skipping`);
      return 0;
    }

    console.log(`   📊 Found ${mysqlData.length} records`);

    // Tablas con IDENTITY
    const identityTables = ['proveedores', 'sitios', 'usuarios', 'secciones_tecnicas', 'auditorias', 'documentos', 'bitacora'];
    const hasIdentity = identityTables.includes(tableName);

    if (hasIdentity) {
      await this.sqlServerConnection.query(`SET IDENTITY_INSERT [${tableName}] ON`);
    }

    try {
      // Insertar datos uno por uno para mejor control de errores
      let insertedCount = 0;

      for (const row of mysqlData) {
        try {
          const columns = Object.keys(row);
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (value instanceof Date) return `'${value.toISOString()}'`;
            if (typeof value === 'boolean') return value ? '1' : '0';
            return value;
          }).join(', ');

          const insertSQL = `
            INSERT INTO [${tableName}] ([${columns.join('], [')}])
            VALUES (${values})
          `;

          await this.sqlServerConnection.query(insertSQL);
          insertedCount++;

          if (insertedCount % 100 === 0) {
            console.log(`   ⏳ Inserted ${insertedCount}/${mysqlData.length} records...`);
          }

        } catch (error) {
          console.log(`   ⚠️  Failed to insert record ${insertedCount + 1}: ${error.message}`);
        }
      }

      console.log(`   ✅ Successfully migrated ${insertedCount}/${mysqlData.length} records`);
      return insertedCount;

    } finally {
      if (hasIdentity) {
        await this.sqlServerConnection.query(`SET IDENTITY_INSERT [${tableName}] OFF`);
      }
    }
  }

  async migrateAllData() {
    console.log('\n📦 Migrating data from MySQL to SQL Server...');

    // Orden de migración (respetando dependencias FK)
    const migrationOrder = [
      'proveedores',
      'sitios',
      'usuarios',
      'secciones_tecnicas',
      'auditorias',
      'documentos',
      'bitacora'
    ];

    let totalRecords = 0;

    for (const tableName of migrationOrder) {
      try {
        const count = await this.migrateDataTable(tableName);
        totalRecords += count;
      } catch (error) {
        console.error(`   ❌ Failed to migrate ${tableName}:`, error.message);
        // Continuar con la siguiente tabla
      }
    }

    console.log(`\n🎉 Migration completed! Total records migrated: ${totalRecords}`);
    return totalRecords;
  }

  async validateMigration() {
    console.log('\n🔍 Validating migration...');

    const tables = ['proveedores', 'sitios', 'usuarios', 'secciones_tecnicas', 'auditorias', 'documentos', 'bitacora'];
    let allMatch = true;

    for (const tableName of tables) {
      try {
        const [mysqlCount] = await this.mysqlConnection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        const [sqlServerCount] = await this.sqlServerConnection.query(`SELECT COUNT(*) as count FROM [${tableName}]`);

        const mysqlTotal = mysqlCount[0].count;
        const sqlServerTotal = sqlServerCount[0].count;

        if (mysqlTotal === sqlServerTotal) {
          console.log(`   ✅ ${tableName}: ${mysqlTotal} records (match)`);
        } else {
          console.log(`   ❌ ${tableName}: MySQL=${mysqlTotal}, SQL Server=${sqlServerTotal} (mismatch)`);
          allMatch = false;
        }
      } catch (error) {
        console.log(`   ⚠️  Could not validate ${tableName}: ${error.message}`);
      }
    }

    return allMatch;
  }

  async testConnection() {
    console.log('\n🧪 Testing SQL Server connection with SAT-Digital DAO...');

    // Cargar variables de entorno para SQL Server
    process.env.DB_TYPE = 'sqlserver';

    try {
      // Test básico de conexión
      const [result] = await this.sqlServerConnection.query(`
        SELECT
          COUNT(*) as TotalProveedores,
          (SELECT COUNT(*) FROM usuarios) as TotalUsuarios,
          (SELECT COUNT(*) FROM auditorias) as TotalAuditorias
      `);

      console.log('📊 Database Summary:');
      console.log(`   👥 Proveedores: ${result[0].TotalProveedores}`);
      console.log(`   🔐 Usuarios: ${result[0].TotalUsuarios}`);
      console.log(`   📋 Auditorías: ${result[0].TotalAuditorias}`);

      console.log('\n✅ SQL Server is ready for use with SAT-Digital!');
      console.log('💡 To switch to SQL Server, set: DB_TYPE=sqlserver');

    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
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
async function runMigrationV2() {
  const migrator = new MySQLToSQLServerMigratorV2();

  try {
    await migrator.initialize();
    await migrator.createDatabase();
    await migrator.createTables();
    const totalMigrated = await migrator.migrateAllData();
    const isValid = await migrator.validateMigration();
    await migrator.testConnection();

    console.log('\n🎉 Migration v2.0 completed successfully!');
    console.log(`📊 Total records migrated: ${totalMigrated}`);
    console.log(`✅ Validation: ${isValid ? 'PASSED' : 'FAILED'}`);

  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
  } finally {
    await migrator.cleanup();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runMigrationV2();
}

module.exports = { MySQLToSQLServerMigratorV2, runMigrationV2 };