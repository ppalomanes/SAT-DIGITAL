import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  Settings,
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Email,
  Security,
  Speed,
  Info
} from '@mui/icons-material';
import { emailTestService } from '../services/emailTestService';

const SmtpConfigCheck = ({ onNotification }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const result = await emailTestService.checkSMTPConfig();
      setConfig(result.data);
    } catch (error) {
      onNotification('Error al cargar configuración SMTP: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setChecking(true);
    await loadConfig();
    setChecking(false);
    onNotification('Configuración SMTP actualizada', 'success');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
      case 'active':
      case 'valid':
        return 'success';
      case 'disconnected':
      case 'invalid':
      case 'error':
        return 'error';
      case 'warning':
      case 'partial':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
      case 'active':
      case 'valid':
        return <CheckCircle />;
      case 'disconnected':
      case 'invalid':
      case 'error':
        return <Error />;
      case 'warning':
      case 'partial':
        return <Warning />;
      default:
        return <Info />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Verificando configuración SMTP...
        </Typography>
      </Box>
    );
  }

  if (!config) {
    return (
      <Alert severity="error">
        No se pudo cargar la configuración SMTP
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
          Configuración SMTP
        </Typography>
        <Button
          variant="outlined"
          startIcon={checking ? <CircularProgress size={16} /> : <Refresh />}
          onClick={handleRefresh}
          disabled={checking}
        >
          {checking ? 'Verificando...' : 'Actualizar'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Estado General */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado del Servicio
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Chip
                  icon={getStatusIcon(config.connectionStatus)}
                  label={config.connectionStatus || 'Desconocido'}
                  color={getStatusColor(config.connectionStatus)}
                  sx={{ mb: 1 }}
                />
              </Box>

              {config.connectionStatus === 'connected' && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Conexión SMTP establecida correctamente
                </Alert>
              )}

              {config.connectionStatus === 'disconnected' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  No se pudo establecer conexión con el servidor SMTP
                </Alert>
              )}

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary="Servidor"
                    secondary={config.configuration?.host || 'No configurado'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Security />
                  </ListItemIcon>
                  <ListItemText
                    primary="Puerto"
                    secondary={config.configuration?.port || 'No configurado'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Security />
                  </ListItemIcon>
                  <ListItemText
                    primary="Seguridad"
                    secondary={config.configuration?.secure ? 'SSL/TLS' : 'Sin encriptación'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Información del Sistema */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información del Sistema
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Info />
                  </ListItemIcon>
                  <ListItemText
                    primary="Directorio de Templates"
                    secondary={config.templatesDirectory || 'No configurado'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Settings />
                  </ListItemIcon>
                  <ListItemText
                    primary="Entorno"
                    secondary={config.environment || 'Desconocido'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Speed />
                  </ListItemIcon>
                  <ListItemText
                    primary="Estado del Servicio"
                    secondary={config.serviceStatus || 'Activo'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Configuración Detallada */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuración Detallada
              </Typography>

              {config.configuration && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Host
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {config.configuration.host || 'No configurado'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Puerto
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {config.configuration.port || 'No configurado'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Autenticación
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {config.configuration.auth?.user ? 'Configurada' : 'No configurada'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        TLS/SSL
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {config.configuration.secure ? 'Habilitado' : 'Deshabilitado'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Recomendaciones */}
              <Typography variant="h6" gutterBottom>
                Recomendaciones
              </Typography>

              <List>
                {config.connectionStatus !== 'connected' && (
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Verificar conexión SMTP"
                      secondary="El servidor de email no está respondiendo. Verifica las credenciales y la conectividad."
                    />
                  </ListItem>
                )}

                {!config.configuration?.secure && (
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Habilitar encriptación"
                      secondary="Se recomienda usar SSL/TLS para mayor seguridad en las comunicaciones."
                    />
                  </ListItem>
                )}

                {config.environment === 'development' && (
                  <ListItem>
                    <ListItemIcon>
                      <Info color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Entorno de desarrollo"
                      secondary="Estás en modo desarrollo. Algunos emails podrían no enviarse correctamente."
                    />
                  </ListItem>
                )}

                {config.connectionStatus === 'connected' && config.configuration?.secure && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Configuración óptima"
                      secondary="La configuración SMTP está funcionando correctamente y es segura."
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SmtpConfigCheck;