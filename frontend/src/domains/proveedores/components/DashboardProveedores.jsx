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
  const { user } = useAuthStore();
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
      
      // Simular datos específicos del proveedor hasta implementar endpoints
      const datosSimulados = {
        resumen: {
          auditorias_activas: 3,
          documentos_pendientes: 15,
          alertas_criticas: 2,
          proximos_vencimientos: 1
        },
        auditorias: [
          {
            id: 1,
            sitio: user?.proveedor?.nombre === 'Grupo Activo SRL' ? 'Sede Central Florida' : 'APEX Centro',
            periodo: '2024-11',
            estado: 'en_carga',
            progreso: 65,
            documentos_cargados: 8,
            documentos_totales: 13,
            fecha_limite: new Date(2024, 11, 20),
            dias_restantes: 12,
            prioridad: 'alta'
          },
          {
            id: 2,
            sitio: user?.proveedor?.nombre === 'Grupo Activo SRL' ? 'Sucursal Norte' : 'Teleperformance Norte',
            periodo: '2024-11',
            estado: 'pendiente_evaluacion',
            progreso: 100,
            documentos_cargados: 13,
            documentos_totales: 13,
            fecha_limite: new Date(2024, 10, 30),
            dias_restantes: -5,
            prioridad: 'completada'
          },
          {
            id: 3,
            sitio: user?.proveedor?.nombre === 'Grupo Activo SRL' ? 'Sucursal Sur' : 'CityTech Sur',
            periodo: '2024-11',
            estado: 'programada',
            progreso: 0,
            documentos_cargados: 0,
            documentos_totales: 13,
            fecha_limite: new Date(2024, 11, 25),
            dias_restantes: 17,
            prioridad: 'media'
          }
        ],
        alertas: [
          {
            id: 1,
            tipo: 'vencimiento_proximo',
            sitio: user?.proveedor?.nombre === 'Grupo Activo SRL' ? 'Sede Central Florida' : 'APEX Centro',
            mensaje: 'Documentos vencen en 12 días',
            severidad: 'warning',
            fecha_limite: new Date(2024, 11, 20)
          },
          {
            id: 2,
            tipo: 'documentos_faltantes',
            sitio: user?.proveedor?.nombre === 'Grupo Activo SRL' ? 'Sucursal Sur' : 'CityTech Sur',
            mensaje: '5 secciones técnicas sin documentos',
            severidad: 'info',
            fecha_limite: new Date(2024, 11, 25)
          }
        ],
        actividadReciente: [
          {
            tipo: 'documento_cargado',
            descripcion: 'Documento Topology Network cargado exitosamente',
            timestamp: new Date(),
            auditoriaId: 1
          },
          {
            tipo: 'mensaje_auditor',
            descripcion: 'Nuevo mensaje del auditor en auditoría APEX Centro',
            timestamp: new Date(Date.now() - 30 * 60000),
            auditoriaId: 1
          },
          {
            tipo: 'estado_cambiado',
            descripcion: 'Auditoría Teleperformance Norte pasó a Pendiente Evaluación',
            timestamp: new Date(Date.now() - 2 * 60 * 60000),
            auditoriaId: 2
          }
        ],
        estadisticasGeneral: {
          sitios_totales: user?.proveedor?.nombre === 'Grupo Activo SRL' ? 1 : 3,
          documentos_cargados_mes: 25,
          cumplimiento_promedio: 87
        }
      };

      setDashboardData(datosSimulados);

    } catch (error) {
      console.error('Error cargando dashboard:', error);
      // Mantener datos por defecto en caso de error
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
            Dashboard - {user?.proveedor?.nombre || 'Proveedor'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              <Business />
            </Avatar>
            <Typography variant="subtitle1" color="text.secondary">
              Bienvenido, {user?.nombre || 'Usuario'}
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
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Assignment fontSize="large" />
                <Box>
                  <Typography variant="h4">{dashboardData.resumen.auditorias_activas}</Typography>
                  <Typography variant="body2">Auditorías Activas</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CloudUpload fontSize="large" />
                <Box>
                  <Typography variant="h4">{dashboardData.resumen.documentos_pendientes}</Typography>
                  <Typography variant="body2">Docs. Pendientes</Typography>
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
                  <Typography variant="h4">{dashboardData.resumen.alertas_criticas}</Typography>
                  <Typography variant="body2">Alertas Críticas</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Timeline fontSize="large" />
                <Box>
                  <Typography variant="h4">{dashboardData.estadisticasGeneral.cumplimiento_promedio}%</Typography>
                  <Typography variant="body2">Cumplimiento</Typography>
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
                          <Typography variant="h6" noWrap>
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
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CloudUpload />}
                            disabled={auditoria.estado === 'cerrada'}
                          >
                            Cargar Docs
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Chat />}
                          >
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
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardProveedores;