/**
 * Dashboard Ejecutivo Avanzado con Gráficos
 * Checkpoint 2.8: Vista analítica avanzada para administradores y auditores generales
 * 
 * Funcionalidades:
 * - Gráficos de tendencias y métricas
 * - Análisis de cumplimiento por proveedor
 * - Reportes de productividad
 * - Métricas de tiempo real
 * - Comparaciones históricas
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Paper,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Dashboard,
  Analytics,
  TrendingUp,
  TrendingDown,
  Assessment,
  Business,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  Refresh,
  FileDownload,
  FilterList,
  DateRange,
  ShowChart,
  PieChart,
  BarChart,
  Timeline,
  Group,
  Assignment,
  Speed
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '../../auth/store/authStore';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardEjecutivo = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    periodo: '6_meses',
    proveedor: 'todos',
    metrica: 'general'
  });
  const [datosAnalytics, setDatosAnalytics] = useState({});

  useEffect(() => {
    cargarDatosAnalytics();
    const interval = setInterval(cargarDatosAnalytics, 300000); // 5 minutos
    return () => clearInterval(interval);
  }, [filtros]);

  const cargarDatosAnalytics = async () => {
    try {
      setLoading(true);
      
      // Simular datos analíticos complejos
      const datosSimulados = generarDatosSimulados();
      setDatosAnalytics(datosSimulados);
      
    } catch (error) {
      console.error('Error cargando analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generarDatosSimulados = () => {
    const meses = Array.from({ length: 6 }, (_, i) => {
      const fecha = subMonths(new Date(), 5 - i);
      return format(fecha, 'MMM yyyy', { locale: es });
    });

    return {
      metricas_globales: {
        total_auditorias: 156,
        cumplimiento_promedio: 87.5,
        tiempo_promedio_resolucion: 12.3,
        satisfaccion_proveedores: 4.2,
        eficiencia_operativa: 91.2,
        documentos_procesados: 2450,
        tendencia_cumplimiento: 5.2 // % de mejora
      },
      tendencias_temporales: {
        labels: meses,
        auditorias_completadas: [18, 22, 19, 25, 28, 24],
        cumplimiento_promedio: [85, 87, 84, 88, 91, 89],
        tiempo_resolucion: [15.2, 14.1, 13.8, 12.5, 11.8, 12.3],
        documentos_mes: [380, 425, 390, 445, 480, 430]
      },
      distribucion_estados: {
        labels: ['Programada', 'En Carga', 'Pendiente Eval.', 'Evaluada', 'Cerrada'],
        datos: [12, 28, 15, 18, 83],
        colores: ['#9e9e9e', '#ff9800', '#2196f3', '#4caf50', '#666666']
      },
      rendimiento_proveedores: [
        {
          nombre: 'Grupo Activo SRL',
          auditorias: 35,
          cumplimiento: 92.1,
          tiempo_promedio: 10.5,
          eficiencia: 95.2,
          tendencia: 'up'
        },
        {
          nombre: 'Centro Interacción Multimedia',
          auditorias: 42,
          cumplimiento: 88.7,
          tiempo_promedio: 11.8,
          eficiencia: 89.1,
          tendencia: 'up'
        },
        {
          nombre: 'CityTech S.A.',
          auditorias: 38,
          cumplimiento: 85.3,
          tiempo_promedio: 13.2,
          eficiencia: 86.5,
          tendencia: 'down'
        },
        {
          nombre: 'CAT Technologies',
          auditorias: 24,
          cumplimiento: 91.8,
          tiempo_promedio: 9.7,
          eficiencia: 94.1,
          tendencia: 'up'
        },
        {
          nombre: 'Stratton Argentina',
          auditorias: 17,
          cumplimiento: 83.2,
          tiempo_promedio: 14.6,
          eficiencia: 82.3,
          tendencia: 'stable'
        }
      ],
      metricas_operacionales: {
        sla_cumplimiento: 94.5,
        tiempo_respuesta_chat: 2.1,
        documentos_rechazados: 3.2,
        retrabajos: 1.8,
        automatizacion_lograda: 67.3
      },
      alertas_ejecutivas: [
        {
          tipo: 'warning',
          titulo: 'Disminución en CityTech',
          descripcion: 'Baja del 4% en cumplimiento último mes',
          impacto: 'medio'
        },
        {
          tipo: 'success',
          titulo: 'Meta Q4 alcanzada',
          descripcion: '92% cumplimiento trimestral logrado',
          impacto: 'alto'
        },
        {
          tipo: 'info',
          titulo: 'Nuevo período iniciado',
          descripción: '48 auditorías programadas Nov 2024',
          impacto: 'bajo'
        }
      ]
    };
  };

  // Configuración de gráficos
  const opcionesTendencia = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Tendencias de Cumplimiento (6 meses)'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  const datosTendencia = {
    labels: datosAnalytics.tendencias_temporales?.labels || [],
    datasets: [
      {
        label: 'Cumplimiento Promedio (%)',
        data: datosAnalytics.tendencias_temporales?.cumplimiento_promedio || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.1
      },
      {
        label: 'Auditorías Completadas',
        data: datosAnalytics.tendencias_temporales?.auditorias_completadas || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y1',
      }
    ]
  };

  const opcionesEstados = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Distribución de Estados Actuales'
      }
    }
  };

  const datosEstados = {
    labels: datosAnalytics.distribucion_estados?.labels || [],
    datasets: [{
      data: datosAnalytics.distribucion_estados?.datos || [],
      backgroundColor: datosAnalytics.distribucion_estados?.colores || [],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const datosRadar = {
    labels: ['Cumplimiento', 'Velocidad', 'Calidad', 'Comunicación', 'Eficiencia'],
    datasets: datosAnalytics.rendimiento_proveedores?.slice(0, 3).map((proveedor, index) => ({
      label: proveedor.nombre.split(' ')[0],
      data: [
        proveedor.cumplimiento,
        100 - proveedor.tiempo_promedio * 5, // Convertir a escala 0-100
        95 - Math.random() * 10, // Simular calidad
        90 + Math.random() * 10, // Simular comunicación
        proveedor.eficiencia
      ],
      backgroundColor: `rgba(${54 + index * 50}, ${162 + index * 30}, ${235 - index * 20}, 0.2)`,
      borderColor: `rgba(${54 + index * 50}, ${162 + index * 30}, ${235 - index * 20}, 1)`,
      pointBackgroundColor: `rgba(${54 + index * 50}, ${162 + index * 30}, ${235 - index * 20}, 1)`
    })) || []
  };

  const opcionesRadar = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Comparativa de Rendimiento Top 3'
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Cargando dashboard ejecutivo...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Analytics color="primary" />
            Dashboard Ejecutivo
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Análisis avanzado y métricas estratégicas
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={filtros.periodo}
              label="Período"
              onChange={(e) => setFiltros(prev => ({ ...prev, periodo: e.target.value }))}
            >
              <MenuItem value="3_meses">3 Meses</MenuItem>
              <MenuItem value="6_meses">6 Meses</MenuItem>
              <MenuItem value="1_año">1 Año</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={cargarDatosAnalytics} color="primary">
            <Refresh />
          </IconButton>
          <Button startIcon={<FileDownload />} variant="outlined">
            Exportar
          </Button>
        </Box>
      </Box>

      {/* KPIs Principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={2}>
          <Card sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            height: '140px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ 
              textAlign: 'center', 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}>
              <Assignment fontSize="large" />
              <Typography variant="h4" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                {datosAnalytics.metricas_globales?.total_auditorias || '156'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Total Auditorías
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={2}>
          <Card sx={{ 
            bgcolor: 'success.main', 
            color: 'white',
            height: '140px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ 
              textAlign: 'center', 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}>
              <Speed fontSize="large" />
              <Typography variant="h4" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                {datosAnalytics.metricas_globales?.cumplimiento_promedio || '87.5'}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Cumplimiento
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={2}>
          <Card sx={{ 
            bgcolor: 'info.main', 
            color: 'white',
            height: '140px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ 
              textAlign: 'center', 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}>
              <Schedule fontSize="large" />
              <Typography variant="h4" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                {datosAnalytics.metricas_globales?.tiempo_promedio_resolucion || '12.3'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Días Promedio
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={2}>
          <Card sx={{ 
            bgcolor: 'warning.main', 
            color: 'white',
            height: '140px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ 
              textAlign: 'center', 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}>
              <TrendingUp fontSize="large" />
              <Typography variant="h4" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                {datosAnalytics.metricas_globales?.eficiencia_operativa || '91.2'}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Eficiencia
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={2}>
          <Card sx={{ 
            bgcolor: 'secondary.main', 
            color: 'white',
            height: '140px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ 
              textAlign: 'center', 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}>
              <Assessment fontSize="large" />
              <Typography variant="h4" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                {datosAnalytics.metricas_globales?.documentos_procesados || '2450'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Documentos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={2}>
          <Card sx={{ 
            bgcolor: 'error.main', 
            color: 'white',
            height: '140px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CardContent sx={{ 
              textAlign: 'center', 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}>
              {datosAnalytics.metricas_globales?.tendencia_cumplimiento > 0 ? 
                <TrendingUp fontSize="large" /> : 
                <TrendingDown fontSize="large" />
              }
              <Typography variant="h4" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                {Math.abs(datosAnalytics.metricas_globales?.tendencia_cumplimiento || 5.2)}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Tendencia
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Gráfico de Tendencias */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShowChart />
                Tendencias de Cumplimiento
              </Typography>
              <Box sx={{ height: 400 }}>
                <Line key="line-chart" data={datosTendencia} options={opcionesTendencia} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución de Estados */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PieChart />
                Estados Actuales
              </Typography>
              <Box sx={{ height: 400 }}>
                <Doughnut key="doughnut-chart" data={datosEstados} options={opcionesEstados} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Comparativa de Proveedores */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChart />
                Análisis Comparativo
              </Typography>
              <Box sx={{ height: 350 }}>
                <Radar key="radar-chart" data={datosRadar} options={opcionesRadar} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Ranking de Proveedores */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business />
                Rendimiento por Proveedor
              </Typography>
              <List>
                {datosAnalytics.rendimiento_proveedores?.map((proveedor, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Avatar sx={{ 
                        bgcolor: index < 2 ? 'success.main' : index < 4 ? 'warning.main' : 'error.main',
                        width: 32, 
                        height: 32 
                      }}>
                        {index + 1}
                      </Avatar>
                    </ListItemIcon>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {proveedor.nombre}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Chip 
                          size="small" 
                          label={`${proveedor.cumplimiento}%`}
                          color={proveedor.cumplimiento > 90 ? 'success' : proveedor.cumplimiento > 85 ? 'warning' : 'error'}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {proveedor.auditorias} auditorías
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {proveedor.tiempo_promedio} días
                        </Typography>
                      </Box>
                    </Box>
                    {proveedor.tendencia === 'up' && <TrendingUp color="success" />}
                    {proveedor.tendencia === 'down' && <TrendingDown color="error" />}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Alertas Ejecutivas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning />
                Alertas Ejecutivas
              </Typography>
              <Grid container spacing={2}>
                {datosAnalytics.alertas_ejecutivas?.map((alerta, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Paper sx={{ 
                      p: 2, 
                      borderLeft: `4px solid ${
                        alerta.tipo === 'success' ? '#4caf50' : 
                        alerta.tipo === 'warning' ? '#ff9800' : 
                        alerta.tipo === 'error' ? '#f44336' : '#2196f3'
                      }`
                    }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {alerta.titulo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {alerta.descripcion}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={`Impacto ${alerta.impacto}`}
                        sx={{ mt: 1 }}
                        color={alerta.impacto === 'alto' ? 'error' : alerta.impacto === 'medio' ? 'warning' : 'info'}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardEjecutivo;