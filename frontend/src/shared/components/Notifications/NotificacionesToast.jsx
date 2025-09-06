// Componente de notificaciones toast para sistema global
// Sistema de comunicación asíncrona - Notificaciones push mejoradas

import { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Avatar,
  Typography,
  Box,
  IconButton,
  Slide,
  Stack
} from '@mui/material';
import {
  Message as MessageIcon,
  Assignment as AuditIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Close as CloseIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import useChatStore from '../../../domains/comunicacion/store/useChatStore';
import dayjs from 'dayjs';

const NotificacionesToast = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [maxNotificaciones] = useState(5); // Máximo de notificaciones simultáneas
  
  const { socket, connected } = useChatStore();

  // Escuchar notificaciones del WebSocket
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNotificacion = (data) => {
      const nuevaNotificacion = {
        id: Date.now() + Math.random(),
        tipo: data.tipo || 'info',
        titulo: data.titulo || 'Nueva notificación',
        mensaje: data.mensaje || data.contenido || '',
        avatar: data.usuario?.nombre || null,
        icono: getIconoPorTipo(data.tipo),
        timestamp: new Date(),
        autoHideDuration: getAutoHidePorTipo(data.tipo)
      };

      agregarNotificacion(nuevaNotificacion);
    };

    const handleNuevoMensaje = (data) => {
      const notificacion = {
        id: Date.now() + Math.random(),
        tipo: 'mensaje',
        titulo: `Nuevo mensaje - ${data.conversacion?.titulo || 'Chat'}`,
        mensaje: `${data.autor?.nombre}: ${data.contenido.substring(0, 100)}${data.contenido.length > 100 ? '...' : ''}`,
        avatar: data.autor?.nombre,
        icono: <MessageIcon color="primary" />,
        timestamp: new Date(),
        autoHideDuration: 6000,
        actionUrl: `/comunicacion?conversation=${data.conversacion_id}`
      };

      agregarNotificacion(notificacion);
    };

    const handleCambioEstado = (data) => {
      const notificacion = {
        id: Date.now() + Math.random(),
        tipo: 'estado',
        titulo: 'Cambio de estado',
        mensaje: `Auditoría ${data.auditoria?.codigo}: ${data.estado_anterior} → ${data.estado_nuevo}`,
        icono: <AuditIcon color="warning" />,
        timestamp: new Date(),
        autoHideDuration: 8000
      };

      agregarNotificacion(notificacion);
    };

    // Escuchar eventos específicos
    socket.on('nueva_notificacion', handleNotificacion);
    socket.on('nuevo_mensaje_broadcast', handleNuevoMensaje);
    socket.on('cambio_estado_auditoria', handleCambioEstado);

    // Cleanup
    return () => {
      socket.off('nueva_notificacion', handleNotificacion);
      socket.off('nuevo_mensaje_broadcast', handleNuevoMensaje);
      socket.off('cambio_estado_auditoria', handleCambioEstado);
    };
  }, [socket, connected]);

  const agregarNotificacion = (notificacion) => {
    setNotificaciones(prev => {
      const nuevas = [notificacion, ...prev];
      // Mantener solo las últimas N notificaciones
      return nuevas.slice(0, maxNotificaciones);
    });

    // Auto-remover después del tiempo especificado
    if (notificacion.autoHideDuration > 0) {
      setTimeout(() => {
        removerNotificacion(notificacion.id);
      }, notificacion.autoHideDuration);
    }
  };

  const removerNotificacion = (id) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  };

  const getIconoPorTipo = (tipo) => {
    const iconos = {
      mensaje: <MessageIcon color="primary" />,
      auditoria: <AuditIcon color="secondary" />,
      warning: <WarningIcon color="warning" />,
      error: <WarningIcon color="error" />,
      success: <SuccessIcon color="success" />,
      info: <InfoIcon color="info" />
    };
    return iconos[tipo] || iconos.info;
  };

  const getAutoHidePorTipo = (tipo) => {
    const tiempos = {
      mensaje: 6000,
      auditoria: 8000,
      warning: 10000,
      error: 0, // No auto-hide para errores
      success: 4000,
      info: 5000
    };
    return tiempos[tipo] || 5000;
  };

  const getSeverityPorTipo = (tipo) => {
    const severities = {
      mensaje: 'info',
      auditoria: 'warning',
      warning: 'warning',
      error: 'error',
      success: 'success',
      info: 'info'
    };
    return severities[tipo] || 'info';
  };

  const handleClickNotificacion = (notificacion) => {
    if (notificacion.actionUrl) {
      window.location.href = notificacion.actionUrl;
    }
    removerNotificacion(notificacion.id);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        right: 24,
        zIndex: 9999,
        width: 400,
        maxWidth: '90vw'
      }}
    >
      <Stack spacing={1}>
        <AnimatePresence>
          {notificaciones.map((notificacion, index) => (
            <motion.div
              key={notificacion.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                type: 'spring',
                stiffness: 200,
                damping: 20
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
            >
              <Alert
                severity={getSeverityPorTipo(notificacion.tipo)}
                variant="filled"
                sx={{
                  cursor: notificacion.actionUrl ? 'pointer' : 'default',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }}
                icon={notificacion.icono}
                action={
                  <IconButton
                    size="small"
                    color="inherit"
                    onClick={() => removerNotificacion(notificacion.id)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
                onClick={() => handleClickNotificacion(notificacion)}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    {notificacion.avatar && (
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {notificacion.avatar.charAt(0).toUpperCase()}
                      </Avatar>
                    )}
                    <Typography variant="subtitle2" component="div" fontWeight={600}>
                      {notificacion.titulo}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {notificacion.mensaje}
                  </Typography>
                  
                  <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
                    {dayjs(notificacion.timestamp).format('HH:mm:ss')}
                  </Typography>
                </Box>
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>
      </Stack>

      {/* Indicador de estado de conexión */}
      {socket && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 10000
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
          >
            <Alert
              severity={connected ? 'success' : 'error'}
              variant="outlined"
              sx={{
                borderRadius: 2,
                fontSize: '0.75rem',
                py: 0.5,
                px: 1,
                backgroundColor: connected ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
              }}
              icon={
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: connected ? 'success.main' : 'error.main',
                    animation: connected ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                      '100%': { opacity: 1 }
                    }
                  }}
                />
              }
            >
              {connected ? 'Conectado' : 'Desconectado'}
            </Alert>
          </motion.div>
        </Box>
      )}
    </Box>
  );
};

export default NotificacionesToast;