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
  Security as SecurityIcon,
  Description as DocumentIcon,
  Shield as ShieldIcon,
  Lock as LockIcon
} from '@mui/icons-material';

const SeguridadInformacionForm = ({ onSave, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    // Políticas de seguridad
    politicasSeguridad: initialData.politicasSeguridad || false,
    fechaUltimaRevision: initialData.fechaUltimaRevision || '',
    responsableSeguridad: initialData.responsableSeguridad || '',

    // Controles de acceso
    controlAccesoFisico: initialData.controlAccesoFisico || '',
    controlAccesoLogico: initialData.controlAccesoLogico || '',
    autenticacionMultifactor: initialData.autenticacionMultifactor || false,

    // Monitoreo y respaldos
    sistemaMonitoreo: initialData.sistemaMonitoreo || '',
    respaldosSeguridad: initialData.respaldosSeguridad || '',
    frecuenciaRespaldos: initialData.frecuenciaRespaldos || '',

    // Certificaciones
    certificacionesSeguridad: initialData.certificacionesSeguridad || '',
    auditoriasSeguridad: initialData.auditoriasSeguridad || false,
    incidentesSeguridad: initialData.incidentesSeguridad || false,

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

    if (!formData.controlAccesoFisico) {
      newErrors.controlAccesoFisico = 'Control de acceso físico es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        sectionId: 'seguridad-informacion',
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
          Seguridad de la Información
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, color: '#374151', mb: 2 }}>
          Descripción
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontWeight: 300, color: '#6b7280', lineHeight: 1.6, mb: 3 }}>
          Políticas y controles de seguridad de la información implementados.
        </Typography>

        <Alert severity="info" sx={{ mb: 3, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, color: '#1e293b' }}>
            Criterio de aceptación
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
            Adjuntar políticas de seguridad vigentes y documentación de controles implementados en formato PDF.
          </Typography>
        </Alert>
      </Box>

      <Grid container spacing={3}>
        {/* Políticas de Seguridad */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon />
                Políticas de Seguridad
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.politicasSeguridad}
                        onChange={(e) => handleInputChange('politicasSeguridad', e.target.checked)}
                      />
                    }
                    label="Cuenta con políticas de seguridad documentadas y vigentes"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha de Última Revisión de Políticas"
                    value={formData.fechaUltimaRevision}
                    onChange={(e) => handleInputChange('fechaUltimaRevision', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Responsable de Seguridad"
                    value={formData.responsableSeguridad}
                    onChange={(e) => handleInputChange('responsableSeguridad', e.target.value)}
                    placeholder="Nombre del responsable de seguridad IT"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Certificaciones de Seguridad"
                    value={formData.certificacionesSeguridad}
                    onChange={(e) => handleInputChange('certificacionesSeguridad', e.target.value)}
                    placeholder="Ej: ISO 27001, SOC 2, PCI-DSS, etc."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Controles de Acceso */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockIcon />
                Controles de Acceso
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.controlAccesoFisico}>
                    <InputLabel>Control de Acceso Físico</InputLabel>
                    <Select
                      value={formData.controlAccesoFisico}
                      onChange={(e) => handleInputChange('controlAccesoFisico', e.target.value)}
                      label="Control de Acceso Físico"
                    >
                      <MenuItem value="tarjetas-rfid">Tarjetas RFID</MenuItem>
                      <MenuItem value="biometrico">Biométrico</MenuItem>
                      <MenuItem value="clave-numerica">Clave Numérica</MenuItem>
                      <MenuItem value="llaves-fisicas">Llaves Físicas</MenuItem>
                      <MenuItem value="mixto">Sistema Mixto</MenuItem>
                      <MenuItem value="sin-control">Sin Control</MenuItem>
                    </Select>
                  </FormControl>
                  {errors.controlAccesoFisico && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors.controlAccesoFisico}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Control de Acceso Lógico</InputLabel>
                    <Select
                      value={formData.controlAccesoLogico}
                      onChange={(e) => handleInputChange('controlAccesoLogico', e.target.value)}
                      label="Control de Acceso Lógico"
                    >
                      <MenuItem value="active-directory">Active Directory</MenuItem>
                      <MenuItem value="ldap">LDAP</MenuItem>
                      <MenuItem value="oauth-sso">OAuth/SSO</MenuItem>
                      <MenuItem value="usuarios-locales">Usuarios Locales</MenuItem>
                      <MenuItem value="mixto">Sistema Mixto</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.autenticacionMultifactor}
                        onChange={(e) => handleInputChange('autenticacionMultifactor', e.target.checked)}
                      />
                    }
                    label="Implementa autenticación multifactor (MFA/2FA)"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Monitoreo y Respaldos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShieldIcon />
                Monitoreo y Respaldos de Seguridad
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Sistema de Monitoreo"
                    value={formData.sistemaMonitoreo}
                    onChange={(e) => handleInputChange('sistemaMonitoreo', e.target.value)}
                    placeholder="Ej: SIEM, Log management, etc."
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Frecuencia de Respaldos</InputLabel>
                    <Select
                      value={formData.frecuenciaRespaldos}
                      onChange={(e) => handleInputChange('frecuenciaRespaldos', e.target.value)}
                      label="Frecuencia de Respaldos"
                    >
                      <MenuItem value="diario">Diario</MenuItem>
                      <MenuItem value="semanal">Semanal</MenuItem>
                      <MenuItem value="mensual">Mensual</MenuItem>
                      <MenuItem value="segun-necesidad">Según necesidad</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Sistema de Respaldos de Seguridad"
                    value={formData.respaldosSeguridad}
                    onChange={(e) => handleInputChange('respaldosSeguridad', e.target.value)}
                    placeholder="Describa el sistema de respaldos, ubicación, encriptación..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.auditoriasSeguridad}
                        onChange={(e) => handleInputChange('auditoriasSeguridad', e.target.checked)}
                      />
                    }
                    label="Se realizan auditorías periódicas de seguridad"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.incidentesSeguridad}
                        onChange={(e) => handleInputChange('incidentesSeguridad', e.target.checked)}
                      />
                    }
                    label="Existe protocolo de gestión de incidentes de seguridad"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones sobre seguridad"
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    multiline
                    rows={4}
                    placeholder="Describa controles adicionales, herramientas específicas, procedimientos..."
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
                Políticas de Seguridad
              </Typography>
              <Alert severity="warning" sx={{ mb: 2, background: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.2)' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  🔐 POLÍTICAS OPCIONALES
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
                  • <strong>Formato:</strong> PDF<br/>
                  • <strong>Contenido:</strong> Políticas de seguridad vigentes<br/>
                  • <strong>Incluir:</strong> Documentación de controles implementados<br/>
                  • Procedimientos y normativas aplicables
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
                    Subir Políticas de Seguridad
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
                    label="Fecha de versión de políticas"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones sobre las políticas"
                    multiline
                    rows={3}
                    placeholder="Describa el alcance de las políticas, certificaciones relacionadas, próximas revisiones..."
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

export default SeguridadInformacionForm;