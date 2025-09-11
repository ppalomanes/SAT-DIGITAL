import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  TextField,
  Button,
  Text,
  Heading,
  Flex,
  Container,
  Avatar
} from '@radix-ui/themes';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';

// Usuarios predefinidos simplificados
const USUARIOS_PRUEBA = [
  { email: 'admin@satdigital.com', password: 'admin123', nombre: 'Admin', iniciales: 'A' },
  { email: 'auditor@satdigital.com', password: 'auditor123', nombre: 'Auditor', iniciales: 'AU' },
  { email: 'proveedor@activo.com', password: 'proveedor123', nombre: 'Proveedor', iniciales: 'P' },
  { email: 'visualizador@satdigital.com', password: 'visual123', nombre: 'Viewer', iniciales: 'V' }
];

const LoginPageRadix = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { loginAsync } = useAuthStore();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleUsuarioPrueba = (usuario) => {
    setFormData({ email: usuario.email, password: usuario.password });
  };

  return (
    <Box 
      style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)'
      }}
    >
      <Container size="1" style={{ maxWidth: '400px' }}>
        
        {/* Card principal con efecto glassmorphism */}
        <Card 
          size="4" 
          style={{ 
            padding: 'var(--space-8)',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Flex direction="column" gap="8" align="center">
            
            {/* Avatar usuario */}
            <Box
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <PersonIcon style={{ fontSize: 40, color: 'rgba(255, 255, 255, 0.8)' }} />
            </Box>

            {/* Formulario con inputs tipo underline */}
            <Box asChild width="100%">
              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="7">
                  
                  {error && (
                    <Text 
                      size="2" 
                      style={{ 
                        color: 'rgba(255, 100, 100, 0.9)', 
                        textAlign: 'center',
                        backgroundColor: 'rgba(255, 100, 100, 0.1)',
                        padding: 'var(--space-3)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 100, 100, 0.3)'
                      }}
                    >
                      {error}
                    </Text>
                  )}

                  {/* Campo Email con línea fina */}
                  <Box style={{ position: 'relative' }}>
                    <PersonIcon 
                      style={{ 
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: 20,
                        zIndex: 1
                      }}
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email ID"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '16px 0 16px 32px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
                        color: 'white',
                        fontSize: '16px',
                        outline: 'none',
                        fontFamily: 'inherit',
                        '::placeholder': {
                          color: 'rgba(255, 255, 255, 0.6)'
                        }
                      }}
                      onFocus={(e) => {
                        e.target.style.borderBottom = '1px solid rgba(255, 255, 255, 0.8)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderBottom = '1px solid rgba(255, 255, 255, 0.3)';
                      }}
                    />
                  </Box>

                  {/* Campo Password con línea fina */}
                  <Box style={{ position: 'relative' }}>
                    <LockIcon 
                      style={{ 
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: 20,
                        zIndex: 1
                      }}
                    />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '16px 40px 16px 32px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
                        color: 'white',
                        fontSize: '16px',
                        outline: 'none',
                        fontFamily: 'inherit',
                        '::placeholder': {
                          color: 'rgba(255, 255, 255, 0.6)'
                        }
                      }}
                      onFocus={(e) => {
                        e.target.style.borderBottom = '1px solid rgba(255, 255, 255, 0.8)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderBottom = '1px solid rgba(255, 255, 255, 0.3)';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ 
                        position: 'absolute',
                        right: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'rgba(255, 255, 255, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 'var(--space-2)'
                      }}
                    >
                      {showPassword ? 
                        <VisibilityOff style={{ fontSize: 18 }} /> : 
                        <Visibility style={{ fontSize: 18 }} />
                      }
                    </button>
                  </Box>

                  {/* Checkbox Remember me y Forgot Password */}
                  <Flex justify="between" align="center" style={{ marginTop: 'var(--space-3)' }}>
                    <Flex align="center" gap="2">
                      <input 
                        type="checkbox" 
                        id="remember" 
                        style={{ 
                          accentColor: 'rgba(255, 255, 255, 0.8)',
                          transform: 'scale(0.9)'
                        }} 
                      />
                      <Text 
                        size="2" 
                        style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}
                      >
                        Remember me
                      </Text>
                    </Flex>
                    <Text 
                      size="2" 
                      style={{ 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Forgot Password?
                    </Text>
                  </Flex>

                  {/* Botón LOGIN con gradiente */}
                  <Button
                    type="submit"
                    size="3"
                    disabled={loading}
                    style={{
                      marginTop: 'var(--space-4)',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50px',
                      padding: '16px',
                      fontWeight: 600,
                      fontSize: '16px',
                      letterSpacing: '1px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0px)';
                      e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                    }}
                  >
                    {loading ? 'SIGNING IN...' : 'LOGIN'}
                  </Button>
                </Flex>
              </form>
            </Box>
          </Flex>
        </Card>

        {/* Panel de usuarios discreto */}
        <Box style={{ marginTop: 'var(--space-6)' }}>
          <Flex direction="column" gap="3" align="center">
            
            <Text size="1" style={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 400 }}>
              Usuarios de prueba
            </Text>

            <Flex wrap="wrap" gap="2" justify="center">
              {USUARIOS_PRUEBA.map((usuario, index) => (
                <Box
                  key={index}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: 0.8
                  }}
                  className="user-glass"
                  onClick={() => handleUsuarioPrueba(usuario)}
                >
                  <Flex align="center" gap="2" style={{ 
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Avatar 
                      size="1" 
                      fallback={usuario.iniciales}
                      style={{ 
                        fontSize: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white'
                      }}
                    />
                    <Text size="1" style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 400 }}>
                      {usuario.nombre}
                    </Text>
                  </Flex>
                </Box>
              ))}
            </Flex>
          </Flex>
        </Box>

      </Container>

      {/* CSS para efectos glassmorphism */}
      <style jsx>{`
        .user-glass:hover {
          opacity: 1 !important;
          transform: translateY(-2px);
        }
        
        input::placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        
        input:focus {
          border-bottom: 1px solid rgba(255, 255, 255, 0.8) !important;
        }
      `}</style>
    </Box>
  );
};

export default LoginPageRadix;