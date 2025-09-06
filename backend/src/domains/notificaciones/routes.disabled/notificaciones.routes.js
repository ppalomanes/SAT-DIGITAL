// backend/src/domains/notificaciones/routes/notificaciones.routes.js
const express = require('express');
const router = express.Router();
const NotificacionController = require('../controllers/NotificacionController');
const { verificarToken, verificarRol } = require('../../../shared/middleware/auth.middleware');

/**
 * @route   POST /api/notificaciones/enviar
 * @desc    Enviar notificación inmediata
 * @access  Admin/Auditor
 */
router.post('/enviar', 
  verificarToken,
  verificarRol('admin', 'auditor'),
  NotificacionController.enviarNotificacion
);

/**
 * @route   POST /api/notificaciones/configurar-recordatorios
 * @desc    Configurar recordatorios automáticos para auditoría
 * @access  Admin/Auditor
 */
router.post('/configurar-recordatorios',
  verificarToken,
  verificarRol('admin', 'auditor'),
  NotificacionController.configurarRecordatorios
);

/**
 * @route   GET /api/notificaciones/dashboard
 * @desc    Dashboard de notificaciones (para administradores)
 * @access  Admin
 */
router.get('/dashboard',
  verificarToken,
  verificarRol('admin'),
  NotificacionController.getDashboardNotificaciones
);

/**
 * @route   GET /api/notificaciones/configuracion
 * @desc    Obtener configuración de notificaciones del usuario
 * @access  Private
 */
router.get('/configuracion',
  verificarToken,
  NotificacionController.getConfiguracionUsuario
);

/**
 * @route   PUT /api/notificaciones/configuracion
 * @desc    Actualizar configuración de notificaciones del usuario
 * @access  Private
 */
router.put('/configuracion',
  verificarToken,
  NotificacionController.actualizarConfiguracionUsuario
);

/**
 * @route   POST /api/notificaciones/marcar-leidas
 * @desc    Marcar notificaciones como leídas
 * @access  Private
 */
router.post('/marcar-leidas',
  verificarToken,
  NotificacionController.marcarComoLeidas
);

/**
 * @route   GET /api/notificaciones/mis-notificaciones
 * @desc    Obtener notificaciones del usuario actual
 * @access  Private
 */
router.get('/mis-notificaciones',
  verificarToken,
  async (req, res) => {
    try {
      const { NotificacionUsuario } = require('../../../shared/database/models');
      const { limit = 20, offset = 0, solo_no_leidas = false } = req.query;

      const whereClause = { usuario_id: req.usuario.id };
      if (solo_no_leidas === 'true') {
        whereClause.leida = false;
      }

      const notificaciones = await NotificacionUsuario.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          notificaciones: notificaciones.rows.map(n => ({
            id: n.id,
            tipo: n.tipo_notificacion,
            titulo: n.titulo,
            contenido: n.contenido,
            leida: n.leida,
            fecha: n.created_at,
            enlace_accion: n.enlace_accion
          })),
          total: notificaciones.count,
          no_leidas: await NotificacionUsuario.count({
            where: { usuario_id: req.usuario.id, leida: false }
          })
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo notificaciones'
      });
    }
  }
);

/**
 * @route   POST /api/notificaciones/test-email
 * @desc    Enviar email de prueba (solo desarrollo)
 * @access  Admin
 */
router.post('/test-email',
  verificarToken,
  verificarRol('admin'),
  async (req, res) => {
    try {
      const EmailService = require('../services/EmailService');
      const { tipo = 'inicio-periodo', email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email requerido para prueba'
        });
      }

      // Datos de prueba
      const datosTest = {
        proveedor: 'Proveedor Test',
        sitio: 'Sitio Test',
        periodo: '2025-05',
        fechaLimite: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        diasRestantes: 7,
        enlaceAcceso: `${process.env.FRONTEND_URL}/test`,
        contactoSoporte: 'test@satdigital.com'
      };

      const resultado = await EmailService.sendEmail({
        to: email,
        subject: `[TEST] ${tipo} - SAT Digital`,
        template: tipo,
        data: datosTest
      });

      res.json({
        success: true,
        mensaje: 'Email de prueba enviado',
        resultado
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error enviando email de prueba',
        detalle: error.message
      });
    }
  }
);

module.exports = router;
