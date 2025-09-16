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
  Cable as CableIcon,
  Description as DocumentIcon,
  NetworkCheck as NetworkIcon
} from '@mui/icons-material';

const ConectividadForm = ({ onSave, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    // Certificación de cableado
    tipoInstalacion: initialData.tipoInstalacion || '',
    certificacionRealizada: initialData.certificacionRealizada || false,
    fechaCertificacion: initialData.fechaCertificacion || '',
    empresa: initialData.empresa || '',

    // Detalles técnicos
    tiposCable: initialData.tiposCable || '',
    puntosDatos: initialData.puntosDatos || '',
    patchPanels: initialData.patchPanels || '',

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

    if (!formData.tipoInstalacion) {
      newErrors.tipoInstalacion = 'Tipo de instalación es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        sectionId: 'conectividad',
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
          Conectividad (Certificación de Cableado)
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, color: '#374151', mb: 2 }}>
          Descripción
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontWeight: 300, color: '#6b7280', lineHeight: 1.6, mb: 3 }}>
          Certificación del cableado de datos.
        </Typography>

        <Alert severity="info" sx={{ mb: 3, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, color: '#1e293b' }}>
            Criterio de aceptación
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
            Adjuntar certificaciones de cableado de datos en formato PDF o Excel.
          </Typography>
        </Alert>
      </Box>

      <Grid container spacing={3}>
        {/* Información de Certificación */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CableIcon />
                Certificación de Cableado
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.tipoInstalacion}>
                    <InputLabel>Tipo de Instalación</InputLabel>
                    <Select
                      value={formData.tipoInstalacion}
                      onChange={(e) => handleInputChange('tipoInstalacion', e.target.value)}
                      label="Tipo de Instalación"
                    >
                      <MenuItem value="estructurado">Cableado Estructurado</MenuItem>
                      <MenuItem value="fibra-optica">Fibra Óptica</MenuItem>
                      <MenuItem value="categoria-5e">Categoría 5e</MenuItem>
                      <MenuItem value="categoria-6">Categoría 6</MenuItem>
                      <MenuItem value="categoria-6a">Categoría 6A</MenuItem>
                      <MenuItem value="mixto">Instalación Mixta</MenuItem>
                    </Select>
                  </FormControl>
                  {errors.tipoInstalacion && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors.tipoInstalacion}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Empresa Certificadora"
                    value={formData.empresa}
                    onChange={(e) => handleInputChange('empresa', e.target.value)}
                    placeholder="Empresa que realizó la certificación"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.certificacionRealizada}
                        onChange={(e) => handleInputChange('certificacionRealizada', e.target.checked)}
                      />
                    }
                    label="Certificación de cableado realizada"
                  />
                </Grid>

                {formData.certificacionRealizada && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Fecha de Certificación"
                      value={formData.fechaCertificacion}
                      onChange={(e) => handleInputChange('fechaCertificacion', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Detalles Técnicos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NetworkIcon />
                Detalles Técnicos
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tipos de Cable Instalado"
                    value={formData.tiposCable}
                    onChange={(e) => handleInputChange('tiposCable', e.target.value)}
                    placeholder="Ej: Cat6, Fibra monomodo, etc."
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Cantidad de Puntos de Datos"
                    value={formData.puntosDatos}
                    onChange={(e) => handleInputChange('puntosDatos', e.target.value)}
                    type="number"
                    placeholder="Número total de puntos"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Patch Panels"
                    value={formData.patchPanels}
                    onChange={(e) => handleInputChange('patchPanels', e.target.value)}
                    placeholder="Cantidad y tipo de patch panels"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones sobre la conectividad"
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    multiline
                    rows={4}
                    placeholder="Describa detalles de la certificación, pruebas realizadas, resultados..."
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
                Certificaciones Requeridas
              </Typography>
              <Alert severity="warning" sx={{ mb: 2, background: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.2)' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  📋 CERTIFICACIONES OPCIONALES
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
                  • <strong>Formatos aceptados:</strong> PDF, Excel (.xls/.xlsx)<br/>
                  • <strong>Contenido:</strong> Certificaciones de cableado de datos<br/>
                  • Incluir reportes de pruebas y mediciones
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
                    Subir Certificaciones
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.xls,.xlsx"
                      multiple
                    />
                  </Button>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha de última certificación"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones sobre las certificaciones"
                    multiline
                    rows={3}
                    placeholder="Describa los documentos adjuntos, resultados de las pruebas..."
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

export default ConectividadForm;