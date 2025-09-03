const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Instalando dependencias para SAT-Digital Backend...');

try {
  // Instalar dependencias principales
  console.log('📦 Instalando dependencias del proyecto...');
  execSync('npm install', { stdio: 'inherit', cwd: process.cwd() });
  
  console.log('✅ Dependencias instaladas correctamente');
  console.log('🔧 Verificando instalaciones críticas...');
  
  // Verificar instalaciones críticas
  const dependencies = [
    'socket.io',
    'nodemailer', 
    'bull',
    'handlebars',
    'cron',
    'mysql2',
    'express',
    'jsonwebtoken'
  ];
  
  dependencies.forEach(dep => {
    try {
      require.resolve(dep);
      console.log(`✅ ${dep} - OK`);
    } catch (e) {
      console.log(`❌ ${dep} - FALTA`);
    }
  });
  
  console.log('🎯 Backend listo para Checkpoint 2.4');
  
} catch (error) {
  console.error('❌ Error instalando dependencias:', error.message);
  process.exit(1);
}
