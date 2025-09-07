// Rutas para Reportes y Analytics
// Checkpoint 2.10 - Sistema completo de reportes

const express = require('express');
const router = express.Router();
const ReportesController = require('../controllers/ReportesController');
const { verificarToken } = require('../../../shared/middleware/authMiddleware');
const { verificarRol } = require('../../../shared/middleware/authMiddleware');

// Middleware de autenticación para todas las rutas
router.use(verificarToken);

/**
 * @route GET /api/reportes/resumen-ejecutivo
 * @desc Obtener resumen ejecutivo de auditorías
 * @access Admin, Auditor, Visualizador
 */
router.get(
  '/resumen-ejecutivo',
  verificarRol('admin', 'auditor_general', 'auditor_interno', 'visualizador'),
  ReportesController.obtenerResumenEjecutivo
);

/**
 * @route GET /api/reportes/auditoria/:id/detalle
 * @desc Obtener detalle completo de auditoría específica
 * @access Admin, Auditor
 */
router.get(
  '/auditoria/:id/detalle',
  verificarRol('admin', 'auditor_general', 'auditor_interno'),
  ReportesController.obtenerDetalleAuditoria
);

/**
 * @route GET /api/reportes/auditores/rendimiento
 * @desc Obtener métricas de rendimiento por auditor
 * @access Admin
 */
router.get(
  '/auditores/rendimiento',
  verificarRol('admin'),
  ReportesController.obtenerRendimientoAuditores
);

/**
 * @route GET /api/reportes/metricas-tiempo-real
 * @desc Obtener métricas en tiempo real para dashboard
 * @access Admin, Auditor, Visualizador
 */
router.get(
  '/metricas-tiempo-real',
  verificarRol('admin', 'auditor_general', 'auditor_interno', 'visualizador'),
  ReportesController.obtenerMetricasTiempoReal
);

/**
 * @route POST /api/reportes/exportar
 * @desc Exportar reportes en formato Excel
 * @access Admin, Auditor
 */
router.post(
  '/exportar',
  verificarRol('admin', 'auditor_general', 'auditor_interno'),
  ReportesController.exportarReporte
);

/**
 * @route GET /api/reportes/periodos-disponibles
 * @desc Obtener períodos disponibles para filtros
 * @access Admin, Auditor, Visualizador
 */
router.get(
  '/periodos-disponibles',
  verificarRol('admin', 'auditor_general', 'auditor_interno', 'visualizador'),
  ReportesController.obtenerPeriodosDisponibles
);

/**
 * @route GET /api/reportes/proveedores-disponibles
 * @desc Obtener proveedores disponibles para filtros
 * @access Admin, Auditor, Visualizador
 */
router.get(
  '/proveedores-disponibles',
  verificarRol('admin', 'auditor_general', 'auditor_interno', 'visualizador'),
  ReportesController.obtenerProveedoresDisponibles
);

module.exports = router;