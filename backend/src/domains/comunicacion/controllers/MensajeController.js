// Controlador de Mensajes para chat contextual
// Checkpoint 2.3 - Sistema Comunicación Asíncrona

const MensajeriaService = require('../services/MensajeriaService');
const { validationResult } = require('express-validator');
const { z } = require('zod');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const mensajeSchema = z.object({
  contenido: z.string().min(1).max(2000),
  tipo_mensaje: z.enum(['texto', 'archivo', 'sistema']).optional(),
  archivo_adjunto: z.string().optional(),
  referencia_documento_id: z.number().optional(),
  responde_a_mensaje_id: z.number().nullable().optional()
});

const conversacionSchema = z.object({
  titulo: z.string().min(1).max(255),
  categoria: z.enum(['tecnico', 'administrativo', 'solicitud', 'problema']).optional(),
  prioridad: z.enum(['baja', 'normal', 'alta']).optional(),
  seccion_id: z.number().nullable().optional(),
  mensaje_inicial: z.string().optional()
});

// Configuración de Multer para archivos de chat
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/chat');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    const sanitizedBasename = basename.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${timestamp}_${sanitizedBasename}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  }
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
      console.log('📝 DEBUG - Enviar mensaje:', {
        conversacionId,
        body: req.body,
        usuario: req.usuario?.email
      });
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
        
        // Determinar tipo de notificación
        const esRespuesta = datosMensaje.responde_a_mensaje_id;
        const tipoNotificacion = esRespuesta ? 'respuesta' : 'mensaje';
        
        const datosNotificacion = {
          tipo: tipoNotificacion,
          titulo: esRespuesta ? 'Nueva respuesta' : `Nuevo mensaje en ${mensaje.conversacion?.titulo || 'chat'}`,
          mensaje: `${req.usuario.nombre}: ${mensaje.contenido.substring(0, 100)}${mensaje.contenido.length > 100 ? '...' : ''}`,
          conversacion_id: conversacionId,
          mensaje_id: mensaje.id,
          autor: {
            id: req.usuario.id,
            nombre: req.usuario.nombre,
            rol: req.usuario.rol
          }
        };

        // Si es una respuesta, emitir evento específico
        if (esRespuesta) {
          req.io.emit('respuesta_mensaje', datosNotificacion);
        } else {
          req.io.emit('nueva_notificacion', datosNotificacion);
        }
      }

      res.status(201).json({
        success: true,
        data: mensaje,
        message: 'Mensaje enviado exitosamente'
      });
    } catch (error) {
      console.error('❌ ERROR enviando mensaje:', {
        error: error.message,
        stack: error.stack,
        body: req.body,
        conversacionId: req.params.conversacionId
      });
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

  static async enviarMensajeConArchivo(req, res) {
    try {
      const { conversacionId } = req.params;
      const { contenido, responde_a_mensaje_id } = req.body;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }

      const datosMensaje = {
        contenido: contenido || `📎 ${req.file.originalname}`,
        tipo_mensaje: 'archivo',
        archivo_adjunto: `/uploads/chat/${req.file.filename}`,
        responde_a_mensaje_id: responde_a_mensaje_id ? parseInt(responde_a_mensaje_id) : null,
        ip_origen: req.ip
      };

      const mensaje = await MensajeriaService.enviarMensaje(
        conversacionId,
        datosMensaje,
        req.usuario
      );

      // Agregar información del archivo al mensaje
      mensaje.archivo_info = {
        nombre_original: req.file.originalname,
        nombre_archivo: req.file.filename,
        tipo_mime: req.file.mimetype,
        tamaño: req.file.size,
        ruta: datosMensaje.archivo_adjunto
      };

      // Enviar notificación push a través de WebSocket
      if (req.chatHandler && mensaje) {
        req.chatHandler.notificarMensajeNuevo(conversacionId, mensaje, req.usuario);
        
        // Notificación específica para archivos
        const datosNotificacion = {
          tipo: 'archivo',
          titulo: `Nuevo archivo compartido`,
          mensaje: `${req.usuario.nombre} compartió: ${req.file.originalname}`,
          conversacion_id: conversacionId,
          mensaje_id: mensaje.id,
          archivo_nombre: req.file.originalname,
          archivo_url: datosMensaje.archivo_adjunto,
          autor: {
            id: req.usuario.id,
            nombre: req.usuario.nombre,
            rol: req.usuario.rol
          }
        };

        // Emitir evento específico para archivos
        req.io.emit('archivo_compartido', datosNotificacion);
      }

      res.status(201).json({
        success: true,
        data: mensaje,
        message: 'Archivo enviado exitosamente'
      });
    } catch (error) {
      console.error('❌ Error enviando archivo:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async marcarMensajeComoLeido(req, res) {
    try {
      const { mensajeId } = req.params;
      
      await MensajeriaService.marcarMensajeComoLeido(mensajeId, req.usuario.id);

      res.json({
        success: true,
        message: 'Mensaje marcado como leído'
      });
    } catch (error) {
      console.error('❌ Error marcando mensaje como leído:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Método middleware para upload
  static getUploadMiddleware() {
    return upload.single('archivo');
  }
}

module.exports = MensajeController;
