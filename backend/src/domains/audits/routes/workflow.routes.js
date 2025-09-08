/**
 * SAT-Digital Backend - Rutas de Workflow Automático
 * Checkpoint 2.8: Endpoints para gestión de workflow de estados automático
 * 
 * Rutas disponibles:
 * - GET /metricas - Métricas generales del workflow
 * - GET /:auditoriaId/progreso - Progreso específico de auditoría
 * - POST /:auditoriaId/forzar-transicion - Cambio forzado de estado (admin)
 * - POST /:auditoriaId/verificar - Verificar transiciones automáticas
 * - GET /:auditoriaId/historial - Historial de cambios de estado
 * - POST /verificar-programadas - Ejecutar verificaciones programadas
 */

const express = require('express');
const router = express.Router();
const WorkflowController = require('../controllers/WorkflowController');
const { verificarToken, verificarRol } = require('../../../shared/middleware/authMiddleware');

// Middleware de autenticación para todas las rutas
router.use(verificarToken);

/**
 * @route   GET /api/audits/workflow/metricas
 * @desc    Obtener métricas generales del workflow
 * @access  Auditor, Admin
 */
router.get('/metricas', 
  verificarRol(['admin', 'auditor', 'auditor_general']),
  WorkflowController.obtenerMetricas
);

/**
 * @route   GET /api/audits/workflow/:auditoriaId/progreso
 * @desc    Obtener progreso específico de una auditoría
 * @access  Auditor, Admin, Proveedor (solo sus auditorías)
 */
router.get('/:auditoriaId/progreso',
  WorkflowController.obtenerProgresoAuditoria
);

/**
 * @route   POST /api/audits/workflow/:auditoriaId/forzar-transicion
 * @desc    Forzar cambio de estado (solo administradores)
 * @access  Solo Admin y Auditor General
 */
router.post('/:auditoriaId/forzar-transicion',
  verificarRol(['admin', 'auditor_general']),
  WorkflowController.forzarTransicion
);

/**
 * @route   POST /api/audits/workflow/:auditoriaId/verificar
 * @desc    Verificar transiciones automáticas manualmente
 * @access  Auditor, Admin
 */
router.post('/:auditoriaId/verificar',
  verificarRol(['admin', 'auditor', 'auditor_general']),
  WorkflowController.verificarTransicionesManual
);

/**
 * @route   GET /api/audits/workflow/:auditoriaId/historial
 * @desc    Obtener historial de cambios de estado
 * @access  Auditor, Admin
 */
router.get('/:auditoriaId/historial',
  verificarRol(['admin', 'auditor', 'auditor_general']),
  WorkflowController.obtenerHistorialEstados
);

/**
 * @route   POST /api/audits/workflow/verificar-programadas
 * @desc    Ejecutar verificaciones programadas (para cron/sistema)
 * @access  Solo Admin
 */
router.post('/verificar-programadas',
  verificarRol(['admin']),
  WorkflowController.ejecutarVerificacionesProgramadas
);

module.exports = router;