/**
 * Modal para crear nuevos proveedores
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
  Business,
  Person,
  Email,
  Phone,
  AccountBalance,
  Add
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useProveedoresStore } from '../store/proveedoresStore';

const CreateProveedorModal = ({ open, onClose }) => {
  const { createProveedor, loading } = useProveedoresStore();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      razon_social: '',
      cuit: '',
      nombre_comercial: '',
      contacto_principal: '',
      email_contacto: '',
      telefono: '',
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
    setError(null);
    try {
      await createProveedor(data);
      setSuccess(true);

      // Close modal after success
      setTimeout(() => {
        onClose();
        setSuccess(false);
        reset();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al crear el proveedor');
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Add color="primary" />
            <Typography variant="h6">
              Crear Nuevo Proveedor
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
              ✅ Proveedor creado exitosamente
            </Alert>
          )}

          <Box sx={{ display: 'grid', gap: 3 }}>
            {/* Información básica */}
            <Box>
              <Typography variant="subtitle2" gutterBottom color="primary">
                Información Básica
              </Typography>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 200px' }}>
                <TextField
                  label="Razón Social"
                  fullWidth
                  {...register('razon_social', { required: 'Razón social es requerida' })}
                  error={!!errors.razon_social}
                  helperText={errors.razon_social?.message}
                  disabled={loading}
                  InputProps={{
                    startAdornment: <AccountBalance sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                <TextField
                  label="CUIT"
                  {...register('cuit', {
                    required: 'CUIT es requerido',
                    pattern: {
                      value: /^\d{2}-\d{8}-\d{1}$/,
                      message: 'Formato válido: XX-XXXXXXXX-X'
                    }
                  })}
                  error={!!errors.cuit}
                  helperText={errors.cuit?.message}
                  disabled={loading}
                  placeholder="XX-XXXXXXXX-X"
                />
              </Box>
            </Box>

            <Divider />

            {/* Información comercial */}
            <Box>
              <Typography variant="subtitle2" gutterBottom color="primary">
                Información Comercial
              </Typography>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 150px' }}>
                <TextField
                  label="Nombre Comercial"
                  fullWidth
                  {...register('nombre_comercial')}
                  error={!!errors.nombre_comercial}
                  helperText={errors.nombre_comercial?.message}
                  disabled={loading}
                  InputProps={{
                    startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
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
                    <MenuItem value="suspendido">Suspendido</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Divider />

            {/* Información de contacto */}
            <Box>
              <Typography variant="subtitle2" gutterBottom color="primary">
                Información de Contacto
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <TextField
                  label="Contacto Principal"
                  fullWidth
                  {...register('contacto_principal')}
                  disabled={loading}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                  <TextField
                    label="Email de Contacto"
                    type="email"
                    {...register('email_contacto', {
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Email inválido'
                      }
                    })}
                    error={!!errors.email_contacto}
                    helperText={errors.email_contacto?.message}
                    disabled={loading}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                  <TextField
                    label="Teléfono"
                    {...register('telefono')}
                    disabled={loading}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Box>
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
            {loading ? 'Creando...' : 'Crear Proveedor'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateProveedorModal;