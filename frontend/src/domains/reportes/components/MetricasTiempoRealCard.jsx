// Card de Métricas en Tiempo Real
// Checkpoint 2.10 - Visualización de métricas actualizadas

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  Chat as ChatIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const MetricaCard = ({ title, value, icon, color = 'primary', subtitle, alert = false }) => (
  <Card sx={{ height: '100%', position: 'relative' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h3" color={alert ? 'error.main' : `${color}.main`}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ 
          color: alert ? 'error.main' : `${color}.main`,
          backgroundColor: alert ? 'error.light' : `${color}.light`,
          borderRadius: '50%',
          p: 1,
          display: 'flex'
        }}>
          {icon}
        </Box>
      </Box>
      {alert && (
        <Chip
          label="Requiere Atención"
          color="error"
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8 }}
        />
      )}
    </CardContent>
  </Card>
);

const MetricasTiempoRealCard = ({ metricas, loading, autoRefresh }) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Métricas en Tiempo Real
          </Typography>
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Skeleton variant="rectangular" height={140} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  if (!metricas) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            No hay métricas disponibles en este momento
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const {
    auditorias_mes = [],
    documentos_semana = 0,
    mensajes_hoy = 0,
    alertas_criticas = 0,
    timestamp
  } = metricas;

  // Calcular total de auditorías del mes
  const totalAuditoriasMes = auditorias_mes.reduce((acc, curr) => acc + curr.cantidad, 0);

  // Estados de auditorías agrupados
  const estadosData = auditorias_mes.reduce((acc, curr) => {
    acc[curr.estado] = curr.cantidad;
    return acc;
  }, {});

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" component="h2">
            Métricas en Tiempo Real
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {autoRefresh && (
              <Chip
                label="Auto-refresh"
                color="success"
                size="small"
                variant="outlined"
              />
            )}
            <Typography variant="caption" color="textSecondary">
              {timestamp ? `Actualizado: ${new Date(timestamp).toLocaleTimeString()}` : ''}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {/* Total Auditorías del Mes */}
          <Grid item xs={12} sm={6} md={3}>
            <MetricaCard
              title="Auditorías del Mes"
              value={totalAuditoriasMes}
              icon={<AssessmentIcon />}
              color="primary"
              subtitle={`${auditorias_mes.length} tipos de estado`}
            />
          </Grid>

          {/* Documentos de la Semana */}
          <Grid item xs={12} sm={6} md={3}>
            <MetricaCard
              title="Documentos Semana"
              value={documentos_semana}
              icon={<DescriptionIcon />}
              color="info"
              subtitle="Documentos cargados"
            />
          </Grid>

          {/* Mensajes de Hoy */}
          <Grid item xs={12} sm={6} md={3}>
            <MetricaCard
              title="Mensajes Hoy"
              value={mensajes_hoy}
              icon={<ChatIcon />}
              color="success"
              subtitle="Actividad de comunicación"
            />
          </Grid>

          {/* Alertas Críticas */}
          <Grid item xs={12} sm={6} md={3}>
            <MetricaCard
              title="Alertas Críticas"
              value={alertas_criticas}
              icon={<WarningIcon />}
              color="error"
              subtitle="Requieren atención"
              alert={alertas_criticas > 0}
            />
          </Grid>
        </Grid>

        {/* Detalle de Estados de Auditorías */}
        {auditorias_mes.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Distribución por Estados (Este Mes)
            </Typography>
            <Grid container spacing={1}>
              {auditorias_mes.map(({ estado, cantidad }) => (
                <Grid item key={estado}>
                  <Chip
                    label={`${estado}: ${cantidad}`}
                    variant="outlined"
                    size="small"
                    color={
                      estado === 'cerrada' ? 'success' :
                      estado === 'evaluada' ? 'info' :
                      estado === 'en_carga' ? 'warning' : 'default'
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Indicador de Actividad */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon color="success" fontSize="small" />
          <Typography variant="body2" color="textSecondary">
            Sistema operativo - Datos actualizados cada 30 segundos
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetricasTiempoRealCard;