import React, { useState } from 'react';
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
  Chip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as DocumentIcon
} from '@mui/icons-material';

const TopologiaForm = ({ onSave, onCancel, initialData = {} }) => {
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

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        sectionId: 'topologia',
        data: formData,
        completedAt: new Date().toISOString(),
        status: 'completed'
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
            color: '#1e293b',
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
            color: '#374151',
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
            color: '#6b7280',
            lineHeight: 1.6,
            mb: 3
          }}
        >
          Este punto verifica el diseño y distribución de la infraestructura de red del sitio, 
          incluyendo los componentes de telecomunicaciones y su interconexión.
        </Typography>
        
        <Alert severity="warning" sx={{ mb: 3, background: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.2)' }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, color: '#1e293b' }}>
            Requerimiento específico (1.2)
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
            Enviar un documento PDF indicando topología y rutas declaradas hacia Telecom.
          </Typography>
        </Alert>
        
        <Alert severity="info" sx={{ mb: 3, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, color: '#1e293b' }}>
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
              <Typography variant="h6" gutterBottom sx={{ color: '#2563eb', fontWeight: 500 }}>
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
                      borderColor: '#2563eb',
                      color: '#2563eb',
                      '&:hover': {
                        borderColor: '#1d4ed8',
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
              <Typography variant="h6" gutterBottom sx={{ color: '#059669', fontWeight: 500 }}>
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
              <Typography variant="h6" gutterBottom sx={{ color: '#dc2626', fontWeight: 500 }}>
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
              <Typography variant="h6" gutterBottom sx={{ color: '#dc2626', fontWeight: 500 }}>
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
                    startIcon={<UploadIcon />}
                    sx={{
                      mr: 2,
                      background: '#dc2626',
                      '&:hover': {
                        background: '#b91c1c'
                      }
                    }}
                  >
                    Subir PDF de Topología (OBLIGATORIO)
                    <input
                      type="file"
                      hidden
                      accept=".pdf"
                      required
                    />
                  </Button>
                </Grid>

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