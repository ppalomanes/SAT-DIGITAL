// Rutas para gestión del Scheduler de Notificaciones
// Checkpoint 2.4 - Endpoints para control del sistema de notificaciones automáticas

const express = require('express');
const router = express.Router();
const SchedulerController = require('../controllers/SchedulerController');
const { verificarToken, verificarRol } = require('../../../shared/middleware/authMiddleware');

// Middleware de autenticación para todas las rutas
router.use(verificarToken);

/**
 * @route   GET /api/notificaciones/scheduler/estado
 * @desc    Obtener estado actual del scheduler
 * @access  Admin, Auditor General
 */
router.get('/estado', 
  verificarRol(['admin', 'auditor_general']), 
  SchedulerController.obtenerEstado
);

/**
 * @route   POST /api/notificaciones/scheduler/inicializar
 * @desc    Inicializar el scheduler
 * @access  Solo Admin
 */
router.post('/inicializar',
  verificarRol(['admin']),
  SchedulerController.inicializar
);

/**
 * @route   POST /api/notificaciones/scheduler/detener
 * @desc    Detener el scheduler
 * @access  Solo Admin
 */
router.post('/detener',
  verificarRol(['admin']),
  SchedulerController.detener
);

/**
 * @route   POST /api/notificaciones/scheduler/ejecutar/:jobName
 * @desc    Ejecutar un job específico manualmente
 * @access  Admin, Auditor General
 */
router.post('/ejecutar/:jobName',
  verificarRol(['admin', 'auditor_general']),
  SchedulerController.ejecutarJob
);

/**
 * @route   GET /api/notificaciones/scheduler/jobs
 * @desc    Listar jobs disponibles
 * @access  Admin, Auditor General
 */
router.get('/jobs',
  verificarRol(['admin', 'auditor_general']),
  SchedulerController.listarJobs
);

/**
 * @route   GET /api/notificaciones/scheduler/estadisticas
 * @desc    Obtener estadísticas de notificaciones
 * @access  Admin, Auditor General
 */
router.get('/estadisticas',
  verificarRol(['admin', 'auditor_general']),
  SchedulerController.obtenerEstadisticas
);

/**
 * @route   PUT /api/notificaciones/scheduler/configurar
 * @desc    Configurar frecuencia de jobs
 * @access  Solo Admin
 */
router.put('/configurar',
  verificarRol(['admin']),
  SchedulerController.configurarFrecuencia
);

/**
 * @route   GET /api/notificaciones/scheduler/health
 * @desc    Health check del scheduler
 * @access  Público (para monitoreo)
 */
router.get('/health',
  SchedulerController.healthCheck
);

module.exports = router;