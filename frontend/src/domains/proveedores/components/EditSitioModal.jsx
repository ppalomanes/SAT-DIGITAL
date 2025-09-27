/**
 * Modal para editar sitios existentes
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material';
import {
  Close,
  Edit,
  Save,
  LocationOn
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProveedoresStore } from '../store/proveedoresStore';

// Esquema de validación
const sitioSchema = z.object({
  nombre_sitio: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres'),
  localidad: z.string()
    .min(2, 'La localidad debe tener al menos 2 caracteres')
    .max(50, 'La localidad no puede superar 50 caracteres'),
  domicilio: z.string()
    .min(5, 'El domicilio debe tener al menos 5 caracteres')
    .max(200, 'El domicilio no puede superar 200 caracteres'),
  estado: z.enum(['activo', 'inactivo', 'mantenimiento'], {
    errorMap: () => ({ message: 'Estado no válido' })
  })
});

const localidades = [
  'CABA',
  'CORDOBA',
  'CHACO',
  'TUCUMAN',
  'ROSARIO',
  'MENDOZA',
  'SALTA',
  'SANTA_FE',
  'LA_PLATA',
  'MAR_DEL_PLATA'
];

const estados = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'mantenimiento', label: 'En Mantenimiento' }
];

const EditSitioModal = ({ open, onClose, sitio }) => {
  const { updateSitio, loading } = useProveedoresStore();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(sitioSchema),
    mode: 'onChange'
  });

  // Watch form values for proper select display
  const watchedLocalidad = watch('localidad');
  const watchedEstado = watch('estado');

  // Reset form when sitio changes or modal opens
  useEffect(() => {
    if (open && sitio) {
      setValue('nombre_sitio', sitio.nombre_sitio || '');
      setValue('localidad', sitio.localidad || '');
      setValue('domicilio', sitio.domicilio || '');
      setValue('estado', sitio.estado || 'activo');
      setError(null);
      setSuccess(false);
    }
  }, [open, sitio, setValue]);

  const onSubmit = async (data) => {
    if (!sitio) return;

    setError(null);
    try {
      await updateSitio(sitio.id, data);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        reset();
      }, 1500);
    } catch (err) {
      console.error('Error updating sitio:', err);
      setError(err.message || 'Error al actualizar el sitio');
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
    setError(null);
    setSuccess(false);
    reset();
  };

  if (!sitio) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <Edit color="primary" />
              <Box>
                <Typography variant="h6">
                  Editar Sitio
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Modificar información del sitio
                </Typography>
              </Box>
            </Box>
            <Button
              onClick={handleClose}
              disabled={loading}
              size="small"
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <Close />
            </Button>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ py: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Sitio actualizado exitosamente
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Información del Proveedor */}
            <Grid item xs={12}>
              <Box sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200'
              }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Información del Proveedor
                </Typography>
                <Typography variant="body2">
                  <strong>Razón Social:</strong> {sitio.proveedor_razon_social || 'No disponible'}
                </Typography>
                <Typography variant="body2">
                  <strong>Nombre Comercial:</strong> {sitio.proveedor_nombre_comercial || 'No disponible'}
                </Typography>
              </Box>
            </Grid>

            {/* Nombre del Sitio */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del Sitio"
                variant="outlined"
                {...register('nombre_sitio')}
                error={!!errors.nombre_sitio}
                helperText={errors.nombre_sitio?.message}
                disabled={loading}
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            {/* Localidad */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Localidad"
                value={watchedLocalidad || ''}
                onChange={(e) => setValue('localidad', e.target.value)}
                error={!!errors.localidad}
                helperText={errors.localidad?.message}
                disabled={loading}
              >
                {localidades.map((localidad) => (
                  <MenuItem key={localidad} value={localidad}>
                    {localidad.replace('_', ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Estado */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Estado"
                value={watchedEstado || ''}
                onChange={(e) => setValue('estado', e.target.value)}
                error={!!errors.estado}
                helperText={errors.estado?.message}
                disabled={loading}
              >
                {estados.map((estado) => (
                  <MenuItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Domicilio */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Domicilio Completo"
                variant="outlined"
                multiline
                rows={2}
                {...register('domicilio')}
                error={!!errors.domicilio}
                helperText={errors.domicilio?.message}
                disabled={loading}
                placeholder="Ingrese la dirección completa del sitio..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            color="inherit"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <Save />}
            disabled={!isValid || loading}
            color="primary"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditSitioModal;