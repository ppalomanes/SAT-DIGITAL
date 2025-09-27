/**
 * Modal para crear nuevos sitios de proveedores
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Typography,
  Divider
} from '@mui/material';
import {
  Close,
  LocationOn,
  Business,
  Home,
  Add
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useProveedoresStore } from '../store/proveedoresStore';

const CreateSitioModal = ({ open, onClose, proveedor }) => {
  const { createSitio, loading } = useProveedoresStore();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      nombre_sitio: '',
      localidad: '',
      domicilio: '',
      estado: 'activo'
    }
  });

  // Reset states when modal closes
  useEffect(() => {
    if (!open) {
      setError(null);
      setSuccess(false);
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data) => {
    if (!proveedor) return;

    setError(null);
    try {
      const sitioData = {
        ...data,
        proveedor_id: proveedor.id
      };

      await createSitio(sitioData);
      setSuccess(true);

      // Close modal after success
      setTimeout(() => {
        onClose();
        setSuccess(false);
        reset();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al crear el sitio');
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  if (!proveedor) return null;

  // Localidades comunes en el sistema
  const localidades = [
    'CABA',
    'CORDOBA',
    'CHACO',
    'TUCUMAN',
    'ROSARIO',
    'MENDOZA',
    'LA PLATA',
    'MAR DEL PLATA',
    'SALTA',
    'SANTA FE'
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Add color="primary" />
            <Typography variant="h6">
              Agregar Sitio
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ Sitio creado exitosamente para {proveedor.nombre_comercial}
            </Alert>
          )}

          {/* Información del proveedor */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="subtitle2">
              <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
              Creando sitio para: <strong>{proveedor.nombre_comercial || proveedor.razon_social}</strong>
            </Typography>
          </Alert>

          <Box sx={{ display: 'grid', gap: 3 }}>
            {/* Información básica del sitio */}
            <Box>
              <Typography variant="subtitle2" gutterBottom color="primary">
                Información del Sitio
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <TextField
                  label="Nombre del Sitio"
                  fullWidth
                  {...register('nombre_sitio', {
                    required: 'Nombre del sitio es requerido',
                    minLength: {
                      value: 3,
                      message: 'El nombre debe tener al menos 3 caracteres'
                    }
                  })}
                  error={!!errors.nombre_sitio}
                  helperText={errors.nombre_sitio?.message}
                  disabled={loading}
                  placeholder="Ej: Sede Central, Sucursal Norte, etc."
                  InputProps={{
                    startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />

                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 150px' }}>
                  <FormControl fullWidth error={!!errors.localidad}>
                    <InputLabel>Localidad *</InputLabel>
                    <Select
                      label="Localidad *"
                      {...register('localidad', { required: 'Localidad es requerida' })}
                      disabled={loading}
                      startAdornment={<LocationOn sx={{ mr: 1, color: 'text.secondary' }} />}
                    >
                      {localidades.map((loc) => (
                        <MenuItem key={loc} value={loc}>
                          {loc}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.localidad && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                        {errors.localidad.message}
                      </Typography>
                    )}
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      label="Estado"
                      {...register('estado')}
                      disabled={loading}
                      defaultValue="activo"
                    >
                      <MenuItem value="activo">Activo</MenuItem>
                      <MenuItem value="inactivo">Inactivo</MenuItem>
                      <MenuItem value="mantenimiento">Mantenimiento</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <TextField
                  label="Domicilio"
                  fullWidth
                  {...register('domicilio', {
                    required: 'Domicilio es requerido',
                    minLength: {
                      value: 10,
                      message: 'El domicilio debe ser más específico'
                    }
                  })}
                  error={!!errors.domicilio}
                  helperText={errors.domicilio?.message || 'Incluir calle, número y referencias'}
                  disabled={loading}
                  placeholder="Ej: Av. Corrientes 1234, Piso 5, CABA"
                  multiline
                  rows={2}
                  InputProps={{
                    startAdornment: <Home sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                  }}
                />
              </Box>
            </Box>
          </Box>
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
            type="submit"
            variant="contained"
            disabled={loading || !isDirty}
            startIcon={loading ? <CircularProgress size={16} /> : <Add />}
          >
            {loading ? 'Creando...' : 'Crear Sitio'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateSitioModal;