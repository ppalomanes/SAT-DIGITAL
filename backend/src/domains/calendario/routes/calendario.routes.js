const express = require('express');
const PeriodoController = require('../controllers/PeriodoController');
const AsignacionController = require('../controllers/AsignacionController');
const { verificarToken, verificarRol } = require('../../../shared/middleware/authMiddleware');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(verificarToken);

/**
 * Rutas para gestión de períodos de auditoría
 */

// Crear nuevo período (solo admin)
router.post('/periodos', 
  verificarRol('admin'), 
  PeriodoController.crear
);

// Listar todos los períodos
router.get('/periodos', 
  verificarRol('admin', 'auditor_general', 'auditor_interno', 'visualizador'),
  PeriodoController.listar
);

// Obtener período activo
router.get('/periodos/activo',
  PeriodoController.obtenerActivo
);

// Obtener período por ID
router.get('/periodos/:id',
  verificarRol('admin', 'auditor_general', 'auditor_interno', 'visualizador'),
  PeriodoController.obtenerPorId
);

// Activar período (solo admin)
router.put('/periodos/:id/activar',
  verificarRol('admin'),
  PeriodoController.activar
);

// Generar auditorías para un período (solo admin)
router.post('/periodos/:id/generar-auditorias',
  verificarRol('admin'),
  PeriodoController.generarAuditorias
);

// Generar períodos anuales automáticamente (solo admin)
router.post('/periodos/generar/:ano',
  verificarRol('admin'),
  PeriodoController.generarAnuales
);

/**
 * Rutas para gestión de asignaciones
 */

// Obtener calendario general
router.get('/calendario',
  AsignacionController.obtenerCalendario
);

// Obtener asignaciones
router.get('/asignaciones',
  AsignacionController.obtenerAsignaciones
);

// Asignar auditor
router.post('/asignar',
  verificarRol('admin'),
  AsignacionController.asignarAuditor
);

// Reasignar auditor
router.put('/reasignar/:id',
  verificarRol('admin'),
  AsignacionController.reasignarAuditor
);

module.exports = router;
