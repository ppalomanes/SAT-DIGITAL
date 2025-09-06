// Componente para mostrar usuarios conectados en tiempo real
// Sistema de comunicación asíncrona - Indicador de presencia

import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Badge,
  Chip,
  Collapse,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Circle as CircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import useChatStore from '../../../domains/comunicacion/store/useChatStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const UsuariosOnline = ({ compacto = false }) => {
  const [usuariosConectados, setUsuariosConectados] = useState([]);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [expandido, setExpandido] = useState(!compacto);

  const { socket, connected } = useChatStore();

  useEffect(() => {
    if (!socket || !connected) return;

    // Solicitar lista de usuarios conectados al conectarse
    socket.emit('get_connected_users');

    const handleUsuariosConectados = (usuarios) => {
      setUsuariosConectados(usuarios);
    };

    const handleUsuarioConectado = (usuario) => {
      setUsuariosConectados(prev => {
        // Evitar duplicados
        if (prev.find(u => u.id === usuario.id)) return prev;
        return [...prev, usuario];
      });
    };

    const handleUsuarioDesconectado = (usuarioId) => {
      setUsuariosConectados(prev => prev.filter(u => u.id !== usuarioId));
    };

    // Eventos del WebSocket
    socket.on('connected_users', handleUsuariosConectados);
    socket.on('user_connected', handleUsuarioConectado);
    socket.on('user_disconnected', handleUsuarioDesconectado);

    // Actualizar periódicamente
    const interval = setInterval(() => {
      socket.emit('get_connected_users');
    }, 30000); // Cada 30 segundos

    return () => {
      socket.off('connected_users', handleUsuariosConectados);
      socket.off('user_connected', handleUsuarioConectado);
      socket.off('user_disconnected', handleUsuarioDesconectado);
      clearInterval(interval);
    };
  }, [socket, connected]);

  const getRolColor = (rol) => {
    const colores = {
      admin: '#f44336',
      auditor_general: '#2196f3',
      auditor_interno: '#03a9f4',
      jefe_proveedor: '#4caf50',
      tecnico_proveedor: '#8bc34a',
      visualizador: '#ff9800'
    };
    return colores[rol] || '#9e9e9e';
  };

  const getRolLabel = (rol) => {
    const labels = {
      admin: 'Admin',
      auditor_general: 'Auditor',
      auditor_interno: 'Auditor Int.',
      jefe_proveedor: 'Jefe Prov.',
      tecnico_proveedor: 'Técnico',
      visualizador: 'Visualizador'
    };
    return labels[rol] || rol;
  };

  const usuariosMostrar = mostrarTodos ? usuariosConectados : usuariosConectados.slice(0, 5);

  if (compacto) {
    return (
      <Box sx={{ 
        position: 'fixed', 
        bottom: 80, 
        right: 24, 
        zIndex: 1000,
        width: 280
      }}>
        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge badgeContent={usuariosConectados.length} color="success">
                  <PersonIcon />
                </Badge>
                <Typography variant="subtitle2">Online</Typography>
              </Box>
            }
            action={
              <IconButton onClick={() => setExpandido(!expandido)} size="small">
                {expandido ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            }
            sx={{ pb: 0 }}
          />
          
          <Collapse in={expandido}>
            <CardContent sx={{ pt: 0, maxHeight: 300, overflow: 'auto' }}>
              <List dense>
                <AnimatePresence>
                  {usuariosMostrar.map(usuario => (
                    <motion.div
                      key={usuario.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Badge
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              <CircleIcon 
                                sx={{ 
                                  color: '#4caf50', 
                                  fontSize: 12,
                                  filter: 'drop-shadow(0 0 2px rgba(76, 175, 80, 0.7))'
                                }} 
                              />
                            }
                          >
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32,
                              bgcolor: getRolColor(usuario.rol),
                              fontSize: '0.875rem'
                            }}>
                              {usuario.nombre?.charAt(0)?.toUpperCase()}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" noWrap>
                              {usuario.nombre}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Chip
                                label={getRolLabel(usuario.rol)}
                                size="small"
                                sx={{
                                  height: 16,
                                  fontSize: '0.6rem',
                                  backgroundColor: getRolColor(usuario.rol),
                                  color: 'white'
                                }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {dayjs(usuario.conectadoEn).fromNow()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </List>

              {usuariosConectados.length > 5 && (
                <Box sx={{ textAlign: 'center', pt: 1 }}>
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setMostrarTodos(!mostrarTodos)}
                  >
                    {mostrarTodos ? 'Ver menos' : `Ver ${usuariosConectados.length - 5} más`}
                  </Typography>
                </Box>
              )}

              {usuariosConectados.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  {connected ? 'Solo tú estás conectado' : 'Desconectado'}
                </Typography>
              )}
            </CardContent>
          </Collapse>
        </Card>
      </Box>
    );
  }

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={usuariosConectados.length} color="success">
              <PersonIcon />
            </Badge>
            <Typography variant="h6">Usuarios Conectados</Typography>
          </Box>
        }
      />
      <CardContent>
        <List>
          <AnimatePresence>
            {usuariosMostrar.map(usuario => (
              <motion.div
                key={usuario.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <ListItem>
                  <ListItemAvatar>
                    <Tooltip title={`Conectado ${dayjs(usuario.conectadoEn).fromNow()}`}>
                      <Badge
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          <CircleIcon 
                            sx={{ 
                              color: '#4caf50', 
                              fontSize: 16,
                              filter: 'drop-shadow(0 0 3px rgba(76, 175, 80, 0.7))',
                              animation: 'pulse 2s infinite'
                            }} 
                          />
                        }
                      >
                        <Avatar sx={{ 
                          bgcolor: getRolColor(usuario.rol),
                          width: 40,
                          height: 40
                        }}>
                          {usuario.nombre?.charAt(0)?.toUpperCase()}
                        </Avatar>
                      </Badge>
                    </Tooltip>
                  </ListItemAvatar>
                  <ListItemText
                    primary={usuario.nombre}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={getRolLabel(usuario.rol)}
                          size="small"
                          sx={{
                            backgroundColor: getRolColor(usuario.rol),
                            color: 'white',
                            height: 20
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Conectado {dayjs(usuario.conectadoEn).fromNow()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </List>

        {usuariosConectados.length > 5 && (
          <Box sx={{ textAlign: 'center', pt: 2 }}>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer' }}
              onClick={() => setMostrarTodos(!mostrarTodos)}
            >
              {mostrarTodos ? 'Ver menos usuarios' : `Ver todos (${usuariosConectados.length})`}
            </Typography>
          </Box>
        )}

        {usuariosConectados.length === 0 && connected && (
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
            Solo tú estás conectado ahora
          </Typography>
        )}

        {!connected && (
          <Typography variant="body1" color="error" textAlign="center" sx={{ py: 2 }}>
            Desconectado del servidor
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default UsuariosOnline;