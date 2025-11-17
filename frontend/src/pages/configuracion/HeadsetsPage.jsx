import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Grid,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Headset as HeadsetIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { apiClient } from '../../shared/utils/authService';

/**
 * HeadsetsPage
 *
 * Página de administración de headsets homologados
 * CRUD completo con filtros y estadísticas
 */
const HeadsetsPage = () => {
  // Estados
  const [headsets, setHeadsets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' | 'edit'
  const [currentHeadset, setCurrentHeadset] = useState(null);
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    conector: 'USB',
    activo: true,
    observaciones: ''
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState(null);

  // Filtros
  const [search, setSearch] = useState('');
  const [filterMarca, setFilterMarca] = useState('');
  const [filterConector, setFilterConector] = useState('');
  const [filterActivo, setFilterActivo] = useState('');

  // Cargar datos al montar
  useEffect(() => {
    cargarHeadsets();
    cargarEstadisticas();
  }, []);

  // Cargar headsets con filtros
  const cargarHeadsets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterMarca) params.append('marca', filterMarca);
      if (filterConector) params.append('conector', filterConector);
      if (filterActivo !== '') params.append('activo', filterActivo);
      params.append('limit', '1000');

      const response = await apiClient.get(`/headsets?${params.toString()}`);

      setHeadsets(response.data.data || []);
    } catch (error) {
      console.error('Error cargando headsets:', error);
      showAlert('Error al cargar headsets', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      const response = await apiClient.get('/headsets/estadisticas');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  // Abrir diálogo crear
  const handleCreate = () => {
    setDialogMode('create');
    setCurrentHeadset(null);
    setFormData({
      marca: '',
      modelo: '',
      conector: 'USB',
      activo: true,
      observaciones: ''
    });
    setErrors({});
    setDialogOpen(true);
  };

  // Abrir diálogo editar
  const handleEdit = (headset) => {
    setDialogMode('edit');
    setCurrentHeadset(headset);
    setFormData({
      marca: headset.marca,
      modelo: headset.modelo,
      conector: headset.conector,
      activo: headset.activo,
      observaciones: headset.observaciones || ''
    });
    setErrors({});
    setDialogOpen(true);
  };

  // Eliminar (desactivar) headset
  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de desactivar este headset?')) return;

    try {
      await apiClient.delete(`/headsets/${id}`);
      showAlert('Headset desactivado exitosamente', 'success');
      cargarHeadsets();
      cargarEstadisticas();
    } catch (error) {
      console.error('Error eliminando headset:', error);
      showAlert(error.response?.data?.message || 'Error al eliminar headset', 'error');
    }
  };

  // Guardar headset (crear o editar)
  const handleSave = async () => {
    // Validar
    const newErrors = {};
    if (!formData.marca.trim()) newErrors.marca = 'La marca es obligatoria';
    if (!formData.modelo.trim()) newErrors.modelo = 'El modelo es obligatorio';
    if (!formData.conector.trim()) newErrors.conector = 'El conector es obligatorio';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (dialogMode === 'create') {
        // Crear
        await apiClient.post('/headsets', formData);
        showAlert('Headset creado exitosamente', 'success');
      } else {
        // Editar
        await apiClient.put(`/headsets/${currentHeadset.id}`, formData);
        showAlert('Headset actualizado exitosamente', 'success');
      }

      setDialogOpen(false);
      cargarHeadsets();
      cargarEstadisticas();
    } catch (error) {
      console.error('Error guardando headset:', error);
      showAlert(error.response?.data?.message || 'Error al guardar headset', 'error');
    }
  };

  // Mostrar alerta
  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
    setTimeout(() => setAlert({ open: false, message: '', severity: 'success' }), 5000);
  };

  // Aplicar filtros
  const handleApplyFilters = () => {
    cargarHeadsets();
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearch('');
    setFilterMarca('');
    setFilterConector('');
    setFilterActivo('');
    setTimeout(() => cargarHeadsets(), 100);
  };

  // Columnas de la tabla
  const columns = [
    {
      field: 'marca',
      headerName: 'Marca',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'modelo',
      headerName: 'Modelo',
      width: 250,
      flex: 1
    },
    {
      field: 'conector',
      headerName: 'Conector',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'USB' ? 'primary' : 'default'}
        />
      )
    },
    {
      field: 'activo',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Activo' : 'Inactivo'}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      )
    },
    {
      field: 'observaciones',
      headerName: 'Observaciones',
      width: 200,
      flex: 1
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id)}
            disabled={!params.row.activo}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  // Obtener marcas y conectores únicos para filtros
  const marcasUnicas = [...new Set(headsets.map(h => h.marca))].sort();
  const conectoresUnicos = [...new Set(headsets.map(h => h.conector))].sort();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <HeadsetIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Headsets Homologados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestión de headsets autorizados para validación
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Nuevo Headset
        </Button>
      </Box>

      {/* Alert */}
      {alert.open && (
        <Alert severity={alert.severity} onClose={() => setAlert({ ...alert, open: false })} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {/* Estadísticas */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Total Headsets
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Activos
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {stats.activos}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Marcas
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.porMarca?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Conectores
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.porConector?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Buscar"
              placeholder="Marca o modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
              InputProps={{
                endAdornment: <SearchIcon color="action" />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Marca</InputLabel>
              <Select
                value={filterMarca}
                onChange={(e) => setFilterMarca(e.target.value)}
                label="Marca"
              >
                <MenuItem value="">Todas</MenuItem>
                {marcasUnicas.map(marca => (
                  <MenuItem key={marca} value={marca}>{marca}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Conector</InputLabel>
              <Select
                value={filterConector}
                onChange={(e) => setFilterConector(e.target.value)}
                label="Conector"
              >
                <MenuItem value="">Todos</MenuItem>
                {conectoresUnicos.map(conector => (
                  <MenuItem key={conector} value={conector}>{conector}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={filterActivo}
                onChange={(e) => setFilterActivo(e.target.value)}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Activo</MenuItem>
                <MenuItem value="false">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleApplyFilters}
                fullWidth
              >
                Buscar
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
              >
                Limpiar
              </Button>
              <IconButton onClick={cargarHeadsets} color="primary">
                <RefreshIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla */}
      <Paper sx={{ height: 600, width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={headsets}
            columns={columns}
            pageSize={20}
            rowsPerPageOptions={[10, 20, 50, 100]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none'
              }
            }}
          />
        )}
      </Paper>

      {/* Diálogo Crear/Editar */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Nuevo Headset Homologado' : 'Editar Headset'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Marca"
              value={formData.marca}
              onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
              error={!!errors.marca}
              helperText={errors.marca}
              placeholder="Ej: Jabra, Plantronics, Logitech"
            />
            <TextField
              fullWidth
              label="Modelo"
              value={formData.modelo}
              onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
              error={!!errors.modelo}
              helperText={errors.modelo}
              placeholder="Ej: Biz 2300 Duo"
            />
            <FormControl fullWidth error={!!errors.conector}>
              <InputLabel>Tipo de Conector</InputLabel>
              <Select
                value={formData.conector}
                onChange={(e) => setFormData({ ...formData, conector: e.target.value })}
                label="Tipo de Conector"
              >
                <MenuItem value="USB">USB</MenuItem>
                <MenuItem value="Plug">Plug</MenuItem>
                <MenuItem value="QD">QD</MenuItem>
                <MenuItem value="RJ9">RJ9</MenuItem>
                <MenuItem value="Wireless">Wireless</MenuItem>
                <MenuItem value="Base Inalámbrica">Base Inalámbrica</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Observaciones"
              multiline
              rows={3}
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Notas adicionales (opcional)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                />
              }
              label="Activo"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave}>
            {dialogMode === 'create' ? 'Crear' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HeadsetsPage;
