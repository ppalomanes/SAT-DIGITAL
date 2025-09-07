import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../../shared/services/apiClient';

const WorkflowMetrics = () => {
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchMetricas = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/auditorias/metricas-workflow');
      
      if (response.data.success) {
        setMetricas(response.data.data);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setError('Error obteniendo métricas');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error conectando con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricas();
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(fetchMetricas, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (estado) => {
    const colores = {
      programada: '#9e9e9e',
      en_carga: '#2196f3', 
      pendiente_evaluacion: '#ff9800',
      evaluada: '#4caf50',
      cerrada: '#607d8b'
    };
    return colores[estado] || '#9e9e9e';
  };

  const getStatusIcon = (estado) => {
    const iconos = {
      programada: <ScheduleIcon />,
      en_carga: <TrendingUpIcon />,
      pendiente_evaluacion: <WarningIcon />,
      evaluada: <CheckCircleIcon />,
      cerrada: <AssessmentIcon />
    };
    return iconos[estado] || <ScheduleIcon />;
  };

  const calcularPorcentaje = (valor, total) => {
    if (total === 0) return 0;
    return Math.round((valor / total) * 100);
  };

  if (loading && !metricas) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Cargando métricas...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={fetchMetricas}
            startIcon={<RefreshIcon />}
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { workflow_metricas: metrics } = metricas;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader
            title={
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h5" component="div">
                  📊 Métricas del Workflow
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {loading && <CircularProgress size={20} />}
                  <Button
                    size="small"
                    onClick={fetchMetricas}
                    startIcon={<RefreshIcon />}
                    disabled={loading}
                  >
                    Actualizar
                  </Button>
                </Box>
              </Box>
            }
            subheader={
              lastUpdate && (
                <Typography variant="caption" color="text.secondary">
                  Última actualización: {lastUpdate.toLocaleTimeString()}
                </Typography>
              )
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              {/* Resumen General */}
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <AssessmentIcon color="primary" />
                  <Typography variant="h6">
                    Total de Auditorías: {metrics.total}
                  </Typography>
                </Box>
                <Divider />
              </Grid>

              {/* Métricas por Estado - Diseño Compacto */}
              {Object.entries(metrics)
                .filter(([key]) => key !== 'total')
                .map(([estado, cantidad]) => (
                  <Grid item xs={12} sm={6} lg={2.4} key={estado}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          height: 140,
                          borderLeft: `4px solid ${getStatusColor(estado)}`,
                          borderTop: 'none',
                          borderRight: 'none', 
                          borderBottom: 'none',
                          '&:hover': {
                            boxShadow: 3,
                            backgroundColor: `${getStatusColor(estado)}08`
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Box sx={{ color: getStatusColor(estado) }}>
                              {getStatusIcon(estado)}
                            </Box>
                            <Typography 
                              variant="h4" 
                              component="div" 
                              color={getStatusColor(estado)}
                              sx={{ fontWeight: 'bold', lineHeight: 1 }}
                            >
                              {cantidad}
                            </Typography>
                          </Box>

                          <Typography 
                            variant="body2" 
                            color="text.primary"
                            sx={{ 
                              fontWeight: 500,
                              mb: 1,
                              fontSize: '0.85rem',
                              lineHeight: 1.2
                            }}
                          >
                            {estado.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </Typography>

                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <LinearProgress
                              variant="determinate"
                              value={calcularPorcentaje(cantidad, metrics.total)}
                              sx={{
                                width: '60%',
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getStatusColor(estado)
                                }
                              }}
                            />
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ fontWeight: 500 }}
                            >
                              {calcularPorcentaje(cantidad, metrics.total)}%
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}

              {/* Indicadores de Rendimiento - Compacto */}
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ mt: 1, borderColor: 'divider' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                        📈 Resumen de Rendimiento
                      </Typography>
                    </Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box 
                            sx={{ 
                              width: 48, 
                              height: 48, 
                              borderRadius: 2, 
                              backgroundColor: 'success.light', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: 'success.contrastText'
                            }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {calcularPorcentaje(metrics.evaluadas + metrics.cerradas, metrics.total)}%
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                              Completadas
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {metrics.evaluadas + metrics.cerradas} de {metrics.total}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box 
                            sx={{ 
                              width: 48, 
                              height: 48, 
                              borderRadius: 2, 
                              backgroundColor: 'warning.light', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: 'warning.contrastText'
                            }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {calcularPorcentaje(metrics.en_carga + metrics.pendiente_evaluacion, metrics.total)}%
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                              En Proceso
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {metrics.en_carga + metrics.pendiente_evaluacion} activas
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box 
                            sx={{ 
                              width: 48, 
                              height: 48, 
                              borderRadius: 2, 
                              backgroundColor: 'info.light', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: 'info.contrastText'
                            }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {metrics.pendiente_evaluacion}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                              Atención
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Pendientes evaluación
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkflowMetrics;