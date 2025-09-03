/**
 * SAT-Digital Backend - Controlador de Auditores
 * Checkpoint 2.5: Panel de Control para Auditores
 * 
 * Funcionalidades:
 * - Dashboard personalizado por auditor
 * - Visualización de progreso en tiempo real
 * - Seguimiento de consultas pendientes
 * - Herramientas de revisión documental
 * - Reportes de estado exportables
 */

const { z } = require('zod');
const { Op } = require('sequelize');
const { 
  Usuario, 
  Auditoria, 
  Sitio, 
  Proveedor, 
  Documento, 
  AsignacionAuditor,
  Conversacion,
  Mensaje
} = require('../../../shared/database/models');
const logger = require('../../../shared/utils/logger');

/**
 * Esquemas de validación con Zod
 */
const FiltrosSchema = z.object({
  periodo: z.string().optional(),
  estado: z.enum(['programada', 'en_carga', 'pendiente_evaluacion', 'evaluada', 'cerrada']).optional(),
  proveedor_id: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
  fecha_desde: z.string().optional(),
  fecha_hasta: z.string().optional(),
  sitio_id: z.string().optional().transform((val) => val ? parseInt(val) : undefined)
});

const ExportarReporteSchema = z.object({
  formato: z.enum(['pdf', 'excel', 'csv']),
  auditorias_ids: z.array(z.number()).optional(),
  incluir_detalles: z.boolean().default(true),
  incluir_conversaciones: z.boolean().default(false)
});

class AuditorController {
  
  /**
   * Obtener dashboard personalizado del auditor
   * GET /api/auditorias/dashboard
   */
  static async obtenerDashboard(req, res) {
    try {
      const auditorId = req.usuario.id;

      // Verificar que el usuario sea auditor
      if (!['admin', 'auditor'].includes(req.usuario.rol)) {
        return res.status(403).json({
          success: false,
          message: 'Solo auditores pueden acceder a este dashboard'
        });
      }

      // Obtener estadísticas generales del auditor
      const [
        totalAsignadas,
        auditoriasPendientes,
        auditoriasEnCarga,
        auditoriasPendienteEvaluacion,
        consultasPendientes,
        auditoriasMesActual
      ] = await Promise.all([
        // Total de auditorías asignadas
        AsignacionAuditor.count({
          where: { auditor_id: auditorId }
        }),
        
        // Auditorías pendientes
        AsignacionAuditor.count({
          where: { auditor_id: auditorId },
          include: [{
            model: Auditoria,
            as: 'auditoria',
            where: { estado: ['programada'] }
          }]
        }),

        // Auditorías en proceso de carga
        AsignacionAuditor.count({
          where: { auditor_id: auditorId },
          include: [{
            model: Auditoria,
            as: 'auditoria',
            where: { estado: 'en_carga' }
          }]
        }),

        // Auditorías pendientes de evaluación
        AsignacionAuditor.count({
          where: { auditor_id: auditorId },
          include: [{
            model: Auditoria,
            as: 'auditoria',
            where: { estado: 'pendiente_evaluacion' }
          }]
        }),

        // Consultas pendientes de respuesta
        Conversacion.count({
          include: [{
            model: Auditoria,
            as: 'auditoria',
            include: [{
              model: AsignacionAuditor,
              as: 'asignacion',
              where: { auditor_id: auditorId }
            }]
          }],
          where: { estado: ['abierta', 'en_proceso'] }
        }),

        // Auditorías del mes actual
        AsignacionAuditor.count({
          where: { auditor_id: auditorId },
          include: [{
            model: Auditoria,
            as: 'auditoria',
            where: {
              fecha_inicio: {
                [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          }]
        })
      ]);

      // Próximas visitas programadas
      const proximasVisitas = await AsignacionAuditor.findAll({
        where: { 
          auditor_id: auditorId,
          fecha_visita_programada: {
            [Op.gte]: new Date(),
            [Op.lte]: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Próximos 30 días
          }
        },
        include: [{
          model: Auditoria,
          as: 'auditoria',
          include: [{
            model: Sitio,
            as: 'sitio',
            include: [{
              model: Proveedor,
              as: 'proveedor',
              attributes: ['razon_social', 'nombre_comercial']
            }]
          }]
        }],
        order: [['fecha_visita_programada', 'ASC']],
        limit: 5
      });

      // Alertas importantes
      const alertas = [];
      
      if (auditoriasPendienteEvaluacion > 0) {
        alertas.push({
          tipo: 'warning',
          mensaje: `Tienes ${auditoriasPendienteEvaluacion} auditoría${auditoriasPendienteEvaluacion > 1 ? 's' : ''} pendiente${auditoriasPendienteEvaluacion > 1 ? 's' : ''} de evaluación`,
          count: auditoriasPendienteEvaluacion
        });
      }

      if (consultasPendientes > 0) {
        alertas.push({
          tipo: 'info',
          mensaje: `Tienes ${consultasPendientes} consulta${consultasPendientes > 1 ? 's' : ''} sin responder`,
          count: consultasPendientes
        });
      }

      res.json({
        success: true,
        data: {
          estadisticas: {
            total_asignadas: totalAsignadas,
            pendientes: auditoriasPendientes,
            en_carga: auditoriasEnCarga,
            pendiente_evaluacion: auditoriasPendienteEvaluacion,
            consultas_pendientes: consultasPendientes,
            mes_actual: auditoriasMesActual
          },
          proximas_visitas: proximasVisitas.map(asignacion => ({
            id: asignacion.auditoria.id,
            sitio: asignacion.auditoria.sitio.nombre,
            proveedor: asignacion.auditoria.sitio.proveedor.razon_social,
            fecha_programada: asignacion.fecha_visita_programada,
            estado: asignacion.auditoria.estado,
            localidad: asignacion.auditoria.sitio.localidad
          })),
          alertas,
          auditor: {
            id: req.usuario.id,
            nombre: req.usuario.nombre,
            rol: req.usuario.rol
          }
        }
      });

    } catch (error) {
      logger.error('Error obteniendo dashboard auditor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener auditorías asignadas con filtros
   * GET /api/auditorias/mis-auditorias
   */
  static async obtenerMisAuditorias(req, res) {
    try {
      const auditorId = req.usuario.id;
      
      // Validar filtros
      const filtros = FiltrosSchema.parse(req.query);
      
      // Construir condiciones WHERE
      let condicionesAuditoria = {};
      
      if (filtros.periodo) {
        condicionesAuditoria.periodo = filtros.periodo;
      }
      
      if (filtros.estado) {
        condicionesAuditoria.estado = filtros.estado;
      }
      
      if (filtros.fecha_desde || filtros.fecha_hasta) {
        condicionesAuditoria.fecha_inicio = {};
        if (filtros.fecha_desde) {
          condicionesAuditoria.fecha_inicio[Op.gte] = filtros.fecha_desde;
        }
        if (filtros.fecha_hasta) {
          condicionesAuditoria.fecha_inicio[Op.lte] = filtros.fecha_hasta;
        }
      }

      let condicionesSitio = {};
      if (filtros.sitio_id) {
        condicionesSitio.id = filtros.sitio_id;
      }

      let condicionesProveedor = {};
      if (filtros.proveedor_id) {
        condicionesProveedor.id = filtros.proveedor_id;
      }

      // Obtener auditorías con paginación
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const { count, rows } = await AsignacionAuditor.findAndCountAll({
        where: { auditor_id: auditorId },
        include: [{
          model: Auditoria,
          as: 'auditoria',
          where: condicionesAuditoria,
          include: [{
            model: Sitio,
            as: 'sitio',
            where: condicionesSitio,
            include: [{
              model: Proveedor,
              as: 'proveedor',
              where: condicionesProveedor,
              attributes: ['id', 'razon_social', 'nombre_comercial']
            }]
          }, {
            model: Documento,
            as: 'documentos',
            attributes: ['id', 'seccion_id', 'estado_analisis'],
            required: false
          }]
        }],
        order: [['created_at', 'DESC']],
        limit,
        offset
      });

      // Calcular progreso de cada auditoría
      const auditoriasConProgreso = rows.map(asignacion => {
        const auditoria = asignacion.auditoria;
        const totalSecciones = 13; // Total de secciones técnicas
        const seccionesCargadas = new Set(auditoria.documentos.map(d => d.seccion_id)).size;
        const progresoPorcentaje = Math.round((seccionesCargadas / totalSecciones) * 100);

        return {
          id: auditoria.id,
          sitio: {
            id: auditoria.sitio.id,
            nombre: auditoria.sitio.nombre,
            localidad: auditoria.sitio.localidad
          },
          proveedor: {
            id: auditoria.sitio.proveedor.id,
            nombre: auditoria.sitio.proveedor.razon_social || auditoria.sitio.proveedor.nombre_comercial
          },
          periodo: auditoria.periodo,
          estado: auditoria.estado,
          fecha_inicio: auditoria.fecha_inicio,
          fecha_limite_carga: auditoria.fecha_limite_carga,
          fecha_visita_programada: asignacion.fecha_visita_programada,
          fecha_visita_realizada: auditoria.fecha_visita_realizada,
          progreso: {
            secciones_cargadas: seccionesCargadas,
            total_secciones: totalSecciones,
            porcentaje: progresoPorcentaje
          },
          puntaje_final: auditoria.puntaje_final,
          documentos_count: auditoria.documentos.length,
          requiere_atencion: (
            auditoria.estado === 'pendiente_evaluacion' ||
            (auditoria.estado === 'en_carga' && new Date() > new Date(auditoria.fecha_limite_carga))
          )
        };
      });

      res.json({
        success: true,
        data: {
          auditorias: auditoriasConProgreso,
          pagination: {
            current_page: page,
            total_pages: Math.ceil(count / limit),
            total_items: count,
            items_per_page: limit
          },
          filtros_aplicados: filtros
        }
      });

    } catch (error) {
      logger.error('Error obteniendo auditorías del auditor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener consultas pendientes de respuesta
   * GET /api/auditorias/consultas-pendientes
   */
  static async obtenerConsultasPendientes(req, res) {
    try {
      const auditorId = req.usuario.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Por ahora devolvemos estructura básica - implementación completa en próximos checkpoints
      res.json({
        success: true,
        message: 'Consultas pendientes - funcionalidad en desarrollo',
        data: {
          consultas: [],
          pagination: {
            current_page: page,
            total_pages: 0,
            total_items: 0,
            items_per_page: limit
          }
        }
      });

    } catch (error) {
      logger.error('Error obteniendo consultas pendientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }


  static async obtenerRevisionAuditoria(req, res) {
    try {
      const auditorId = req.usuario.id;
      const auditoriaId = parseInt(req.params.id);

      // Verificar que la auditoría esté asignada al auditor
      const asignacion = await AsignacionAuditor.findOne({
        where: { 
          auditoria_id: auditoriaId,
          auditor_id: auditorId 
        }
      });

      if (!asignacion && req.usuario.rol !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta auditoría'
        });
      }

      // Obtener auditoría completa
      const auditoria = await Auditoria.findByPk(auditoriaId, {
        include: [{
          model: Sitio,
          as: 'sitio',
          include: [{
            model: Proveedor,
            as: 'proveedor'
          }]
        }, {
          model: Documento,
          as: 'documentos',
          include: [{
            model: Usuario,
            as: 'usuario_carga',
            attributes: ['nombre', 'rol']
          }],
          required: false
        }, {
          model: Conversacion,
          as: 'conversaciones',
          required: false
        }]
      });

      if (!auditoria) {
        return res.status(404).json({
          success: false,
          message: 'Auditoría no encontrada'
        });
      }

      // Calcular progreso
      const totalSecciones = 13;
      const seccionesCargadas = new Set(auditoria.documentos.map(d => d.seccion_id)).size;
      const progresoPorcentaje = Math.round((seccionesCargadas / totalSecciones) * 100);

      res.json({
        success: true,
        data: {
          auditoria: {
            id: auditoria.id,
            periodo: auditoria.periodo,
            estado: auditoria.estado,
            fecha_inicio: auditoria.fecha_inicio,
            fecha_limite_carga: auditoria.fecha_limite_carga,
            puntaje_final: auditoria.puntaje_final,
            observaciones_generales: auditoria.observaciones_generales
          },
          sitio: {
            nombre: auditoria.sitio.nombre,
            localidad: auditoria.sitio.localidad
          },
          proveedor: {
            razon_social: auditoria.sitio.proveedor.razon_social,
            nombre_comercial: auditoria.sitio.proveedor.nombre_comercial
          },
          progreso: {
            secciones_cargadas: seccionesCargadas,
            total_secciones: totalSecciones,
            porcentaje: progresoPorcentaje,
            documentos_totales: auditoria.documentos.length
          },
          asignacion: asignacion ? {
            fecha_asignacion: asignacion.fecha_asignacion,
            prioridad: asignacion.prioridad,
            observaciones: asignacion.observaciones
          } : null
        }
      });

    } catch (error) {
      logger.error('Error obteniendo revisión de auditoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Actualizar estado de auditoría
   * PUT /api/auditorias/:id/estado
   */
  static async actualizarEstadoAuditoria(req, res) {
    try {
      const auditorId = req.usuario.id;
      const auditoriaId = parseInt(req.params.id);
      const { nuevo_estado, observaciones } = req.body;

      // Validar nuevo estado
      const estadosValidos = ['pendiente_evaluacion', 'evaluada', 'cerrada'];
      if (!estadosValidos.includes(nuevo_estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado no válido'
        });
      }

      // Verificar asignación
      const asignacion = await AsignacionAuditor.findOne({
        where: { 
          auditoria_id: auditoriaId,
          auditor_id: auditorId 
        }
      });

      if (!asignacion) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta auditoría'
        });
      }

      // Actualizar auditoría
      const auditoria = await Auditoria.findByPk(auditoriaId);
      const estadoAnterior = auditoria.estado;

      await auditoria.update({
        estado: nuevo_estado,
        observaciones_generales: observaciones || auditoria.observaciones_generales,
        updated_at: new Date()
      });

      // Registrar en bitácora
      const { registrarBitacora } = require('../../../shared/utils/bitacora');
      await registrarBitacora(
        auditorId,
        'CAMBIO_ESTADO_AUDITORIA',
        'Auditoria',
        auditoriaId,
        `Estado cambiado de ${estadoAnterior} a ${nuevo_estado}`,
        { estado_anterior: estadoAnterior, estado_nuevo: nuevo_estado },
        { estado_anterior: estadoAnterior, estado_nuevo: nuevo_estado },
        req
      );

      // Notificar cambio via WebSocket
      if (req.io) {
        req.io.emit('audit_status_changed', {
          auditoriaId,
          nuevoEstado: nuevo_estado,
          auditor: req.usuario.nombre,
          timestamp: new Date()
        });
      }

      res.json({
        success: true,
        message: 'Estado de auditoría actualizado correctamente',
        data: {
          id: auditoriaId,
          estado_anterior: estadoAnterior,
          estado_nuevo: nuevo_estado
        }
      });

    } catch (error) {
      logger.error('Error actualizando estado de auditoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Exportar reporte de estado de auditorías
   * POST /api/auditorias/exportar-reporte
   */
  static async exportarReporte(req, res) {
    try {
      const auditorId = req.usuario.id;
      const { formato, auditorias_ids, incluir_detalles, incluir_conversaciones } = ExportarReporteSchema.parse(req.body);

      // Por ahora retornamos los datos en JSON - PDF/Excel en futuras fases
      res.json({
        success: true,
        message: `Funcionalidad de exportación en desarrollo para ${formato}`,
        data: {
          formato,
          nota: 'Exportación PDF/Excel será implementada en Checkpoint 2.6'
        }
      });

    } catch (error) {
      logger.error('Error exportando reporte:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = AuditorController;
