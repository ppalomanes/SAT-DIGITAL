import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Skeleton,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Email,
  Visibility,
  Send,
  Refresh,
  Code,
  Info
} from '@mui/icons-material';
import { emailTestService } from '../services/emailTestService';

const TemplatesList = ({ templates, loading, onRefresh, onNotification, onTestLog }) => {
  const [previewDialog, setPreviewDialog] = useState({ open: false, template: null });
  const [testDialog, setTestDialog] = useState({ open: false, template: null });
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);

  const getTemplateTypeColor = (type) => {
    const colors = {
      'notificacion-general': 'primary',
      'cambio-estado-auditoria': 'info',
      'recordatorio-documentos': 'warning',
      'resumen-diario': 'success',
      'default': 'default'
    };
    return colors[type] || colors.default;
  };

  const getTemplateDescription = (name) => {
    const descriptions = {
      'notificacion-general': 'Notificación general del sistema',
      'cambio-estado-auditoria': 'Notificación de cambio de estado en auditorías',
      'recordatorio-documentos': 'Recordatorio de documentos pendientes',
      'resumen-diario': 'Resumen diario de actividades',
      'bienvenida': 'Email de bienvenida para nuevos usuarios',
      'recuperacion-password': 'Recuperación de contraseña',
      'confirmacion-registro': 'Confirmación de registro de usuario',
      'notificacion-sistema': 'Notificación del sistema',
      'reporte-error': 'Reporte de errores del sistema',
      'mantenimiento': 'Notificación de mantenimiento programado',
      'actualizacion-sistema': 'Notificación de actualización del sistema'
    };
    return descriptions[name] || 'Template de email personalizado';
  };

  const handleTestTemplate = async () => {
    if (!testEmail.trim()) {
      onNotification('Por favor ingresa un email válido', 'error');
      return;
    }

    setTesting(true);
    try {
      const result = await emailTestService.testTemplate(
        testDialog.template.name,
        testEmail
      );

      onNotification(`Template enviado exitosamente a ${testEmail}`, 'success');
      onTestLog({
        template: testDialog.template.name,
        email: testEmail,
        success: true,
        message: 'Email enviado correctamente'
      });

      setTestDialog({ open: false, template: null });
      setTestEmail('');
    } catch (error) {
      onNotification(error.message, 'error');
      onTestLog({
        template: testDialog.template.name,
        email: testEmail,
        success: false,
        message: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  const handlePreview = (template) => {
    setPreviewDialog({ open: true, template });
  };

  const handleQuickTest = (template) => {
    setTestDialog({ open: true, template });
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!templates.length) {
    return (
      <Alert 
        severity="info" 
        action={
          <Button color="inherit" size="small" onClick={onRefresh}>
            <Refresh sx={{ mr: 1 }} />
            Actualizar
          </Button>
        }
      >
        No se encontraron templates de email. Verifica la configuración del servidor.
      </Alert>
    );
  }

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2">
          Templates Disponibles ({templates.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={onRefresh}
          size="small"
        >
          Actualizar
        </Button>
      </Box>

      <Grid container spacing={3}>
        {templates.map((template, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Email sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="h3" noWrap>
                    {template.name}
                  </Typography>
                </Box>

                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 2, minHeight: 40 }}
                >
                  {getTemplateDescription(template.name)}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={template.type || 'general'}
                    color={getTemplateTypeColor(template.type)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={template.file.split('.').pop().toUpperCase()}
                    variant="outlined"
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Tooltip title="Vista previa">
                    <IconButton
                      size="small"
                      onClick={() => handlePreview(template)}
                      color="primary"
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Enviar prueba">
                    <IconButton
                      size="small"
                      onClick={() => handleQuickTest(template)}
                      color="success"
                    >
                      <Send />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Ver código">
                    <IconButton
                      size="small"
                      color="info"
                    >
                      <Code />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog de Vista Previa */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, template: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Visibility sx={{ mr: 1 }} />
            Vista Previa: {previewDialog.template?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Esta es una vista previa del template. El contenido real puede variar según los datos enviados.
            </Typography>
          </Alert>
          <Box 
            sx={{ 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 1, 
              p: 2,
              backgroundColor: 'grey.50',
              minHeight: 300
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Vista previa no disponible. Para ver el template renderizado, envía un email de prueba.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false, template: null })}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Prueba Rápida */}
      <Dialog
        open={testDialog.open}
        onClose={() => {
          setTestDialog({ open: false, template: null });
          setTestEmail('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Send sx={{ mr: 1 }} />
            Enviar Prueba: {testDialog.template?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Envía este template a un email de prueba para verificar su funcionamiento.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Email de destino"
            type="email"
            fullWidth
            variant="outlined"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@ejemplo.com"
            helperText="Ingresa el email donde quieres recibir la prueba"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setTestDialog({ open: false, template: null });
              setTestEmail('');
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleTestTemplate}
            variant="contained"
            disabled={testing || !testEmail.trim()}
            startIcon={testing ? null : <Send />}
          >
            {testing ? 'Enviando...' : 'Enviar Prueba'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TemplatesList;