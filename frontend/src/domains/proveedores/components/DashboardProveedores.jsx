/**
 * Dashboard específico para usuarios con rol Proveedor
 * Checkpoint 2.8: Panel personalizado con vista de sus auditorías, documentos y comunicación
 * 
 * Funcionalidades específicas:
 * - Vista de auditorías asignadas al proveedor
 * - Progreso de carga documental por auditoría
 * - Alertas y notificaciones específicas
 * - Accesos rápidos a carga de documentos y chat
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  CloudUpload,
  Warning,
  CheckCircle,
  AccessTime,
  Chat,
  Notifications,
  ExpandMore,
  Refresh,
  Description,
  Timeline,
  Business,
  LocationOn,
  Email,
  Phone,
  CalendarToday
} from '@mui/icons-material';
import { useAuthStore } from '../../auth/store/authStore';
import { formatDate, formatDateTime } from '../../../shared/utils/dateHelpers';
import axios from 'axios';

const DashboardProveedores = () => {
  const { usuario } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    resumen: {
      auditorias_activas: 0,
      documentos_pendientes: 0,
      alertas_criticas: 0,
      proximos_vencimientos: 0
    },
    auditorias: [],
    alertas: [],
    actividadReciente: [],
    estadisticasGeneral: {
      sitios_totales: 0,
      documentos_cargados_mes: 0,
      cumplimiento_promedio: 0
    }
  });
  const [expanded, setExpanded] = useState({
    auditorias: true,
    documentos: false,
    alertas: false,
    actividad: false
  });

  useEffect(() => {
    cargarDashboard();
    // Actualizar cada 2 minutos
    const interval = setInterval(cargarDashboard, 120000);
    return () => clearInterval(interval);
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);

      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [auditoriasRes, notifRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/api/auditorias`, { headers }),
        axios.get(`${API_BASE}/api/notificaciones`, { headers, params: { limit: 10 } }),
      ]);

      const auditorias = auditoriasRes.status === 'fulfilled'
        ? (auditoriasRes.value.data?.data || auditoriasRes.value.data || [])
        : [];

      const notificaciones = notifRes.status === 'fulfilled'
        ? (notifRes.value.data?.data || notifRes.value.data || [])
        : [];

      // Normalizar auditorías al shape que espera el template
      const hoy = new Date();
      const auditoriasNorm = auditorias.map((a) => {
        const fechaLimite = a.fecha_fin_visitas ? new Date(a.fecha_fin_visitas) : null;
        const diasRestantes = fechaLimite
          ? Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24))
          : 99;
        const docs = a.documentos_cargados ?? 0;
        const total = a.documentos_totales ?? 13;
        return {
          id: a.id,
          sitio: a.sitio?.nombre || a.nombre_sitio || a.sitio_nombre || `Auditoría ${a.id}`,
          periodo: a.periodo?.codigo || a.periodo_codigo || a.codigo || '',
          estado: a.estado || 'programada',
          progreso: total > 0 ? Math.round((docs / total) * 100) : 0,
          documentos_cargados: docs,
          documentos_totales: total,
          fecha_limite: fechaLimite,
          dias_restantes: diasRestantes,
          prioridad: diasRestantes < 0 ? 'vencida' : diasRestantes <= 7 ? 'alta' : 'media',
        };
      });

      const activas = auditoriasNorm.filter(
        (a) => !['cerrada', 'cancelada'].includes(a.estado)
      );
      const docsPendientes = auditoriasNorm.reduce(
        (sum, a) => sum + Math.max(0, a.documentos_totales - a.documentos_cargados), 0
      );
      const alertasCriticas = auditoriasNorm.filter((a) => a.dias_restantes < 0).length;
      const proximosVenc = auditoriasNorm.filter(
        (a) => a.dias_restantes >= 0 && a.dias_restantes <= 7
      ).length;

      const cumplimientoPromedio = auditoriasNorm.length > 0
        ? Math.round(auditoriasNorm.reduce((s, a) => s + a.progreso, 0) / auditoriasNorm.length)
        : 0;

      // Construir alertas desde notificaciones del backend
      const alertas = notificaciones.slice(0, 5).map((n, i) => ({
        id: n.id || i,
        tipo: n.tipo || 'info',
        sitio: n.titulo || 'Sistema',
        mensaje: n.mensaje || n.contenido || '',
        severidad: n.prioridad === 'alta' ? 'warning' : 'info',
        fecha_limite: n.fecha_limite ? new Date(n.fecha_limite) : null,
      }));

      // Actividad reciente desde mensajes/eventos de auditorías
      const actividadReciente = auditoriasNorm.slice(0, 3).map((a) => ({
        tipo: 'estado_cambiado',
        descripcion: `Auditoría ${a.sitio} — ${a.estado.replace(/_/g, ' ')}`,
        timestamp: new Date(),
        auditoriaId: a.id,
      }));

      setDashboardData({
        resumen: {
          auditorias_activas: activas.length,
          documentos_pendientes: docsPendientes,
          alertas_criticas: alertasCriticas,
          proximos_vencimientos: proximosVenc,
        },
        auditorias: auditoriasNorm,
        alertas,
        actividadReciente,
        estadisticasGeneral: {
          sitios_totales: new Set(auditoriasNorm.map((a) => a.sitio)).size,
          documentos_cargados_mes: auditoriasNorm.reduce((s, a) => s + a.documentos_cargados, 0),
          cumplimiento_promedio: cumplimientoPromedio,
        },
      });

    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandChange = (panel) => (event, isExpanded) => {
    setExpanded(prev => ({ ...prev, [panel]: isExpanded }));
  };

  const getEstadoChip = (estado) => {
    const estados = {
      'programada': { color: 'default', label: 'Programada', icon: <CalendarToday /> },
      'en_carga': { color: 'warning', label: 'En Carga', icon: <CloudUpload /> },
      'pendiente_evaluacion': { color: 'info', label: 'Pendiente Evaluación', icon: <AccessTime /> },
      'evaluada': { color: 'success', label: 'Evaluada', icon: <CheckCircle /> },
      'cerrada': { color: 'default', label: 'Cerrada', icon: <CheckCircle /> }
    };
    
    const estadoConfig = estados[estado] || estados.programada;
    
    return (
      <Chip
        icon={estadoConfig.icon}
        label={estadoConfig.label}
        color={estadoConfig.color}
        size="small"
      />
    );
  };

  const getPrioridadColor = (prioridad, dias) => {
    if (prioridad === 'completada') return 'success.main';
    if (dias < 0) return 'error.main';
    if (dias <= 7) return 'warning.main';
    return 'primary.main';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Cargando dashboard del proveedor...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header del Dashboard */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Dashboard color="primary" />
            Dashboard - {usuario?.proveedor?.nombre || 'Proveedor'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              <Business />
            </Avatar>
            <Typography variant="subtitle1" color="text.secondary">
              Bienvenido, {usuario?.nombre || usuario?.email || 'Usuario'}
            </Typography>
            <Chip
              icon={<LocationOn />}
              label={`${dashboardData.estadisticasGeneral.sitios_totales} sitio(s)`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Badge badgeContent={dashboardData.alertas.length} color="error">
            <IconButton color="primary">
              <Notifications />
            </IconButton>
          </Badge>
          <IconButton onClick={cargarDashboard} color="primary">
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Métricas Principales */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Assignment fontSize="large" />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>{dashboardData.resumen.auditorias_activas}</Typography>
                  <Typography variant="body2" noWrap>Auditorías Activas</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CloudUpload fontSize="large" />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>{dashboardData.resumen.documentos_pendientes}</Typography>
                  <Typography variant="body2" noWrap>Docs. Pendientes</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Warning fontSize="large" />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>{dashboardData.resumen.alertas_criticas}</Typography>
                  <Typography variant="body2" noWrap>Alertas Críticas</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Timeline fontSize="large" />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>{dashboardData.estadisticasGeneral.cumplimiento_promedio}%</Typography>
                  <Typography variant="body2" noWrap>Cumplimiento</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Panel de Auditorías */}
        <Grid item xs={12} lg={8}>
          <Accordion expanded={expanded.auditorias} onChange={handleExpandChange('auditorias')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Assignment color="primary" />
                <Typography variant="h6">Mis Auditorías</Typography>
                <Badge badgeContent={dashboardData.auditorias.length} color="primary" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {dashboardData.auditorias.map((auditoria) => (
                  <Grid item xs={12} md={6} key={auditoria.id}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        borderLeft: `4px solid ${getPrioridadColor(auditoria.prioridad, auditoria.dias_restantes)}`,
                        height: '100%'
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" noWrap title={auditoria.sitio}>
                            {auditoria.sitio}
                          </Typography>
                          {getEstadoChip(auditoria.estado)}
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Período: {auditoria.periodo}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Progreso:</Typography>
                            <Typography variant="body2">
                              {auditoria.documentos_cargados}/{auditoria.documentos_totales} docs
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={auditoria.progreso} 
                            sx={{ height: 8, borderRadius: 1 }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Vence: {formatDate(auditoria.fecha_limite)}
                          </Typography>
                          <Chip
                            size="small"
                            label={`${auditoria.dias_restantes > 0 ? `${auditoria.dias_restantes} días` : 'Vencida'}`}
                            color={auditoria.dias_restantes < 0 ? 'error' : auditoria.dias_restantes <= 7 ? 'warning' : 'success'}
                            variant="outlined"
                          />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {(auditoria.estado === 'cerrada' || auditoria.estado === 'vencida' || auditoria.dias_restantes < 0) ? (
                            <Button size="small" variant="outlined" disabled sx={{ color: 'text.disabled', borderColor: 'divider' }}>
                              Auditoría vencida
                            </Button>
                          ) : (
                            <Button size="small" variant="outlined" startIcon={<CloudUpload />}>
                              Cargar Docs
                            </Button>
                          )}
                          <Button size="small" variant="outlined" startIcon={<Chat />}>
                            Chat
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Panel de Alertas */}
        <Grid item xs={12} lg={4}>
          <Accordion expanded={expanded.alertas} onChange={handleExpandChange('alertas')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Warning color="warning" />
                <Typography variant="h6">Alertas y Notificaciones</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {dashboardData.alertas.map((alerta) => (
                <Alert 
                  key={alerta.id} 
                  severity={alerta.severidad}
                  sx={{ mb: 2 }}
                  action={
                    <Button color="inherit" size="small">
                      Ver
                    </Button>
                  }
                >
                  <Typography variant="body2" fontWeight="bold">
                    {alerta.sitio}
                  </Typography>
                  <Typography variant="body2">
                    {alerta.mensaje}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Límite: {formatDate(alerta.fecha_limite)}
                  </Typography>
                </Alert>
              ))}
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Panel de Actividad Reciente */}
        <Grid item xs={12}>
          <Accordion expanded={expanded.actividad} onChange={handleExpandChange('actividad')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Timeline color="primary" />
                <Typography variant="h6">Actividad Reciente</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {dashboardData.actividadReciente.map((actividad, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {actividad.tipo === 'documento_cargado' && <Description color="success" />}
                      {actividad.tipo === 'mensaje_auditor' && <Chat color="info" />}
                      {actividad.tipo === 'estado_cambiado' && <Timeline color="primary" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={actividad.descripcion}
                      secondary={formatDateTime(actividad.timestamp)}
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => window.location.href = '/comunicacion'}
                  sx={{ textTransform: 'none' }}
                >
                  Ver toda la actividad →
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardProveedores;