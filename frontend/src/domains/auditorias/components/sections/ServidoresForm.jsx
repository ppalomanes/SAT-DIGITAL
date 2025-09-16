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
  Chip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Computer as ComputerIcon,
  Description as DocumentIcon
} from '@mui/icons-material';

const ServidoresForm = ({ onSave, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    // Información básica de servidores
    cantidadServidores: initialData.cantidadServidores || '',
    sistemaOperativo: initialData.sistemaOperativo || '',
    virtualizacion: initialData.virtualizacion || '',
    respaldos: initialData.respaldos || '',

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

    if (!formData.cantidadServidores) {
      newErrors.cantidadServidores = 'Cantidad de servidores es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        sectionId: 'servidores',
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
          Servidores
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, color: '#374151', mb: 2 }}>
          Descripción
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontWeight: 300, color: '#6b7280', lineHeight: 1.6, mb: 3 }}>
          Información técnica de servidores que soportan la operación.
        </Typography>

        <Alert severity="info" sx={{ mb: 3, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, color: '#1e293b' }}>
            Criterio de aceptación
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
            Adjuntar documento PDF, Word o Excel con detalles de software y servidores presentes en el sitio.
          </Typography>
        </Alert>
      </Box>

      <Grid container spacing={3}>
        {/* Información de Servidores */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ComputerIcon />
                Información de Servidores
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Cantidad de Servidores"
                    value={formData.cantidadServidores}
                    onChange={(e) => handleInputChange('cantidadServidores', e.target.value)}
                    error={!!errors.cantidadServidores}
                    helperText={errors.cantidadServidores}
                    type="number"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sistema Operativo Principal</InputLabel>
                    <Select
                      value={formData.sistemaOperativo}
                      onChange={(e) => handleInputChange('sistemaOperativo', e.target.value)}
                      label="Sistema Operativo Principal"
                    >
                      <MenuItem value="windows-server">Windows Server</MenuItem>
                      <MenuItem value="linux">Linux</MenuItem>
                      <MenuItem value="unix">Unix</MenuItem>
                      <MenuItem value="mixto">Mixto</MenuItem>
                      <MenuItem value="otro">Otro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tecnología de Virtualización</InputLabel>
                    <Select
                      value={formData.virtualizacion}
                      onChange={(e) => handleInputChange('virtualizacion', e.target.value)}
                      label="Tecnología de Virtualización"
                    >
                      <MenuItem value="">Sin virtualización</MenuItem>
                      <MenuItem value="vmware">VMware</MenuItem>
                      <MenuItem value="hyper-v">Hyper-V</MenuItem>
                      <MenuItem value="kvm">KVM</MenuItem>
                      <MenuItem value="xen">Xen</MenuItem>
                      <MenuItem value="otro">Otro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sistema de Respaldos</InputLabel>
                    <Select
                      value={formData.respaldos}
                      onChange={(e) => handleInputChange('respaldos', e.target.value)}
                      label="Sistema de Respaldos"
                    >
                      <MenuItem value="">Sin sistema de respaldos</MenuItem>
                      <MenuItem value="veeam">Veeam</MenuItem>
                      <MenuItem value="acronis">Acronis</MenuItem>
                      <MenuItem value="windows-backup">Windows Server Backup</MenuItem>
                      <MenuItem value="bacula">Bacula</MenuItem>
                      <MenuItem value="otro">Otro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones sobre servidores"
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    multiline
                    rows={4}
                    placeholder="Describa los servidores, sus funciones, configuraciones especiales..."
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
                Documento Requerido
              </Typography>
              <Alert severity="warning" sx={{ mb: 2, background: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.2)' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  📄 DOCUMENTO OPCIONAL
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
                  • <strong>Formatos aceptados:</strong> PDF, Word (.doc/.docx), Excel (.xls/.xlsx)<br/>
                  • <strong>Contenido:</strong> Detalles de software y servidores presentes en el sitio<br/>
                  • Incluir especificaciones técnicas, roles y configuraciones
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
                    Subir Documento de Servidores
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
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
                    label="Observaciones sobre el documento"
                    multiline
                    rows={3}
                    placeholder="Describa el contenido del documento adjunto..."
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

export default ServidoresForm;