/**
 * PliegoRequisitosPanel.jsx
 *
 * Panel informativo que muestra los requisitos mínimos del pliego asociado
 * y los resultados de validación tras procesar el Excel.
 *
 * @author SAT-Digital Team
 * @version 1.0.0
 * @since Checkpoint 2.11 - Validación Automática con Pliegos
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  Grid,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Error,
  Warning,
  Info,
  Memory,
  Storage,
  Computer,
  Speed
} from '@mui/icons-material';
import { obtenerColorPuntuacion, obtenerEtiquetaPuntuacion } from '../../../utils/pliegoValidator';

/**
 * Panel de requisitos del pliego
 */
const PliegoRequisitosPanel = ({ pliego, resultadosValidacion }) => {
  if (!pliego) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Este período no tiene un pliego de requisitos asociado.
          Los equipos se validarán con criterios generales.
        </Typography>
      </Alert>
    );
  }

  const requisitos = pliego.parque_informatico;

  return (
    <Box sx={{ mb: 3 }}>
      {/* Header del pliego */}
      <Card sx={{ mb: 2, bgcolor: 'primary.50', borderLeft: '4px solid', borderColor: 'primary.main' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Info color="primary" />
            <Typography variant="h6" color="primary">
              Pliego de Requisitos: {pliego.nombre}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Código: <strong>{pliego.codigo}</strong>
          </Typography>
          {pliego.descripcion && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {pliego.descripcion}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Requisitos Mínimos */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1" fontWeight="bold">
            <Computer sx={{ verticalAlign: 'middle', mr: 1 }} />
            Requisitos Mínimos de Hardware
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Procesadores */}
            {requisitos.procesadores_aceptados && requisitos.procesadores_aceptados.length > 0 && (
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Speed color="primary" />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Procesadores Aceptados
                    </Typography>
                  </Box>
                  <List dense>
                    {requisitos.procesadores_aceptados.map((proc, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircle fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${proc.marca} ${proc.familia_min}`}
                          secondary={proc.aceptar_superior ? 'o superior' : 'exacto'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Grid>
            )}

            {/* RAM */}
            {requisitos.ram_minima_gb && (
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Memory color="primary" />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Memoria RAM Mínima
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="primary.main">
                    {requisitos.ram_minima_gb} GB
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Discos */}
            {requisitos.discos && requisitos.discos.length > 0 && (
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Storage color="primary" />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Almacenamiento Requerido
                    </Typography>
                  </Box>
                  <List dense>
                    {requisitos.discos.map((disco, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircle fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${disco.tipo} ${disco.capacidad_gb}GB mínimo`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Grid>
            )}

            {/* Sistema Operativo */}
            {requisitos.sistema_operativo && (
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Computer color="primary" />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Sistema Operativo
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {requisitos.sistema_operativo}
                    {requisitos.sistema_operativo_version_min && requisitos.sistema_operativo_version_min !== '0' && (
                      <Typography variant="body2" color="text.secondary">
                        Versión mínima: {requisitos.sistema_operativo_version_min}
                      </Typography>
                    )}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Resultados de Validación */}
      {resultadosValidacion && resultadosValidacion.validado && (
        <Accordion defaultExpanded sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1" fontWeight="bold">
              Resultados de Validación
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ResultadosValidacion resultados={resultadosValidacion} />
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

/**
 * Componente de resultados de validación
 */
const ResultadosValidacion = ({ resultados }) => {
  const stats = resultados.estadisticas;

  return (
    <Box>
      {/* Resumen General */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'success.50', borderLeft: '4px solid', borderColor: 'success.main' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Equipos que Cumplen
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.cumplen}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                de {stats.total} equipos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'error.50', borderLeft: '4px solid', borderColor: 'error.main' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                No Cumplen
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.no_cumplen}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                equipos con errores
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'warning.50', borderLeft: '4px solid', borderColor: 'warning.main' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Con Advertencias
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.con_warnings}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                equipos con warnings
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'info.50', borderLeft: '4px solid', borderColor: 'info.main' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Puntuación Promedio
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.puntuacion_promedio}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                de 100 puntos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barra de Cumplimiento */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2" fontWeight="bold">
            Porcentaje de Cumplimiento General
          </Typography>
          <Chip
            label={`${stats.porcentaje_cumplimiento}%`}
            color={obtenerColorPuntuacion(stats.porcentaje_cumplimiento)}
            size="small"
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={stats.porcentaje_cumplimiento}
          color={obtenerColorPuntuacion(stats.porcentaje_cumplimiento)}
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>

      {/* Errores por Campo */}
      {Object.keys(stats.errores_por_campo).some(k => stats.errores_por_campo[k] > 0) && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Errores Comunes por Campo
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(stats.errores_por_campo).map(([campo, cantidad]) => (
              cantidad > 0 && (
                <Grid item xs={12} sm={6} md={3} key={campo}>
                  <Box display="flex" alignItems="center" gap={1} sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Error fontSize="small" color="error" />
                    <Box>
                      <Typography variant="caption" display="block" sx={{ textTransform: 'capitalize' }}>
                        {campo}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {cantidad} equipos
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )
            ))}
          </Grid>
        </Box>
      )}

      {/* Distribución de Puntuación */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Distribución de Calidad
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center" sx={{ p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
              <Typography variant="h5" color="success.main">
                {stats.distribucion_puntuacion.excelente}
              </Typography>
              <Typography variant="caption">Excelente (90-100)</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center" sx={{ p: 1, bgcolor: 'info.50', borderRadius: 1 }}>
              <Typography variant="h5" color="info.main">
                {stats.distribucion_puntuacion.bueno}
              </Typography>
              <Typography variant="caption">Bueno (70-89)</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center" sx={{ p: 1, bgcolor: 'warning.50', borderRadius: 1 }}>
              <Typography variant="h5" color="warning.main">
                {stats.distribucion_puntuacion.regular}
              </Typography>
              <Typography variant="caption">Regular (50-69)</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center" sx={{ p: 1, bgcolor: 'error.50', borderRadius: 1 }}>
              <Typography variant="h5" color="error.main">
                {stats.distribucion_puntuacion.deficiente}
              </Typography>
              <Typography variant="caption">Deficiente (0-49)</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default PliegoRequisitosPanel;
