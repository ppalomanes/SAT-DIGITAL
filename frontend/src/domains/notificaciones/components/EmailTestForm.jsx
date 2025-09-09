import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  Divider,
  Paper
} from '@mui/material';
import {
  Send,
  ExpandMore,
  Email,
  Code,
  Preview,
  DataObject
} from '@mui/icons-material';
import { emailTestService } from '../services/emailTestService';

const EmailTestForm = ({ templates, onNotification, onTestLog }) => {
  const [formData, setFormData] = useState({
    email: '',
    template: '',
    sampleData: {}
  });
  const [customData, setCustomData] = useState('{}');
  const [sending, setSending] = useState(false);
  const [expandedData, setExpandedData] = useState(false);

  const sampleDataPresets = {
    'notificacion-general': {
      titulo: 'Notificación del Sistema',
      mensaje: 'Esta es una notificación de prueba del sistema SAT-Digital',
      usuario: 'Usuario de Prueba',
      fecha: new Date().toLocaleDateString('es-AR')
    },
    'cambio-estado-auditoria': {
      auditoria: {
        id: 'AUD-2024-001',
        proveedor: 'Grupo Activo SRL',
        sitio: 'Florida 141 - CABA',
        periodo: 'Mayo 2024'
      },
      estadoAnterior: 'En Progreso',
      estadoNuevo: 'Completada',
      auditor: 'Juan Pérez',
      fecha: new Date().toISOString(),
      comentarios: 'Auditoría completada exitosamente'
    },
    'recordatorio-documentos': {
      proveedor: 'Grupo Activo SRL',
      sitio: 'Florida 141 - CABA',
      documentosPendientes: [
        { seccion: 'Topología de Red', vencimiento: '2024-05-15' },
        { seccion: 'Sala de Tecnología', vencimiento: '2024-05-20' }
      ],
      fechaLimite: '2024-05-25',
      diasRestantes: 5,
      urgencia: 'media'
    },
    'resumen-diario': {
      fecha: new Date().toLocaleDateString('es-AR'),
      estadisticas: {
        auditorias: { total: 24, completadas: 18, pendientes: 6 },
        documentos: { subidos: 45, pendientes: 23 },
        notificaciones: { enviadas: 67, leidas: 52 }
      },
      alertas: [
        'Documentos próximos a vencer: 5',
        'Auditorías sin actividad: 2'
      ]
    },
    'bienvenida': {
      usuario: 'Nuevo Usuario',
      email: 'nuevo@ejemplo.com',
      rol: 'Técnico Proveedor',
      proveedor: 'Grupo Activo SRL'
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-cargar datos de ejemplo cuando se selecciona un template
    if (field === 'template' && sampleDataPresets[value]) {
      const preset = sampleDataPresets[value];
      setFormData(prev => ({
        ...prev,
        sampleData: preset
      }));
      setCustomData(JSON.stringify(preset, null, 2));
    }
  };

  const handleCustomDataChange = (value) => {
    setCustomData(value);
    try {
      const parsed = JSON.parse(value);
      setFormData(prev => ({
        ...prev,
        sampleData: parsed
      }));
    } catch (error) {
      // JSON inválido, no actualizar formData
    }
  };

  const handleSendTest = async () => {
    if (!formData.email.trim()) {
      onNotification('Por favor ingresa un email válido', 'error');
      return;
    }

    if (!formData.template) {
      onNotification('Por favor selecciona un template', 'error');
      return;
    }

    setSending(true);
    try {
      const result = await emailTestService.testTemplate(
        formData.template,
        formData.email,
        formData.sampleData
      );

      onNotification(`Email enviado exitosamente a ${formData.email}`, 'success');
      onTestLog({
        template: formData.template,
        email: formData.email,
        success: true,
        message: 'Email enviado con datos personalizados',
        data: formData.sampleData
      });

    } catch (error) {
      onNotification(error.message, 'error');
      onTestLog({
        template: formData.template,
        email: formData.email,
        success: false,
        message: error.message,
        data: formData.sampleData
      });
    } finally {
      setSending(false);
    }
  };

  const isValidJSON = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
        Prueba Individual de Templates
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Envía un template específico con datos personalizados para verificar su funcionamiento
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuración del Envío
              </Typography>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Email de destino"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="test@ejemplo.com"
                  helperText="Email donde se enviará la prueba"
                  required
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth required>
                  <InputLabel>Template</InputLabel>
                  <Select
                    value={formData.template}
                    label="Template"
                    onChange={(e) => handleInputChange('template', e.target.value)}
                  >
                    {templates.map((template, index) => (
                      <MenuItem key={index} value={template.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Typography>{template.name}</Typography>
                          <Chip
                            label={template.type || 'general'}
                            size="small"
                            sx={{ ml: 'auto' }}
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSendTest}
                disabled={sending || !formData.email || !formData.template}
                startIcon={sending ? null : <Send />}
              >
                {sending ? 'Enviando...' : 'Enviar Email de Prueba'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <DataObject sx={{ mr: 1, verticalAlign: 'middle' }} />
                Datos del Template
              </Typography>

              {formData.template && sampleDataPresets[formData.template] && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Se han cargado datos de ejemplo para este template. Puedes modificarlos abajo.
                </Alert>
              )}

              <Accordion 
                expanded={expandedData} 
                onChange={() => setExpandedData(!expandedData)}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>
                    Datos JSON {!isValidJSON(customData) && '(JSON inválido)'}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    value={customData}
                    onChange={(e) => handleCustomDataChange(e.target.value)}
                    placeholder='{\n  "titulo": "Ejemplo",\n  "mensaje": "Contenido del email"\n}'
                    helperText="Datos en formato JSON que se pasarán al template"
                    error={!isValidJSON(customData)}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontFamily: 'monospace',
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                </AccordionDetails>
              </Accordion>

              {formData.template && (
                <Paper sx={{ p: 2, mt: 2, backgroundColor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    <Preview sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Vista Previa de Datos
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    <pre style={{ 
                      margin: 0, 
                      fontSize: '0.75rem',
                      lineHeight: 1.4,
                      color: '#666'
                    }}>
                      {JSON.stringify(formData.sampleData, null, 2)}
                    </pre>
                  </Box>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {formData.template && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <Code sx={{ mr: 1, verticalAlign: 'middle' }} />
              Información del Template
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Nombre:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formData.template}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Tipo:
                </Typography>
                <Chip 
                  label={templates.find(t => t.name === formData.template)?.type || 'general'} 
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Archivo:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {templates.find(t => t.name === formData.template)?.file}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default EmailTestForm;