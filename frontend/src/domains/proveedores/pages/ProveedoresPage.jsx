import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import { Add, Business, Search, FilterList } from '@mui/icons-material';
import ProveedoresTable from '../components/ProveedoresTable';
import { useProveedoresStore } from '../store/proveedoresStore';

/**
 * Página de gestión de proveedores - Administradores y auditores
 */
const ProveedoresPage = () => {
  const { filters, setFilters, error } = useProveedoresStore();
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  const handleEdit = (proveedor) => {
    setNotification({
      open: true,
      message: `Editando ${proveedor.razon_social}`,
      type: 'info'
    });
  };

  const handleDelete = (proveedor) => {
    setNotification({
      open: true,
      message: `Eliminar ${proveedor.razon_social}`,
      type: 'warning'
    });
  };

  const handleViewSitios = (proveedor) => {
    setNotification({
      open: true,
      message: `Gestionando sitios de ${proveedor.nombre_comercial}`,
      type: 'info'
    });
  };

  const handleCreateProveedor = () => {
    setNotification({
      open: true,
      message: 'Crear nuevo proveedor',
      type: 'info'
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Gestión de Proveedores
          </Typography>
          <Chip
            icon={<Business />}
            label="Sistema Completo - 5 Proveedores, 11 Sitios"
            color="success"
            size="small"
          />
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          color="primary"
          onClick={handleCreateProveedor}
        >
          Nuevo Proveedor
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterList sx={{ mr: 1 }} />
            Filtros de Búsqueda
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Buscar por razón social, CUIT o nombre comercial"
                variant="outlined"
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Estado"
                value={filters.estado}
                onChange={(e) => setFilters({ estado: e.target.value })}
              >
                <MenuItem value="todos">Todos los estados</MenuItem>
                <MenuItem value="activo">Activos</MenuItem>
                <MenuItem value="inactivo">Inactivos</MenuItem>
                <MenuItem value="suspendido">Suspendidos</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Localidad"
                value={filters.localidad}
                onChange={(e) => setFilters({ localidad: e.target.value })}
              >
                <MenuItem value="todas">Todas las localidades</MenuItem>
                <MenuItem value="CABA">CABA</MenuItem>
                <MenuItem value="CORDOBA">CÓRDOBA</MenuItem>
                <MenuItem value="CHACO">CHACO</MenuItem>
                <MenuItem value="TUCUMAN">TUCUMÁN</MenuItem>
                <MenuItem value="ROSARIO">ROSARIO</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabla de Proveedores */}
      <ProveedoresTable
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewSitios={handleViewSitios}
      />

      {/* Notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProveedoresPage;
