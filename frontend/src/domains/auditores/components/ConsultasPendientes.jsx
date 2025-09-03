/**
 * SAT-Digital Frontend - Consultas Pendientes
 * Checkpoint 2.5: Panel de Control para Auditores
 * 
 * Lista de consultas técnicas pendientes de respuesta
 */

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
  Avatar,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Reply as ReplyIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as PriorityIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

import useAuditoresStore from '../store/useAuditoresStore';

dayjs.extend(relativeTime);
dayjs.locale('es');

const ConsultasPendientes = () => {
  const navigate = useNavigate();
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  const {
    consultasPendientes,
    loading,
    error,
    obtenerConsultasPendientes,
    clearError
  } = useAuditoresStore();

  useEffect(() => {
    obtenerConsultasPendientes(paginaActual, itemsPorPagina);
  }, [paginaActual]);

  const handleCambiarPagina = (event, nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  const getPrioridadColor = (prioridad) => {
    const colores = {
      'urgente': 'error',
      'alta': 'warning', 
      'media': 'info',
      'baja': 'success'
    };
    return colores[prioridad] || 'default';
  };

  const getCategoriaIcon = (categoria) => {
    switch (categoria) {
      case 'tecnico': return <MessageIcon />;
      case 'administrativo': return <ScheduleIcon />;
      case 'solicitud': return <PriorityIcon />;
      default: return <MessageIcon />;
    }
  };

  const calcularTiempoSinRespuesta = (fechaActualizacion) => {
    return dayjs(fechaActualizacion).fromNow();
  };

  const esUrgente = (tiempoSinRespuesta) => {
    return tiempoSinRespuesta > 48; // Más de 48 horas
  };

  if (loading && consultasPendientes.consultas.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando consultas pendientes...
        </Typography>
      </Box>
    );
  }

  return (
    <div className="consultas-pendientes">
      <Card sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" component="h1" gutterBottom>
              Consultas Pendientes de Respuesta
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {consultasPendientes.pagination?.total_items || 0} consulta{consultasPendientes.pagination?.total_items !== 1 ? 's' : ''} pendiente{consultasPendientes.pagination?.total_items !== 1 ? 's' : ''}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<MessageIcon />}
            onClick={() => navigate('/comunicacion/chat')}
          >
            Ver Chat General
          </Button>
        </Box>

        {error && (
          <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Lista de consultas */}
        {consultasPendientes.consultas.length > 0 ? (
          <List>
            {consultasPendientes.consultas.map((consulta, index) => {
              const tiempoSinRespuesta = consulta.tiempo_sin_respuesta || 0;
              const esConsultaUrgente = esUrgente(tiempoSinRespuesta);

              return (
                <ListItem
                  key={consulta.id}
                  className="consultas-pendientes__item"
                  sx={{
                    border: 1,
                    borderColor: esConsultaUrgente ? 'error.main' : 'divider',
                    borderRadius: 1,
                    mb: 2,
                    backgroundColor: esConsultaUrgente ? 'error.light' : 'background.paper'
                  }}
                >
                  <Avatar
                    sx={{ 
                      mr: 2,
                      bgcolor: getPrioridadColor(consulta.prioridad) + '.main'
                    }}
                  >
                    {getCategoriaIcon(consulta.categoria)}
                  </Avatar>

                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="body1" fontWeight="medium">
                          {consulta.titulo}
                        </Typography>
                        
                        <Chip
                          label={consulta.prioridad}
                          size="small"
                          color={getPrioridadColor(consulta.prioridad)}
                          variant="filled"
                        />

                        {esConsultaUrgente && (
                          <Badge
                            badgeContent="¡Urgente!"
                            color="error"
                            variant="standard"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box mt={1}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Sitio:</strong> {consulta.auditoria?.sitio} • 
                          <strong> Proveedor:</strong> {consulta.auditoria?.proveedor}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Período:</strong> {consulta.auditoria?.periodo} • 
                          <strong> Iniciado por:</strong> {consulta.iniciada_por}
                        </Typography>

                        {consulta.ultimo_mensaje && (
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            fontStyle: 'italic',
                            mt: 1,
                            p: 1,
                            bgcolor: 'grey.100',
                            borderRadius: 1
                          }}>
                            <strong>Último mensaje:</strong> {consulta.ultimo_mensaje.contenido}
                            <br />
                            <small>por {consulta.ultimo_mensaje.autor} - {calcularTiempoSinRespuesta(consulta.ultimo_mensaje.fecha)}</small>
                          </Typography>
                        )}

                        <Box display="flex" alignItems="center" gap={2} mt={1}>
                          <Typography variant="caption" color={esConsultaUrgente ? 'error' : 'text.secondary'}>
                            Sin respuesta desde: {calcularTiempoSinRespuesta(consulta.updated_at)}
                          </Typography>
                          
                          <Chip
                            label={consulta.categoria}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </Box>
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Ver conversación completa">
                        <IconButton
                          edge="end"
                          onClick={() => navigate(`/comunicacion/conversacion/${consulta.id}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Responder consulta">
                        <IconButton
                          edge="end"
                          color="primary"
                          onClick={() => navigate(`/comunicacion/conversacion/${consulta.id}?responder=true`)}
                        >
                          <ReplyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Box textAlign="center" py={6}>
            <MessageIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay consultas pendientes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Todas las consultas técnicas han sido respondidas.
            </Typography>
          </Box>
        )}

        {/* Paginación */}
        {consultasPendientes.pagination && consultasPendientes.pagination.total_pages > 1 && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={consultasPendientes.pagination.total_pages}
              page={paginaActual}
              onChange={handleCambiarPagina}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Card>
    </div>
  );
};

export default ConsultasPendientes;
