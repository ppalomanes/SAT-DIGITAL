// Servicio de Notificaciones para chat y alertas
// Checkpoint 2.3 - Sistema Comunicación Asíncrona

const NotificacionUsuario = require('../models/NotificacionUsuario');
const { Usuario } = require('../../../shared/database/models');

class NotificacionService {
  static async enviarNotificacion(usuarioId, tipo, titulo, contenido, enlace = null, dataAdicional = {}) {
    try {
      const notificacion = await NotificacionUsuario.create({
        usuario_id: usuarioId,
        tipo_notificacion: tipo,
        titulo,
        contenido,
        enlace_accion: enlace,
        data_adicional: dataAdicional
      });

      return notificacion;
    } catch (error) {
      throw new Error(`Error creando notificación: ${error.message}`);
    }
  }

  static async obtenerNotificacionesUsuario(usuarioId, soloNoLeidas = false) {
    try {
      const whereClause = { usuario_id: usuarioId };
      if (soloNoLeidas) {
        whereClause.leida = false;
      }

      const notificaciones = await NotificacionUsuario.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: 50
      });

      return notificaciones;
    } catch (error) {
      throw new Error(`Error obteniendo notificaciones: ${error.message}`);
    }
  }

  static async marcarComoLeida(notificacionId, usuarioId) {
    try {
      await NotificacionUsuario.update(
        { leida: true, leida_en: new Date() },
        { where: { id: notificacionId, usuario_id: usuarioId } }
      );

      return true;
    } catch (error) {
      throw new Error(`Error marcando notificación como leída: ${error.message}`);
    }
  }

  static async contarNoLeidas(usuarioId) {
    try {
      const count = await NotificacionUsuario.count({
        where: { usuario_id: usuarioId, leida: false }
      });

      return count;
    } catch (error) {
      return 0;
    }
  }
}

module.exports = NotificacionService;
