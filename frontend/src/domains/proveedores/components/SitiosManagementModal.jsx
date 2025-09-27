/**
 * Modal para gestión completa de sitios de un proveedor
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Close,
  Add,
  LocationOn,
  Business,
  Edit,
  Delete,
  Refresh
} from '@mui/icons-material';
import { useProveedoresStore } from '../store/proveedoresStore';
import CreateSitioModal from './CreateSitioModal';
import EditSitioModal from './EditSitioModal';
import DeleteSitioDialog from './DeleteSitioDialog';

const SitiosManagementModal = ({ open, onClose, proveedor }) => {
  const {
    sitios,
    loading,
    error,
    fetchSitiosByProveedor
  } = useProveedoresStore();

  const [createSitioOpen, setCreateSitioOpen] = useState(false);
  const [editSitioOpen, setEditSitioOpen] = useState(false);
  const [deleteSitioOpen, setDeleteSitioOpen] = useState(false);
  const [selectedSitio, setSelectedSitio] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch sitios when modal opens or proveedor changes
  useEffect(() => {
    if (open && proveedor) {
      loadSitios();
    }
  }, [open, proveedor]);

  const loadSitios = async () => {
    if (!proveedor) return;

    setRefreshing(true);
    try {
      await fetchSitiosByProveedor(proveedor.id);
    } catch (err) {
      console.error('Error loading sitios:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleCreateSitio = () => {
    setCreateSitioOpen(true);
  };

  const handleCloseCreateSitio = () => {
    setCreateSitioOpen(false);
    // Refresh the sitios list after creating a new one
    if (proveedor) {
      loadSitios();
    }
  };

  const handleEditSitio = (sitio) => {
    setSelectedSitio(sitio);
    setEditSitioOpen(true);
  };

  const handleCloseEditSitio = () => {
    setEditSitioOpen(false);
    setSelectedSitio(null);
    // Refresh the sitios list after editing
    if (proveedor) {
      loadSitios();
    }
  };

  const handleDeleteSitio = (sitio) => {
    setSelectedSitio(sitio);
    setDeleteSitioOpen(true);
  };

  const handleCloseDeleteSitio = () => {
    setDeleteSitioOpen(false);
    setSelectedSitio(null);
    // Refresh the sitios list after deleting
    if (proveedor) {
      loadSitios();
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo': return 'success';
      case 'inactivo': return 'default';
      case 'mantenimiento': return 'warning';
      default: return 'default';
    }
  };

  if (!proveedor) return null;

  // Filter sitios for this proveedor
  const proveedorSitios = sitios.filter(sitio => sitio.proveedor_id === proveedor.id);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        disableEscapeKeyDown={loading}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <Business color="primary" />
              <Box>
                <Typography variant="h6">
                  Gestión de Sitios
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {proveedor.nombre_comercial || proveedor.razon_social}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Tooltip title="Actualizar lista">
                <IconButton
                  onClick={loadSitios}
                  disabled={refreshing}
                  size="small"
                >
                  <Refresh sx={{
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
                </IconButton>
              </Tooltip>
              <IconButton onClick={handleClose} disabled={loading}>
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ minHeight: 400 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Header con botón de crear */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              Sitios Registrados ({proveedorSitios.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateSitio}
              size="small"
            >
              Agregar Sitio
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Loading state */}
          {(loading || refreshing) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Empty state */}
          {!loading && !refreshing && proveedorSitios.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <LocationOn sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay sitios registrados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Este proveedor no tiene sitios asignados. Comience agregando un nuevo sitio.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleCreateSitio}
              >
                Agregar Primer Sitio
              </Button>
            </Box>
          )}

          {/* Tabla de sitios */}
          {!loading && !refreshing && proveedorSitios.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Nombre del Sitio</strong></TableCell>
                    <TableCell><strong>Localidad</strong></TableCell>
                    <TableCell><strong>Domicilio</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {proveedorSitios.map((sitio) => (
                    <TableRow key={sitio.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business color="action" fontSize="small" />
                          <Typography variant="body2" fontWeight="medium">
                            {sitio.nombre_sitio}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn color="action" fontSize="small" />
                          {sitio.localidad}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {sitio.domicilio || 'No especificado'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={sitio.estado?.toUpperCase() || 'ACTIVO'}
                          color={getEstadoColor(sitio.estado)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title="Editar sitio">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditSitio(sitio)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar sitio">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteSitio(sitio)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClose} color="inherit">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para crear sitio */}
      <CreateSitioModal
        open={createSitioOpen}
        onClose={handleCloseCreateSitio}
        proveedor={proveedor}
      />

      {/* Modal para editar sitio */}
      <EditSitioModal
        open={editSitioOpen}
        onClose={handleCloseEditSitio}
        sitio={selectedSitio}
      />

      {/* Diálogo para eliminar sitio */}
      <DeleteSitioDialog
        open={deleteSitioOpen}
        onClose={handleCloseDeleteSitio}
        sitio={selectedSitio}
      />
    </>
  );
};

export default SitiosManagementModal;