// Dialog para Exportación de Reportes
// Checkpoint 2.10 - Interfaz para exportar reportes en múltiples formatos

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  Paper
} from '@mui/material';
import {
  Download as DownloadIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import useReportesStore from '../store/useReportesStore';

const tiposReporte = [
  {
    id: 'resumen_ejecutivo',
    nombre: 'Resumen Ejecutivo',
    descripcion: 'Métricas generales, estados de auditorías, progreso por proveedor y documentos por sección',
    icon: <AssessmentIcon />,
    disponiblePara: ['admin', 'auditor', 'visualizador']
  },
  {
    id: 'rendimiento_auditores',
    nombre: 'Rendimiento de Auditores',
    descripcion: 'Métricas de performance, eficiencia y tiempos promedio de auditores',
    icon: <PeopleIcon />,
    disponiblePara: ['admin']
  }
];

const formatosDisponibles = [
  {
    id: 'excel',
    nombre: 'Excel (.xlsx)',
    descripcion: 'Formato de hoja de cálculo compatible con Microsoft Excel',
    icon: <DescriptionIcon color="success" />
  }
];

const ExportacionDialog = ({ open, onClose, filtrosActivos }) => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState('resumen_ejecutivo');
  const [formatoSeleccionado, setFormatoSeleccionado] = useState('excel');
  
  const { exportarReporte, loadingExportacion, errorExportacion } = useReportesStore();

  const handleExportar = async () => {
    try {
      await exportarReporte(tipoSeleccionado, filtrosActivos, formatoSeleccionado);
      onClose();
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  const tipoReporteSeleccionado = tiposReporte.find(t => t.id === tipoSeleccionado);
  const formatoSeleccionadoData = formatosDisponibles.find(f => f.id === formatoSeleccionado);

  const hayFiltros = Object.values(filtrosActivos).some(v => v);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DownloadIcon color="primary" />
          <Typography variant="h6">
            Exportar Reporte
          </Typography>
        </Box>
        <Button
          onClick={onClose}
          sx={{ minWidth: 'auto', p: 0.5 }}
          color="inherit"
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent>
        {errorExportacion && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorExportacion}
          </Alert>
        )}

        {/* Información de filtros */}
        {hayFiltros && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="subtitle2" gutterBottom>
              Filtros aplicados al reporte:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.entries(filtrosActivos).map(([key, value]) => {
                if (!value) return null;
                
                const labels = {
                  periodo: 'Período',
                  proveedor_id: 'Proveedor',
                  fecha_desde: 'Desde',
                  fecha_hasta: 'Hasta'
                };
                
                return (
                  <Chip
                    key={key}
                    label={`${labels[key]}: ${value}`}
                    size="small"
                    sx={{ bgcolor: 'white', color: 'primary.main' }}
                  />
                );
              })}
            </Box>
          </Paper>
        )}

        <Grid container spacing={3}>
          {/* Selección de Tipo de Reporte */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Tipo de Reporte
            </Typography>
            
            <RadioGroup
              value={tipoSeleccionado}
              onChange={(e) => setTipoSeleccionado(e.target.value)}
            >
              {tiposReporte.map((tipo) => (
                <Paper
                  key={tipo.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: tipoSeleccionado === tipo.id ? 2 : 1,
                    borderColor: tipoSeleccionado === tipo.id ? 'primary.main' : 'divider',
                    cursor: 'pointer'
                  }}
                  onClick={() => setTipoSeleccionado(tipo.id)}
                >
                  <FormControlLabel
                    value={tipo.id}
                    control={<Radio />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          {tipo.icon}
                          <Typography variant="subtitle2" fontWeight="bold">
                            {tipo.nombre}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          {tipo.descripcion}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {tipo.disponiblePara.map((rol) => (
                            <Chip
                              key={rol}
                              label={rol}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      </Box>
                    }
                    sx={{ m: 0, alignItems: 'flex-start' }}
                  />
                </Paper>
              ))}
            </RadioGroup>
          </Grid>

          {/* Selección de Formato */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Formato de Exportación
            </Typography>
            
            <RadioGroup
              value={formatoSeleccionado}
              onChange={(e) => setFormatoSeleccionado(e.target.value)}
            >
              {formatosDisponibles.map((formato) => (
                <Paper
                  key={formato.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: formatoSeleccionado === formato.id ? 2 : 1,
                    borderColor: formatoSeleccionado === formato.id ? 'primary.main' : 'divider',
                    cursor: 'pointer'
                  }}
                  onClick={() => setFormatoSeleccionado(formato.id)}
                >
                  <FormControlLabel
                    value={formato.id}
                    control={<Radio />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          {formato.icon}
                          <Typography variant="subtitle2" fontWeight="bold">
                            {formato.nombre}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          {formato.descripcion}
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, alignItems: 'flex-start' }}
                  />
                </Paper>
              ))}
            </RadioGroup>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Resumen de selección */}
        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom>
            Resumen de la exportación:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {tipoReporteSeleccionado?.icon}
            <Typography variant="body2">
              <strong>Reporte:</strong> {tipoReporteSeleccionado?.nombre}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {formatoSeleccionadoData?.icon}
            <Typography variant="body2">
              <strong>Formato:</strong> {formatoSeleccionadoData?.nombre}
            </Typography>
          </Box>
          {hayFiltros ? (
            <Typography variant="body2" color="primary.main">
              <strong>Filtros:</strong> Se aplicarán los filtros activos del dashboard
            </Typography>
          ) : (
            <Typography variant="body2" color="textSecondary">
              <strong>Datos:</strong> Se exportarán todos los datos disponibles
            </Typography>
          )}
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          disabled={loadingExportacion}
          color="inherit"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleExportar}
          variant="contained"
          disabled={loadingExportacion}
          startIcon={loadingExportacion ? <CircularProgress size={16} /> : <DownloadIcon />}
        >
          {loadingExportacion ? 'Generando...' : 'Exportar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportacionDialog;