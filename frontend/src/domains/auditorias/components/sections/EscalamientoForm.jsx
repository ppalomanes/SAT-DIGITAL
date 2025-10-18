import React, { useState, useEffect } from 'react';
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
  Checkbox,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Phone as PhoneIcon,
  Description as DocumentIcon,
  ContactPhone as ContactIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { THEME_COLORS } from '../../../../shared/constants/theme';
import httpClient from '../../../../shared/services/httpClient';

const EscalamientoForm = ({ onSave, onCancel, initialData = {}, auditData }) => {
  const [formData, setFormData] = useState({
    // Contactos primarios
    contactoPrimario: initialData.contactoPrimario || '',
    telefonoPrimario: initialData.telefonoPrimario || '',
    emailPrimario: initialData.emailPrimario || '',

    // Contactos secundarios
    contactoSecundario: initialData.contactoSecundario || '',
    telefonoSecundario: initialData.telefonoSecundario || '',
    emailSecundario: initialData.emailSecundario || '',

    // Configuración de escalamiento
    tiempoEscalamiento: initialData.tiempoEscalamiento || '',
    criteriosEscalamiento: initialData.criteriosEscalamiento || '',
    disponibilidadContactos: initialData.disponibilidadContactos || '',

    // Protocolos
    protocoloDocumentado: initialData.protocoloDocumentado || false,
    pruebasPeriodicasContactos: initialData.pruebasPeriodicasContactos || false,

    // Observaciones
    observaciones: initialData.observaciones || '',

    // Archivos adjuntos
    archivosAdjuntos: initialData.archivosAdjuntos || []
  });

  const [errors, setErrors] = useState({});
  const [seccionId, setSeccionId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Obtener ID de la sección desde el backend
  useEffect(() => {
    const fetchSeccionId = async () => {
      try {
        const response = await httpClient.get('/documentos/secciones-tecnicas');
        const seccion = response.data.data.find(s => s.codigo === 'escalamiento');
        if (seccion) {
          setSeccionId(seccion.id);
        }
      } catch (error) {
        console.error('Error fetching seccion ID:', error);
      }
    };
    fetchSeccionId();
  }, []);

  // Cargar documentos existentes si hay auditData
  useEffect(() => {
    if (auditData?.id) {
      fetchExistingDocuments();
    }
  }, [auditData]);

  const fetchExistingDocuments = async () => {
    try {
      const response = await httpClient.get(`/documentos/auditoria/${auditData.id}`);
      const seccionData = response.data.documentos_por_seccion?.[seccionId];
      const docs = seccionData?.documentos || [];
      setUploadedFiles(docs);
    } catch (error) {
      console.error('Error fetching existing documents:', error);
    }
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    if (!auditData?.id) {
      alert('Error: No se encontró ID de auditoría');
      return;
    }

    if (!seccionId) {
      alert('Error: No se encontró ID de sección. Espere un momento e intente nuevamente.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append('auditoria_id', auditData.id);
      formDataToUpload.append('seccion_id', seccionId);
      formDataToUpload.append('observaciones', formData.observaciones || '');

      files.forEach((file) => {
        formDataToUpload.append('documentos', file);
      });

      const response = await httpClient.post('/documentos/cargar', formDataToUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        alert(`✅ ${response.data.documentos_guardados} documento(s) cargado(s) exitosamente`);
        await fetchExistingDocuments();
        event.target.value = '';
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      const errorMsg = error.response?.data?.error || error.message;
      alert('❌ Error al cargar documentos: ' + errorMsg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  const [uploadProgress, setUploadProgress] = useState(0);

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

    if (!formData.contactoPrimario) {
      newErrors.contactoPrimario = 'Contacto primario es requerido';
    }
    if (!formData.telefonoPrimario) {
      newErrors.telefonoPrimario = 'Teléfono primario es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        sectionId: 'escalamiento',
        data: formData,
        completedAt: new Date().toISOString(),
        status: 'completed',
        documentCount: uploadedFiles.length
      });
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header con descripción basada en auditoria.html */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, color: THEME_COLORS.grey[900], mb: 2 }}>
          Escalamiento (Números de Contacto)
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, color: THEME_COLORS.grey[700], mb: 2 }}>
          Descripción
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontWeight: 300, color: THEME_COLORS.grey[600], lineHeight: 1.6, mb: 3 }}>
          Números de contacto y proceso de escalamiento ante incidentes.
        </Typography>

        <Alert severity="info" sx={{ mb: 3, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, color: THEME_COLORS.grey[900] }}>
            Criterio de aceptación
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
            Adjuntar listado actualizado de contactos y proceso de escalamiento en formato PDF o Excel.
          </Typography>
        </Alert>
      </Box>

      <Grid container spacing={3}>
        {/* Contacto Primario */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ContactIcon />
                Contacto Primario
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nombre del Contacto Primario"
                    value={formData.contactoPrimario}
                    onChange={(e) => handleInputChange('contactoPrimario', e.target.value)}
                    error={!!errors.contactoPrimario}
                    helperText={errors.contactoPrimario}
                    placeholder="Nombre y apellido del responsable"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Teléfono Primario"
                    value={formData.telefonoPrimario}
                    onChange={(e) => handleInputChange('telefonoPrimario', e.target.value)}
                    error={!!errors.telefonoPrimario}
                    helperText={errors.telefonoPrimario}
                    placeholder="Ej: +54 11 1234-5678"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Primario"
                    type="email"
                    value={formData.emailPrimario}
                    onChange={(e) => handleInputChange('emailPrimario', e.target.value)}
                    placeholder="contacto@empresa.com"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Contacto Secundario */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon />
                Contacto Secundario / Escalamiento
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nombre del Contacto Secundario"
                    value={formData.contactoSecundario}
                    onChange={(e) => handleInputChange('contactoSecundario', e.target.value)}
                    placeholder="Contacto de escalamiento"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Teléfono Secundario"
                    value={formData.telefonoSecundario}
                    onChange={(e) => handleInputChange('telefonoSecundario', e.target.value)}
                    placeholder="Teléfono de escalamiento"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Secundario"
                    type="email"
                    value={formData.emailSecundario}
                    onChange={(e) => handleInputChange('emailSecundario', e.target.value)}
                    placeholder="escalamiento@empresa.com"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tiempo de Escalamiento"
                    value={formData.tiempoEscalamiento}
                    onChange={(e) => handleInputChange('tiempoEscalamiento', e.target.value)}
                    placeholder="Ej: 30 minutos, 1 hora"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Protocolos y Configuración */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Protocolos y Configuración
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Disponibilidad de Contactos</InputLabel>
                    <Select
                      value={formData.disponibilidadContactos}
                      onChange={(e) => handleInputChange('disponibilidadContactos', e.target.value)}
                      label="Disponibilidad de Contactos"
                    >
                      <MenuItem value="24x7">24x7</MenuItem>
                      <MenuItem value="horario-comercial">Horario Comercial</MenuItem>
                      <MenuItem value="guardia-pasiva">Guardia Pasiva</MenuItem>
                      <MenuItem value="segun-severidad">Según Severidad</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Criterios de Escalamiento"
                    value={formData.criteriosEscalamiento}
                    onChange={(e) => handleInputChange('criteriosEscalamiento', e.target.value)}
                    multiline
                    rows={3}
                    placeholder="Describa cuándo y cómo se debe escalar un incidente..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.protocoloDocumentado}
                        onChange={(e) => handleInputChange('protocoloDocumentado', e.target.checked)}
                      />
                    }
                    label="Protocolo de escalamiento documentado y actualizado"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.pruebasPeriodicasContactos}
                        onChange={(e) => handleInputChange('pruebasPeriodicasContactos', e.target.checked)}
                      />
                    }
                    label="Se realizan pruebas periódicas de contactos"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones sobre el proceso de escalamiento"
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    multiline
                    rows={4}
                    placeholder="Describa detalles adicionales del proceso, horarios especiales, contactos adicionales..."
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
              <Typography variant="h6" gutterBottom sx={{ color: THEME_COLORS.error.main, fontWeight: 500 }}>
                Listado de Contactos
              </Typography>
              <Alert severity="warning" sx={{ mb: 2, background: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.2)' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  📞 LISTADO OPCIONAL
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
                  • <strong>Formatos aceptados:</strong> PDF, Excel (.xls/.xlsx)<br/>
                  • <strong>Contenido:</strong> Listado actualizado de contactos<br/>
                  • <strong>Incluir:</strong> Proceso de escalamiento<br/>
                  • Especificar horarios de disponibilidad y roles
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
                      background: THEME_COLORS.warning.main,
                      '&:hover': {
                        background: THEME_COLORS.warning.dark
                      }
                    }}
                  >
                    Subir Listado de Contactos
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
                    label="Fecha de última actualización"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones sobre el listado"
                    multiline
                    rows={3}
                    placeholder="Describa el contenido del listado, frecuencia de actualización, validaciones..."
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

export default EscalamientoForm;