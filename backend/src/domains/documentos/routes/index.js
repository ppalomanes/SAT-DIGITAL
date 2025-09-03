const express = require('express');
const { verificarToken, verificarRol } = require('../../../shared/middleware/authMiddleware');
const { upload, handleMulterError } = require('../middleware/upload.middleware');
const CargaController = require('../controllers/CargaController');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(verificarToken);

/**
 * @route POST /api/documentos/cargar
 * @description Cargar documentos para una auditoría
 * @access Proveedor, Auditor, Admin
 */
router.post('/cargar', 
  verificarRol('proveedor', 'auditor', 'admin'),
  upload,
  handleMulterError,
  CargaController.cargar
);

/**
 * @route GET /api/documentos/auditoria/:auditoria_id
 * @description Obtener documentos de una auditoría
 * @access Según permisos de auditoría
 */
router.get('/auditoria/:auditoria_id',
  CargaController.obtenerDocumentos
);

/**
 * @route DELETE /api/documentos/:documento_id
 * @description Eliminar un documento
 * @access Proveedor (solo sus documentos), Auditor, Admin
 */
router.delete('/:documento_id',
  verificarRol('proveedor', 'auditor', 'admin'),
  CargaController.eliminar
);

/**
 * @route GET /api/documentos/progreso/:auditoria_id
 * @description Obtener progreso de carga de auditoría
 * @access Según permisos de auditoría
 */
router.get('/progreso/:auditoria_id', async (req, res) => {
  try {
    const progreso = await CargaController.calcularProgreso(req.params.auditoria_id);
    res.json({
      success: true,
      progreso
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error calculando progreso'
    });
  }
});

module.exports = router;