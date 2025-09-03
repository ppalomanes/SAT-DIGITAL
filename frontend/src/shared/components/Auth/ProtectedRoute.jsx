// Componente para proteger rutas por autenticación y rol
// src/shared/components/Auth/ProtectedRoute.jsx

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../domains/auth/store/authStore';
import { CircularProgress, Box } from '@mui/material';

function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, usuario, loading } = useAuthStore();
  const location = useLocation();

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar rol específico si es requerido
  if (requiredRole && usuario?.rol !== requiredRole) {
    // Redirigir según el rol del usuario
    switch (usuario?.rol) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'auditor':
        return <Navigate to="/auditor" replace />;
      case 'proveedor':
        return <Navigate to="/proveedor" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;