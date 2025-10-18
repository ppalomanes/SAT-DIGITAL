/**
 * Migración Multi-Tenancy para SQL Server
 *
 * Convierte el sistema a multi-tenant:
 * 1. Crea tabla tenants
 * 2. Agrega tenant_id a todas las tablas
 * 3. Crea índices para optimización
 * 4. Inserta tenant por defecto
 */

require('dotenv').config({ path: '.env.local' });
const sql = require('mssql');

const config = {
  server: process.env.SQLSERVER_HOST || 'localhost',
  port: parseInt(process.env.SQLSERVER_PORT) || 1433,
  database: process.env.SQLSERVER_DATABASE || 'sat_digital_v2',
  user: process.env.SQLSERVER_USERNAME || 'sa',
  password: process.env.SQLSERVER_PASSWORD || '',
  options: {
    encrypt: process.env.SQLSERVER_ENCRYPT === 'true',
    trustServerCertificate: process.env.SQLSERVER_TRUST_CERT === 'true',
    enableArithAbort: true
  }
};

async function up() {
  let pool;

  try {
    console.log('🚀 Iniciando migración multi-tenancy para SQL Server...\n');
    console.log('📡 Conectando a:', config.server, '- DB:', config.database);

    pool = await sql.connect(config);
    console.log('✅ Conexión establecida\n');

    // 1. Crear tabla tenants
    console.log('1️⃣ Creando tabla tenants...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tenants')
      BEGIN
        CREATE TABLE tenants (
          id INT IDENTITY(1,1) PRIMARY KEY,
          nombre NVARCHAR(100) NOT NULL,
          slug NVARCHAR(50) NOT NULL,
          dominio NVARCHAR(255) NULL,
          activo BIT NOT NULL DEFAULT 1,
          configuracion NVARCHAR(MAX) NULL, -- JSON
          metadata NVARCHAR(MAX) NULL, -- JSON
          fecha_inicio DATE NULL,
          fecha_fin DATE NULL,
          created_at DATETIME2 DEFAULT GETDATE(),
          updated_at DATETIME2 DEFAULT GETDATE(),
          CONSTRAINT UQ_tenants_nombre UNIQUE (nombre),
          CONSTRAINT UQ_tenants_slug UNIQUE (slug)
        );

        CREATE INDEX IX_tenants_slug ON tenants(slug);
        CREATE INDEX IX_tenants_activo ON tenants(activo);
        CREATE INDEX IX_tenants_dominio ON tenants(dominio);
      END
      ELSE
        PRINT 'Tabla tenants ya existe';
    `);
    console.log('✅ Tabla tenants creada\n');

    // 2. Insertar tenant por defecto
    console.log('2️⃣ Creando tenant por defecto...');
    const tenantResult = await pool.request().query(`
      IF NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'telecom')
      BEGIN
        INSERT INTO tenants (nombre, slug, activo, metadata, fecha_inicio)
        VALUES (
          'Telecom Argentina',
          'telecom',
          1,
          '{"tipo": "principal", "descripcion": "Tenant principal - Datos existentes"}',
          GETDATE()
        );
        SELECT SCOPE_IDENTITY() AS tenant_id;
      END
      ELSE
      BEGIN
        SELECT id AS tenant_id FROM tenants WHERE slug = 'telecom';
      END
    `);

    const defaultTenantId = tenantResult.recordset[0].tenant_id;
    console.log(`✅ Tenant por defecto: ID ${defaultTenantId}\n`);

    // 3. Tablas a actualizar con tenant_id
    const tablesToUpdate = [
      'usuarios',
      'proveedores',
      'sitios',
      'auditorias',
      'periodos_auditoria',
      'documentos',
      'conversaciones',
      'mensajes',
      'notificaciones_usuario',
      'asignaciones_auditor',
      'bitacora'
    ];

    console.log('3️⃣ Agregando tenant_id a tablas...');

    for (const table of tablesToUpdate) {
      try {
        // Verificar si la tabla existe
        const tableCheck = await pool.request().query(`
          SELECT COUNT(*) as count
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_NAME = '${table}'
        `);

        if (tableCheck.recordset[0].count === 0) {
          console.log(`⚠️  Tabla ${table} no existe, saltando...`);
          continue;
        }

        // Verificar si tenant_id ya existe
        const columnCheck = await pool.request().query(`
          SELECT COUNT(*) as count
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = '${table}' AND COLUMN_NAME = 'tenant_id'
        `);

        if (columnCheck.recordset[0].count > 0) {
          console.log(`ℹ️  Columna tenant_id ya existe en ${table}`);
          continue;
        }

        // Agregar columna tenant_id
        await pool.request().query(`
          ALTER TABLE ${table}
          ADD tenant_id INT NOT NULL DEFAULT ${defaultTenantId};
        `);

        // Agregar foreign key
        await pool.request().query(`
          ALTER TABLE ${table}
          ADD CONSTRAINT FK_${table}_tenant
          FOREIGN KEY (tenant_id) REFERENCES tenants(id)
          ON DELETE NO ACTION ON UPDATE CASCADE;
        `);

        // Agregar índice
        await pool.request().query(`
          CREATE INDEX IX_${table}_tenant_id ON ${table}(tenant_id);
        `);

        console.log(`✅ tenant_id agregado a ${table}`);
      } catch (error) {
        console.error(`❌ Error en tabla ${table}:`, error.message);
      }
    }

    // 4. Índices compuestos para optimización
    console.log('\n4️⃣ Creando índices compuestos...');

    const compositeIndexes = [
      {
        table: 'usuarios',
        name: 'IX_usuarios_tenant_email',
        columns: 'tenant_id, email'
      },
      {
        table: 'proveedores',
        name: 'IX_proveedores_tenant_activo',
        columns: 'tenant_id, activo'
      },
      {
        table: 'auditorias',
        name: 'IX_auditorias_tenant_periodo_estado',
        columns: 'tenant_id, periodo_id, estado'
      },
      {
        table: 'documentos',
        name: 'IX_documentos_tenant_auditoria',
        columns: 'tenant_id, auditoria_id'
      }
    ];

    for (const index of compositeIndexes) {
      try {
        // Verificar si la tabla existe
        const tableCheck = await pool.request().query(`
          SELECT COUNT(*) as count
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_NAME = '${index.table}'
        `);

        if (tableCheck.recordset[0].count === 0) {
          console.log(`⚠️  Tabla ${index.table} no existe, saltando índice...`);
          continue;
        }

        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = '${index.name}')
          CREATE INDEX ${index.name} ON ${index.table}(${index.columns});
        `);

        console.log(`✅ Índice ${index.name} creado`);
      } catch (error) {
        console.error(`❌ Error creando índice ${index.name}:`, error.message);
      }
    }

    // 5. Crear trigger para updated_at en tenants
    console.log('\n5️⃣ Creando trigger para updated_at...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_tenants_updated_at')
      BEGIN
        EXEC('
          CREATE TRIGGER TR_tenants_updated_at
          ON tenants
          AFTER UPDATE
          AS
          BEGIN
            SET NOCOUNT ON;
            UPDATE tenants
            SET updated_at = GETDATE()
            FROM tenants t
            INNER JOIN inserted i ON t.id = i.id;
          END
        ');
      END
    `);
    console.log('✅ Trigger created_at creado\n');

    console.log('✅ ¡Migración multi-tenancy completada exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   - Tabla tenants: ✅ Creada`);
    console.log(`   - Tenant por defecto: ✅ ID ${defaultTenantId}`);
    console.log(`   - Tablas actualizadas: ${tablesToUpdate.length}`);
    console.log(`   - Índices compuestos: ${compositeIndexes.length}`);
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Actualizar modelos Sequelize con tenant_id');
    console.log('   2. Implementar middleware tenant resolver');
    console.log('   3. Actualizar queries con tenant context');

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.close();
      console.log('\n📡 Conexión cerrada');
    }
  }
}

async function down() {
  let pool;

  try {
    console.log('⏪ Revirtiendo migración multi-tenancy...\n');

    pool = await sql.connect(config);

    const tablesToUpdate = [
      'usuarios', 'proveedores', 'sitios', 'auditorias',
      'periodos_auditoria', 'documentos', 'conversaciones',
      'mensajes', 'notificaciones_usuario', 'asignaciones_auditor', 'bitacora'
    ];

    // Eliminar foreign keys y columnas
    for (const table of tablesToUpdate) {
      try {
        await pool.request().query(`
          IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE WHERE CONSTRAINT_NAME = 'FK_${table}_tenant')
            ALTER TABLE ${table} DROP CONSTRAINT FK_${table}_tenant;

          IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_${table}_tenant_id')
            DROP INDEX IX_${table}_tenant_id ON ${table};

          IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}' AND COLUMN_NAME = 'tenant_id')
            ALTER TABLE ${table} DROP COLUMN tenant_id;
        `);
        console.log(`✅ tenant_id eliminado de ${table}`);
      } catch (error) {
        console.log(`ℹ️  Error en ${table}: ${error.message}`);
      }
    }

    // Eliminar trigger
    await pool.request().query(`
      IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_tenants_updated_at')
        DROP TRIGGER TR_tenants_updated_at;
    `);

    // Eliminar tabla tenants
    await pool.request().query('DROP TABLE IF EXISTS tenants;');
    console.log('✅ Tabla tenants eliminada\n');

  } catch (error) {
    console.error('❌ Error revirtiendo migración:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// Ejecutar migración
if (require.main === module) {
  const action = process.argv[2] || 'up';

  if (action === 'up') {
    up()
      .then(() => process.exit(0))
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
  } else if (action === 'down') {
    down()
      .then(() => process.exit(0))
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
  } else {
    console.log('Uso: node add-multi-tenancy-sqlserver.js [up|down]');
    process.exit(1);
  }
}

module.exports = { up, down };
