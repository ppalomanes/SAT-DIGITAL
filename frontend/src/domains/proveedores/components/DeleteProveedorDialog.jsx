/**
 * Diálogo de confirmación para eliminar proveedores
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  Warning,
  Delete,
  Business,
  LocationOn,
  Info
} from '@mui/icons-material';
import { useProveedoresStore } from '../store/proveedoresStore';

const DeleteProveedorDialog = ({ open, onClose, proveedor }) => {
  const { deleteProveedor, sitios, loading } = useProveedoresStore();
  const [error, setError] = useState(null);

  // Get sites for this provider
  const sitiosProveedor = proveedor
    ? sitios.filter(sitio => sitio.proveedor_id === proveedor.id && sitio.estado === 'activo')
    : [];

  const handleDelete = async () => {
    if (!proveedor) return;

    // Check if provider has active sites
    if (sitiosProveedor.length > 0) {
      setError('No se puede eliminar un proveedor con sitios activos. Primero desactive o elimine todos los sitios.');
      return;
    }

    setError(null);
    try {
      await deleteProveedor(proveedor.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al eliminar el proveedor');
    }
  };

  const handleClose = () => {
    if (loading) return;
    setError(null);
    onClose();
  };

  if (!proveedor) return null;

  const canDelete = sitiosProveedor.length === 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Warning color="error" />
          <Typography variant="h6">
            Confirmar Eliminación
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            ¿Está seguro que desea eliminar el siguiente proveedor?
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Esta acción no se puede deshacer.
          </Typography>
        </Box>

        {/* Información del proveedor */}
        <Box sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          mb: 2
        }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Business color="primary" fontSize="small" />
            <Typography variant="subtitle2">
              {proveedor.razon_social}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>CUIT:</strong> {proveedor.cuit}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Nombre Comercial:</strong> {proveedor.nombre_comercial}
          </Typography>

          {proveedor.contacto_principal && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Contacto:</strong> {proveedor.contacto_principal}
            </Typography>
          )}

          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Chip
              label={proveedor.estado.toUpperCase()}
              color={proveedor.estado === 'activo' ? 'success' : 'error'}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>

        <Divider />

        {/* Estado de sitios */}
        <Box sx={{ mt: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <LocationOn fontSize="small" color="primary" />
            <Typography variant="subtitle2">
              Sitios Asociados
            </Typography>
            <Chip
              label={sitiosProveedor.length}
              color={sitiosProveedor.length > 0 ? 'warning' : 'success'}
              size="small"
            />
          </Box>

          {sitiosProveedor.length > 0 ? (
            <>
              <Alert severity="warning" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  Este proveedor tiene {sitiosProveedor.length} sitio(s) activo(s).
                  Debe desactivar o eliminar todos los sitios antes de eliminar el proveedor.
                </Typography>
              </Alert>

              <Box sx={{ maxHeight: 120, overflow: 'auto' }}>
                {sitiosProveedor.map(sitio => (
                  <Box key={sitio.id} sx={{ py: 0.5 }}>
                    <Typography variant="caption" display="block">
                      • {sitio.nombre} ({sitio.localidad})
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            <Alert severity="info" sx={{ mb: 1 }}>
              <Typography variant="body2">
                Este proveedor no tiene sitios activos. Se puede eliminar de forma segura.
              </Typography>
            </Alert>
          )}
        </Box>

        {!canDelete && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Box display="flex" gap={1} alignItems="flex-start">
              <Info color="info" fontSize="small" sx={{ mt: 0.2 }} />
              <Typography variant="body2" color="text.secondary">
                <strong>Sugerencia:</strong> Vaya a "Gestionar Sitios" desde el menú de acciones
                para desactivar o eliminar los sitios antes de eliminar el proveedor.
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          color="inherit"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleDelete}
          disabled={loading || !canDelete}
          color="error"
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : <Delete />}
        >
          {loading ? 'Eliminando...' : 'Eliminar Proveedor'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteProveedorDialog;