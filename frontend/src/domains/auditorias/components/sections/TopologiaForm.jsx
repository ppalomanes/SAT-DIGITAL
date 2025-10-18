import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
  Chip,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { THEME_COLORS } from '../../../../shared/constants/theme';
import httpClient from '../../../../shared/services/httpClient';

const TopologiaForm = ({ onSave, onCancel, initialData = {}, auditData }) => {
  const [formData, setFormData] = useState({
    // Información de Red
    tipoRed: initialData.tipoRed || '',
    proveedorInternet: initialData.proveedorInternet || '',
    anchosDeBanda: initialData.anchosDeBanda || '',
    direccionIP: initialData.direccionIP || '',
    mascaraSubred: initialData.mascaraSubred || '',
    gateway: initialData.gateway || '',
    servidoresDNS: initialData.servidoresDNS || '',
    
    // Equipos de Red
    router: initialData.router || '',
    switch: initialData.switch || '',
    firewall: initialData.firewall || '',
    accessPoints: initialData.accessPoints || '',
    
    // Configuraciones
    vlan: initialData.vlan || false,
    redundancia: initialData.redundancia || false,
    qos: initialData.qos || false,
    monitoreo: initialData.monitoreo || false,
    
    // Documentación
    esquemaRed: initialData.esquemaRed || '',
    documentacionIP: initialData.documentacionIP || '',
    
    // Observaciones
    observaciones: initialData.observaciones || '',
    
    // Archivos adjuntos
    archivosAdjuntos: initialData.archivosAdjuntos || []
  });

  const [errors, setErrors] = useState({});
  const [seccionId, setSeccionId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Obtener ID de la sección desde el backend
  useEffect(() => {
    const fetchSeccionId = async () => {
      try {
        const response = await httpClient.get('/documentos/secciones-tecnicas');
        const seccion = response.data.data.find(s => s.codigo === 'topologia');
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

      // La estructura es: { documentos_por_seccion: { [seccionId]: { seccion, documentos: [...] } } }
      const seccionData = response.data.documentos_por_seccion?.[seccionId];
      const topologiaDocs = seccionData?.documentos || [];

      setUploadedFiles(topologiaDocs);
    } catch (error) {
      console.error('Error fetching existing documents:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validaciones requeridas
    if (!formData.tipoRed) newErrors.tipoRed = 'Tipo de red es requerido';
    if (!formData.proveedorInternet) newErrors.proveedorInternet = 'Proveedor de internet es requerido';
    if (!formData.anchosDeBanda) newErrors.anchosDeBanda = 'Ancho de banda es requerido';
    if (!formData.direccionIP) newErrors.direccionIP = 'Dirección IP es requerida';
    if (!formData.gateway) newErrors.gateway = 'Gateway es requerido';
    if (!formData.router) newErrors.router = 'Información del router es requerida';
    
    // Validación formato IP
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (formData.direccionIP && !ipRegex.test(formData.direccionIP)) {
      newErrors.direccionIP = 'Formato de IP inválido';
    }
    if (formData.gateway && !ipRegex.test(formData.gateway)) {
      newErrors.gateway = 'Formato de IP inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        // Notificar éxito
        alert(`✅ ${response.data.documentos_guardados} documento(s) cargado(s) exitosamente`);

        // Recargar todos los documentos
        await fetchExistingDocuments();

        // Limpiar input
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

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        sectionId: 'topologia',
        data: formData,
        completedAt: new Date().toISOString(),
        status: uploadedFiles.length > 0 ? 'completed' : 'warning',
        documentCount: uploadedFiles.length
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header con descripción */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 500,
            color: THEME_COLORS.grey[900],
            mb: 2
          }}
        >
          Topología de Red
        </Typography>

        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 400,
            color: THEME_COLORS.grey[700],
            mb: 2
          }}
        >
          Descripción
        </Typography>

        <Typography
          variant="body1"
          paragraph
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 300,
            color: THEME_COLORS.grey[600],
            lineHeight: 1.6,
            mb: 3
          }}
        >
          Este punto verifica el diseño y distribución de la infraestructura de red del sitio, 
          incluyendo los componentes de telecomunicaciones y su interconexión.
        </Typography>
        
        <Alert severity="warning" sx={{ mb: 3, background: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.2)' }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, color: THEME_COLORS.grey[900] }}>
            Requerimiento específico (1.2)
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
            Enviar un documento PDF indicando topología y rutas declaradas hacia Telecom.
          </Typography>
        </Alert>
        
        <Alert severity="info" sx={{ mb: 3, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, color: THEME_COLORS.grey[900] }}>
            Criterio de aceptación
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
            Adjuntar archivo en formato PDF con el diagrama de la topología de infraestructura TECO y del sitio del proveedor. 
            El documento debe incluir el membrete del sitio auditado y la fecha de revisión.
          </Typography>
        </Alert>
      </Box>
      
      <Grid container spacing={3}>
        
        {/* Información General de Red */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: THEME_COLORS.primary.main, fontWeight: 500 }}>
                Información General de Red
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth error={!!errors.tipoRed}>
                    <InputLabel>Tipo de Red</InputLabel>
                    <Select
                      value={formData.tipoRed}
                      onChange={(e) => handleInputChange('tipoRed', e.target.value)}
                      label="Tipo de Red"
                    >
                      <MenuItem value="ethernet">Ethernet</MenuItem>
                      <MenuItem value="fibra">Fibra Óptica</MenuItem>
                      <MenuItem value="hibrida">Híbrida</MenuItem>
                      <MenuItem value="wireless">Wireless</MenuItem>
                    </Select>
                  </FormControl>
                  {errors.tipoRed && (
                    <Typography variant="caption" color="error">{errors.tipoRed}</Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Proveedor de Internet"
                    value={formData.proveedorInternet}
                    onChange={(e) => handleInputChange('proveedorInternet', e.target.value)}
                    error={!!errors.proveedorInternet}
                    helperText={errors.proveedorInternet}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Ancho de Banda Contratado"
                    value={formData.anchosDeBanda}
                    onChange={(e) => handleInputChange('anchosDeBanda', e.target.value)}
                    placeholder="Ej: 100 Mbps / 50 Mbps"
                    error={!!errors.anchosDeBanda}
                    helperText={errors.anchosDeBanda}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<UploadIcon />}
                    sx={{
                      height: 56,
                      borderColor: THEME_COLORS.primary.main,
                      color: THEME_COLORS.primary.main,
                      '&:hover': {
                        borderColor: THEME_COLORS.primary.dark,
                        backgroundColor: 'rgba(37, 99, 235, 0.04)'
                      }
                    }}
                  >
                    🤖 Analizar con IA - Subir documento para auto-completar campos
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Configuración IP */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: THEME_COLORS.success.main, fontWeight: 500 }}>
                Configuración de Red IP
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Dirección IP Principal"
                    value={formData.direccionIP}
                    onChange={(e) => handleInputChange('direccionIP', e.target.value)}
                    placeholder="192.168.1.1"
                    error={!!errors.direccionIP}
                    helperText={errors.direccionIP}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Máscara de Subred"
                    value={formData.mascaraSubred}
                    onChange={(e) => handleInputChange('mascaraSubred', e.target.value)}
                    placeholder="255.255.255.0"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Gateway"
                    value={formData.gateway}
                    onChange={(e) => handleInputChange('gateway', e.target.value)}
                    placeholder="192.168.1.1"
                    error={!!errors.gateway}
                    helperText={errors.gateway}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Servidores DNS"
                    value={formData.servidoresDNS}
                    onChange={(e) => handleInputChange('servidoresDNS', e.target.value)}
                    placeholder="8.8.8.8, 8.8.4.4"
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Equipos de Red */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: THEME_COLORS.error.main, fontWeight: 500 }}>
                Equipos de Red
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Router (Marca/Modelo)"
                    value={formData.router}
                    onChange={(e) => handleInputChange('router', e.target.value)}
                    error={!!errors.router}
                    helperText={errors.router}
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Switch (Marca/Modelo/Puertos)"
                    value={formData.switch}
                    onChange={(e) => handleInputChange('switch', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Firewall (Marca/Modelo)"
                    value={formData.firewall}
                    onChange={(e) => handleInputChange('firewall', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Access Points (Cantidad/Modelo)"
                    value={formData.accessPoints}
                    onChange={(e) => handleInputChange('accessPoints', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Configuraciones Avanzadas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#7c3aed', fontWeight: 500 }}>
                Configuraciones Avanzadas
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.vlan}
                        onChange={(e) => handleInputChange('vlan', e.target.checked)}
                      />
                    }
                    label="VLANs Configuradas"
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.redundancia}
                        onChange={(e) => handleInputChange('redundancia', e.target.checked)}
                      />
                    }
                    label="Redundancia de Red"
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.qos}
                        onChange={(e) => handleInputChange('qos', e.target.checked)}
                      />
                    }
                    label="QoS Implementado"
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.monitoreo}
                        onChange={(e) => handleInputChange('monitoreo', e.target.checked)}
                      />
                    }
                    label="Monitoreo de Red"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Observaciones */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#0891b2', fontWeight: 500 }}>
                Observaciones y Comentarios
              </Typography>
              <TextField
                fullWidth
                label="Observaciones Adicionales"
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                multiline
                rows={4}
                placeholder="Incluir cualquier observación relevante sobre la topología de red..."
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Archivos Adjuntos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: THEME_COLORS.error.main, fontWeight: 500 }}>
                Documento PDF Requerido (*)
              </Typography>
              <Alert severity="error" sx={{ mb: 2, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  📝 DOCUMENTO OBLIGATORIO
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
                  • <strong>PDF con diagrama de topología TECO y del sitio</strong><br/>
                  • Debe incluir membrete del sitio auditado<br/>
                  • Debe incluir fecha de revisión 2025<br/>
                  • Indicar rutas declaradas hacia Telecom
                </Typography>
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
                    disabled={uploading || !seccionId}
                    sx={{
                      mr: 2,
                      background: THEME_COLORS.error.main,
                      '&:hover': {
                        background: THEME_COLORS.error.dark
                      }
                    }}
                  >
                    {uploading ? 'Subiendo...' : 'Subir PDF de Topología (OBLIGATORIO)'}
                    <input
                      type="file"
                      hidden
                      accept=".pdf"
                      required
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </Button>
                  {!seccionId && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                      Cargando configuración...
                    </Typography>
                  )}
                </Grid>

                {uploading && (
                  <Grid item xs={12}>
                    <Box sx={{ width: '100%' }}>
                      <LinearProgress variant="determinate" value={uploadProgress} />
                      <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                        Subiendo... {uploadProgress}%
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {uploadedFiles.length > 0 && (
                  <Grid item xs={12}>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        ✅ Documentos cargados ({uploadedFiles.length}):
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {uploadedFiles.map((file, index) => (
                          <Chip
                            key={file.id || index}
                            icon={<CheckIcon />}
                            label={`${file.nombre_original} (${(file.tamaño_bytes / 1024).toFixed(1)} KB)`}
                            color="success"
                            size="small"
                          />
                        ))}
                      </Box>
                    </Alert>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha de última revisión"
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones específicas"
                    multiline
                    rows={3}
                    placeholder="Observaciones adicionales sobre la topología..."
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

export default TopologiaForm;