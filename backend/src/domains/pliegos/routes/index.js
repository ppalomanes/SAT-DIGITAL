const express = require('express');
const router = express.Router();
const PliegosController = require('../controllers/PliegosController');

/**
 * Rutas de Pliegos de Requisitos
 *
 * Todas las rutas están protegidas por autenticación (middleware en app.js).
 * El tenant_id se extrae del JWT (req.user.tenant_id).
 *
 * Endpoints:
 * - GET    /api/pliegos              → Lista todos los pliegos del tenant
 * - GET    /api/pliegos/:id          → Obtiene un pliego específico
 * - POST   /api/pliegos              → Crea un nuevo pliego
 * - PUT    /api/pliegos/:id          → Actualiza un pliego
 * - POST   /api/pliegos/:id/vigente  → Marca un pliego como vigente
 * - GET    /api/pliegos/:id/historial → Obtiene historial de versiones
 * - POST   /api/pliegos/:id/duplicar → Duplica un pliego
 * - DELETE /api/pliegos/:id          → Desactiva un pliego (soft delete)
 *
 * @module PliegosRoutes
 */

// =============================================================================
// RUTAS DE CONSULTA (GET)
// =============================================================================

/**
 * GET /api/pliegos
 * Lista todos los pliegos del tenant actual
 *
 * Query params opcionales:
 * - estado: filtrar por estado (activo, borrador, vencido, archivado)
 * - vigente: solo el pliego vigente (true/false)
 *
 * Response:
 * {
 *   success: true,
 *   data: [...pliegos],
 *   total: number
 * }
 */
router.get('/', PliegosController.listarPliegos.bind(PliegosController));

/**
 * GET /api/pliegos/:id
 * Obtiene un pliego específico con todos sus detalles
 *
 * Response:
 * {
 *   success: true,
 *   data: {pliego completo con todas las secciones}
 * }
 */
router.get('/:id', PliegosController.obtenerPliego.bind(PliegosController));

/**
 * GET /api/pliegos/:id/historial
 * Obtiene el historial completo de versiones de un pliego
 *
 * Response:
 * {
 *   success: true,
 *   data: [...versiones],
 *   total: number
 * }
 */
router.get('/:id/historial', PliegosController.obtenerHistorial.bind(PliegosController));

// =============================================================================
// RUTAS DE CREACIÓN (POST)
// =============================================================================

/**
 * POST /api/pliegos
 * Crea un nuevo pliego de requisitos
 *
 * Body:
 * {
 *   codigo: string (requerido),
 *   nombre: string (requerido),
 *   descripcion: string,
 *   vigencia_desde: date (requerido),
 *   vigencia_hasta: date,
 *   estado: string ('borrador'|'activo'|'vencido'|'archivado'),
 *   es_vigente: boolean,
 *   parque_informatico: object,
 *   conectividad: object,
 *   infraestructura: object,
 *   seguridad: object,
 *   documentacion: object,
 *   personal: object,
 *   archivo_headsets_path: string,
 *   archivo_headsets_nombre: string,
 *   total_headsets: number
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: string,
 *   data: {pliego creado}
 * }
 */
router.post('/', PliegosController.crearPliego.bind(PliegosController));

/**
 * POST /api/pliegos/:id/vigente
 * Marca un pliego como vigente (activo)
 *
 * Solo puede haber un pliego vigente por tenant.
 * Al marcar uno como vigente, todos los demás se desmarca.
 *
 * Response:
 * {
 *   success: true,
 *   message: string,
 *   data: {pliego actualizado}
 * }
 */
router.post('/:id/vigente', PliegosController.marcarVigente.bind(PliegosController));

/**
 * POST /api/pliegos/:id/duplicar
 * Duplica un pliego existente
 *
 * Body:
 * {
 *   nuevo_codigo: string (requerido),
 *   nuevo_nombre: string (opcional)
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: string,
 *   data: {pliego duplicado}
 * }
 */
router.post('/:id/duplicar', PliegosController.duplicarPliego.bind(PliegosController));

// =============================================================================
// RUTAS DE ACTUALIZACIÓN (PUT)
// =============================================================================

/**
 * PUT /api/pliegos/:id
 * Actualiza un pliego existente
 *
 * - Incrementa automáticamente la versión
 * - Guarda snapshot en historial
 * - Calcula diferencias
 *
 * Body: (todos los campos son opcionales)
 * {
 *   nombre: string,
 *   descripcion: string,
 *   vigencia_desde: date,
 *   vigencia_hasta: date,
 *   estado: string,
 *   es_vigente: boolean,
 *   parque_informatico: object,
 *   conectividad: object,
 *   infraestructura: object,
 *   seguridad: object,
 *   documentacion: object,
 *   personal: object,
 *   archivo_headsets_path: string,
 *   archivo_headsets_nombre: string,
 *   total_headsets: number,
 *   cambios_descripcion: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: string,
 *   data: {pliego actualizado}
 * }
 */
router.put('/:id', PliegosController.actualizarPliego.bind(PliegosController));

// =============================================================================
// RUTAS DE ELIMINACIÓN (DELETE)
// =============================================================================

/**
 * DELETE /api/pliegos/:id
 * Desactiva un pliego (soft delete)
 *
 * No elimina el registro, solo marca activo = false
 *
 * Response:
 * {
 *   success: true,
 *   message: string,
 *   data: {id, codigo}
 * }
 */
router.delete('/:id', PliegosController.desactivarPliego.bind(PliegosController));

module.exports = router;
