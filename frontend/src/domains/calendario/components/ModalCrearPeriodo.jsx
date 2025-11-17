import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Box
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

import { useCalendarioStore } from '../store/calendarioStore';
import pliegosService from '../../../services/pliegosService';

dayjs.locale('es');

/**
 * Modal para crear nuevo período de auditoría
 */
function ModalCrearPeriodo() {
  const {
    modalPeriodo,
    cerrarModalPeriodo,
    crearPeriodo,
    loading
  } = useCalendarioStore();

  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    fecha_inicio: null,
    fecha_limite_carga: null,
    fecha_inicio_visitas: null,
    fecha_fin_visitas: null,
    pliego_requisitos_id: null,
    configuracion_especial: {}
  });

  const [errores, setErrores] = useState({});
  const [configuracionAvanzada, setConfiguracionAvanzada] = useState(false);
  const [pliegos, setPliegos] = useState([]);
  const [pliegoSeleccionado, setPliegoSeleccionado] = useState(null);
  const [loadingPliegos, setLoadingPliegos] = useState(false);

  // Cargar pliegos cuando se abre el modal
  useEffect(() => {
    if (modalPeriodo) {
      cargarPliegos();
    }
  }, [modalPeriodo]);

  const cargarPliegos = async () => {
    try {
      setLoadingPliegos(true);
      const response = await pliegosService.listarPliegos();
      setPliegos(response.data || []);
    } catch (err) {
      console.error('Error al cargar pliegos:', err);
    } finally {
      setLoadingPliegos(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      codigo: '',
      fecha_inicio: null,
      fecha_limite_carga: null,
      fecha_inicio_visitas: null,
      fecha_fin_visitas: null,
      pliego_requisitos_id: null,
      configuracion_especial: {}
    });
    setErrores({});
    setPliegoSeleccionado(null);
    cerrarModalPeriodo();
  };

  const validateForm = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    }

    if (!formData.codigo.trim()) {
      nuevosErrores.codigo = 'El código es requerido';
    } else if (!/^\d{4}-\d{2}$/.test(formData.codigo)) {
      nuevosErrores.codigo = 'El código debe tener formato YYYY-MM (ej: 2025-05)';
    }

    if (!formData.fecha_inicio) {
      nuevosErrores.fecha_inicio = 'La fecha de inicio es requerida';
    }

    if (!formData.fecha_limite_carga) {
      nuevosErrores.fecha_limite_carga = 'La fecha límite de carga es requerida';
    }

    if (!formData.fecha_inicio_visitas) {
      nuevosErrores.fecha_inicio_visitas = 'La fecha de inicio de visitas es requerida';
    }

    if (!formData.fecha_fin_visitas) {
      nuevosErrores.fecha_fin_visitas = 'La fecha de fin de visitas es requerida';
    }

    // Validaciones de lógica de fechas
    if (formData.fecha_inicio && formData.fecha_limite_carga) {
      if (dayjs(formData.fecha_limite_carga).isBefore(formData.fecha_inicio)) {
        nuevosErrores.fecha_limite_carga = 'Debe ser posterior a la fecha de inicio';
      }
    }

    if (formData.fecha_limite_carga && formData.fecha_inicio_visitas) {
      if (dayjs(formData.fecha_inicio_visitas).isBefore(formData.fecha_limite_carga)) {
        nuevosErrores.fecha_inicio_visitas = 'Debe ser posterior a la fecha límite de carga';
      }
    }

    if (formData.fecha_inicio_visitas && formData.fecha_fin_visitas) {
      if (dayjs(formData.fecha_fin_visitas).isBefore(formData.fecha_inicio_visitas)) {
        nuevosErrores.fecha_fin_visitas = 'Debe ser posterior a la fecha de inicio de visitas';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const periodoData = {
        ...formData,
        fecha_inicio: formData.fecha_inicio.format('YYYY-MM-DD'),
        fecha_limite_carga: formData.fecha_limite_carga.format('YYYY-MM-DD'),
        fecha_inicio_visitas: formData.fecha_inicio_visitas.format('YYYY-MM-DD'),
        fecha_fin_visitas: formData.fecha_fin_visitas.format('YYYY-MM-DD')
      };

      await crearPeriodo(periodoData);
      handleClose();
    } catch (error) {
      console.error('Error creando período:', error);
    }
  };

  const generarCodigoAutomatico = (fecha) => {
    if (fecha) {
      const codigo = dayjs(fecha).format('YYYY-MM');
      setFormData(prev => ({ ...prev, codigo }));
    }
  };

  const calcularFechasAutomaticas = (fechaInicio) => {
    if (!fechaInicio) return;

    // Calcular fechas sugeridas (pueden ajustarse)
    const fechaLimite = dayjs(fechaInicio).add(15, 'day');
    const fechaInicioVisitas = fechaLimite.add(1, 'day');
    const fechaFinVisitas = fechaInicioVisitas.add(30, 'day');

    setFormData(prev => ({
      ...prev,
      fecha_limite_carga: fechaLimite,
      fecha_inicio_visitas: fechaInicioVisitas,
      fecha_fin_visitas: fechaFinVisitas
    }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Dialog 
        open={modalPeriodo} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            Crear Nuevo Período de Auditoría
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Información básica */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Información Básica
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre del Período"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                error={!!errores.nombre}
                helperText={errores.nombre || 'Ej: Mayo 2025, Noviembre 2025'}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código"
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                error={!!errores.codigo}
                helperText={errores.codigo || 'Formato: YYYY-MM'}
                placeholder="2025-05"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                options={pliegos}
                value={pliegoSeleccionado}
                onChange={(event, newValue) => {
                  setPliegoSeleccionado(newValue);
                  setFormData(prev => ({
                    ...prev,
                    pliego_requisitos_id: newValue ? newValue.id : null
                  }));
                }}
                getOptionLabel={(option) => `${option.codigo} - ${option.nombre}`}
                loading={loadingPliegos}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Pliego de Requisitos"
                    helperText="Selecciona el pliego de requisitos técnicos que aplicará a este período"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingPliegos ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {option.codigo} - {option.nombre}
                      </Typography>
                      {option.descripcion && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {option.descripcion.substring(0, 80)}
                          {option.descripcion.length > 80 ? '...' : ''}
                        </Typography>
                      )}
                    </Box>
                  </li>
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>

            {/* Fechas principales */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                Cronograma
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Fecha de Inicio *"
                value={formData.fecha_inicio}
                onChange={(newValue) => {
                  setFormData(prev => ({ ...prev, fecha_inicio: newValue }));
                  generarCodigoAutomatico(newValue);
                  calcularFechasAutomaticas(newValue);
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errores.fecha_inicio,
                    helperText: errores.fecha_inicio
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Fecha Límite de Carga *"
                value={formData.fecha_limite_carga}
                onChange={(newValue) => setFormData(prev => ({ ...prev, fecha_limite_carga: newValue }))}
                minDate={formData.fecha_inicio}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errores.fecha_limite_carga}
                    helperText={errores.fecha_limite_carga}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Inicio de Visitas *"
                value={formData.fecha_inicio_visitas}
                onChange={(newValue) => setFormData(prev => ({ ...prev, fecha_inicio_visitas: newValue }))}
                minDate={formData.fecha_limite_carga}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errores.fecha_inicio_visitas}
                    helperText={errores.fecha_inicio_visitas}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Fin de Visitas *"
                value={formData.fecha_fin_visitas}
                onChange={(newValue) => setFormData(prev => ({ ...prev, fecha_fin_visitas: newValue }))}
                minDate={formData.fecha_inicio_visitas}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errores.fecha_fin_visitas}
                    helperText={errores.fecha_fin_visitas}
                  />
                )}
              />
            </Grid>

            {/* Configuración avanzada */}
            <Grid item xs={12}>
              <Accordion expanded={configuracionAvanzada} onChange={(e, expanded) => setConfiguracionAvanzada(expanded)}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">Configuración Avanzada (Opcional)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    La configuración avanzada permite definir días no laborables, 
                    excepciones especiales y otros parámetros del período.
                  </Alert>
                  
                  <Typography variant="body2" color="text.secondary">
                    Funcionalidad disponible en versiones futuras.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Preview del cronograma */}
            {formData.fecha_inicio && formData.fecha_fin_visitas && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="subtitle2" gutterBottom>
                    Resumen del Cronograma:
                  </Typography>
                  <Typography variant="body2">
                    • Período de carga: {dayjs(formData.fecha_inicio).format('DD/MM/YYYY')} - {dayjs(formData.fecha_limite_carga).format('DD/MM/YYYY')} 
                    ({dayjs(formData.fecha_limite_carga).diff(formData.fecha_inicio, 'day')} días)
                  </Typography>
                  <Typography variant="body2">
                    • Período de visitas: {dayjs(formData.fecha_inicio_visitas).format('DD/MM/YYYY')} - {dayjs(formData.fecha_fin_visitas).format('DD/MM/YYYY')}
                    ({dayjs(formData.fecha_fin_visitas).diff(formData.fecha_inicio_visitas, 'day')} días)
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Creando...' : 'Crear Período'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

export default ModalCrearPeriodo;
