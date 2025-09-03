/**
 * SAT-Digital Frontend - Dashboard de Auditores
 * Checkpoint 2.5: Panel de Control para Auditores
 * 
 * Dashboard personalizado con estadísticas, alertas y próximas visitas
 */

import { useEffect, useState } from 'react';
import {
  Card,
  Grid,
  Typography,
  Box,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  PendingActions as PendingIcon,
  Upload as UploadIcon,
  RateReview as ReviewIcon,
  Chat as ChatIcon,
  CalendarMonth as CalendarIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

import useAuditoresStore from '../store/useAuditoresStore';

dayjs.locale('es');

const DashboardAuditores = () => {
  const navigate = useNavigate();
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  const {
    dashboardData,
    loading,
    error,
    obtenerDashboard,
    refrescarDatos,
    clearError
  } = useAuditoresStore();

  useEffect(() => {
    obtenerDashboard();
  }, []);

  // Auto-refresh cada 5 minutos si está activado
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        obtenerDashboard();
      }, 5 * 60 * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleRefresh = async () => {
    await refrescarDatos();
  };

  const renderEstadisticaCard = (titulo, valor, icono, color = 'primary', accion = null) => (
    <Card 
      className="dashboard-auditores__estadistica-card"
      sx={{ 
        height: '100%',
        cursor: accion ? 'pointer' : 'default',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: accion ? 'translateY(-2px)' : 'none',
          boxShadow: accion ? 3 : 1
        }
      }}
      onClick={accion}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              backgroundColor: `${color}.main`, 
              color: 'white', 
              p: 1.5, 
              borderRadius: 2,
              mr: 2
            }}
          >
            {icono}
          </Box>
          <Typography variant="h6" component="div">
            {titulo}
          </Typography>
        </Box>
        <Typography variant="h3" color={`${color}.main`} fontWeight="bold">
          {valor}
        </Typography>
      </Box>
    </Card>
  );

  const getAlertIcon = (tipo) => {
    switch (tipo) {
      case 'warning': return <WarningIcon />;
      case 'info': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  const getAlertSeverity = (tipo) => {
    switch (tipo) {
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  const formatearFecha = (fecha) => {
    return dayjs(fecha).format('DD/MM/YYYY');
  };

  const calcularDiasRestantes = (fecha) => {
    const dias = dayjs(fecha).diff(dayjs(), 'days');
    if (dias < 0) return 'Vencida';
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Mañana';
    return `${dias} días`;
  };

  if (loading && !dashboardData.auditor) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <div className="dashboard-auditores">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1" gutterBottom>
            Panel de Control - Auditorías
          </Typography>
          
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Actualizar
            </Button>
            
            <Button
              variant={autoRefresh ? 'contained' : 'outlined'}
              color={autoRefresh ? 'success' : 'primary'}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
          </Box>
        </Box>

        {dashboardData.auditor && (
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Bienvenido, <strong>{dashboardData.auditor.nombre}</strong>
          </Typography>
        )}
      </Paper>

      {error && (
        <Alert 
          severity="error" 
          onClose={clearError}
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={clearError}>
              Cerrar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Alertas importantes */}
      {dashboardData.alertas?.length > 0 && (
        <Box mb={3}>
          {dashboardData.alertas.map((alerta, index) => (
            <Alert
              key={index}
              severity={getAlertSeverity(alerta.tipo)}
              icon={getAlertIcon(alerta.tipo)}
              sx={{ mb: 1 }}
            >
              <Typography variant="body1">
                {alerta.mensaje}
              </Typography>
            </Alert>
          ))}
        </Box>
      )}

      {/* Estadísticas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          {renderEstadisticaCard(
            'Total Asignadas',
            dashboardData.estadisticas?.total_asignadas || 0,
            <AssignmentIcon />,
            'primary',
            () => navigate('/auditores/mis-auditorias')
          )}
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          {renderEstadisticaCard(
            'Pendientes',
            dashboardData.estadisticas?.pendientes || 0,
            <PendingIcon />,
            'warning',
            () => navigate('/auditores/mis-auditorias?estado=programada')
          )}
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          {renderEstadisticaCard(
            'En Carga',
            dashboardData.estadisticas?.en_carga || 0,
            <UploadIcon />,
            'info',
            () => navigate('/auditores/mis-auditorias?estado=en_carga')
          )}
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          {renderEstadisticaCard(
            'P. Evaluación',
            dashboardData.estadisticas?.pendiente_evaluacion || 0,
            <ReviewIcon />,
            'error',
            () => navigate('/auditores/mis-auditorias?estado=pendiente_evaluacion')
          )}
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          {renderEstadisticaCard(
            'Consultas',
            dashboardData.estadisticas?.consultas_pendientes || 0,
            <ChatIcon />,
            'secondary',
            () => navigate('/auditores/consultas-pendientes')
          )}
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          {renderEstadisticaCard(
            'Este Mes',
            dashboardData.estadisticas?.mes_actual || 0,
            <CalendarIcon />,
            'success'
          )}
        </Grid>
      </Grid>

      {/* Próximas visitas */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Próximas Visitas Programadas
          </Typography>
          
          {dashboardData.proximas_visitas?.length > 0 ? (
            <List>
              {dashboardData.proximas_visitas.map((visita, index) => {
                const diasRestantes = calcularDiasRestantes(visita.fecha_programada);
                const esUrgente = dayjs(visita.fecha_programada).diff(dayjs(), 'days') <= 3;
                
                return (
                  <ListItem
                    key={index}
                    className="dashboard-auditores__visita-item"
                    sx={{
                      border: 1,
                      borderColor: esUrgente ? 'error.main' : 'divider',
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: esUrgente ? 'error.light' : 'transparent'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="body1" fontWeight="medium">
                            {visita.sitio}
                          </Typography>
                          <Chip
                            label={diasRestantes}
                            size="small"
                            color={esUrgente ? 'error' : 'primary'}
                            variant={esUrgente ? 'filled' : 'outlined'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {visita.proveedor} • {visita.localidad}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Fecha: {formatearFecha(visita.fecha_programada)} • Estado: {visita.estado}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => navigate(`/auditores/revision/${visita.id}`)}
                        title="Ver detalles"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              No hay visitas programadas en los próximos 30 días
            </Typography>
          )}
        </Box>
      </Card>

      {/* Acciones rápidas */}
      <Card>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Acciones Rápidas
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AssignmentIcon />}
                onClick={() => navigate('/auditores/mis-auditorias')}
                sx={{ py: 2 }}
              >
                Ver Mis Auditorías
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ChatIcon />}
                onClick={() => navigate('/auditores/consultas-pendientes')}
                sx={{ py: 2 }}
              >
                Consultas Pendientes
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ReviewIcon />}
                onClick={() => navigate('/auditores/mis-auditorias?estado=pendiente_evaluacion')}
                sx={{ py: 2 }}
              >
                Evaluar Auditorías
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CalendarIcon />}
                onClick={() => navigate('/calendario')}
                sx={{ py: 2 }}
              >
                Ver Calendario
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </div>
  );
};

export default DashboardAuditores;
