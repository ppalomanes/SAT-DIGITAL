const express = require('express');
const router = express.Router();
const ConfiguracionesController = require('../controllers/ConfiguracionesController');

// Las rutas ya vienen protegidas con middleware de autenticación desde app.js
// No es necesario agregar middleware adicional aquí

// GET /api/configuraciones - Obtener configuración
router.get('/', ConfiguracionesController.obtenerConfiguracion);

// POST /api/configuraciones - Guardar configuración
router.post('/', ConfiguracionesController.guardarConfiguracion);

// POST /api/configuraciones/headsets - Upload archivo headsets
router.post('/headsets', ConfiguracionesController.uploadHeadsets);

// GET /api/configuraciones/:id/historial - Obtener historial
router.get('/:configuracion_id/historial', ConfiguracionesController.obtenerHistorial);

module.exports = router;
