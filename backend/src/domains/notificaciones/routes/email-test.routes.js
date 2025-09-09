/**
 * SAT-Digital Backend - Rutas de Testing de Email Templates
 * Sistema de pruebas y validación para templates de email
 */

const express = require('express');
const router = express.Router();
const EmailTestController = require('../controllers/EmailTestController');
const { verificarToken, verificarRol } = require('../../../shared/middleware/authMiddleware');

// Endpoint de documentación específico para email testing (sin auth)
router.get('/info', (req, res) => {
  res.json({
    success: true,
    service: 'Email Template Testing System',
    version: '1.0.0',
    description: 'Sistema de pruebas para templates de email de SAT-Digital',
    endpoints: {
      'GET /templates': 'Listar templates disponibles',
      'POST /test/:template/:email': 'Probar template específico',
      'POST /test-all/:email': 'Probar todos los templates',
      'POST /bulk-test': 'Prueba de envío masivo',
      'GET /config': 'Verificar configuración SMTP'
    },
    features: [
      'Testing de templates HTML',
      'Envío masivo con control de límites',
      'Verificación de configuración SMTP',
      'Datos de ejemplo automáticos',
      'Reintentos automáticos',
      'Logging detallado'
    ],
    templateTypes: [
      'notificacion-general',
      'cambio-estado-auditoria', 
      'recordatorio-documentos',
      'resumen-diario'
    ],
    usage: {
      authentication: 'JWT Token requerido',
      authorization: 'Roles: admin, auditor_general, auditor_interno',
      rateLimit: 'Aplicado para envío masivo',
      maxBulkEmails: 20
    }
  });
});

// Middleware de autenticación para todas las otras rutas
router.use(verificarToken);


/**
 * @swagger
 * /api/notificaciones/email-test/templates:
 *   get:
 *     summary: Obtener lista de templates disponibles
 *     tags: [Email Testing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de templates obtenida exitosamente
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
 *                     templates:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           file:
 *                             type: string
 *                           type:
 *                             type: string
 */
router.get('/templates', verificarRol('admin', 'auditor_general', 'auditor_interno'), EmailTestController.obtenerTemplates);

/**
 * @swagger
 * /api/notificaciones/email-test/test/{template}/{email}:
 *   post:
 *     summary: Probar template específico enviando email de prueba
 *     tags: [Email Testing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: template
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del template a probar
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email de destino para la prueba
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sampleData:
 *                 type: object
 *                 description: Datos de ejemplo para el template
 *     responses:
 *       200:
 *         description: Template enviado exitosamente
 *       400:
 *         description: Error en los parámetros o envío del email
 */
router.post('/test/:template/:email', verificarRol('admin', 'auditor_general', 'auditor_interno'), EmailTestController.probarTemplate);

/**
 * @swagger
 * /api/notificaciones/email-test/test-all/{email}:
 *   post:
 *     summary: Probar todos los templates disponibles
 *     tags: [Email Testing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email de destino para las pruebas
 *     responses:
 *       200:
 *         description: Pruebas completadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     successful:
 *                       type: number
 *                     failed:
 *                       type: number
 *                     results:
 *                       type: array
 */
router.post('/test-all/:email', verificarRol('admin', 'auditor_general', 'auditor_interno'), EmailTestController.probarTodosTemplates);

/**
 * @swagger
 * /api/notificaciones/email-test/bulk-test:
 *   post:
 *     summary: Realizar prueba de envío masivo
 *     tags: [Email Testing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emails
 *               - template
 *             properties:
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de emails para el envío masivo
 *               template:
 *                 type: string
 *                 description: Nombre del template a utilizar
 *               data:
 *                 type: object
 *                 description: Datos para el template
 *     responses:
 *       200:
 *         description: Envío masivo completado
 *       400:
 *         description: Parámetros incorrectos
 */
router.post('/bulk-test', verificarRol('admin', 'auditor_general', 'auditor_interno'), EmailTestController.pruebaEnvioMasivo);

/**
 * @swagger
 * /api/notificaciones/email-test/config:
 *   get:
 *     summary: Verificar configuración SMTP y estado del servicio
 *     tags: [Email Testing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información de configuración obtenida
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
 *                     configuration:
 *                       type: object
 *                     connectionStatus:
 *                       type: string
 *                     templatesDirectory:
 *                       type: string
 *                     environment:
 *                       type: string
 */
router.get('/config', verificarRol('admin', 'auditor_general', 'auditor_interno'), EmailTestController.verificarConfiguracion);


module.exports = router;