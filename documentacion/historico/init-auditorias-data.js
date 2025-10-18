/**
 * Script para inicializar datos de auditorías vía API REST
 * Ejecutar con: node init-auditorias-data.js
 */

const http = require('http');

const API_URL = 'localhost';
const API_PORT = 3001;

// Credenciales admin
const ADMIN_EMAIL = 'admin@satdigital.com';
const ADMIN_PASS = 'admin123';

let authToken = '';

// Helper function para hacer peticiones HTTP
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_URL,
      port: API_PORT,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function main() {
  try {
    console.log('🚀 Iniciando creación de datos de auditorías...\n');

    // 1. Login como admin
    console.log('🔐 1. Autenticando como administrador...');
    const loginResponse = await makeRequest('POST', '/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASS
    });

    if (!loginResponse.success || !loginResponse.data?.token) {
      throw new Error('Login falló');
    }

    authToken = loginResponse.data.token;
    console.log('✅ Autenticación exitosa\n');

    // 2. Verificar período activo
    console.log('📅 2. Verificando período activo...');
    const periodoResponse = await makeRequest('GET', '/calendario/periodos/activo', null, authToken);

    if (!periodoResponse.success || !periodoResponse.data) {
      console.log('⚠️  No hay período activo, necesitas crear uno desde la interfaz de admin');
      console.log('   Navega a /periodos y crea un período activo');
      process.exit(1);
    }

    const periodoActivo = periodoResponse.data;
    console.log(`✅ Período activo encontrado: ${periodoActivo.nombre}`);
    console.log(`   Código: ${periodoActivo.codigo}`);
    console.log(`   Fechas: ${periodoActivo.fecha_inicio} a ${periodoActivo.fecha_fin}\n`);

    // 3. Obtener proveedores y sitios
    console.log('🏢 3. Obteniendo proveedores...');
    const proveedoresResponse = await makeRequest('GET', '/proveedores', null, authToken);

    if (!proveedoresResponse.success || !proveedoresResponse.data) {
      throw new Error('No se pudieron obtener proveedores');
    }

    const proveedores = proveedoresResponse.data.proveedores || proveedoresResponse.data;
    console.log(`✅ ${proveedores.length} proveedores encontrados\n`);

    // 4. Para cada proveedor, obtener sus sitios
    console.log('🏠 4. Obteniendo sitios por proveedor...');
    let totalSitios = 0;

    for (const proveedor of proveedores.slice(0, 3)) { // Solo primeros 3 proveedores
      try {
        const sitiosResponse = await makeRequest('GET', `/proveedores/${proveedor.id}/sitios`, null, authToken);
        const sitios = sitiosResponse.data?.sitios || sitiosResponse.data || [];
        console.log(`   ${proveedor.nombre_comercial}: ${sitios.length} sitios`);
        totalSitios += sitios.length;
      } catch (e) {
        console.log(`   ${proveedor.nombre_comercial}: Error obteniendo sitios`);
      }
    }

    console.log(`✅ Total de sitios: ${totalSitios}\n`);

    // 5. Mensaje final
    console.log('📊 RESUMEN:');
    console.log('============================================');
    console.log(`✅ Período activo: ${periodoActivo.nombre}`);
    console.log(`✅ Proveedores: ${proveedores.length}`);
    console.log(`✅ Sitios totales: ${totalSitios}`);
    console.log('============================================\n');

    console.log('🎯 PASOS SIGUIENTES:');
    console.log('1. Inicia sesión como usuario proveedor:');
    console.log('   Email: proveedor@activo.com');
    console.log('   Pass: proveedor123\n');
    console.log('2. Navega a /auditorias');
    console.log('3. Deberías ver las auditorías asignadas\n');

    console.log('⚠️  NOTA: Si no ves auditorías, es porque no se han creado aún.');
    console.log('   Contacta al administrador para que las cree desde /calendario\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar
main();
