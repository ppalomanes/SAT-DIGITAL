/**
 * Servicio para gestión de períodos de auditoría
 * Conecta con los endpoints del backend para manejar períodos
 * 
 * @author SAT-Digital Team
 * @version 1.0.0
 * @since Checkpoint 2.5
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: `${API_URL}/calendario`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación desde Zustand persist
api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('sat-digital-auth');
  if (authData) {
    try {
      const parsedAuth = JSON.parse(authData);
      if (parsedAuth.state?.token) {
        config.headers.Authorization = `Bearer ${parsedAuth.state.token}`;
      }
    } catch (error) {
      console.warn('Error parseando token desde localStorage:', error);
    }
  }
  return config;
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sat-digital-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const periodoService = {
  /**
   * Listar todos los períodos
   */
  async listarPeriodos(filtros = {}) {
    const params = new URLSearchParams(filtros);
    return api.get(`/periodos?${params}`);
  },

  /**
   * Obtener período activo
   */
  async obtenerPeriodoActivo() {
    return api.get('/periodos/activo');
  },

  /**
   * Obtener período por ID
   */
  async obtenerPeriodo(id) {
    return api.get(`/periodos/${id}`);
  },

  /**
   * Crear nuevo período
   */
  async crearPeriodo(datos) {
    return api.post('/periodos', datos);
  },

  /**
   * Activar período
   */
  async activarPeriodo(id) {
    return api.put(`/periodos/${id}/activar`);
  },

  /**
   * Generar auditorías para un período
   */
  async generarAuditorias(id) {
    return api.post(`/periodos/${id}/generar-auditorias`);
  }
};
