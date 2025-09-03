// Prueba mínima del backend - SAT-Digital
require('dotenv').config();
const express = require('express');
const cors = require('cors');

console.log('🔧 Iniciando prueba mínima del backend...');

const app = express();
const PORT = 3001;

// Middleware básico
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0-test'
  });
});

// Importar solo las rutas críticas
try {
  const authRoutes = require('./src/domains/auth/routes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Rutas de autenticación cargadas');
} catch (error) {
  console.error('❌ Error cargando rutas de autenticación:', error.message);
}

try {
  const auditRoutes = require('./src/domains/audits/routes');
  app.use('/api/auditorias', auditRoutes);
  console.log('✅ Rutas de auditorías cargadas');
} catch (error) {
  console.error('❌ Error cargando rutas de auditorías:', error.message);
}

try {
  const providerRoutes = require('./src/domains/providers/routes');
  app.use('/api/proveedores', providerRoutes);
  console.log('✅ Rutas de proveedores cargadas');
} catch (error) {
  console.error('❌ Error cargando rutas de proveedores:', error.message);
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend de prueba ejecutándose en puerto ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Auth test: http://localhost:${PORT}/api/auth/health`);
  console.log(`📋 Auditorias test: http://localhost:${PORT}/api/auditorias/health`);
});
