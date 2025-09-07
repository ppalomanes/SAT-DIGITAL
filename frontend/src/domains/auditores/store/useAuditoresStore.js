/**
 * SAT-Digital Frontend - Store de Auditores
 * Checkpoint 2.5: Panel de Control para Auditores
 * 
 * Store de Zustand para gestionar el estado del panel de auditores
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// Configurar axios con interceptor para auth
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sat_digital_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const useAuditoresStore = create()(
  devtools(
    persist(
      (set, get) => ({
        // Estado inicial
        loading: false,
        error: null,
        
        // Dashboard data
        dashboardData: {
          estadisticas: {
            total_asignadas: 0,
            pendientes: 0,
            en_carga: 0,
            pendiente_evaluacion: 0,
            consultas_pendientes: 0,
            mes_actual: 0
          },
          proximas_visitas: [],
          alertas: [],
          auditor: null
        },

        // Auditorías del auditor
        misAuditorias: {
          auditorias: [],
          pagination: {
            current_page: 1,
            total_pages: 1,
            total_items: 0,
            items_per_page: 20
          },
          filtros_aplicados: {}
        },

        // Consultas pendientes
        consultasPendientes: {
          consultas: [],
          pagination: {
            current_page: 1,
            total_pages: 1,
            total_items: 0,
            items_per_page: 10
          }
        },

        // Filtros activos
        filtrosActivos: {
          periodo: '',
          estado: '',
          proveedor_id: null,
          fecha_desde: null,
          fecha_hasta: null,
          sitio_id: null
        },

        // Acciones
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        /**
         * Obtener dashboard del auditor
         */
        obtenerDashboard: async () => {
          try {
            set({ loading: true, error: null });
            
            const response = await api.get('/auditorias/dashboard');
            
            if (response.data.success) {
              set({
                dashboardData: response.data.data,
                loading: false
              });
            } else {
              throw new Error(response.data.message || 'Error obteniendo dashboard');
            }
          } catch (error) {
            console.error('Error obteniendo dashboard:', error);
            set({
              error: error.response?.data?.message || error.message || 'Error de conexión',
              loading: false
            });
          }
        },

        /**
         * Obtener auditorías asignadas al auditor
         */
        obtenerMisAuditorias: async (filtros = {}, page = 1, limit = 20) => {
          try {
            set({ loading: true, error: null });
            
            const params = {
              page,
              limit,
              ...filtros
            };

            const response = await api.get('/auditorias/mis-auditorias', { params });
            
            if (response.data.success) {
              set({
                misAuditorias: response.data.data,
                filtrosActivos: filtros,
                loading: false
              });
            } else {
              throw new Error(response.data.message || 'Error obteniendo auditorías');
            }
          } catch (error) {
            console.error('Error obteniendo mis auditorías:', error);
            set({
              error: error.response?.data?.message || error.message || 'Error de conexión',
              loading: false
            });
          }
        },

        /**
         * Obtener consultas pendientes
         */
        obtenerConsultasPendientes: async (page = 1, limit = 10) => {
          try {
            set({ loading: true, error: null });
            
            const params = { page, limit };
            const response = await api.get('/auditorias/consultas-pendientes', { params });
            
            if (response.data.success) {
              set({
                consultasPendientes: response.data.data,
                loading: false
              });
            } else {
              throw new Error(response.data.message || 'Error obteniendo consultas');
            }
          } catch (error) {
            console.error('Error obteniendo consultas pendientes:', error);
            set({
              error: error.response?.data?.message || error.message || 'Error de conexión',
              loading: false
            });
          }
        },

        /**
         * Obtener detalle de auditoría para revisión
         */
        obtenerRevisionAuditoria: async (auditoriaId) => {
          try {
            set({ loading: true, error: null });
            
            const response = await api.get(`/auditorias/${auditoriaId}/revision`);
            
            if (response.data.success) {
              set({ loading: false });
              return response.data.data;
            } else {
              throw new Error(response.data.message || 'Error obteniendo revisión');
            }
          } catch (error) {
            console.error('Error obteniendo revisión de auditoría:', error);
            set({
              error: error.response?.data?.message || error.message || 'Error de conexión',
              loading: false
            });
            return null;
          }
        },

        /**
         * Actualizar estado de auditoría
         */
        actualizarEstadoAuditoria: async (auditoriaId, nuevoEstado, observaciones = '') => {
          try {
            set({ loading: true, error: null });
            
            const response = await api.put(`/auditorias/${auditoriaId}/estado`, {
              nuevo_estado: nuevoEstado,
              observaciones
            });
            
            if (response.data.success) {
              // Actualizar dashboard y auditorías
              await get().obtenerDashboard();
              await get().obtenerMisAuditorias(get().filtrosActivos);
              
              set({ loading: false });
              return response.data.data;
            } else {
              throw new Error(response.data.message || 'Error actualizando estado');
            }
          } catch (error) {
            console.error('Error actualizando estado:', error);
            set({
              error: error.response?.data?.message || error.message || 'Error de conexión',
              loading: false
            });
            return null;
          }
        },

        /**
         * Exportar reporte
         */
        exportarReporte: async (configuracion) => {
          try {
            set({ loading: true, error: null });
            
            const response = await api.post('/auditorias/exportar-reporte', configuracion);
            
            if (response.data.success) {
              set({ loading: false });
              return response.data.data;
            } else {
              throw new Error(response.data.message || 'Error exportando reporte');
            }
          } catch (error) {
            console.error('Error exportando reporte:', error);
            set({
              error: error.response?.data?.message || error.message || 'Error de conexión',
              loading: false
            });
            return null;
          }
        },

        /**
         * Aplicar filtros a las auditorías
         */
        aplicarFiltros: async (filtros) => {
          await get().obtenerMisAuditorias(filtros, 1, 20);
        },

        /**
         * Limpiar filtros
         */
        limpiarFiltros: async () => {
          await get().obtenerMisAuditorias({}, 1, 20);
        },

        /**
         * Cambiar página
         */
        cambiarPagina: async (page) => {
          const { filtrosActivos, misAuditorias } = get();
          await get().obtenerMisAuditorias(
            filtrosActivos, 
            page, 
            misAuditorias.pagination.items_per_page
          );
        },

        /**
         * Refrescar datos
         */
        refrescarDatos: async () => {
          const promises = [
            get().obtenerDashboard(),
            get().obtenerMisAuditorias(get().filtrosActivos),
            get().obtenerConsultasPendientes()
          ];

          await Promise.all(promises);
        }
      }),
      {
        name: 'sat-digital-auditores-store',
        partialize: (state) => ({
          filtrosActivos: state.filtrosActivos,
        }),
      }
    ),
    {
      name: 'auditores-store',
    }
  )
);

export default useAuditoresStore;
