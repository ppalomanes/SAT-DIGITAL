/**
 * SAT-Digital - Mock Data para Dashboard
 * Datos de ejemplo para desarrollo y testing
 *
 * NOTA: Este archivo contiene datos estáticos de ejemplo.
 * En producción, estos datos deben venir de la API.
 */

import dayjs from 'dayjs';

/**
 * MÉTRICAS PRINCIPALES
 * Indicadores clave del dashboard
 */
export const MOCK_METRICAS_PRINCIPALES = {
  total_auditorias: {
    valor: 12,
    cambio: +12,
    tendencia: 'up',
    descripcion: 'Total de auditorías en el período'
  },

  proveedores_activos: {
    valor: 5,
    cambio: +2.5,
    tendencia: 'up',
    descripcion: 'Proveedores con auditorías activas'
  },

  completadas: {
    valor: 8,
    cambio: +18,
    tendencia: 'up',
    descripcion: 'Auditorías completadas exitosamente'
  },

  pendientes: {
    valor: 4,
    cambio: -5,
    tendencia: 'down',
    descripcion: 'Auditorías pendientes de completar'
  }
};

/**
 * AUDITORÍAS RECIENTES
 * Últimas auditorías del sistema
 */
export const MOCK_AUDITORIAS_RECIENTES = [
  {
    id: 1,
    proveedor: 'Grupo Activo SRL',
    sitio: 'ACTIVO - Florida 141',
    estado: 'Completada',
    progreso: 100,
    auditor: 'JP',
    auditor_nombre: 'Juan Pérez',
    fecha: '2025-01-14',
    puntaje: 95,
    observaciones: 0
  },
  {
    id: 2,
    proveedor: 'APEX America',
    sitio: 'APEX CBA',
    estado: 'En progreso',
    progreso: 75,
    auditor: 'MG',
    auditor_nombre: 'María González',
    fecha: '2025-01-17',
    puntaje: null,
    observaciones: 2
  },
  {
    id: 3,
    proveedor: 'Teleperformance',
    sitio: 'TELEPERFORMANCE RES',
    estado: 'Pendiente',
    progreso: 30,
    auditor: 'CL',
    auditor_nombre: 'Carlos López',
    fecha: '2025-01-19',
    puntaje: null,
    observaciones: 0
  },
  {
    id: 4,
    proveedor: 'CAT Technologies',
    sitio: 'CAT-TECHNOLOGIES',
    estado: 'Revisión',
    progreso: 90,
    auditor: 'AM',
    auditor_nombre: 'Ana Martín',
    fecha: '2025-01-21',
    puntaje: 88,
    observaciones: 1
  }
];

/**
 * ACCIONES RÁPIDAS
 * Shortcuts a funcionalidades comunes
 */
export const MOCK_ACCIONES_RAPIDAS = [
  {
    id: 'programar',
    titulo: 'Programar auditoría',
    descripcion: 'Crear nueva auditoría para el período',
    icono: 'Assignment',
    accion: '/auditorias/nueva',
    color: 'primary'
  },
  {
    id: 'proveedores',
    titulo: 'Gestionar proveedores',
    descripcion: 'Administrar proveedores y sitios',
    icono: 'Business',
    accion: '/proveedores',
    color: 'secondary'
  },
  {
    id: 'reportes',
    titulo: 'Ver reportes',
    descripcion: 'Generar informes y estadísticas',
    icono: 'TrendingUp',
    accion: '/reportes',
    color: 'success'
  },
  {
    id: 'configuracion',
    titulo: 'Configurar sistema',
    descripcion: 'Ajustar parámetros del sistema',
    icono: 'FilterList',
    accion: '/configuracion',
    color: 'info'
  }
];

/**
 * ALERTAS CRÍTICAS
 * Notificaciones importantes para el usuario
 */
export const MOCK_ALERTAS_CRITICAS = [
  {
    id: 1,
    tipo: 'warning',
    mensaje: 'APEX CBA - Documentos vencen en 2 días',
    fecha: dayjs().subtract(2, 'hours').format('HH:mm'),
    auditoria_id: 2,
    prioridad: 'alta'
  },
  {
    id: 2,
    tipo: 'error',
    mensaje: 'Konecta ROS - Sin respuesta del proveedor',
    fecha: dayjs().subtract(1, 'day').format('DD/MM'),
    auditoria_id: 5,
    prioridad: 'alta'
  },
  {
    id: 3,
    tipo: 'info',
    mensaje: 'Grupo Activo - Auditoría completada',
    fecha: dayjs().subtract(3, 'hours').format('HH:mm'),
    auditoria_id: 1,
    prioridad: 'baja'
  }
];

/**
 * ACTIVIDAD RECIENTE
 * Timeline de actividades del sistema
 */
export const MOCK_ACTIVIDAD_RECIENTE = [
  {
    id: 1,
    usuario: 'María González',
    accion: 'Completó evaluación de',
    objetivo: 'APEX CBA - Sección Internet',
    fecha: dayjs().subtract(30, 'minutes').toISOString(),
    tipo: 'evaluacion'
  },
  {
    id: 2,
    usuario: 'Juan Pérez',
    accion: 'Aprobó documentación de',
    objetivo: 'Grupo Activo - Hardware',
    fecha: dayjs().subtract(1, 'hour').toISOString(),
    tipo: 'aprobacion'
  },
  {
    id: 3,
    usuario: 'Sistema',
    accion: 'Envió recordatorio a',
    objetivo: 'Teleperformance',
    fecha: dayjs().subtract(2, 'hours').toISOString(),
    tipo: 'notificacion'
  },
  {
    id: 4,
    usuario: 'Carlos López',
    accion: 'Creó nueva auditoría para',
    objetivo: 'CAT Technologies - Mendoza',
    fecha: dayjs().subtract(3, 'hours').toISOString(),
    tipo: 'creacion'
  }
];

/**
 * ESTADÍSTICAS POR PROVEEDOR
 * Métricas detalladas por proveedor
 */
export const MOCK_ESTADISTICAS_PROVEEDORES = [
  {
    id: 1,
    nombre: 'Grupo Activo SRL',
    sitios_activos: 1,
    auditorias_completadas: 3,
    auditorias_pendientes: 0,
    promedio_cumplimiento: 94.5,
    tendencia: 'up',
    ultima_auditoria: '2025-01-14'
  },
  {
    id: 2,
    nombre: 'APEX America',
    sitios_activos: 3,
    auditorias_completadas: 2,
    auditorias_pendientes: 1,
    promedio_cumplimiento: 87.2,
    tendencia: 'stable',
    ultima_auditoria: '2025-01-17'
  },
  {
    id: 3,
    nombre: 'Teleperformance',
    sitios_activos: 3,
    auditorias_completadas: 1,
    auditorias_pendientes: 2,
    promedio_cumplimiento: 78.9,
    tendencia: 'down',
    ultima_auditoria: '2025-01-12'
  },
  {
    id: 4,
    nombre: 'CAT Technologies',
    sitios_activos: 1,
    auditorias_completadas: 2,
    auditorias_pendientes: 1,
    promedio_cumplimiento: 91.3,
    tendencia: 'up',
    ultima_auditoria: '2025-01-21'
  },
  {
    id: 5,
    nombre: 'Konecta',
    sitios_activos: 3,
    auditorias_completadas: 0,
    auditorias_pendientes: 3,
    promedio_cumplimiento: null,
    tendencia: 'stable',
    ultima_auditoria: null
  }
];

/**
 * DATOS AGREGADOS DEL DASHBOARD
 * Objeto principal que agrupa todos los mock data
 */
export const MOCK_DASHBOARD_DATA = {
  metricas_principales: MOCK_METRICAS_PRINCIPALES,
  auditorias_recientes: MOCK_AUDITORIAS_RECIENTES,
  acciones_rapidas: MOCK_ACCIONES_RAPIDAS,
  alertas_criticas: MOCK_ALERTAS_CRITICAS,
  actividad_reciente: MOCK_ACTIVIDAD_RECIENTE,
  estadisticas_proveedores: MOCK_ESTADISTICAS_PROVEEDORES,

  // Metadata
  ultima_actualizacion: new Date().toISOString(),
  periodo_actual: 'Enero 2025',
  version: '1.0.0'
};

/**
 * Exportación por defecto
 */
export default MOCK_DASHBOARD_DATA;
