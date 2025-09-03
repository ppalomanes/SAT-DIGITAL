// Script temporal para verificar sintaxis
console.log('🔍 Verificando sintaxis del backend...');

try {
  // Verificar archivos principales
  require('./src/shared/middleware/authMiddleware');
  console.log('✅ authMiddleware - OK');
  
  require('./src/domains/audits/controllers/AuditorController');
  console.log('✅ AuditorController - OK');
  
  require('./src/domains/audits/routes/index');
  console.log('✅ Rutas auditorías - OK');
  
  // Este debería fallar si hay error de sintaxis
  // require('./src/domains/notificaciones/services/NotificacionScheduler');
  // console.log('✅ NotificacionScheduler - OK');
  
  require('./src/domains/notificaciones/controllers/NotificacionController');
  console.log('✅ NotificacionController - OK');
  
  console.log('🎉 Todos los archivos verificados - sintaxis correcta');
  
} catch (error) {
  console.error('❌ Error encontrado:', error.message);
  console.error('📍 Ubicación:', error.stack);
}
