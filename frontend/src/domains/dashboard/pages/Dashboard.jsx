import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  useTheme,
  alpha,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useAuthStore } from '../../auth/store/authStore';
import { periodoService } from '../../calendario/services/periodoService';
import WorkflowMetrics from '../components/WorkflowMetrics';
import ProgressIndicator from '../../../shared/components/Progress/ProgressIndicator';
import { useWorkflow } from '../../../shared/hooks/useWorkflow';
import DashboardProveedores from '../../proveedores/components/DashboardProveedores';
import { formatDate, formatRelative } from '../../../shared/utils/dateHelpers';
import { getEstadoStyle } from '../../../shared/utils/statusHelpers';
import { MOCK_DASHBOARD_DATA } from '../mocks/dashboardData';

// Usar mock data separado (importado desde archivo dedicado)
const MOCK_DATA = MOCK_DASHBOARD_DATA;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const [periodoActivo, setPeriodoActivo] = useState(null);
  
  const theme = useTheme();
  const { usuario } = useAuthStore();
  
  // Si el usuario es proveedor, mostrar dashboard específico
  if (usuario?.rol === 'jefe_proveedor' || usuario?.rol === 'tecnico_proveedor') {
    return <DashboardProveedores />;
  }
  
  // Hook de workflow para métricas globales
  const { 
    metricas, 
    obtenerMetricas,
    metricasFormateadas,
    loading: workflowLoading 
  } = useWorkflow();

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    try {
      // Cargar período activo
      const periodo = await periodoService.obtenerPeriodoActivo();
      setPeriodoActivo(periodo.data);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  // Usar helper centralizado de estados (reemplaza lógica duplicada)
  const getEstadoColorLocal = (estado) => {
    const { color, backgroundColor } = getEstadoStyle(estado);
    return { color, bg: backgroundColor };
  };

  const getTendenciaIcon = (tendencia) => {
    return tendencia === 'up' ? 
      <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} /> :
      <TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />;
  };

  const getAlertIcon = (tipo) => {
    switch (tipo) {
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'info': return <CheckCircleIcon color="info" />;
      default: return <CheckCircleIcon />;
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setUltimaActualizacion(new Date());
    cargarDatosDashboard();
  };

  if (loading) {
    return (
      <Box className="dashboard-loading" display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
        <DashboardIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
        <Typography variant="h6" color="primary">
          Cargando dashboard...
        </Typography>
        <LinearProgress sx={{ width: 200, mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box className="dashboard">
      <Box className="dashboard__header" mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Bienvenido, {usuario?.nombre?.split(' ')[0] || 'Usuario'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Aquí tienes un resumen del estado actual de las auditorías técnicas.
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="caption" color="text.secondary">
              Última actualización: {dayjs(ultimaActualizacion).format('HH:mm:ss')}
            </Typography>
            <Tooltip title="Actualizar datos">
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Información del período activo */}
      {periodoActivo && (
        <Box mb={3}>
          <Card sx={{ 
            border: `2px solid ${theme.palette.primary.main}`, 
            backgroundColor: alpha(theme.palette.primary.main, 0.05) 
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ScheduleIcon sx={{ color: theme.palette.primary.main, fontSize: 30 }} />
                <Box flex={1}>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    Período Activo: {periodoActivo.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Código: {periodoActivo.codigo} | 
                    Desde: {dayjs(periodoActivo.fecha_inicio).format('DD/MM/YYYY')} | 
                    Hasta: {dayjs(periodoActivo.fecha_fin_visitas).format('DD/MM/YYYY')}
                  </Typography>
                </Box>
                <Chip
                  label={periodoActivo.estado.toUpperCase()}
                  color="primary"
                  variant="filled"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Métricas del Workflow */}
      <WorkflowMetrics />

      <Grid container spacing={3} sx={{ mt: 2 }}>

        {/* Sección de Métricas de Workflow */}
        <Grid item xs={12} md={6} lg={4}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" mb={2} color="text.primary">
                Estado del Workflow
              </Typography>
              
              {metricas && !workflowLoading ? (
                <Box>
                  {/* Resumen rápido */}
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {metricas.global?.programadas || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Programadas
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h4" color="warning.main" fontWeight="bold">
                        {metricas.global?.en_carga || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        En Carga
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        {metricas.global?.cerradas || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Cerradas
                      </Typography>
                    </Box>
                  </Box>

                  {/* Botón para ver detalles */}
                  <Button 
                    variant="outlined" 
                    size="small" 
                    fullWidth
                    onClick={() => obtenerMetricas()}
                    startIcon={<RefreshIcon />}
                  >
                    Actualizar Métricas
                  </Button>
                </Box>
              ) : (
                <Box>
                  <LinearProgress sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Cargando métricas de workflow...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" mb={2} color="text.primary">
                Actividad Reciente
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={1.5}>
                {MOCK_DATA.auditorias_recientes.slice(0, 3).map((auditoria) => {
                  const estadoStyle = getEstadoColorLocal(auditoria.estado);
                  return (
                    <Box 
                      key={auditoria.id}
                      display="flex" 
                      alignItems="center" 
                      justifyContent="space-between"
                      py={1.5}
                      px={2}
                      sx={{ 
                        borderLeft: `3px solid ${estadoStyle.color}`,
                        backgroundColor: `${estadoStyle.color}08`,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: `${estadoStyle.color}15`
                        }
                      }}
                    >
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight="500" color="text.primary">
                          {auditoria.proveedor}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {auditoria.sitio} • {dayjs(auditoria.fecha).format('DD/MM')}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="caption" color="text.secondary">
                          {auditoria.progreso}%
                        </Typography>
                        <Chip
                          label={auditoria.estado}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            backgroundColor: estadoStyle.color,
                            color: 'white'
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" mb={2} color="text.primary">
                Panel de Control
              </Typography>
              
              {/* Acciones Rápidas Minimalistas */}
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" mb={1.5} sx={{ fontSize: '0.8rem' }}>
                  ACCIONES RÁPIDAS
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  {MOCK_DATA.acciones_rapidas.slice(0, 3).map((accion) => (
                    <Box
                      key={accion.id}
                      display="flex"
                      alignItems="center"
                      gap={1.5}
                      py={1}
                      px={1.5}
                      sx={{
                        borderRadius: 1,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          transform: 'translateX(2px)'
                        }
                      }}
                    >
                      <Box sx={{ color: theme.palette.primary.main }}>
                        {accion.icono}
                      </Box>
                      <Typography variant="body2" fontWeight="500">
                        {accion.titulo}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Alertas Minimalistas */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" mb={1.5} sx={{ fontSize: '0.8rem' }}>
                  ALERTAS RECIENTES
                </Typography>
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {MOCK_DATA.alertas_criticas.slice(0, 2).map((alerta) => (
                    <Box
                      key={alerta.id}
                      display="flex"
                      alignItems="flex-start"
                      gap={1.5}
                      py={1.5}
                      px={1.5}
                      sx={{
                        borderRadius: 1,
                        backgroundColor: alerta.tipo === 'error' ? 
                          alpha(theme.palette.error.main, 0.08) :
                          alerta.tipo === 'warning' ?
                          alpha(theme.palette.warning.main, 0.08) :
                          alpha(theme.palette.info.main, 0.08),
                        borderLeft: `3px solid ${
                          alerta.tipo === 'error' ? theme.palette.error.main :
                          alerta.tipo === 'warning' ? theme.palette.warning.main :
                          theme.palette.info.main
                        }`
                      }}
                    >
                      <Box flex={1}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.3 }}>
                          {alerta.mensaje}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {alerta.fecha}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Dashboard;