// Dashboard de Analytics y Reportes
// Checkpoint 2.10 - Interfaz principal para visualización de métricas

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import useReportesStore from '../store/useReportesStore';
import ResumenEjecutivoCard from './ResumenEjecutivoCard';
import MetricasTiempoRealCard from './MetricasTiempoRealCard';
import RendimientoAuditoresCard from './RendimientoAuditoresCard';
import ExportacionDialog from './ExportacionDialog';

const AnalyticsDashboard = () => {
  const {
    // Estados
    resumenEjecutivo,
    rendimientoAuditores,
    metricasTiempoReal,
    periodosDisponibles,
    proveedoresDisponibles,
    filtrosActivos,
    
    // Loading states
    loadingResumen,
    loadingRendimiento,
    loadingMetricas,
    loadingPeriodos,
    loadingProveedores,
    
    // Errores
    errorResumen,
    errorRendimiento,
    errorMetricas,
    
    // Acciones
    obtenerResumenEjecutivo,
    obtenerRendimientoAuditores,
    obtenerMetricasTiempoReal,
    obtenerPeriodosDisponibles,
    obtenerProveedoresDisponibles,
    actualizarFiltros,
    limpiarFiltros,
    limpiarErrores,
    refrescarMetricas
  } = useReportesStore();

  const [filtrosLocales, setFiltrosLocales] = useState({
    periodo: '',
    proveedor_id: '',
    fecha_desde: null,
    fecha_hasta: null
  });
  
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Cargar datos iniciales y configurar auto-refresh
  useEffect(() => {
    cargarDatosIniciales();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        refrescarMetricas();
      }, 30000); // Refrescar cada 30 segundos
      
      setRefreshInterval(interval);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh]);

  // Cargar períodos y proveedores disponibles
  useEffect(() => {
    obtenerPeriodosDisponibles();
    obtenerProveedoresDisponibles();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      await Promise.all([
        obtenerMetricasTiempoReal(),
        obtenerResumenEjecutivo(),
        obtenerRendimientoAuditores()
      ]);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    }
  };

  const aplicarFiltros = async () => {
    try {
      limpiarErrores();
      
      const filtros = {};
      if (filtrosLocales.periodo) filtros.periodo = filtrosLocales.periodo;
      if (filtrosLocales.proveedor_id) filtros.proveedor_id = filtrosLocales.proveedor_id;
      if (filtrosLocales.fecha_desde) filtros.fecha_desde = filtrosLocales.fecha_desde.format('YYYY-MM-DD');
      if (filtrosLocales.fecha_hasta) filtros.fecha_hasta = filtrosLocales.fecha_hasta.format('YYYY-MM-DD');

      actualizarFiltros(filtros);
      
      await Promise.all([
        obtenerResumenEjecutivo(filtros),
        obtenerRendimientoAuditores(filtros)
      ]);
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
    }
  };

  const limpiarFiltrosHandler = async () => {
    setFiltrosLocales({
      periodo: '',
      proveedor_id: '',
      fecha_desde: null,
      fecha_hasta: null
    });
    
    limpiarFiltros();
    await cargarDatosIniciales();
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
    if (refreshInterval && !autoRefresh) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  };

  const refrescarDatos = async () => {
    await cargarDatosIniciales();
  };

  // Verificar si hay filtros aplicados
  const hayFiltrosActivos = Object.values(filtrosActivos).some(value => 
    value !== null && value !== undefined && value !== ''
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon color="primary" />
            Analytics y Reportes
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Tooltip title={autoRefresh ? 'Deshabilitar auto-refresh' : 'Habilitar auto-refresh'}>
              <Button
                variant={autoRefresh ? 'contained' : 'outlined'}
                size="small"
                onClick={toggleAutoRefresh}
                startIcon={<RefreshIcon />}
              >
                Auto-refresh
              </Button>
            </Tooltip>
            
            <Button
              variant="outlined"
              onClick={refrescarDatos}
              disabled={loadingResumen || loadingRendimiento || loadingMetricas}
              startIcon={<RefreshIcon />}
            >
              Refrescar
            </Button>
            
            <Button
              variant="contained"
              onClick={() => setExportDialogOpen(true)}
              startIcon={<DownloadIcon />}
            >
              Exportar
            </Button>
          </Box>
        </Box>

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            Filtros
            {hayFiltrosActivos && (
              <Chip
                label={`${Object.values(filtrosActivos).filter(v => v).length} activos`}
                size="small"
                color="primary"
              />
            )}
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Período</InputLabel>
                <Select
                  value={filtrosLocales.periodo}
                  label="Período"
                  onChange={(e) => setFiltrosLocales(prev => ({ ...prev, periodo: e.target.value }))}
                  disabled={loadingPeriodos}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {periodosDisponibles.map((periodo) => (
                    <MenuItem key={periodo} value={periodo}>
                      {periodo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Proveedor</InputLabel>
                <Select
                  value={filtrosLocales.proveedor_id}
                  label="Proveedor"
                  onChange={(e) => setFiltrosLocales(prev => ({ ...prev, proveedor_id: e.target.value }))}
                  disabled={loadingProveedores}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {proveedoresDisponibles.map((proveedor) => (
                    <MenuItem key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.5}>
              <DatePicker
                label="Fecha Desde"
                value={filtrosLocales.fecha_desde}
                onChange={(newValue) => setFiltrosLocales(prev => ({ ...prev, fecha_desde: newValue }))}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.5}>
              <DatePicker
                label="Fecha Hasta"
                value={filtrosLocales.fecha_hasta}
                onChange={(newValue) => setFiltrosLocales(prev => ({ ...prev, fecha_hasta: newValue }))}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={aplicarFiltros}
                  disabled={loadingResumen || loadingRendimiento}
                  fullWidth
                >
                  Aplicar
                </Button>
                <Button
                  variant="outlined"
                  onClick={limpiarFiltrosHandler}
                  disabled={loadingResumen || loadingRendimiento}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  Limpiar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Errores */}
        {(errorResumen || errorRendimiento || errorMetricas) && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={limpiarErrores}>
            {errorResumen || errorRendimiento || errorMetricas}
          </Alert>
        )}

        {/* Métricas en tiempo real */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MetricasTiempoRealCard 
              metricas={metricasTiempoReal}
              loading={loadingMetricas}
              autoRefresh={autoRefresh}
            />
          </Grid>

          {/* Resumen ejecutivo */}
          <Grid item xs={12} lg={8}>
            <ResumenEjecutivoCard 
              resumen={resumenEjecutivo}
              loading={loadingResumen}
              filtrosActivos={filtrosActivos}
            />
          </Grid>

          {/* Rendimiento auditores */}
          <Grid item xs={12} lg={4}>
            <RendimientoAuditoresCard 
              rendimiento={rendimientoAuditores}
              loading={loadingRendimiento}
            />
          </Grid>
        </Grid>

        {/* Dialog de exportación */}
        <ExportacionDialog
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          filtrosActivos={filtrosActivos}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default AnalyticsDashboard;