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
  MenuItem 
} from '@mui/material';
import ChatAuditoria from '../components/ChatAuditoria';
import { useAuthStore } from '../../auth/store/authStore';
import apiClient from '../../../shared/services/apiClient';

const ComunicacionPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auditorias, setAuditorias] = useState([]);
  const [auditoriaSeleccionada, setAuditoriaSeleccionada] = useState('');
  const { usuario } = useAuthStore();

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Obtener auditorías reales desde el backend  
        const response = await apiClient.get('/auditorias/mis-auditorias?limit=100');
        
        if (response.data.success && response.data.data && response.data.data.auditorias) {
          const auditoriasList = response.data.data.auditorias.map(auditoria => ({
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
        setLoading(false);
      } catch (err) {
        console.error('Error obteniendo auditorías:', err);
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
        setError('Error al obtener auditorías - usando datos de ejemplo');
        setLoading(false);
      }
    };

    initializePage();
  }, []);

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
          Comunicación
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Sistema de comunicación asíncrona entre auditores y proveedores
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

        {/* Selector de Auditoría */}
        <Box sx={{ mb: 4 }}>
          <FormControl fullWidth>
            <InputLabel id="auditoria-select-label">Seleccionar Auditoría</InputLabel>
            <Select
              labelId="auditoria-select-label"
              id="auditoria-select"
              value={auditoriaSeleccionada}
              label="Seleccionar Auditoría"
              onChange={(e) => setAuditoriaSeleccionada(e.target.value)}
            >
              {auditorias.map((auditoria) => (
                <MenuItem key={auditoria.id} value={auditoria.id}>
                  {auditoria.codigo} - {auditoria.sitio}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Componente principal de chat */}
      {auditoriaSeleccionada && (
        <ChatAuditoria auditoriaId={auditoriaSeleccionada} />
      )}
    </Container>
  );
};

export default ComunicacionPage;