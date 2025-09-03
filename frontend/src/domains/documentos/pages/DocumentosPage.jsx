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
  { id: 1, orden_presentacion: 1, nombre: 'Topología de Red', obligatoria: true, descripcion: 'Documentación de la arquitectura de red', formatos_permitidos: ['PDF', 'PNG', 'XLSX'], tamaño_maximo_mb: 50 },
  { id: 2, orden_presentacion: 2, nombre: 'Documentación de Infraestructura y Controles', obligatoria: true, descripcion: 'Controles y documentación técnica', formatos_permitidos: ['PDF', 'XLSX'], tamaño_maximo_mb: 50 },
  { id: 3, orden_presentacion: 3, nombre: 'Energía Sala Tecnológica', obligatoria: true, descripcion: 'Sistema eléctrico y UPS', formatos_permitidos: ['PDF', 'PNG', 'XLSX'], tamaño_maximo_mb: 50 },
  { id: 4, orden_presentacion: 4, nombre: 'Temperatura CT', obligatoria: true, descripcion: 'Control de temperatura del centro técnico', formatos_permitidos: ['PDF', 'PNG', 'XLSX'], tamaño_maximo_mb: 50 },
  { id: 5, orden_presentacion: 5, nombre: 'Servidores', obligatoria: true, descripcion: 'Inventario y configuración de servidores', formatos_permitidos: ['PDF', 'XLSX'], tamaño_maximo_mb: 50 },
  { id: 6, orden_presentacion: 6, nombre: 'Internet', obligatoria: true, descripcion: 'Conectividad y enlaces de internet', formatos_permitidos: ['PDF', 'PNG', 'XLSX'], tamaño_maximo_mb: 50 },
  { id: 7, orden_presentacion: 7, nombre: 'Personal Capacitado en Sitio', obligatoria: true, descripcion: 'Certificaciones del personal técnico', formatos_permitidos: ['PDF'], tamaño_maximo_mb: 20 },
  { id: 8, orden_presentacion: 8, nombre: 'Escalamiento (Números de Contacto)', obligatoria: true, descripcion: 'Contactos de emergencia y escalamiento', formatos_permitidos: ['PDF', 'XLSX'], tamaño_maximo_mb: 20 },
  { id: 9, orden_presentacion: 9, nombre: 'Sala Tecnológica', obligatoria: true, descripcion: 'Especificaciones físicas de la sala', formatos_permitidos: ['PDF', 'PNG', 'JPG'], tamaño_maximo_mb: 100 },
  { id: 10, orden_presentacion: 10, nombre: 'Conectividad (Certificación de Cableado)', obligatoria: true, descripcion: 'Certificaciones de cableado estructurado', formatos_permitidos: ['PDF'], tamaño_maximo_mb: 50 },
  { id: 11, orden_presentacion: 11, nombre: 'Estado Hardware/Software/Auricular e Internet Casa', obligatoria: true, descripcion: 'Inventario de equipos de trabajo remoto', formatos_permitidos: ['PDF', 'XLSX'], tamaño_maximo_mb: 50 },
  { id: 12, orden_presentacion: 12, nombre: 'Seguridad de la Información', obligatoria: true, descripcion: 'Políticas y controles de seguridad', formatos_permitidos: ['PDF'], tamaño_maximo_mb: 50 },
  { id: 13, orden_presentacion: 13, nombre: 'Información del Entorno', obligatoria: true, descripcion: 'Documentación del ambiente operativo', formatos_permitidos: ['PDF', 'PNG', 'XLSX'], tamaño_maximo_mb: 50 },
  { id: 14, orden_presentacion: 14, nombre: 'Certificaciones de Calidad', obligatoria: true, descripcion: 'ISO y otras certificaciones', formatos_permitidos: ['PDF'], tamaño_maximo_mb: 20 },
  { id: 15, orden_presentacion: 15, nombre: 'Plan de Contingencia', obligatoria: true, descripcion: 'Planes de continuidad del negocio', formatos_permitidos: ['PDF'], tamaño_maximo_mb: 50 },
  { id: 16, orden_presentacion: 16, nombre: 'Monitoreo 24x7', obligatoria: true, descripcion: 'Sistemas de monitoreo continuo', formatos_permitidos: ['PDF', 'PNG', 'XLSX'], tamaño_maximo_mb: 50 },
  { id: 17, orden_presentacion: 17, nombre: 'Respaldo de Datos', obligatoria: true, descripcion: 'Estrategias de backup y recuperación', formatos_permitidos: ['PDF'], tamaño_maximo_mb: 50 },
  { id: 18, orden_presentacion: 18, nombre: 'Documentación Adicional', obligatoria: false, descripcion: 'Documentos complementarios', formatos_permitidos: ['PDF', 'PNG', 'XLSX'], tamaño_maximo_mb: 100 },
  { id: 19, orden_presentacion: 19, nombre: 'Evidencias Fotográficas', obligatoria: false, descripcion: 'Registro fotográfico de instalaciones', formatos_permitidos: ['PNG', 'JPG', 'JPEG'], tamaño_maximo_mb: 200 },
  { id: 20, orden_presentacion: 20, nombre: 'Otros Documentos', obligatoria: false, descripcion: 'Documentación no categorizada', formatos_permitidos: ['PDF', 'PNG', 'XLSX', 'DOCX'], tamaño_maximo_mb: 100 }
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