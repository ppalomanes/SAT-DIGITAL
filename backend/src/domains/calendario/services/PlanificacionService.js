const dayjs = require('dayjs');
const { Auditoria, Sitio, Usuario } = require('../../../shared/database/models');
const { Op } = require('sequelize');
const PeriodoAuditoria = require('../models/PeriodoAuditoria');
const AsignacionAuditor = require('../models/AsignacionAuditor');

/**
 * Servicio para planificación automática de auditorías
 */
class PlanificacionService {
  /**
   * Genera automáticamente todas las auditorías para un período
   */
  static async generarAuditoriasPeriodo(periodoId) {
    try {
      const periodo = await PeriodoAuditoria.findByPk(periodoId);
      if (!periodo) {
        throw new Error('Período no encontrado');
      }

      // Obtener todos los sitios activos
      const sitios = await Sitio.findAll({
        where: { estado: 'activo' },
        include: ['proveedor']
      });

      // Obtener auditores disponibles
      const auditores = await Usuario.findAll({
        where: { rol: 'auditor', estado: 'activo' }
      });

      if (auditores.length === 0) {
        throw new Error('No hay auditores disponibles');
      }

      const auditorias = [];

      // Crear auditoría para cada sitio
      for (const sitio of sitios) {
        const auditoria = await Auditoria.create({
          sitio_id: sitio.id,
          periodo: periodo.codigo,
          fecha_inicio: periodo.fecha_inicio,
          fecha_limite_carga: periodo.fecha_limite_carga,
          estado: 'programada'
        });

        auditorias.push(auditoria);

        // Asignar auditor óptimo
        const auditorOptimo = await this.seleccionarAuditorOptimo(
          sitio, auditores, periodo
        );

        if (auditorOptimo) {
          await AsignacionAuditor.create({
            auditoria_id: auditoria.id,
            auditor_id: auditorOptimo.auditor_id,
            fecha_visita_programada: auditorOptimo.fecha_sugerida
          });
        }
      }

      await this.optimizarCronograma(auditorias, periodo);

      return {
        auditorias_creadas: auditorias.length,
        periodo: periodo.codigo
      };

    } catch (error) {
      throw new Error(`Error generando auditorías: ${error.message}`);
    }
  }

  /**
   * Selecciona el auditor más adecuado para un sitio específico
   */
  static async seleccionarAuditorOptimo(sitio, auditores, periodo) {
    const criterios = [];

    for (const auditor of auditores) {
      // Calcular carga de trabajo actual
      const cargaActual = await AsignacionAuditor.count({
        include: {
          model: Auditoria,
          where: { periodo: periodo.codigo }
        },
        where: { auditor_id: auditor.id }
      });

      // Calcular score (menos carga = mejor score)
      const score = Math.max(0, 10 - cargaActual);

      criterios.push({
        auditor_id: auditor.id,
        score_total: score,
        carga_actual: cargaActual,
        fecha_sugerida: this.calcularFechaSugerida(auditor, periodo)
      });
    }

    // Ordenar por score y seleccionar el mejor
    criterios.sort((a, b) => b.score_total - a.score_total);
    
    return criterios.length > 0 ? criterios[0] : null;
  }

  /**
   * Calcula fecha sugerida para visita
   */
  static calcularFechaSugerida(auditor, periodo) {
    const inicioVisitas = dayjs(periodo.fecha_inicio_visitas);
    const finVisitas = dayjs(periodo.fecha_fin_visitas);
    
    // Distribuir visitas a lo largo del período
    const diasDisponibles = finVisitas.diff(inicioVisitas, 'day');
    const diasOffset = Math.floor(Math.random() * diasDisponibles);
    
    return inicioVisitas.add(diasOffset, 'day').toDate();
  }

  /**
   * Optimiza el cronograma completo
   */
  static async optimizarCronograma(auditorias, periodo) {
    // Implementación básica - puede mejorarse con algoritmos más sofisticados
    for (const auditoria of auditorias) {
      const asignacion = await AsignacionAuditor.findOne({
        where: { auditoria_id: auditoria.id }
      });

      if (asignacion && !asignacion.fecha_visita_programada) {
        const fechaOptima = this.calcularFechaSugerida({}, periodo);
        await asignacion.update({
          fecha_visita_programada: fechaOptima
        });
      }
    }
  }

  /**
   * Obtiene estadísticas del período
   */
  static async obtenerEstadisticasPeriodo(periodoId) {
    const periodo = await PeriodoAuditoria.findByPk(periodoId);
    if (!periodo) return null;

    const totalAuditorias = await Auditoria.count({
      where: { periodo: periodo.codigo }
    });

    const asignaciones = await AsignacionAuditor.count({
      include: {
        model: Auditoria,
        where: { periodo: periodo.codigo }
      }
    });

    const visitasCompletadas = await AsignacionAuditor.count({
      where: { estado_asignacion: 'completado' },
      include: {
        model: Auditoria,
        where: { periodo: periodo.codigo }
      }
    });

    return {
      periodo: periodo.codigo,
      total_auditorias: totalAuditorias,
      total_asignaciones: asignaciones,
      visitas_completadas: visitasCompletadas,
      progreso_porcentaje: totalAuditorias > 0 ? 
        Math.round((visitasCompletadas / totalAuditorias) * 100) : 0
    };
  }
}

module.exports = PlanificacionService;
