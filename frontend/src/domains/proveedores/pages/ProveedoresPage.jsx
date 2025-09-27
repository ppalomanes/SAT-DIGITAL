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
import EditProveedorModal from '../components/EditProveedorModal';
import CreateProveedorModal from '../components/CreateProveedorModal';
import SitiosManagementModal from '../components/SitiosManagementModal';
import DeleteProveedorDialog from '../components/DeleteProveedorDialog';
import { useProveedoresStore } from '../store/proveedoresStore';

/**
 * Página de gestión de proveedores - Administradores y auditores
 */
const ProveedoresPage = () => {
  const { filters, setFilters, error } = useProveedoresStore();
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  // Estado para modales
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [sitiosModalOpen, setSitiosModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);

  const handleEdit = (proveedor) => {
    setSelectedProveedor(proveedor);
    setEditModalOpen(true);
  };

  const handleDelete = (proveedor) => {
    setSelectedProveedor(proveedor);
    setDeleteDialogOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedProveedor(null);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
  };

  const handleCloseSitiosModal = () => {
    setSitiosModalOpen(false);
    setSelectedProveedor(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedProveedor(null);
  };

  const handleViewSitios = (proveedor) => {
    setSelectedProveedor(proveedor);
    setSitiosModalOpen(true);
  };

  const handleCreateProveedor = () => {
    setCreateModalOpen(true);
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

      {/* Modal de Creación */}
      <CreateProveedorModal
        open={createModalOpen}
        onClose={handleCloseCreateModal}
      />

      {/* Modal de Edición */}
      <EditProveedorModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        proveedor={selectedProveedor}
      />

      {/* Modal de Gestión de Sitios */}
      <SitiosManagementModal
        open={sitiosModalOpen}
        onClose={handleCloseSitiosModal}
        proveedor={selectedProveedor}
      />

      {/* Diálogo de Eliminación */}
      <DeleteProveedorDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        proveedor={selectedProveedor}
      />
    </Box>
  );
};

export default ProveedoresPage;
