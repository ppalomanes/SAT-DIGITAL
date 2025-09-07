// Store para Reportes y Analytics
// Checkpoint 2.10 - Gestión de estado para sistema de reportes

import { create } from 'zustand';
import { apiClient } from '../../../shared/utils/authService';

const useReportesStore = create((set, get) => ({
  // Estado
  resumenEjecutivo: null,
  detalleAuditoria: null,
  rendimientoAuditores: null,
  metricasTiempoReal: null,
  periodosDisponibles: [],
  proveedoresDisponibles: [],
  
  // Estados de carga
  loadingResumen: false,
  loadingDetalle: false,
  loadingRendimiento: false,
  loadingMetricas: false,
  loadingPeriodos: false,
  loadingProveedores: false,
  loadingExportacion: false,

  // Errores
  errorResumen: null,
  errorDetalle: null,
  errorRendimiento: null,
  errorMetricas: null,
  errorPeriodos: null,
  errorProveedores: null,
  errorExportacion: null,

  // Filtros activos
  filtrosActivos: {
    periodo: null,
    proveedor_id: null,
    fecha_desde: null,
    fecha_hasta: null
  },

  // Acciones

  /**
   * Obtener resumen ejecutivo de auditorías
   */
  obtenerResumenEjecutivo: async (filtros = {}) => {
    set({ loadingResumen: true, errorResumen: null });
    
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(`/auditorias/reportes/resumen-ejecutivo?${params}`);
      
      set({ 
        resumenEjecutivo: response.data.data,
        filtrosActivos: { ...get().filtrosActivos, ...filtros },
        loadingResumen: false 
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener resumen ejecutivo:', error);
      set({ 
        errorResumen: error.response?.data?.message || 'Error al cargar resumen ejecutivo',
        loadingResumen: false 
      });
      throw error;
    }
  },

  /**
   * Obtener detalle completo de auditoría
   */
  obtenerDetalleAuditoria: async (auditoriaId) => {
    set({ loadingDetalle: true, errorDetalle: null });
    
    try {
      const response = await apiClient.get(`/auditorias/reportes/auditoria/${auditoriaId}/detalle`);
      
      set({ 
        detalleAuditoria: response.data.data,
        loadingDetalle: false 
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener detalle de auditoría:', error);
      set({ 
        errorDetalle: error.response?.data?.message || 'Error al cargar detalle de auditoría',
        loadingDetalle: false 
      });
      throw error;
    }
  },

  /**
   * Obtener rendimiento de auditores
   */
  obtenerRendimientoAuditores: async (filtros = {}) => {
    set({ loadingRendimiento: true, errorRendimiento: null });
    
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(`/auditorias/reportes/auditores/rendimiento?${params}`);
      
      set({ 
        rendimientoAuditores: response.data.data,
        loadingRendimiento: false 
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener rendimiento de auditores:', error);
      set({ 
        errorRendimiento: error.response?.data?.message || 'Error al cargar rendimiento de auditores',
        loadingRendimiento: false 
      });
      throw error;
    }
  },

  /**
   * Obtener métricas en tiempo real
   */
  obtenerMetricasTiempoReal: async () => {
    set({ loadingMetricas: true, errorMetricas: null });
    
    try {
      const response = await apiClient.get('/auditorias/reportes/metricas-tiempo-real');
      
      set({ 
        metricasTiempoReal: response.data.data,
        loadingMetricas: false 
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener métricas en tiempo real:', error);
      set({ 
        errorMetricas: error.response?.data?.message || 'Error al cargar métricas',
        loadingMetricas: false 
      });
      throw error;
    }
  },

  /**
   * Obtener períodos disponibles
   */
  obtenerPeriodosDisponibles: async () => {
    set({ loadingPeriodos: true, errorPeriodos: null });
    
    try {
      const response = await apiClient.get('/auditorias/reportes/periodos-disponibles');
      
      set({ 
        periodosDisponibles: response.data.data,
        loadingPeriodos: false 
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener períodos disponibles:', error);
      set({ 
        errorPeriodos: error.response?.data?.message || 'Error al cargar períodos',
        loadingPeriodos: false 
      });
      throw error;
    }
  },

  /**
   * Obtener proveedores disponibles
   */
  obtenerProveedoresDisponibles: async () => {
    set({ loadingProveedores: true, errorProveedores: null });
    
    try {
      const response = await apiClient.get('/auditorias/reportes/proveedores-disponibles');
      
      set({ 
        proveedoresDisponibles: response.data.data,
        loadingProveedores: false 
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener proveedores disponibles:', error);
      set({ 
        errorProveedores: error.response?.data?.message || 'Error al cargar proveedores',
        loadingProveedores: false 
      });
      throw error;
    }
  },

  /**
   * Exportar reporte
   */
  exportarReporte: async (tipoReporte, filtros = {}, formato = 'excel') => {
    set({ loadingExportacion: true, errorExportacion: null });
    
    try {
      const response = await apiClient.post('/auditorias/reportes/exportar', {
        tipo_reporte: tipoReporte,
        filtros,
        formato
      }, {
        responseType: 'blob'
      });

      // Crear URL para descarga
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generar nombre de archivo
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `${tipoReporte}_${timestamp}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      set({ loadingExportacion: false });
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      set({ 
        errorExportacion: error.response?.data?.message || 'Error al exportar reporte',
        loadingExportacion: false 
      });
      throw error;
    }
  },

  /**
   * Limpiar errores
   */
  limpiarErrores: () => {
    set({
      errorResumen: null,
      errorDetalle: null,
      errorRendimiento: null,
      errorMetricas: null,
      errorPeriodos: null,
      errorProveedores: null,
      errorExportacion: null
    });
  },

  /**
   * Actualizar filtros activos
   */
  actualizarFiltros: (nuevosFiltros) => {
    set({
      filtrosActivos: { ...get().filtrosActivos, ...nuevosFiltros }
    });
  },

  /**
   * Limpiar filtros
   */
  limpiarFiltros: () => {
    set({
      filtrosActivos: {
        periodo: null,
        proveedor_id: null,
        fecha_desde: null,
        fecha_hasta: null
      }
    });
  },

  /**
   * Limpiar todos los datos
   */
  limpiarDatos: () => {
    set({
      resumenEjecutivo: null,
      detalleAuditoria: null,
      rendimientoAuditores: null,
      metricasTiempoReal: null,
      periodosDisponibles: [],
      proveedoresDisponibles: []
    });
  },

  /**
   * Refrescar métricas en tiempo real (para uso con intervalos)
   */
  refrescarMetricas: async () => {
    try {
      await get().obtenerMetricasTiempoReal();
    } catch (error) {
      console.error('Error al refrescar métricas:', error);
    }
  }
}));

export default useReportesStore;