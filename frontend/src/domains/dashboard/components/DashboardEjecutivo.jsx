/**
 * Dashboard Ejecutivo Moderno - Estilo Tabler
 * Transformación completa con diseño contemporáneo
 * 
 * Características:
 * - Diseño limpio y minimalista
 * - Gráficos modernos con Recharts
 * - Paleta de colores sofisticada
 * - Tipografía mejorada
 * - Animaciones suaves
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
  ListItemIcon,
  CircularProgress
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
  Speed,
  People,
  Description
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '../../auth/store/authStore';

// Paleta de colores moderna Tabler
const COLORS = {
  primary: '#206bc4',
  secondary: '#6c757d',
  success: '#2fb344',
  danger: '#d63384',
  warning: '#fd7e14',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#1e293b',
  muted: '#868e96',
  gradient: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #6be6d0 0%, #48bb78 100%)',
    warning: 'linear-gradient(135deg, #ffeaa0 0%, #ff9800 100%)',
    info: 'linear-gradient(135deg, #89ddff 0%, #21CBF3 100%)'
  },
  chart: ['#206bc4', '#2fb344', '#fd7e14', '#d63384', '#17a2b8', '#6c757d']
};

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
        tendencia_cumplimiento: 5.2,
        // Datos SAT-Digital específicos
        auditorias_asignadas: 156,
        pendientes_revision: 87,
        proximas_visitas: 12,
        alertas_activas: 3
      },
      tendencias_recharts: [
        { mes: 'Jun', auditorias: 18, cumplimiento: 85, documentos: 380 },
        { mes: 'Jul', auditorias: 22, cumplimiento: 87, documentos: 425 },
        { mes: 'Ago', auditorias: 19, cumplimiento: 84, documentos: 390 },
        { mes: 'Sep', auditorias: 25, cumplimiento: 88, documentos: 445 },
        { mes: 'Oct', auditorias: 28, cumplimiento: 91, documentos: 480 },
        { mes: 'Nov', auditorias: 24, cumplimiento: 89, documentos: 430 }
      ],
      distribucion_estados_recharts: [
        { nombre: 'Programada', valor: 12, color: COLORS.chart[0] },
        { nombre: 'En Carga', valor: 28, color: COLORS.chart[1] },
        { nombre: 'Pendiente Eval.', valor: 15, color: COLORS.chart[2] },
        { nombre: 'Evaluada', valor: 18, color: COLORS.chart[3] },
        { nombre: 'Cerrada', valor: 83, color: COLORS.chart[4] }
      ],
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

  // Componente KPI Card moderno estilo Tabler
  const KPICard = ({ title, value, icon: IconComponent, color = COLORS.primary, trend, subtitle, percentage }) => (
    <Card sx={{ 
      height: '100%', 
      borderRadius: 3,
      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
      '&:hover': {
        boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
        transform: 'translateY(-2px)'
      }
    }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.75rem', fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ 
            width: 48, 
            height: 48, 
            borderRadius: 2, 
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IconComponent sx={{ color, fontSize: 24 }} />
          </Box>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {trend > 0 ? (
              <TrendingUp sx={{ color: COLORS.success, fontSize: 16 }} />
            ) : (
              <TrendingDown sx={{ color: COLORS.danger, fontSize: 16 }} />
            )}
            <Typography 
              variant="caption" 
              sx={{ 
                color: trend > 0 ? COLORS.success : COLORS.danger,
                fontWeight: 600
              }}
            >
              {Math.abs(trend)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              desde el mes anterior
            </Typography>
          </Box>
        )}
        {percentage && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={percentage} 
              sx={{ 
                height: 6,
                borderRadius: 3,
                backgroundColor: `${color}20`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                  borderRadius: 3
                }
              }} 
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Componente de progreso circular moderno
  const CircularProgressCard = ({ title, value, icon: IconComponent }) => (
    <Card sx={{ 
      height: '100%', 
      borderRadius: 3,
      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
    }}>
      <CardContent sx={{ p: 3, textAlign: 'center' }}>
        <IconComponent sx={{ color: COLORS.info, fontSize: 32, mb: 2 }} />
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
          <CircularProgress
            variant="determinate"
            value={value}
            size={80}
            thickness={4}
            sx={{
              color: COLORS.info,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />
          <CircularProgress
            variant="determinate"
            value={100}
            size={80}
            thickness={4}
            sx={{
              color: `${COLORS.info}20`,
              position: 'absolute',
              left: 0,
            }}
          />
          <Box sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {`${Math.round(value)}%`}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Cargando dashboard ejecutivo...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, md: 3 }, 
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Header Moderno */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', md: 'center' },
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        mb: 4,
        pb: 3,
        borderBottom: '1px solid #e9ecef'
      }}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: '#1e293b',
              mb: 0.5,
              fontSize: { xs: '1.5rem', md: '2rem' }
            }}
          >
            Dashboard
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ fontWeight: 400 }}
          >
            Bienvenido de vuelta, {user?.nombre || 'Pawel'}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: '0.875rem' }}
          >
            Tienes 5 nuevos mensajes y 2 notificaciones.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            size="small"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Nueva vista
          </Button>
          <Button 
            variant="contained" 
            startIcon={<FileDownload />}
            size="small"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              backgroundColor: COLORS.primary,
              '&:hover': {
                backgroundColor: '#1a5490'
              }
            }}
          >
            Crear nuevo reporte
          </Button>
        </Box>
      </Box>

      {/* Tarjeta de Bienvenida SAT-Digital */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{
            height: { xs: 'auto', md: 200 },
            minHeight: 200,
            background: COLORS.gradient.primary,
            color: 'white',
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, fontFamily: 'var(--font-primary)' }}>
                Bienvenido al Dashboard Ejecutivo
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                Análisis avanzado y métricas estratégicas para auditorías técnicas
              </Typography>
              <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {datosAnalytics.metricas_globales?.total_auditorias || '156'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    TOTAL AUDITORÍAS
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {datosAnalytics.metricas_globales?.cumplimiento_promedio || '87.5'}%
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    CUMPLIMIENTO PROMEDIO
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {datosAnalytics.metricas_globales?.documentos_procesados || '2450'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    DOCUMENTOS PROCESADOS
                  </Typography>
                </Box>
              </Box>
            </CardContent>
            <Box sx={{
              position: 'absolute',
              right: -20,
              bottom: -20,
              width: 150,
              height: 150,
              opacity: 0.2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Analytics sx={{ fontSize: 120 }} />
            </Box>
          </Card>
        </Grid>

        {/* KPI Circular - Eficiencia */}
        <Grid item xs={12} lg={4}>
          <Card sx={{
            height: { xs: 'auto', md: 200 },
            minHeight: 200,
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Speed sx={{ color: COLORS.info, fontSize: 32, mb: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.75rem', fontWeight: 500 }}>
                EFICIENCIA OPERATIVA
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex', alignSelf: 'center' }}>
                <CircularProgress
                  variant="determinate"
                  value={datosAnalytics.metricas_globales?.eficiencia_operativa || 91.2}
                  size={100}
                  thickness={3}
                  sx={{
                    color: COLORS.info,
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    }
                  }}
                />
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={100}
                  thickness={3}
                  sx={{
                    color: `${COLORS.info}15`,
                    position: 'absolute',
                    left: 0,
                    top: 0,
                  }}
                />
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
                    {Math.round(datosAnalytics.metricas_globales?.eficiencia_operativa || 91.2)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    %
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* KPIs Principales SAT-Digital */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <Card sx={{
            height: 140,
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
            transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
            '&:hover': {
              boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.7rem', fontWeight: 500 }}>
                    AUDITORÍAS ASIGNADAS
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
                    {datosAnalytics.metricas_globales?.auditorias_asignadas || '156'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Total en el sistema
                  </Typography>
                </Box>
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: `${COLORS.primary}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Assignment sx={{ color: COLORS.primary, fontSize: 20 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp sx={{ color: COLORS.success, fontSize: 16 }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: COLORS.success,
                    fontWeight: 600
                  }}
                >
                  {Math.abs(datosAnalytics.metricas_globales?.tendencia_cumplimiento || 5.2)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  desde el mes anterior
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card sx={{
            height: 140,
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
            transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
            '&:hover': {
              boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.7rem', fontWeight: 500 }}>
                    PENDIENTES REVISIÓN
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
                    {datosAnalytics.metricas_globales?.pendientes_revision || '87'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Requieren atención
                  </Typography>
                </Box>
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: `${COLORS.warning}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Schedule sx={{ color: COLORS.warning, fontSize: 20 }} />
                </Box>
              </Box>
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.round((datosAnalytics.metricas_globales?.pendientes_revision || 87) / (datosAnalytics.metricas_globales?.total_auditorias || 156) * 100)}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: `${COLORS.warning}20`,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: COLORS.warning,
                      borderRadius: 3
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card sx={{
            height: 140,
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
            transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
            '&:hover': {
              boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.7rem', fontWeight: 500 }}>
                    PRÓXIMAS VISITAS
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
                    {datosAnalytics.metricas_globales?.proximas_visitas || '12'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Programadas este mes
                  </Typography>
                </Box>
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: `${COLORS.info}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Schedule sx={{ color: COLORS.info, fontSize: 20 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card sx={{
            height: 140,
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
            transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
            '&:hover': {
              boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.7rem', fontWeight: 500 }}>
                    ALERTAS ACTIVAS
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
                    {datosAnalytics.metricas_globales?.alertas_activas || '3'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Requieren acción inmediata
                  </Typography>
                </Box>
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: `${COLORS.danger}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Warning sx={{ color: COLORS.danger, fontSize: 20 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tarjetas de acciones rápidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <Card sx={{
            height: 100,
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: `${COLORS.primary}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Assignment sx={{ color: COLORS.primary, fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    132 Ventas
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    12 pagos pendientes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card sx={{
            height: 100,
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: `${COLORS.success}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <CheckCircle sx={{ color: COLORS.success, fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    78 Órdenes
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    32 enviadas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card sx={{
            height: 100,
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: `${COLORS.dark}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Description sx={{ color: COLORS.dark, fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    623 Compartidos
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    16 hoy
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card sx={{
            height: 100,
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: `${COLORS.info}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <TrendingUp sx={{ color: COLORS.info, fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    132 Me Gusta
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    21 hoy
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Tendencias de Auditorías SAT-Digital */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            height: '450px'
          }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b', fontFamily: 'var(--font-primary)' }}>
                Tendencias de Cumplimiento - Últimos 6 meses
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={datosAnalytics.tendencias_recharts}>
                  <defs>
                    <linearGradient id="colorAuditorias" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCumplimiento" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis 
                    dataKey="mes" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6c757d' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6c757d' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="auditorias"
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAuditorias)"
                    name="Auditorías Completadas"
                  />
                  <Area
                    type="monotone"
                    dataKey="cumplimiento"
                    stroke={COLORS.success}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCumplimiento)"
                    name="% Cumplimiento"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Estados de Auditorías */}
        <Grid item xs={12} lg={4}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            height: '450px'
          }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b', fontFamily: 'var(--font-primary)', mb: 2 }}>
                Distribución por Estados
              </Typography>

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie
                      data={datosAnalytics.distribucion_estados_recharts}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="valor"
                    >
                      {datosAnalytics.distribucion_estados_recharts?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [value, name]}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </Box>

              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f1f3f4' }}>
                <Grid container spacing={1}>
                  {datosAnalytics.distribucion_estados_recharts?.map((estado, index) => (
                    <Grid item xs={12} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                          <Box sx={{
                            width: 8,
                            height: 8,
                            backgroundColor: estado.color,
                            borderRadius: '50%',
                            flexShrink: 0
                          }} />
                          <Typography variant="caption" sx={{
                            fontFamily: 'var(--font-primary)',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: 'text.secondary'
                          }}>
                            {estado.nombre}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{
                          fontWeight: 600,
                          color: 'text.primary',
                          fontSize: '0.8rem'
                        }}>
                          {estado.valor}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Almacenamiento - Gráfico de Barras */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Usando almacenamiento 4804.45 MB de 6 GB
              </Typography>
              <Box sx={{ mt: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS.primary }} />
                  <Typography variant="body2">Regular</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS.info }} />
                  <Typography variant="body2">Sistema</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS.warning }} />
                  <Typography variant="body2">Compartido</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS.muted }} />
                  <Typography variant="body2">Libre</Typography>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsBarChart data={[
                  { name: 'Regular', value: 2500, fill: COLORS.primary },
                  { name: 'Sistema', value: 1800, fill: COLORS.info },
                  { name: 'Compartido', value: 504.45, fill: COLORS.warning },
                  { name: 'Libre', value: 1195.55, fill: COLORS.muted }
                ]}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Actividad de Desarrollo */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
                Actividad de desarrollo
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={datosAnalytics.tendencias_recharts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis 
                      dataKey="mes" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6c757d' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6c757d' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="documentos"
                      stroke={COLORS.info}
                      strokeWidth={3}
                      dot={{ fill: COLORS.info, strokeWidth: 2, r: 4 }}
                      name="Documentos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              
              {/* Lista de actividades */}
              <Box sx={{ mt: 3 }}>
                {[
                  { user: 'Fix Sass compatibility', time: '28 Nov 2019', status: 'success' },
                  { user: 'Change deprecated', time: '27 Nov 2019', status: 'warning' },
                  { user: 'Justify content', time: '26 Nov 2019', status: 'info' }
                ].map((activity, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32,
                        backgroundColor: activity.status === 'success' ? COLORS.success : 
                                       activity.status === 'warning' ? COLORS.warning : COLORS.info,
                        fontSize: '0.75rem'
                      }}
                    >
                      {activity.user.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {activity.user}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Rendimiento de Proveedores SAT-Digital */}
        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b', fontFamily: 'var(--font-primary)' }}>
                Rendimiento de Proveedores
              </Typography>
              
              {/* Headers de la tabla */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                pb: 1,
                borderBottom: '1px solid #e9ecef'
              }}>
                <Typography variant="caption" sx={{ flex: 1, fontWeight: 600, color: '#6c757d', fontFamily: 'var(--font-primary)' }}>
                  PROVEEDOR
                </Typography>
                <Typography variant="caption" sx={{ width: 100, textAlign: 'right', fontWeight: 600, color: '#6c757d', fontFamily: 'var(--font-primary)' }}>
                  AUDITORÍAS
                </Typography>
                <Typography variant="caption" sx={{ width: 120, textAlign: 'right', fontWeight: 600, color: '#6c757d', fontFamily: 'var(--font-primary)' }}>
                  CUMPLIMIENTO
                </Typography>
                <Typography variant="caption" sx={{ width: 100, textAlign: 'right', fontWeight: 600, color: '#6c757d', fontFamily: 'var(--font-primary)' }}>
                  TIEMPO PROM.
                </Typography>
                <Box sx={{ width: 60 }} />
              </Box>
              
              <Box>
                {datosAnalytics.rendimiento_proveedores?.map((proveedor, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    py: 2,
                    borderBottom: index < datosAnalytics.rendimiento_proveedores.length - 1 ? '1px solid #f1f3f4' : 'none'
                  }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'var(--font-primary)' }}>
                        {proveedor.nombre}
                      </Typography>
                    </Box>
                    <Box sx={{ width: 100, textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'var(--font-primary)' }}>
                        {proveedor.auditorias}
                      </Typography>
                    </Box>
                    <Box sx={{ width: 120, textAlign: 'right' }}>
                      <Chip 
                        label={`${proveedor.cumplimiento}%`}
                        size="small"
                        color={proveedor.cumplimiento > 90 ? 'success' : proveedor.cumplimiento > 85 ? 'warning' : 'error'}
                        sx={{ fontFamily: 'var(--font-primary)' }}
                      />
                    </Box>
                    <Box sx={{ width: 100, textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'var(--font-primary)' }}>
                        {proveedor.tiempo_promedio} días
                      </Typography>
                    </Box>
                    <Box sx={{ width: 60, textAlign: 'right' }}>
                      {proveedor.tendencia === 'up' ? (
                        <TrendingUp sx={{ color: COLORS.success, fontSize: 18 }} />
                      ) : proveedor.tendencia === 'down' ? (
                        <TrendingDown sx={{ color: COLORS.danger, fontSize: 18 }} />
                      ) : (
                        <Box sx={{ width: 18, height: 2, backgroundColor: COLORS.muted, borderRadius: 1 }} />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardEjecutivo;