// Store de Zustand para sistema de comunicación
// Checkpoint 2.3 - Sistema Comunicación Asíncrona

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import io from 'socket.io-client';
import authService from '../../../shared/utils/authService';
import { useAuthStore } from '../../auth/store/authStore';

// Helper para obtener token de autenticación
const getAuthToken = () => {
  try {
    // Usar directamente el store de auth en lugar de localStorage
    const authState = useAuthStore.getState();
    return authState.token || null;
  } catch (error) {
    console.warn('Error obteniendo token:', error);
    return null;
  }
};

const useChatStore = create(
  persist(
    (set, get) => ({
      // Estado del WebSocket
      socket: null,
      connected: false,
      
      // Conversaciones y mensajes
      conversaciones: [],
      mensajesActivos: new Map(),
      conversacionActiva: null,
      
      // Notificaciones
      notificaciones: [],
      notificacionesNoLeidas: 0,
      
      // Estados de UI
      loading: false,
      error: null,
      usuariosEscribiendo: new Set(),

      // =============================================
      // ACCIONES DE WEBSOCKET
      // =============================================
      
      conectarSocket: (token) => {
        const { socket } = get();
        
        // Si ya está conectado, no hacer nada
        if (socket && socket.connected) {
          return;
        }

        const newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001', {
          auth: { token },
          transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
          console.log('✅ Socket conectado para chat');
          set({ socket: newSocket, connected: true, error: null });
        });

        newSocket.on('disconnect', () => {
          console.log('❌ Socket desconectado');
          set({ connected: false });
        });

        newSocket.on('connect_error', (error) => {
          console.error('❌ Error de conexión Socket:', error);
          set({ 
            connected: false, 
            error: 'Error de conexión al chat' 
          });
        });

        // Eventos de chat
        newSocket.on('new_message', (data) => {
          get().recibirMensaje(data.mensaje, data.emisor);
        });

        newSocket.on('user_typing', (data) => {
          get().agregarUsuarioEscribiendo(data.usuarioId, data.usuario);
        });

        newSocket.on('user_stop_typing', (data) => {
          get().removerUsuarioEscribiendo(data.usuarioId);
        });

        newSocket.on('notification', (data) => {
          get().recibirNotificacion(data);
        });

        set({ socket: newSocket });
      },

      desconectarSocket: () => {
        const { socket } = get();
        if (socket) {
          socket.disconnect();
          set({ socket: null, connected: false });
        }
      },

      // =============================================
      // ACCIONES DE CONVERSACIONES
      // =============================================
      
      obtenerConversaciones: async (auditoriaId) => {
        set({ loading: true, error: null });
        
        try {
          const token = getAuthToken();
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/comunicacion/auditorias/${auditoriaId}/conversaciones`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.ok) {
            throw new Error('Error obteniendo conversaciones');
          }

          const data = await response.json();
          set({
            conversaciones: data.data || [],
            loading: false,
            // Limpiar estado anterior al cambiar de auditoría
            mensajesActivos: new Map(),
            conversacionActiva: null
          });

          return data.data;
        } catch (error) {
          set({ 
            error: error.message,
            loading: false 
          });
          throw error;
        }
      },

      crearConversacion: async (auditoriaId, datosConversacion) => {
        set({ loading: true, error: null });
        
        try {
          const token = getAuthToken();
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/comunicacion/auditorias/${auditoriaId}/conversaciones`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(datosConversacion)
            }
          );

          if (!response.ok) {
            throw new Error('Error creando conversación');
          }

          const data = await response.json();
          
          // Actualizar lista local
          set(state => ({
            conversaciones: [data.data, ...state.conversaciones],
            loading: false
          }));

          return data.data;
        } catch (error) {
          set({ 
            error: error.message,
            loading: false 
          });
          throw error;
        }
      },

      enviarMensaje: async (conversacionId, contenido, tipoMensaje = 'texto', respuestaAId = null) => {
        try {
          const token = getAuthToken();
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/comunicacion/conversaciones/${conversacionId}/mensajes`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                contenido,
                tipo_mensaje: tipoMensaje,
                responde_a_mensaje_id: respuestaAId
              })
            }
          );

          if (!response.ok) {
            throw new Error('Error enviando mensaje');
          }

          const data = await response.json();
          
          // Agregar mensaje localmente
          get().agregarMensajeLocal(conversacionId, data.data);
          
          return data.data;
        } catch (error) {
          set({ error: error.message });
          throw error;
        }
      },

      enviarArchivo: async (conversacionId, archivo, contenido = '', respuestaAId = null) => {
        try {
          const token = getAuthToken();
          const formData = new FormData();
          formData.append('archivo', archivo);
          formData.append('contenido', contenido);
          if (respuestaAId) {
            formData.append('responde_a_mensaje_id', respuestaAId);
          }

          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/comunicacion/conversaciones/${conversacionId}/archivos`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            }
          );

          if (!response.ok) {
            throw new Error('Error enviando archivo');
          }

          const data = await response.json();
          
          // Agregar mensaje localmente
          get().agregarMensajeLocal(conversacionId, data.data);
          
          return data.data;
        } catch (error) {
          set({ error: error.message });
          throw error;
        }
      },

      // =============================================
      // ACCIONES DE MENSAJES
      // =============================================
      
      recibirMensaje: (mensaje, emisor) => {
        const { mensajesActivos } = get();

        // Actualizar mensajes de la conversación
        const conversacionId = mensaje.conversacion_id;
        const mensajesConversacion = mensajesActivos.get(conversacionId) || [];

        // Verificar si el mensaje ya existe para evitar duplicados
        const mensajeExiste = mensajesConversacion.some(m => m.id === mensaje.id);
        if (!mensajeExiste) {
          mensajesConversacion.push({ ...mensaje, usuario: emisor });

          set(state => {
            const newMensajes = new Map(state.mensajesActivos);
            newMensajes.set(conversacionId, [...mensajesConversacion]);
            return { mensajesActivos: newMensajes };
          });
        }
      },

      agregarMensajeLocal: (conversacionId, mensaje) => {
        set(state => {
          const newMensajes = new Map(state.mensajesActivos);
          const mensajesConversacion = newMensajes.get(conversacionId) || [];

          // Verificar si el mensaje ya existe para evitar duplicados
          const mensajeExiste = mensajesConversacion.some(m => m.id === mensaje.id);
          if (!mensajeExiste) {
            newMensajes.set(conversacionId, [...mensajesConversacion, mensaje]);
          }

          return { mensajesActivos: newMensajes };
        });
      },

      // =============================================
      // ACCIONES DE NOTIFICACIONES
      // =============================================
      
      obtenerNotificaciones: async () => {
        try {
          const token = getAuthToken();
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/comunicacion/notificaciones`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.ok) {
            throw new Error('Error obteniendo notificaciones');
          }

          const data = await response.json();
          set({ notificaciones: data.data || [] });
          
          return data.data;
        } catch (error) {
          set({ error: error.message });
          throw error;
        }
      },

      contarNotificacionesNoLeidas: async () => {
        try {
          const token = getAuthToken();
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/comunicacion/notificaciones/count`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.ok) {
            throw new Error('Error contando notificaciones');
          }

          const data = await response.json();
          set({ notificacionesNoLeidas: data.data.no_leidas || 0 });
          
          return data.data.no_leidas;
        } catch (error) {
          return 0;
        }
      },

      recibirNotificacion: (notificacion) => {
        set(state => ({
          notificaciones: [notificacion, ...state.notificaciones],
          notificacionesNoLeidas: state.notificacionesNoLeidas + 1
        }));
      },

      // =============================================
      // ACCIONES DE UI Y UTILIDADES
      // =============================================
      
      setConversacionActiva: (conversacionId) => {
        const { socket, mensajesActivos, conversaciones } = get();

        // Unirse a la conversación via Socket
        if (socket && conversacionId) {
          socket.emit('join_conversation', conversacionId);
        }

        set({ conversacionActiva: conversacionId });

        // Si no tenemos mensajes para esta conversación, cargarlos desde los datos existentes
        if (conversacionId && !mensajesActivos.has(conversacionId)) {
          const conversacion = conversaciones.find(c => c.id === conversacionId);
          if (conversacion && conversacion.mensajes) {
            set(state => {
              const newMensajes = new Map(state.mensajesActivos);
              newMensajes.set(conversacionId, conversacion.mensajes || []);
              return { mensajesActivos: newMensajes };
            });
          }
        }
      },

      agregarUsuarioEscribiendo: (usuarioId, nombreUsuario) => {
        set(state => {
          const newUsuariosEscribiendo = new Set(state.usuariosEscribiendo);
          newUsuariosEscribiendo.add(`${usuarioId}:${nombreUsuario}`);
          return { usuariosEscribiendo: newUsuariosEscribiendo };
        });
      },

      removerUsuarioEscribiendo: (usuarioId) => {
        set(state => {
          const newUsuariosEscribiendo = new Set(state.usuariosEscribiendo);
          // Remover cualquier entrada que contenga este usuarioId
          Array.from(newUsuariosEscribiendo).forEach(entry => {
            if (entry.startsWith(`${usuarioId}:`)) {
              newUsuariosEscribiendo.delete(entry);
            }
          });
          return { usuariosEscribiendo: newUsuariosEscribiendo };
        });
      },

      limpiarError: () => set({ error: null }),

      limpiarMensajes: () => set({ mensajesActivos: new Map() }),

      // Acción para limpiar todo al logout
      marcarMensajeComoLeido: async (mensajeId) => {
        try {
          const token = getAuthToken();
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/comunicacion/mensajes/${mensajeId}/leer`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.ok) {
            throw new Error('Error marcando mensaje como leído');
          }

          // Actualizar mensaje localmente
          set(state => {
            const newMensajes = new Map(state.mensajesActivos);
            for (const [conversacionId, mensajes] of newMensajes.entries()) {
              const mensajeIndex = mensajes.findIndex(m => m.id === mensajeId);
              if (mensajeIndex !== -1) {
                mensajes[mensajeIndex] = {
                  ...mensajes[mensajeIndex],
                  estado_mensaje: 'leido',
                  leido_at: new Date().toISOString()
                };
                break;
              }
            }
            return { mensajesActivos: newMensajes };
          });

          return true;
        } catch (error) {
          console.error('Error marcando mensaje como leído:', error);
          set({ error: error.message });
          return false;
        }
      },

      limpiarTodo: () => {
        const { socket } = get();
        if (socket) {
          socket.disconnect();
        }
        
        set({
          socket: null,
          connected: false,
          conversaciones: [],
          mensajesActivos: new Map(),
          conversacionActiva: null,
          notificaciones: [],
          notificacionesNoLeidas: 0,
          loading: false,
          error: null,
          usuariosEscribiendo: new Set()
        });
      }
    }),
    {
      name: 'sat-digital-chat',
      // Solo persistir datos esenciales, no el socket
      partialize: (state) => ({
        conversaciones: state.conversaciones,
        notificaciones: state.notificaciones,
        notificacionesNoLeidas: state.notificacionesNoLeidas
      })
    }
  )
);

export default useChatStore;
