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
  Router as RouterIcon,
  Description as DocumentIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

const InternetForm = ({ onSave, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    // Información básica de conectividad
    proveedorPrincipal: initialData.proveedorPrincipal || '',
    velocidadContratada: initialData.velocidadContratada || '',
    tipoConexion: initialData.tipoConexion || '',
    redundancia: initialData.redundancia || false,
    proveedorSecundario: initialData.proveedorSecundario || '',

    // Configuración técnica
    ipPublica: initialData.ipPublica || '',
    rangoIPs: initialData.rangoIPs || '',
    dns: initialData.dns || '',

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

    if (!formData.proveedorPrincipal) {
      newErrors.proveedorPrincipal = 'Proveedor principal es requerido';
    }
    if (!formData.velocidadContratada) {
      newErrors.velocidadContratada = 'Velocidad contratada es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        sectionId: 'internet',
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
          Internet
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, color: '#374151', mb: 2 }}>
          Descripción
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontWeight: 300, color: '#6b7280', lineHeight: 1.6, mb: 3 }}>
          Historial y configuración del enlace de internet.
        </Typography>

        <Alert severity="info" sx={{ mb: 3, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, color: '#1e293b' }}>
            Criterio de aceptación
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
            Adjuntar PDF con histograma de los últimos 3 meses y descripción de configuración.
          </Typography>
        </Alert>
      </Box>

      <Grid container spacing={3}>
        {/* Información Principal de Internet */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RouterIcon />
                Conectividad Principal
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Proveedor Principal"
                    value={formData.proveedorPrincipal}
                    onChange={(e) => handleInputChange('proveedorPrincipal', e.target.value)}
                    error={!!errors.proveedorPrincipal}
                    helperText={errors.proveedorPrincipal}
                    placeholder="Ej: Telecom, Fibertel, Speedy"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Velocidad Contratada"
                    value={formData.velocidadContratada}
                    onChange={(e) => handleInputChange('velocidadContratada', e.target.value)}
                    error={!!errors.velocidadContratada}
                    helperText={errors.velocidadContratada}
                    placeholder="Ej: 100/50 Mbps, 1 Gbps"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Conexión</InputLabel>
                    <Select
                      value={formData.tipoConexion}
                      onChange={(e) => handleInputChange('tipoConexion', e.target.value)}
                      label="Tipo de Conexión"
                    >
                      <MenuItem value="fibra">Fibra Óptica</MenuItem>
                      <MenuItem value="dedicada">Enlace Dedicado</MenuItem>
                      <MenuItem value="adsl">ADSL</MenuItem>
                      <MenuItem value="cable">Cable Módem</MenuItem>
                      <MenuItem value="satelital">Satelital</MenuItem>
                      <MenuItem value="otro">Otro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="IP Pública Principal"
                    value={formData.ipPublica}
                    onChange={(e) => handleInputChange('ipPublica', e.target.value)}
                    placeholder="Ej: 200.123.45.67"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.redundancia}
                        onChange={(e) => handleInputChange('redundancia', e.target.checked)}
                      />
                    }
                    label="Cuenta con enlace redundante/secundario"
                  />
                </Grid>

                {formData.redundancia && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Proveedor Secundario"
                      value={formData.proveedorSecundario}
                      onChange={(e) => handleInputChange('proveedorSecundario', e.target.value)}
                      placeholder="Proveedor del enlace de respaldo"
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Configuración Técnica */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon />
                Configuración Técnica
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Rango de IPs Asignadas"
                    value={formData.rangoIPs}
                    onChange={(e) => handleInputChange('rangoIPs', e.target.value)}
                    placeholder="Ej: 200.123.45.0/28"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Servidores DNS"
                    value={formData.dns}
                    onChange={(e) => handleInputChange('dns', e.target.value)}
                    placeholder="Ej: 8.8.8.8, 8.8.4.4"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones sobre conectividad"
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    multiline
                    rows={4}
                    placeholder="Describa configuraciones especiales, problemas conocidos, SLA..."
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
                Documento PDF Requerido
              </Typography>
              <Alert severity="warning" sx={{ mb: 2, background: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.2)' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  📊 DOCUMENTO OPCIONAL
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
                  • <strong>Formato:</strong> PDF<br/>
                  • <strong>Contenido:</strong> Histograma de los últimos 3 meses<br/>
                  • <strong>Incluir:</strong> Descripción de configuración del enlace<br/>
                  • Estadísticas de uso y performance
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
                    Subir PDF con Histograma
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
                    label="Fecha de última revisión"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones sobre el histograma"
                    multiline
                    rows={3}
                    placeholder="Describa las métricas incluidas, períodos de mayor/menor uso..."
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

export default InternetForm;