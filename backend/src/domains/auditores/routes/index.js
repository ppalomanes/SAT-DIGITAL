// Rutas para Panel de Control de Auditores
// Checkpoint 2.5 - API endpoints para panel especializado de auditores

const express = require('express');
const router = express.Router();
const AuditoresController = require('../controllers/AuditoresController');
const { verificarToken, verificarRol } = require('../../../shared/middleware/authMiddleware');

// Middleware de autenticación para todas las rutas
router.use(verificarToken);

// Middleware para verificar rol de auditor
const verificarRolAuditor = verificarRol(['auditor_general', 'auditor_interno', 'admin']);

/**
 * @swagger
 * /api/auditores/resumen:
 *   get:
 *     summary: Obtener resumen ejecutivo para auditor
 *     tags: [Auditores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen ejecutivo obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 auditorias_asignadas:
 *                   type: number
 *                 pendientes_revision:
 *                   type: number
 *                 proximas_visitas:
 *                   type: number
 *                 alertas_activas:
 *                   type: number
 *                 auditoriasPorEstado:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       estado:
 *                         type: string
 *                       cantidad:
 *                         type: number
 *                       color:
 *                         type: string
 */
router.get('/resumen', verificarRolAuditor, AuditoresController.obtenerResumen);

/**
 * @swagger
 * /api/auditores/proximas-visitas:
 *   get:
 *     summary: Obtener próximas visitas del auditor
 *     tags: [Auditores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de visitas a retornar
 *     responses:
 *       200:
 *         description: Próximas visitas obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   sitio:
 *                     type: string
 *                   proveedor:
 *                     type: string
 *                   fecha:
 *                     type: string
 *                     format: date-time
 *                   estado:
 *                     type: string
 */
router.get('/proximas-visitas', verificarRolAuditor, AuditoresController.obtenerProximasVisitas);

/**
 * @swagger
 * /api/auditores/alertas-criticas:
 *   get:
 *     summary: Obtener alertas críticas del auditor
 *     tags: [Auditores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alertas críticas obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   tipo:
 *                     type: string
 *                   sitio:
 *                     type: string
 *                   proveedor:
 *                     type: string
 *                   mensaje:
 *                     type: string
 *                   severidad:
 *                     type: string
 *                     enum: [baja, media, alta]
 *                   fechaLimite:
 *                     type: string
 *                     format: date-time
 *                   auditoriaId:
 *                     type: number
 */
router.get('/alertas-criticas', verificarRolAuditor, AuditoresController.obtenerAlertasCriticas);

/**
 * @swagger
 * /api/auditores/actividad-reciente:
 *   get:
 *     summary: Obtener actividad reciente del auditor
 *     tags: [Auditores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de actividades a retornar
 *     responses:
 *       200:
 *         description: Actividad reciente obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tipo:
 *                     type: string
 *                     enum: [documento, mensaje]
 *                   descripcion:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   usuario:
 *                     type: string
 *                   auditoriaId:
 *                     type: number
 */
router.get('/actividad-reciente', verificarRolAuditor, AuditoresController.obtenerActividadReciente);

module.exports = router;