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
  Chip,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Divider,
  Paper
} from '@mui/material';
import {
  Send,
  Group,
  Delete,
  Add,
  Email,
  CheckCircle,
  Error,
  Warning,
  Info
} from '@mui/icons-material';
import { emailTestService } from '../services/emailTestService';

const BulkEmailTest = ({ templates, onNotification, onTestLog }) => {
  const [formData, setFormData] = useState({
    emails: [''],
    template: '',
    data: {}
  });
  const [emailText, setEmailText] = useState('');
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const maxEmails = 20; // Límite según el backend

  const handleEmailsFromText = () => {
    if (!emailText.trim()) return;

    const emails = emailText
      .split(/[,\n\r\t\s]+/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'))
      .slice(0, maxEmails);

    setFormData(prev => ({
      ...prev,
      emails: emails
    }));
    setEmailText('');
  };

  const handleAddEmail = () => {
    if (formData.emails.length < maxEmails) {
      setFormData(prev => ({
        ...prev,
        emails: [...prev.emails, '']
      }));
    }
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...formData.emails];
    newEmails[index] = value;
    setFormData(prev => ({
      ...prev,
      emails: newEmails
    }));
  };

  const handleRemoveEmail = (index) => {
    const newEmails = formData.emails.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      emails: newEmails.length > 0 ? newEmails : ['']
    }));
  };

  const handleTemplateChange = (template) => {
    setFormData(prev => ({
      ...prev,
      template,
      data: getBulkSampleData(template)
    }));
  };

  const getBulkSampleData = (templateName) => {
    const bulkSampleData = {
      'notificacion-general': {
        titulo: 'Prueba de Envío Masivo',
        mensaje: 'Este es un email de prueba masiva del sistema SAT-Digital',
        fecha: new Date().toLocaleDateString('es-AR')
      },
      'cambio-estado-auditoria': {
        auditoria: {
          id: 'BULK-TEST-001',
          proveedor: 'Prueba Masiva',
          sitio: 'Sitio de Prueba',
          periodo: 'Test ' + new Date().getFullYear()
        },
        estadoAnterior: 'Pendiente',
        estadoNuevo: 'En Proceso',
        auditor: 'Sistema Automático'
      },
      'recordatorio-documentos': {
        proveedor: 'Prueba Masiva',
        sitio: 'Sitio de Prueba',
        documentosPendientes: [
          { seccion: 'Documentos de Prueba', vencimiento: '2024-12-31' }
        ],
        fechaLimite: '2024-12-31',
        diasRestantes: 30,
        urgencia: 'baja'
      },
      'resumen-diario': {
        fecha: new Date().toLocaleDateString('es-AR'),
        estadisticas: {
          auditorias: { total: 10, completadas: 8, pendientes: 2 },
          documentos: { subidos: 25, pendientes: 5 },
          notificaciones: { enviadas: 50, leidas: 40 }
        }
      }
    };

    return bulkSampleData[templateName] || {
      titulo: 'Prueba de Envío Masivo',
      mensaje: 'Email de prueba masiva'
    };
  };

  const handleBulkSend = async () => {
    const validEmails = formData.emails.filter(email => 
      email.trim() && email.includes('@')
    );

    if (validEmails.length === 0) {
      onNotification('Por favor ingresa al menos un email válido', 'error');
      return;
    }

    if (!formData.template) {
      onNotification('Por favor selecciona un template', 'error');
      return;
    }

    if (validEmails.length > maxEmails) {
      onNotification(`Máximo ${maxEmails} emails permitidos`, 'error');
      return;
    }

    setSending(true);
    setProgress(0);
    setResults(null);

    try {
      const result = await emailTestService.bulkTest(
        validEmails,
        formData.template,
        formData.data
      );

      setResults(result.data);
      setProgress(100);

      onNotification(
        `Envío masivo completado: ${result.data.successful} exitosos, ${result.data.failed} fallidos`,
        result.data.failed > 0 ? 'warning' : 'success'
      );

      onTestLog({
        template: formData.template,
        email: `${validEmails.length} destinatarios`,
        success: result.data.failed === 0,
        message: `Envío masivo: ${result.data.successful}/${result.data.total} exitosos`,
        data: { recipients: validEmails.length, ...result.data }
      });

    } catch (error) {
      onNotification(error.message, 'error');
      onTestLog({
        template: formData.template,
        email: `${validEmails.length} destinatarios`,
        success: false,
        message: error.message
      });
    } finally {
      setSending(false);
    }
  };

  const validEmails = formData.emails.filter(email => 
    email.trim() && email.includes('@')
  );

  const getResultIcon = (success) => {
    return success ? 
      <CheckCircle sx={{ color: 'success.main' }} /> : 
      <Error sx={{ color: 'error.main' }} />;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        <Group sx={{ mr: 1, verticalAlign: 'middle' }} />
        Prueba de Envío Masivo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Envía el mismo template a múltiples destinatarios para pruebas de carga
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Lista de Destinatarios
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                Máximo {maxEmails} emails permitidos por envío masivo
              </Alert>

              {/* Input masivo de emails */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Pegar emails (separados por comas, espacios o saltos de línea)"
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  placeholder="test1@ejemplo.com, test2@ejemplo.com, test3@ejemplo.com"
                  sx={{ mb: 1 }}
                />
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleEmailsFromText}
                  disabled={!emailText.trim()}
                  startIcon={<Add />}
                >
                  Agregar Emails
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Lista individual de emails */}
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2">
                  Emails individuales ({validEmails.length}/{maxEmails})
                </Typography>
                <Button
                  size="small"
                  onClick={handleAddEmail}
                  disabled={formData.emails.length >= maxEmails}
                  startIcon={<Add />}
                >
                  Agregar
                </Button>
              </Box>

              <List dense>
                {formData.emails.map((email, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      px: 1
                    }}
                  >
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <TextField
                          fullWidth
                          size="small"
                          type="email"
                          value={email}
                          onChange={(e) => handleEmailChange(index, e.target.value)}
                          placeholder={`email${index + 1}@ejemplo.com`}
                          error={email.trim() && !email.includes('@')}
                        />
                      }
                    />
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveEmail(index)}
                        disabled={formData.emails.length <= 1}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuración del Envío
              </Typography>

              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth required>
                  <InputLabel>Template</InputLabel>
                  <Select
                    value={formData.template}
                    label="Template"
                    onChange={(e) => handleTemplateChange(e.target.value)}
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

              {sending && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Enviando emails...
                  </Typography>
                  <LinearProgress 
                    variant="indeterminate" 
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleBulkSend}
                disabled={sending || validEmails.length === 0 || !formData.template}
                startIcon={sending ? null : <Send />}
              >
                {sending 
                  ? `Enviando a ${validEmails.length} destinatarios...`
                  : `Enviar a ${validEmails.length} destinatarios`
                }
              </Button>

              {validEmails.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Nota:</strong> Se enviarán {validEmails.length} emails. 
                    Este proceso puede tardar varios minutos.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Resultados del envío */}
          {results && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resultados del Envío
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {results.total}
                      </Typography>
                      <Typography variant="body2">Total</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {results.successful}
                      </Typography>
                      <Typography variant="body2">Exitosos</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="error.main">
                        {results.failed}
                      </Typography>
                      <Typography variant="body2">Fallidos</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {results.results && results.results.length > 0 && (
                  <List dense>
                    {results.results.map((result, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {getResultIcon(result.success)}
                        </ListItemIcon>
                        <ListItemText
                          primary={result.email}
                          secondary={result.success ? 'Enviado correctamente' : result.error}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default BulkEmailTest;