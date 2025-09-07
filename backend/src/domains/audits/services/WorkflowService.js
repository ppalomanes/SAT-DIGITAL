/**
 * SAT-Digital Backend - Servicio de Workflow Automático
 * Checkpoint 2.8: Workflow de Estados Automático
 * 
 * Funcionalidades:
 * - Transiciones automáticas de estados de auditorías
 * - Reglas de negocio para cambios de estado
 * - Disparadores de notificaciones automáticas
 * - Validaciones de prerrequisitos para transiciones
 */

const { Op } = require('sequelize');
const { 
  Auditoria, 
  Documento, 
  SeccionTecnica,
  AsignacionAuditor,
  PeriodoAuditoria 
} = require('../../../shared/database/models');
const { registrarBitacora } = require('../../../shared/utils/bitacora');
const logger = require('../../../shared/utils/logger');
const EmailService = require('../../notificaciones/services/EmailService');

class WorkflowService {
  
  /**
   * Estados válidos y sus transiciones permitidas
   */
  static ESTADOS = {
    PROGRAMADA: 'programada',
    EN_CARGA: 'en_carga', 
    PENDIENTE_EVALUACION: 'pendiente_evaluacion',
    EVALUADA: 'evaluada',
    CERRADA: 'cerrada'
  };

  static TRANSICIONES_PERMITIDAS = {
    [this.ESTADOS.PROGRAMADA]: [this.ESTADOS.EN_CARGA],
    [this.ESTADOS.EN_CARGA]: [this.ESTADOS.PENDIENTE_EVALUACION, this.ESTADOS.PROGRAMADA],
    [this.ESTADOS.PENDIENTE_EVALUACION]: [this.ESTADOS.EVALUADA, this.ESTADOS.EN_CARGA],
    [this.ESTADOS.EVALUADA]: [this.ESTADOS.CERRADA, this.ESTADOS.PENDIENTE_EVALUACION],
    [this.ESTADOS.CERRADA]: [] // Estado final
  };

  /**
   * Verificar si una transición de estado es válida
   */
  static esTransicionValida(estadoActual, nuevoEstado) {
    const transicionesPermitidas = this.TRANSICIONES_PERMITIDAS[estadoActual] || [];
    return transicionesPermitidas.includes(nuevoEstado);
  }

  /**
   * Transición automática cuando se carga el primer documento
   * programada -> en_carga
   */
  static async verificarInicioCargar(auditoriaId, usuarioId = null) {
    try {
      const auditoria = await Auditoria.findByPk(auditoriaId);
      
      if (!auditoria || auditoria.estado !== this.ESTADOS.PROGRAMADA) {
        return false;
      }

      // Verificar si hay documentos cargados
      const documentosCount = await Documento.count({
        where: { auditoria_id: auditoriaId }
      });

      if (documentosCount > 0) {
        await this.cambiarEstado(
          auditoriaId,
          this.ESTADOS.EN_CARGA,
          'Sistema - Transición automática por inicio de carga de documentos',
          usuarioId
        );
        
        logger.info(`Auditoría ${auditoriaId} transicionó automáticamente a EN_CARGA`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error verificando inicio de carga:', error);
      return false;
    }
  }

  /**
   * Verificar si se completó la carga (todas las secciones obligatorias)
   * en_carga -> pendiente_evaluacion
   */
  static async verificarCargaCompleta(auditoriaId, usuarioId = null) {
    try {
      const auditoria = await Auditoria.findByPk(auditoriaId);
      
      if (!auditoria || auditoria.estado !== this.ESTADOS.EN_CARGA) {
        return false;
      }

      // Obtener secciones técnicas obligatorias
      const seccionesObligatorias = await SeccionTecnica.findAll({
        where: { 
          obligatoria: true,
          estado: 'activa'
        },
        attributes: ['id']
      });

      const seccionesObligatoriasIds = seccionesObligatorias.map(s => s.id);

      // Verificar documentos por sección obligatoria
      const seccionesConDocumentos = await Documento.findAll({
        where: { 
          auditoria_id: auditoriaId,
          seccion_id: { [Op.in]: seccionesObligatoriasIds }
        },
        attributes: ['seccion_id'],
        group: ['seccion_id']
      });

      const seccionesCargadas = seccionesConDocumentos.map(d => d.seccion_id);
      const cargaCompleta = seccionesObligatoriasIds.every(id => seccionesCargadas.includes(id));

      if (cargaCompleta) {
        await this.cambiarEstado(
          auditoriaId,
          this.ESTADOS.PENDIENTE_EVALUACION,
          'Sistema - Transición automática por completar carga de secciones obligatorias',
          usuarioId
        );

        logger.info(`Auditoría ${auditoriaId} transicionó automáticamente a PENDIENTE_EVALUACION`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error verificando carga completa:', error);
      return false;
    }
  }

  /**
   * Verificar transición por vencimiento de fechas límite
   */
  static async verificarVencimientos() {
    try {
      const ahora = new Date();
      const fechaLimite = new Date();
      fechaLimite.setHours(23, 59, 59, 999); // Final del día actual

      // Auditorías que vencen hoy y no están completas
      const auditoriasVencidas = await Auditoria.findAll({
        where: {
          fecha_limite_carga: {
            [Op.lte]: fechaLimite
          },
          estado: [this.ESTADOS.PROGRAMADA, this.ESTADOS.EN_CARGA]
        },
        include: [{
          model: AsignacionAuditor,
          as: 'asignacion',
          attributes: ['auditor_id']
        }]
      });

      let transicionesRealizadas = 0;

      for (const auditoria of auditoriasVencidas) {
        // Cambiar a pendiente_evaluacion si tiene documentos, sino mantener en en_carga
        const documentosCount = await Documento.count({
          where: { auditoria_id: auditoria.id }
        });

        if (documentosCount > 0 && auditoria.estado === this.ESTADOS.EN_CARGA) {
          await this.cambiarEstado(
            auditoria.id,
            this.ESTADOS.PENDIENTE_EVALUACION,
            'Sistema - Transición automática por vencimiento de fecha límite',
            null
          );
          transicionesRealizadas++;

          // Notificar al auditor asignado
          if (auditoria.asignacion?.auditor_id) {
            await EmailService.enviarNotificacionVencimiento(
              auditoria.asignacion.auditor_id,
              auditoria.id
            );
          }
        }
      }

      if (transicionesRealizadas > 0) {
        logger.info(`${transicionesRealizadas} auditorías transicionaron por vencimiento`);
      }

      return transicionesRealizadas;
    } catch (error) {
      logger.error('Error verificando vencimientos:', error);
      return 0;
    }
  }

  /**
   * Cambiar estado de auditoría con validaciones
   */
  static async cambiarEstado(auditoriaId, nuevoEstado, motivo, usuarioId = null) {
    try {
      const auditoria = await Auditoria.findByPk(auditoriaId);
      
      if (!auditoria) {
        throw new Error(`Auditoría ${auditoriaId} no encontrada`);
      }

      const estadoActual = auditoria.estado;

      // Validar transición
      if (!this.esTransicionValida(estadoActual, nuevoEstado)) {
        throw new Error(`Transición inválida: ${estadoActual} -> ${nuevoEstado}`);
      }

      // Realizar cambio
      await auditoria.update({
        estado: nuevoEstado,
        updated_at: new Date()
      });

      // Registrar en bitácora
      if (usuarioId) {
        await registrarBitacora(
          usuarioId,
          'CAMBIO_ESTADO_AUTOMATICO',
          'Auditoria',
          auditoriaId,
          motivo,
          { estado_anterior: estadoActual },
          { estado_nuevo: nuevoEstado }
        );
      }

      // Disparar eventos adicionales según el nuevo estado
      await this.procesarEventosPostTransicion(auditoriaId, nuevoEstado, estadoActual, motivo);

      return {
        success: true,
        auditoriaId,
        estadoAnterior: estadoActual,
        estadoNuevo: nuevoEstado,
        motivo
      };

    } catch (error) {
      logger.error(`Error cambiando estado de auditoría ${auditoriaId}:`, error);
      throw error;
    }
  }

  /**
   * Procesar eventos post-transición
   */
  static async procesarEventosPostTransicion(auditoriaId, nuevoEstado, estadoAnterior, motivo = '') {
    try {
      const auditoria = await Auditoria.findByPk(auditoriaId, {
        include: [{
          model: AsignacionAuditor,
          as: 'asignacion',
          include: [{
            model: require('../../../shared/database/models').Usuario,
            as: 'auditor',
            attributes: ['id', 'email', 'nombre']
          }]
        }]
      });

      // Notificar transición automática si es aplicable
      if (motivo.includes('Sistema - Transición automática')) {
        await EmailService.notificarTransicionAutomatica(
          auditoria, 
          estadoAnterior, 
          nuevoEstado, 
          motivo
        );
      }

      switch (nuevoEstado) {
        case this.ESTADOS.EN_CARGA:
          // Notificar inicio de período de carga
          await this.notificarInicioCargar(auditoria);
          break;

        case this.ESTADOS.PENDIENTE_EVALUACION:
          // Notificar auditor que debe evaluar
          await this.notificarPendienteEvaluacion(auditoria);
          break;

        case this.ESTADOS.EVALUADA:
          // Notificar proveedor sobre evaluación completada
          await this.notificarEvaluacionCompleta(auditoria);
          break;

        case this.ESTADOS.CERRADA:
          // Notificar cierre de auditoría
          await this.notificarAuditoriaCerrada(auditoria);
          break;
      }

      // Emit WebSocket event
      const io = global.io;
      if (io) {
        io.emit('audit_workflow_change', {
          auditoriaId,
          estadoAnterior,
          estadoNuevo: nuevoEstado,
          timestamp: new Date()
        });
      }

    } catch (error) {
      logger.error('Error procesando eventos post-transición:', error);
    }
  }

  /**
   * Ejecutar verificaciones programadas (para cron jobs)
   */
  static async ejecutarVerificacionesProgramadas() {
    try {
      logger.info('Iniciando verificaciones programadas de workflow');
      
      const resultados = {
        vencimientos: await this.verificarVencimientos(),
        timestamp: new Date()
      };

      logger.info('Verificaciones programadas completadas:', resultados);
      return resultados;

    } catch (error) {
      logger.error('Error en verificaciones programadas:', error);
      throw error;
    }
  }

  /**
   * Obtener métricas del workflow
   */
  static async obtenerMetricas() {
    try {
      const metricas = await Promise.all([
        Auditoria.count({ where: { estado: this.ESTADOS.PROGRAMADA } }),
        Auditoria.count({ where: { estado: this.ESTADOS.EN_CARGA } }),
        Auditoria.count({ where: { estado: this.ESTADOS.PENDIENTE_EVALUACION } }),
        Auditoria.count({ where: { estado: this.ESTADOS.EVALUADA } }),
        Auditoria.count({ where: { estado: this.ESTADOS.CERRADA } })
      ]);

      return {
        programadas: metricas[0],
        en_carga: metricas[1],
        pendiente_evaluacion: metricas[2],
        evaluadas: metricas[3],
        cerradas: metricas[4],
        total: metricas.reduce((sum, count) => sum + count, 0)
      };

    } catch (error) {
      logger.error('Error obteniendo métricas de workflow:', error);
      return null;
    }
  }

  // Métodos de notificación (stub - implementación completa en NotificacionService)
  static async notificarInicioCargar(auditoria) {
    logger.info(`Notificación: Inicio de carga para auditoría ${auditoria.id}`);
  }

  static async notificarPendienteEvaluacion(auditoria) {
    logger.info(`Notificación: Pendiente evaluación auditoría ${auditoria.id}`);
  }

  static async notificarEvaluacionCompleta(auditoria) {
    logger.info(`Notificación: Evaluación completa auditoría ${auditoria.id}`);
  }

  static async notificarAuditoriaCerrada(auditoria) {
    logger.info(`Notificación: Auditoría cerrada ${auditoria.id}`);
  }
}

module.exports = WorkflowService;