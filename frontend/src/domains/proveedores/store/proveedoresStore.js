/**
 * Store Zustand para gestión de proveedores
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import proveedoresService from '../services/proveedoresService';

export const useProveedoresStore = create()(
  devtools(
    (set, get) => ({
      // Estado
      proveedores: [],
      sitios: [],
      selectedProveedor: null,
      selectedSitio: null,
      stats: {},
      loading: false,
      error: null,

      // Filtros y búsqueda
      filters: {
        search: '',
        estado: 'todos',
        localidad: 'todas'
      },

      // Acciones para proveedores
      async fetchProveedores() {
        set({ loading: true, error: null });
        try {
          const proveedores = await proveedoresService.getProveedores();
          set({ proveedores, loading: false });
          return proveedores;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      async createProveedor(proveedorData) {
        set({ loading: true, error: null });
        try {
          const nuevoProveedor = await proveedoresService.createProveedor(proveedorData);
          const { proveedores } = get();
          set({
            proveedores: [...proveedores, nuevoProveedor],
            loading: false
          });
          return nuevoProveedor;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      async updateProveedor(id, proveedorData) {
        set({ loading: true, error: null });
        try {
          const proveedorActualizado = await proveedoresService.updateProveedor(id, proveedorData);
          const { proveedores } = get();
          set({
            proveedores: proveedores.map(p =>
              p.id === id ? proveedorActualizado : p
            ),
            loading: false
          });
          return proveedorActualizado;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      async deleteProveedor(id) {
        set({ loading: true, error: null });
        try {
          await proveedoresService.deleteProveedor(id);
          const { proveedores } = get();
          set({
            proveedores: proveedores.filter(p => p.id !== id),
            loading: false
          });
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Acciones para sitios
      async fetchAllSitios() {
        try {
          const sitios = await proveedoresService.getAllSitios();
          set({ sitios });
          return sitios;
        } catch (error) {
          set({ error: error.message });
          throw error;
        }
      },

      async fetchSitiosByProveedor(proveedorId) {
        const { sitios: currentSitios } = get();
        try {
          const newSitios = await proveedoresService.getSitiosByProveedor(proveedorId);

          // Filtrar sitios existentes de este proveedor y agregar los nuevos
          const filteredSitios = currentSitios.filter(sitio => sitio.proveedor_id !== proveedorId);
          const updatedSitios = [...filteredSitios, ...newSitios];

          set({ sitios: updatedSitios });
          return newSitios;
        } catch (error) {
          set({ error: error.message });
          throw error;
        }
      },

      async createSitio(sitioData) {
        set({ loading: true, error: null });
        try {
          const nuevoSitio = await proveedoresService.createSitio(sitioData);
          const { sitios } = get();
          set({
            sitios: [...sitios, nuevoSitio],
            loading: false
          });
          return nuevoSitio;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      async updateSitio(id, sitioData) {
        set({ loading: true, error: null });
        try {
          const sitioActualizado = await proveedoresService.updateSitio(id, sitioData);
          const { sitios } = get();
          set({
            sitios: sitios.map(s =>
              s.id === id ? sitioActualizado : s
            ),
            loading: false
          });
          return sitioActualizado;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      async deleteSitio(id) {
        set({ loading: true, error: null });
        try {
          await proveedoresService.deleteSitio(id);
          const { sitios } = get();
          set({
            sitios: sitios.filter(s => s.id !== id),
            loading: false
          });
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Estadísticas
      async fetchStats() {
        set({ loading: true, error: null });
        try {
          const stats = await proveedoresService.getAllStats();
          set({ stats, loading: false });
          return stats;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Selecciones
      setSelectedProveedor: (proveedor) => {
        set({ selectedProveedor: proveedor });
      },

      setSelectedSitio: (sitio) => {
        set({ selectedSitio: sitio });
      },

      // Filtros
      setFilters: (newFilters) => {
        const { filters } = get();
        set({ filters: { ...filters, ...newFilters } });
      },

      // Function to get filtered proveedores (instead of getter for reactivity)
      getFilteredProveedores: () => {
        const { proveedores, sitios, filters } = get();
        return proveedores.filter(proveedor => {
          const matchesSearch = !filters.search ||
            proveedor.razon_social.toLowerCase().includes(filters.search.toLowerCase()) ||
            proveedor.nombre_comercial.toLowerCase().includes(filters.search.toLowerCase()) ||
            proveedor.cuit.includes(filters.search);

          const matchesEstado = filters.estado === 'todos' ||
            proveedor.estado === filters.estado;

          const matchesLocalidad = filters.localidad === 'todas' ||
            sitios.some(sitio => sitio.proveedor_id === proveedor.id && sitio.localidad === filters.localidad);

          return matchesSearch && matchesEstado && matchesLocalidad;
        });
      },

      get proveedorStats() {
        const { proveedores, sitios } = get();
        return {
          totalProveedores: proveedores.length,
          totalSitios: sitios.length,
          proveedoresActivos: proveedores.filter(p => p.estado === 'activo').length,
          sitiosPorLocalidad: sitios.reduce((acc, sitio) => {
            acc[sitio.localidad] = (acc[sitio.localidad] || 0) + 1;
            return acc;
          }, {})
        };
      },

      // Reset
      resetStore: () => {
        set({
          proveedores: [],
          sitios: [],
          selectedProveedor: null,
          selectedSitio: null,
          stats: {},
          loading: false,
          error: null,
          filters: {
            search: '',
            estado: 'todos',
            localidad: 'todas'
          }
        });
      }
    }),
    {
      name: 'proveedores-store',
    }
  )
);