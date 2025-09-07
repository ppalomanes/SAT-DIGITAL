// Controller para métricas y control de Workflow
// Checkpoint 2.9 - Sistema de Estados Automáticos

const WorkflowService = require('../services/WorkflowService');
const { Auditoria, Documento, SeccionTecnica } = require('../../../shared/database/models');
const logger = require('../../../shared/utils/logger');

class WorkflowController {

  /**
   * Obtener métricas generales del workflow
   */
  static async obtenerMetricas(req, res) {
    try {
      const metricas = await WorkflowService.obtenerMetricas();
      
      // Métricas adicionales
      const ahora = new Date();
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      
      const { Op } = require('sequelize');
      const metricasMes = await Auditoria.findAll({
        attributes: [
          'estado',
          [Auditoria.sequelize.fn('COUNT', '*'), 'cantidad']
        ],
        where: {
          created_at: {
            [Op.gte]: inicioMes
          }
        },
        group: ['estado']
      });

      const metricasPorMes = {};
      metricasMes.forEach(m => {
        metricasPorMes[m.estado] = parseInt(m.getDataValue('cantidad'));
      });

      res.json({
        success: true,
        data: {
          global: metricas,
          este_mes: metricasPorMes,
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('Error obteniendo métricas de workflow:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo métricas de workflow'
      });
    }
  }

  /**
   * Obtener progreso específico de una auditoría
   */
  static async obtenerProgresoAuditoria(req, res) {
    try {
      const { auditoriaId } = req.params;
      
      const auditoria = await Auditoria.findByPk(auditoriaId);
      if (!auditoria) {
        return res.status(404).json({
          success: false,
          message: 'Auditoría no encontrada'
        });
      }

      // Calcular porcentaje basado en estado
      const porcentajes = {
        [WorkflowService.ESTADOS.PROGRAMADA]: 0,
        [WorkflowService.ESTADOS.EN_CARGA]: 25,
        [WorkflowService.ESTADOS.PENDIENTE_EVALUACION]: 50,
        [WorkflowService.ESTADOS.EVALUADA]: 75,
        [WorkflowService.ESTADOS.CERRADA]: 100
      };

      // Detalles de progreso
      const documentosCargados = await Documento.count({
        where: { auditoria_id: auditoriaId }
      });

      const seccionesObligatorias = await SeccionTecnica.findAll({
        where: { obligatoria: true, estado: 'activa' },
        attributes: ['id', 'nombre', 'codigo']
      });

      // Secciones completadas (con documentos)
      const seccionesCompletadas = await Documento.findAll({
        attributes: ['seccion_id', [Documento.sequelize.fn('COUNT', '*'), 'documentos']],
        where: { auditoria_id: auditoriaId },
        include: [{
          model: SeccionTecnica,
          as: 'seccion',
          attributes: ['nombre', 'codigo', 'obligatoria']
        }],
        group: ['seccion_id']
      });

      // Obtener siguiente estado lógico
      const obtenerSiguienteEstado = (estadoActual) => {
        const secuencia = ['programada', 'en_carga', 'pendiente_evaluacion', 'evaluada', 'cerrada'];
        const indiceActual = secuencia.indexOf(estadoActual);
        if (indiceActual === -1 || indiceActual === secuencia.length - 1) {
          return null;
        }
        return secuencia[indiceActual + 1];
      };

      const siguienteEstado = obtenerSiguienteEstado(auditoria.estado);
      
      // Verificar qué puede hacer el usuario
      const puedeAvanzar = await WorkflowService.esTransicionValida(
        auditoria.estado,
        siguienteEstado
      );

      res.json({
        success: true,
        data: {
          estado_actual: auditoria.estado,
          porcentaje: porcentajes[auditoria.estado] || 0,
          documentos_cargados: documentosCargados,
          secciones: {
            obligatorias: seccionesObligatorias.length,
            completadas: seccionesCompletadas.length,
            detalle_completadas: seccionesCompletadas.map(sc => ({
              seccion_id: sc.seccion_id,
              nombre: sc.seccion.nombre,
              codigo: sc.seccion.codigo,
              obligatoria: sc.seccion.obligatoria,
              documentos: parseInt(sc.getDataValue('documentos'))
            })),
            faltantes: seccionesObligatorias.filter(so => 
              !seccionesCompletadas.some(sc => sc.seccion_id === so.id)
            ).map(s => ({
              id: s.id,
              nombre: s.nombre,
              codigo: s.codigo
            }))
          },
          transiciones: {
            puede_avanzar: puedeAvanzar,
            siguiente_estado: siguienteEstado,
            estados_disponibles: WorkflowService.TRANSICIONES_PERMITIDAS[auditoria.estado] || []
          },
          fechas: {
            creada: auditoria.created_at,
            ultima_actualizacion: auditoria.updated_at,
            fecha_limite: auditoria.fecha_limite_carga,
            dias_restantes: auditoria.fecha_limite_carga ? 
              Math.ceil((new Date(auditoria.fecha_limite_carga) - new Date()) / (1000 * 60 * 60 * 24)) : null
          }
        }
      });
    } catch (error) {
      logger.error('Error obteniendo progreso de auditoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo progreso de auditoría'
      });
    }
  }

  /**
   * Forzar transición de estado (solo administradores)
   */
  static async forzarTransicion(req, res) {
    try {
      const { auditoriaId } = req.params;
      const { nuevo_estado, razon } = req.body;

      // Verificar permisos de administrador
      if (!['admin', 'auditor_general'].includes(req.usuario.rol)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para forzar transiciones de estado'
        });
      }

      if (!WorkflowService.ESTADOS[nuevo_estado.toUpperCase()]) {
        return res.status(400).json({
          success: false,
          message: 'Estado no válido'
        });
      }

      const resultado = await WorkflowService.cambiarEstado(
        auditoriaId,
        nuevo_estado,
        `Transición forzada por administrador: ${razon || 'Sin razón especificada'}`,
        req.usuario.id
      );

      res.json({
        success: true,
        data: resultado,
        message: `Estado cambiado exitosamente a: ${nuevo_estado}`
      });
    } catch (error) {
      logger.error('Error forzando transición:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Verificar manualmente las transiciones automáticas para una auditoría
   */
  static async verificarTransicionesManual(req, res) {
    try {
      const { auditoriaId } = req.params;
      
      const auditoria = await Auditoria.findByPk(auditoriaId);
      if (!auditoria) {
        return res.status(404).json({
          success: false,
          message: 'Auditoría no encontrada'
        });
      }

      const estadoInicial = auditoria.estado;
      
      // Ejecutar verificaciones
      await WorkflowService.verificarInicioCargar(auditoriaId, req.usuario.id);
      await WorkflowService.verificarCargaCompleta(auditoriaId, req.usuario.id);
      
      // Verificar si hubo cambios
      const auditoriaActualizada = await Auditoria.findByPk(auditoriaId);
      const huboCambio = estadoInicial !== auditoriaActualizada.estado;

      res.json({
        success: true,
        data: {
          estado_inicial: estadoInicial,
          estado_final: auditoriaActualizada.estado,
          cambio_realizado: huboCambio,
          timestamp: new Date()
        },
        message: huboCambio ? 
          `Estado actualizado: ${estadoInicial} → ${auditoriaActualizada.estado}` :
          'No se requirieron cambios de estado'
      });
    } catch (error) {
      logger.error('Error verificando transiciones manuales:', error);
      res.status(500).json({
        success: false,
        message: 'Error verificando transiciones automáticas'
      });
    }
  }

  /**
   * Obtener historial de cambios de estado
   */
  static async obtenerHistorialEstados(req, res) {
    try {
      const { auditoriaId } = req.params;
      const { Bitacora, Usuario } = require('../../../shared/database/models');
      
      const historial = await Bitacora.findAll({
        where: {
          entidad_tipo: 'Auditoria',
          entidad_id: auditoriaId,
          accion: ['CAMBIO_ESTADO_AUTOMATICO', 'CAMBIO_ESTADO_AUDITORIA']
        },
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email', 'rol']
        }],
        order: [['timestamp', 'DESC']],
        limit: 50
      });

      const historialFormateado = historial.map(h => ({
        id: h.id,
        accion: h.accion,
        descripcion: h.descripcion,
        timestamp: h.timestamp,
        usuario: h.usuario ? {
          nombre: h.usuario.nombre,
          email: h.usuario.email,
          rol: h.usuario.rol
        } : null,
        detalles: h.datos_despues
      }));

      res.json({
        success: true,
        data: historialFormateado
      });
    } catch (error) {
      logger.error('Error obteniendo historial de estados:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo historial de estados'
      });
    }
  }

  /**
   * Ejecutar verificaciones programadas (para uso interno/cron)
   */
  static async ejecutarVerificacionesProgramadas(req, res) {
    try {
      // Solo permitir a administradores o sistema
      if (req.usuario && !['admin', 'sistema'].includes(req.usuario.rol)) {
        return res.status(403).json({
          success: false,
          message: 'No autorizado'
        });
      }

      const resultados = await WorkflowService.ejecutarVerificacionesProgramadas();
      
      res.json({
        success: true,
        data: resultados,
        message: 'Verificaciones programadas ejecutadas exitosamente'
      });
    } catch (error) {
      logger.error('Error ejecutando verificaciones programadas:', error);
      res.status(500).json({
        success: false,
        message: 'Error ejecutando verificaciones programadas'
      });
    }
  }
}

module.exports = WorkflowController;