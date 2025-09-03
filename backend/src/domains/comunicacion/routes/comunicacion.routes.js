// Rutas para sistema de mensajería y chat
// Checkpoint 2.3 - Sistema Comunicación Asíncrona

const express = require('express');
const router = express.Router();
const MensajeController = require('../controllers/MensajeController');
const NotificacionController = require('../controllers/NotificacionController');
const { verificarToken } = require('../../../shared/middleware/authMiddleware');

// Middleware de autenticación para todas las rutas
router.use(verificarToken);

// =============================================
// RUTAS DE CONVERSACIONES Y MENSAJES
// =============================================

// Obtener conversaciones de una auditoría
router.get('/auditorias/:auditoriaId/conversaciones', MensajeController.obtenerConversaciones);

// Crear nueva conversación en auditoría
router.post('/auditorias/:auditoriaId/conversaciones', MensajeController.crearConversacion);

// Enviar mensaje a conversación
router.post('/conversaciones/:conversacionId/mensajes', MensajeController.enviarMensaje);

// Marcar conversación como leída
router.put('/conversaciones/:conversacionId/leer', MensajeController.marcarLeida);

// =============================================
// RUTAS DE NOTIFICACIONES
// =============================================

// Obtener notificaciones del usuario
router.get('/notificaciones', NotificacionController.obtenerNotificaciones);

// Contar notificaciones no leídas
router.get('/notificaciones/count', NotificacionController.contarNoLeidas);

// Marcar notificación como leída
router.put('/notificaciones/:notificacionId/leer', NotificacionController.marcarComoLeida);

module.exports = router;
