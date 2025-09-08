// Panel de Control Avanzado para Auditores
// Checkpoint 2.5 - Panel especializado con métricas y controles avanzados

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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Divider
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  Schedule,
  Warning,
  CheckCircle,
  AccessTime,
  Notifications,
  Email,
  ExpandMore,
  Refresh,
  Settings,
  Analytics,
  Group,
  Description,
  Chat,
  Timeline
} from '@mui/icons-material';
import { useAuthStore } from '../../../domains/auth/store/authStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PanelControlAuditores = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState({
    resumen: {
      auditorias_asignadas: 0,
      pendientes_revision: 0,
      proximas_visitas: 0,
      alertas_activas: 0,
      auditoriasPorEstado: []
    },
    proximasVisitas: [],
    alertasCriticas: [],
    actividadReciente: [],
    notificacionesPendientes: 0
  });
  const [expanded, setExpanded] = useState({
    auditorias: true,
    visitas: false,
    alertas: false,
    comunicacion: false
  });

  useEffect(() => {
    cargarDatosPanel();
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarDatosPanel, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatosPanel = async () => {
    try {
      // Usar datos simulados por ahora hasta que el backend esté completamente configurado
      setMetricas({
        resumen: simulatedResumen(),
        proximasVisitas: simulatedVisitas(),
        alertasCriticas: simulatedAlertas(),
        actividadReciente: simulatedActividad(),
        notificacionesPendientes: Math.floor(Math.random() * 12) + 1
      });

    } catch (error) {
      console.error('Error cargando panel auditores:', error);
      // Set default values to prevent crashes
      setMetricas({
        resumen: simulatedResumen(),
        proximasVisitas: [],
        alertasCriticas: [],
        actividadReciente: [],
        notificacionesPendientes: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Datos simulados para demostración
  const simulatedResumen = () => ({
    auditorias_asignadas: 15,
    pendientes_revision: 8,
    proximas_visitas: 3,
    alertas_activas: 2,
    auditoriasPorEstado: [
      { estado: 'En carga', cantidad: 5, color: '#FF9800' },
      { estado: 'En revisión', cantidad: 8, color: '#2196F3' },
      { estado: 'Completadas', cantidad: 2, color: '#4CAF50' }
    ]
  });

  const simulatedVisitas = () => [
    {
      id: 1,
      sitio: 'APEX Centro',
      proveedor: 'Centro de Interacción Multimedia S.A.',
      fecha: new Date(2024, 11, 15, 14, 0),
      estado: 'programada'
    },
    {
      id: 2,
      sitio: 'Teleperformance Norte',
      proveedor: 'CityTech S.A.',
      fecha: new Date(2024, 11, 18, 10, 30),
      estado: 'confirmada'
    }
  ];

  const simulatedAlertas = () => [
    {
      id: 1,
      tipo: 'vencimiento',
      sitio: 'CAT Technologies',
      mensaje: 'Documentos vencen en menos de 24 horas',
      severidad: 'alta',
      fechaLimite: new Date(2024, 11, 14, 23, 59)
    },
    {
      id: 2,
      tipo: 'documentos_faltantes',
      sitio: 'Stratton Argentina',
      mensaje: '12 secciones técnicas sin documentos',
      severidad: 'media',
      fechaLimite: new Date(2024, 11, 20, 23, 59)
    }
  ];

  const simulatedActividad = () => [
    {
      tipo: 'documento',
      descripcion: 'Nuevo documento cargado en APEX Centro',
      timestamp: new Date(),
      usuario: 'proveedor@apex.com'
    },
    {
      tipo: 'mensaje',
      descripcion: 'Nuevo mensaje en auditoría Teleperformance',
      timestamp: new Date(Date.now() - 15 * 60000),
      usuario: 'jefe@citytech.com'
    }
  ];

  const handleExpandChange = (panel) => (event, isExpanded) => {
    setExpanded(prev => ({ ...prev, [panel]: isExpanded }));
  };

  const getSeverityColor = (severidad) => {
    switch(severidad) {
      case 'alta': return 'error';
      case 'media': return 'warning';
      case 'baja': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Cargando panel de control...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header del Panel */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Dashboard color="primary" />
            Panel de Control - Auditor
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Bienvenido, {user?.nombre || 'Auditor'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Badge badgeContent={metricas.notificacionesPendientes} color="error">
            <IconButton color="primary">
              <Notifications />
            </IconButton>
          </Badge>
          <IconButton onClick={cargarDatosPanel} color="primary">
            <Refresh />
          </IconButton>
          <IconButton color="primary">
            <Settings />
          </IconButton>
        </Box>
      </Box>

      {/* Métricas Principales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Assignment fontSize="large" />
                <Box>
                  <Typography variant="h4">{metricas.resumen.auditorias_asignadas}</Typography>
                  <Typography variant="body2">Auditorías Asignadas</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccessTime fontSize="large" />
                <Box>
                  <Typography variant="h4">{metricas.resumen.pendientes_revision}</Typography>
                  <Typography variant="body2">Pendientes Revisión</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Schedule fontSize="large" />
                <Box>
                  <Typography variant="h4">{metricas.resumen.proximas_visitas}</Typography>
                  <Typography variant="body2">Próximas Visitas</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Warning fontSize="large" />
                <Box>
                  <Typography variant="h4">{metricas.resumen.alertas_activas}</Typography>
                  <Typography variant="body2">Alertas Activas</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Panel de Auditorías */}
        <Grid item xs={12} lg={6}>
          <Accordion expanded={expanded.auditorias} onChange={handleExpandChange('auditorias')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Analytics color="primary" />
                <Typography variant="h6">Estado de Auditorías</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {metricas.resumen.auditoriasPorEstado?.map((item, index) => (
                  <Grid item xs={4} key={index}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', py: 1 }}>
                        <Typography variant="h5" sx={{ color: item.color }}>
                          {item.cantidad}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.estado}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<Assignment />} size="small">
                  Ver Todas
                </Button>
                <Button variant="outlined" startIcon={<Analytics />} size="small">
                  Reportes
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Panel de Visitas */}
        <Grid item xs={12} lg={6}>
          <Accordion expanded={expanded.visitas} onChange={handleExpandChange('visitas')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Schedule color="primary" />
                <Typography variant="h6">Próximas Visitas</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {(metricas.proximasVisitas || []).map((visita) => (
                  <ListItem key={visita.id}>
                    <ListItemIcon>
                      <CheckCircle color={visita.estado === 'confirmada' ? 'success' : 'warning'} />
                    </ListItemIcon>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {visita.sitio}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {visita.proveedor}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(visita.fecha, 'dd/MM/yyyy HH:mm', { locale: es })}
                      </Typography>
                    </Box>
                    <Chip 
                      label={visita.estado} 
                      size="small" 
                      color={visita.estado === 'confirmada' ? 'success' : 'warning'}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Panel de Alertas Críticas */}
        <Grid item xs={12} lg={6}>
          <Accordion expanded={expanded.alertas} onChange={handleExpandChange('alertas')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Warning color="error" />
                <Typography variant="h6">Alertas Críticas</Typography>
                <Badge badgeContent={(metricas.alertasCriticas || []).length} color="error" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {(metricas.alertasCriticas || []).map((alerta) => (
                <Alert 
                  key={alerta.id} 
                  severity={getSeverityColor(alerta.severidad)}
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
                    Límite: {format(alerta.fechaLimite, 'dd/MM/yyyy HH:mm', { locale: es })}
                  </Typography>
                </Alert>
              ))}
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Panel de Comunicación */}
        <Grid item xs={12} lg={6}>
          <Accordion expanded={expanded.comunicacion} onChange={handleExpandChange('comunicacion')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chat color="primary" />
                <Typography variant="h6">Actividad Reciente</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {(metricas.actividadReciente || []).map((actividad, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {actividad.tipo === 'documento' ? <Description /> : <Chat />}
                    </ListItemIcon>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1">
                        {actividad.descripcion}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {actividad.usuario} - {format(actividad.timestamp, 'HH:mm', { locale: es })}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<Chat />} size="small">
                  Ver Chat
                </Button>
                <Button variant="outlined" startIcon={<Email />} size="small">
                  Notificaciones
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PanelControlAuditores;