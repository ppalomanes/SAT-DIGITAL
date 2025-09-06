// Servicio de Notificaciones Programadas Automáticas
// Checkpoint 2.4 - Sistema de Notificaciones Automáticas

const cron = require('node-cron');
const EmailService = require('./EmailService');
const NotificacionService = require('../../comunicacion/services/NotificacionService');
const { Usuario, Auditoria, Sitio, Proveedor } = require('../../../shared/database/models');
const { Op } = require('sequelize');
const logger = require('../../../shared/utils/logger');

class NotificacionesScheduler {
  constructor() {
    this.jobs = new Map();
    this.inicializado = false;
  }

  /**
   * Inicializar todos los jobs programados
   */
  inicializar() {
    if (this.inicializado) return;

    try {
      // Job diario: Recordatorios de tiempo límite
      this.programarRecordatoriosVencimiento();
      
      // Job diario: Resúmenes para auditores
      this.programarResumenesDiarios();
      
      // Job semanal: Notificaciones de inicio de período
      this.programarNotificacionesInicioPeriodo();
      
      // Job de limpieza de notificaciones antiguas
      this.programarLimpiezaNotificaciones();

      this.inicializado = true;
      logger.info('✅ NotificacionesScheduler inicializado con todos los jobs');
    } catch (error) {
      logger.error('❌ Error inicializando NotificacionesScheduler:', error);
    }
  }

  /**
   * Recordatorios automáticos de vencimiento
   * Se ejecuta diariamente a las 09:00
   */
  programarRecordatoriosVencimiento() {
    const job = cron.schedule('0 9 * * *', async () => {
      logger.info('🔔 Ejecutando job de recordatorios de vencimiento');
      
      try {
        const hoy = new Date();
        const en7dias = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
        const en3dias = new Date(hoy.getTime() + 3 * 24 * 60 * 60 * 1000);
        const manana = new Date(hoy.getTime() + 1 * 24 * 60 * 60 * 1000);

        // Auditorías que vencen en 7 días
        await this.enviarRecordatorios(en7dias, 7, 'recordatorio');
        
        // Auditorías que vencen en 3 días
        await this.enviarRecordatorios(en3dias, 3, 'importante');
        
        // Auditorías que vencen mañana
        await this.enviarRecordatorios(manana, 1, 'urgente');

        logger.info('✅ Job de recordatorios completado');
      } catch (error) {
        logger.error('❌ Error en job de recordatorios:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Argentina/Buenos_Aires"
    });

    this.jobs.set('recordatorios-vencimiento', job);
    job.start();
  }

  /**
   * Enviar recordatorios para una fecha específica
   */
  async enviarRecordatorios(fechaLimite, diasRestantes, prioridad) {
    try {
      const auditoriasProximas = await Auditoria.findAll({
        where: {
          fecha_limite_carga: {
            [Op.eq]: fechaLimite.toISOString().split('T')[0]
          },
          estado: ['en_carga', 'programada']
        },
        include: [
          {
            model: Sitio,
            as: 'sitio',
            include: [{
              model: Proveedor,
              as: 'proveedor',
              include: [{
                model: Usuario,
                as: 'usuarios',
                where: { rol: ['jefe_proveedor', 'tecnico_proveedor'] }
              }]
            }]
          }
        ]
      });

      for (const auditoria of auditoriasProximas) {
        const proveedor = auditoria.sitio.proveedor;
        
        // Enviar email a usuarios del proveedor
        for (const usuario of proveedor.usuarios) {
          // Notificación en plataforma
          await NotificacionService.enviarNotificacion(
            usuario.id,
            'recordatorio_vencimiento',
            `${diasRestantes === 1 ? 'ÚLTIMO DÍA' : `${diasRestantes} días restantes`} - ${auditoria.sitio.nombre}`,
            `La auditoría técnica de ${auditoria.sitio.nombre} vence ${diasRestantes === 1 ? 'mañana' : `en ${diasRestantes} días`}. Complete la documentación pendiente.`,
            `/auditorias/${auditoria.id}`,
            {
              auditoria_id: auditoria.id,
              sitio_id: auditoria.sitio.id,
              dias_restantes: diasRestantes,
              prioridad
            }
          );

          // Email
          await EmailService.recordatorioTiempoLimite(usuario, auditoria, diasRestantes);
        }
      }

      logger.info(`📧 Enviados ${auditoriasProximas.length} recordatorios de ${diasRestantes} días`);
    } catch (error) {
      logger.error(`Error enviando recordatorios de ${diasRestantes} días:`, error);
    }
  }

  /**
   * Resúmenes diarios para auditores
   * Se ejecuta de lunes a viernes a las 08:00
   */
  programarResumenesDiarios() {
    const job = cron.schedule('0 8 * * 1-5', async () => {
      logger.info('📊 Ejecutando job de resúmenes diarios');
      
      try {
        const auditores = await Usuario.findAll({
          where: {
            rol: ['auditor_general', 'auditor_interno'],
            estado: 'activo'
          }
        });

        for (const auditor of auditores) {
          await this.generarResumenDiario(auditor);
        }

        logger.info('✅ Job de resúmenes diarios completado');
      } catch (error) {
        logger.error('❌ Error en job de resúmenes diarios:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Argentina/Buenos_Aires"
    });

    this.jobs.set('resumenes-diarios', job);
    job.start();
  }

  /**
   * Generar resumen diario para un auditor
   */
  async generarResumenDiario(auditor) {
    try {
      // Auditorías asignadas pendientes
      const auditoriasPendientes = await Auditoria.count({
        where: {
          auditor_asignado_id: auditor.id,
          estado: ['en_carga', 'pendiente_evaluacion']
        }
      });

      // Mensajes no leídos
      const mensajesNoLeidos = await this.contarMensajesNoLeidos(auditor.id);

      // Próximas visitas
      const proximasVisitas = await this.obtenerProximasVisitas(auditor.id);

      // Alertas críticas (vencen hoy o mañana)
      const alertasCriticas = await this.obtenerAlertasCriticas(auditor.id);

      // Solo enviar si hay información relevante
      if (auditoriasPendientes > 0 || mensajesNoLeidos > 0 || alertasCriticas.length > 0) {
        // Notificación en plataforma
        await NotificacionService.enviarNotificacion(
          auditor.id,
          'resumen_diario',
          'Resumen Diario de Actividades',
          `Tienes ${auditoriasPendientes} auditorías pendientes, ${mensajesNoLeidos} mensajes no leídos y ${alertasCriticas.length} alertas críticas.`,
          '/dashboard',
          {
            auditorias_pendientes: auditoriasPendientes,
            mensajes_no_leidos: mensajesNoLeidos,
            alertas_criticas: alertasCriticas.length
          }
        );

        // Email
        await EmailService.enviarResumenDiario(auditor, {
          auditoriasPendientes,
          mensajesNoLeidos,
          proximasVisitas,
          alertasCriticas
        });
      }
    } catch (error) {
      logger.error(`Error generando resumen para auditor ${auditor.id}:`, error);
    }
  }

  /**
   * Notificaciones de inicio de período
   * Se ejecuta semanalmente los lunes a las 10:00
   */
  programarNotificacionesInicioPeriodo() {
    const job = cron.schedule('0 10 * * 1', async () => {
      logger.info('🚀 Ejecutando job de notificaciones de inicio de período');
      
      try {
        const hoy = new Date();
        const proximaSemana = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Auditorías que inician la próxima semana
        const auditoriasNuevas = await Auditoria.findAll({
          where: {
            fecha_inicio: {
              [Op.between]: [hoy.toISOString().split('T')[0], proximaSemana.toISOString().split('T')[0]]
            },
            estado: 'programada'
          },
          include: [{
            model: Sitio,
            as: 'sitio',
            include: [{
              model: Proveedor,
              as: 'proveedor',
              include: [{
                model: Usuario,
                as: 'usuarios',
                where: { rol: ['jefe_proveedor', 'tecnico_proveedor'] }
              }]
            }]
          }]
        });

        for (const auditoria of auditoriasNuevas) {
          const proveedor = auditoria.sitio.proveedor;
          
          for (const usuario of proveedor.usuarios) {
            await EmailService.notificarInicioPeriodo(usuario, auditoria, auditoria.fecha_limite_carga);
          }
        }

        logger.info(`📧 Enviadas ${auditoriasNuevas.length} notificaciones de inicio de período`);
      } catch (error) {
        logger.error('❌ Error en job de inicio de período:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Argentina/Buenos_Aires"
    });

    this.jobs.set('inicio-periodo', job);
    job.start();
  }

  /**
   * Limpieza de notificaciones antiguas
   * Se ejecuta semanalmente los domingos a las 02:00
   */
  programarLimpiezaNotificaciones() {
    const job = cron.schedule('0 2 * * 0', async () => {
      logger.info('🧹 Ejecutando job de limpieza de notificaciones');
      
      try {
        const hace30dias = new Date();
        hace30dias.setDate(hace30dias.getDate() - 30);

        const { NotificacionUsuario } = require('../../comunicacion/models/NotificacionUsuario');
        
        const eliminadas = await NotificacionUsuario.destroy({
          where: {
            created_at: {
              [Op.lt]: hace30dias
            },
            leida: true
          }
        });

        logger.info(`🧹 Eliminadas ${eliminadas} notificaciones antiguas`);
      } catch (error) {
        logger.error('❌ Error en job de limpieza:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Argentina/Buenos_Aires"
    });

    this.jobs.set('limpieza-notificaciones', job);
    job.start();
  }

  /**
   * Métodos auxiliares
   */
  async contarMensajesNoLeidos(auditorId) {
    // Implementar conteo de mensajes no leídos para el auditor
    return 0; // Placeholder
  }

  async obtenerProximasVisitas(auditorId) {
    return []; // Placeholder
  }

  async obtenerAlertasCriticas(auditorId) {
    return []; // Placeholder
  }

  /**
   * Detener todos los jobs
   */
  detener() {
    for (const [nombre, job] of this.jobs) {
      job.stop();
      logger.info(`🛑 Job ${nombre} detenido`);
    }
    this.jobs.clear();
    this.inicializado = false;
  }

  /**
   * Obtener estado de todos los jobs
   */
  obtenerEstado() {
    const estado = {};
    for (const [nombre, job] of this.jobs) {
      estado[nombre] = {
        activo: job.running,
        programacion: job.cronExpression
      };
    }
    return estado;
  }
}

module.exports = new NotificacionesScheduler();