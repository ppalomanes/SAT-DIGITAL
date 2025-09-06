// Controlador de Mensajes para chat contextual
// Checkpoint 2.3 - Sistema Comunicación Asíncrona

const MensajeriaService = require('../services/MensajeriaService');
const { validationResult } = require('express-validator');
const { z } = require('zod');

const mensajeSchema = z.object({
  contenido: z.string().min(1).max(2000),
  tipo_mensaje: z.enum(['texto', 'archivo', 'sistema']).optional(),
  archivo_adjunto: z.string().optional(),
  referencia_documento_id: z.number().optional(),
  responde_a_mensaje_id: z.number().optional()
});

const conversacionSchema = z.object({
  titulo: z.string().min(1).max(255),
  categoria: z.enum(['tecnico', 'administrativo', 'solicitud', 'problema']).optional(),
  prioridad: z.enum(['baja', 'normal', 'alta']).optional(),
  seccion_id: z.number().nullable().optional(),
  mensaje_inicial: z.string().optional()
});

class MensajeController {
  static async crearConversacion(req, res) {
    try {
      const { auditoriaId } = req.params;
      const datos = conversacionSchema.parse(req.body);
      
      const conversacion = await MensajeriaService.crearConversacion(
        auditoriaId,
        datos,
        req.usuario
      );

      res.status(201).json({
        success: true,
        data: conversacion,
        message: 'Conversación creada exitosamente'
      });
    } catch (error) {
      console.error('❌ Error en crearConversacion:', error);
      
      // Si es error de validación de Zod
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Datos de conversación inválidos',
          errors: error.errors
        });
      }
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async enviarMensaje(req, res) {
    try {
      const { conversacionId } = req.params;
      const datosMensaje = mensajeSchema.parse(req.body);
      
      // Agregar IP de origen
      datosMensaje.ip_origen = req.ip;

      const mensaje = await MensajeriaService.enviarMensaje(
        conversacionId,
        datosMensaje,
        req.usuario
      );

      // Enviar notificación push a través de WebSocket
      if (req.chatHandler && mensaje) {
        req.chatHandler.notificarMensajeNuevo(conversacionId, mensaje, req.usuario);
        
        // También enviar notificación general
        const datosNotificacion = {
          tipo: 'mensaje',
          titulo: `Nuevo mensaje en ${mensaje.conversacion?.titulo || 'chat'}`,
          mensaje: `${req.usuario.nombre}: ${mensaje.contenido.substring(0, 100)}${mensaje.contenido.length > 100 ? '...' : ''}`,
          conversacion_id: conversacionId,
          autor: {
            id: req.usuario.id,
            nombre: req.usuario.nombre,
            rol: req.usuario.rol
          }
        };

        // Broadcast a todos los usuarios (excepto el emisor)
        req.io.emit('nueva_notificacion', datosNotificacion);
      }

      res.status(201).json({
        success: true,
        data: mensaje,
        message: 'Mensaje enviado exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async obtenerConversaciones(req, res) {
    try {
      const { auditoriaId } = req.params;
      
      const conversaciones = await MensajeriaService.obtenerConversacionesAuditoria(
        auditoriaId,
        req.usuario
      );

      res.json({
        success: true,
        data: conversaciones
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async marcarLeida(req, res) {
    try {
      const { conversacionId } = req.params;
      
      await MensajeriaService.marcarComoLeida(conversacionId, req.usuario.id);

      res.json({
        success: true,
        message: 'Conversación marcada como leída'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = MensajeController;
