// Card de Resumen Ejecutivo
// Checkpoint 2.10 - Visualización de métricas ejecutivas

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  Skeleton,
  Divider
} from '@mui/material';
import {
  PieChart as PieChartIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Chat as ChatIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

const ProgressBar = ({ label, value, total, color = 'primary' }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" color="textSecondary">
          {value}/{total} ({percentage}%)
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={color}
        sx={{ height: 8, borderRadius: 1 }}
      />
    </Box>
  );
};

const ResumenEjecutivoCard = ({ resumen, loading, filtrosActivos }) => {
  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Resumen Ejecutivo
          </Typography>
          <Box sx={{ mt: 2 }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} variant="rectangular" height={40} sx={{ mb: 1 }} />
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!resumen) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Alert severity="info">
            No hay datos de resumen disponibles
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const {
    resumen: resumenGeneral,
    progreso_proveedores = [],
    documentos_por_seccion = [],
    actividad_comunicacion = []
  } = resumen;

  const { total_auditorias = 0, estados = [] } = resumenGeneral || {};

  // Calcular totales por estado
  const totalesPorEstado = estados.reduce((acc, estado) => {
    acc[estado.estado] = estado.cantidad;
    return acc;
  }, {});

  // Agrupar progreso por proveedor
  const proveedoresAgrupados = progreso_proveedores.reduce((acc, item) => {
    if (!acc[item.proveedor]) {
      acc[item.proveedor] = { total: 0, estados: {} };
    }
    acc[item.proveedor].total += item.cantidad;
    acc[item.proveedor].estados[item.estado] = item.cantidad;
    return acc;
  }, {});

  const hayFiltros = Object.values(filtrosActivos).some(v => v);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon />
            Resumen Ejecutivo
          </Typography>
          {hayFiltros && (
            <Chip
              label="Filtrado"
              color="primary"
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Métricas Generales */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PieChartIcon color="primary" fontSize="small" />
                Estados de Auditorías
              </Typography>
              
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h4" color="primary.main" gutterBottom>
                  {total_auditorias}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total de auditorías
                </Typography>
              </Box>
            </Box>

            {/* Distribución por estados */}
            <Box sx={{ mb: 2 }}>
              {estados.map(({ estado, cantidad }) => {
                const color = 
                  estado === 'cerrada' ? 'success' :
                  estado === 'evaluada' ? 'info' :
                  estado === 'en_carga' ? 'warning' :
                  estado === 'pendiente_evaluacion' ? 'secondary' : 'primary';

                return (
                  <ProgressBar
                    key={estado}
                    label={estado.replace(/_/g, ' ').toUpperCase()}
                    value={cantidad}
                    total={total_auditorias}
                    color={color}
                  />
                );
              })}
            </Box>
          </Grid>

          {/* Progreso por Proveedores */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon color="primary" fontSize="small" />
              Progreso por Proveedor
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Proveedor</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(proveedoresAgrupados).map(([proveedor, data]) => (
                    <TableRow key={proveedor}>
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" noWrap>
                          {proveedor}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {data.total}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                          {Object.entries(data.estados).map(([estado, cantidad]) => (
                            <Chip
                              key={estado}
                              label={`${estado}: ${cantidad}`}
                              size="small"
                              variant="outlined"
                              color={
                                estado === 'cerrada' ? 'success' :
                                estado === 'evaluada' ? 'info' :
                                estado === 'en_carga' ? 'warning' : 'default'
                              }
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Documentos por Sección */}
          {documentos_por_seccion.length > 0 && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon color="primary" fontSize="small" />
                Top Secciones con más Documentos
              </Typography>
              
              <Grid container spacing={1}>
                {documentos_por_seccion
                  .sort((a, b) => b.cantidad - a.cantidad)
                  .slice(0, 8)
                  .map((seccion, index) => (
                  <Grid item xs={12} sm={6} md={3} key={seccion.codigo}>
                    <Box sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h6" color="primary.main">
                        {seccion.cantidad}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" noWrap>
                        {seccion.seccion}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {seccion.codigo}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}

          {/* Actividad de Comunicación */}
          {actividad_comunicacion.length > 0 && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChatIcon color="primary" fontSize="small" />
                Actividad de Comunicación (Últimos 7 días)
              </Typography>
              
              <Grid container spacing={1}>
                {actividad_comunicacion.slice(0, 7).map((actividad, index) => (
                  <Grid item key={actividad.fecha}>
                    <Box sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center', minWidth: 80 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {actividad.mensajes}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        mensajes
                      </Typography>
                      <Typography variant="caption" display="block" color="textSecondary">
                        {new Date(actividad.fecha).toLocaleDateString('es-ES', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ResumenEjecutivoCard;