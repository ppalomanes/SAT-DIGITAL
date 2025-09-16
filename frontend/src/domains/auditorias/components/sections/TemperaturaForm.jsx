import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Thermostat as ThermostatIcon,
  Description as DocumentIcon,
  AcUnit as AcIcon
} from '@mui/icons-material';

const TemperaturaForm = ({ onSave, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    // Control de temperatura
    temperaturaActual: initialData.temperaturaActual || '',
    temperaturaMinima: initialData.temperaturaMinima || '',
    temperaturaMaxima: initialData.temperaturaMaxima || '',
    sistemaClima: initialData.sistemaClima || '',

    // Monitoreo y alertas
    sistemaMonitoreo: initialData.sistemaMonitoreo || false,
    alertasConfiguradas: initialData.alertasConfiguradas || false,
    mantenimientoPreventivo: initialData.mantenimientoPreventivo || false,

    // Observaciones
    observaciones: initialData.observaciones || '',

    // Archivos adjuntos
    archivosAdjuntos: initialData.archivosAdjuntos || []
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.temperaturaActual) {
      newErrors.temperaturaActual = 'Temperatura actual es requerida';
    }
    if (!formData.sistemaClima) {
      newErrors.sistemaClima = 'Sistema de climatización es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        sectionId: 'temperatura',
        data: formData,
        completedAt: new Date().toISOString(),
        status: 'completed'
      });
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header con descripción basada en auditoria.html */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, color: '#1e293b', mb: 2 }}>
          CT Temperatura
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, color: '#374151', mb: 2 }}>
          Descripción
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontWeight: 300, color: '#6b7280', lineHeight: 1.6, mb: 3 }}>
          Control de temperatura del cuarto de tecnología.
        </Typography>

        <Alert severity="info" sx={{ mb: 3, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, color: '#1e293b' }}>
            Criterio de aceptación
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
            Adjuntar historial de temperaturas de los últimos 3 meses en formato PDF o Excel.
          </Typography>
        </Alert>
      </Box>

      <Grid container spacing={3}>
        {/* Control de Temperatura */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ThermostatIcon />
                Control de Temperatura
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Temperatura Actual (°C)"
                    value={formData.temperaturaActual}
                    onChange={(e) => handleInputChange('temperaturaActual', e.target.value)}
                    error={!!errors.temperaturaActual}
                    helperText={errors.temperaturaActual}
                    type="number"
                    inputProps={{ step: "0.1" }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Temperatura Mínima (°C)"
                    value={formData.temperaturaMinima}
                    onChange={(e) => handleInputChange('temperaturaMinima', e.target.value)}
                    type="number"
                    inputProps={{ step: "0.1" }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Temperatura Máxima (°C)"
                    value={formData.temperaturaMaxima}
                    onChange={(e) => handleInputChange('temperaturaMaxima', e.target.value)}
                    type="number"
                    inputProps={{ step: "0.1" }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.sistemaClima}>
                    <InputLabel>Sistema de Climatización</InputLabel>
                    <Select
                      value={formData.sistemaClima}
                      onChange={(e) => handleInputChange('sistemaClima', e.target.value)}
                      label="Sistema de Climatización"
                    >
                      <MenuItem value="aire-acondicionado">Aire Acondicionado</MenuItem>
                      <MenuItem value="precision-cooling">Precision Cooling</MenuItem>
                      <MenuItem value="crac-unit">CRAC Unit</MenuItem>
                      <MenuItem value="crah-unit">CRAH Unit</MenuItem>
                      <MenuItem value="ventilacion-forzada">Ventilación Forzada</MenuItem>
                      <MenuItem value="otro">Otro Sistema</MenuItem>
                    </Select>
                  </FormControl>
                  {errors.sistemaClima && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors.sistemaClima}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sistema de Monitoreo */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AcIcon />
                Monitoreo y Mantenimiento
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.sistemaMonitoreo}
                        onChange={(e) => handleInputChange('sistemaMonitoreo', e.target.checked)}
                      />
                    }
                    label="Sistema de monitoreo de temperatura activo"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.alertasConfiguradas}
                        onChange={(e) => handleInputChange('alertasConfiguradas', e.target.checked)}
                      />
                    }
                    label="Alertas automáticas configuradas"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.mantenimientoPreventivo}
                        onChange={(e) => handleInputChange('mantenimientoPreventivo', e.target.checked)}
                      />
                    }
                    label="Plan de mantenimiento preventivo del sistema de clima"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones sobre el sistema de temperatura"
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    multiline
                    rows={4}
                    placeholder="Describa el funcionamiento del sistema, incidentes previos, configuraciones especiales..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Archivos Requeridos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#dc2626', fontWeight: 500 }}>
                Historial de Temperaturas
              </Typography>
              <Alert severity="warning" sx={{ mb: 2, background: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.2)' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  🌡️ HISTORIAL OPCIONAL
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
                  • <strong>Formatos aceptados:</strong> PDF, Excel (.xls/.xlsx)<br/>
                  • <strong>Período:</strong> Últimos 3 meses<br/>
                  • <strong>Contenido:</strong> Registros de temperatura máxima, mínima y promedio<br/>
                  • Incluir gráficos y alertas si están disponibles
                </Typography>
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<UploadIcon />}
                    sx={{
                      mr: 2,
                      background: '#f59e0b',
                      '&:hover': {
                        background: '#d97706'
                      }
                    }}
                  >
                    Subir Historial de Temperaturas
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.xls,.xlsx"
                    />
                  </Button>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha del último reporte"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones sobre el historial"
                    multiline
                    rows={3}
                    placeholder="Describa las tendencias observadas, incidentes registrados, acciones correctivas..."
                  />
                </Grid>
              </Grid>

              {formData.archivosAdjuntos?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  {formData.archivosAdjuntos.map((archivo, index) => (
                    <Chip
                      key={index}
                      icon={<DocumentIcon />}
                      label={archivo.nombre}
                      onDelete={() => {
                        const newFiles = formData.archivosAdjuntos.filter((_, i) => i !== index);
                        handleInputChange('archivosAdjuntos', newFiles);
                      }}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Botones de Acción */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Guardar Sección
        </Button>
      </Box>
    </Box>
  );
};

export default TemperaturaForm;