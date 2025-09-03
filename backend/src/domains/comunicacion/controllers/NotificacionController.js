// Controlador de Notificaciones para alertas y avisos
// Checkpoint 2.3 - Sistema Comunicación Asíncrona

const NotificacionService = require('../services/NotificacionService');

class NotificacionController {
  static async obtenerNotificaciones(req, res) {
    try {
      const { soloNoLeidas } = req.query;
      
      const notificaciones = await NotificacionService.obtenerNotificacionesUsuario(
        req.usuario.id,
        soloNoLeidas === 'true'
      );

      res.json({
        success: true,
        data: notificaciones
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async marcarComoLeida(req, res) {
    try {
      const { notificacionId } = req.params;
      
      await NotificacionService.marcarComoLeida(notificacionId, req.usuario.id);

      res.json({
        success: true,
        message: 'Notificación marcada como leída'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async contarNoLeidas(req, res) {
    try {
      const count = await NotificacionService.contarNoLeidas(req.usuario.id);

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        data: { count: 0 }
      });
    }
  }
}

module.exports = NotificacionController;
