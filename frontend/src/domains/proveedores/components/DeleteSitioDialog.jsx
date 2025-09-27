/**
 * Diálogo para confirmación de eliminación de sitios
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
  Divider,
  Chip
} from '@mui/material';
import {
  Warning,
  Delete,
  Cancel,
  LocationOn,
  Business
} from '@mui/icons-material';
import { useProveedoresStore } from '../store/proveedoresStore';

const DeleteSitioDialog = ({ open, onClose, sitio }) => {
  const { deleteSitio, loading } = useProveedoresStore();
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleClose = () => {
    if (deleting || loading) return;
    setError(null);
    onClose();
  };

  const handleDelete = async () => {
    if (!sitio) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteSitio(sitio.id);
      setTimeout(() => {
        onClose();
        setDeleting(false);
      }, 1000);
    } catch (err) {
      console.error('Error deleting sitio:', err);
      setError(err.message || 'Error al eliminar el sitio');
      setDeleting(false);
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

  if (!sitio) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={deleting}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Warning color="warning" />
          <Typography variant="h6">
            Confirmar Eliminación
          </Typography>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body1" gutterBottom>
          ¿Está seguro que desea eliminar el siguiente sitio?
        </Typography>

        <Box sx={{
          mt: 2,
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Business color="action" fontSize="small" />
            <Typography variant="subtitle2" color="primary">
              {sitio.nombre_sitio}
            </Typography>
            <Chip
              label={sitio.estado?.toUpperCase() || 'ACTIVO'}
              color={getEstadoColor(sitio.estado)}
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationOn color="action" fontSize="small" />
            <Typography variant="body2">
              {sitio.localidad}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            <strong>Domicilio:</strong> {sitio.domicilio || 'No especificado'}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Proveedor:</strong> {sitio.proveedor_nombre || sitio.proveedor_razon_social}
          </Typography>
        </Box>

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Importante:</strong> Esta acción no se puede deshacer. El sitio será marcado como eliminado
            y ya no aparecerá en las listas, pero se conservarán los registros de auditorías asociadas.
          </Typography>
        </Alert>

        {deleting && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, p: 2, bgcolor: 'info.main', color: 'white', borderRadius: 1 }}>
            <CircularProgress size={20} sx={{ color: 'white' }} />
            <Typography variant="body2">
              Eliminando sitio...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          color="inherit"
          disabled={deleting}
          startIcon={<Cancel />}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          startIcon={deleting ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Delete />}
          disabled={deleting}
        >
          {deleting ? 'Eliminando...' : 'Confirmar Eliminación'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteSitioDialog;