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
import ChatAuditoria from '../components/ChatAuditoria';
import { useAuthStore } from '../../auth/store/authStore';
import apiClient from '../../../shared/services/apiClient';
import { formatDate } from '../../../shared/utils/dateHelpers';

const ROL_LABELS = {
  admin: 'Administrador',
  auditor_general: 'Auditor General',
  auditor_interno: 'Auditor Interno',
  jefe_proveedor: 'Jefe de Proveedor',
  tecnico_proveedor: 'Técnico Proveedor',
  visualizador: 'Visualizador',
};

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
            codigo: auditoria.codigo,
            sitio_nombre: auditoria.sitio?.nombre || 'Sitio',
            localidad: auditoria.sitio?.localidad || auditoria.proveedor?.nombre || '',
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Comunicación
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sistema de comunicación asíncrona entre auditores y proveedores
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
            <strong> Rol:</strong> {ROL_LABELS[usuario?.rol] || usuario?.rol}
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
                  {auditoria.codigo} — {auditoria.sitio_nombre}{auditoria.localidad ? ` - ${auditoria.localidad}` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {auditoriaSeleccionada && (
        <ChatAuditoria auditoriaId={auditoriaSeleccionada} />
      )}
    </Box>
  );
};

export default ComunicacionPage;