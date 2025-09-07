/**
 * Rutas de gestión de auditorías
 * Endpoints para el workflow completo de auditorías
 * Checkpoint 2.5: Panel de Control para Auditores
 */

const express = require('express');
const { verificarToken, verificarRol } = require('../../../shared/middleware/authMiddleware');
const AuditorController = require('../controllers/AuditorController');
const WorkflowController = require('../controllers/WorkflowController');
const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(verificarToken);

/**
 * CHECKPOINT 2.5 - PANEL DE CONTROL PARA AUDITORES
 */

/**
 * GET /api/auditorias/dashboard
 * Dashboard personalizado del auditor
 */
router.get('/dashboard',
  verificarRol('admin', 'auditor_general', 'auditor_interno', 'jefe_proveedor'),
  AuditorController.obtenerDashboard
);

/**
 * GET /api/auditorias/mis-auditorias
 * Auditorías asignadas con filtros y paginación
 */
router.get('/mis-auditorias',
  verificarRol('admin', 'auditor_general', 'auditor_interno', 'jefe_proveedor'),
  AuditorController.obtenerMisAuditorias
);

/**
 * GET /api/auditorias/consultas-pendientes
 * Consultas pendientes de respuesta
 */
router.get('/consultas-pendientes',
  verificarRol('admin', 'auditor_general', 'auditor_interno'),
  AuditorController.obtenerConsultasPendientes
);

/**
 * GET /api/auditorias/:id/revision
 * Detalle completo de auditoría para revisión
 */
router.get('/:id/revision',
  verificarRol('admin', 'auditor_general', 'auditor_interno', 'jefe_proveedor', 'tecnico_proveedor'),
  AuditorController.obtenerRevisionAuditoria
);

/**
 * PUT /api/auditorias/:id/estado
 * Actualizar estado de auditoría
 */
router.put('/:id/estado',
  verificarRol('admin', 'auditor_general', 'auditor_interno'),
  AuditorController.actualizarEstadoAuditoria
);

/**
 * GET /api/auditorias/metricas-workflow
 * Métricas del workflow de auditorías
 */
router.get('/metricas-workflow',
  verificarRol('admin', 'auditor_general', 'auditor_interno'),
  AuditorController.obtenerMetricasWorkflow
);

/**
 * POST /api/auditorias/verificar-transiciones
 * Forzar verificación de transiciones automáticas (solo admin)
 */
router.post('/verificar-transiciones',
  verificarRol('admin'),
  AuditorController.verificarTransicionesAutomaticas
);

/**
 * POST /api/auditorias/exportar-reporte
 * Exportar reporte de estado
 */
router.post('/exportar-reporte',
  verificarRol('admin', 'auditor_general', 'auditor_interno'),
  AuditorController.exportarReporte
);

/**
 * CHECKPOINT 2.9 - WORKFLOW DE ESTADOS AUTOMÁTICOS
 */

/**
 * GET /api/auditorias/workflow/metricas
 * Métricas generales del workflow
 */
router.get('/workflow/metricas',
  verificarRol('admin', 'auditor_general', 'auditor_interno'),
  WorkflowController.obtenerMetricas
);

/**
 * GET /api/auditorias/:auditoriaId/progreso
 * Progreso específico de una auditoría
 */
router.get('/:auditoriaId/progreso',
  WorkflowController.obtenerProgresoAuditoria
);

/**
 * POST /api/auditorias/:auditoriaId/forzar-transicion
 * Forzar transición de estado (solo administradores)
 */
router.post('/:auditoriaId/forzar-transicion',
  verificarRol('admin', 'auditor_general'),
  WorkflowController.forzarTransicion
);

/**
 * POST /api/auditorias/:auditoriaId/verificar-transiciones
 * Verificar manualmente transiciones automáticas
 */
router.post('/:auditoriaId/verificar-transiciones',
  WorkflowController.verificarTransicionesManual
);

/**
 * GET /api/auditorias/:auditoriaId/historial-estados
 * Historial de cambios de estado
 */
router.get('/:auditoriaId/historial-estados',
  WorkflowController.obtenerHistorialEstados
);

/**
 * POST /api/auditorias/workflow/verificaciones-programadas
 * Ejecutar verificaciones programadas
 */
router.post('/workflow/verificaciones-programadas',
  verificarRol('admin'),
  WorkflowController.ejecutarVerificacionesProgramadas
);

module.exports = router;
