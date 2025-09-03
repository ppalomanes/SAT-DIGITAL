import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import dayjs from 'dayjs';
import { calendarioAPI } from '../../../shared/api/calendario.api';

/**
 * Store para gestión del calendario de auditorías
 * Maneja períodos, asignaciones y calendario visual
 */
export const useCalendarioStore = create(
  devtools(
    (set, get) => ({
      // Estados
      periodos: [],
      periodoActivo: null,
      asignaciones: [],
      loading: false,
      error: null,
      
      // Vista del calendario
      vistaCalendario: 'month', // 'month', 'week', 'day'
      fechaSeleccionada: dayjs(),
      
      // Modales
      modalPeriodo: false,
      modalAsignacion: false,
      asignacionSeleccionada: null,

      /**
       * Acciones para períodos
       */
      obtenerPeriodos: async () => {
        set({ loading: true, error: null });
        try {
          const response = await calendarioAPI.obtenerPeriodos();
          set({ 
            periodos: response.data,
            loading: false 
          });
        } catch (error) {
          set({ 
            error: error.message || 'Error obteniendo períodos',
            loading: false 
          });
        }
      },

      obtenerPeriodoActivo: async () => {
        set({ loading: true, error: null });
        try {
          const response = await calendarioAPI.obtenerPeriodoActivo();
          set({ 
            periodoActivo: response.data,
            loading: false 
          });
        } catch (error) {
          set({ 
            error: error.message || 'Error obteniendo período activo',
            loading: false 
          });
        }
      },

      crearPeriodo: async (datosPeriodo) => {
        set({ loading: true, error: null });
        try {
          const response = await calendarioAPI.crearPeriodo(datosPeriodo);
          const nuevosPeriodos = [...get().periodos, response.data];
          
          set({ 
            periodos: nuevosPeriodos,
            loading: false,
            modalPeriodo: false
          });
          
          return response.data;
        } catch (error) {
          set({ 
            error: error.message || 'Error creando período',
            loading: false 
          });
          throw error;
        }
      },

      generarAuditorias: async (periodoId) => {
        set({ loading: true, error: null });
        try {
          const response = await calendarioAPI.generarAuditorias(periodoId);
          
          // Actualizar período activo
          await get().obtenerPeriodoActivo();
          
          set({ loading: false });
          return response.data;
        } catch (error) {
          set({ 
            error: error.message || 'Error generando auditorías',
            loading: false 
          });
          throw error;
        }
      },

      /**
       * Acciones para asignaciones
       */
      obtenerAsignaciones: async (filtros = {}) => {
        set({ loading: true, error: null });
        try {
          const response = await calendarioAPI.obtenerAsignaciones(filtros);
          set({ 
            asignaciones: response.data,
            loading: false 
          });
        } catch (error) {
          set({ 
            error: error.message || 'Error obteniendo asignaciones',
            loading: false 
          });
        }
      },

      crearAsignacion: async (datosAsignacion) => {
        set({ loading: true, error: null });
        try {
          const response = await calendarioAPI.crearAsignacion(datosAsignacion);
          const nuevasAsignaciones = [...get().asignaciones, response.data];
          
          set({ 
            asignaciones: nuevasAsignaciones,
            loading: false,
            modalAsignacion: false
          });
          
          return response.data;
        } catch (error) {
          set({ 
            error: error.message || 'Error creando asignación',
            loading: false 
          });
          throw error;
        }
      },

      actualizarAsignacion: async (asignacionId, datosActualizados) => {
        set({ loading: true, error: null });
        try {
          const response = await calendarioAPI.actualizarAsignacion(
            asignacionId, 
            datosActualizados
          );
          
          const asignaciones = get().asignaciones.map(asignacion =>
            asignacion.id === asignacionId ? response.data : asignacion
          );
          
          set({ 
            asignaciones,
            loading: false 
          });
          
          return response.data;
        } catch (error) {
          set({ 
            error: error.message || 'Error actualizando asignación',
            loading: false 
          });
          throw error;
        }
      },

      obtenerCalendarioAuditor: async (auditorId, fechaInicio, fechaFin) => {
        set({ loading: true, error: null });
        try {
          const response = await calendarioAPI.obtenerCalendarioAuditor(
            auditorId, 
            fechaInicio, 
            fechaFin
          );
          
          set({ loading: false });
          return response.data;
        } catch (error) {
          set({ 
            error: error.message || 'Error obteniendo calendario del auditor',
            loading: false 
          });
          return [];
        }
      },

      /**
       * Acciones UI
       */
      cambiarVista: (nuevaVista) => {
        set({ vistaCalendario: nuevaVista });
      },

      cambiarFecha: (nuevaFecha) => {
        set({ fechaSeleccionada: dayjs(nuevaFecha) });
      },

      abrirModalPeriodo: () => {
        set({ modalPeriodo: true });
      },

      cerrarModalPeriodo: () => {
        set({ modalPeriodo: false });
      },

      abrirModalAsignacion: (asignacion = null) => {
        set({ 
          modalAsignacion: true,
          asignacionSeleccionada: asignacion 
        });
      },

      cerrarModalAsignacion: () => {
        set({ 
          modalAsignacion: false,
          asignacionSeleccionada: null 
        });
      },

      limpiarError: () => {
        set({ error: null });
      },

      /**
       * Utilidades
       */
      formatearEventosCalendario: (asignaciones) => {
        return asignaciones.map(asignacion => ({
          id: asignacion.id,
          title: asignacion.Auditoria?.Sitio?.nombre || 'Sin nombre',
          start: dayjs(asignacion.fecha_visita_programada).format('YYYY-MM-DD'),
          end: dayjs(asignacion.fecha_visita_programada).format('YYYY-MM-DD'),
          backgroundColor: get().getColorByEstado(asignacion.estado_asignacion),
          borderColor: get().getColorByEstado(asignacion.estado_asignacion),
          extendedProps: {
            proveedor: asignacion.Auditoria?.Sitio?.Proveedor?.razon_social,
            auditor: asignacion.Usuario?.nombre,
            estado: asignacion.estado_asignacion,
            prioridad: asignacion.prioridad,
            observaciones: asignacion.observaciones
          }
        }));
      },

      getColorByEstado: (estado) => {
        const colores = {
          'asignado': '#6c757d',
          'confirmado': '#007bff',
          'reagendado': '#ffc107',
          'completado': '#28a745'
        };
        return colores[estado] || '#6c757d';
      }
    }),
    {
      name: 'calendario-store',
      getStorage: () => localStorage
    }
  )
);
