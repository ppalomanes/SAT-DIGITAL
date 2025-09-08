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
  Tooltip,
  InputAdornment,
  Collapse,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Circle as CircleIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Check as CheckIcon,
  DoneAll as DoneAllIcon,
  Reply as ReplyIcon,
  SubdirectoryArrowRight as ThreadIcon
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
  
  // Estados para archivos adjuntos
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [previsualizandoArchivo, setPrevisualizandoArchivo] = useState(false);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
  
  // Estados para búsqueda y filtros
  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [buscarEnMensajes, setBuscarEnMensajes] = useState(false);
  const [mensajesBusqueda, setMensajesBusqueda] = useState([]);
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('reciente');

  // Estados para respuestas/threading
  const [mensajeRespuesta, setMensajeRespuesta] = useState(null);
  const [mostrarHilos, setMostrarHilos] = useState(new Set());
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
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
    enviarArchivo,
    setConversacionActiva,
    marcarMensajeComoLeido,
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

  // Marcar mensajes como leídos automáticamente cuando se ven
  useEffect(() => {
    if (conversacionActiva) {
      const mensajes = mensajesActivos.get(conversacionActiva) || [];
      const mensajesNoLeidos = mensajes.filter(mensaje => 
        mensaje.usuario_id !== usuario.id && 
        mensaje.estado_mensaje === 'enviado'
      );

      // Marcar mensajes como leídos después de un pequeño delay
      if (mensajesNoLeidos.length > 0) {
        const timeoutId = setTimeout(() => {
          mensajesNoLeidos.forEach(mensaje => {
            marcarMensajeComoLeido(mensaje.id);
          });
        }, 1000); // Delay de 1 segundo para simular "visualización"

        return () => clearTimeout(timeoutId);
      }
    }
  }, [conversacionActiva, mensajesActivos, usuario.id, marcarMensajeComoLeido]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnviarMensaje = async () => {
    if ((!mensaje.trim() && !archivoSeleccionado) || !conversacionActiva) return;

    try {
      setSubiendoArchivo(true);
      const respuestaAId = mensajeRespuesta?.id || null;

      if (archivoSeleccionado) {
        // Enviar archivo con posible respuesta
        await enviarArchivo(conversacionActiva, archivoSeleccionado, mensaje, respuestaAId);
        setArchivoSeleccionado(null);
        setPrevisualizandoArchivo(false);
      } else {
        // Enviar mensaje de texto con posible respuesta
        await enviarMensaje(conversacionActiva, mensaje, 'texto', respuestaAId);
      }
      
      setMensaje('');
      setMensajeRespuesta(null); // Limpiar respuesta después de enviar
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    } finally {
      setSubiendoArchivo(false);
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

  // Funciones para manejo de archivos
  const handleSeleccionarArchivo = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es muy grande. Máximo 10MB permitido.');
        return;
      }
      
      // Validar tipo de archivo
      const tiposPermitidos = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument', 'text/', '.xlsx', '.xls'];
      const esValido = tiposPermitidos.some(tipo => file.type.startsWith(tipo) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'));
      
      if (!esValido) {
        alert('Tipo de archivo no permitido. Solo se permiten imágenes, PDFs, documentos Word/Excel y archivos de texto.');
        return;
      }
      
      setArchivoSeleccionado(file);
      setPrevisualizandoArchivo(true);
    }
    // Limpiar input para permitir seleccionar el mismo archivo
    event.target.value = '';
  };

  const handleQuitarArchivo = () => {
    setArchivoSeleccionado(null);
    setPrevisualizandoArchivo(false);
  };

  const getFileIcon = (fileName, fileType) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon />;
    } else if (fileType === 'application/pdf') {
      return <PdfIcon />;
    } else if (fileType.startsWith('application/msword') || fileType.includes('document')) {
      return <DocIcon />;
    } else {
      return <FileIcon />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Funciones para threading/respuestas
  const handleResponderMensaje = (mensaje) => {
    setMensajeRespuesta(mensaje);
    inputRef.current?.focus();
  };

  const handleCancelarRespuesta = () => {
    setMensajeRespuesta(null);
  };

  const toggleMostrarHilo = (mensajeId) => {
    setMostrarHilos(prev => {
      const nuevos = new Set(prev);
      if (nuevos.has(mensajeId)) {
        nuevos.delete(mensajeId);
      } else {
        nuevos.add(mensajeId);
      }
      return nuevos;
    });
  };

  const obtenerRespuestasDeMensaje = (mensajeId) => {
    return mensajesConversacionActiva.filter(msg => msg.responde_a_mensaje_id === mensajeId);
  };

  const obtenerMensajeOriginal = (respuestaAMensajeId) => {
    return mensajesConversacionActiva.find(msg => msg.id === respuestaAMensajeId);
  };

  // Funciones de filtrado y búsqueda
  const filtrarConversaciones = () => {
    let conversacionesFiltradas = [...conversaciones];

    // Filtro por texto de búsqueda
    if (busquedaTexto.trim()) {
      const textoBusqueda = busquedaTexto.toLowerCase();
      conversacionesFiltradas = conversacionesFiltradas.filter(conversacion => {
        // Búsqueda en título y categoría
        const enTituloCategoria = conversacion.titulo.toLowerCase().includes(textoBusqueda) ||
                                 conversacion.categoria.toLowerCase().includes(textoBusqueda);
        
        // Búsqueda en mensajes si está habilitada
        if (buscarEnMensajes) {
          const mensajesConversacion = mensajesActivos.get(conversacion.id) || [];
          const enMensajes = mensajesConversacion.some(mensaje =>
            mensaje.contenido.toLowerCase().includes(textoBusqueda)
          );
          return enTituloCategoria || enMensajes;
        }
        
        return enTituloCategoria;
      });
    }

    // Filtro por categoría
    if (filtroCategoria !== 'todas') {
      conversacionesFiltradas = conversacionesFiltradas.filter(
        conversacion => conversacion.categoria === filtroCategoria
      );
    }

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      conversacionesFiltradas = conversacionesFiltradas.filter(
        conversacion => conversacion.estado === filtroEstado
      );
    }

    // Filtros por fecha
    if (filtroFechaDesde) {
      const fechaDesde = dayjs(filtroFechaDesde).startOf('day');
      conversacionesFiltradas = conversacionesFiltradas.filter(
        conversacion => dayjs(conversacion.created_at || conversacion.updated_at).isAfter(fechaDesde)
      );
    }
    
    if (filtroFechaHasta) {
      const fechaHasta = dayjs(filtroFechaHasta).endOf('day');
      conversacionesFiltradas = conversacionesFiltradas.filter(
        conversacion => dayjs(conversacion.created_at || conversacion.updated_at).isBefore(fechaHasta)
      );
    }

    // Ordenamiento
    conversacionesFiltradas.sort((a, b) => {
      const fechaA = new Date(a.updated_at || a.created_at);
      const fechaB = new Date(b.updated_at || b.created_at);
      
      switch (ordenarPor) {
        case 'reciente':
          return fechaB - fechaA; // Más reciente primero
        case 'antiguo':
          return fechaA - fechaB; // Más antiguo primero
        case 'alfabetico':
          return a.titulo.localeCompare(b.titulo);
        case 'categoria':
          return a.categoria.localeCompare(b.categoria);
        default:
          return fechaB - fechaA;
      }
    });

    return conversacionesFiltradas;
  };

  const limpiarFiltros = () => {
    setBusquedaTexto('');
    setFiltroCategoria('todas');
    setFiltroEstado('todos');
    setBuscarEnMensajes(false);
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
    setOrdenarPor('reciente');
  };

  const hayFiltrosActivos = () => {
    return busquedaTexto.trim() || filtroCategoria !== 'todas' || filtroEstado !== 'todos' || 
           buscarEnMensajes || filtroFechaDesde || filtroFechaHasta || ordenarPor !== 'reciente';
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

  // Función para obtener estado de lectura del mensaje
  const obtenerEstadoLectura = (mensaje) => {
    const esPropio = mensaje.usuario_id === usuario.id;
    if (!esPropio) return null; // Solo mostrar estados en mensajes propios
    
    // Usar estado real del backend
    if (mensaje.estado_mensaje === 'leido' && mensaje.leido_at) {
      return 'leido';
    } else if (mensaje.estado_mensaje === 'enviado') {
      return 'enviado';
    } else {
      // Si no hay estado específico, asumir que está siendo enviado
      return 'enviando';
    }
  };

  // Función para renderizar el indicador de estado de lectura
  const renderIndicadorLectura = (mensaje) => {
    const estado = obtenerEstadoLectura(mensaje);
    if (!estado) return null;

    const iconProps = {
      sx: { 
        fontSize: 12, 
        ml: 0.5,
        opacity: 0.7
      }
    };

    switch (estado) {
      case 'enviando':
        return (
          <Tooltip title="Enviando...">
            <CheckIcon {...iconProps} sx={{ ...iconProps.sx, color: 'grey.400' }} />
          </Tooltip>
        );
      case 'enviado':
        return (
          <Tooltip title="Enviado">
            <CheckIcon {...iconProps} sx={{ ...iconProps.sx, color: 'grey.600' }} />
          </Tooltip>
        );
      case 'leido':
        return (
          <Tooltip title="Leído">
            <DoneAllIcon {...iconProps} sx={{ ...iconProps.sx, color: 'primary.main' }} />
          </Tooltip>
        );
      default:
        return null;
    }
  };

  const mensajesConversacionActiva = conversacionActiva ? 
    mensajesActivos.get(conversacionActiva) || [] : [];

  // Filtrar mensajes principales (sin respuestas) para mostrar en orden cronológico
  const mensajesPrincipales = mensajesConversacionActiva.filter(mensaje => !mensaje.responde_a_mensaje_id);

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
                display: 'flex',
                flexDirection: 'column'
              }}
              elevation={0}
            >
              {/* Barra de búsqueda y filtros */}
              <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar conversaciones..."
                  value={busquedaTexto}
                  onChange={(e) => setBusquedaTexto(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: busquedaTexto && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setBusquedaTexto('')}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                {/* Botón de filtros */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                  <Button
                    size="small"
                    startIcon={<FilterListIcon />}
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Filtros
                  </Button>
                  {hayFiltrosActivos() && (
                    <Button
                      size="small"
                      color="error"
                      onClick={limpiarFiltros}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Limpiar
                    </Button>
                  )}
                </Box>

                {/* Panel de filtros colapsable */}
                <Collapse in={mostrarFiltros}>
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <FormControl size="small" sx={{ minWidth: 80 }}>
                        <InputLabel>Categoría</InputLabel>
                        <Select
                          value={filtroCategoria}
                          onChange={(e) => setFiltroCategoria(e.target.value)}
                          label="Categoría"
                        >
                          <MenuItem value="todas">Todas</MenuItem>
                          <MenuItem value="tecnico">Técnico</MenuItem>
                          <MenuItem value="administrativo">Administrativo</MenuItem>
                          <MenuItem value="solicitud">Solicitud</MenuItem>
                          <MenuItem value="problema">Problema</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <FormControl size="small" sx={{ minWidth: 80 }}>
                        <InputLabel>Estado</InputLabel>
                        <Select
                          value={filtroEstado}
                          onChange={(e) => setFiltroEstado(e.target.value)}
                          label="Estado"
                        >
                          <MenuItem value="todos">Todos</MenuItem>
                          <MenuItem value="activa">Activa</MenuItem>
                          <MenuItem value="cerrada">Cerrada</MenuItem>
                          <MenuItem value="pausada">Pausada</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Filtros por fecha */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        size="small"
                        label="Desde"
                        type="date"
                        value={filtroFechaDesde}
                        onChange={(e) => setFiltroFechaDesde(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        size="small"
                        label="Hasta"
                        type="date"
                        value={filtroFechaHasta}
                        onChange={(e) => setFiltroFechaHasta(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ flex: 1 }}
                      />
                    </Box>

                    {/* Ordenamiento */}
                    <FormControl size="small" fullWidth sx={{ mb: 1 }}>
                      <InputLabel>Ordenar por</InputLabel>
                      <Select
                        value={ordenarPor}
                        onChange={(e) => setOrdenarPor(e.target.value)}
                        label="Ordenar por"
                      >
                        <MenuItem value="reciente">Más reciente</MenuItem>
                        <MenuItem value="antiguo">Más antiguo</MenuItem>
                        <MenuItem value="alfabetico">A-Z</MenuItem>
                        <MenuItem value="categoria">Por categoría</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Opciones de búsqueda */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={buscarEnMensajes}
                          onChange={(e) => setBuscarEnMensajes(e.target.checked)}
                          size="small"
                        />
                      }
                      label="Buscar en mensajes"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Box>
                </Collapse>
              </Box>

              {/* Lista de conversaciones filtradas */}
              <List dense sx={{ flexGrow: 1, overflow: 'auto' }}>
                {filtrarConversaciones().map((conversacion) => (
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
                
                {filtrarConversaciones().length === 0 && !loading && (
                  <ListItem>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {conversaciones.length === 0 ? 
                        "No hay conversaciones. Haz clic en + para crear una nueva." :
                        "No hay conversaciones que coincidan con los filtros."
                      }
                    </Typography>
                  </ListItem>
                )}

                {/* Indicador de filtros activos */}
                {hayFiltrosActivos() && filtrarConversaciones().length > 0 && (
                  <Box sx={{ p: 1, bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                      Mostrando {filtrarConversaciones().length} de {conversaciones.length} conversaciones
                    </Typography>
                  </Box>
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
                  {mensajesPrincipales.map((mensaje) => {
                    const respuestas = obtenerRespuestasDeMensaje(mensaje.id);
                    const tieneRespuestas = respuestas.length > 0;
                    const mostrandoHilo = mostrarHilos.has(mensaje.id);
                    
                    return (
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
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              {mensaje.usuario?.nombre || 'Usuario'} • {dayjs(mensaje.created_at).format('HH:mm')}
                            </Typography>
                            {renderIndicadorLectura(mensaje)}
                          </Box>
                          
                          {mensaje.tipo_mensaje === 'archivo' ? (
                            <Box>
                              {/* Información del archivo */}
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 1,
                                  p: 1,
                                  borderRadius: 1,
                                  bgcolor: mensaje.usuario_id === usuario.id ? 
                                    'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                  mb: mensaje.contenido ? 1 : 0,
                                  cursor: 'pointer'
                                }}
                                onClick={() => {
                                  if (mensaje.archivo_adjunto) {
                                    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
                                    window.open(`${baseUrl}${mensaje.archivo_adjunto}`, '_blank');
                                  }
                                }}
                              >
                                {mensaje.archivo_info ? 
                                  getFileIcon(mensaje.archivo_info.nombre_original, mensaje.archivo_info.tipo_mime) :
                                  <FileIcon />
                                }
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                  <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                                    {mensaje.archivo_info?.nombre_original || 'Archivo adjunto'}
                                  </Typography>
                                  {mensaje.archivo_info?.tamaño && (
                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                      {formatFileSize(mensaje.archivo_info.tamaño)}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              
                              {/* Mensaje de texto adicional */}
                              {mensaje.contenido && !mensaje.contenido.startsWith('📎') && (
                                <Typography variant="body2">
                                  {mensaje.contenido}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2">
                              {mensaje.contenido}
                            </Typography>
                          )}
                          
                          {/* Botones de acción del mensaje */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleResponderMensaje(mensaje)}
                              sx={{ 
                                opacity: 0.7,
                                '&:hover': { opacity: 1, bgcolor: 'action.hover' }
                              }}
                            >
                              <ReplyIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                            
                            {tieneRespuestas && (
                              <IconButton
                                size="small"
                                onClick={() => toggleMostrarHilo(mensaje.id)}
                                sx={{ 
                                  opacity: 0.7,
                                  '&:hover': { opacity: 1, bgcolor: 'action.hover' }
                                }}
                              >
                                <ThreadIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            )}
                            
                            {tieneRespuestas && (
                              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                {respuestas.length} respuesta{respuestas.length !== 1 ? 's' : ''}
                              </Typography>
                            )}
                          </Box>
                        </Paper>
                      </Box>

                      {/* Hilo de respuestas */}
                      {tieneRespuestas && mostrandoHilo && (
                        <Box sx={{ ml: 6, mt: 1 }}>
                          {respuestas.map((respuesta) => (
                            <motion.div
                              key={`respuesta-${respuesta.id}`}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              style={{ marginBottom: '8px' }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: respuesta.usuario_id === usuario.id ? 'row-reverse' : 'row',
                                  alignItems: 'flex-start',
                                  gap: 1
                                }}
                              >
                                <Avatar
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    bgcolor: getRoleColor(respuesta.usuario?.rol || 'proveedor'),
                                    fontSize: 12
                                  }}
                                >
                                  <PersonIcon sx={{ fontSize: 12 }} />
                                </Avatar>
                                
                                <Paper
                                  elevation={1}
                                  sx={{
                                    p: 1,
                                    maxWidth: '80%',
                                    bgcolor: respuesta.usuario_id === usuario.id ? 
                                      'primary.light' : 'grey.50',
                                    color: 'text.primary'
                                  }}
                                >
                                  <Typography variant="caption" display="block" sx={{ opacity: 0.8, mb: 0.5 }}>
                                    {respuesta.usuario?.nombre || 'Usuario'} • {dayjs(respuesta.created_at).format('HH:mm')}
                                    {renderIndicadorLectura(respuesta)}
                                  </Typography>
                                  
                                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                    {respuesta.contenido}
                                  </Typography>
                                </Paper>
                              </Box>
                            </motion.div>
                          ))}
                        </Box>
                      )}
                    </motion.div>
                  );})}
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

              {/* Preview de respuesta */}
              {mensajeRespuesta && (
                <Box sx={{ p: 1, bgcolor: 'primary.light', borderBottom: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReplyIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="caption" sx={{ color: 'primary.main' }}>
                        Respondiendo a {mensajeRespuesta.usuario?.nombre || 'Usuario'}
                      </Typography>
                      <Typography variant="body2" noWrap sx={{ opacity: 0.8 }}>
                        {mensajeRespuesta.contenido}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={handleCancelarRespuesta}
                      color="primary"
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>
              )}

              {/* Preview del archivo seleccionado */}
              {archivoSeleccionado && (
                <Box sx={{ p: 1, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getFileIcon(archivoSeleccionado.name, archivoSeleccionado.type)}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap>
                        {archivoSeleccionado.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(archivoSeleccionado.size)}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={handleQuitarArchivo}
                      color="error"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              )}

              {/* Input de mensaje */}
              <Box sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    onChange={handleSeleccionarArchivo}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  />
                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!conversacionActiva || !connected || subiendoArchivo}
                    color="primary"
                    size="small"
                  >
                    <AttachFileIcon />
                  </IconButton>
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
                    disabled={(!mensaje.trim() && !archivoSeleccionado) || !conversacionActiva || !connected || subiendoArchivo}
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
