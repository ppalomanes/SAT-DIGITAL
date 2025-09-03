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
import { useAuthStore } from '../../auth/store/authStore';
import { periodoService } from '../../calendario/services/periodoService';
import dayjs from 'dayjs';

const MOCK_DATA = {
  metricas_principales: {
    total_auditorias: { valor: 12, cambio: +12, tendencia: 'up' },
    proveedores_activos: { valor: 5, cambio: +2.5, tendencia: 'up' },
    completadas: { valor: 8, cambio: +18, tendencia: 'up' },
    pendientes: { valor: 4, cambio: -5, tendencia: 'down' }
  },
  
  auditorias_recientes: [
    {
      id: 1,
      proveedor: 'Grupo Activo SRL',
      sitio: 'ACTIVO - Florida 141',
      estado: 'Completada',
      progreso: 100,
      auditor: 'JP',
      auditor_nombre: 'Juan Pérez',
      fecha: '2025-01-14',
      puntaje: 95
    },
    {
      id: 2,
      proveedor: 'APEX America',
      sitio: 'APEX CBA',
      estado: 'En progreso',
      progreso: 75,
      auditor: 'MG',
      auditor_nombre: 'María González',
      fecha: '2025-01-17',
      puntaje: null
    },
    {
      id: 3,
      proveedor: 'Teleperformance',
      sitio: 'TELEPERFORMANCE RES',
      estado: 'Pendiente',
      progreso: 30,
      auditor: 'CL',
      auditor_nombre: 'Carlos López',
      fecha: '2025-01-19',
      puntaje: null
    },
    {
      id: 4,
      proveedor: 'CAT Technologies',
      sitio: 'CAT-TECHNOLOGIES',
      estado: 'Revisión',
      progreso: 90,
      auditor: 'AM',
      auditor_nombre: 'Ana Martín',
      fecha: '2025-01-21',
      puntaje: 88
    }
  ],

  acciones_rapidas: [
    {
      id: 'programar',
      titulo: 'Programar auditoría',
      descripcion: 'Crear nueva auditoría para el período',
      icono: <AssignmentIcon />,
      accion: '/auditorias/nueva'
    },
    {
      id: 'proveedores',
      titulo: 'Gestionar proveedores',
      descripcion: 'Administrar proveedores y sitios',
      icono: <BusinessIcon />,
      accion: '/proveedores'
    },
    {
      id: 'reportes',
      titulo: 'Ver reportes',
      descripcion: 'Generar informes y estadísticas',
      icono: <TrendingUpIcon />,
      accion: '/reportes'
    },
    {
      id: 'configuracion',
      titulo: 'Configurar sistema',
      descripcion: 'Ajustar parámetros del sistema',
      icono: <FilterIcon />,
      accion: '/configuracion'
    }
  ],

  alertas_criticas: [
    {
      id: 1,
      tipo: 'warning',
      mensaje: 'APEX CBA - Documentos vencen en 2 días',
      fecha: dayjs().subtract(2, 'hours').format('HH:mm')
    },
    {
      id: 2,
      tipo: 'error',
      mensaje: 'Konecta ROS - Sin respuesta del proveedor',
      fecha: dayjs().subtract(1, 'day').format('DD/MM')
    },
    {
      id: 3,
      tipo: 'info',
      mensaje: 'Grupo Activo - Auditoría completada',
      fecha: dayjs().subtract(3, 'hours').format('HH:mm')
    }
  ]
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const [periodoActivo, setPeriodoActivo] = useState(null);
  
  const theme = useTheme();
  const { usuario } = useAuthStore();

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

  const getEstadoColor = (estado) => {
    switch (estado.toLowerCase()) {
      case 'completada':
        return { color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) };
      case 'en progreso':
        return { color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.1) };
      case 'pendiente':
        return { color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1) };
      case 'revisión':
        return { color: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.1) };
      default:
        return { color: theme.palette.text.secondary, bg: alpha(theme.palette.text.secondary, 0.1) };
    }
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

      <Grid container spacing={3}>
        
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {Object.entries(MOCK_DATA.metricas_principales).map(([key, metrica]) => (
              <Grid item xs={12} sm={6} md={3} key={key}>
                <Card className="dashboard__metric-card">
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          {key.replace('_', ' ').charAt(0).toUpperCase() + key.replace('_', ' ').slice(1)}
                        </Typography>
                        <Typography variant="h4" component="h2" fontWeight="bold">
                          {metrica.valor}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        {getTendenciaIcon(metrica.tendencia)}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            ml: 0.5,
                            color: metrica.tendencia === 'up' ? theme.palette.success.main : theme.palette.error.main,
                            fontWeight: 'bold'
                          }}
                        >
                          {metrica.cambio > 0 ? '+' : ''}{metrica.cambio}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card className="dashboard__recent-audits">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="h3" fontWeight="bold">
                  Auditorías recientes
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Estado actual de las auditorías en curso
                </Typography>
              </Box>

              <List>
                {MOCK_DATA.auditorias_recientes.map((auditoria, index) => {
                  const estadoStyle = getEstadoColor(auditoria.estado);
                  
                  return (
                    <ListItem 
                      key={auditoria.id}
                      className="dashboard__audit-item"
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: 'background.paper'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: estadoStyle.color }}>
                          {auditoria.auditor}
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {auditoria.proveedor}
                            </Typography>
                            <Chip 
                              label={auditoria.estado}
                              size="small"
                              sx={{
                                backgroundColor: estadoStyle.bg,
                                color: estadoStyle.color,
                                fontWeight: 'bold'
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box mt={1}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {auditoria.sitio} • {auditoria.auditor_nombre}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Box flex={1}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={auditoria.progreso}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: alpha(estadoStyle.color, 0.2),
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: estadoStyle.color
                                    }
                                  }}
                                />
                              </Box>
                              <Typography variant="caption" fontWeight="bold">
                                {auditoria.progreso}%
                              </Typography>
                              {auditoria.puntaje && (
                                <Chip 
                                  label={`${auditoria.puntaje}pts`}
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                      
                      <Box textAlign="right">
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(auditoria.fecha).format('DD/MM/YYYY')}
                        </Typography>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            
            <Grid item xs={12}>
              <Card className="dashboard__quick-actions">
                <CardContent>
                  <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                    Acciones rápidas
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {MOCK_DATA.acciones_rapidas.map((accion) => (
                      <Grid item xs={6} key={accion.id}>
                        <Paper
                          className="dashboard__action-card"
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: `1px solid ${theme.palette.divider}`,
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: theme.shadows[8],
                              backgroundColor: alpha(theme.palette.primary.main, 0.05)
                            }
                          }}
                        >
                          <Box sx={{ color: theme.palette.primary.main, mb: 1 }}>
                            {accion.icono}
                          </Box>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            {accion.titulo}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {accion.descripcion}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card className="dashboard__alerts">
                <CardContent>
                  <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                    Alertas del sistema
                  </Typography>
                  
                  <List sx={{ p: 0 }}>
                    {MOCK_DATA.alertas_criticas.map((alerta) => (
                      <ListItem 
                        key={alerta.id}
                        sx={{ 
                          px: 0, 
                          py: 1,
                          borderBottom: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <ListItemAvatar>
                          {getAlertIcon(alerta.tipo)}
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              {alerta.mensaje}
                            </Typography>
                          }
                          secondary={alerta.fecha}
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    size="small" 
                    sx={{ mt: 2 }}
                  >
                    Ver todas las alertas
                  </Button>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Dashboard;