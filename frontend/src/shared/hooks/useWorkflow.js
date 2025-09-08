// Hook personalizado para gestión de Workflow de Auditorías
// Checkpoint 2.9 - Sistema de Estados Automáticos

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../domains/auth/store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const useWorkflow = (auditoriaId) => {
  const [progreso, setProgreso] = useState(null);
  const [metricas, setMetricas] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { token } = useAuthStore();

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Obtener progreso de auditoría específica
  const obtenerProgreso = useCallback(async () => {
    if (!auditoriaId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/auditorias/${auditoriaId}/progreso`,
        { headers }
      );
      
      if (response.data.success) {
        setProgreso(response.data.data);
      }
    } catch (error) {
      console.error('Error obteniendo progreso:', error);
      setError(error.response?.data?.message || 'Error obteniendo progreso');
    } finally {
      setLoading(false);
    }
  }, [auditoriaId, token]);

  // Obtener métricas generales
  const obtenerMetricas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/auditorias/workflow/metricas`,
        { headers }
      );
      
      if (response.data.success) {
        setMetricas(response.data.data);
      }
    } catch (error) {
      console.error('Error obteniendo métricas:', error);
      setError(error.response?.data?.message || 'Error obteniendo métricas');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Obtener historial de cambios
  const obtenerHistorial = useCallback(async () => {
    if (!auditoriaId) return;
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/auditorias/${auditoriaId}/historial-estados`,
        { headers }
      );
      
      if (response.data.success) {
        setHistorial(response.data.data);
      }
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      setError(error.response?.data?.message || 'Error obteniendo historial');
    }
  }, [auditoriaId, token]);

  // Forzar transición de estado
  const forzarTransicion = useCallback(async (nuevoEstado, razon = '') => {
    if (!auditoriaId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auditorias/${auditoriaId}/forzar-transicion`,
        { nuevo_estado: nuevoEstado, razon },
        { headers }
      );
      
      if (response.data.success) {
        // Recargar progreso después de cambiar estado
        await obtenerProgreso();
        await obtenerHistorial();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error forzando transición:', error);
      setError(error.response?.data?.message || 'Error forzando transición');
      return false;
    } finally {
      setLoading(false);
    }
  }, [auditoriaId, token, obtenerProgreso, obtenerHistorial]);

  // Verificar transiciones automáticas
  const verificarTransiciones = useCallback(async () => {
    if (!auditoriaId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auditorias/${auditoriaId}/verificar-transiciones`,
        {},
        { headers }
      );
      
      if (response.data.success) {
        // Si hubo cambios, recargar progreso
        if (response.data.data.cambio_realizado) {
          await obtenerProgreso();
          await obtenerHistorial();
        }
        return response.data.data;
      }
      
      return false;
    } catch (error) {
      console.error('Error verificando transiciones:', error);
      setError(error.response?.data?.message || 'Error verificando transiciones');
      return false;
    } finally {
      setLoading(false);
    }
  }, [auditoriaId, token, obtenerProgreso, obtenerHistorial]);

  // Ejecutar verificaciones programadas (solo admin)
  const ejecutarVerificacionesProgramadas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auditorias/workflow/verificaciones-programadas`,
        {},
        { headers }
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      
      return false;
    } catch (error) {
      console.error('Error ejecutando verificaciones programadas:', error);
      setError(error.response?.data?.message || 'Error ejecutando verificaciones');
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Auto-refresh del progreso cada 30 segundos
  useEffect(() => {
    if (!auditoriaId) return;
    
    obtenerProgreso();
    
    const interval = setInterval(obtenerProgreso, 30000); // 30 segundos
    
    return () => clearInterval(interval);
  }, [auditoriaId, obtenerProgreso]);

  // Cargar métricas al montar
  useEffect(() => {
    obtenerMetricas();
  }, [obtenerMetricas]);

  // Utilidades para estados
  const estados = {
    PROGRAMADA: 'programada',
    EN_CARGA: 'en_carga',
    PENDIENTE_EVALUACION: 'pendiente_evaluacion',
    EVALUADA: 'evaluada',
    CERRADA: 'cerrada'
  };

  const getEstadoInfo = useCallback((estado) => {
    const info = {
      programada: { 
        label: 'Programada', 
        color: 'default', 
        descripcion: 'Auditoría creada y en espera de inicio'
      },
      en_carga: { 
        label: 'En Carga', 
        color: 'primary', 
        descripcion: 'Carga de documentos en progreso'
      },
      pendiente_evaluacion: { 
        label: 'Pendiente Evaluación', 
        color: 'warning', 
        descripcion: 'Lista para evaluación por auditor'
      },
      evaluada: { 
        label: 'Evaluada', 
        color: 'success', 
        descripcion: 'Evaluación completada'
      },
      cerrada: { 
        label: 'Cerrada', 
        color: 'success', 
        descripcion: 'Proceso de auditoría finalizado'
      }
    };
    
    return info[estado] || { label: estado, color: 'default', descripcion: '' };
  }, []);

  const puedeAvanzar = progreso?.transiciones?.puede_avanzar || false;
  const siguienteEstado = progreso?.transiciones?.siguiente_estado;
  const porcentajeProgreso = progreso?.porcentaje || 0;
  const estadoActual = progreso?.estado_actual;

  // Formatear métricas para gráficos
  const metricasFormateadas = metricas ? {
    labels: Object.keys(metricas.global || {}),
    datasets: [{
      data: Object.values(metricas.global || {}),
      backgroundColor: [
        '#f5f5f5', // programada
        '#2196f3', // en_carga  
        '#ff9800', // pendiente_evaluacion
        '#4caf50', // evaluada
        '#1976d2'  // cerrada
      ]
    }]
  } : null;

  return {
    // Estados
    progreso,
    metricas,
    historial,
    loading,
    error,
    
    // Computed values
    puedeAvanzar,
    siguienteEstado,
    porcentajeProgreso,
    estadoActual,
    metricasFormateadas,
    
    // Acciones
    obtenerProgreso,
    obtenerMetricas,
    obtenerHistorial,
    forzarTransicion,
    verificarTransiciones,
    ejecutarVerificacionesProgramadas,
    
    // Utilidades
    estados,
    getEstadoInfo,
    
    // Métodos de limpieza
    limpiarError: () => setError(null),
    refrescar: () => {
      obtenerProgreso();
      obtenerMetricas();
      obtenerHistorial();
    }
  };
};
