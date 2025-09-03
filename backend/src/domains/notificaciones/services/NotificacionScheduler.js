// backend/src/domains/notificaciones/services/NotificacionScheduler.js
const cron = require('cron');
const Bull = require('bull');
const EmailService = require('./EmailService');
const { Auditoria, Usuario, Proveedor, Sitio } = require('../../../shared/database/models');
const { logger } = require('../../../shared/utils/logger');

class NotificacionScheduler {
  constructor() {
    this.emailQueue = new Bull('email queue', 'redis://localhost:6379');
    this.cronJobs = new Map();
    this.setupQueues();
    this.initializeCronJobs();
  }

  /**
   * Configurar colas de procesamiento
   */
  setupQueues() {
    this.emailQueue.process('send-email', async (job) => {
      const { tipo, data } = job.data;
      
      switch (tipo) {
        case 'inicio-periodo':
          return await EmailService.notificarInicioPeriodo(data.proveedor, data.auditoria, data.fechaLimite);
        case 'recordatorio':
          return await EmailService.recordatorioTiempoLimite(data.proveedor, data.auditoria, data.diasRestantes);
        case 'nuevo-mensaje':
          return await EmailService.notificarNuevoMensaje(data.destinatario, data.conversacion, data.mensaje);
        case 'cambio-estado':
          return await EmailService.notificarCambioEstado(data.usuarios, data.auditoria, data.estadoAnterior, data.estadoNuevo);
        case 'resumen-diario':
          return await EmailService.enviarResumenDiario(data.auditor, data.resumenData);
        default:
          throw new Error(`Tipo de notificación no reconocido: ${tipo}`);
      }
    });

    this.emailQueue.on('completed', (job) => {
      logger.info(`✅ Email procesado: ${job.data.tipo}`);
    });

    this.emailQueue.on('failed', (job, err) => {
      logger.error(`❌ Error procesando email ${job.data.tipo}:`, err);
    });
  }

  /**
   * Inicializar trabajos cron programados
   */
  initializeCronJobs() {
    // TEMPORALMENTE DESHABILITADO - problemas con la librería cron
    // TODO: Revisar configuración de cron jobs
    
    logger.info('🕐 Trabajos cron temporalmente deshabilitados para desarrollo');
    
    /* 
    // Recordatorios diarios a las 9:00 AM
    this.cronJobs.set('recordatorios-diarios', new cron.CronJob({
      cronTime: '0 9 * * *',
      onTick: () => this.procesarRecordatoriosDiarios(),
      start: true,
      timeZone: 'America/Argentina/Buenos_Aires'
    }));

    // Resúmenes para auditores a las 8:00 AM
    this.cronJobs.set('resumenes-auditores', new cron.CronJob({
      cronTime: '0 8 * * 1-5',
      onTick: () => this.enviarResumenesAuditores(),
      start: true,
      timeZone: 'America/Argentina/Buenos_Aires'
    }));

    // Verificar auditorías próximas a vencer cada 4 horas
    this.cronJobs.set('verificar-vencimientos', new cron.CronJob({
      cronTime: '0 */4 * * *',
      onTick: () => this.verificarProximosVencimientos(),
      start: true,
      timeZone: 'America/Argentina/Buenos_Aires'
    }));

    logger.info('🕐 Trabajos cron inicializados');
    */
  }

  /**
   * Programar notificación inmediata
   */
  async enviarNotificacionInmediata(tipo, data) {
    try {
      await this.emailQueue.add('send-email', { tipo, data }, {
        priority: 'high',
        attempts: 3,
        backoff: 'exponential'
      });
      
      logger.info(`📧 Notificación ${tipo} programada`);
      return { success: true };
    } catch (error) {
      logger.error(`Error programando notificación ${tipo}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Programar recordatorios automáticos para una auditoría
   */
  async programarRecordatoriosAuditoria(auditoria) {
    const fechaLimite = new Date(auditoria.fecha_limite_carga);
    const ahora = new Date();
    
    // Recordatorios a 7, 3 y 1 días
    const recordatorios = [7, 3, 1];
    
    for (const dias of recordatorios) {
      const fechaRecordatorio = new Date(fechaLimite);
      fechaRecordatorio.setDate(fechaLimite.getDate() - dias);
      
      if (fechaRecordatorio > ahora) {
        await this.emailQueue.add('send-email', {
          tipo: 'recordatorio',
          data: {
            proveedor: auditoria.sitio.proveedor,
            auditoria,
            diasRestantes: dias
          }
        }, {
          delay: fechaRecordatorio.getTime() - ahora.getTime(),
          attempts: 2
        });
      }
    }
  }

  /**
   * Procesar recordatorios diarios
   */
  async procesarRecordatoriosDiarios() {
    try {
      logger.info('🔔 Procesando recordatorios diarios...');
      
      const auditoriasPendientes = await Auditoria.findAll({
        where: { 
          estado: ['programada', 'en_carga'],
          fecha_limite_carga: {
            [require('sequelize').Op.gte]: new Date(),
            [require('sequelize').Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
          }
        },
        include: [
          {
            model: Sitio,
            include: [Proveedor]
          }
        ]
      });

      for (const auditoria of auditoriasPendientes) {
        const diasRestantes = Math.ceil(
          (new Date(auditoria.fecha_limite_carga) - new Date()) / (24 * 60 * 60 * 1000)
        );

        if ([7, 3, 1].includes(diasRestantes)) {
          await this.enviarNotificacionInmediata('recordatorio', {
            proveedor: auditoria.sitio.proveedor,
            auditoria,
            diasRestantes
          });
        }
      }

      logger.info(`✅ Recordatorios procesados: ${auditoriasPendientes.length} auditorías`);
    } catch (error) {
      logger.error('❌ Error procesando recordatorios:', error);
    }
  }

  /**
   * Enviar resúmenes diarios a auditores
   */
  async enviarResumenesAuditores() {
    try {
      logger.info('📊 Enviando resúmenes a auditores...');
      
      const auditores = await Usuario.findAll({
        where: { rol: 'auditor', estado: 'activo' }
      });

      for (const auditor of auditores) {
        const resumenData = await this.generarResumenAuditor(auditor.id);
        
        if (resumenData.tieneActividad) {
          await this.enviarNotificacionInmediata('resumen-diario', {
            auditor,
            resumenData
          });
        }
      }

      logger.info(`✅ Resúmenes enviados a ${auditores.length} auditores`);
    } catch (error) {
      logger.error('❌ Error enviando resúmenes:', error);
    }
  }

  /**
   * Generar datos de resumen para auditor
   */
  async generarResumenAuditor(auditorId) {
    // Auditorías asignadas pendientes
    const auditoriasPendientes = await Auditoria.count({
      where: { auditor_asignado_id: auditorId, estado: ['en_carga', 'pendiente_evaluacion'] }
    });

    // Mensajes no leídos (implementar cuando esté disponible el modelo)
    const mensajesNoLeidos = 0; // Placeholder

    // Próximas visitas
    const proximasVisitas = await Auditoria.count({
      where: {
        auditor_asignado_id: auditorId,
        fecha_visita_programada: {
          [require('sequelize').Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
        }
      }
    });

    // Alertas críticas (puntajes muy bajos, etc.)
    const alertasCriticas = 0; // Implementar con métricas reales

    return {
      auditoriasPendientes,
      mensajesNoLeidos,
      proximasVisitas,
      alertasCriticas,
      tieneActividad: auditoriasPendientes > 0 || proximasVisitas > 0 || alertasCriticas > 0
    };
  }

  /**
   * Verificar próximos vencimientos
   */
  async verificarProximosVencimientos() {
    try {
      logger.info('⏰ Verificando próximos vencimientos...');
      
      // Auditorías que vencen en las próximas 24 horas
      const auditoriasCriticas = await Auditoria.findAll({
        where: {
          estado: 'en_carga',
          fecha_limite_carga: {
            [require('sequelize').Op.between]: [
              new Date(),
              new Date(Date.now() + 24 * 60 * 60 * 1000)
            ]
          }
        },
        include: [
          {
            model: Sitio,
            include: [Proveedor]
          }
        ]
      });

      // Enviar alertas críticas
      for (const auditoria of auditoriasCriticas) {
        await this.enviarNotificacionInmediata('recordatorio', {
          proveedor: auditoria.sitio.proveedor,
          auditoria,
          diasRestantes: 1
        });
      }

      logger.info(`⚠️ Alertas críticas enviadas: ${auditoriasCriticas.length}`);
    } catch (error) {
      logger.error('❌ Error verificando vencimientos:', error);
    }
  }

  /**
   * Detener todos los trabajos programados
   */
  stop() {
    this.cronJobs.forEach((job, name) => {
      job.stop();
      logger.info(`🛑 Trabajo cron detenido: ${name}`);
    });
    
    this.emailQueue.close();
  }
}

module.exports = new NotificacionScheduler();
