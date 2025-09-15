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
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        position: 'relative'
      }}
    >
      <Container maxWidth="xl" sx={{ pt: 4, pb: 4 }}>
        {/* Header Simplificado */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: COLORS.dark,
                width: 56,
                height: 56,
                mr: 3
              }}
            >
              <AssessmentIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box sx={{ textAlign: 'left' }}>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 600, 
                  color: COLORS.dark,
                  mb: 1,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}
              >
                Sistema de Auditorías Técnicas
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: '"Inter", sans-serif',
                  color: COLORS.muted,
                  fontWeight: 400,
                  letterSpacing: '0.01em',
                  lineHeight: 1.4
                }}
              >
                Gestión integral con análisis inteligente por lotes
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ width: '100%', mb: 3 }}>
            <LinearProgress />
          </Box>
        )}

        {/* Panel de Selección Minimalista */}
        <Paper 
          elevation={0}
          sx={{ 
            mb: 4,
            background: '#ffffff',
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e9ecef',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 4, borderBottom: '1px solid #e9ecef' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: COLORS.dark, width: 48, height: 48 }}>
                <AssessmentIcon />
              </Avatar>
              <Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 600, 
                    color: COLORS.dark,
                    letterSpacing: '-0.01em'
                  }}
                >
                  Iniciar Nueva Auditoría
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: '"Inter", sans-serif',
                    color: COLORS.muted, 
                    mt: 0.5,
                    fontWeight: 400,
                    letterSpacing: '0.01em',
                    lineHeight: 1.5
                  }}
                >
                  Seleccione el proveedor y sitio para comenzar la auditoría técnica
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ p: 4 }}>
            <Grid container spacing={4} alignItems="center">
              {/* Provider Selection */}
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 1 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontFamily: '"Inter", sans-serif',
                      color: COLORS.dark, 
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase'
                    }}
                  >
                    PROVEEDOR
                  </Typography>
                </Box>
                <FormControl fullWidth>
                  <Select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    displayEmpty
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e9ecef',
                        borderWidth: 1
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.primary
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.primary
                      }
                    }}
                  >
                    <MenuItem value="" disabled>
                      <Typography color="text.secondary">Seleccionar proveedor...</Typography>
                    </MenuItem>
                    {providers.map((provider) => (
                      <MenuItem key={provider.id} value={provider.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: COLORS.dark, width: 32, height: 32 }}>
                            <BusinessIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="600" sx={{ color: COLORS.dark }}>
                              {provider.nombre_comercial}
                            </Typography>
                            <Typography variant="caption" sx={{ color: COLORS.muted }}>
                              {provider.razon_social}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Site Selection */}
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 1 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontFamily: '"Inter", sans-serif',
                      color: COLORS.dark, 
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase'
                    }}
                  >
                    SITIO
                  </Typography>
                </Box>
                <FormControl fullWidth disabled={!selectedProvider}>
                  <Select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    displayEmpty
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e9ecef',
                        borderWidth: 1
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.primary
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.primary
                      }
                    }}
                  >
                    <MenuItem value="" disabled>
                      <Typography color="text.secondary">Seleccionar sitio...</Typography>
                    </MenuItem>
                    {sites.map((site) => (
                      <MenuItem key={site.id} value={site.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: COLORS.dark, width: 32, height: 32 }}>
                            <LocationIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="600" sx={{ color: COLORS.dark }}>
                              {site.nombre}
                            </Typography>
                            <Typography variant="caption" sx={{ color: COLORS.muted }}>
                              {site.localidad} - {site.domicilio}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Start Button */}
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 1 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontFamily: '"Inter", sans-serif',
                      color: COLORS.dark, 
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase'
                    }}
                  >
                    ACCIÓN
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleStartAudit}
                  disabled={!selectedProvider || !selectedSite || loading}
                  fullWidth
                  sx={{
                    height: 56,
                    borderRadius: 2,
                    background: COLORS.dark,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    letterSpacing: '0.01em',
                    '&:hover': {
                      background: COLORS.primary,
                      boxShadow: '0 4px 12px rgba(32, 107, 196, 0.3)',
                      transform: 'translateY(-1px)'
                    },
                    '&:disabled': {
                      background: COLORS.muted,
                      color: 'white'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Iniciar Auditoría Técnica
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Preview Panel Movido Debajo del Header */}
        {selectedProvider && selectedSite && (
          <Paper 
            elevation={0}
            sx={{ 
              mb: 4,
              background: '#ffffff',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e9ecef',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                p: 3,
                textAlign: 'center',
                borderBottom: '1px solid #e9ecef'
              }}
            >
              <CheckCircle sx={{ fontSize: 36, color: COLORS.success, mb: 2 }} />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 600, 
                  color: COLORS.dark, 
                  mb: 1,
                  letterSpacing: '-0.01em'
                }}
              >
                Vista Previa de la Auditoría
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontFamily: '"Inter", sans-serif',
                  color: COLORS.muted,
                  fontWeight: 400,
                  letterSpacing: '0.01em',
                  lineHeight: 1.5
                }}
              >
                Información que se utilizará para la auditoría técnica
              </Typography>
            </Box>
            
            <Box sx={{ p: 4 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      borderRadius: 2,
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: COLORS.dark, mr: 2 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: '"Playfair Display", serif',
                          color: COLORS.dark, 
                          fontWeight: 600,
                          letterSpacing: '-0.01em'
                        }}
                      >
                        Información del Proveedor
                      </Typography>
                    </Box>
                    
                    <Stack spacing={2.5}>
                      <Box>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontFamily: '"Inter", sans-serif',
                            color: COLORS.muted, 
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase'
                          }}
                        >
                          RAZÓN SOCIAL
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontFamily: '"Lato", sans-serif',
                            color: COLORS.dark, 
                            mt: 0.5,
                            fontWeight: 400,
                            letterSpacing: '0.01em',
                            lineHeight: 1.3
                          }}
                        >
                          {getSelectedProvider()?.razon_social}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontFamily: '"Inter", sans-serif',
                            color: COLORS.muted, 
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase'
                          }}
                        >
                          NOMBRE COMERCIAL
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontFamily: '"Lato", sans-serif',
                            color: COLORS.dark, 
                            mt: 0.5,
                            fontWeight: 400,
                            letterSpacing: '0.01em',
                            lineHeight: 1.3
                          }}
                        >
                          {getSelectedProvider()?.nombre_comercial}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      borderRadius: 2,
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: COLORS.dark, mr: 2 }}>
                        <LocationIcon />
                      </Avatar>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: '"Playfair Display", serif',
                          color: COLORS.dark, 
                          fontWeight: 600,
                          letterSpacing: '-0.01em'
                        }}
                      >
                        Información del Sitio
                      </Typography>
                    </Box>
                    
                    <Stack spacing={2.5}>
                      <Box>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontFamily: '"Inter", sans-serif',
                            color: COLORS.muted, 
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase'
                          }}
                        >
                          SITIO
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontFamily: '"Lato", sans-serif',
                            color: COLORS.dark, 
                            mt: 0.5,
                            fontWeight: 400,
                            letterSpacing: '0.01em',
                            lineHeight: 1.3
                          }}
                        >
                          {getSelectedSite()?.nombre}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontFamily: '"Inter", sans-serif',
                            color: COLORS.muted, 
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase'
                          }}
                        >
                          LOCALIDAD
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontFamily: '"Lato", sans-serif',
                            color: COLORS.dark, 
                            mt: 0.5,
                            fontWeight: 400,
                            letterSpacing: '0.01em',
                            lineHeight: 1.3
                          }}
                        >
                          {getSelectedSite()?.localidad}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontFamily: '"Inter", sans-serif',
                            color: COLORS.muted, 
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase'
                          }}
                        >
                          DOMICILIO
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontFamily: '"Lato", sans-serif',
                            color: COLORS.dark, 
                            mt: 0.5,
                            fontWeight: 400,
                            letterSpacing: '0.01em',
                            lineHeight: 1.3
                          }}
                        >
                          {getSelectedSite()?.domicilio}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
              
              {/* Action Summary */}
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Alert
                  severity="info"
                  icon={<Analytics />}
                  sx={{
                    borderRadius: 2,
                    background: 'rgba(23, 162, 184, 0.05)',
                    border: '1px solid rgba(23, 162, 184, 0.2)',
                    '& .MuiAlert-icon': {
                      color: COLORS.info
                    }
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: 500,
                      letterSpacing: '0.01em',
                      lineHeight: 1.6
                    }}
                  >
                    <strong>Modalidad por Lotes:</strong> Se procesarán 13 secciones técnicas con análisis 
                    inteligente posterior. Seguimiento del modelo de auditorías presenciales reales.
                  </Typography>
                </Alert>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Audit Form Container - Inline Below Preview */}
        {showFormulario && currentAudit && (
          <Paper 
            elevation={0}
            sx={{ 
              mb: 4,
              background: '#ffffff',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e9ecef',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                p: 3,
                textAlign: 'center',
                borderBottom: '1px solid #e9ecef',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: COLORS.dark, width: 48, height: 48 }}>
                  <AssessmentIcon />
                </Avatar>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontFamily: '"Playfair Display", serif',
                      fontWeight: 600, 
                      color: COLORS.dark,
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Formulario de Auditoría Técnica
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: '"Inter", sans-serif',
                      color: COLORS.muted,
                      fontWeight: 400,
                      letterSpacing: '0.01em',
                      lineHeight: 1.5
                    }}
                  >
                    Complete las secciones técnicas para procesar por lotes
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                onClick={handleCloseFormulario} 
                sx={{
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ p: 4 }}>
              <AuditoriaFormulario
                auditData={currentAudit}
                onClose={handleCloseFormulario}
                onSave={(data) => {
                  console.log('Auditoría guardada:', data);
                  handleCloseFormulario();
                }}
              />
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default AuditoriasPage;