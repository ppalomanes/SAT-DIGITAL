// Store de autenticación con Zustand
// src/domains/auth/store/authStore.js

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import authService from '../../../shared/utils/authService';

const useAuthStore = create(
  devtools(
    persist(
    (set, get) => ({
      // Estado
      usuario: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Acciones
      login: (userData) => {
        set({
          usuario: userData,
          token: userData.token,
          refreshToken: userData.refreshToken || null,
          isAuthenticated: true,
          loading: false,
          error: null
        });
      },

      loginAsync: async (email, password) => {
        set({ loading: true, error: null });

        try {
          const response = await authService.login(email, password);
          
          set({
            usuario: response.usuario,
            token: response.token,
            refreshToken: response.refreshToken || null,
            isAuthenticated: true,
            loading: false,
            error: null
          });

          // Configurar token para futuras requests
          authService.setAuthToken(response.token);

          return { success: true, usuario: response.usuario };

        } catch (error) {
          console.error('Error en login:', error);
          set({
            usuario: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            loading: false,
            error: error.response?.data?.message || error.message || 'Error de autenticación'
          });
          
          return { 
            success: false, 
            error: error.response?.data?.message || error.message || 'Error de autenticación'
          };
        }
      },

      logout: async () => {
        try {
          const { token } = get();
          if (token) {
            await authService.logout();
          }
        } catch (error) {
          console.warn('Error durante logout:', error);
        } finally {
          set({
            usuario: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            loading: false,
            error: null
          });
          
          // Limpiar token
          authService.clearAuthToken();
        }
      },

      refreshAuth: async () => {
        try {
          const { token } = get();
          if (!token) return false;

          const response = await authService.refreshToken();
          
          set({
            token: response.token,
            usuario: response.usuario || get().usuario
          });

          authService.setAuthToken(response.token);
          return true;
        } catch (error) {
          console.warn('Error refrescando token:', error);
          get().logout();
          return false;
        }
      },

      clearError: () => set({ error: null }),

      // Helper para obtener headers con autorización
      getAuthHeaders: () => {
        const { token } = get();
        return token ? {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } : {
          'Content-Type': 'application/json'
        };
      },

      // Helper para verificar si el usuario tiene un rol específico
      hasRole: (role) => {
        const { usuario } = get();
        return usuario?.rol === role;
      },

      // Helper para verificar si el usuario tiene uno de varios roles
      hasAnyRole: (roles) => {
        const { usuario } = get();
        return usuario?.rol && roles.includes(usuario.rol);
      },

      // Métodos de utilidad adicionales
      canAccessProvider: (providerId) => {
        const { usuario } = get();
        if (!usuario) return false;
        
        // Admin y auditores pueden ver todos
        if (['admin', 'auditor_general', 'auditor_interno'].includes(usuario.rol)) {
          return true;
        }
        
        // Proveedores solo pueden ver el suyo
        return usuario.proveedor_id === providerId;
      },

      // Métodos de verificación de roles específicos
      isAdmin: () => {
        const { usuario } = get();
        return usuario?.rol === 'admin';
      },

      isAuditorGeneral: () => {
        const { usuario } = get();
        return usuario?.rol === 'auditor_general';
      },

      isAuditorInterno: () => {
        const { usuario } = get();
        return usuario?.rol === 'auditor_interno';
      },

      isAnyAuditor: () => {
        const { usuario } = get();
        return ['auditor_general', 'auditor_interno'].includes(usuario?.rol);
      },

      isJefeProveedor: () => {
        const { usuario } = get();
        return usuario?.rol === 'jefe_proveedor';
      },

      isTecnicoProveedor: () => {
        const { usuario } = get();
        return usuario?.rol === 'tecnico_proveedor';
      },

      isAnyProvider: () => {
        const { usuario } = get();
        return ['jefe_proveedor', 'tecnico_proveedor'].includes(usuario?.rol);
      },

      isViewer: () => {
        const { usuario } = get();
        return usuario?.rol === 'visualizador';
      },

      // Métodos de compatibilidad con roles antiguos
      isAuditor: () => {
        const { usuario } = get();
        return ['auditor_general', 'auditor_interno'].includes(usuario?.rol);
      },

      isProvider: () => {
        const { usuario } = get();
        return ['jefe_proveedor', 'tecnico_proveedor'].includes(usuario?.rol);
      },

      // Inicializar autenticación desde localStorage
      initAuth: () => {
        const { token } = get();
        
        if (token) {
          authService.setAuthToken(token);
        }
      }
    }),
    {
      name: 'sat-digital-auth', // Clave en localStorage
      partialize: (state) => ({
        usuario: state.usuario,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
    ),
    {
      name: 'AuthStore' // Nombre en Redux DevTools
    }
  )
);

export { useAuthStore };
export default useAuthStore;