import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@mui/material';
import CargaDocumental from '../components/CargaDocumental';
import { useAuthStore } from '../../auth/store/authStore';
import apiClient from '../../../shared/services/apiClient';

const DocumentosPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auditorias, setAuditorias] = useState([]);
  const [auditoriaSeleccionada, setAuditoriaSeleccionada] = useState('');
  const [seccionesTecnicas, setSeccionesTecnicas] = useState([]);
  const { usuario } = useAuthStore();

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Obtener auditorías y secciones técnicas en paralelo
        const [auditoriasResponse, seccionesResponse] = await Promise.all([
          apiClient.get('/auditorias/mis-auditorias?limit=100'),
          apiClient.get('/documentos/secciones-tecnicas')
        ]);

        // Procesar auditorías
        if (auditoriasResponse.data.success && auditoriasResponse.data.data && auditoriasResponse.data.data.auditorias) {
          const auditoriasList = auditoriasResponse.data.data.auditorias.map(auditoria => ({
            id: auditoria.id,
            codigo: `AUD-2025-${String(auditoria.id).padStart(3, '0')}`,
            sitio: `${auditoria.sitio?.nombre || 'Sitio'} - ${auditoria.proveedor?.nombre || 'Proveedor'}`,
            estado: auditoria.estado,
            fecha_limite: auditoria.fecha_limite_carga
          }));
          setAuditorias(auditoriasList);
          setAuditoriaSeleccionada(''); // Reset selection
        } else {
          // Fallback a datos mockeados si no hay respuesta exitosa
          const mockAuditorias = [];
          for (let i = 1; i <= 12; i++) {
            mockAuditorias.push({
              id: i,
              codigo: `AUD-2025-${String(i).padStart(3, '0')}`,
              sitio: `Sitio ${i}`,
              estado: 'en_carga'
            });
          }
          setAuditorias(mockAuditorias);
        }

        // Procesar secciones técnicas
        if (seccionesResponse.data.success && seccionesResponse.data.data) {
          setSeccionesTecnicas(seccionesResponse.data.data);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error inicializando página:', err);
        
        // Fallback a datos mockeados en caso de error
        const mockAuditorias = [];
        for (let i = 1; i <= 12; i++) {
          mockAuditorias.push({
            id: i,
            codigo: `AUD-2025-${String(i).padStart(3, '0')}`,
            sitio: `Sitio ${i}`,
            estado: 'en_carga'
          });
        }
        setAuditorias(mockAuditorias);
        setError('Error al obtener datos - usando datos de ejemplo');
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Carga de Documentos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sistema de carga documental por secciones técnicas para auditorías
          </Typography>
        </div>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Información del Usuario
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Usuario:</strong> {usuario?.nombre} {usuario?.apellido} |
            <strong> Rol:</strong> {usuario?.rol}
            {usuario?.proveedor_id && (
              <>
                {' | '}
                <strong>Proveedor:</strong> {usuario?.proveedor_nombre}
              </>
            )}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Seleccionar Auditoría
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Auditoría</InputLabel>
            <Select
              value={auditoriaSeleccionada}
              label="Auditoría"
              onChange={(e) => setAuditoriaSeleccionada(e.target.value)}
            >
              {auditorias.map((auditoria) => (
                <MenuItem key={auditoria.id} value={auditoria.id}>
                  {auditoria.codigo} - {auditoria.sitio}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {auditoriaSeleccionada && (
        <CargaDocumental
          auditoriaId={auditoriaSeleccionada}
          seccionesDisponibles={seccionesTecnicas}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
    </Box>
  );
};

export default DocumentosPage;