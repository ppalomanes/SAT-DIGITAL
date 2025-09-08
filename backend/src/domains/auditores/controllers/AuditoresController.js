// Controller para Panel de Control de Auditores
// Checkpoint 2.5 - Endpoints especializados para auditores

const { Usuario, Auditoria, Sitio, Proveedor, Documento, Conversacion, Mensaje } = require('../../../shared/database/models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

class AuditoresController {
  
  /**
   * Obtener resumen ejecutivo para auditor
   */
  static async obtenerResumen(req, res) {
    try {
      const auditorId = req.user.id;
      
      // Contar auditorías asignadas al auditor
      const auditoriasAsignadas = await Auditoria.count({
        where: { auditor_asignado_id: auditorId }
      });

      // Contar auditorías pendientes de revisión
      const pendientesRevision = await Auditoria.count({
        where: { 
          auditor_asignado_id: auditorId,
          estado: 'en_revision'
        }
      });

      // Contar próximas visitas (próximos 7 días)
      const proximaSemana = new Date();
      proximaSemana.setDate(proximaSemana.getDate() + 7);
      
      const proximasVisitas = await Auditoria.count({
        where: {
          auditor_asignado_id: auditorId,
          fecha_visita: {
            [Op.between]: [new Date(), proximaSemana]
          }
        }
      });

      // Contar alertas activas (auditorías que vencen pronto)
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      
      const alertasActivas = await Auditoria.count({
        where: {
          auditor_asignado_id: auditorId,
          fecha_limite_carga: {
            [Op.lte]: manana
          },
          estado: {
            [Op.in]: ['en_carga', 'programada']
          }
        }
      });

      // Distribución por estado
      const auditoriasPorEstado = await Auditoria.findAll({
        attributes: [
          'estado',
          [Auditoria.sequelize.fn('COUNT', '*'), 'cantidad']
        ],
        where: { auditor_asignado_id: auditorId },
        group: ['estado']
      });

      const estadosFormateados = auditoriasPorEstado.map(item => ({
        estado: this.formatearEstado(item.estado),
        cantidad: parseInt(item.getDataValue('cantidad')),
        color: this.obtenerColorEstado(item.estado)
      }));

      res.json({
        auditorias_asignadas: auditoriasAsignadas,
        pendientes_revision: pendientesRevision,
        proximas_visitas: proximasVisitas,
        alertas_activas: alertasActivas,
        auditoriasPorEstado: estadosFormateados
      });

    } catch (error) {
      console.error('Error obteniendo resumen auditor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener próximas visitas del auditor
   */
  static async obtenerProximasVisitas(req, res) {
    try {
      const auditorId = req.user.id;
      const limite = parseInt(req.query.limite) || 10;
      
      const proximaSemana = new Date();
      proximaSemana.setDate(proximaSemana.getDate() + 14); // Próximas 2 semanas

      const visitas = await Auditoria.findAll({
        where: {
          auditor_asignado_id: auditorId,
          fecha_visita: {
            [Op.between]: [new Date(), proximaSemana]
          }
        },
        include: [{
          model: Sitio,
          as: 'sitio',
          include: [{
            model: Proveedor,
            as: 'proveedor',
            attributes: ['id', 'nombre_comercial']
          }]
        }],
        order: [['fecha_visita', 'ASC']],
        limit: limite
      });

      const visitasFormateadas = visitas.map(v => ({
        id: v.id,
        sitio: v.sitio.nombre,
        proveedor: v.sitio.proveedor.nombre_comercial,
        fecha: v.fecha_visita,
        estado: v.estado === 'programada' ? 'programada' : 'confirmada'
      }));

      res.json(visitasFormateadas);

    } catch (error) {
      console.error('Error obteniendo próximas visitas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener alertas críticas del auditor
   */
  static async obtenerAlertasCriticas(req, res) {
    try {
      const auditorId = req.user.id;
      
      const alertas = [];
      
      // Alertas de vencimiento (24 horas)
      const hoy = new Date();
      const manana = new Date(hoy.getTime() + 24 * 60 * 60 * 1000);
      
      const vencenPronto = await Auditoria.findAll({
        where: {
          auditor_asignado_id: auditorId,
          fecha_limite_carga: {
            [Op.between]: [hoy, manana]
          },
          estado: {
            [Op.in]: ['en_carga', 'programada']
          }
        },
        include: [{
          model: Sitio,
          as: 'sitio',
          include: [{
            model: Proveedor,
            as: 'proveedor'
          }]
        }]
      });

      vencenPronto.forEach(auditoria => {
        alertas.push({
          id: `venc_${auditoria.id}`,
          tipo: 'vencimiento',
          sitio: auditoria.sitio.nombre,
          proveedor: auditoria.sitio.proveedor.nombre_comercial,
          mensaje: 'Documentos vencen en menos de 24 horas',
          severidad: 'alta',
          fechaLimite: auditoria.fecha_limite_carga,
          auditoriaId: auditoria.id
        });
      });

      // Alertas de documentos faltantes
      const conDocumentosFaltantes = await Auditoria.findAll({
        where: {
          auditor_asignado_id: auditorId,
          estado: 'en_carga'
        },
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
          required: false
        }]
      });

      for (const auditoria of conDocumentosFaltantes) {
        const totalSecciones = 20; // Número total de secciones técnicas
        const seccionesCargadas = auditoria.documentos?.length || 0;
        const faltantes = totalSecciones - seccionesCargadas;

        if (faltantes > 10) {
          alertas.push({
            id: `doc_${auditoria.id}`,
            tipo: 'documentos_faltantes',
            sitio: auditoria.sitio.nombre,
            proveedor: auditoria.sitio.proveedor.nombre_comercial,
            mensaje: `${faltantes} secciones técnicas sin documentos`,
            severidad: faltantes > 15 ? 'alta' : 'media',
            fechaLimite: auditoria.fecha_limite_carga,
            auditoriaId: auditoria.id
          });
        }
      }

      res.json(alertas);

    } catch (error) {
      console.error('Error obteniendo alertas críticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener actividad reciente del auditor
   */
  static async obtenerActividadReciente(req, res) {
    try {
      const auditorId = req.user.id;
      const limite = parseInt(req.query.limite) || 10;
      
      const actividad = [];
      
      // Documentos recientes en auditorías del auditor
      const documentosRecientes = await Documento.findAll({
        include: [{
          model: Auditoria,
          as: 'auditoria',
          where: { auditor_asignado_id: auditorId },
          include: [{
            model: Sitio,
            as: 'sitio',
            include: [{
              model: Proveedor,
              as: 'proveedor'
            }]
          }]
        }, {
          model: Usuario,
          as: 'usuario_carga',
          attributes: ['email', 'nombre']
        }],
        order: [['created_at', 'DESC']],
        limit: Math.floor(limite / 2)
      });

      documentosRecientes.forEach(doc => {
        actividad.push({
          tipo: 'documento',
          descripcion: `Nuevo documento cargado en ${doc.auditoria.sitio.nombre}`,
          timestamp: doc.created_at,
          usuario: doc.usuario_carga?.email || 'Sistema',
          auditoriaId: doc.auditoria.id
        });
      });

      // Mensajes recientes en conversaciones del auditor
      const mensajesRecientes = await Mensaje.findAll({
        include: [{
          model: Conversacion,
          as: 'conversacion',
          include: [{
            model: Auditoria,
            as: 'auditoria',
            where: { auditor_asignado_id: auditorId },
            include: [{
              model: Sitio,
              as: 'sitio'
            }]
          }]
        }, {
          model: Usuario,
          as: 'usuario',
          attributes: ['email', 'nombre']
        }],
        where: {
          usuario_id: { [Op.ne]: auditorId } // Excluir mensajes del propio auditor
        },
        order: [['created_at', 'DESC']],
        limit: Math.floor(limite / 2)
      });

      mensajesRecientes.forEach(mensaje => {
        actividad.push({
          tipo: 'mensaje',
          descripcion: `Nuevo mensaje en auditoría ${mensaje.conversacion.auditoria.sitio.nombre}`,
          timestamp: mensaje.created_at,
          usuario: mensaje.usuario?.email || 'Usuario',
          auditoriaId: mensaje.conversacion.auditoria.id
        });
      });

      // Ordenar por timestamp descendente
      actividad.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      res.json(actividad.slice(0, limite));

    } catch (error) {
      console.error('Error obteniendo actividad reciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Métodos auxiliares
   */
  static formatearEstado(estado) {
    const estados = {
      'programada': 'Programada',
      'en_carga': 'En carga',
      'en_revision': 'En revisión',
      'completada': 'Completada',
      'cancelada': 'Cancelada'
    };
    return estados[estado] || estado;
  }

  static obtenerColorEstado(estado) {
    const colores = {
      'programada': '#9E9E9E',
      'en_carga': '#FF9800',
      'en_revision': '#2196F3',
      'completada': '#4CAF50',
      'cancelada': '#F44336'
    };
    return colores[estado] || '#9E9E9E';
  }
}

module.exports = AuditoresController;