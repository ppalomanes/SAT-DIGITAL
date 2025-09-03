import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { CircularProgress, Box } from '@mui/material';

/**
 * Componente para proteger rutas que requieren autenticación
 * Puede validar roles específicos si se especifica
 */
const ProtectedRoute = ({ children, requiredRole, requiredRoles }) => {
  const location = useLocation();
  const { 
    isAuthenticated, 
    loading, 
    hasRole, 
    hasAnyRole 
  } = useAuthStore();

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress size={50} />
      </Box>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Validar rol específico si se requiere
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta sección.</p>
      </Box>
    );
  }

  // Validar múltiples roles si se requiere
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta sección.</p>
      </Box>
    );
  }

  // Si todo está bien, renderizar el componente hijo
  return children;
};

export default ProtectedRoute;
