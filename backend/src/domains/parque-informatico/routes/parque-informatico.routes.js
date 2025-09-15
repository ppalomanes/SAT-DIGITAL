/**
 * SAT-Digital Backend - Parque Informático Routes
 * Rutas para análisis de inventario de hardware con IA integrada
 */

const express = require('express');
const router = express.Router();
const ParqueInformaticoController = require('../controllers/ParqueInformaticoController');
const { verificarToken, verificarRol } = require('../../../shared/middleware/authMiddleware');

// Instanciar controlador
const parqueController = new ParqueInformaticoController();

// Endpoint de información del servicio (sin auth para documentación)
router.get('/info', parqueController.getServiceInfo);

// Middleware de autenticación para todas las otras rutas
router.use(verificarToken);

/**
 * @swagger
 * /api/parque-informatico/process:
 *   post:
 *     summary: Procesar archivo Excel con inventario de hardware
 *     tags: [Parque Informático]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo Excel con datos de hardware
 *               customRules:
 *                 type: string
 *                 description: JSON con reglas de validación personalizadas (opcional)
 *     responses:
 *       200:
 *         description: Archivo procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     normalizedData:
 *                       type: array
 *                       description: Datos normalizados de hardware
 *                     stats:
 *                       type: object
 *                       description: Estadísticas del análisis
 *                     recommendations:
 *                       type: array
 *                       description: Recomendaciones automáticas
 *                     totalRecords:
 *                       type: number
 *                     validRecords:
 *                       type: number
 *       400:
 *         description: Error en el archivo o parámetros
 *       401:
 *         description: No autorizado
 */
router.post('/process', 
  verificarRol('admin', 'auditor_general', 'auditor_interno'),
  ParqueInformaticoController.getUploadMiddleware(),
  parqueController.processHardwareFile
);

/**
 * @swagger
 * /api/parque-informatico/demo-data:
 *   get:
 *     summary: Generar datos de demostración para testing
 *     tags: [Parque Informático]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos de demostración generados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: Datos procesados de la demostración
 *                 message:
 *                   type: string
 */
router.get('/demo-data',
  verificarRol('admin', 'auditor_general', 'auditor_interno'),
  parqueController.generateDemoData
);

/**
 * @swagger
 * /api/parque-informatico/validation-rules:
 *   get:
 *     summary: Obtener reglas de validación actuales
 *     tags: [Parque Informático]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reglas de validación obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     rules:
 *                       type: object
 *                       description: Reglas de validación por categoría
 *                     description:
 *                       type: string
 *                     modifiable:
 *                       type: boolean
 *                     aiEnhanced:
 *                       type: boolean
 */
router.get('/validation-rules',
  verificarRol('admin', 'auditor_general', 'auditor_interno'),
  parqueController.getValidationRules
);

/**
 * @swagger
 * /api/parque-informatico/validation-rules:
 *   put:
 *     summary: Actualizar reglas de validación
 *     tags: [Parque Informático]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rules:
 *                 type: object
 *                 description: Nuevas reglas de validación
 *                 properties:
 *                   cpu:
 *                     type: object
 *                     properties:
 *                       minSpeedIntel:
 *                         type: number
 *                       minSpeedAMD:
 *                         type: number
 *                   ram:
 *                     type: object
 *                     properties:
 *                       minSize:
 *                         type: number
 *                   storage:
 *                     type: object
 *                     properties:
 *                       minCapacity:
 *                         type: number
 *                   network:
 *                     type: object
 *                     properties:
 *                       minDownloadSpeed:
 *                         type: number
 *                       minUploadSpeed:
 *                         type: number
 *     responses:
 *       200:
 *         description: Reglas actualizadas exitosamente
 *       400:
 *         description: Reglas inválidas
 *       403:
 *         description: Permisos insuficientes
 */
router.put('/validation-rules',
  verificarRol('admin', 'auditor_general'),
  parqueController.updateValidationRules
);

// ============================================================================
// RUTAS PREPARADAS PARA FASE 3 - INTELIGENCIA ARTIFICIAL
// ============================================================================

/**
 * @swagger
 * /api/parque-informatico/ai-analyze:
 *   post:
 *     summary: Análisis automático con IA (Ollama/LLaVA) - FASE 3
 *     tags: [Parque Informático - IA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dataId:
 *                 type: string
 *                 description: ID del dataset a analizar
 *               aiModel:
 *                 type: string
 *                 enum: [llava, llama3.1]
 *                 description: Modelo de IA a utilizar
 *     responses:
 *       200:
 *         description: Análisis con IA completado
 *       501:
 *         description: Funcionalidad no implementada (Fase 3)
 */
router.post('/ai-analyze',
  verificarRol('admin', 'auditor_general'),
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Funcionalidad de IA no implementada aún (Fase 3)',
      availableIn: 'Fase 3 - Integración Ollama/LLaVA',
      plannedFeatures: [
        'Análisis automático de documentos',
        'Scoring inteligente por IA',
        'Detección de anomalías',
        'Recomendaciones avanzadas'
      ]
    });
  }
);

/**
 * @swagger
 * /api/parque-informatico/ai-score:
 *   post:
 *     summary: Scoring automático con IA - FASE 3
 *     tags: [Parque Informático - IA]
 *     security:
 *       - bearerAuth: []
 */
router.post('/ai-score',
  verificarRol('admin', 'auditor_general'),
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Sistema de scoring automático no implementado aún (Fase 3)',
      plannedCapabilities: [
        'Scoring por algoritmos de ML',
        'Evaluación automática de compliance',
        'Alertas inteligentes',
        'Predicción de fallos de hardware'
      ]
    });
  }
);

/**
 * @swagger
 * /api/parque-informatico/ai-recommendations:
 *   get:
 *     summary: Recomendaciones avanzadas por IA - FASE 3
 *     tags: [Parque Informático - IA]
 *     security:
 *       - bearerAuth: []
 */
router.get('/ai-recommendations',
  verificarRol('admin', 'auditor_general', 'auditor_interno'),
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Sistema de recomendaciones por IA no implementado aún (Fase 3)',
      currentRecommendations: 'Disponibles con reglas estáticas',
      aiEnhancedFeatures: [
        'Recomendaciones contextuales',
        'Análisis de tendencias',
        'Optimización de costos',
        'Planificación predictiva'
      ]
    });
  }
);

module.exports = router;