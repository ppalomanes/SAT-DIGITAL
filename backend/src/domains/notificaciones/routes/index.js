// Rutas principales del dominio de notificaciones
// Checkpoint 2.4 - Sistema de notificaciones automáticas integrado

const express = require('express');
const router = express.Router();

// Importar sub-rutas
const schedulerRoutes = require('./scheduler.routes');
const emailTestRoutes = require('./email-test.routes');

// Configurar sub-rutas
router.use('/scheduler', schedulerRoutes);
router.use('/email-test', emailTestRoutes);

// Endpoint de health check general del dominio
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    domain: 'notificaciones',
    status: 'operational',
    timestamp: new Date(),
    features: [
      'scheduler',
      'email_service',
      'automated_alerts',
      'email_templates',
      'bulk_email_sending'
    ]
  });
});

// Endpoint de información del dominio
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    domain: 'notificaciones',
    version: '2.4.0',
    description: 'Sistema de notificaciones automáticas y alertas programadas',
    endpoints: {
      '/scheduler': 'Gestión del programador de notificaciones',
      '/email-test': 'Sistema de testing de templates de email',
      '/health': 'Estado del dominio de notificaciones'
    },
    checkpoint: '2.4 - Sistema de Notificaciones y Alertas Automáticos',
    last_updated: new Date()
  });
});

module.exports = router;