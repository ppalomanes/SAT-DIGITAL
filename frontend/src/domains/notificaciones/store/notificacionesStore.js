// frontend/src/domains/notificaciones/store/notificacionesStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:3001/api';

export const useNotificacionesStore = create(
  persist(
    (set, get) => ({
      // Estado
      notificaciones: [],
      configuracion: {
        email_nuevos_mensajes: true,
        email_recordatorios: true,
        email_cambios_estado: true,
        email_resumen_diario: false,
        frecuencia_resumen: 'diario',
        horario_resumen: '08:00',
        notificaciones_push: true,
        notificaciones_criticas_inmediatas: true
      },
      dashboardData: null,
      loading: false,
      error: null,
      noLeidas: 0,

      // Acciones
      obtenerNotificaciones: async (params = {}) => {
        try {
          set({ loading: true, error: null });

          const token = localStorage.getItem('token');
          const queryParams = new URLSearchParams({
            limit: params.limit || 20,
            offset: params.offset || 0,
            solo_no_leidas: params.solo_no_leidas || false
          });

          const response = await axios.get(
            `${API_URL}/notificaciones/mis-notificaciones?${queryParams}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (response.data.success) {
            set({
              notificaciones: response.data.data.notificaciones,
              noLeidas: response.data.data.no_leidas,
              loading: false
            });
          }
        } catch (error) {
          console.error('Error obteniendo notificaciones:', error);
          set({
            error: error.response?.data?.error || 'Error obteniendo notificaciones',
            loading: false
          });
        }
      },

      obtenerConfiguracion: async () => {
        try {
          set({ loading: true, error: null });

          const token = localStorage.getItem('token');
          const response = await axios.get(
            `${API_URL}/notificaciones/configuracion`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (response.data.success) {
            set({
              configuracion: response.data.configuracion,
              loading: false
            });
          }
        } catch (error) {
          console.error('Error obteniendo configuración:', error);
          set({
            error: error.response?.data?.error || 'Error obteniendo configuración',
            loading: false
          });
        }
      },

      actualizarConfiguracion: async (nuevaConfiguracion) => {
        try {
          set({ loading: true, error: null });

          const token = localStorage.getItem('token');
          const response = await axios.put(
            `${API_URL}/notificaciones/configuracion`,
            nuevaConfiguracion,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (response.data.success) {
            set({
              configuracion: response.data.configuracion,
              loading: false
            });
            return { success: true };
          }
        } catch (error) {
          console.error('Error actualizando configuración:', error);
          set({
            error: error.response?.data?.error || 'Error actualizando configuración',
            loading: false
          });
          return { success: false, error: error.response?.data?.error };
        }
      },

      marcarComoLeidas: async (notificacionIds) => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.post(
            `${API_URL}/notificaciones/marcar-leidas`,
            { notificacion_ids: notificacionIds },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (response.data.success) {
            // Actualizar estado local
            const { notificaciones } = get();
            const notificacionesActualizadas = notificaciones.map(notif => 
              notificacionIds.includes(notif.id) 
                ? { ...notif, leida: true }
                : notif
            );

            set({
              notificaciones: notificacionesActualizadas,
              noLeidas: Math.max(0, get().noLeidas - notificacionIds.length)
            });

            return { success: true };
          }
        } catch (error) {
          console.error('Error marcando como leídas:', error);
          return { 
            success: false, 
            error: error.response?.data?.error || 'Error marcando notificaciones' 
          };
        }
      },

      enviarNotificacion: async (tipo, destinatarios, data) => {
        try {
          set({ loading: true, error: null });

          const token = localStorage.getItem('token');
          const response = await axios.post(
            `${API_URL}/notificaciones/enviar`,
            {
              tipo,
              destinatarios,
              data
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (response.data.success) {
            set({ loading: false });
            return { success: true, data: response.data };
          }
        } catch (error) {
          console.error('Error enviando notificación:', error);
          set({
            error: error.response?.data?.error || 'Error enviando notificación',
            loading: false
          });
          return { success: false, error: error.response?.data?.error };
        }
      },

      obtenerDashboardAdmin: async (periodo = '30d') => {
        try {
          set({ loading: true, error: null });

          const token = localStorage.getItem('token');
          const response = await axios.get(
            `${API_URL}/notificaciones/dashboard?periodo=${periodo}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (response.data.success) {
            set({
              dashboardData: response.data.data,
              loading: false
            });
          }
        } catch (error) {
          console.error('Error obteniendo dashboard:', error);
          set({
            error: error.response?.data?.error || 'Error obteniendo dashboard',
            loading: false
          });
        }
      },

      enviarEmailPrueba: async (tipo, email) => {
        try {
          set({ loading: true, error: null });

          const token = localStorage.getItem('token');
          const response = await axios.post(
            `${API_URL}/notificaciones/test-email`,
            { tipo, email },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          set({ loading: false });
          return response.data;
        } catch (error) {
          console.error('Error enviando email de prueba:', error);
          set({
            error: error.response?.data?.error || 'Error enviando email de prueba',
            loading: false
          });
          return { success: false, error: error.response?.data?.error };
        }
      },

      // Utilidades
      limpiarError: () => set({ error: null }),
      
      resetearStore: () => set({
        notificaciones: [],
        dashboardData: null,
        loading: false,
        error: null,
        noLeidas: 0
      })
    }),
    {
      name: 'notificaciones-storage',
      partialize: (state) => ({
        configuracion: state.configuracion,
        noLeidas: state.noLeidas
      })
    }
  )
);
