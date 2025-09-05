// Servicio de Mensajería para chat contextual
// Checkpoint 2.3 - Sistema Comunicación Asíncrona

const Conversacion = require('../models/Conversacion');
const Mensaje = require('../models/Mensaje');
const NotificacionUsuario = require('../models/NotificacionUsuario');
const { Usuario, Auditoria, Sitio, SeccionTecnica, Op } = require('../../../shared/database/models');
const NotificacionService = require('./NotificacionService');
const { registrarBitacora } = require('../../../shared/utils/bitacora');

class MensajeriaService {
  static async crearConversacion(auditoriaId, datos, usuarioCreador) {
    try {
      const conversacion = await Conversacion.create({
        auditoria_id: auditoriaId,
        seccion_id: datos.seccion_id || null,
        titulo: datos.titulo,
        categoria: datos.categoria || 'tecnico',
        prioridad: datos.prioridad || 'normal',
        iniciada_por: usuarioCreador.id
      });

      // Registrar en bitácora
      await registrarBitacora(
        usuarioCreador.id,
        'CONVERSACION_CREADA',
        'Conversacion',
        conversacion.id,
        `Nueva conversación: ${datos.titulo}`,
        null
      );

      // Mensaje inicial si se proporciona
      if (datos.mensaje_inicial) {
        await this.enviarMensaje(conversacion.id, {
          contenido: datos.mensaje_inicial,
          tipo_mensaje: 'texto'
        }, usuarioCreador);
      }

      // Notificar a auditores correspondientes
      await this.notificarNuevaConversacion(conversacion, usuarioCreador);

      return conversacion;
    } catch (error) {
      throw new Error(`Error creando conversación: ${error.message}`);
    }
  }

  static async enviarMensaje(conversacionId, datosMensaje, usuario) {
    try {
      const conversacion = await Conversacion.findByPk(conversacionId, {
        include: [
          { model: Auditoria, as: 'auditoria', include: [{ model: Sitio, as: 'sitio' }] },
          { model: SeccionTecnica, as: 'seccion' }
        ]
      });

      if (!conversacion) {
        throw new Error('Conversación no encontrada');
      }

      // Verificar permisos
      await this.verificarPermisosConversacion(conversacion, usuario);

      const mensaje = await Mensaje.create({
        conversacion_id: conversacionId,
        usuario_id: usuario.id,
        contenido: datosMensaje.contenido,
        tipo_mensaje: datosMensaje.tipo_mensaje || 'texto',
        archivo_adjunto: datosMensaje.archivo_adjunto,
        referencia_documento_id: datosMensaje.referencia_documento_id,
        responde_a_mensaje_id: datosMensaje.responde_a_mensaje_id,
        ip_origen: datosMensaje.ip_origen
      });

      // Actualizar estado de conversación
      await conversacion.update({
        estado: 'en_proceso',
        updated_at: new Date()
      });

      // Notificar mensaje nuevo
      await this.notificarMensajeNuevo(conversacion, mensaje, usuario);

      return mensaje;
    } catch (error) {
      throw new Error(`Error enviando mensaje: ${error.message}`);
    }
  }

  static async obtenerConversacionesAuditoria(auditoriaId, usuario) {
    try {
      let whereClause = { auditoria_id: auditoriaId };

      // Filtrar por permisos del usuario
      if (usuario.rol === 'proveedor') {
        // Verificar que la auditoría pertenezca a su proveedor
        const auditoria = await Auditoria.findByPk(auditoriaId, {
          include: [{ model: Sitio, as: 'sitio' }]
        });

        if (!auditoria || auditoria.sitio.proveedor_id !== usuario.proveedor_id) {
          throw new Error('Sin permisos para acceder a estas conversaciones');
        }
      }

      const conversaciones = await Conversacion.findAll({
        where: whereClause,
        include: [
          {
            model: Mensaje,
            as: 'mensajes',
            limit: 5,
            order: [['created_at', 'DESC']],
            include: [{ model: Usuario, as: 'usuario' }]
          },
          { model: Usuario, as: 'iniciador' },
          { model: SeccionTecnica, as: 'seccion' }
        ],
        order: [['updated_at', 'DESC']]
      });

      return conversaciones;
    } catch (error) {
      throw new Error(`Error obteniendo conversaciones: ${error.message}`);
    }
  }

  static async marcarComoLeida(conversacionId, usuarioId) {
    try {
      // Marcar mensajes no leídos como leídos
      await Mensaje.update(
        { estado_mensaje: 'leido' },
        {
          where: {
            conversacion_id: conversacionId,
            usuario_id: { [Op.ne]: usuarioId },
            estado_mensaje: 'enviado'
          }
        }
      );

      return true;
    } catch (error) {
      throw new Error(`Error marcando como leída: ${error.message}`);
    }
  }

  static async notificarNuevaConversacion(conversacion, usuarioCreador) {
    try {
      // Obtener auditor asignado
      const auditoria = await Auditoria.findByPk(conversacion.auditoria_id);
      
      if (auditoria && auditoria.auditor_asignado_id && auditoria.auditor_asignado_id !== usuarioCreador.id) {
        await NotificacionService.enviarNotificacion(
          auditoria.auditor_asignado_id,
          'mensaje_nuevo',
          'Nueva consulta técnica',
          `${usuarioCreador.nombre} inició una nueva consulta: ${conversacion.titulo}`,
          `/auditorias/${conversacion.auditoria_id}/conversaciones/${conversacion.id}`
        );
      }
    } catch (error) {
      console.error('Error notificando nueva conversación:', error);
    }
  }

  static async notificarMensajeNuevo(conversacion, mensaje, usuarioEmisor) {
    // Implementar notificación por WebSocket y email
  }

  static async verificarPermisosConversacion(conversacion, usuario) {
    switch (usuario.rol) {
      case 'admin':
        return true;

      case 'auditor':
        // Verificar si es el auditor asignado
        const auditoria = await Auditoria.findByPk(conversacion.auditoria_id);
        if (auditoria.auditor_asignado_id !== usuario.id) {
          throw new Error('Sin permisos para acceder a esta conversación');
        }
        break;

      case 'proveedor':
        // Verificar que pertenece al proveedor correcto
        const auditoriaConSitio = await Auditoria.findByPk(conversacion.auditoria_id, {
          include: [{ model: Sitio, as: 'sitio' }]
        });
        if (auditoriaConSitio.sitio.proveedor_id !== usuario.proveedor_id) {
          throw new Error('Sin permisos para acceder a esta conversación');
        }
        break;

      default:
        throw new Error('Rol de usuario no autorizado');
    }

    return true;
  }
}

module.exports = MensajeriaService;
