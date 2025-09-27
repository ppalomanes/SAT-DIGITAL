/**
 * Script para poblar SQL Server con datos iniciales
 */

const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');

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

// Definir modelos básicos para el seeder
const Usuario = sequelize.define('usuarios', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  nombre: { type: DataTypes.STRING, allowNull: false },
  rol: { type: DataTypes.STRING, allowNull: false, defaultValue: 'tecnico_proveedor' },
  proveedor_id: { type: DataTypes.INTEGER, allowNull: true },
  estado: { type: DataTypes.STRING, allowNull: false, defaultValue: 'activo' }
}, { tableName: 'usuarios', underscored: true });

const Proveedor = sequelize.define('proveedores', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  razon_social: { type: DataTypes.STRING, allowNull: false },
  cuit: { type: DataTypes.STRING, allowNull: false, unique: true },
  nombre_comercial: { type: DataTypes.STRING, allowNull: false },
  email_contacto: { type: DataTypes.STRING, allowNull: true },
  telefono_principal: { type: DataTypes.STRING, allowNull: true },
  contacto_principal: { type: DataTypes.TEXT, allowNull: true },
  estado: { type: DataTypes.STRING, allowNull: false, defaultValue: 'activo' }
}, { tableName: 'proveedores', underscored: true });

const Sitio = sequelize.define('sitios', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  proveedor_id: { type: DataTypes.INTEGER, allowNull: false },
  nombre: { type: DataTypes.STRING, allowNull: false },
  localidad: { type: DataTypes.STRING, allowNull: false },
  domicilio: { type: DataTypes.TEXT, allowNull: false },
  estado: { type: DataTypes.STRING, allowNull: false, defaultValue: 'activo' }
}, { tableName: 'sitios', underscored: true });

const SeccionTecnica = sequelize.define('secciones_tecnicas', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo: { type: DataTypes.STRING, allowNull: false, unique: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  tipo_analisis: { type: DataTypes.STRING, allowNull: false, defaultValue: 'tiempo_real' },
  orden_presentacion: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  obligatoria: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { tableName: 'secciones_tecnicas', underscored: true });

// Datos de proveedores
const proveedoresData = [
  {
    razon_social: 'GRUPO ACTIVO SRL',
    cuit: '30-71044895-3',
    nombre_comercial: 'ACTIVO',
    email_contacto: 'contacto@grupoactivo.com.ar',
    telefono_principal: '(011) 1234-5678',
    contacto_principal: 'Contacto Principal',
    sitios: [
      {
        nombre: 'ACTIVO',
        localidad: 'CABA',
        domicilio: 'Florida 141-CABA'
      }
    ]
  },
  {
    razon_social: 'Centro de Interacción Multimedia S.A.',
    cuit: '30-70827680-0',
    nombre_comercial: 'APEX AMERICA',
    email_contacto: 'contacto@apex.com.ar',
    sitios: [
      {
        nombre: 'APEX CBA (Edf. Correo)',
        localidad: 'CORDOBA',
        domicilio: 'Avenida Colon 210 6° Piso'
      },
      {
        nombre: 'APEX RES (Edf. Mitre)',
        localidad: 'CHACO',
        domicilio: 'Mitre 1754 - Resistencia'
      },
      {
        nombre: 'APEX RES (Edf. A y Blanco)',
        localidad: 'CHACO',
        domicilio: 'Arbo y Blanco 236 -Resistencia'
      }
    ]
  },
  {
    razon_social: 'CAT TECHNOLOGIES ARGENTINA S.A',
    cuit: '30-70949292-2',
    nombre_comercial: 'CAT TECHNOLOGIES',
    email_contacto: 'contacto@cat-tech.com.ar',
    sitios: [
      {
        nombre: 'CAT-TECHNOLOGIES',
        localidad: 'CABA',
        domicilio: 'Mitre 853 piso 1 - CABA'
      }
    ]
  },
  {
    razon_social: 'Stratton Argentina SA',
    cuit: '30-698477411',
    nombre_comercial: 'KONECTA',
    email_contacto: 'contacto@konecta.com.ar',
    sitios: [
      {
        nombre: 'KONECTA CBA',
        localidad: 'CORDOBA',
        domicilio: 'Rosario de Santa Fe 877 - Córdoba'
      },
      {
        nombre: 'KONECTA RES',
        localidad: 'CHACO',
        domicilio: 'Monteagudo 55 - Resistencia'
      },
      {
        nombre: 'KONECTA ROS',
        localidad: 'ROSARIO',
        domicilio: 'Av. Corrientes 2265 EP Rosario'
      }
    ]
  },
  {
    razon_social: 'CITYTECH SOCIEDAD ANONIMA',
    cuit: '30-70908678-9',
    nombre_comercial: 'TELEPERFORMANCE',
    email_contacto: 'contacto@teleperformance.com.ar',
    sitios: [
      {
        nombre: 'TELEPERFORMANCE RES',
        localidad: 'CHACO',
        domicilio: 'Av. 9 de Julio 4175, Barranqueras'
      },
      {
        nombre: 'TELEPERFORMANCE TUC 1',
        localidad: 'TUCUMAN',
        domicilio: 'Adolfo de la Vega 345 -San Miguel de Tucumán'
      },
      {
        nombre: 'TELEPERFORMANCE TUC 3',
        localidad: 'TUCUMAN',
        domicilio: 'Adolfo de la Vega 400 -San Miguel de Tucumán'
      }
    ]
  }
];

// Secciones técnicas
const seccionesTecnicasData = [
  { codigo: 'TOPOLOGIA', nombre: 'Topología de red', tipo_analisis: 'tiempo_real', orden_presentacion: 1, obligatoria: true },
  { codigo: 'DOC_CONTROLES', nombre: 'Documentación y Controles Infraestructura', tipo_analisis: 'tiempo_real', orden_presentacion: 2, obligatoria: true },
  { codigo: 'ENERGIA_CT', nombre: 'Energía del Cuarto de Tecnología', tipo_analisis: 'tiempo_real', orden_presentacion: 3, obligatoria: true },
  { codigo: 'TEMPERATURA_CT', nombre: 'Temperatura CT', tipo_analisis: 'tiempo_real', orden_presentacion: 4, obligatoria: true },
  { codigo: 'SERVIDORES', nombre: 'Servidores', tipo_analisis: 'tiempo_real', orden_presentacion: 5, obligatoria: true },
  { codigo: 'INTERNET', nombre: 'Internet', tipo_analisis: 'tiempo_real', orden_presentacion: 6, obligatoria: true },
  { codigo: 'PERSONAL_CAPACITADO', nombre: 'Personal capacitado en sitio', tipo_analisis: 'tiempo_real', orden_presentacion: 7, obligatoria: true },
  { codigo: 'ESCALAMIENTO', nombre: 'Escalamiento (Tel. de Contacto)', tipo_analisis: 'tiempo_real', orden_presentacion: 8, obligatoria: true },
  { codigo: 'CUARTO_TECNOLOGIA', nombre: 'Cuarto de Tecnología', tipo_analisis: 'lotes', orden_presentacion: 9, obligatoria: true },
  { codigo: 'CONECTIVIDAD', nombre: 'Conectividad (Certificación de Cableado)', tipo_analisis: 'lotes', orden_presentacion: 10, obligatoria: false },
  { codigo: 'HARDWARE_SOFTWARE', nombre: 'Estado del Hardware, Software, Headset e internet en el hogar', tipo_analisis: 'lotes', orden_presentacion: 11, obligatoria: true },
  { codigo: 'SEGURIDAD_INFORMATICA', nombre: 'Seguridad informática', tipo_analisis: 'lotes', orden_presentacion: 12, obligatoria: true },
  { codigo: 'INFO_ENTORNO', nombre: 'Información de entorno', tipo_analisis: 'lotes', orden_presentacion: 13, obligatoria: false }
];

const seedSQLServer = async () => {
  try {
    console.log('🔗 Conectando a SQL Server...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    console.log('🌱 Iniciando seeders...');

    // 1. CREAR USUARIO ADMINISTRADOR
    console.log('👤 Creando usuario administrador...');
    const adminExists = await Usuario.findOne({ where: { email: 'admin@satdigital.com' } });
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', 12);
      await Usuario.create({
        email: 'admin@satdigital.com',
        password_hash: adminPassword,
        nombre: 'Administrador SAT-Digital',
        rol: 'admin',
        estado: 'activo'
      });
      console.log('✅ Usuario admin creado: admin@satdigital.com / admin123');
    } else {
      console.log('ℹ️ Usuario admin ya existe');
    }

    // 2. CREAR SECCIONES TÉCNICAS
    console.log('📋 Creando secciones técnicas...');
    for (const seccionData of seccionesTecnicasData) {
      const [seccion, created] = await SeccionTecnica.findOrCreate({
        where: { codigo: seccionData.codigo },
        defaults: seccionData
      });
      if (created) {
        console.log(`✅ Sección creada: ${seccion.nombre}`);
      }
    }

    // 3. CREAR PROVEEDORES Y SITIOS
    console.log('🏢 Creando proveedores y sitios...');
    for (const proveedorData of proveedoresData) {
      const [proveedor, proveedorCreated] = await Proveedor.findOrCreate({
        where: { cuit: proveedorData.cuit },
        defaults: {
          razon_social: proveedorData.razon_social,
          cuit: proveedorData.cuit,
          nombre_comercial: proveedorData.nombre_comercial,
          email_contacto: proveedorData.email_contacto,
          telefono_principal: proveedorData.telefono_principal,
          contacto_principal: proveedorData.contacto_principal,
          estado: 'activo'
        }
      });

      if (proveedorCreated) {
        console.log(`✅ Proveedor creado: ${proveedor.razon_social} (${proveedor.cuit})`);
      }

      // Crear sitios del proveedor
      for (const sitioData of proveedorData.sitios) {
        const [sitio, sitioCreated] = await Sitio.findOrCreate({
          where: {
            proveedor_id: proveedor.id,
            nombre: sitioData.nombre
          },
          defaults: {
            proveedor_id: proveedor.id,
            nombre: sitioData.nombre,
            localidad: sitioData.localidad,
            domicilio: sitioData.domicilio,
            estado: 'activo'
          }
        });

        if (sitioCreated) {
          console.log(`   ✅ Sitio creado: ${sitio.nombre} (${sitio.localidad})`);
        }
      }
    }

    // 4. CREAR USUARIOS ADICIONALES
    console.log('👥 Creando usuarios de prueba...');
    const usuariosPrueba = [
      {
        email: 'auditor@satdigital.com',
        password: 'auditor123',
        nombre: 'Juan Carlos Auditor General',
        rol: 'auditor_general'
      },
      {
        email: 'auditoria@satdigital.com',
        password: 'auditor123',
        nombre: 'Ana María Auditora Interna',
        rol: 'auditor_interno'
      },
      {
        email: 'visualizador@satdigital.com',
        password: 'visual123',
        nombre: 'Carlos Gerente Ejecutivo',
        rol: 'visualizador'
      }
    ];

    for (const userData of usuariosPrueba) {
      const userExists = await Usuario.findOne({ where: { email: userData.email } });
      if (!userExists) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        await Usuario.create({
          email: userData.email,
          password_hash: hashedPassword,
          nombre: userData.nombre,
          rol: userData.rol,
          estado: 'activo'
        });
        console.log(`✅ Usuario creado: ${userData.email} / ${userData.password}`);
      }
    }

    // 5. CREAR USUARIOS DE PROVEEDOR
    console.log('🏢 Creando usuarios de proveedor...');
    const grupoActivo = await Proveedor.findOne({ where: { cuit: '30-71044895-3' } });
    if (grupoActivo) {
      const proveedorExists = await Usuario.findOne({ where: { email: 'proveedor@activo.com' } });
      if (!proveedorExists) {
        const proveedorPassword = await bcrypt.hash('proveedor123', 12);
        await Usuario.create({
          email: 'proveedor@activo.com',
          password_hash: proveedorPassword,
          nombre: 'Jefe Proveedor Activo',
          rol: 'jefe_proveedor',
          proveedor_id: grupoActivo.id,
          estado: 'activo'
        });
        console.log('✅ Usuario jefe proveedor creado: proveedor@activo.com / proveedor123');
      }

      const tecnicoExists = await Usuario.findOne({ where: { email: 'tecnico@activo.com' } });
      if (!tecnicoExists) {
        const tecnicoPassword = await bcrypt.hash('tecnico123', 12);
        await Usuario.create({
          email: 'tecnico@activo.com',
          password_hash: tecnicoPassword,
          nombre: 'Luis Técnico Proveedor Activo',
          rol: 'tecnico_proveedor',
          proveedor_id: grupoActivo.id,
          estado: 'activo'
        });
        console.log('✅ Usuario técnico proveedor creado: tecnico@activo.com / tecnico123');
      }
    }

    // 6. RESUMEN FINAL
    const resumen = {
      proveedores: await Proveedor.count(),
      sitios: await Sitio.count(),
      usuarios: await Usuario.count(),
      secciones: await SeccionTecnica.count()
    };

    console.log('\n🎉 SEEDERS COMPLETADOS EXITOSAMENTE');
    console.log('=======================================');
    console.log(`📊 Resumen de datos creados:`);
    console.log(`   • Proveedores: ${resumen.proveedores}`);
    console.log(`   • Sitios: ${resumen.sitios}`);
    console.log(`   • Usuarios: ${resumen.usuarios}`);
    console.log(`   • Secciones técnicas: ${resumen.secciones}`);

    console.log('\n🔑 Credenciales de acceso:');
    console.log('   • Admin: admin@satdigital.com / admin123');
    console.log('   • Auditor General: auditor@satdigital.com / auditor123');
    console.log('   • Auditor Interno: auditoria@satdigital.com / auditor123');
    console.log('   • Jefe Proveedor: proveedor@activo.com / proveedor123');
    console.log('   • Técnico Proveedor: tecnico@activo.com / tecnico123');
    console.log('   • Visualizador: visualizador@satdigital.com / visual123');

  } catch (error) {
    console.error('❌ Error ejecutando seeders:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  seedSQLServer()
    .then(() => {
      console.log('✅ Seeders completados');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { seedSQLServer };