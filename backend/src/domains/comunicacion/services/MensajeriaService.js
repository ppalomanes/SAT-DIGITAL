// Servicio de Mensajería para chat contextual
// Checkpoint 2.3 - Sistema Comunicación Asíncrona

const { sequelize } = require('../../../shared/database/connection');
const { Usuario, Auditoria, Sitio, SeccionTecnica, Op } = require('../../../shared/database/models');
const NotificacionService = require('./NotificacionService');
const { registrarBitacora } = require('../../../shared/utils/bitacora');
const logger = require('../../../shared/utils/logger');

class MensajeriaService {
  static async ensureChatTablesExist() {
    try {
      // Verificar si existen las tablas de chat y crearlas si no existen
      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name='conversaciones')
        BEGIN
          CREATE TABLE conversaciones (
            id int IDENTITY(1,1) PRIMARY KEY,
            auditoria_id int NOT NULL,
            seccion_id int NULL,
            titulo nvarchar(255) NOT NULL,
            categoria nvarchar(50) DEFAULT 'tecnico',
            estado nvarchar(50) DEFAULT 'abierta',
            prioridad nvarchar(50) DEFAULT 'normal',
            iniciada_por int NOT NULL,
            created_at datetime2 DEFAULT GETDATE(),
            updated_at datetime2 DEFAULT GETDATE()
          )
        END
      `);

      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name='mensajes')
        BEGIN
          CREATE TABLE mensajes (
            id int IDENTITY(1,1) PRIMARY KEY,
            conversacion_id int NOT NULL,
            usuario_id int NOT NULL,
            contenido nvarchar(max) NOT NULL,
            tipo_mensaje nvarchar(50) DEFAULT 'texto',
            archivo_adjunto nvarchar(255) NULL,
            referencia_documento_id int NULL,
            responde_a_mensaje_id int NULL,
            ip_origen nvarchar(45) NULL,
            created_at datetime2 DEFAULT GETDATE(),
            updated_at datetime2 DEFAULT GETDATE()
          )
        END
      `);
    } catch (error) {
      logger.warn('Error ensuring chat tables exist:', error.message);
    }
  }

  static async crearConversacion(auditoriaId, datos, usuarioCreador) {
    try {
      logger.info(`Intentando crear conversación para auditoría ${auditoriaId}`, {
        auditoria_id: auditoriaId,
        titulo: datos.titulo,
        usuario: usuarioCreador.id
      });

      // Crear conversación usando la estructura real de la tabla
      const [result] = await sequelize.query(`
        INSERT INTO conversaciones (
          auditoria_id, seccion_id, titulo, categoria, estado, prioridad, iniciada_por, created_at, updated_at
        )
        OUTPUT INSERTED.*
        VALUES (
          :auditoria_id, :seccion_id, :titulo, :categoria, :estado, :prioridad, :iniciada_por, GETDATE(), GETDATE()
        )
      `, {
        replacements: {
          auditoria_id: auditoriaId,
          seccion_id: datos.seccion_id || null,
          titulo: datos.titulo,
          categoria: datos.categoria || 'tecnico',
          estado: 'abierta',
          prioridad: datos.prioridad || 'normal',
          iniciada_por: usuarioCreador.id
        }
      });

      const conversacion = result[0];

      logger.info(`Conversación creada exitosamente`, {
        conversacion_id: conversacion.id,
        auditoria_id: auditoriaId
      });

      // Mensaje inicial si se proporciona
      if (datos.mensaje_inicial) {
        await this.enviarMensaje(conversacion.id, {
          contenido: datos.mensaje_inicial,
          tipo: 'texto'
        }, usuarioCreador);
      }

      return conversacion;
    } catch (error) {
      logger.error(`Error creando conversación: ${error.message}`, {
        auditoria_id: auditoriaId,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Error creando conversación: ${error.message}`);
    }
  }

  static async enviarMensaje(conversacionId, datosMensaje, usuario) {
    try {
      logger.info(`Enviando mensaje a conversación ${conversacionId}`, {
        conversacion_id: conversacionId,
        usuario_id: usuario.id,
        tipo_mensaje: datosMensaje.tipo_mensaje
      });

      // Verificar que existe la conversación con SQL directo
      const [conversacionCheck] = await sequelize.query(`
        SELECT id, auditoria_id FROM conversaciones WHERE id = :conversacionId
      `, {
        replacements: { conversacionId }
      });

      if (!conversacionCheck || conversacionCheck.length === 0) {
        throw new Error('Conversación no encontrada');
      }

      // Crear mensaje usando la estructura real de la tabla
      const [result] = await sequelize.query(`
        INSERT INTO mensajes (
          conversacion_id, usuario_id, contenido, tipo_mensaje,
          archivo_adjunto, referencia_documento_id, responde_a_mensaje_id, ip_origen, created_at, updated_at
        )
        OUTPUT INSERTED.*
        VALUES (
          :conversacion_id, :usuario_id, :contenido, :tipo_mensaje,
          :archivo_adjunto, :referencia_documento_id, :responde_a_mensaje_id, :ip_origen, GETDATE(), GETDATE()
        )
      `, {
        replacements: {
          conversacion_id: conversacionId,
          usuario_id: usuario.id,
          contenido: datosMensaje.contenido,
          tipo_mensaje: datosMensaje.tipo || 'texto',
          archivo_adjunto: datosMensaje.archivo_adjunto || null,
          referencia_documento_id: datosMensaje.referencia_documento_id || null,
          responde_a_mensaje_id: datosMensaje.responde_a || null,
          ip_origen: datosMensaje.ip_origen || null
        }
      });

      const mensaje = result[0];

      // Actualizar conversación con timestamp de última actividad
      await sequelize.query(`
        UPDATE conversaciones
        SET updated_at = GETDATE()
        WHERE id = :conversacionId
      `, {
        replacements: { conversacionId }
      });

      logger.info(`Mensaje enviado exitosamente`, {
        mensaje_id: mensaje.id,
        conversacion_id: conversacionId
      });

      return mensaje;
    } catch (error) {
      logger.error(`Error enviando mensaje: ${error.message}`, {
        conversacion_id: conversacionId,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Error enviando mensaje: ${error.message}`);
    }
  }

  static async obtenerConversacionesAuditoria(auditoriaId, usuario) {
    try {
      // Filtrar por permisos del usuario
      if (usuario.rol === 'proveedor') {
        // Verificar que la auditoría pertenezca a su proveedor
        const [auditoriaCheck] = await sequelize.query(`
          SELECT a.id, s.proveedor_id
          FROM auditorias a
          INNER JOIN sitios s ON a.sitio_id = s.id
          WHERE a.id = :auditoriaId
        `, {
          replacements: { auditoriaId }
        });

        if (!auditoriaCheck || auditoriaCheck.length === 0 ||
            auditoriaCheck[0].proveedor_id !== usuario.proveedor_id) {
          throw new Error('Sin permisos para acceder a estas conversaciones');
        }
      }

      // Obtener conversaciones con información básica
      const [conversaciones] = await sequelize.query(`
        SELECT
          c.*,
          u.nombre as iniciador_nombre,
          u.email as iniciador_email
        FROM conversaciones c
        LEFT JOIN usuarios u ON c.iniciada_por = u.id
        WHERE c.auditoria_id = :auditoriaId
        ORDER BY c.updated_at DESC
      `, {
        replacements: { auditoriaId }
      });

      // Para cada conversación, obtener los últimos 5 mensajes
      for (let conv of conversaciones) {
        const [mensajes] = await sequelize.query(`
          SELECT TOP 5
            m.*,
            u.nombre as usuario_nombre,
            u.email as usuario_email
          FROM mensajes m
          LEFT JOIN usuarios u ON m.usuario_id = u.id
          WHERE m.conversacion_id = :conversacionId
          ORDER BY m.created_at DESC
        `, {
          replacements: { conversacionId: conv.id }
        });

        conv.mensajes = mensajes;
      }

      return conversaciones;
    } catch (error) {
      logger.error(`Error obteniendo conversaciones: ${error.message}`, {
        auditoria_id: auditoriaId,
        usuario_id: usuario.id,
        error: error.message
      });
      throw new Error(`Error obteniendo conversaciones: ${error.message}`);
    }
  }

  static async marcarComoLeida(conversacionId, usuarioId) {
    try {
      // Marcar mensajes no leídos como leídos usando SQL directo
      const updateTimeFunc = sequelize.config.dialect === 'mssql' ? 'GETDATE()' : 'NOW()';
      await sequelize.query(`
        UPDATE mensajes
        SET estado_mensaje = 'leido',
            updated_at = ${updateTimeFunc}
        WHERE conversacion_id = :conversacionId
          AND usuario_id != :usuarioId
          AND (estado_mensaje = 'enviado' OR estado_mensaje IS NULL)
      `, {
        replacements: { conversacionId, usuarioId }
      });

      return true;
    } catch (error) {
      logger.error(`Error marcando como leída: ${error.message}`, {
        conversacion_id: conversacionId,
        usuario_id: usuarioId,
        error: error.message
      });
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
    console.log('🔐 DEBUG - Verificando permisos:', {
      usuarioRol: usuario.rol,
      usuarioEmail: usuario.email,
      conversacionId: conversacion.id
    });
    
    switch (usuario.rol) {
      case 'admin':
      case 'auditor_general':
      case 'auditor_interno':
        return true;

      case 'auditor':
        // Verificar si es el auditor asignado
        const auditoria = await Auditoria.findByPk(conversacion.auditoria_id);
        if (auditoria.auditor_asignado_id !== usuario.id) {
          throw new Error('Sin permisos para acceder a esta conversación');
        }
        break;

      case 'jefe_proveedor':
      case 'tecnico_proveedor':
      case 'proveedor':
        // Verificar que pertenece al proveedor correcto
        const auditoriaConSitio = await Auditoria.findByPk(conversacion.auditoria_id, {
          include: [{ model: Sitio, as: 'sitio' }]
        });
        if (auditoriaConSitio.sitio.proveedor_id !== usuario.proveedor_id) {
          throw new Error('Sin permisos para acceder a esta conversación');
        }
        break;

      case 'visualizador':
        // Los visualizadores pueden ver pero no participar activamente
        throw new Error('Los visualizadores no pueden enviar mensajes');

      default:
        throw new Error('Rol de usuario no autorizado');
    }

    return true;
  }

  static async marcarMensajeComoLeido(mensajeId, usuarioId) {
    try {
      // Verificar que el mensaje existe y obtener info usando SQL directo
      const [mensaje] = await sequelize.query(`
        SELECT id, usuario_id FROM mensajes WHERE id = :mensajeId
      `, {
        replacements: { mensajeId }
      });

      if (!mensaje || mensaje.length === 0) {
        throw new Error('Mensaje no encontrado');
      }

      // Solo permitir marcar como leído si no es el autor del mensaje
      if (mensaje[0].usuario_id === usuarioId) {
        return true; // Los mensajes propios ya están "leídos"
      }

      // Actualizar estado y timestamp usando SQL directo
      const timeFunc = sequelize.config.dialect === 'mssql' ? 'GETDATE()' : 'NOW()';
      await sequelize.query(`
        UPDATE mensajes
        SET estado_mensaje = 'leido',
            leido_at = ${timeFunc},
            updated_at = ${timeFunc}
        WHERE id = :mensajeId
      `, {
        replacements: { mensajeId }
      });

      // Registrar en bitácora
      await registrarBitacora(
        usuarioId,
        'MENSAJE_LEIDO',
        'Mensaje',
        mensajeId,
        'Mensaje marcado como leído',
        null
      );

      return true;
    } catch (error) {
      logger.error(`Error marcando mensaje como leído: ${error.message}`, {
        mensaje_id: mensajeId,
        usuario_id: usuarioId,
        error: error.message
      });
      throw new Error(`Error marcando mensaje como leído: ${error.message}`);
    }
  }
}

module.exports = MensajeriaService;
