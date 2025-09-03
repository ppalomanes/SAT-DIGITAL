const dayjs = require('dayjs');
const { PeriodoAuditoria, AsignacionAuditor, Usuario, Auditoria, Sitio } = require('../models');

/**
 * Seeder para datos de prueba del módulo calendario
 */
const seedCalendario = async () => {
  try {
    console.log('📅 Creando datos de prueba para calendario...');

    // Crear período de ejemplo para pruebas
    const periodoEjemplo = await PeriodoAuditoria.create({
      nombre: 'Período de Prueba - Diciembre 2025',
      codigo: '2025-12',
      fecha_inicio: '2025-12-01',
      fecha_limite_carga: '2025-12-15',
      fecha_inicio_visitas: '2025-12-16',
      fecha_fin_visitas: '2025-12-30',
      estado: 'activo',
      configuracion_especial: {
        dias_no_laborables: ['2025-12-25', '2025-12-31'],
        observaciones: 'Período de prueba para desarrollo'
      },
      created_by: 1 // Asumiendo que existe usuario con ID 1
    });

    console.log('✅ Período de ejemplo creado:', periodoEjemplo.nombre);

    // Obtener auditores disponibles
    const auditores = await Usuario.findAll({
      where: { rol: 'auditor' },
      limit: 2
    });

    if (auditores.length === 0) {
      console.log('⚠️  No hay auditores disponibles para asignaciones de ejemplo');
      return;
    }

    // Obtener algunas auditorías para crear asignaciones de ejemplo
    const auditorias = await Auditoria.findAll({
      limit: 4,
      include: ['sitio']
    });

    if (auditorias.length === 0) {
      console.log('⚠️  No hay auditorías disponibles para crear asignaciones');
      return;
    }

    // Crear asignaciones de ejemplo
    const fechasVisita = [
      '2025-12-18',
      '2025-12-19',
      '2025-12-20',
      '2025-12-23'
    ];

    for (let i = 0; i < Math.min(auditorias.length, 4); i++) {
      const auditoria = auditorias[i];
      const auditor = auditores[i % auditores.length]; // Rotar auditores
      
      await AsignacionAuditor.create({
        auditoria_id: auditoria.id,
        auditor_id: auditor.id,
        fecha_visita_programada: fechasVisita[i],
        prioridad: ['normal', 'alta', 'normal', 'baja'][i],
        estado_asignacion: ['asignado', 'confirmado', 'asignado', 'reagendado'][i],
        observaciones: `Asignación de ejemplo para ${auditoria.sitio.nombre}`
      });

      console.log(`✅ Asignación creada: ${auditor.nombre} -> ${auditoria.sitio.nombre}`);
    }

    console.log('🎉 Datos de calendario creados exitosamente');

  } catch (error) {
    console.error('❌ Error creando datos de calendario:', error);
    throw error;
  }
};

module.exports = { seedCalendario };
