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
import CargaDocumental from '../components/CargaDocumental';
import { useAuthStore } from '../../auth/store/authStore';
import apiClient from '../../../shared/services/apiClient';

// Definición de las 20 secciones técnicas
const SECCIONES_TECNICAS = [
  { id: 1, nombre: 'Topología de Red', obligatoria: true, descripcion: 'Documentación de la arquitectura de red' },
  { id: 2, nombre: 'Documentación de Infraestructura y Controles', obligatoria: true, descripcion: 'Controles y documentación técnica' },
  { id: 3, nombre: 'Energía Sala Tecnológica', obligatoria: true, descripcion: 'Sistema eléctrico y UPS' },
  { id: 4, nombre: 'Temperatura CT', obligatoria: true, descripcion: 'Control de temperatura del centro técnico' },
  { id: 5, nombre: 'Servidores', obligatoria: true, descripcion: 'Inventario y configuración de servidores' },
  { id: 6, nombre: 'Internet', obligatoria: true, descripcion: 'Conectividad y enlaces de internet' },
  { id: 7, nombre: 'Personal Capacitado en Sitio', obligatoria: true, descripcion: 'Certificaciones del personal técnico' },
  { id: 8, nombre: 'Escalamiento (Números de Contacto)', obligatoria: true, descripcion: 'Contactos de emergencia y escalamiento' },
  { id: 9, nombre: 'Sala Tecnológica', obligatoria: true, descripcion: 'Especificaciones físicas de la sala' },
  { id: 10, nombre: 'Conectividad (Certificación de Cableado)', obligatoria: true, descripcion: 'Certificaciones de cableado estructurado' },
  { id: 11, nombre: 'Estado Hardware/Software/Auricular e Internet Casa', obligatoria: true, descripcion: 'Inventario de equipos de trabajo remoto' },
  { id: 12, nombre: 'Seguridad de la Información', obligatoria: true, descripcion: 'Políticas y controles de seguridad' },
  { id: 13, nombre: 'Información del Entorno', obligatoria: true, descripcion: 'Documentación del ambiente operativo' },
  { id: 14, nombre: 'Certificaciones de Calidad', obligatoria: true, descripcion: 'ISO y otras certificaciones' },
  { id: 15, nombre: 'Plan de Contingencia', obligatoria: true, descripcion: 'Planes de continuidad del negocio' },
  { id: 16, nombre: 'Monitoreo 24x7', obligatoria: true, descripcion: 'Sistemas de monitoreo continuo' },
  { id: 17, nombre: 'Respaldo de Datos', obligatoria: true, descripcion: 'Estrategias de backup y recuperación' },
  { id: 18, nombre: 'Documentación Adicional', obligatoria: false, descripcion: 'Documentos complementarios' },
  { id: 19, nombre: 'Evidencias Fotográficas', obligatoria: false, descripcion: 'Registro fotográfico de instalaciones' },
  { id: 20, nombre: 'Otros Documentos', obligatoria: false, descripcion: 'Documentación no categorizada' }
];

const DocumentosPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auditorias, setAuditorias] = useState([]);
  const [auditoriaSeleccionada, setAuditoriaSeleccionada] = useState('');
  const { usuario } = useAuthStore();

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Generar auditorías disponibles directamente
        // Basado en las 12 auditorías que sabemos que existen en la base de datos
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
        setLoading(false);
      } catch (err) {
        console.error('Error inicializando página:', err);
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

      {/* Componente principal de carga */}
      {auditoriaSeleccionada && (
        <CargaDocumental 
          auditoriaId={auditoriaSeleccionada}
          seccionesDisponibles={SECCIONES_TECNICAS}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
    </Container>
  );
};

export default DocumentosPage;