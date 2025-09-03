/**
 * Rutas de gestión de auditorías
 * Endpoints para el workflow completo de auditorías
 * Checkpoint 2.5: Panel de Control para Auditores
 */

const express = require('express');
const { verificarToken, verificarRol } = require('../../../shared/middleware/authMiddleware');
const AuditorController = require('../controllers/AuditorController');
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
  verificarRol('admin', 'auditor'),
  AuditorController.obtenerDashboard
);

/**
 * GET /api/auditorias/mis-auditorias
 * Auditorías asignadas con filtros y paginación
 */
router.get('/mis-auditorias',
  verificarRol('admin', 'auditor'),
  AuditorController.obtenerMisAuditorias
);

/**
 * GET /api/auditorias/consultas-pendientes
 * Consultas pendientes de respuesta
 */
router.get('/consultas-pendientes',
  verificarRol('admin', 'auditor'),
  AuditorController.obtenerConsultasPendientes
);

/**
 * GET /api/auditorias/:id/revision
 * Detalle completo de auditoría para revisión
 */
router.get('/:id/revision',
  verificarRol('admin', 'auditor'),
  AuditorController.obtenerRevisionAuditoria
);

/**
 * PUT /api/auditorias/:id/estado
 * Actualizar estado de auditoría
 */
router.put('/:id/estado',
  verificarRol('admin', 'auditor'),
  AuditorController.actualizarEstadoAuditoria
);

/**
 * POST /api/auditorias/exportar-reporte
 * Exportar reporte de estado
 */
router.post('/exportar-reporte',
  verificarRol('admin', 'auditor'),
  AuditorController.exportarReporte
);

module.exports = router;
