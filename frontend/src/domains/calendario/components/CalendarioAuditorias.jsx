import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  ButtonGroup,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  CalendarToday,
  Add,
  ViewWeek,
  ViewDay,
  ViewModule,
  Schedule
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { useCalendarioStore } from '../store/calendarioStore';
import { useAuthStore } from '../../auth/store/authStore';
import CalendarioMensual from './CalendarioMensual';
import ModalCrearPeriodo from './ModalCrearPeriodo';

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

dayjs.locale('es');

/**
 * Componente principal del calendario de auditorías
 */
function CalendarioAuditorias() {
  const { usuario } = useAuthStore();
  const {
    periodos,
    periodoActivo,
    asignaciones,
    loading,
    error,
    vistaCalendario,
    fechaSeleccionada,
    modalPeriodo,
    obtenerPeriodos,
    obtenerPeriodoActivo,
    obtenerAsignaciones,
    cambiarVista,
    cambiarFecha,
    abrirModalPeriodo,
    generarAuditorias,
    limpiarError
  } = useCalendarioStore();

  const [estadisticasCalendario, setEstadisticasCalendario] = useState(null);
  const [loadingGenerar, setLoadingGenerar] = useState(false);

  useEffect(() => {
    obtenerPeriodos();
    obtenerPeriodoActivo();
    obtenerAsignaciones();
  }, []);

  useEffect(() => {
    if (asignaciones.length > 0) {
      calcularEstadisticas();
    }
  }, [asignaciones]);

  const calcularEstadisticas = () => {
    const estadisticas = asignaciones.reduce((acc, asignacion) => {
      const estado = asignacion.estado_asignacion;
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    setEstadisticasCalendario({
      total: asignaciones.length,
      asignadas: estadisticas.asignado || 0,
      confirmadas: estadisticas.confirmado || 0,
      reagendadas: estadisticas.reagendado || 0,
      completadas: estadisticas.completado || 0
    });
  };

  const handleGenerarAuditorias = async () => {
    if (!periodoActivo?.id) return;

    try {
      setLoadingGenerar(true);
      await generarAuditorias(periodoActivo.id);
      await obtenerAsignaciones(); // Actualizar asignaciones
    } catch (error) {
      console.error('Error generando auditorías:', error);
    } finally {
      setLoadingGenerar(false);
    }
  };

  const datosGraficaEstados = {
    labels: ['Asignadas', 'Confirmadas', 'Reagendadas', 'Completadas'],
    datasets: [
      {
        label: 'Auditorías por Estado',
        data: [
          estadisticasCalendario?.asignadas || 0,
          estadisticasCalendario?.confirmadas || 0,
          estadisticasCalendario?.reagendadas || 0,
          estadisticasCalendario?.completadas || 0
        ],
        backgroundColor: [
          'rgba(108, 117, 125, 0.8)',
          'rgba(0, 123, 255, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(40, 167, 69, 0.8)'
        ],
        borderColor: [
          'rgb(108, 117, 125)',
          'rgb(0, 123, 255)',
          'rgb(255, 193, 7)',
          'rgb(40, 167, 69)'
        ],
        borderWidth: 1
      }
    ]
  };

  const opcionesGrafica = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  if (loading && !asignaciones.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box className="calendario-auditorias">
        {/* Header */}
        <Box className="calendario-auditorias__header" mb={3}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={2}>
                <CalendarToday color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h4" component="h1" fontWeight="bold">
                    Calendario de Auditorías
                  </Typography>
                  {periodoActivo && (
                    <Typography variant="body2" color="text.secondary">
                      Período Activo: {periodoActivo.nombre}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" gap={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                {usuario?.rol === 'admin' && (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={abrirModalPeriodo}
                      size="large"
                    >
                      Nuevo Período
                    </Button>
                    
                    {periodoActivo && periodoActivo.estado === 'planificacion' && (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<Schedule />}
                        onClick={handleGenerarAuditorias}
                        disabled={loadingGenerar}
                        size="large"
                      >
                        {loadingGenerar ? <CircularProgress size={20} /> : 'Generar Auditorías'}
                      </Button>
                    )}
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            onClose={limpiarError} 
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {/* Estadísticas rápidas */}
        {estadisticasCalendario && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <Card className="calendario-auditorias__stat-card">
                <CardContent sx={{ pb: '16px !important' }}>
                  <Typography color="text.secondary" variant="body2">
                    Total Auditorías
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {estadisticasCalendario.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ pb: '16px !important' }}>
                  <Typography color="text.secondary" variant="body2">
                    Confirmadas
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {estadisticasCalendario.confirmadas}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ pb: '16px !important' }}>
                  <Typography color="text.secondary" variant="body2">
                    Reagendadas
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {estadisticasCalendario.reagendadas}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ pb: '16px !important' }}>
                  <Typography color="text.secondary" variant="body2">
                    Completadas
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {estadisticasCalendario.completadas}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Controles de vista */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <ButtonGroup variant="outlined" color="primary">
                  <Button
                    variant={vistaCalendario === 'month' ? 'contained' : 'outlined'}
                    startIcon={<ViewModule />}
                    onClick={() => cambiarVista('month')}
                  >
                    Mes
                  </Button>
                  <Button
                    variant={vistaCalendario === 'week' ? 'contained' : 'outlined'}
                    startIcon={<ViewWeek />}
                    onClick={() => cambiarVista('week')}
                  >
                    Semana
                  </Button>
                  <Button
                    variant={vistaCalendario === 'day' ? 'contained' : 'outlined'}
                    startIcon={<ViewDay />}
                    onClick={() => cambiarVista('day')}
                  >
                    Día
                  </Button>
                </ButtonGroup>
              </Grid>

              <Grid item>
                <Typography variant="h6">
                  {dayjs(fechaSeleccionada).format('MMMM YYYY')}
                </Typography>
              </Grid>

              <Grid item xs>
                {estadisticasCalendario && (
                  <Box sx={{ height: 200, width: '100%' }}>
                    <Bar data={datosGraficaEstados} options={opcionesGrafica} />
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Vista del calendario */}
        <Card>
          <CardContent>
            {vistaCalendario === 'month' && (
              <CalendarioMensual 
                asignaciones={asignaciones}
                fechaSeleccionada={fechaSeleccionada}
                onFechaSeleccionada={cambiarFecha}
              />
            )}
            
            {vistaCalendario === 'week' && (
              <Typography variant="h6" textAlign="center" color="text.secondary">
                Vista semanal en desarrollo
              </Typography>
            )}
            
            {vistaCalendario === 'day' && (
              <Typography variant="h6" textAlign="center" color="text.secondary">
                Vista diaria en desarrollo
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Modal para crear período */}
        <ModalCrearPeriodo />
      </Box>
    </motion.div>
  );
}

export default CalendarioAuditorias;
