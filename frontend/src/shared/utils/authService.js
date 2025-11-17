import axios from 'axios';

/**
 * Configuración base de Axios para SAT-Digital
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Instancia principal de Axios
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor para agregar token automáticamente
 */
apiClient.interceptors.request.use(
  (config) => {
    const authStorageData = localStorage.getItem('sat-digital-auth');
    if (authStorageData) {
      try {
        const authData = JSON.parse(authStorageData);
        // Zustand puede guardar en authData.state o directamente en authData
        const token = authData.state?.token || authData.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Token agregado al request:', config.url);
        } else {
          console.warn('⚠️ No se encontró token en localStorage');
        }
      } catch (error) {
        console.warn('Error parseando token desde localStorage:', error);
      }
    } else {
      console.warn('⚠️ No hay datos de autenticación en localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor para manejar respuestas y errores
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si es error 401 y no hemos intentado refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Intentar refresh token
        const authStorageData = localStorage.getItem('sat-digital-auth');
        if (authStorageData) {
          const parsedAuth = JSON.parse(authStorageData);
          const currentToken = parsedAuth.state?.token || parsedAuth.token;

          if (currentToken) {
            const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
              headers: {
                Authorization: `Bearer ${currentToken}`
              }
            });

            const newToken = refreshResponse.data.token;

            // Actualizar token en localStorage (mantener estructura original)
            if (parsedAuth.state) {
              parsedAuth.state.token = newToken;
            } else {
              parsedAuth.token = newToken;
            }
            localStorage.setItem('sat-digital-auth', JSON.stringify(parsedAuth));

            // Actualizar header del request original
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.warn('Error refrescando token:', refreshError);
        // Si falla refresh, limpiar localStorage
        localStorage.removeItem('sat-digital-auth');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Servicio de autenticación
 */
const authService = {
  /**
   * Login de usuario
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      return response.data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  /**
   * Logout de usuario
   */
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Error en logout:', error);
      // No lanzar error, continuar con logout local
    }
  },

  /**
   * Refrescar token
   */
  refreshToken: async () => {
    try {
      const response = await apiClient.post('/auth/refresh');
      return response.data;
    } catch (error) {
      console.error('Error refrescando token:', error);
      throw error;
    }
  },

  /**
   * Configurar token en headers
   */
  setAuthToken: (token) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  },

  /**
   * Limpiar token
   */
  clearAuthToken: () => {
    delete apiClient.defaults.headers.common['Authorization'];
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated: () => {
    try {
      const authData = localStorage.getItem('sat-digital-auth');
      if (!authData) return false;

      const parsedAuth = JSON.parse(authData);
      return !!parsedAuth.state?.token;
    } catch {
      return false;
    }
  },

  /**
   * Obtener usuario actual desde localStorage
   */
  getCurrentUser: () => {
    try {
      const authData = localStorage.getItem('sat-digital-auth');
      if (!authData) return null;

      const parsedAuth = JSON.parse(authData);
      return parsedAuth.state?.usuario || null;
    } catch {
      return null;
    }
  },

  // Exportar apiClient para uso directo
  apiClient: apiClient,
};

export { apiClient };
export default authService;
