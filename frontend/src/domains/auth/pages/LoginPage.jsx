import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  IconButton,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Shield as ShieldIcon,
  Person as PersonIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';

// Usuarios predefinidos para pruebas (coinciden con la base de datos)
const USUARIOS_PRUEBA = [
  {
    email: 'admin@satdigital.com',
    password: 'admin123',
    rol: 'admin',
    nombre: 'Administrador Sistema',
    descripcion: 'Acceso completo al sistema'
  },
  {
    email: 'auditor@satdigital.com',
    password: 'auditor123',
    rol: 'auditor_general',
    nombre: 'Juan Carlos - Auditor General',
    descripcion: 'Gestión completa de auditorías'
  },
  {
    email: 'auditoria@satdigital.com',
    password: 'auditor123',
    rol: 'auditor_interno',
    nombre: 'Ana María - Auditora Interna',
    descripcion: 'Evaluación técnica de auditorías'
  },
  {
    email: 'proveedor@activo.com',
    password: 'proveedor123',
    rol: 'jefe_proveedor',
    nombre: 'Jefe Grupo Activo SRL',
    descripcion: 'Gestión sitios del proveedor'
  },
  {
    email: 'tecnico@activo.com',
    password: 'tecnico123',
    rol: 'tecnico_proveedor',
    nombre: 'Luis - Técnico Activo',
    descripcion: 'Soporte técnico del proveedor'
  },
  {
    email: 'visualizador@satdigital.com',
    password: 'visual123',
    rol: 'visualizador',
    nombre: 'Carlos - Gerente Ejecutivo',
    descripcion: 'Dashboards ejecutivos'
  }
];

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const { loginAsync } = useAuthStore();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await loginAsync(formData.email, formData.password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Error de autenticación');
      }

    } catch (err) {
      console.error('Error en login:', err);
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleUsuarioPrueba = (usuario) => {
    setFormData({
      email: usuario.email,
      password: usuario.password
    });
  };

  const getRolIcon = (rol) => {
    switch (rol) {
      case 'admin': return <ShieldIcon />;
      case 'auditor_general': return <PersonIcon />;
      case 'auditor_interno': return <PersonIcon />;
      case 'jefe_proveedor': return <BusinessIcon />;
      case 'tecnico_proveedor': return <BusinessIcon />;
      case 'visualizador': return <PersonIcon />;
      default: return <PersonIcon />;
    }
  };

  const getRolColor = (rol) => {
    switch (rol) {
      case 'admin': return theme.palette.error.main;
      case 'auditor_general': return theme.palette.primary.main;
      case 'auditor_interno': return theme.palette.info.main;
      case 'jefe_proveedor': return theme.palette.success.main;
      case 'tecnico_proveedor': return theme.palette.success.dark;
      case 'visualizador': return theme.palette.warning.main;
      default: return theme.palette.text.secondary;
    }
  };

  return (
    <Box className="login-page">
      <Box
        className="login-page__background"
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2
        }}
      >
        <Box className="login-page__container" sx={{ maxWidth: 1200, width: '100%' }}>
          <Box display="flex" gap={4} alignItems="flex-start">
            
            <Card 
              className="login-card"
              sx={{ 
                flex: 1,
                maxWidth: 450,
                boxShadow: theme.shadows[24],
                borderRadius: 3
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box className="login-card__header" textAlign="center" mb={3}>
                  <Box
                    className="login-card__logo"
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                      boxShadow: theme.shadows[8]
                    }}
                  >
                    <ShieldIcon sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  
                  <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
                    SAT-Digital
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" mb={2}>
                    Sistema de Auditorías Técnicas
                  </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit} className="login-form">
                  <Typography variant="h5" component="h2" mb={3} textAlign="center">
                    Iniciar Sesión
                  </Typography>

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    name="email"
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      )
                    }}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    name="password"
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{ mb: 3 }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      mb: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem'
                    }}
                  >
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Paper 
              className="usuarios-prueba"
              sx={{ 
                flex: 1,
                maxWidth: 400,
                p: 3,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(10px)'
              }}
            >
              <Typography variant="h6" component="h3" mb={2} color="primary" fontWeight="bold">
                Usuarios de prueba:
              </Typography>

              <List className="usuarios-prueba__list" sx={{ p: 0 }}>
                {USUARIOS_PRUEBA.map((usuario, index) => (
                  <ListItem
                    key={index}
                    className="usuarios-prueba__item"
                    sx={{
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      p: 2,
                      mb: 1,
                      borderRadius: 2,
                      border: `1px solid ${alpha(getRolColor(usuario.rol), 0.2)}`,
                      backgroundColor: alpha(getRolColor(usuario.rol), 0.05),
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha(getRolColor(usuario.rol), 0.1),
                        transform: 'translateY(-1px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                    onClick={() => handleUsuarioPrueba(usuario)}
                  >
                    <Box display="flex" alignItems="center" mb={1}>
                      <Box 
                        sx={{ 
                          color: getRolColor(usuario.rol),
                          mr: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {getRolIcon(usuario.rol)}
                      </Box>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight="bold"
                        sx={{ color: getRolColor(usuario.rol) }}
                      >
                        {usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}
                      </Typography>
                    </Box>
                    
                    <ListItemText
                      primary={
                        <Typography variant="body2" color="text.primary" fontWeight="500">
                          {usuario.email} / {usuario.password.split('123')[0]}123
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {usuario.descripcion}
                        </Typography>
                      }
                      sx={{ m: 0 }}
                    />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                Haz clic en cualquier usuario para autocompletar el formulario
              </Typography>
            </Paper>

          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;