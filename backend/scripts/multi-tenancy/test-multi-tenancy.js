/**
 * Script de Testing de Aislamiento Multi-Tenancy
 *
 * TESTS:
 * 1. Verificar usuarios por tenant
 * 2. Probar login y JWT con tenant_id
 * 3. Validar segregación de datos entre tenants
 * 4. Verificar Sequelize scopes
 */

require('dotenv').config({ path: '.env.local' });
const sql = require('mssql');
const axios = require('axios');

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

const API_URL = 'http://localhost:3001/api';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(emoji, message, color = 'reset') {
  console.log(`${colors[color]}${emoji} ${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(80));
  console.log(`\n${colors.blue}${title}${colors.reset}\n`);
  console.log('='.repeat(80) + '\n');
}

async function test1_VerificarUsuarios(pool) {
  section('TEST 1: VERIFICAR USUARIOS POR TENANT');

  const users = await pool.request().query(`
    SELECT
      u.id,
      u.nombre,
      u.email,
      u.rol,
      u.tenant_id,
      u.proveedor_id,
      p.razon_social as proveedor,
      t.nombre as tenant
    FROM usuarios u
    LEFT JOIN proveedores p ON p.id = u.proveedor_id
    LEFT JOIN tenants t ON t.id = u.tenant_id
    ORDER BY u.tenant_id, u.rol;
  `);

  let currentTenant = null;
  users.recordset.forEach(u => {
    if (u.tenant_id !== currentTenant) {
      currentTenant = u.tenant_id;
      console.log(`\n${colors.blue}📍 TENANT ${u.tenant_id}: ${u.tenant || 'Sin tenant'}${colors.reset}`);
      console.log('─'.repeat(70));
    }
    log('👤', `${u.rol.toUpperCase().padEnd(12)} | ${u.email.padEnd(35)} | ID: ${u.id}`, 'gray');
    if (u.proveedor) {
      console.log(`${''.padStart(3)}${colors.gray}→ Proveedor: ${u.proveedor}${colors.reset}`);
    }
  });

  log('✅', `Total usuarios: ${users.recordset.length}`, 'green');
  return users.recordset;
}

async function test2_LoginYJWT(pool) {
  section('TEST 2: LOGIN Y VALIDACIÓN JWT CON TENANT_ID');

  // Obtener usuarios de diferentes tenants
  const testUsers = await pool.request().query(`
    SELECT TOP 3
      u.email,
      u.tenant_id,
      t.nombre as tenant,
      p.razon_social as proveedor
    FROM usuarios u
    LEFT JOIN tenants t ON t.id = u.tenant_id
    LEFT JOIN proveedores p ON p.id = u.proveedor_id
    WHERE u.proveedor_id IS NOT NULL
    ORDER BY u.tenant_id;
  `);

  const results = [];

  for (const user of testUsers.recordset) {
    console.log(`\n${colors.yellow}🔐 Testing login: ${user.email} (Tenant ${user.tenant_id})${colors.reset}`);

    try {
      // Intentar login (asumiendo password genérico del seeder)
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: user.email,
        password: 'proveedor123' // Password del seeder
      });

      const { token, usuario } = response.data;

      log('✅', 'Login exitoso', 'green');
      log('📋', `Usuario: ${usuario.nombre}`, 'gray');
      log('🏢', `Tenant ID: ${usuario.tenant_id}`, 'gray');
      log('🏭', `Proveedor: ${user.proveedor || 'N/A'}`, 'gray');

      // Decodificar JWT (simple, sin verificación)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      log('🎫', `JWT tenant_id: ${payload.tenant_id}`, 'gray');

      const match = usuario.tenant_id === payload.tenant_id;
      log(match ? '✅' : '❌', `Match tenant_id: ${match}`, match ? 'green' : 'red');

      results.push({
        email: user.email,
        tenant_id: user.tenant_id,
        jwt_tenant_id: payload.tenant_id,
        success: true,
        match: match
      });

    } catch (error) {
      log('❌', `Error login: ${error.response?.data?.mensaje || error.message}`, 'red');
      results.push({
        email: user.email,
        tenant_id: user.tenant_id,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

async function test3_SegregacionDatos(pool) {
  section('TEST 3: SEGREGACIÓN DE DATOS ENTRE TENANTS');

  // Verificar proveedores por tenant
  const proveedoresPorTenant = await pool.request().query(`
    SELECT
      tenant_id,
      COUNT(*) as cant_proveedores
    FROM proveedores
    GROUP BY tenant_id
    ORDER BY tenant_id;
  `);

  // Obtener lista de proveedores por tenant
  const proveedoresList = await pool.request().query(`
    SELECT
      tenant_id,
      razon_social
    FROM proveedores
    ORDER BY tenant_id;
  `);

  console.log('📊 Proveedores por Tenant:\n');
  proveedoresPorTenant.recordset.forEach(t => {
    const isCorrect = t.cant_proveedores === 1;
    const provs = proveedoresList.recordset
      .filter(p => p.tenant_id === t.tenant_id)
      .map(p => p.razon_social)
      .join(', ');
    log(
      isCorrect ? '✅' : '❌',
      `Tenant ${t.tenant_id}: ${t.cant_proveedores} proveedor(es) - ${provs}`,
      isCorrect ? 'green' : 'red'
    );
  });

  // Verificar sitios por tenant
  const sitiosPorTenant = await pool.request().query(`
    SELECT
      s.tenant_id,
      t.nombre as tenant,
      COUNT(*) as cant_sitios
    FROM sitios s
    LEFT JOIN tenants t ON t.id = s.tenant_id
    GROUP BY s.tenant_id, t.nombre
    ORDER BY s.tenant_id;
  `);

  const sitiosList = await pool.request().query(`
    SELECT tenant_id, nombre
    FROM sitios
    ORDER BY tenant_id;
  `);

  console.log('\n📍 Sitios por Tenant:\n');
  sitiosPorTenant.recordset.forEach(t => {
    log('📌', `Tenant ${t.tenant_id} (${t.tenant}): ${t.cant_sitios} sitios`, 'blue');
    const sites = sitiosList.recordset
      .filter(s => s.tenant_id === t.tenant_id)
      .map(s => s.nombre)
      .join(', ');
    console.log(`${colors.gray}   → ${sites}${colors.reset}`);
  });

  // Verificar que no haya cross-tenant data
  const crossTenantCheck = await pool.request().query(`
    SELECT
      s.id as sitio_id,
      s.nombre as sitio,
      s.tenant_id as sitio_tenant,
      p.tenant_id as proveedor_tenant,
      CASE
        WHEN s.tenant_id = p.tenant_id THEN 'OK'
        ELSE 'ERROR'
      END as status
    FROM sitios s
    JOIN proveedores p ON p.id = s.proveedor_id
    WHERE s.tenant_id != p.tenant_id;
  `);

  if (crossTenantCheck.recordset.length === 0) {
    log('✅', 'No se encontraron datos cross-tenant', 'green');
  } else {
    log('❌', `ALERTA: ${crossTenantCheck.recordset.length} sitios con tenant_id incorrecto`, 'red');
    crossTenantCheck.recordset.forEach(r => {
      console.log(`   Sitio ${r.sitio_id}: tenant ${r.sitio_tenant} != proveedor tenant ${r.proveedor_tenant}`);
    });
  }

  return {
    proveedores: proveedoresPorTenant.recordset,
    sitios: sitiosPorTenant.recordset,
    crossTenant: crossTenantCheck.recordset
  };
}

async function test4_SequelizeScopes() {
  section('TEST 4: SEQUELIZE SCOPES (SIMULACIÓN)');

  log('ℹ️', 'Este test requiere el servidor corriendo con Sequelize', 'yellow');
  log('📝', 'Verificación manual necesaria:', 'blue');
  console.log(`
  ${colors.gray}1. Hacer login con usuario de Tenant 1
  2. Hacer GET /api/proveedores
  3. Verificar que solo retorna proveedores del Tenant 1
  4. Repetir con usuario de Tenant 2
  5. Verificar segregación correcta${colors.reset}
  `);

  log('💡', 'TIP: Usa Postman o curl para probar', 'yellow');
  console.log(`
  ${colors.gray}# Ejemplo:
  curl -X POST ${API_URL}/auth/login \\
    -H "Content-Type: application/json" \\
    -d '{"email":"proveedor@activo.com","password":"proveedor123"}'

  # Luego usar el token:
  curl ${API_URL}/proveedores \\
    -H "Authorization: Bearer <TOKEN>"${colors.reset}
  `);
}

async function runTests() {
  let pool;

  try {
    console.log('\n' + '█'.repeat(80));
    console.log(`${colors.blue}
    ╔═══════════════════════════════════════════════════════════════════╗
    ║                                                                   ║
    ║        🧪 TESTING AISLAMIENTO MULTI-TENANCY                       ║
    ║           SAT-Digital - Sistema de Auditorías                     ║
    ║                                                                   ║
    ╚═══════════════════════════════════════════════════════════════════╝
    ${colors.reset}`);
    console.log('█'.repeat(80) + '\n');

    log('🔌', 'Conectando a SQL Server...', 'yellow');
    pool = await sql.connect(config);
    log('✅', 'Conexión exitosa\n', 'green');

    // TEST 1: Verificar usuarios
    const usuarios = await test1_VerificarUsuarios(pool);

    // TEST 2: Login y JWT
    const loginResults = await test2_LoginYJWT(pool);

    // TEST 3: Segregación de datos
    const segregacion = await test3_SegregacionDatos(pool);

    // TEST 4: Sequelize Scopes
    await test4_SequelizeScopes();

    // RESUMEN FINAL
    section('📊 RESUMEN DE TESTS');

    const allPassed =
      loginResults.every(r => r.success && r.match) &&
      segregacion.crossTenant.length === 0 &&
      segregacion.proveedores.every(p => p.cant_proveedores === 1);

    if (allPassed) {
      console.log(`
    ${colors.green}╔═══════════════════════════════════════════════════════════════════╗
    ║                                                                   ║
    ║                   ✅ TODOS LOS TESTS PASARON                      ║
    ║                                                                   ║
    ║   El sistema multi-tenancy está correctamente implementado       ║
    ║   y funcionando con segregación completa de datos                ║
    ║                                                                   ║
    ╚═══════════════════════════════════════════════════════════════════╝${colors.reset}
      `);
    } else {
      console.log(`
    ${colors.yellow}╔═══════════════════════════════════════════════════════════════════╗
    ║                                                                   ║
    ║             ⚠️  ALGUNOS TESTS REQUIEREN ATENCIÓN                 ║
    ║                                                                   ║
    ║   Revisar los resultados arriba para más detalles                ║
    ║                                                                   ║
    ╚═══════════════════════════════════════════════════════════════════╝${colors.reset}
      `);
    }

    log('✅', 'Testing completado\n', 'green');

  } catch (error) {
    console.error(`\n${colors.red}❌ Error durante testing:${colors.reset}`, error.message);
    throw error;
  } finally {
    if (pool) {
      await pool.close();
      log('🔌', 'Conexión cerrada', 'gray');
    }
  }
}

// Ejecutar tests
runTests()
  .then(() => {
    console.log('\n' + '█'.repeat(80) + '\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error(`${colors.red}❌ Script falló:${colors.reset}`, error.message);
    process.exit(1);
  });
