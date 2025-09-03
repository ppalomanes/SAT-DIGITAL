// Hook personalizado para gestión de WebSocket
// Checkpoint 2.3 - Sistema Comunicación Asíncrona

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../../auth/store/useAuthStore';
import useChatStore from '../store/useChatStore';

export const useWebSocket = () => {
  const { token, usuario } = useAuthStore();
  const { 
    connected, 
    conectarSocket, 
    desconectarSocket,
    contarNotificacionesNoLeidas 
  } = useChatStore();

  // Conectar WebSocket al hacer login
  const conectar = useCallback(() => {
    if (token && usuario && !connected) {
      console.log('🔌 Conectando WebSocket para usuario:', usuario.email);
      conectarSocket(token);
      
      // Cargar notificaciones no leídas
      contarNotificacionesNoLeidas();
    }
  }, [token, usuario, connected, conectarSocket, contarNotificacionesNoLeidas]);

  // Desconectar WebSocket
  const desconectar = useCallback(() => {
    console.log('🔌 Desconectando WebSocket');
    desconectarSocket();
  }, [desconectarSocket]);

  // Auto-conectar cuando hay usuario y token
  useEffect(() => {
    if (token && usuario) {
      conectar();
    }
    
    // Cleanup al desmontar
    return () => {
      if (!token || !usuario) {
        desconectar();
      }
    };
  }, [token, usuario, conectar, desconectar]);

  // Reconectar si se pierde la conexión
  useEffect(() => {
    if (token && usuario && !connected) {
      const reconnectTimer = setTimeout(() => {
        console.log('🔄 Reintentando conexión WebSocket...');
        conectar();
      }, 3000);

      return () => clearTimeout(reconnectTimer);
    }
  }, [connected, token, usuario, conectar]);

  return {
    connected,
    conectar,
    desconectar
  };
};

export default useWebSocket;
