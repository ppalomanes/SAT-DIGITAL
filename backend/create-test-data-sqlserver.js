/**
 * Script para crear datos de prueba básicos en SQL Server
 * Sin usar IDENTITY_INSERT, insertando datos nuevos
 */

require('dotenv').config({ path: '.env.sqlserver' });
const { Sequelize } = require('sequelize');

async function createTestData() {
  console.log('🔄 Creando datos de prueba en SQL Server...');

  // Configuración SQL Server
  const sequelize = new Sequelize(
    'sat_digital_v2',
    'calidad',
    'passcalidad',
    {
      host: 'dwin0293',
      port: 1433,
      dialect: 'mssql',
      logging: console.log,
      dialectOptions: {
        options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true
        }
      }
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a SQL Server');

    // 1. Crear proveedores de prueba
    console.log('\n📋 Creando proveedores...');
    await sequelize.query(`
      INSERT INTO [proveedores] ([razon_social], [cuit], [nombre_comercial], [contacto_principal], [email_contacto], [telefono], [estado])
      VALUES
        ('Grupo Activo SRL', '30-71044895-3', 'Grupo Activo', 'Juan Pérez', 'contacto@activo.com', '11-1234-5678', 'activo'),
        ('Centro de Interacción Multimedia S.A.', '30-70827680-0', 'APEX', 'María García', 'info@apex.com', '11-8765-4321', 'activo'),
        ('CityTech S.A.', '30-70908678-9', 'Teleperformance', 'Carlos López', 'admin@citytech.com', '11-5555-1234', 'activo'),
        ('CAT Technologies Argentina S.A', '30-70949292-2', 'CAT Tech', 'Ana Rodríguez', 'soporte@cattech.com', '11-9999-8888', 'activo'),
        ('Stratton Argentina SA', '30-69847741-1', 'Konecta', 'Pedro Martín', 'contacto@stratton.com', '11-7777-6666', 'activo');
    `);

    // 2. Crear usuarios de prueba
    console.log('👥 Creando usuarios...');
    await sequelize.query(`
      INSERT INTO [usuarios] ([email], [password_hash], [nombre], [rol], [proveedor_id], [estado])
      VALUES
        ('admin@satdigital.com', '$2b$10$YourHashedPasswordHere', 'Administrador SAT', 'admin', NULL, 'activo'),
        ('auditor@satdigital.com', '$2b$10$YourHashedPasswordHere', 'Auditor General', 'auditor_general', NULL, 'activo'),
        ('proveedor@activo.com', '$2b$10$YourHashedPasswordHere', 'Jefe Proveedor Activo', 'jefe_proveedor', 1, 'activo'),
        ('visualizador@satdigital.com', '$2b$10$YourHashedPasswordHere', 'Visualizador Ejecutivo', 'visualizador', NULL, 'activo');
    `);

    // 3. Crear sitios de prueba
    console.log('🏢 Creando sitios...');
    await sequelize.query(`
      INSERT INTO [sitios] ([proveedor_id], [nombre], [localidad], [domicilio], [estado])
      VALUES
        (1, 'Sitio Principal Activo', 'CABA', 'Florida 141', 'activo'),
        (1, 'Sucursal Norte Activo', 'San Isidro', 'Av. Libertador 1000', 'activo'),
        (2, 'APEX Central', 'CABA', 'Av. Corrientes 500', 'activo'),
        (2, 'APEX Zona Sur', 'Quilmes', 'Mitre 200', 'activo'),
        (3, 'CityTech Principal', 'Palermo', 'Av. Santa Fe 1500', 'activo'),
        (4, 'CAT Tech Oficinas', 'Microcentro', 'Mitre 853', 'activo'),
        (5, 'Konecta HQ', 'Puerto Madero', 'Av. Alicia M. de Justo 100', 'activo');
    `);

    // 4. Crear secciones técnicas básicas
    console.log('🔧 Creando secciones técnicas...');
    await sequelize.query(`
      INSERT INTO [secciones_tecnicas] ([codigo], [nombre], [descripcion], [tipo_analisis], [obligatoria], [orden_presentacion], [estado])
      VALUES
        ('NET_TOPO', 'Topología de Red', 'Documentación de la topología de red', 'tiempo_real', 1, 1, 'activa'),
        ('INFRA_DOC', 'Documentación de Infraestructura', 'Documentación y controles de infraestructura', 'tiempo_real', 1, 2, 'activa'),
        ('POWER_CT', 'Alimentación CT', 'Sistema de alimentación del centro tecnológico', 'tiempo_real', 1, 3, 'activa'),
        ('TEMP_CT', 'Temperatura CT', 'Control de temperatura del centro tecnológico', 'tiempo_real', 1, 4, 'activa'),
        ('SERVERS', 'Servidores', 'Documentación de servidores', 'tiempo_real', 1, 5, 'activa'),
        ('INTERNET', 'Internet', 'Conectividad de internet', 'tiempo_real', 1, 6, 'activa'),
        ('PERSONAL', 'Personal Capacitado', 'Personal técnico capacitado en sitio', 'tiempo_real', 1, 7, 'activa'),
        ('ESCALATION', 'Escalamiento', 'Números de contacto para escalamiento', 'tiempo_real', 1, 8, 'activa'),
        ('TECH_ROOM', 'Sala Tecnológica', 'Condiciones de la sala tecnológica', 'lotes', 1, 9, 'activa'),
        ('CONNECTIVITY', 'Conectividad', 'Certificación de cableado', 'lotes', 1, 10, 'activa');
    `);

    // 5. Crear auditorías de prueba
    console.log('📋 Creando auditorías...');
    await sequelize.query(`
      INSERT INTO [auditorias] ([sitio_id], [periodo], [fecha_inicio], [fecha_limite_carga], [auditor_asignado_id], [estado])
      VALUES
        (1, '2025-11', '2025-11-01', '2025-11-15', 2, 'programada'),
        (2, '2025-11', '2025-11-01', '2025-11-15', 2, 'programada'),
        (3, '2025-11', '2025-11-01', '2025-11-15', 2, 'en_carga'),
        (4, '2025-11', '2025-11-01', '2025-11-15', NULL, 'programada'),
        (5, '2025-11', '2025-11-01', '2025-11-15', NULL, 'programada');
    `);

    console.log('\n🎉 Datos de prueba creados exitosamente!');
    console.log('📊 Resumen:');

    // Verificar datos creados
    const [proveedores] = await sequelize.query('SELECT COUNT(*) as count FROM [proveedores]');
    const [usuarios] = await sequelize.query('SELECT COUNT(*) as count FROM [usuarios]');
    const [sitios] = await sequelize.query('SELECT COUNT(*) as count FROM [sitios]');
    const [secciones] = await sequelize.query('SELECT COUNT(*) as count FROM [secciones_tecnicas]');
    const [auditorias] = await sequelize.query('SELECT COUNT(*) as count FROM [auditorias]');

    console.log(`   👥 Proveedores: ${proveedores[0].count}`);
    console.log(`   🔐 Usuarios: ${usuarios[0].count}`);
    console.log(`   🏢 Sitios: ${sitios[0].count}`);
    console.log(`   🔧 Secciones: ${secciones[0].count}`);
    console.log(`   📋 Auditorías: ${auditorias[0].count}`);

    console.log('\n✅ SQL Server está listo para usar con SAT-Digital!');
    console.log('💡 Para cambiar a SQL Server, usar: DB_TYPE=sqlserver');

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n📝 Conexión cerrada.');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  createTestData();
}

module.exports = createTestData;