// Componente Chat para comunicación contextual
// Checkpoint 2.3 - Sistema Comunicación Asíncrona

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Divider,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Circle as CircleIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../auth/store/authStore';
import useChatStore from '../store/useChatStore';
import dayjs from 'dayjs';

const ChatAuditoria = ({ auditoriaId, seccionId = null, onClose }) => {
  const [mensaje, setMensaje] = useState('');
  const [modalNuevaConversacion, setModalNuevaConversacion] = useState(false);
  const [nuevaConversacion, setNuevaConversacion] = useState({
    titulo: '',
    categoria: 'tecnico',
    mensaje_inicial: ''
  });
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { usuario } = useAuthStore();

  const {
    conversaciones,
    mensajesActivos,
    conversacionActiva,
    connected,
    loading,
    error,
    usuariosEscribiendo,
    conectarSocket,
    desconectarSocket,
    obtenerConversaciones,
    crearConversacion,
    enviarMensaje,
    setConversacionActiva,
    limpiarError
  } = useChatStore();

  // Inicializar Socket al montar componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      conectarSocket(token);
    }

    return () => {
      // No desconectar aquí para mantener conexión global
    };
  }, [conectarSocket]);

  // Cargar conversaciones
  useEffect(() => {
    if (auditoriaId) {
      obtenerConversaciones(auditoriaId);
    }
  }, [auditoriaId, obtenerConversaciones]);

  // Auto scroll al final
  useEffect(() => {
    scrollToBottom();
  }, [mensajesActivos, conversacionActiva]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnviarMensaje = async () => {
    if (!mensaje.trim() || !conversacionActiva) return;

    try {
      await enviarMensaje(conversacionActiva, mensaje);
      setMensaje('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviarMensaje();
    }
  };

  const handleCrearConversacion = async () => {
    try {
      const datosConversacion = {
        ...nuevaConversacion,
        seccion_id: seccionId ? parseInt(seccionId) : null
      };
      
      const conversacion = await crearConversacion(auditoriaId, datosConversacion);
      setConversacionActiva(conversacion.id);
      setModalNuevaConversacion(false);
      setNuevaConversacion({ titulo: '', categoria: 'tecnico', mensaje_inicial: '' });
    } catch (error) {
      console.error('Error creando conversación:', error);
    }
  };

  const getCategoriaColor = (categoria) => {
    const colores = {
      tecnico: 'primary',
      administrativo: 'secondary',
      solicitud: 'success',
      problema: 'error'
    };
    return colores[categoria] || 'default';
  };

  const getRoleColor = (rol) => {
    const colores = {
      admin: '#f44336',
      auditor: '#2196f3',
      proveedor: '#4caf50',
      visualizador: '#ff9800'
    };
    return colores[rol] || '#757575';
  };

  const mensajesConversacionActiva = conversacionActiva ? 
    mensajesActivos.get(conversacionActiva) || [] : [];

  const conversacionSeleccionada = conversaciones.find(c => c.id === conversacionActiva);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="chat-auditoria"
    >
      <Card 
        sx={{ 
          height: '600px', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        <CardHeader
          title="Comunicación"
          subheader={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Chip
                size="small"
                icon={<CircleIcon sx={{ fontSize: 8 }} />}
                label={connected ? 'Conectado' : 'Desconectado'}
                color={connected ? 'success' : 'error'}
                variant="outlined"
              />
              {conversacionSeleccionada && (
                <Chip
                  size="small"
                  label={conversacionSeleccionada.categoria}
                  color={getCategoriaColor(conversacionSeleccionada.categoria)}
                  variant="filled"
                />
              )}
              {usuariosEscribiendo.size > 0 && (
                <Chip
                  size="small"
                  icon={<TimeIcon />}
                  label="Escribiendo..."
                  color="info"
                  variant="outlined"
                />
              )}
            </Box>
          }
          action={
            <Box>
              <Tooltip title="Nueva conversación">
                <IconButton
                  onClick={() => setModalNuevaConversacion(true)}
                  color="primary"
                  size="small"
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
              {onClose && (
                <Tooltip title="Cerrar chat">
                  <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          }
          className="chat-auditoria__header"
        />

        <CardContent sx={{ flexGrow: 1, overflow: 'hidden', p: 0 }}>
          <Box sx={{ display: 'flex', height: '100%' }}>
            
            {/* Lista de conversaciones */}
            <Paper
              sx={{
                width: '40%',
                borderRight: 1,
                borderColor: 'divider',
                overflowY: 'auto'
              }}
              elevation={0}
            >
              <List dense>
                {conversaciones.map((conversacion) => (
                  <ListItem
                    key={conversacion.id}
                    button
                    selected={conversacion.id === conversacionActiva}
                    onClick={() => setConversacionActiva(conversacion.id)}
                    className="chat-auditoria__conversation-item"
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="subtitle2" noWrap>
                          {conversacion.titulo}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(conversacion.updated_at).format('HH:mm')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          size="small"
                          label={conversacion.categoria}
                          color={getCategoriaColor(conversacion.categoria)}
                          variant="outlined"
                          sx={{ fontSize: '0.6rem', height: 16 }}
                        />
                        <Chip
                          size="small"
                          label={conversacion.estado}
                          variant="filled"
                          sx={{ fontSize: '0.6rem', height: 16 }}
                          color={conversacion.estado === 'cerrada' ? 'default' : 'primary'}
                        />
                      </Box>
                    </Box>
                  </ListItem>
                ))}
                
                {conversaciones.length === 0 && !loading && (
                  <ListItem>
                    <Typography variant="body2" color="text.secondary" align="center">
                      No hay conversaciones. Haz clic en + para crear una nueva.
                    </Typography>
                  </ListItem>
                )}
              </List>
            </Paper>

            {/* Área de mensajes */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              
              {/* Mensajes */}
              <Box 
                sx={{ 
                  flexGrow: 1, 
                  overflowY: 'auto', 
                  p: 1,
                  minHeight: 0 
                }}
                className="chat-auditoria__messages"
              >
                <AnimatePresence>
                  {mensajesConversacionActiva.map((mensaje) => (
                    <motion.div
                      key={mensaje.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`chat-auditoria__message ${
                        mensaje.usuario_id === usuario.id ? 'chat-auditoria__message--own' : ''
                      }`}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          mb: 2,
                          flexDirection: mensaje.usuario_id === usuario.id ? 'row-reverse' : 'row'
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: getRoleColor(mensaje.usuario?.rol || 'proveedor'),
                            mx: 1
                          }}
                        >
                          <PersonIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1.5,
                            maxWidth: '70%',
                            bgcolor: mensaje.usuario_id === usuario.id ? 
                              'primary.main' : 'grey.100',
                            color: mensaje.usuario_id === usuario.id ? 
                              'primary.contrastText' : 'text.primary'
                          }}
                        >
                          <Typography variant="caption" display="block" sx={{ opacity: 0.8, mb: 0.5 }}>
                            {mensaje.usuario?.nombre || 'Usuario'} • {dayjs(mensaje.created_at).format('HH:mm')}
                          </Typography>
                          <Typography variant="body2">
                            {mensaje.contenido}
                          </Typography>
                        </Paper>
                      </Box>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {mensajesConversacionActiva.length === 0 && conversacionActiva && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Inicia la conversación enviando un mensaje
                    </Typography>
                  </Box>
                )}
                
                <div ref={messagesEndRef} />
              </Box>

              <Divider />

              {/* Input de mensaje */}
              <Box sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    ref={inputRef}
                    fullWidth
                    multiline
                    maxRows={3}
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={conversacionActiva ? 
                      "Escribe tu mensaje..." : 
                      "Selecciona o crea una conversación"
                    }
                    disabled={!conversacionActiva || !connected}
                    size="small"
                    className="chat-auditoria__input"
                  />
                  <Button
                    variant="contained"
                    onClick={handleEnviarMensaje}
                    disabled={!mensaje.trim() || !conversacionActiva || !connected}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    <SendIcon />
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Modal nueva conversación */}
      <Dialog
        open={modalNuevaConversacion}
        onClose={() => setModalNuevaConversacion(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nueva Conversación</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Título de la conversación"
              value={nuevaConversacion.titulo}
              onChange={(e) => setNuevaConversacion(prev => ({
                ...prev,
                titulo: e.target.value
              }))}
              fullWidth
            />
            <TextField
              label="Mensaje inicial"
              value={nuevaConversacion.mensaje_inicial}
              onChange={(e) => setNuevaConversacion(prev => ({
                ...prev,
                mensaje_inicial: e.target.value
              }))}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalNuevaConversacion(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCrearConversacion}
            variant="contained"
            disabled={!nuevaConversacion.titulo.trim()}
          >
            Crear Conversación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error display */}
      {error && (
        <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
          <Paper elevation={3} sx={{ p: 1, bgcolor: 'error.main', color: 'error.contrastText' }}>
            <Typography variant="caption">{error}</Typography>
            <IconButton size="small" onClick={limpiarError} sx={{ color: 'inherit', ml: 1 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Paper>
        </Box>
      )}
    </motion.div>
  );
};

export default ChatAuditoria;
