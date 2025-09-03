// WebSocket Handler para chat en tiempo real
// Checkpoint 2.3 - Sistema Comunicación Asíncrona

const jwt = require('jsonwebtoken');
const { Usuario } = require('../../../shared/database/models');

class ChatHandler {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Middleware de autenticación WebSocket
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Token requerido'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await Usuario.findByPk(decoded.id);
        
        if (!usuario || usuario.estado !== 'activo') {
          return next(new Error('Usuario inválido'));
        }

        socket.usuario = usuario;
        next();
      } catch (error) {
        next(new Error('Token inválido'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`✅ Usuario conectado: ${socket.usuario.nombre} (${socket.usuario.email})`);
      
      // Registrar usuario conectado
      this.connectedUsers.set(socket.usuario.id, {
        socketId: socket.id,
        usuario: socket.usuario,
        conectadoEn: new Date()
      });

      // Unirse a sala personal para notificaciones
      socket.join(`user_${socket.usuario.id}`);

      // Eventos del chat
      this.setupChatEvents(socket);
      
      // Eventos de notificaciones
      this.setupNotificationEvents(socket);

      // Desconexión
      socket.on('disconnect', () => {
        console.log(`❌ Usuario desconectado: ${socket.usuario.nombre}`);
        this.connectedUsers.delete(socket.usuario.id);
      });
    });
  }

  setupChatEvents(socket) {
    // Unirse a conversación específica
    socket.on('join_conversation', (conversacionId) => {
      socket.join(`conversation_${conversacionId}`);
      console.log(`📝 Usuario ${socket.usuario.nombre} se unió a conversación ${conversacionId}`);
    });

    // Salir de conversación
    socket.on('leave_conversation', (conversacionId) => {
      socket.leave(`conversation_${conversacionId}`);
      console.log(`📝 Usuario ${socket.usuario.nombre} salió de conversación ${conversacionId}`);
    });

    // Usuario escribiendo
    socket.on('typing', ({ conversacionId }) => {
      socket.to(`conversation_${conversacionId}`).emit('user_typing', {
        usuarioId: socket.usuario.id,
        usuario: socket.usuario.nombre
      });
    });

    // Usuario dejó de escribir
    socket.on('stop_typing', ({ conversacionId }) => {
      socket.to(`conversation_${conversacionId}`).emit('user_stop_typing', {
        usuarioId: socket.usuario.id
      });
    });

    // Mensaje leído
    socket.on('message_read', ({ mensajeId, conversacionId }) => {
      socket.to(`conversation_${conversacionId}`).emit('message_read_confirmation', {
        mensajeId,
        leidoPor: socket.usuario.id
      });
    });
  }

  setupNotificationEvents(socket) {
    // Solicitar notificaciones no leídas
    socket.on('get_unread_notifications', () => {
      // Este evento será manejado por el controlador, aquí solo confirmamos
      socket.emit('notifications_requested');
    });

    // Marcar notificación como leída
    socket.on('mark_notification_read', ({ notificacionId }) => {
      // Confirmar que se marcó como leída
      socket.emit('notification_read_confirmed', { notificacionId });
    });
  }

  // Métodos para enviar eventos desde el backend
  notificarMensajeNuevo(conversacionId, mensaje, emisor) {
    // Enviar a todos en la conversación excepto el emisor
    this.io.to(`conversation_${conversacionId}`).except(emisor.socketId || '').emit('new_message', {
      mensaje,
      emisor: {
        id: emisor.id,
        nombre: emisor.nombre,
        rol: emisor.rol
      }
    });
  }

  notificarUsuario(usuarioId, tipo, data) {
    // Enviar notificación a usuario específico
    this.io.to(`user_${usuarioId}`).emit('notification', {
      tipo,
      data,
      timestamp: new Date()
    });
  }

  notificarCambioEstado(auditoriaId, nuevoEstado) {
    // Notificar cambio de estado de auditoría
    this.io.emit('audit_status_changed', {
      auditoriaId,
      nuevoEstado,
      timestamp: new Date()
    });
  }

  obtenerUsuariosConectados() {
    return Array.from(this.connectedUsers.values()).map(user => ({
      id: user.usuario.id,
      nombre: user.usuario.nombre,
      rol: user.usuario.rol,
      conectadoEn: user.conectadoEn
    }));
  }

  obtenerEstadoConexion(usuarioId) {
    return this.connectedUsers.has(usuarioId);
  }
}

module.exports = ChatHandler;
