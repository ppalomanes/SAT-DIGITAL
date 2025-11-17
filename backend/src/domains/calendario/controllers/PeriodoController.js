/**
 * Controlador de Períodos de Auditoría
 * Maneja la programación y gestión de períodos de auditoría semestrales
 * 
 * @author SAT-Digital Team
 * @version 1.0.0
 * @since Checkpoint 2.5 - Gestión de Períodos
 */

const PeriodoAuditoria = require('../models/PeriodoAuditoria');
const { Auditoria } = require('../../../shared/database/models');
const { z } = require('zod');
const logger = require('../../../shared/utils/logger');

// Esquemas de validación
const crearPeriodoSchema = z.object({
  nombre: z.string().min(1).max(50),
  codigo: z.string().min(1).max(20),
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fecha_limite_carga: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fecha_inicio_visitas: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fecha_fin_visitas: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  estado: z.enum(['planificacion', 'activo', 'carga', 'visitas', 'cerrado']).optional(),
  configuracion_especial: z.object({}).optional(),
  pliego_requisitos_id: z.number().int().positive().nullable().optional()
});

class PeriodoController {
  
  /**
   * Crear nuevo período de auditoría
   */
  static async crear(req, res) {
    try {
      const validation = crearPeriodoSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: validation.error.errors
        });
      }
      
      const { nombre, codigo, fecha_inicio, fecha_limite_carga, fecha_inicio_visitas, fecha_fin_visitas, estado, configuracion_especial, pliego_requisitos_id } = validation.data;

      // Verificar que no exista ya un período con ese código
      const periodoExistente = await PeriodoAuditoria.findOne({
        where: { codigo }
      });

      if (periodoExistente) {
        return res.status(409).json({
          success: false,
          error: `Ya existe un período con código ${codigo}`
        });
      }

      // Si se marca como activo, desactivar otros períodos activos
      if (estado === 'activo') {
        await PeriodoAuditoria.update(
          { estado: 'cerrado' },
          { where: { estado: 'activo' } }
        );
      }

      const nuevoPeriodo = await PeriodoAuditoria.create({
        nombre,
        codigo,
        fecha_inicio,
        fecha_limite_carga,
        fecha_inicio_visitas,
        fecha_fin_visitas,
        estado: estado || 'planificacion',
        configuracion_especial,
        pliego_requisitos_id: pliego_requisitos_id || null,
        created_by: req.user?.id || 1
      });
      
      logger.info(`Período creado: ${nombre} (${codigo})`, {
        usuario_id: req.user?.id,
        periodo_id: nuevoPeriodo.id
      });
      
      res.status(201).json({
        success: true,
        message: 'Período de auditoría creado exitosamente',
        data: nuevoPeriodo
      });
      
    } catch (error) {
      logger.error('Error creando período:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }

  /**
   * Listar todos los períodos
   */
  static async listar(req, res) {
    try {
      const { estado } = req.query;
      
      const filtros = {};
      if (estado) filtros.estado = estado;
      
      const periodos = await PeriodoAuditoria.findAll({
        where: filtros,
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        success: true,
        data: periodos,
        count: periodos.length
      });
      
    } catch (error) {
      logger.error('Error listando períodos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }

  /**
   * Obtener período activo
   */
  static async obtenerActivo(req, res) {
    try {
      const periodoActivo = await PeriodoAuditoria.findOne({
        where: { estado: 'activo' },
        order: [['fecha_inicio', 'DESC']]
      });
      
      if (!periodoActivo) {
        return res.status(404).json({
          success: false,
          error: 'No hay período de auditoría activo'
        });
      }
      
      res.json({
        success: true,
        data: periodoActivo
      });
      
    } catch (error) {
      logger.error('Error obteniendo período activo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }

  /**
   * Obtener período por ID
   */
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      
      const periodo = await PeriodoAuditoria.findByPk(id);
      if (!periodo) {
        return res.status(404).json({
          success: false,
          error: 'Período no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: periodo
      });
      
    } catch (error) {
      logger.error('Error obteniendo período:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }

  /**
   * Generar auditorías para todos los sitios en un período
   */
  static async generarAuditorias(req, res) {
    try {
      const { id } = req.params;
      
      const periodo = await PeriodoAuditoria.findByPk(id);
      if (!periodo) {
        return res.status(404).json({
          success: false,
          error: 'Período no encontrado'
        });
      }
      
      // Obtener todos los sitios activos
      const { Sitio } = require('../../../shared/database/models');
      const sitios = await Sitio.findAll({
        where: { estado: 'activo' }
      });
      
      const auditoriasCreadas = [];
      const periodoCodigo = `${periodo.ano}-${periodo.periodo === 1 ? '05' : '11'}`;
      
      for (const sitio of sitios) {
        // Verificar si ya existe auditoría para este sitio en este período
        const auditoriaExistente = await Auditoria.findOne({
          where: { 
            sitio_id: sitio.id, 
            periodo: periodoCodigo 
          }
        });
        
        if (!auditoriaExistente) {
          const nuevaAuditoria = await Auditoria.create({
            sitio_id: sitio.id,
            periodo: periodoCodigo,
            fecha_inicio: periodo.fecha_inicio,
            fecha_limite_carga: periodo.fecha_limite_carga,
            fecha_visita_programada: periodo.fecha_inicio_visitas,
            estado: 'programada'
          });
          
          auditoriasCreadas.push({
            auditoria_id: nuevaAuditoria.id,
            sitio_nombre: sitio.nombre
          });
        }
      }
      
      logger.info(`Auditorías generadas para período ${periodoCodigo}:`, {
        usuario_id: req.user?.id,
        periodo_id: periodo.id,
        auditorias_creadas: auditoriasCreadas.length
      });
      
      res.json({
        success: true,
        message: `${auditoriasCreadas.length} auditorías generadas exitosamente`,
        data: {
          periodo_codigo: periodoCodigo,
          auditorias_creadas: auditoriasCreadas.length,
          sitios_total: sitios.length,
          auditorias: auditoriasCreadas
        }
      });
      
    } catch (error) {
      logger.error('Error generando auditorías:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }

  /**
   * Activar período de auditoría
   */
  static async activar(req, res) {
    try {
      const { id } = req.params;
      
      const periodo = await PeriodoAuditoria.findByPk(id);
      if (!periodo) {
        return res.status(404).json({
          success: false,
          error: 'Período no encontrado'
        });
      }
      
      // Desactivar todos los períodos activos
      await PeriodoAuditoria.update(
        { estado: 'planificacion' },
        { where: { estado: 'activo' } }
      );
      
      // Activar el período seleccionado
      await periodo.update({ estado: 'activo' });
      
      logger.info(`Período activado: ${periodo.nombre} (${periodo.codigo})`, {
        usuario_id: req.user?.id,
        periodo_id: periodo.id
      });
      
      res.json({
        success: true,
        message: 'Período activado exitosamente',
        data: periodo
      });
      
    } catch (error) {
      logger.error('Error activando período:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }

  /**
   * Generar períodos anuales automáticamente
   */
  static async generarAnuales(req, res) {
    try {
      const { ano } = req.params;
      const anoNum = parseInt(ano);
      
      if (anoNum < 2024 || anoNum > 2030) {
        return res.status(400).json({
          success: false,
          error: 'Año debe estar entre 2024 y 2030'
        });
      }
      
      const periodosCreados = [];
      
      // Período Mayo (1)
      const [periodoMayo, creadoMayo] = await PeriodoAuditoria.findOrCreate({
        where: { ano: anoNum, periodo: 1 },
        defaults: {
          fecha_inicio: `${anoNum}-05-01`,
          fecha_fin: `${anoNum}-05-31`,
          descripcion: `Auditorías Mayo ${anoNum}`,
          activo: false
        }
      });
      
      if (creadoMayo) periodosCreados.push(periodoMayo);
      
      // Período Noviembre (2)
      const [periodoNoviembre, creadoNoviembre] = await PeriodoAuditoria.findOrCreate({
        where: { ano: anoNum, periodo: 2 },
        defaults: {
          fecha_inicio: `${anoNum}-11-01`,
          fecha_fin: `${anoNum}-11-30`,
          descripcion: `Auditorías Noviembre ${anoNum}`,
          activo: false
        }
      });
      
      if (creadoNoviembre) periodosCreados.push(periodoNoviembre);
      
      logger.info(`Períodos generados para ${ano}:`, {
        usuario_id: req.user?.id,
        periodos_creados: periodosCreados.length
      });
      
      res.json({
        success: true,
        message: `${periodosCreados.length} períodos generados para ${ano}`,
        data: {
          ano: anoNum,
          creados: periodosCreados.length,
          periodos: periodosCreados
        }
      });
      
    } catch (error) {
      logger.error('Error generando períodos anuales:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }
}

module.exports = PeriodoController;
