// Servicio de Reportes y Analytics de Auditorías
// Checkpoint 2.10 - Sistema completo de reportes

const { Auditoria, Documento, Usuario, Proveedor, Sitio, SeccionTecnica, Conversacion, Mensaje, Bitacora } = require('../../../shared/database/models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

class ReportesService {

  /**
   * Obtener resumen ejecutivo de auditorías
   */
  static async obtenerResumenEjecutivo(filtros = {}) {
    const { periodo, proveedor_id, fecha_desde, fecha_hasta } = filtros;
    
    const whereClause = {};
    if (periodo) whereClause.periodo_auditoria = periodo;
    if (proveedor_id) whereClause.proveedor_id = proveedor_id;
    if (fecha_desde && fecha_hasta) {
      whereClause.created_at = {
        [Op.between]: [new Date(fecha_desde), new Date(fecha_hasta)]
      };
    }

    // Métricas generales
    const totalAuditorias = await Auditoria.count({ where: whereClause });
    
    const auditoriasPorEstado = await Auditoria.findAll({
      attributes: ['estado', [Auditoria.sequelize.fn('COUNT', '*'), 'cantidad']],
      where: whereClause,
      group: ['estado']
    });

    // Progreso por proveedor
    const progresoPorProveedor = await Auditoria.findAll({
      attributes: [
        'proveedor_id',
        'estado',
        [Auditoria.sequelize.fn('COUNT', '*'), 'cantidad']
      ],
      where: whereClause,
      include: [{
        model: Proveedor,
        as: 'proveedor',
        attributes: ['nombre']
      }],
      group: ['proveedor_id', 'estado']
    });

    // Documentos cargados
    const documentosPorSeccion = await Documento.findAll({
      attributes: [
        'seccion_id',
        [Documento.sequelize.fn('COUNT', '*'), 'cantidad'],
        [Documento.sequelize.fn('AVG', Documento.sequelize.fn('LENGTH', Documento.sequelize.col('ruta_archivo'))), 'tamaño_promedio']
      ],
      include: [{
        model: Auditoria,
        as: 'auditoria',
        where: whereClause,
        attributes: []
      }, {
        model: SeccionTecnica,
        as: 'seccion',
        attributes: ['nombre', 'codigo']
      }],
      group: ['seccion_id']
    });

    // Actividad de comunicación
    const actividadComunicacion = await Mensaje.findAll({
      attributes: [
        [Mensaje.sequelize.fn('DATE', Mensaje.sequelize.col('created_at')), 'fecha'],
        [Mensaje.sequelize.fn('COUNT', '*'), 'mensajes'],
        [Mensaje.sequelize.fn('COUNT', Mensaje.sequelize.fn('DISTINCT', Mensaje.sequelize.col('usuario_id'))), 'usuarios_activos']
      ],
      include: [{
        model: Conversacion,
        as: 'conversacion',
        include: [{
          model: Auditoria,
          as: 'auditoria',
          where: whereClause,
          attributes: []
        }],
        attributes: []
      }],
      group: [Mensaje.sequelize.fn('DATE', Mensaje.sequelize.col('created_at'))],
      order: [[Mensaje.sequelize.fn('DATE', Mensaje.sequelize.col('created_at')), 'DESC']],
      limit: 30
    });

    return {
      resumen: {
        total_auditorias: totalAuditorias,
        estados: auditoriasPorEstado.map(e => ({
          estado: e.estado,
          cantidad: parseInt(e.getDataValue('cantidad'))
        }))
      },
      progreso_proveedores: progresoPorProveedor.map(p => ({
        proveedor: p.proveedor.nombre,
        estado: p.estado,
        cantidad: parseInt(p.getDataValue('cantidad'))
      })),
      documentos_por_seccion: documentosPorSeccion.map(d => ({
        seccion: d.seccion.nombre,
        codigo: d.seccion.codigo,
        cantidad: parseInt(d.getDataValue('cantidad')),
        tamaño_promedio: parseFloat(d.getDataValue('tamaño_promedio')) || 0
      })),
      actividad_comunicacion: actividadComunicacion.map(a => ({
        fecha: a.getDataValue('fecha'),
        mensajes: parseInt(a.getDataValue('mensajes')),
        usuarios_activos: parseInt(a.getDataValue('usuarios_activos'))
      }))
    };
  }

  /**
   * Obtener detalle completo de auditoría
   */
  static async obtenerDetalleAuditoria(auditoriaId) {
    const auditoria = await Auditoria.findByPk(auditoriaId, {
      include: [
        {
          model: Proveedor,
          as: 'proveedor',
          attributes: ['nombre', 'cuit', 'direccion']
        },
        {
          model: Sitio,
          as: 'sitio',
          attributes: ['nombre', 'direccion', 'ciudad']
        },
        {
          model: Usuario,
          as: 'auditor',
          attributes: ['nombre', 'email']
        }
      ]
    });

    if (!auditoria) {
      throw new Error('Auditoría no encontrada');
    }

    // Documentos por sección
    const documentos = await Documento.findAll({
      where: { auditoria_id: auditoriaId },
      include: [{
        model: SeccionTecnica,
        as: 'seccion',
        attributes: ['nombre', 'codigo', 'obligatoria']
      }],
      order: [['seccion_id', 'ASC'], ['created_at', 'DESC']]
    });

    // Conversaciones y mensajes
    const conversaciones = await Conversacion.findAll({
      where: { auditoria_id: auditoriaId },
      include: [{
        model: Mensaje,
        as: 'mensajes',
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'rol']
        }],
        limit: 5,
        order: [['created_at', 'DESC']]
      }]
    });

    // Bitácora de cambios
    const bitacora = await Bitacora.findAll({
      where: {
        entidad_tipo: 'Auditoria',
        entidad_id: auditoriaId
      },
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['nombre', 'rol']
      }],
      order: [['timestamp', 'DESC']],
      limit: 20
    });

    // Métricas específicas
    const metricas = {
      progreso_carga: Math.round((documentos.length / 20) * 100), // Asumiendo 20 secciones
      total_documentos: documentos.length,
      total_conversaciones: conversaciones.length,
      total_mensajes: conversaciones.reduce((acc, conv) => acc + conv.mensajes.length, 0),
      dias_desde_inicio: Math.ceil((new Date() - auditoria.created_at) / (1000 * 60 * 60 * 24))
    };

    return {
      auditoria: {
        id: auditoria.id,
        periodo: auditoria.periodo_auditoria,
        estado: auditoria.estado,
        fecha_limite_carga: auditoria.fecha_limite_carga,
        fecha_visita: auditoria.fecha_visita,
        proveedor: auditoria.proveedor,
        sitio: auditoria.sitio,
        auditor: auditoria.auditor,
        created_at: auditoria.created_at,
        updated_at: auditoria.updated_at
      },
      documentos: documentos.map(d => ({
        id: d.id,
        nombre_archivo: d.nombre_archivo,
        seccion: d.seccion.nombre,
        codigo_seccion: d.seccion.codigo,
        tipo_archivo: d.tipo_archivo,
        tamaño: d.tamaño,
        created_at: d.created_at
      })),
      conversaciones: conversaciones.map(c => ({
        id: c.id,
        titulo: c.titulo,
        categoria: c.categoria,
        estado: c.estado,
        mensajes_recientes: c.mensajes.map(m => ({
          contenido: m.contenido.substring(0, 100) + (m.contenido.length > 100 ? '...' : ''),
          usuario: m.usuario.nombre,
          rol: m.usuario.rol,
          created_at: m.created_at
        }))
      })),
      bitacora: bitacora.map(b => ({
        accion: b.accion,
        descripcion: b.descripcion,
        usuario: b.usuario ? b.usuario.nombre : 'Sistema',
        timestamp: b.timestamp
      })),
      metricas
    };
  }

  /**
   * Generar reporte de rendimiento por auditor
   */
  static async obtenerRendimientoAuditores(filtros = {}) {
    const { periodo, fecha_desde, fecha_hasta } = filtros;
    
    const whereClause = {};
    if (periodo) whereClause.periodo_auditoria = periodo;
    if (fecha_desde && fecha_hasta) {
      whereClause.created_at = {
        [Op.between]: [new Date(fecha_desde), new Date(fecha_hasta)]
      };
    }

    const auditoresPorRendimiento = await Usuario.findAll({
      where: { rol: 'auditor' },
      attributes: [
        'id',
        'nombre',
        'email',
        [Usuario.sequelize.literal(`(
          SELECT COUNT(*) 
          FROM auditorias 
          WHERE auditor_id = Usuario.id 
          ${periodo ? `AND periodo_auditoria = '${periodo}'` : ''}
        )`), 'total_asignadas'],
        [Usuario.sequelize.literal(`(
          SELECT COUNT(*) 
          FROM auditorias 
          WHERE auditor_id = Usuario.id 
          AND estado IN ('evaluada', 'cerrada')
          ${periodo ? `AND periodo_auditoria = '${periodo}'` : ''}
        )`), 'completadas'],
        [Usuario.sequelize.literal(`(
          SELECT AVG(DATEDIFF(updated_at, created_at))
          FROM auditorias 
          WHERE auditor_id = Usuario.id 
          AND estado IN ('evaluada', 'cerrada')
          ${periodo ? `AND periodo_auditoria = '${periodo}'` : ''}
        )`), 'tiempo_promedio_dias']
      ]
    });

    // Calcular métricas por auditor
    const auditoresConMetricas = auditoresPorRendimiento.map(auditor => {
      const totalAsignadas = parseInt(auditor.getDataValue('total_asignadas')) || 0;
      const completadas = parseInt(auditor.getDataValue('completadas')) || 0;
      const tiempoPromedio = parseFloat(auditor.getDataValue('tiempo_promedio_dias')) || 0;

      return {
        id: auditor.id,
        nombre: auditor.nombre,
        email: auditor.email,
        metricas: {
          total_asignadas: totalAsignadas,
          completadas: completadas,
          pendientes: totalAsignadas - completadas,
          porcentaje_completadas: totalAsignadas > 0 ? Math.round((completadas / totalAsignadas) * 100) : 0,
          tiempo_promedio_dias: Math.round(tiempoPromedio),
          eficiencia: totalAsignadas > 0 && tiempoPromedio > 0 ? 
            Math.round((completadas / totalAsignadas) * (30 / Math.max(tiempoPromedio, 1)) * 100) : 0
        }
      };
    });

    // Ordenar por eficiencia
    auditoresConMetricas.sort((a, b) => b.metricas.eficiencia - a.metricas.eficiencia);

    return {
      auditores: auditoresConMetricas,
      resumen: {
        total_auditores: auditoresConMetricas.length,
        promedio_eficiencia: Math.round(
          auditoresConMetricas.reduce((acc, a) => acc + a.metricas.eficiencia, 0) / auditoresConMetricas.length
        ),
        mejor_auditor: auditoresConMetricas[0]?.nombre || 'N/A',
        total_auditorias_completadas: auditoresConMetricas.reduce((acc, a) => acc + a.metricas.completadas, 0)
      }
    };
  }

  /**
   * Generar reporte en formato Excel
   */
  static async generarExcel(tipoReporte, filtros = {}) {
    const workbook = new ExcelJS.Workbook();
    
    switch (tipoReporte) {
      case 'resumen_ejecutivo':
        const resumen = await this.obtenerResumenEjecutivo(filtros);
        const wsResumen = workbook.addWorksheet('Resumen Ejecutivo');
        
        // Headers
        wsResumen.columns = [
          { header: 'Métrica', key: 'metrica', width: 30 },
          { header: 'Valor', key: 'valor', width: 15 },
          { header: 'Detalle', key: 'detalle', width: 40 }
        ];

        // Data
        wsResumen.addRow({ metrica: 'Total Auditorías', valor: resumen.resumen.total_auditorias });
        resumen.resumen.estados.forEach(estado => {
          wsResumen.addRow({ 
            metrica: `Estado: ${estado.estado}`, 
            valor: estado.cantidad 
          });
        });
        
        // Progreso por proveedor
        const wsProveedores = workbook.addWorksheet('Por Proveedor');
        wsProveedores.columns = [
          { header: 'Proveedor', key: 'proveedor', width: 25 },
          { header: 'Estado', key: 'estado', width: 20 },
          { header: 'Cantidad', key: 'cantidad', width: 15 }
        ];
        
        resumen.progreso_proveedores.forEach(prog => {
          wsProveedores.addRow(prog);
        });
        
        break;

      case 'rendimiento_auditores':
        const rendimiento = await this.obtenerRendimientoAuditores(filtros);
        const wsAuditores = workbook.addWorksheet('Rendimiento Auditores');
        
        wsAuditores.columns = [
          { header: 'Auditor', key: 'nombre', width: 25 },
          { header: 'Email', key: 'email', width: 30 },
          { header: 'Asignadas', key: 'total_asignadas', width: 12 },
          { header: 'Completadas', key: 'completadas', width: 12 },
          { header: 'Pendientes', key: 'pendientes', width: 12 },
          { header: '% Completadas', key: 'porcentaje_completadas', width: 15 },
          { header: 'Tiempo Promedio (días)', key: 'tiempo_promedio_dias', width: 20 },
          { header: 'Eficiencia', key: 'eficiencia', width: 12 }
        ];

        rendimiento.auditores.forEach(auditor => {
          wsAuditores.addRow({
            nombre: auditor.nombre,
            email: auditor.email,
            ...auditor.metricas
          });
        });
        
        break;
    }

    return workbook;
  }

  /**
   * Obtener métricas en tiempo real para dashboard
   */
  static async obtenerMetricasTiempoReal() {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const inicioSemana = new Date(ahora.setDate(ahora.getDate() - ahora.getDay()));

    // Auditorías por estado este mes
    const auditoriasMes = await Auditoria.findAll({
      attributes: ['estado', [Auditoria.sequelize.fn('COUNT', '*'), 'cantidad']],
      where: {
        created_at: { [Op.gte]: inicioMes }
      },
      group: ['estado']
    });

    // Documentos subidos esta semana
    const documentosSemana = await Documento.count({
      where: {
        created_at: { [Op.gte]: inicioSemana }
      }
    });

    // Actividad de chat hoy
    const mensajesHoy = await Mensaje.count({
      where: {
        created_at: { [Op.gte]: new Date().setHours(0, 0, 0, 0) }
      }
    });

    // Alertas críticas
    const alertasCriticas = await Auditoria.count({
      where: {
        fecha_limite_carga: { [Op.lt]: new Date() },
        estado: { [Op.not]: 'cerrada' }
      }
    });

    return {
      auditorias_mes: auditoriasMes.map(a => ({
        estado: a.estado,
        cantidad: parseInt(a.getDataValue('cantidad'))
      })),
      documentos_semana: documentosSemana,
      mensajes_hoy: mensajesHoy,
      alertas_criticas: alertasCriticas,
      timestamp: new Date()
    };
  }
}

module.exports = ReportesService;