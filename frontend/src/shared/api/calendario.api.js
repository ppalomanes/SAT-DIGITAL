import { apiClient } from '../utils/authService';

/**
 * API client para módulo de calendario
 * Gestiona períodos de auditoría y asignaciones
 */
export const calendarioAPI = {
  /**
   * Períodos de auditoría
   */
  obtenerPeriodos: async () => {
    const response = await apiClient.get('/calendario/periodos');
    return response.data;
  },

  obtenerPeriodoActivo: async () => {
    const response = await apiClient.get('/calendario/periodos/activo');
    return response.data;
  },

  obtenerPeriodoPorId: async (id) => {
    const response = await apiClient.get(`/calendario/periodos/${id}`);
    return response.data;
  },

  crearPeriodo: async (datosPeriodo) => {
    const response = await apiClient.post('/calendario/periodos', datosPeriodo);
    return response.data;
  },

  generarAuditorias: async (periodoId) => {
    const response = await apiClient.post(`/calendario/periodos/${periodoId}/generar-auditorias`);
    return response.data;
  },

  activarPeriodo: async (periodoId) => {
    const response = await apiClient.post(`/calendario/periodos/${periodoId}/activar`);
    return response.data;
  },

  /**
   * Asignaciones de auditores
   */
  obtenerAsignaciones: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.auditor_id) params.append('auditor_id', filtros.auditor_id);
    if (filtros.periodo) params.append('periodo', filtros.periodo);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);

    const response = await apiClient.get(`/calendario/asignaciones?${params}`);
    return response.data;
  },

  crearAsignacion: async (datosAsignacion) => {
    const response = await apiClient.post('/calendario/asignaciones', datosAsignacion);
    return response.data;
  },

  actualizarAsignacion: async (asignacionId, datosActualizados) => {
    const response = await apiClient.put(`/calendario/asignaciones/${asignacionId}`, datosActualizados);
    return response.data;
  },

  obtenerCalendarioAuditor: async (auditorId, fechaInicio, fechaFin) => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);

    const response = await apiClient.get(`/calendario/auditores/${auditorId}/calendario?${params}`);
    return response.data;
  }
};
