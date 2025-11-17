const express = require('express');
const router = express.Router();
const HeadsetsController = require('../controllers/HeadsetsController');

/**
 * Rutas de Headsets Homologados
 *
 * Todas las rutas están protegidas por autenticación (middleware en app.js).
 * El tenant_id se extrae del JWT (req.user.tenant_id).
 *
 * Endpoints:
 * - GET    /api/headsets              → Lista todos los headsets del tenant
 * - GET    /api/headsets/estadisticas → Obtiene estadísticas de headsets
 * - GET    /api/headsets/verificar    → Verifica si un headset está homologado
 * - GET    /api/headsets/:id          → Obtiene un headset específico
 * - POST   /api/headsets              → Crea un nuevo headset
 * - PUT    /api/headsets/:id          → Actualiza un headset
 * - DELETE /api/headsets/:id          → Desactiva un headset (soft delete)
 *
 * @module HeadsetsRoutes
 */

// =============================================================================
// RUTAS DE CONSULTA (GET)
// =============================================================================

/**
 * GET /api/headsets
 * Lista todos los headsets homologados del tenant actual
 *
 * Query params opcionales:
 * - page: número de página (default: 1)
 * - limit: elementos por página (default: 100)
 * - marca: filtrar por marca exacta
 * - conector: filtrar por tipo de conector
 * - activo: filtrar por estado (true/false)
 * - search: buscar en marca o modelo
 *
 * Response:
 * {
 *   success: true,
 *   data: [...headsets],
 *   pagination: {
 *     total: number,
 *     page: number,
 *     limit: number,
 *     totalPages: number
 *   }
 * }
 */
router.get('/', HeadsetsController.listarHeadsets.bind(HeadsetsController));

/**
 * GET /api/headsets/estadisticas
 * Obtiene estadísticas de headsets homologados
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     total: number,
 *     activos: number,
 *     inactivos: number,
 *     porMarca: [{marca, cantidad}],
 *     porConector: [{conector, cantidad}]
 *   }
 * }
 */
router.get('/estadisticas', HeadsetsController.obtenerEstadisticas.bind(HeadsetsController));

/**
 * GET /api/headsets/verificar
 * Verifica si un headset está homologado (validación rápida)
 *
 * Query params requeridos:
 * - marca: marca del headset
 * - modelo: modelo del headset
 *
 * Response:
 * {
 *   success: true,
 *   homologado: boolean,
 *   headset: Object|null
 * }
 */
router.get('/verificar', HeadsetsController.verificarHomologacion.bind(HeadsetsController));

/**
 * GET /api/headsets/:id
 * Obtiene un headset específico por ID
 *
 * Response:
 * {
 *   success: true,
 *   data: {headset completo}
 * }
 */
router.get('/:id', HeadsetsController.obtenerHeadset.bind(HeadsetsController));

// =============================================================================
// RUTAS DE CREACIÓN (POST)
// =============================================================================

/**
 * POST /api/headsets
 * Crea un nuevo headset homologado
 *
 * Body:
 * {
 *   marca: string (requerido),
 *   modelo: string (requerido),
 *   conector: string (requerido),
 *   activo: boolean (default: true),
 *   observaciones: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: string,
 *   data: {headset creado}
 * }
 */
router.post('/', HeadsetsController.crearHeadset.bind(HeadsetsController));

// =============================================================================
// RUTAS DE ACTUALIZACIÓN (PUT)
// =============================================================================

/**
 * PUT /api/headsets/:id
 * Actualiza un headset existente
 *
 * Body: (todos los campos son opcionales)
 * {
 *   marca: string,
 *   modelo: string,
 *   conector: string,
 *   activo: boolean,
 *   observaciones: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: string,
 *   data: {headset actualizado}
 * }
 */
router.put('/:id', HeadsetsController.actualizarHeadset.bind(HeadsetsController));

// =============================================================================
// RUTAS DE ELIMINACIÓN (DELETE)
// =============================================================================

/**
 * DELETE /api/headsets/:id
 * Desactiva un headset (soft delete)
 *
 * No elimina el registro, solo marca activo = false
 *
 * Response:
 * {
 *   success: true,
 *   message: string
 * }
 */
router.delete('/:id', HeadsetsController.eliminarHeadset.bind(HeadsetsController));

module.exports = router;
