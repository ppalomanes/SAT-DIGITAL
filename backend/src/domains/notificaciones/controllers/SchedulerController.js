// Controller para gestión del Scheduler de Notificaciones
// Checkpoint 2.4 - Control manual del sistema de notificaciones automáticas

const NotificacionesScheduler = require('../services/NotificacionesScheduler');

class SchedulerController {

  /**
   * Obtener estado del scheduler
   */
  static async obtenerEstado(req, res) {
    try {
      const estado = NotificacionesScheduler.obtenerEstado();
      
      res.status(200).json({
        success: true,
        data: {
          activo: NotificacionesScheduler.inicializado,
          jobs: estado,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Error obteniendo estado del scheduler:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estado del scheduler',
        error: error.message
      });
    }
  }

  /**
   * Inicializar scheduler
   */
  static async inicializar(req, res) {
    try {
      NotificacionesScheduler.inicializar();
      
      res.status(200).json({
        success: true,
        message: 'Scheduler inicializado exitosamente',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error inicializando scheduler:', error);
      res.status(500).json({
        success: false,
        message: 'Error inicializando scheduler',
        error: error.message
      });
    }
  }

  /**
   * Detener scheduler
   */
  static async detener(req, res) {
    try {
      NotificacionesScheduler.detener();
      
      res.status(200).json({
        success: true,
        message: 'Scheduler detenido exitosamente',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error deteniendo scheduler:', error);
      res.status(500).json({
        success: false,
        message: 'Error deteniendo scheduler',
        error: error.message
      });
    }
  }

  /**
   * Ejecutar job específico manualmente
   */
  static async ejecutarJob(req, res) {
    try {
      const { jobName } = req.params;
      
      if (!jobName) {
        return res.status(400).json({
          success: false,
          message: 'Nombre de job requerido'
        });
      }

      await NotificacionesScheduler.ejecutarJobManual(jobName);
      
      res.status(200).json({
        success: true,
        message: `Job '${jobName}' ejecutado exitosamente`,
        job: jobName,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error ejecutando job manual:', error);
      res.status(500).json({
        success: false,
        message: `Error ejecutando job '${req.params.jobName}'`,
        error: error.message
      });
    }
  }

  /**
   * Listar jobs disponibles
   */
  static async listarJobs(req, res) {
    try {
      const jobs = [
        {
          name: 'recordatorios-vencimiento',
          description: 'Enviar recordatorios de auditorías próximas a vencer',
          schedule: '0 9 * * *',
          tipo: 'diario'
        },
        {
          name: 'resumenes-diarios',
          description: 'Enviar resúmenes diarios a auditores',
          schedule: '0 8 * * 1-5',
          tipo: 'laboral'
        },
        {
          name: 'inicio-periodo',
          description: 'Notificar inicio de nuevos períodos de auditoría',
          schedule: '0 10 * * 1',
          tipo: 'semanal'
        },
        {
          name: 'limpieza-notificaciones',
          description: 'Limpiar notificaciones antiguas',
          schedule: '0 2 * * 0',
          tipo: 'semanal'
        }
      ];

      res.status(200).json({
        success: true,
        data: jobs,
        count: jobs.length
      });
    } catch (error) {
      console.error('Error listando jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Error listando jobs',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  static async obtenerEstadisticas(req, res) {
    try {
      // Aquí podrías implementar estadísticas reales desde la base de datos
      // Por ahora retornamos datos de ejemplo
      const estadisticas = {
        notificaciones_enviadas_hoy: 0,
        emails_enviados_semana: 0,
        jobs_ejecutados_hoy: 0,
        ultima_ejecucion: new Date(),
        proxima_ejecucion: new Date(Date.now() + 60 * 60 * 1000), // En 1 hora
        alertas_pendientes: 0
      };

      res.status(200).json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas',
        error: error.message
      });
    }
  }

  /**
   * Configurar frecuencia de jobs (para futuras implementaciones)
   */
  static async configurarFrecuencia(req, res) {
    try {
      const { jobName, newSchedule } = req.body;
      
      // Por ahora solo validamos la entrada
      if (!jobName || !newSchedule) {
        return res.status(400).json({
          success: false,
          message: 'Nombre de job y nueva programación requeridos'
        });
      }

      // Validar formato cron básico
      const cronRegex = /^(\*|([0-9]|[1-5][0-9]))\s+(\*|([0-9]|1[0-9]|2[0-3]))\s+(\*|([1-9]|[12][0-9]|3[01]))\s+(\*|([1-9]|1[0-2]))\s+(\*|([0-6]))$/;
      
      if (!cronRegex.test(newSchedule)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de programación cron inválido'
        });
      }

      res.status(200).json({
        success: true,
        message: `Configuración de '${jobName}' actualizada a '${newSchedule}'`,
        // TODO: Implementar cambio real de programación
        implemented: false,
        note: 'Funcionalidad en desarrollo'
      });
    } catch (error) {
      console.error('Error configurando frecuencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error configurando frecuencia',
        error: error.message
      });
    }
  }

  /**
   * Health check del scheduler
   */
  static async healthCheck(req, res) {
    try {
      const estado = NotificacionesScheduler.obtenerEstado();
      const isHealthy = NotificacionesScheduler.inicializado && Object.keys(estado).length > 0;
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        status: isHealthy ? 'healthy' : 'unhealthy',
        scheduler_activo: NotificacionesScheduler.inicializado,
        jobs_activos: Object.keys(estado).length,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error en health check:', error);
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        error: error.message
      });
    }
  }
}

module.exports = SchedulerController;