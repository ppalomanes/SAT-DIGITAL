import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const LoginPage = () => {
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
    <>
      <div 
        style={{ 
          minHeight: '100vh',
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '20px',
          paddingTop: '40px',
          overflow: 'auto',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ 
          maxWidth: '400px', 
          width: '100%',
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          
          {/* Card principal con efecto glassmorphism */}
          <div 
            style={{ 
              padding: '32px 24px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              color: 'white',
              animation: 'cardGlow 3s ease-in-out infinite alternate'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
              
              {/* Avatar usuario */}
              <div
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
                <PersonIcon style={{ 
                  fontSize: 40, 
                  color: 'rgba(255, 255, 255, 0.8)',
                  animation: 'iconPulse 2s ease-in-out infinite'
                }} />
              </div>

              {/* Título del sistema */}
              <div style={{ 
                textAlign: 'center', 
                color: 'white',
                animation: 'titleSlideIn 1s ease-out 0.3s both'
              }}>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold', 
                  margin: '0 0 8px 0',
                  color: 'white',
                  animation: 'textGlow 2s ease-in-out infinite alternate'
                }}>
                  SAT-Digital
                </h1>
                <p style={{ 
                  fontSize: '16px', 
                  margin: '0 0 8px 0',
                  color: 'rgba(255, 255, 255, 0.8)',
                  animation: 'subtitleFade 1.2s ease-out 0.6s both'
                }}>
                  Sistema de Auditorías Técnicas
                </p>
                <p style={{ 
                  fontSize: '14px', 
                  margin: '0',
                  color: 'rgba(255, 255, 255, 0.7)',
                  animation: 'subtitleFade 1.4s ease-out 0.9s both'
                }}>
                  Inicio de Sesión
                </p>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {error && (
                    <div 
                      style={{ 
                        color: '#ff6b6b', 
                        textAlign: 'center',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 107, 107, 0.3)',
                        fontSize: '14px'
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {/* Campo Email */}
                  <div style={{ position: 'relative' }}>
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
                      placeholder="Correo electrónico"
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
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderBottom = '1px solid rgba(255, 255, 255, 0.8)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderBottom = '1px solid rgba(255, 255, 255, 0.3)';
                      }}
                    />
                  </div>

                  {/* Campo Password */}
                  <div style={{ position: 'relative' }}>
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
                      placeholder="Contraseña"
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
                        boxSizing: 'border-box'
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
                        padding: '8px'
                      }}
                    >
                      {showPassword ? 
                        <VisibilityOff style={{ fontSize: 18 }} /> : 
                        <Visibility style={{ fontSize: 18 }} />
                      }
                    </button>
                  </div>

                  {/* Checkbox Remember me y Forgot Password */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="checkbox" 
                        id="remember" 
                        style={{ 
                          accentColor: 'rgba(255, 255, 255, 0.8)',
                          transform: 'scale(0.9)'
                        }} 
                      />
                      <label 
                        htmlFor="remember"
                        style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', cursor: 'pointer' }}
                      >
                        Recordarme
                      </label>
                    </div>
                    <span 
                      style={{ 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      ¿Olvidaste tu contraseña?
                    </span>
                  </div>

                  {/* Botón LOGIN */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      marginTop: '16px',
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
                      transition: 'all 0.3s ease',
                      width: '100%'
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
                    {loading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Panel de usuarios discreto */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              
              <span style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                fontWeight: 500, 
                fontSize: '16px',
                marginBottom: '8px'
              }}>
                Usuarios de prueba
              </span>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '8px', 
                width: '100%',
                maxWidth: '350px'
              }}>
                {USUARIOS_PRUEBA.map((usuario, index) => (
                  <div
                    key={index}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: 0.85
                    }}
                    className="user-glass"
                    onClick={() => handleUsuarioPrueba(usuario)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.85';
                      e.currentTarget.style.transform = 'translateY(0px)';
                    }}
                  >
                    <div style={{ 
                      padding: '12px 16px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      minHeight: '50px'
                    }}>
                      <div 
                        style={{ 
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.25)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}
                      >
                        {usuario.iniciales}
                      </div>
                      <span style={{ 
                        color: 'rgba(255, 255, 255, 0.95)', 
                        fontWeight: 500, 
                        fontSize: '13px',
                        textAlign: 'left'
                      }}>
                        {usuario.nombre}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: '12px', 
                textAlign: 'center',
                margin: '8px 0 0 0',
                maxWidth: '300px',
                lineHeight: '1.4'
              }}>
                Haz clic en cualquier usuario para autocompletar el formulario
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* CSS global para placeholder y animaciones */}
      <style dangerouslySetInnerHTML={{__html: `
        input::placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        
        input:focus {
          border-bottom: 1px solid rgba(255, 255, 255, 0.8) !important;
        }

        /* Animaciones personalizadas */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardGlow {
          from {
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }
          to {
            box-shadow: 0 12px 40px rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.3);
          }
        }

        @keyframes iconPulse {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        @keyframes titleSlideIn {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes textGlow {
          from {
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
          }
          to {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4);
          }
        }

        @keyframes subtitleFade {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Animación suave para los inputs cuando se enfocan */
        input {
          transition: all 0.3s ease !important;
        }

        input:focus {
          transform: translateY(-2px) !important;
        }

        /* Animación para las tarjetas de usuario */
        .user-glass {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .user-glass:hover {
          transform: translateY(-4px) scale(1.02) !important;
          box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2) !important;
        }
      `}} />
    </>
  );
};

export default LoginPage;