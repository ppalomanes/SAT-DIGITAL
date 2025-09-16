import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  IconButton,
  Avatar,
  Divider,
  Paper,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Assessment as AssessmentIcon,
  PlayArrow as PlayArrowIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Analytics,
  TrendingUp,
  Assignment,
  Schedule,
  People,
  CheckCircle,
  FileDownload,
  Speed,
  Timeline,
  BarChart,
  ShowChart,
  Group,
  Description
} from '@mui/icons-material';
import { useAuthStore } from '../../auth/store/authStore';
import AuditoriaFormulario from '../components/AuditoriaFormulario';

// Paleta de colores moderna Tabler (copiada del Dashboard Ejecutivo)
const COLORS = {
  primary: '#206bc4',
  secondary: '#6c757d',
  success: '#2fb344',
  danger: '#d63384',
  warning: '#fd7e14',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#1e293b',
  muted: '#868e96',
  gradient: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #6be6d0 0%, #48bb78 100%)',
    warning: 'linear-gradient(135deg, #ffeaa0 0%, #ff9800 100%)',
    info: 'linear-gradient(135deg, #89ddff 0%, #21CBF3 100%)'
  },
  chart: ['#206bc4', '#2fb344', '#fd7e14', '#d63384', '#17a2b8', '#6c757d']
};

const AuditoriasPage = () => {
  const { usuario } = useAuthStore();
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [providers, setProviders] = useState([]);
  const [sites, setSites] = useState([]);
  const [currentAudit, setCurrentAudit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFormulario, setShowFormulario] = useState(false);

  // Mock data - reemplazar con llamadas a API reales
  const mockProviders = [
    { id: 1, razon_social: 'CITYTECH SOCIEDAD ANONIMA', nombre_comercial: 'TELEPERFORMANCE' },
    { id: 2, razon_social: 'GRUPO ACTIVO SRL', nombre_comercial: 'ACTIVO' },
    { id: 3, razon_social: 'CENTRO DE INTERACCIÓN MULTIMEDIA S.A.', nombre_comercial: 'APEX' },
  ];

  const mockSites = [
    { id: 1, nombre: 'TELEPERFORMANCE CHACO', localidad: 'CHACO', proveedor_id: 1, domicilio: 'Av. 9 de Julio 4175, Barranqueras' },
    { id: 2, nombre: 'ACTIVO CABA', localidad: 'CABA', proveedor_id: 2, domicilio: 'Florida 141, CABA' },
    { id: 3, nombre: 'APEX MENDOZA', localidad: 'MENDOZA', proveedor_id: 3, domicilio: 'San Martín 1234, Mendoza' },
  ];

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      loadSites(selectedProvider);
    } else {
      setSites([]);
      setSelectedSite('');
    }
  }, [selectedProvider]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      // TODO: Reemplazar con llamada real a la API
      setTimeout(() => {
        setProviders(mockProviders);
        setLoading(false);
      }, 500);
    } catch (error) {
      setError('Error cargando proveedores');
      setLoading(false);
    }
  };

  const loadSites = async (providerId) => {
    try {
      setLoading(true);
      // TODO: Reemplazar con llamada real a la API
      setTimeout(() => {
        const filteredSites = mockSites.filter(site => site.proveedor_id === parseInt(providerId));
        setSites(filteredSites);
        setLoading(false);
      }, 300);
    } catch (error) {
      setError('Error cargando sitios');
      setLoading(false);
    }
  };

  const handleStartAudit = async () => {
    if (!selectedProvider || !selectedSite) {
      setError('Debe seleccionar un proveedor y un sitio');
      return;
    }

    try {
      setLoading(true);
      
      // Buscar información del proveedor y sitio seleccionados
      const provider = providers.find(p => p.id === parseInt(selectedProvider));
      const site = sites.find(s => s.id === parseInt(selectedSite));

      if (!provider || !site) {
        setError('Error obteniendo información del proveedor o sitio');
        return;
      }

      // Crear objeto de auditoría actual
      const auditData = {
        proveedor: provider,
        sitio: site,
        auditores: usuario?.nombre || 'Usuario Actual',
        fecha_limite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días desde hoy
        fecha_visita: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 días desde hoy
        estado: 'Activo'
      };

      setCurrentAudit(auditData);
      setShowFormulario(true);
      setLoading(false);
      
    } catch (error) {
      setError('Error iniciando auditoría');
      setLoading(false);
    }
  };

  const handleCloseFormulario = () => {
    setShowFormulario(false);
    setCurrentAudit(null);
  };

  const getSelectedProvider = () => {
    return providers.find(p => p.id === parseInt(selectedProvider));
  };

  const getSelectedSite = () => {
    return sites.find(s => s.id === parseInt(selectedSite));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Sistema de Auditorías
          </Typography>
          <Chip
            icon={<AssessmentIcon />}
            label="Gestión de Auditorías Técnicas"
            color="primary"
            size="small"
          />
        </div>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress />
        </Box>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Iniciar Nueva Auditoría
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Seleccione el proveedor y sitio para comenzar la auditoría técnica
          </Typography>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Proveedor</InputLabel>
                <Select
                  value={selectedProvider}
                  label="Proveedor"
                  onChange={(e) => setSelectedProvider(e.target.value)}
                >
                  {providers.map((provider) => (
                    <MenuItem key={provider.id} value={provider.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon fontSize="small" />
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {provider.nombre_comercial}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {provider.razon_social}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth disabled={!selectedProvider}>
                <InputLabel>Sitio</InputLabel>
                <Select
                  value={selectedSite}
                  label="Sitio"
                  onChange={(e) => setSelectedSite(e.target.value)}
                >
                  {sites.map((site) => (
                    <MenuItem key={site.id} value={site.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="small" />
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {site.nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {site.localidad}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                onClick={handleStartAudit}
                disabled={!selectedProvider || !selectedSite || loading}
                fullWidth
              >
                Iniciar Auditoría
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {selectedProvider && selectedSite && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Vista Previa de la Auditoría
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Información del Proveedor
                </Typography>
                <Typography variant="body2">
                  <strong>Razón Social:</strong> {getSelectedProvider()?.razon_social}
                </Typography>
                <Typography variant="body2">
                  <strong>Nombre Comercial:</strong> {getSelectedProvider()?.nombre_comercial}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Información del Sitio
                </Typography>
                <Typography variant="body2">
                  <strong>Sitio:</strong> {getSelectedSite()?.nombre}
                </Typography>
                <Typography variant="body2">
                  <strong>Localidad:</strong> {getSelectedSite()?.localidad}
                </Typography>
                <Typography variant="body2">
                  <strong>Domicilio:</strong> {getSelectedSite()?.domicilio}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {showFormulario && currentAudit && (
        <Card>
          <CardHeader
            title="Formulario de Auditoría Técnica"
            subheader="Complete las secciones técnicas para procesar por lotes"
            action={
              <IconButton onClick={handleCloseFormulario}>
                <CloseIcon />
              </IconButton>
            }
          />
          <CardContent>
            <AuditoriaFormulario
              auditData={currentAudit}
              onClose={handleCloseFormulario}
              onSave={(data) => {
                console.log('Auditoría guardada:', data);
                handleCloseFormulario();
              }}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AuditoriasPage;