/**
 * Migración: Implementar Multi-Tenancy
 *
 * Esta migración convierte el sistema a multi-tenant agregando:
 * 1. Tabla tenants
 * 2. Columna tenant_id a todas las tablas relevantes
 * 3. Índices para optimizar queries por tenant
 * 4. Tenant por defecto para datos existentes
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'sat_digital',
  port: parseInt(process.env.DB_PORT) || 3306
};

async function up() {
  const connection = await mysql.createConnection(DB_CONFIG);

  try {
    console.log('🚀 Iniciando migración multi-tenancy...\n');

    // 1. Crear tabla tenants
    console.log('1️⃣ Creando tabla tenants...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre de la organización',
        slug VARCHAR(50) NOT NULL UNIQUE COMMENT 'Identificador único para routing',
        dominio VARCHAR(255) NULL COMMENT 'Dominio personalizado',
        activo BOOLEAN DEFAULT TRUE NOT NULL,
        configuracion JSON NULL COMMENT 'Configuración específica del tenant',
        metadata JSON NULL COMMENT 'Metadata adicional',
        fecha_inicio DATE NULL,
        fecha_fin DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_activo (activo),
        INDEX idx_dominio (dominio)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      COMMENT='Tabla de tenants para multi-tenancy';
    `);
    console.log('✅ Tabla tenants creada\n');

    // 2. Insertar tenant por defecto (para datos existentes)
    console.log('2️⃣ Creando tenant por defecto...');
    const [tenantResult] = await connection.query(`
      INSERT INTO tenants (nombre, slug, activo, metadata, fecha_inicio)
      VALUES (
        'Telecom Argentina',
        'telecom',
        TRUE,
        '{"tipo": "principal", "descripcion": "Tenant principal - Datos existentes"}',
        NOW()
      )
      ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);
    `);
    const defaultTenantId = tenantResult.insertId;
    console.log(`✅ Tenant por defecto creado (ID: ${defaultTenantId})\n`);

    // 3. Tablas a las que agregar tenant_id
    const tablesToUpdate = [
      { name: 'usuarios', foreignKey: 'user_id' },
      { name: 'proveedores', foreignKey: 'proveedor_id' },
      { name: 'sitios', foreignKey: 'sitio_id' },
      { name: 'auditorias', foreignKey: 'auditoria_id' },
      { name: 'periodos', foreignKey: 'periodo_id' },
      { name: 'documentos', foreignKey: 'documento_id' },
      { name: 'conversaciones', foreignKey: 'conversacion_id' },
      { name: 'mensajes', foreignKey: 'mensaje_id' },
      { name: 'notificaciones', foreignKey: 'notificacion_id' },
      { name: 'asignaciones_auditor', foreignKey: 'asignacion_id' },
      { name: 'bitacora', foreignKey: 'bitacora_id' }
    ];

    console.log('3️⃣ Agregando tenant_id a tablas...');

    for (const table of tablesToUpdate) {
      try {
        // Verificar si la tabla existe
        const [tables] = await connection.query(`
          SHOW TABLES LIKE '${table.name}'
        `);

        if (tables.length === 0) {
          console.log(`⚠️  Tabla ${table.name} no existe, saltando...`);
          continue;
        }

        // Verificar si tenant_id ya existe
        const [columns] = await connection.query(`
          SHOW COLUMNS FROM ${table.name} LIKE 'tenant_id'
        `);

        if (columns.length > 0) {
          console.log(`ℹ️  Columna tenant_id ya existe en ${table.name}, saltando...`);
          continue;
        }

        // Agregar columna tenant_id
        await connection.query(`
          ALTER TABLE ${table.name}
          ADD COLUMN tenant_id INT NOT NULL DEFAULT ${defaultTenantId} COMMENT 'ID del tenant propietario',
          ADD CONSTRAINT fk_${table.name}_tenant
            FOREIGN KEY (tenant_id) REFERENCES tenants(id)
            ON DELETE RESTRICT ON UPDATE CASCADE,
          ADD INDEX idx_${table.name}_tenant (tenant_id);
        `);

        console.log(`✅ tenant_id agregado a ${table.name}`);
      } catch (error) {
        console.error(`❌ Error en tabla ${table.name}:`, error.message);
      }
    }

    console.log('\n4️⃣ Creando índices compuestos para optimización...');

    // Índices compuestos importantes para queries multi-tenant
    const compositeIndexes = [
      { table: 'usuarios', columns: ['tenant_id', 'email'], name: 'idx_tenant_email' },
      { table: 'proveedores', columns: ['tenant_id', 'activo'], name: 'idx_tenant_activo' },
      { table: 'auditorias', columns: ['tenant_id', 'periodo_id', 'estado'], name: 'idx_tenant_periodo_estado' },
      { table: 'documentos', columns: ['tenant_id', 'auditoria_id'], name: 'idx_tenant_auditoria' }
    ];

    for (const index of compositeIndexes) {
      try {
        await connection.query(`
          CREATE INDEX ${index.name} ON ${index.table} (${index.columns.join(', ')});
        `);
        console.log(`✅ Índice ${index.name} creado en ${index.table}`);
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log(`ℹ️  Índice ${index.name} ya existe`);
        } else {
          console.error(`❌ Error creando índice ${index.name}:`, error.message);
        }
      }
    }

    console.log('\n✅ ¡Migración multi-tenancy completada exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   - Tabla tenants: ✅ Creada`);
    console.log(`   - Tenant por defecto: ✅ ID ${defaultTenantId}`);
    console.log(`   - Tablas actualizadas: ${tablesToUpdate.length}`);
    console.log(`   - Índices compuestos: ${compositeIndexes.length}`);
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Actualizar modelos Sequelize con tenant_id');
    console.log('   2. Implementar middleware de tenant resolution');
    console.log('   3. Actualizar queries para incluir tenant context');

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

async function down() {
  const connection = await mysql.createConnection(DB_CONFIG);

  try {
    console.log('⏪ Revirtiendo migración multi-tenancy...\n');

    const tablesToUpdate = [
      'usuarios', 'proveedores', 'sitios', 'auditorias', 'periodos',
      'documentos', 'conversaciones', 'mensajes', 'notificaciones',
      'asignaciones_auditor', 'bitacora'
    ];

    // Eliminar foreign keys y columnas tenant_id
    for (const table of tablesToUpdate) {
      try {
        await connection.query(`
          ALTER TABLE ${table}
          DROP FOREIGN KEY fk_${table}_tenant,
          DROP INDEX idx_${table}_tenant,
          DROP COLUMN tenant_id;
        `);
        console.log(`✅ tenant_id eliminado de ${table}`);
      } catch (error) {
        console.log(`ℹ️  No se pudo eliminar tenant_id de ${table}: ${error.message}`);
      }
    }

    // Eliminar tabla tenants
    await connection.query('DROP TABLE IF EXISTS tenants;');
    console.log('✅ Tabla tenants eliminada\n');

  } catch (error) {
    console.error('❌ Error revirtiendo migración:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Ejecutar migración
if (require.main === module) {
  const action = process.argv[2] || 'up';

  if (action === 'up') {
    up().catch(console.error);
  } else if (action === 'down') {
    down().catch(console.error);
  } else {
    console.log('Uso: node add-multi-tenancy.js [up|down]');
  }
}

module.exports = { up, down };
