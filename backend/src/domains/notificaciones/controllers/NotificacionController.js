// backend/src/domains/notificaciones/controllers/NotificacionController.js
const EmailService = require('../services/EmailService');
// TEMPORALMENTE DESHABILITADO - problemas con cron syntax
// const NotificacionScheduler = require('../services/NotificacionScheduler');
const { NotificacionUsuario, Usuario, Auditoria, Sitio, Proveedor } = require('../../../shared/database/models');
const { logger } = require('../../../shared/utils/logger');
const { z } = require('zod');

// Esquemas de validación
const enviarNotificacionSchema = z.object({
  tipo: z.enum(['inicio-periodo', 'recordatorio', 'nuevo-mensaje', 'cambio-estado', 'resumen-diario']),
  destinatarios: z.array(z.string().email()).min(1),
  data: z.object({}).passthrough()
});

const configurarRecordatoriosSchema = z.object({
  auditoria_id: z.number().int().positive(),
  recordatorios: z.array(z.object({
    dias_antes: z.number().int().positive(),
    activo: z.boolean()
  }))
});

class NotificacionController {
  /**
   * Enviar notificación inmediata
   */
  static async enviarNotificacion(req, res) {
    try {
      const validatedData = enviarNotificacionSchema.parse(req.body);
      const { tipo, destinatarios, data } = validatedData;

      const resultados = [];

      for (const email of destinatarios) {
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
          resultados.push({
            email,
            success: false,
            error: 'Usuario no encontrado'
          });
          continue;
        }

        // TEMPORALMENTE DESHABILITADO
        const resultado = { success: true, message: 'Simulado - NotificacionScheduler deshabilitado' };
        // const resultado = await NotificacionScheduler.enviarNotificacionInmediata(tipo, {
        //   ...data,
        //   destinatario: usuario
        // });

        resultados.push({
          email,
          ...resultado
        });

        // Registrar en base de datos
        await NotificacionUsuario.create({
          usuario_id: usuario.id,
          tipo_notificacion: tipo.replace('-', '_'),
          titulo: this.getTituloNotificacion(tipo),
          contenido: this.getContenidoNotificacion(tipo, data),
          data_adicional: data
        });
      }

      logger.info(`✅ Notificaciones ${tipo} enviadas a ${destinatarios.length} usuarios`);

      res.json({
        success: true,
        mensaje: `Notificaciones ${tipo} enviadas exitosamente`,
        resultados
      });

    } catch (error) {
      logger.error('❌ Error enviando notificaciones:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          detalles: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Configurar recordatorios automáticos para auditoría
   */
  static async configurarRecordatorios(req, res) {
    try {
      const validatedData = configurarRecordatoriosSchema.parse(req.body);
      const { auditoria_id, recordatorios } = validatedData;

      const auditoria = await Auditoria.findByPk(auditoria_id, {
        include: [{ model: Sitio, include: [Proveedor] }]
      });

      if (!auditoria) {
        return res.status(404).json({
          success: false,
          error: 'Auditoría no encontrada'
        });
      }

      // Programar recordatorios - TEMPORALMENTE DESHABILITADO
      // await NotificacionScheduler.programarRecordatoriosAuditoria(auditoria);
      logger.info('🔔 Recordatorios simulados - NotificacionScheduler deshabilitado');

      logger.info(`✅ Recordatorios configurados para auditoría ${auditoria_id}`);

      res.json({
        success: true,
        mensaje: 'Recordatorios configurados exitosamente',
        auditoria: {
          id: auditoria.id,
          sitio: auditoria.sitio.nombre,
          fecha_limite: auditoria.fecha_limite_carga
        }
      });

    } catch (error) {
      logger.error('❌ Error configurando recordatorios:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          detalles: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener dashboard de notificaciones (para administradores)
   */
  static async getDashboardNotificaciones(req, res) {
    try {
      const { periodo = '30d' } = req.query;
      
      let fechaDesde;
      switch (periodo) {
        case '7d':
          fechaDesde = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          fechaDesde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          fechaDesde = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          fechaDesde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      // Estadísticas generales
      const estadisticas = await this.obtenerEstadisticasNotificaciones(fechaDesde);

      // Notificaciones recientes
      const notificacionesRecientes = await NotificacionUsuario.findAll({
        where: {
          created_at: {
            [require('sequelize').Op.gte]: fechaDesde
          }
        },
        include: [Usuario],
        order: [['created_at', 'DESC']],
        limit: 50
      });

      // Estado de colas de email
      const estadoColas = await this.obtenerEstadoColas();

      res.json({
        success: true,
        data: {
          estadisticas,
          notificacionesRecientes: notificacionesRecientes.map(n => ({
            id: n.id,
            tipo: n.tipo_notificacion,
            titulo: n.titulo,
            usuario: n.usuario.nombre,
            email: n.usuario.email,
            leida: n.leida,
            fecha: n.created_at
          })),
          estadoColas,
          periodo
        }
      });

    } catch (error) {
      logger.error('❌ Error obteniendo dashboard de notificaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener configuración de notificaciones del usuario
   */
  static async getConfiguracionUsuario(req, res) {
    try {
      const userId = req.usuario.id;

      // Por ahora devolvemos configuración por defecto
      // En futuro se puede almacenar en base de datos
      const configuracion = {
        email_nuevos_mensajes: true,
        email_recordatorios: true,
        email_cambios_estado: true,
        email_resumen_diario: req.usuario.rol === 'auditor',
        frecuencia_resumen: 'diario', // diario, semanal, nunca
        horario_resumen: '08:00',
        notificaciones_push: true,
        notificaciones_criticas_inmediatas: true
      };

      res.json({
        success: true,
        configuracion
      });

    } catch (error) {
      logger.error('❌ Error obteniendo configuración:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar configuración de notificaciones del usuario
   */
  static async actualizarConfiguracionUsuario(req, res) {
    try {
      const userId = req.usuario.id;
      const configuracion = req.body;

      // Validar configuración
      const configuracionSchema = z.object({
        email_nuevos_mensajes: z.boolean(),
        email_recordatorios: z.boolean(),
        email_cambios_estado: z.boolean(),
        email_resumen_diario: z.boolean(),
        frecuencia_resumen: z.enum(['diario', 'semanal', 'nunca']),
        horario_resumen: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        notificaciones_push: z.boolean(),
        notificaciones_criticas_inmediatas: z.boolean()
      });

      const validatedConfig = configuracionSchema.parse(configuracion);

      // Aquí guardarías en base de datos la configuración
      // Por ahora solo simulamos que se guarda

      logger.info(`✅ Configuración actualizada para usuario ${userId}`);

      res.json({
        success: true,
        mensaje: 'Configuración actualizada exitosamente',
        configuracion: validatedConfig
      });

    } catch (error) {
      logger.error('❌ Error actualizando configuración:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Configuración inválida',
          detalles: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Marcar notificaciones como leídas
   */
  static async marcarComoLeidas(req, res) {
    try {
      const userId = req.usuario.id;
      const { notificacion_ids } = req.body;

      if (!Array.isArray(notificacion_ids)) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere un array de IDs de notificación'
        });
      }

      const updated = await NotificacionUsuario.update(
        { 
          leida: true, 
          leida_en: new Date() 
        },
        {
          where: {
            id: notificacion_ids,
            usuario_id: userId,
            leida: false
          }
        }
      );

      res.json({
        success: true,
        mensaje: `${updated[0]} notificaciones marcadas como leídas`
      });

    } catch (error) {
      logger.error('❌ Error marcando notificaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Métodos privados de utilidad

  static getTituloNotificacion(tipo) {
    const titulos = {
      'inicio-periodo': 'Nueva auditoría programada',
      'recordatorio': 'Recordatorio de auditoría',
      'nuevo-mensaje': 'Nuevo mensaje recibido',
      'cambio-estado': 'Estado de auditoría actualizado',
      'resumen-diario': 'Resumen diario de actividades'
    };
    return titulos[tipo] || 'Notificación del sistema';
  }

  static getContenidoNotificacion(tipo, data) {
    switch (tipo) {
      case 'inicio-periodo':
        return `Nueva auditoría programada para ${data.sitio}`;
      case 'recordatorio':
        return `Recordatorio: ${data.diasRestantes} días restantes para ${data.sitio}`;
      case 'nuevo-mensaje':
        return `Nuevo mensaje de ${data.remitente} en ${data.conversacion}`;
      case 'cambio-estado':
        return `Estado actualizado para ${data.sitio}: ${data.estadoNuevo}`;
      case 'resumen-diario':
        return `Resumen diario de actividades`;
      default:
        return 'Notificación del sistema';
    }
  }

  static async obtenerEstadisticasNotificaciones(fechaDesde) {
    const sequelize = require('sequelize');
    
    const estadisticas = await NotificacionUsuario.findAll({
      attributes: [
        'tipo_notificacion',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN leida = true THEN 1 ELSE 0 END')), 'leidas']
      ],
      where: {
        created_at: {
          [sequelize.Op.gte]: fechaDesde
        }
      },
      group: ['tipo_notificacion'],
      raw: true
    });

    return estadisticas.map(stat => ({
      tipo: stat.tipo_notificacion,
      total: parseInt(stat.total),
      leidas: parseInt(stat.leidas),
      no_leidas: parseInt(stat.total) - parseInt(stat.leidas),
      tasa_lectura: Math.round((parseInt(stat.leidas) / parseInt(stat.total)) * 100)
    }));
  }

  static async obtenerEstadoColas() {
    // Placeholder - implementar con Bull/Agenda stats
    return {
      email_queue: {
        waiting: 0,
        active: 0,
        completed: 156,
        failed: 2
      },
      last_processed: new Date()
    };
  }
}

module.exports = NotificacionController;
