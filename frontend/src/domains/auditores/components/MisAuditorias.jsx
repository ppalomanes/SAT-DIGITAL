/**
 * SAT-Digital Frontend - Mis Auditorías
 * Checkpoint 2.5: Panel de Control para Auditores
 * 
 * Tabla con filtros avanzados para las auditorías asignadas al auditor
 */

import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  FileDownload as DownloadIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

import useAuditoresStore from '../store/useAuditoresStore';

dayjs.locale('es');

const MisAuditorias = () => {
  const [filtrosVisible, setFiltrosVisible] = useState(false);
  const [auditoriaSeleccionada, setAuditoriaSeleccionada] = useState(null);
  const [dialogoEstado, setDialogoEstado] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Filtros locales
  const [filtros, setFiltros] = useState({
    periodo: '',
    estado: '',
    proveedor_id: null,
    fecha_desde: null,
    fecha_hasta: null,
    sitio_id: null
  });

  const {
    misAuditorias,
    loading,
    error,
    obtenerMisAuditorias,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    actualizarEstadoAuditoria,
    exportarReporte,
    clearError
  } = useAuditoresStore();

  useEffect(() => {
    obtenerMisAuditorias();
  }, []);

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleAplicarFiltros = () => {
    aplicarFiltros(filtros);
    setFiltrosVisible(false);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      periodo: '',
      estado: '',
      proveedor_id: null,
      fecha_desde: null,
      fecha_hasta: null,
      sitio_id: null
    });
    limpiarFiltros();
  };

  const handleCambiarEstado = async (auditoria) => {
    setAuditoriaSeleccionada(auditoria);
    setNuevoEstado('');
    setObservaciones('');
    setDialogoEstado(true);
  };

  const handleConfirmarCambioEstado = async () => {
    if (auditoriaSeleccionada && nuevoEstado) {
      const resultado = await actualizarEstadoAuditoria(
        auditoriaSeleccionada.id,
        nuevoEstado,
        observaciones
      );
      
      if (resultado) {
        setDialogoEstado(false);
        setAuditoriaSeleccionada(null);
      }
    }
  };

  const handleExportar = async () => {
    const configuracion = {
      formato: 'csv',
      incluir_detalles: true,
      incluir_conversaciones: false
    };
    
    await exportarReporte(configuracion);
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'programada': 'default',
      'en_carga': 'info',
      'pendiente_evaluacion': 'warning',
      'evaluada': 'success',
      'cerrada': 'secondary'
    };
    return colores[estado] || 'default';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      'programada': 'Programada',
      'en_carga': 'En Carga',
      'pendiente_evaluacion': 'P. Evaluación',
      'evaluada': 'Evaluada',
      'cerrada': 'Cerrada'
    };
    return labels[estado] || estado;
  };

  const columnas = useMemo(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="monospace">
          #{params.value}
        </Typography>
      )
    },
    {
      field: 'sitio',
      headerName: 'Sitio',
      width: 200,
      valueGetter: (params) => params.row.sitio?.nombre || '',
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.sitio?.nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.sitio?.localidad}
          </Typography>
        </Box>
      )
    },
    {
      field: 'proveedor',
      headerName: 'Proveedor',
      width: 180,
      valueGetter: (params) => params.row.proveedor?.nombre || '',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.proveedor?.nombre}
        </Typography>
      )
    },
    {
      field: 'periodo',
      headerName: 'Período',
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          variant="outlined"
        />
      )
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 140,
      renderCell: (params) => (
        <Chip 
          label={getEstadoLabel(params.value)}
          color={getEstadoColor(params.value)}
          size="small"
          variant="filled"
        />
      )
    },
    {
      field: 'progreso',
      headerName: 'Progreso',
      width: 150,
      renderCell: (params) => {
        const progreso = params.row.progreso;
        return (
          <Box sx={{ width: '100%' }}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption">
                {progreso?.porcentaje || 0}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progreso?.secciones_cargadas || 0}/{progreso?.total_secciones || 13}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progreso?.porcentaje || 0}
              color={progreso?.porcentaje >= 100 ? 'success' : 'primary'}
            />
          </Box>
        );
      }
    },
    {
      field: 'fecha_limite_carga',
      headerName: 'Fecha Límite',
      width: 130,
      renderCell: (params) => {
        const fecha = dayjs(params.value);
        const esVencida = fecha.isBefore(dayjs());
        const esCercana = fecha.diff(dayjs(), 'days') <= 3;
        
        return (
          <Box display="flex" alignItems="center" gap={1}>
            {esVencida && <WarningIcon color="error" fontSize="small" />}
            {!esVencida && esCercana && <WarningIcon color="warning" fontSize="small" />}
            <Typography 
              variant="body2"
              color={esVencida ? 'error' : esCercana ? 'warning.main' : 'text.primary'}
            >
              {fecha.format('DD/MM/YYYY')}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'requiere_atencion',
      headerName: 'Atención',
      width: 100,
      renderCell: (params) => (
        params.value ? (
          <Tooltip title="Requiere atención">
            <WarningIcon color="warning" />
          </Tooltip>
        ) : (
          <Tooltip title="Al día">
            <CheckIcon color="success" />
          </Tooltip>
        )
      )
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={0.5}>
          <Tooltip title="Ver detalles">
            <IconButton 
              size="small"
              onClick={() => window.open(`/auditores/revision/${params.row.id}`, '_blank')}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {['pendiente_evaluacion', 'evaluada'].includes(params.row.estado) && (
            <Tooltip title="Cambiar estado">
              <IconButton 
                size="small"
                onClick={() => handleCambiarEstado(params.row)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    }
  ], []);

  if (loading && misAuditorias.auditorias.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando auditorías...
        </Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <div className="mis-auditorias">
        <Card sx={{ mb: 3, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h1">
              Mis Auditorías Asignadas
            </Typography>
            
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setFiltrosVisible(!filtrosVisible)}
              >
                Filtros
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportar}
              >
                Exportar
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Panel de filtros */}
          {filtrosVisible && (
            <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Filtros Avanzados
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Período</InputLabel>
                    <Select
                      value={filtros.periodo}
                      onChange={(e) => handleFiltroChange('periodo', e.target.value)}
                      label="Período"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="2025-05">Mayo 2025</MenuItem>
                      <MenuItem value="2025-11">Noviembre 2025</MenuItem>
                      <MenuItem value="2024-11">Noviembre 2024</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={filtros.estado}
                      onChange={(e) => handleFiltroChange('estado', e.target.value)}
                      label="Estado"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="programada">Programada</MenuItem>
                      <MenuItem value="en_carga">En Carga</MenuItem>
                      <MenuItem value="pendiente_evaluacion">P. Evaluación</MenuItem>
                      <MenuItem value="evaluada">Evaluada</MenuItem>
                      <MenuItem value="cerrada">Cerrada</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Fecha Desde"
                    value={filtros.fecha_desde ? dayjs(filtros.fecha_desde) : null}
                    onChange={(fecha) => handleFiltroChange('fecha_desde', fecha ? fecha.format('YYYY-MM-DD') : null)}
                    slotProps={{ 
                      textField: { 
                        size: 'small',
                        fullWidth: true
                      } 
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Fecha Hasta"
                    value={filtros.fecha_hasta ? dayjs(filtros.fecha_hasta) : null}
                    onChange={(fecha) => handleFiltroChange('fecha_hasta', fecha ? fecha.format('YYYY-MM-DD') : null)}
                    slotProps={{ 
                      textField: { 
                        size: 'small',
                        fullWidth: true
                      } 
                    }}
                  />
                </Grid>
              </Grid>
              
              <Box display="flex" gap={2} mt={3}>
                <Button
                  variant="contained"
                  onClick={handleAplicarFiltros}
                  disabled={loading}
                >
                  Aplicar Filtros
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleLimpiarFiltros}
                >
                  Limpiar
                </Button>
              </Box>
            </Card>
          )}

          {/* Tabla de auditorías */}
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={misAuditorias.auditorias}
              columns={columnas}
              loading={loading}
              pageSizeOptions={[10, 20, 50]}
              pagination
              paginationMode="server"
              rowCount={misAuditorias.pagination?.total_items || 0}
              page={(misAuditorias.pagination?.current_page || 1) - 1}
              pageSize={misAuditorias.pagination?.items_per_page || 20}
              onPaginationModelChange={(model) => {
                cambiarPagina(model.page + 1);
              }}
              disableRowSelectionOnClick
              localeText={{
                noRowsLabel: 'No hay auditorías asignadas',
                toolbarFilters: 'Filtros',
                toolbarExport: 'Exportar',
                columnMenuLabel: 'Menú',
                columnMenuShowColumns: 'Mostrar columnas',
                columnMenuFilter: 'Filtrar',
                columnMenuHideColumn: 'Ocultar',
                columnMenuUnsort: 'Desordenar',
                columnMenuSortAsc: 'Orden ascendente',
                columnMenuSortDesc: 'Orden descendente'
              }}
              sx={{
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            />
          </Box>
        </Card>

        {/* Diálogo para cambiar estado */}
        <Dialog open={dialogoEstado} onClose={() => setDialogoEstado(false)}>
          <DialogTitle>
            Cambiar Estado de Auditoría
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Auditoría: {auditoriaSeleccionada?.sitio?.nombre}
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Nuevo Estado</InputLabel>
                <Select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  label="Nuevo Estado"
                >
                  <MenuItem value="pendiente_evaluacion">Pendiente Evaluación</MenuItem>
                  <MenuItem value="evaluada">Evaluada</MenuItem>
                  <MenuItem value="cerrada">Cerrada</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observaciones (opcional)"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Agregar comentarios sobre el cambio de estado..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogoEstado(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmarCambioEstado}
              variant="contained"
              disabled={!nuevoEstado}
            >
              Confirmar Cambio
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
};

export default MisAuditorias;
