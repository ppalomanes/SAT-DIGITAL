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
  Business as BusinessIcon,
  Description as DocumentIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const EntornoInformacionForm = ({ onSave, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    // Información de la ubicación
    direccionCompleta: initialData.direccionCompleta || '',
    codigoPostal: initialData.codigoPostal || '',
    localidad: initialData.localidad || '',
    provincia: initialData.provincia || '',

    // Características del edificio
    tipoEdificio: initialData.tipoEdificio || '',
    pisoUbicacion: initialData.pisoUbicacion || '',
    superficieCT: initialData.superficieCT || '',
    antiguedadEdificio: initialData.antiguedadEdificio || '',

    // Información operativa
    horarioOperacion: initialData.horarioOperacion || '',
    cantidadPersonal: initialData.cantidadPersonal || '',
    tipoActividad: initialData.tipoActividad || '',

    // Servicios del entorno
    seguridadEdificio: initialData.seguridadEdificio || false,
    sistemaIncendios: initialData.sistemaIncendios || false,
    ascensores: initialData.ascensores || false,
    aireAcondicionadoCentral: initialData.aireAcondicionadoCentral || false,

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

    if (!formData.direccionCompleta) {
      newErrors.direccionCompleta = 'Dirección completa es requerida';
    }
    if (!formData.localidad) {
      newErrors.localidad = 'Localidad es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        sectionId: 'entorno-informacion',
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
          Información del Entorno
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, color: '#374151', mb: 2 }}>
          Descripción
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontWeight: 300, color: '#6b7280', lineHeight: 1.6, mb: 3 }}>
          Información general del entorno donde se encuentra ubicada la infraestructura tecnológica.
        </Typography>

        <Alert severity="info" sx={{ mb: 3, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, color: '#1e293b' }}>
            Criterio de aceptación
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
            Completar información descriptiva del entorno. Opcionalmente adjuntar planos del edificio o croquis de ubicación en formato PDF.
          </Typography>
        </Alert>
      </Box>

      <Grid container spacing={3}>
        {/* Información de Ubicación */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon />
                Información de Ubicación
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Dirección Completa"
                    value={formData.direccionCompleta}
                    onChange={(e) => handleInputChange('direccionCompleta', e.target.value)}
                    error={!!errors.direccionCompleta}
                    helperText={errors.direccionCompleta}
                    placeholder="Calle, número, piso, oficina"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Localidad"
                    value={formData.localidad}
                    onChange={(e) => handleInputChange('localidad', e.target.value)}
                    error={!!errors.localidad}
                    helperText={errors.localidad}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Provincia</InputLabel>
                    <Select
                      value={formData.provincia}
                      onChange={(e) => handleInputChange('provincia', e.target.value)}
                      label="Provincia"
                    >
                      <MenuItem value="caba">CABA</MenuItem>
                      <MenuItem value="buenos-aires">Buenos Aires</MenuItem>
                      <MenuItem value="cordoba">Córdoba</MenuItem>
                      <MenuItem value="santa-fe">Santa Fe</MenuItem>
                      <MenuItem value="mendoza">Mendoza</MenuItem>
                      <MenuItem value="otra">Otra</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Código Postal"
                    value={formData.codigoPostal}
                    onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Características del Edificio */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon />
                Características del Edificio
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Edificio</InputLabel>
                    <Select
                      value={formData.tipoEdificio}
                      onChange={(e) => handleInputChange('tipoEdificio', e.target.value)}
                      label="Tipo de Edificio"
                    >
                      <MenuItem value="oficinas-comerciales">Oficinas Comerciales</MenuItem>
                      <MenuItem value="centro-comercial">Centro Comercial</MenuItem>
                      <MenuItem value="edificio-corporativo">Edificio Corporativo</MenuItem>
                      <MenuItem value="casa-particular">Casa Particular</MenuItem>
                      <MenuItem value="galpon-industrial">Galpón Industrial</MenuItem>
                      <MenuItem value="otro">Otro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Piso/Nivel de Ubicación"
                    value={formData.pisoUbicacion}
                    onChange={(e) => handleInputChange('pisoUbicacion', e.target.value)}
                    placeholder="Ej: PB, 1er piso, Subsuelo"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Superficie del CT (m²)"
                    value={formData.superficieCT}
                    onChange={(e) => handleInputChange('superficieCT', e.target.value)}
                    type="number"
                    placeholder="Metros cuadrados"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Antigüedad del Edificio (años)"
                    value={formData.antiguedadEdificio}
                    onChange={(e) => handleInputChange('antiguedadEdificio', e.target.value)}
                    type="number"
                    placeholder="Años aproximados"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Información Operativa */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon />
                Información Operativa
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Horario de Operación"
                    value={formData.horarioOperacion}
                    onChange={(e) => handleInputChange('horarioOperacion', e.target.value)}
                    placeholder="Ej: 8:00 a 18:00 L-V, 24x7"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Cantidad de Personal en Sitio"
                    value={formData.cantidadPersonal}
                    onChange={(e) => handleInputChange('cantidadPersonal', e.target.value)}
                    type="number"
                    placeholder="Número aproximado"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tipo de Actividad/Negocio"
                    value={formData.tipoActividad}
                    onChange={(e) => handleInputChange('tipoActividad', e.target.value)}
                    placeholder="Describa la actividad principal del sitio"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Servicios del Edificio
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.seguridadEdificio}
                        onChange={(e) => handleInputChange('seguridadEdificio', e.target.checked)}
                      />
                    }
                    label="Seguridad del edificio (portero, vigilancia)"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.sistemaIncendios}
                        onChange={(e) => handleInputChange('sistemaIncendios', e.target.checked)}
                      />
                    }
                    label="Sistema contra incendios"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.ascensores}
                        onChange={(e) => handleInputChange('ascensores', e.target.checked)}
                      />
                    }
                    label="Ascensores disponibles"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.aireAcondicionadoCentral}
                        onChange={(e) => handleInputChange('aireAcondicionadoCentral', e.target.checked)}
                      />
                    }
                    label="Aire acondicionado central"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones sobre el entorno"
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    multiline
                    rows={4}
                    placeholder="Describa características especiales del entorno, accesos, restricciones, etc."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Archivos Opcionales */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#059669', fontWeight: 500 }}>
                Planos y Documentación (Opcional)
              </Typography>
              <Alert severity="info" sx={{ mb: 2, background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  🏢 DOCUMENTACIÓN OPCIONAL
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
                  • <strong>Formato:</strong> PDF<br/>
                  • <strong>Contenido:</strong> Planos del edificio o croquis de ubicación<br/>
                  • Documentación complementaria sobre el entorno
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
                      background: '#059669',
                      '&:hover': {
                        background: '#047857'
                      }
                    }}
                  >
                    Subir Planos/Croquis
                    <input
                      type="file"
                      hidden
                      accept=".pdf"
                      multiple
                    />
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones sobre la documentación"
                    multiline
                    rows={3}
                    placeholder="Describa los documentos adjuntos, fechas de los planos, etc."
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

export default EntornoInformacionForm;