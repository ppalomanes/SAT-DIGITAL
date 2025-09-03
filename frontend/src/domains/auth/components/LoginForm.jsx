import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Shield,
} from '@mui/icons-material';

const LoginForm = () => {
  const [email, setEmail] = useState('admin@satdigital.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error en login:', error);
    }
  };

  const handleTestLogin = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
    clearError();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Shield sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a202c', mb: 1 }}>
              SAT-Digital
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Sistema de Auditorías Técnicas
            </Typography>
          </Box>

          <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', color: '#374151' }}>
            Iniciar Sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
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
                ),
              }}
              sx={{ mb: 3 }}
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                py: 1.5,
                borderRadius: 2,
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                },
              }}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#64748b' }}>
              Usuarios de prueba:
            </Typography>
            <List dense>
              <ListItem 
                button 
                onClick={() => handleTestLogin('admin@satdigital.com', 'admin123')}
                sx={{ borderRadius: 1, mb: 1 }}
              >
                <ListItemText 
                  primary="admin@satdigital.com / admin123 (Admin)"
                  primaryTypographyProps={{ fontSize: '14px' }}
                />
              </ListItem>
              <ListItem 
                button 
                onClick={() => handleTestLogin('auditor@satdigital.com', 'auditor123')}
                sx={{ borderRadius: 1, mb: 1 }}
              >
                <ListItemText 
                  primary="auditor@satdigital.com / auditor123 (Auditor)"
                  primaryTypographyProps={{ fontSize: '14px' }}
                />
              </ListItem>
              <ListItem 
                button 
                onClick={() => handleTestLogin('proveedor@activo.com', 'proveedor123')}
                sx={{ borderRadius: 1 }}
              >
                <ListItemText 
                  primary="proveedor@activo.com / proveedor123 (Proveedor)"
                  primaryTypographyProps={{ fontSize: '14px' }}
                />
              </ListItem>
            </List>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginForm;