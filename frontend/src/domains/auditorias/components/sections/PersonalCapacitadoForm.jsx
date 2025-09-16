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
  Person as PersonIcon,
  Description as DocumentIcon,
  School as SchoolIcon
} from '@mui/icons-material';

const PersonalCapacitadoForm = ({ onSave, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    // Personal técnico
    cantidadTecnicos: initialData.cantidadTecnicos || '',
    nivelCapacitacion: initialData.nivelCapacitacion || '',
    certificacionesVigentes: initialData.certificacionesVigentes || false,

    // Capacitaciones
    ultimaCapacitacion: initialData.ultimaCapacitacion || '',
    temasCapacitacion: initialData.temasCapacitacion || '',
    frecuenciaCapacitacion: initialData.frecuenciaCapacitacion || '',

    // Disponibilidad
    disponibilidad24x7: initialData.disponibilidad24x7 || false,
    tiempoRespuesta: initialData.tiempoRespuesta || '',
    protocoloEscalamiento: initialData.protocoloEscalamiento || false,

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

    if (!formData.cantidadTecnicos) {
      newErrors.cantidadTecnicos = 'Cantidad de técnicos es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        sectionId: 'personal-capacitado',
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
          Personal Capacitado en Sitio
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, color: '#374151', mb: 2 }}>
          Descripción
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontWeight: 300, color: '#6b7280', lineHeight: 1.6, mb: 3 }}>
          Personal técnico capacitado disponible para resolver incidentes.
        </Typography>

        <Alert severity="info" sx={{ mb: 3, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, color: '#1e293b' }}>
            Criterio de aceptación
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
            Adjuntar listado de personal técnico con certificaciones y capacitaciones vigentes en formato PDF o Excel.
          </Typography>
        </Alert>
      </Box>

      <Grid container spacing={3}>
        {/* Personal Técnico */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                Personal Técnico
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Cantidad de Técnicos"
                    value={formData.cantidadTecnicos}
                    onChange={(e) => handleInputChange('cantidadTecnicos', e.target.value)}
                    error={!!errors.cantidadTecnicos}
                    helperText={errors.cantidadTecnicos}
                    type="number"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Nivel de Capacitación</InputLabel>
                    <Select
                      value={formData.nivelCapacitacion}
                      onChange={(e) => handleInputChange('nivelCapacitacion', e.target.value)}
                      label="Nivel de Capacitación"
                    >
                      <MenuItem value="basico">Básico</MenuItem>
                      <MenuItem value="intermedio">Intermedio</MenuItem>
                      <MenuItem value="avanzado">Avanzado</MenuItem>
                      <MenuItem value="especialista">Especialista</MenuItem>
                      <MenuItem value="mixto">Niveles Mixtos</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tiempo de Respuesta Promedio"
                    value={formData.tiempoRespuesta}
                    onChange={(e) => handleInputChange('tiempoRespuesta', e.target.value)}
                    placeholder="Ej: 30 minutos, 2 horas"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.certificacionesVigentes}
                        onChange={(e) => handleInputChange('certificacionesVigentes', e.target.checked)}
                      />
                    }
                    label="Personal cuenta con certificaciones técnicas vigentes"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.disponibilidad24x7}
                        onChange={(e) => handleInputChange('disponibilidad24x7', e.target.checked)}
                      />
                    }
                    label="Disponibilidad 24x7 (guardia pasiva o activa)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.protocoloEscalamiento}
                        onChange={(e) => handleInputChange('protocoloEscalamiento', e.target.checked)}
                      />
                    }
                    label="Cuenta con protocolo de escalamiento definido"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Capacitaciones */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon />
                Capacitaciones y Certificaciones
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha de Última Capacitación"
                    value={formData.ultimaCapacitacion}
                    onChange={(e) => handleInputChange('ultimaCapacitacion', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Frecuencia de Capacitaciones</InputLabel>
                    <Select
                      value={formData.frecuenciaCapacitacion}
                      onChange={(e) => handleInputChange('frecuenciaCapacitacion', e.target.value)}
                      label="Frecuencia de Capacitaciones"
                    >
                      <MenuItem value="mensual">Mensual</MenuItem>
                      <MenuItem value="trimestral">Trimestral</MenuItem>
                      <MenuItem value="semestral">Semestral</MenuItem>
                      <MenuItem value="anual">Anual</MenuItem>
                      <MenuItem value="segun-necesidad">Según necesidad</MenuItem>
                      <MenuItem value="no-definida">No definida</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Temas de Capacitación"
                    value={formData.temasCapacitacion}
                    onChange={(e) => handleInputChange('temasCapacitacion', e.target.value)}
                    multiline
                    rows={3}
                    placeholder="Describa los temas de capacitación: redes, servidores, seguridad, etc."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones sobre el personal técnico"
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    multiline
                    rows={4}
                    placeholder="Describa la estructura del equipo técnico, especializaciones, rotaciones, etc."
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
                Listado de Personal Técnico
              </Typography>
              <Alert severity="warning" sx={{ mb: 2, background: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.2)' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  👥 LISTADO OPCIONAL
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
                  • <strong>Formatos aceptados:</strong> PDF, Excel (.xls/.xlsx)<br/>
                  • <strong>Contenido:</strong> Listado de personal técnico<br/>
                  • <strong>Incluir:</strong> Certificaciones y capacitaciones vigentes<br/>
                  • Especificar roles y especializaciones
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
                    Subir Listado de Personal
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
                    label="Fecha de actualización del listado"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones sobre el listado"
                    multiline
                    rows={3}
                    placeholder="Describa el contenido del listado, certificaciones incluidas, vigencias..."
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

export default PersonalCapacitadoForm;