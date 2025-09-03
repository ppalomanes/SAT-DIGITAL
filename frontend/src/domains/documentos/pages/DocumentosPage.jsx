import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box,
  Alert,
  CircularProgress 
} from '@mui/material';
import CargaDocumental from '../components/CargaDocumental';
import { useAuthStore } from '../../auth/store/authStore';

const DocumentosPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { usuario } = useAuthStore();

  useEffect(() => {
    // Simulamos una carga inicial
    const initializePage = async () => {
      try {
        // Aquí podrías hacer verificaciones adicionales o cargar datos iniciales
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
      } catch (err) {
        setError('Error al inicializar el módulo de documentos');
        setLoading(false);
      }
    };

    initializePage();
  }, []);

  const handleSuccess = (data) => {
    console.log('Documentos cargados exitosamente:', data);
    // Aquí puedes agregar lógica adicional como mostrar notificaciones
  };

  const handleError = (error) => {
    console.error('Error en la carga de documentos:', error);
    setError(error.message || 'Error al cargar documentos');
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 2,
            fontWeight: 700,
            color: 'primary.main'
          }}
        >
          Carga de Documentos
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Sistema de carga documental por secciones técnicas para auditorías
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Información del usuario actual */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Usuario:</strong> {usuario?.nombre} {usuario?.apellido} 
            {' | '}
            <strong>Rol:</strong> {usuario?.rol}
            {usuario?.proveedor_id && (
              <>
                {' | '}
                <strong>Proveedor:</strong> {usuario?.proveedor_nombre}
              </>
            )}
          </Typography>
        </Box>
      </Box>

      {/* Componente principal de carga */}
      <CargaDocumental 
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </Container>
  );
};

export default DocumentosPage;