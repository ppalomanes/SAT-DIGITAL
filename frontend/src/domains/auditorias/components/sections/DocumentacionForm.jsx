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
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { THEME_COLORS } from '../../../../shared/constants/theme';
import httpClient from '../../../../shared/services/httpClient';

const DocumentacionForm = ({ onSave, onCancel, initialData = {}, auditData }) => {
  const [formData, setFormData] = useState({
    // Documentos requeridos
    manuales: {
      disponible: initialData.manuales?.disponible || false,
      version: initialData.manuales?.version || '',
      fechaActualizacion: initialData.manuales?.fechaActualizacion || '',
      estado: initialData.manuales?.estado || 'pendiente'
    },
    diagramasRed: {
      disponible: initialData.diagramasRed?.disponible || false,
      actualizados: initialData.diagramasRed?.actualizados || false,
      fechaUltimaRevision: initialData.diagramasRed?.fechaUltimaRevision || '',
      estado: initialData.diagramasRed?.estado || 'pendiente'
    },
    inventarioEquipos: {
      disponible: initialData.inventarioEquipos?.disponible || false,
      actualizado: initialData.inventarioEquipos?.actualizado || false,
      herramientaGestion: initialData.inventarioEquipos?.herramientaGestion || '',
      estado: initialData.inventarioEquipos?.estado || 'pendiente'
    },
    documentacionSeguridad: {
      disponible: initialData.documentacionSeguridad?.disponible || false,
      politicas: initialData.documentacionSeguridad?.politicas || false,
      procedimientos: initialData.documentacionSeguridad?.procedimientos || false,
      estado: initialData.documentacionSeguridad?.estado || 'pendiente'
    },
    
    // Controles y procedimientos
    procedimientosBackup: {
      documentado: initialData.procedimientosBackup?.documentado || false,
      frecuencia: initialData.procedimientosBackup?.frecuencia || '',
      ubicacionCopias: initialData.procedimientosBackup?.ubicacionCopias || '',
      pruebasRestauracion: initialData.procedimientosBackup?.pruebasRestauracion || false
    },
    planContinuidad: {
      disponible: initialData.planContinuidad?.disponible || false,
      actualizado: initialData.planContinuidad?.actualizado || false,
      fechaUltimaPrueba: initialData.planContinuidad?.fechaUltimaPrueba || '',
      rtoRpo: initialData.planContinuidad?.rtoRpo || ''
    },
    
    // Lista de documentos adicionales
    documentosAdicionales: initialData.documentosAdicionales || [],
    
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
  const [nuevoDocumento, setNuevoDocumento] = useState({
    nombre: '',
    tipo: '',
    estado: 'disponible'
  });

  const tiposDocumento = [
    'Manual técnico',
    'Procedimiento operativo',
    'Política de seguridad',
    'Diagrama de red',
    'Certificación',
    'Contrato de servicio',
    'Otro'
  ];

  // Obtener ID de la sección desde el backend
  useEffect(() => {
    const fetchSeccionId = async () => {
      try {
        const response = await httpClient.get('/documentos/secciones-tecnicas');
        const seccion = response.data.data.find(s => s.codigo === 'documentacion');
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

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Limpiar error del campo si existe
    if (errors[`${section}.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${section}.${field}`]: null
      }));
    }
  };

  const handleSimpleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const agregarDocumento = () => {
    if (nuevoDocumento.nombre && nuevoDocumento.tipo) {
      setFormData(prev => ({
        ...prev,
        documentosAdicionales: [...prev.documentosAdicionales, { ...nuevoDocumento, id: Date.now() }]
      }));
      setNuevoDocumento({ nombre: '', tipo: '', estado: 'disponible' });
    }
  };

  const eliminarDocumento = (id) => {
    setFormData(prev => ({
      ...prev,
      documentosAdicionales: prev.documentosAdicionales.filter(doc => doc.id !== id)
    }));
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'completo':
        return <CheckIcon sx={{ color: THEME_COLORS.success.main }} />;
      case 'parcial':
        return <WarningIcon sx={{ color: THEME_COLORS.warning.main }} />;
      case 'faltante':
        return <ErrorIcon sx={{ color: THEME_COLORS.error.main }} />;
      default:
        return <WarningIcon sx={{ color: THEME_COLORS.grey[500] }} />;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validaciones básicas
    if (!formData.manuales.disponible && !formData.manuales.version) {
      newErrors['manuales.version'] = 'Debe especificar la versión del manual o marcar como no disponible';
    }
    
    if (formData.diagramasRed.disponible && !formData.diagramasRed.fechaUltimaRevision) {
      newErrors['diagramasRed.fechaUltimaRevision'] = 'Fecha de última revisión es requerida';
    }
    
    if (formData.inventarioEquipos.disponible && !formData.inventarioEquipos.herramientaGestion) {
      newErrors['inventarioEquipos.herramientaGestion'] = 'Debe especificar la herramienta de gestión';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateCompletionStatus = () => {
    let completed = 0;
    let total = 4; // Número de secciones principales
    
    if (formData.manuales.disponible) completed++;
    if (formData.diagramasRed.disponible) completed++;
    if (formData.inventarioEquipos.disponible) completed++;
    if (formData.documentacionSeguridad.disponible) completed++;
    
    return {
      percentage: (completed / total) * 100,
      status: completed === total ? 'completed' : completed > 0 ? 'partial' : 'pending'
    };
  };

  const handleSave = () => {
    if (validateForm()) {
      const completionStatus = calculateCompletionStatus();
      onSave({
        sectionId: 'documentacion',
        data: formData,
        completedAt: new Date().toISOString(),
        status: uploadedFiles.length > 0 ? 'completed' : 'warning',
        completionPercentage: completionStatus.percentage,
        documentCount: uploadedFiles.length
      });
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header con descripción */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, color: THEME_COLORS.grey[900], mb: 2 }}>
          Documentación y Controles Infraestructura (*)
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, color: THEME_COLORS.grey[700], mb: 2 }}>
          Descripción
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontWeight: 300, color: THEME_COLORS.grey[600], lineHeight: 1.6, mb: 3 }}>
          Documentación necesaria para el control de la infraestructura tecnológica.
        </Typography>

        <Alert severity="info" sx={{ mb: 3, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, color: THEME_COLORS.grey[900] }}>
            Criterio de aceptación
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
            Adjuntar documentos PDF con detalles de controles y documentación de la infraestructura.
          </Typography>
        </Alert>
      </Box>

      <Grid container spacing={3}>
        
        {/* Manuales y Documentación Técnica */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getEstadoIcon(formData.manuales.estado)}
                Manuales y Documentación Técnica
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.manuales.disponible}
                        onChange={(e) => handleInputChange('manuales', 'disponible', e.target.checked)}
                      />
                    }
                    label="Manuales técnicos disponibles"
                  />
                </Grid>
                
                {formData.manuales.disponible && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Versión del Manual"
                        value={formData.manuales.version}
                        onChange={(e) => handleInputChange('manuales', 'version', e.target.value)}
                        error={!!errors['manuales.version']}
                        helperText={errors['manuales.version']}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Fecha de Actualización"
                        value={formData.manuales.fechaActualizacion}
                        onChange={(e) => handleInputChange('manuales', 'fechaActualizacion', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Estado de Documentación</InputLabel>
                        <Select
                          value={formData.manuales.estado}
                          onChange={(e) => handleInputChange('manuales', 'estado', e.target.value)}
                          label="Estado de Documentación"
                        >
                          <MenuItem value="completo">Completo y actualizado</MenuItem>
                          <MenuItem value="parcial">Parcialmente disponible</MenuItem>
                          <MenuItem value="desactualizado">Desactualizado</MenuItem>
                          <MenuItem value="faltante">Faltante</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Diagramas de Red */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getEstadoIcon(formData.diagramasRed.estado)}
                Diagramas de Red y Topología
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.diagramasRed.disponible}
                        onChange={(e) => handleInputChange('diagramasRed', 'disponible', e.target.checked)}
                      />
                    }
                    label="Diagramas de red disponibles"
                  />
                </Grid>
                
                {formData.diagramasRed.disponible && (
                  <>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.diagramasRed.actualizados}
                            onChange={(e) => handleInputChange('diagramasRed', 'actualizados', e.target.checked)}
                          />
                        }
                        label="Diagramas actualizados"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Fecha de Última Revisión"
                        value={formData.diagramasRed.fechaUltimaRevision}
                        onChange={(e) => handleInputChange('diagramasRed', 'fechaUltimaRevision', e.target.value)}
                        error={!!errors['diagramasRed.fechaUltimaRevision']}
                        helperText={errors['diagramasRed.fechaUltimaRevision']}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Estado de Diagramas</InputLabel>
                        <Select
                          value={formData.diagramasRed.estado}
                          onChange={(e) => handleInputChange('diagramasRed', 'estado', e.target.value)}
                          label="Estado de Diagramas"
                        >
                          <MenuItem value="completo">Completo y actualizado</MenuItem>
                          <MenuItem value="parcial">Parcialmente disponible</MenuItem>
                          <MenuItem value="desactualizado">Desactualizado</MenuItem>
                          <MenuItem value="faltante">Faltante</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventario de Equipos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getEstadoIcon(formData.inventarioEquipos.estado)}
                Inventario de Equipos
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.inventarioEquipos.disponible}
                        onChange={(e) => handleInputChange('inventarioEquipos', 'disponible', e.target.checked)}
                      />
                    }
                    label="Inventario de equipos disponible"
                  />
                </Grid>
                
                {formData.inventarioEquipos.disponible && (
                  <>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.inventarioEquipos.actualizado}
                            onChange={(e) => handleInputChange('inventarioEquipos', 'actualizado', e.target.checked)}
                          />
                        }
                        label="Inventario actualizado"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Herramienta de Gestión de Inventario"
                        value={formData.inventarioEquipos.herramientaGestion}
                        onChange={(e) => handleInputChange('inventarioEquipos', 'herramientaGestion', e.target.value)}
                        placeholder="Ej: Excel, GLPI, ServiceNow, sistema propietario"
                        error={!!errors['inventarioEquipos.herramientaGestion']}
                        helperText={errors['inventarioEquipos.herramientaGestion']}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Procedimientos de Backup */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Procedimientos de Backup y Recuperación
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.procedimientosBackup.documentado}
                        onChange={(e) => handleInputChange('procedimientosBackup', 'documentado', e.target.checked)}
                      />
                    }
                    label="Procedimientos documentados"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.procedimientosBackup.pruebasRestauracion}
                        onChange={(e) => handleInputChange('procedimientosBackup', 'pruebasRestauracion', e.target.checked)}
                      />
                    }
                    label="Pruebas de restauración periódicas"
                  />
                </Grid>

                {formData.procedimientosBackup.documentado && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Frecuencia de Backup"
                        value={formData.procedimientosBackup.frecuencia}
                        onChange={(e) => handleInputChange('procedimientosBackup', 'frecuencia', e.target.value)}
                        placeholder="Ej: Diario, Semanal, Tiempo Real"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Ubicación de Copias"
                        value={formData.procedimientosBackup.ubicacionCopias}
                        onChange={(e) => handleInputChange('procedimientosBackup', 'ubicacionCopias', e.target.value)}
                        placeholder="Ej: Nube, Sitio remoto, Local"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Documentos Adicionales */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Documentos Adicionales
              </Typography>
              
              {/* Agregar nuevo documento */}
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Nombre del Documento"
                      value={nuevoDocumento.nombre}
                      onChange={(e) => setNuevoDocumento(prev => ({ ...prev, nombre: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        value={nuevoDocumento.tipo}
                        onChange={(e) => setNuevoDocumento(prev => ({ ...prev, tipo: e.target.value }))}
                        label="Tipo"
                      >
                        {tiposDocumento.map((tipo) => (
                          <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Estado</InputLabel>
                      <Select
                        value={nuevoDocumento.estado}
                        onChange={(e) => setNuevoDocumento(prev => ({ ...prev, estado: e.target.value }))}
                        label="Estado"
                      >
                        <MenuItem value="disponible">Disponible</MenuItem>
                        <MenuItem value="parcial">Parcial</MenuItem>
                        <MenuItem value="faltante">Faltante</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={agregarDocumento}
                      disabled={!nuevoDocumento.nombre || !nuevoDocumento.tipo}
                    >
                      Agregar
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              {/* Lista de documentos */}
              {formData.documentosAdicionales.length > 0 && (
                <List>
                  {formData.documentosAdicionales.map((doc) => (
                    <ListItem key={doc.id} divider>
                      <ListItemIcon>
                        <DocumentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.nombre}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                            <Chip label={doc.tipo} size="small" variant="outlined" />
                            <Chip
                              label={doc.estado}
                              size="small"
                              color={
                                doc.estado === 'disponible' ? 'success' :
                                doc.estado === 'parcial' ? 'warning' : 'error'
                              }
                            />
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => eliminarDocumento(doc.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Observaciones */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Observaciones y Comentarios
              </Typography>
              <TextField
                fullWidth
                label="Observaciones Adicionales"
                value={formData.observaciones}
                onChange={(e) => handleSimpleChange('observaciones', e.target.value)}
                multiline
                rows={4}
                placeholder="Incluir detalles sobre el estado de la documentación, faltantes identificados, recomendaciones..."
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Archivos Requeridos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: THEME_COLORS.error.main, fontWeight: 500 }}>
                Documentos PDF Requeridos (*)
              </Typography>
              <Alert severity="error" sx={{ mb: 2, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  📝 DOCUMENTOS OBLIGATORIOS
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
                  • <strong>Documentos PDF con detalles de controles</strong><br/>
                  • <strong>Documentación de infraestructura</strong><br/>
                  • Debe incluir membrete del sitio auditado<br/>
                  • Debe incluir fecha de revisión 2025
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
                    {uploading ? 'Subiendo...' : 'Subir Documentación PDF (OBLIGATORIO)'}
                    <input
                      type="file"
                      hidden
                      accept=".pdf"
                      required
                      onChange={handleFileChange}
                      disabled={uploading}
                      multiple
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
                    placeholder="Observaciones adicionales sobre la documentación..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Summary */}
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Resumen de Completitud:</strong> {Math.round(calculateCompletionStatus().percentage)}% de documentación disponible
              ({['Manuales', 'Diagramas', 'Inventario', 'Seguridad'].filter((_, i) =>
                [formData.manuales.disponible, formData.diagramasRed.disponible,
                 formData.inventarioEquipos.disponible, formData.documentacionSeguridad.disponible][i]
              ).length}/4 categorías completadas)
            </Typography>
          </Alert>
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

export default DocumentacionForm;