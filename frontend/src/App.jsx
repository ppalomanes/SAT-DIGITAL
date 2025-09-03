import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuthStore } from './domains/auth/store/authStore';

// Layouts
import AdminLayout from './shared/components/Layout/AdminLayout';

// Páginas
import LoginPage from './domains/auth/pages/LoginPage';
import Dashboard from './domains/dashboard/pages/Dashboard';
import UsuariosPage from './domains/usuarios/pages/UsuariosPage';
import ProveedoresPage from './domains/proveedores/pages/ProveedoresPage';
import PeriodosAdmin from './domains/calendario/components/PeriodosAdmin';

// Componentes de protección
import ProtectedRoute from './shared/components/Auth/ProtectedRoute';

// Tema Material-UI personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Indigo moderno
      dark: '#4f46e5',
      light: '#8b5cf6'
    },
    secondary: {
      main: '#ec4899', // Rosa vibrante
      dark: '#db2777',
      light: '#f472b6'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    },
    success: {
      main: '#10b981',
      dark: '#059669',
      light: '#34d399'
    },
    warning: {
      main: '#f59e0b',
      dark: '#d97706',
      light: '#fbbf24'
    },
    error: {
      main: '#ef4444',
      dark: '#dc2626',
      light: '#f87171'
    },
    info: {
      main: '#3b82f6',
      dark: '#2563eb',
      light: '#60a5fa'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem'
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    }
  },
  shape: {
    borderRadius: 12
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 4px 8px rgba(0,0,0,0.1)',
    '0px 8px 16px rgba(0,0,0,0.1)',
    '0px 16px 24px rgba(0,0,0,0.1)',
    '0px 24px 32px rgba(0,0,0,0.1)',
    '0px 2px 8px rgba(0,0,0,0.15)',
    '0px 4px 12px rgba(0,0,0,0.15)',
    '0px 6px 16px rgba(0,0,0,0.15)',
    '0px 8px 20px rgba(0,0,0,0.15)',
    '0px 10px 24px rgba(0,0,0,0.15)',
    '0px 12px 28px rgba(0,0,0,0.15)',
    '0px 14px 32px rgba(0,0,0,0.15)',
    '0px 16px 36px rgba(0,0,0,0.15)',
    '0px 18px 40px rgba(0,0,0,0.15)',
    '0px 20px 44px rgba(0,0,0,0.15)',
    '0px 22px 48px rgba(0,0,0,0.15)',
    '0px 24px 52px rgba(0,0,0,0.15)',
    '0px 26px 56px rgba(0,0,0,0.20)',
    '0px 28px 60px rgba(0,0,0,0.25)'
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderRadius: 12,
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0,0,0,0.1)'
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500
        }
      }
    }
  }
});

function App() {
  const { isAuthenticated, usuario } = useAuthStore();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="app">
          <Routes>
            {/* Ruta de login */}
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? (
                  <LoginPage />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              } 
            />

            {/* Redirección root */}
            <Route 
              path="/" 
              element={
                <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
              } 
            />

            {/* Dashboard principal */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Dashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />

            {/* Rutas adicionales para diferentes roles */}
            <Route 
              path="/auditorias" 
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <div>Módulo de Auditorías - En desarrollo</div>
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/calendario" 
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <PeriodosAdmin />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/proveedores" 
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ProveedoresPage />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/usuarios" 
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <UsuariosPage />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/reportes" 
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <div>Módulo de Reportes - En desarrollo</div>
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <div>Módulo de Analytics - En desarrollo</div>
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/configuracion" 
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <div>Módulo de Configuración - En desarrollo</div>
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />

            {/* Ruta 404 */}
            <Route 
              path="*" 
              element={
                <div className="not-found" style={{ 
                  minHeight: '100vh', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  textAlign: 'center'
                }}>
                  <h2>Página no encontrada</h2>
                  <p>La página que buscas no existe.</p>
                  <button 
                    onClick={() => window.history.back()}
                    style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#6366f1',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Volver atrás
                  </button>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;