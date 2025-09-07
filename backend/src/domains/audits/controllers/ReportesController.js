// Controller de Reportes y Analytics de Auditorías
// Checkpoint 2.10 - Endpoints para sistema completo de reportes

const ReportesService = require('../services/ReportesService');
const { verificarToken } = require('../../../shared/middleware/authMiddleware');
const { verificarRol } = require('../../../shared/middleware/authMiddleware');

class ReportesController {

  /**
   * GET /api/reportes/resumen-ejecutivo
   * Obtener resumen ejecutivo de auditorías
   */
  static async obtenerResumenEjecutivo(req, res) {
    try {
      const { periodo, proveedor_id, fecha_desde, fecha_hasta } = req.query;
      
      const filtros = {};
      if (periodo) filtros.periodo = periodo;
      if (proveedor_id) filtros.proveedor_id = parseInt(proveedor_id);
      if (fecha_desde) filtros.fecha_desde = fecha_desde;
      if (fecha_hasta) filtros.fecha_hasta = fecha_hasta;

      const resumen = await ReportesService.obtenerResumenEjecutivo(filtros);
      
      res.json({
        success: true,
        data: resumen,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al obtener resumen ejecutivo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * GET /api/reportes/auditoria/:id/detalle
   * Obtener detalle completo de auditoría
   */
  static async obtenerDetalleAuditoria(req, res) {
    try {
      const auditoriaId = parseInt(req.params.id);
      
      if (isNaN(auditoriaId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de auditoría inválido'
        });
      }

      const detalle = await ReportesService.obtenerDetalleAuditoria(auditoriaId);
      
      res.json({
        success: true,
        data: detalle,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al obtener detalle de auditoría:', error);
      
      if (error.message === 'Auditoría no encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * GET /api/reportes/auditores/rendimiento
   * Obtener rendimiento por auditor
   */
  static async obtenerRendimientoAuditores(req, res) {
    try {
      const { periodo, fecha_desde, fecha_hasta } = req.query;
      
      const filtros = {};
      if (periodo) filtros.periodo = periodo;
      if (fecha_desde) filtros.fecha_desde = fecha_desde;
      if (fecha_hasta) filtros.fecha_hasta = fecha_hasta;

      const rendimiento = await ReportesService.obtenerRendimientoAuditores(filtros);
      
      res.json({
        success: true,
        data: rendimiento,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al obtener rendimiento de auditores:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * GET /api/reportes/metricas-tiempo-real
   * Obtener métricas en tiempo real para dashboard
   */
  static async obtenerMetricasTiempoReal(req, res) {
    try {
      const metricas = await ReportesService.obtenerMetricasTiempoReal();
      
      res.json({
        success: true,
        data: metricas,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al obtener métricas en tiempo real:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * POST /api/reportes/exportar
   * Generar y descargar reporte en formato Excel
   */
  static async exportarReporte(req, res) {
    try {
      const { tipo_reporte, filtros = {}, formato = 'excel' } = req.body;
      
      if (!tipo_reporte) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de reporte es requerido'
        });
      }

      const tiposPermitidos = ['resumen_ejecutivo', 'rendimiento_auditores'];
      if (!tiposPermitidos.includes(tipo_reporte)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de reporte no válido'
        });
      }

      if (formato === 'excel') {
        const workbook = await ReportesService.generarExcel(tipo_reporte, filtros);
        
        // Configurar headers para descarga de archivo
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${tipo_reporte}_${timestamp}.xlsx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        await workbook.xlsx.write(res);
        res.end();
      } else {
        res.status(400).json({
          success: false,
          message: 'Formato no soportado'
        });
      }
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * GET /api/reportes/periodos-disponibles
   * Obtener lista de períodos disponibles para filtros
   */
  static async obtenerPeriodosDisponibles(req, res) {
    try {
      const { Auditoria } = require('../../../shared/database/models');
      
      const periodos = await Auditoria.findAll({
        attributes: ['periodo_auditoria'],
        group: ['periodo_auditoria'],
        order: [['periodo_auditoria', 'DESC']]
      });

      const periodosUnicos = periodos.map(p => p.periodo_auditoria);
      
      res.json({
        success: true,
        data: periodosUnicos,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al obtener períodos disponibles:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * GET /api/reportes/proveedores-disponibles
   * Obtener lista de proveedores para filtros
   */
  static async obtenerProveedoresDisponibles(req, res) {
    try {
      const { Proveedor } = require('../../../shared/database/models');
      
      const proveedores = await Proveedor.findAll({
        attributes: ['id', 'nombre', 'cuit'],
        where: { activo: true },
        order: [['nombre', 'ASC']]
      });
      
      res.json({
        success: true,
        data: proveedores,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al obtener proveedores disponibles:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }
}

module.exports = ReportesController;