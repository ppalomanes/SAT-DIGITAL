/**
 * Script de Configuración del Sistema de Autenticación
 * Checkpoint 1.3 - Ejecutar migración y verificar setup
 * 
 * @author SAT-Digital Team
 * @version 1.0.0
 */

const { sequelize, Usuario, Proveedor } = require('../src/shared/database/models');
const bcrypt = require('bcryptjs');
const logger = require('../src/shared/utils/logger');
const fs = require('fs').promises;
const path = require('path');

async function setupAuthSystem() {
  try {
    console.log('🔧 Configurando sistema de autenticación SAT-Digital...');

    // 1. Verificar conexión a base de datos
    console.log('📊 Verificando conexión a MySQL...');
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL exitosa');

    // 2. Ejecutar migración de roles (si es necesario)
    console.log('🔄 Aplicando migración de roles...');
    
    // Leer y ejecutar script SQL de migración
    const migrationPath = path.join(__dirname, '..', 'migrations', 'update_usuarios_roles.sql');
    
    try {
      const migrationSQL = await fs.readFile(migrationPath, 'utf8');
      
      // Ejecutar cada comando SQL por separado
      const commands = migrationSQL
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      for (const command of commands) {
        if (command.includes('ALTER TABLE') || command.includes('UPDATE') || command.includes('CREATE INDEX')) {
          try {
            await sequelize.query(command);
            console.log(`✅ Ejecutado: ${command.substring(0, 50)}...`);
          } catch (error) {
            if (error.message.includes('Duplicate column name') || 
                error.message.includes('Unknown column') ||
                error.message.includes('Duplicate key name')) {
              console.log(`⚠️  Ya aplicado: ${command.substring(0, 50)}...`);
            } else {
              throw error;
            }
          }
        }
      }
    } catch (fileError) {
      console.log('⚠️  Migración SQL no encontrada, continuando...');
    }

    // 3. Sincronizar modelos (sin force para mantener datos)
    console.log('🔄 Sincronizando modelos de base de datos...');
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados');

    // 4. Verificar proveedores existentes
    console.log('🏢 Verificando proveedores...');
    const proveedores = await Proveedor.findAll();
    console.log(`✅ ${proveedores.length} proveedores encontrados`);

    // 5. Verificar usuarios existentes
    console.log('👤 Verificando usuarios...');
    const usuarios = await Usuario.findAll({
      include: [{
        model: Proveedor,
        as: 'proveedor',
        required: false
      }]
    });

    console.log(`✅ ${usuarios.length} usuarios encontrados:`);
    usuarios.forEach(usuario => {
      console.log(`   - ${usuario.email} (${usuario.rol})`);
    });

    // 6. Crear usuario admin si no existe
    console.log('🔐 Verificando usuario administrador...');
    let adminUser = await Usuario.findOne({ where: { rol: 'admin' } });
    
    if (!adminUser) {
      console.log('👤 Creando usuario administrador...');
      const adminPassword = 'Admin123!';
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      
      adminUser = await Usuario.create({
        email: 'admin@sat-digital.com',
        password_hash: passwordHash,
        nombre: 'Administrador SAT-Digital',
        rol: 'admin',
        estado: 'activo'
      });

      console.log('✅ Usuario administrador creado:');
      console.log(`   Email: admin@sat-digital.com`);
      console.log(`   Password: ${adminPassword}`);
      console.log('   ⚠️  CAMBIAR PASSWORD EN PRODUCCIÓN');
    } else {
      console.log('✅ Usuario administrador existe');
    }

    // 7. Información final
    console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
    console.log('================================');
    console.log('Sistema de autenticación SAT-Digital listo');
    console.log('');
    console.log('📍 Endpoints disponibles:');
    console.log('   POST /api/v1/auth/login');
    console.log('   POST /api/v1/auth/refresh');
    console.log('   POST /api/v1/auth/register (solo admin)');
    console.log('   POST /api/v1/auth/logout');
    console.log('   GET  /api/v1/auth/me');
    console.log('   GET  /api/v1/auth/roles (solo admin)');
    console.log('   GET  /api/v1/auth/health');

  } catch (error) {
    console.error('❌ Error configurando sistema de autenticación:', error);
    throw error;
  }
}

// Ejecutar setup si se llama directamente
if (require.main === module) {
  setupAuthSystem()
    .then(() => {
      console.log('\n✅ Setup completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Setup falló:', error);
      process.exit(1);
    });
}

module.exports = setupAuthSystem;
