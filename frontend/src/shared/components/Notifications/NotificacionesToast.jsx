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
  Person as PersonIcon,
  Reply as ReplyIcon,
  AttachFile as AttachFileIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  Done as DoneIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon
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

    const handleRespuestaMensaje = (data) => {
      const notificacion = {
        id: Date.now() + Math.random(),
        tipo: 'respuesta',
        titulo: 'Nueva respuesta',
        mensaje: `${data.autor?.nombre} respondió tu mensaje: "${data.contenido.substring(0, 80)}${data.contenido.length > 80 ? '...' : ''}"`,
        avatar: data.autor?.nombre,
        icono: <ReplyIcon color="secondary" />,
        timestamp: new Date(),
        autoHideDuration: 8000,
        actionUrl: `/comunicacion?conversation=${data.conversacion_id}`,
        actions: [
          {
            label: 'Ver conversación',
            action: () => window.location.href = `/comunicacion?conversation=${data.conversacion_id}`
          },
          {
            label: 'Responder',
            action: () => {
              window.location.href = `/comunicacion?conversation=${data.conversacion_id}&reply=${data.mensaje_id}`;
            }
          }
        ]
      };

      agregarNotificacion(notificacion);
    };

    const handleArchivoCompartido = (data) => {
      const notificacion = {
        id: Date.now() + Math.random(),
        tipo: 'archivo',
        titulo: 'Archivo compartido',
        mensaje: `${data.autor?.nombre} compartió: ${data.archivo_nombre}`,
        avatar: data.autor?.nombre,
        icono: <AttachFileIcon color="info" />,
        timestamp: new Date(),
        autoHideDuration: 10000,
        actionUrl: `/comunicacion?conversation=${data.conversacion_id}`,
        actions: [
          {
            label: 'Descargar',
            action: () => window.open(data.archivo_url, '_blank')
          },
          {
            label: 'Ver chat',
            action: () => window.location.href = `/comunicacion?conversation=${data.conversacion_id}`
          }
        ]
      };

      agregarNotificacion(notificacion);
    };

    const handleDocumentoSubido = (data) => {
      const notificacion = {
        id: Date.now() + Math.random(),
        tipo: 'documento',
        titulo: 'Documento subido',
        mensaje: `Se subió "${data.documento_nombre}" a la sección ${data.seccion_nombre}`,
        icono: <UploadIcon color="success" />,
        timestamp: new Date(),
        autoHideDuration: 6000,
        actionUrl: `/documentos?auditoria=${data.auditoria_id}&seccion=${data.seccion_id}`
      };

      agregarNotificacion(notificacion);
    };

    const handleRecordatorio = (data) => {
      const notificacion = {
        id: Date.now() + Math.random(),
        tipo: 'recordatorio',
        titulo: 'Recordatorio',
        mensaje: data.mensaje || 'Tienes una tarea pendiente',
        icono: <ScheduleIcon color="warning" />,
        timestamp: new Date(),
        autoHideDuration: 0, // No auto-hide para recordatorios
        priority: 'high'
      };

      agregarNotificacion(notificacion);
    };

    // Escuchar eventos específicos
    socket.on('nueva_notificacion', handleNotificacion);
    socket.on('nuevo_mensaje_broadcast', handleNuevoMensaje);
    socket.on('cambio_estado_auditoria', handleCambioEstado);
    socket.on('respuesta_mensaje', handleRespuestaMensaje);
    socket.on('archivo_compartido', handleArchivoCompartido);
    socket.on('documento_subido', handleDocumentoSubido);
    socket.on('recordatorio', handleRecordatorio);

    // Cleanup
    return () => {
      socket.off('nueva_notificacion', handleNotificacion);
      socket.off('nuevo_mensaje_broadcast', handleNuevoMensaje);
      socket.off('cambio_estado_auditoria', handleCambioEstado);
      socket.off('respuesta_mensaje', handleRespuestaMensaje);
      socket.off('archivo_compartido', handleArchivoCompartido);
      socket.off('documento_subido', handleDocumentoSubido);
      socket.off('recordatorio', handleRecordatorio);
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
      respuesta: <ReplyIcon color="secondary" />,
      archivo: <AttachFileIcon color="info" />,
      documento: <UploadIcon color="success" />,
      recordatorio: <ScheduleIcon color="warning" />,
      auditoria: <AuditIcon color="secondary" />,
      estado: <AuditIcon color="warning" />,
      warning: <WarningIcon color="warning" />,
      error: <WarningIcon color="error" />,
      success: <SuccessIcon color="success" />,
      info: <InfoIcon color="info" />,
      security: <SecurityIcon color="error" />
    };
    return iconos[tipo] || iconos.info;
  };

  const getAutoHidePorTipo = (tipo) => {
    const tiempos = {
      mensaje: 6000,
      respuesta: 8000,
      archivo: 10000,
      documento: 6000,
      recordatorio: 0, // No auto-hide para recordatorios
      auditoria: 8000,
      estado: 8000,
      warning: 10000,
      error: 0, // No auto-hide para errores
      success: 4000,
      info: 5000,
      security: 0 // No auto-hide para seguridad
    };
    return tiempos[tipo] || 5000;
  };

  const getSeverityPorTipo = (tipo) => {
    const severities = {
      mensaje: 'info',
      respuesta: 'info',
      archivo: 'info',
      documento: 'success',
      recordatorio: 'warning',
      auditoria: 'warning',
      estado: 'warning',
      warning: 'warning',
      error: 'error',
      success: 'success',
      info: 'info',
      security: 'error'
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

    </Box>
  );
};

export default NotificacionesToast;