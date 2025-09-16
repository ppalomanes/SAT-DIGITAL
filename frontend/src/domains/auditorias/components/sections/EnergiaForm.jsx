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
  Power as PowerIcon,
  Description as DocumentIcon,
  ElectricBolt as ElectricIcon,
  Battery3Bar as BatteryIcon
} from '@mui/icons-material';

const EnergiaForm = ({ onSave, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    // Suministro eléctrico principal
    voltajePrincipal: initialData.voltajePrincipal || '',
    amperajePrincipal: initialData.amperajePrincipal || '',
    proveedor: initialData.proveedor || '',
    sistemaRespaldo: initialData.sistemaRespaldo || '',

    // UPS y respaldo
    tieneUPS: initialData.tieneUPS || false,
    marcaUPS: initialData.marcaUPS || '',
    capacidadUPS: initialData.capacidadUPS || '',
    autonomiaUPS: initialData.autonomiaUPS || '',

    // Generador
    tieneGenerador: initialData.tieneGenerador || false,
    tipoGenerador: initialData.tipoGenerador || '',
    capacidadGenerador: initialData.capacidadGenerador || '',

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

    if (!formData.voltajePrincipal) {
      newErrors.voltajePrincipal = 'Voltaje principal es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        sectionId: 'energia',
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
          Cuarto de Tecnología - Energía
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, color: '#374151', mb: 2 }}>
          Descripción
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontWeight: 300, color: '#6b7280', lineHeight: 1.6, mb: 3 }}>
          Fuente de energía que alimenta el cuarto de tecnología.
        </Typography>

        <Alert severity="info" sx={{ mb: 3, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, color: '#1e293b' }}>
            Criterio de aceptación
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
            Adjuntar documento PDF con esquema de instalación eléctrica y especificaciones de UPS/Generador.
          </Typography>
        </Alert>
      </Box>

      <Grid container spacing={3}>
        {/* Suministro Eléctrico Principal */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PowerIcon />
                Suministro Eléctrico Principal
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Voltaje Principal (V)"
                    value={formData.voltajePrincipal}
                    onChange={(e) => handleInputChange('voltajePrincipal', e.target.value)}
                    error={!!errors.voltajePrincipal}
                    helperText={errors.voltajePrincipal}
                    placeholder="Ej: 220V, 380V"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Amperaje Principal (A)"
                    value={formData.amperajePrincipal}
                    onChange={(e) => handleInputChange('amperajePrincipal', e.target.value)}
                    placeholder="Ej: 63A, 100A"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Proveedor de Energía"
                    value={formData.proveedor}
                    onChange={(e) => handleInputChange('proveedor', e.target.value)}
                    placeholder="Ej: Edesur, Edenor, Cooperativa"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sistema de Respaldo</InputLabel>
                    <Select
                      value={formData.sistemaRespaldo}
                      onChange={(e) => handleInputChange('sistemaRespaldo', e.target.value)}
                      label="Sistema de Respaldo"
                    >
                      <MenuItem value="ups-solamente">UPS solamente</MenuItem>
                      <MenuItem value="ups-generador">UPS + Generador</MenuItem>
                      <MenuItem value="generador-solamente">Generador solamente</MenuItem>
                      <MenuItem value="sin-respaldo">Sin respaldo</MenuItem>
                      <MenuItem value="otro">Otro sistema</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sistema UPS */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BatteryIcon />
                Sistema UPS (Uninterruptible Power Supply)
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.tieneUPS}
                        onChange={(e) => handleInputChange('tieneUPS', e.target.checked)}
                      />
                    }
                    label="Cuenta con sistema UPS"
                  />
                </Grid>

                {formData.tieneUPS && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Marca y Modelo UPS"
                        value={formData.marcaUPS}
                        onChange={(e) => handleInputChange('marcaUPS', e.target.value)}
                        placeholder="Ej: APC Smart-UPS RT 5000VA"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Capacidad UPS (VA/W)"
                        value={formData.capacidadUPS}
                        onChange={(e) => handleInputChange('capacidadUPS', e.target.value)}
                        placeholder="Ej: 5000VA / 4000W"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Autonomía UPS (minutos)"
                        value={formData.autonomiaUPS}
                        onChange={(e) => handleInputChange('autonomiaUPS', e.target.value)}
                        type="number"
                        placeholder="Tiempo de respaldo en minutos"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sistema Generador */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ElectricIcon />
                Sistema Generador
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.tieneGenerador}
                        onChange={(e) => handleInputChange('tieneGenerador', e.target.checked)}
                      />
                    }
                    label="Cuenta con generador eléctrico"
                  />
                </Grid>

                {formData.tieneGenerador && (
                  <>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Tipo de Generador</InputLabel>
                        <Select
                          value={formData.tipoGenerador}
                          onChange={(e) => handleInputChange('tipoGenerador', e.target.value)}
                          label="Tipo de Generador"
                        >
                          <MenuItem value="diesel">Diesel</MenuItem>
                          <MenuItem value="gas-natural">Gas Natural</MenuItem>
                          <MenuItem value="gnc">GNC</MenuItem>
                          <MenuItem value="gasolina">Gasolina</MenuItem>
                          <MenuItem value="otro">Otro</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Capacidad Generador (kVA/kW)"
                        value={formData.capacidadGenerador}
                        onChange={(e) => handleInputChange('capacidadGenerador', e.target.value)}
                        placeholder="Ej: 25kVA / 20kW"
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones sobre el sistema eléctrico"
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    multiline
                    rows={4}
                    placeholder="Describa el estado del sistema, mantenimientos, incidentes, configuraciones especiales..."
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
                Documentación Eléctrica
              </Typography>
              <Alert severity="warning" sx={{ mb: 2, background: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.2)' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  ⚡ DOCUMENTACIÓN OPCIONAL
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
                  • <strong>Formato:</strong> PDF<br/>
                  • <strong>Contenido:</strong> Esquema de instalación eléctrica<br/>
                  • <strong>Incluir:</strong> Especificaciones de UPS/Generador<br/>
                  • Diagramas de conexión y cargas
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
                    Subir Esquema Eléctrico
                    <input
                      type="file"
                      hidden
                      accept=".pdf"
                    />
                  </Button>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha del último esquema"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones sobre la documentación"
                    multiline
                    rows={3}
                    placeholder="Describa el contenido del esquema, actualizaciones recientes..."
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

export default EnergiaForm;