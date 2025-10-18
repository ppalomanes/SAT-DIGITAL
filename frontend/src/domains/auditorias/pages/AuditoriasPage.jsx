import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  IconButton,
  Avatar,
  Divider,
  Paper,
  Stack,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Assessment as AssessmentIcon,
  PlayArrow as PlayArrowIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Analytics,
  TrendingUp,
  Assignment,
  Schedule,
  People,
  CheckCircle,
  FileDownload,
  Speed,
  Timeline,
  BarChart,
  ShowChart,
  Group,
  Description,
  Work as WorkIcon,
  DateRange as DateRangeIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { useAuthStore } from '../../auth/store/authStore';
import AuditoriaFormulario from '../components/AuditoriaFormulario';
import proveedoresService from '../../proveedores/services/proveedoresService';
import { THEME_COLORS, CHART_COLORS } from '../../../shared/constants/theme';
import { formatDate } from '../../../shared/utils/dateHelpers';
import { getEstadoStyle } from '../../../shared/utils/statusHelpers';

// Usar constantes centralizadas de tema (reemplaza COLORS hardcodeado)
const COLORS = {
  primary: THEME_COLORS.primary.main,
  secondary: THEME_COLORS.secondary.main,
  success: THEME_COLORS.success.main,
  danger: THEME_COLORS.error.main,
  warning: THEME_COLORS.warning.main,
  info: THEME_COLORS.info.main,
  light: THEME_COLORS.grey[50],
  dark: THEME_COLORS.grey[900],
  muted: THEME_COLORS.grey[600],
  gradient: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #6be6d0 0%, #48bb78 100%)',
    warning: 'linear-gradient(135deg, #ffeaa0 0%, #ff9800 100%)',
    info: 'linear-gradient(135deg, #89ddff 0%, #21CBF3 100%)'
  },
  chart: CHART_COLORS
};

const AuditoriasPage = () => {
  const { usuario } = useAuthStore();
  const [auditorias, setAuditorias] = useState([]);
  const [periodoActivo, setPeriodoActivo] = useState(null);
  const [misSitios, setMisSitios] = useState([]);
  const [currentAudit, setCurrentAudit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFormulario, setShowFormulario] = useState(false);

  const isProviderUser = usuario?.rol === 'jefe_proveedor' || usuario?.rol === 'tecnico_proveedor';

  useEffect(() => {
    if (isProviderUser) {
      loadMisAuditorias();
    } else {
      setError('Esta página está disponible solo para usuarios de proveedores');
    }
  }, [isProviderUser]);

  const loadMisAuditorias = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await proveedoresService.getMisAuditoriasPeriodoActivo();

      setAuditorias(data.auditorias || []);
      setPeriodoActivo(data.periodo_activo);

      setLoading(false);
    } catch (error) {
      console.error('Error cargando auditorías:', error);
      setError('Error cargando auditorías del período activo');
      setLoading(false);
    }
  };

  const loadMisSitios = async () => {
    try {
      const data = await proveedoresService.getMisSitios();
      setMisSitios(data.sitios || []);
    } catch (error) {
      console.error('Error cargando sitios:', error);
    }
  };

  const handleStartAuditoria = (auditoria) => {
    setCurrentAudit(auditoria);
    setShowFormulario(true);
  };

  const handleCloseFormulario = () => {
    setShowFormulario(false);
    setCurrentAudit(null);
  };

  // Funciones helper ya importadas desde utilidades centralizadas
  // getEstadoStyle() - para colores de estados
  // formatDate() - para formateo de fechas

  const getEstadoColorMUI = (estado) => {
    // Mapear a colores de MUI Chip
    switch (estado?.toLowerCase()) {
      case 'iniciada':
      case 'en_proceso':
        return 'info';
      case 'carga_documental':
        return 'warning';
      case 'revision':
        return 'secondary';
      case 'completada':
      case 'finalizada':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Mis Auditorías
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              icon={<WorkIcon />}
              label={`${usuario?.proveedor_nombre || 'Mi Proveedor'}`}
              color="primary"
              size="small"
            />
            {periodoActivo && (
              <Chip
                icon={<DateRangeIcon />}
                label={`Período: ${periodoActivo.nombre}`}
                color="success"
                size="small"
              />
            )}
          </Stack>
        </div>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadMisAuditorias}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress />
        </Box>
      )}

      {!periodoActivo && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No hay período de auditoría activo definido. Contacte al administrador.
        </Alert>
      )}

      {periodoActivo && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información del Período Activo
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">Período</Typography>
                <Typography variant="h6">{periodoActivo.nombre}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">Fecha Inicio</Typography>
                <Typography variant="body1">{formatDate(periodoActivo.fecha_inicio)}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">Fecha Fin</Typography>
                <Typography variant="body1">{formatDate(periodoActivo.fecha_fin)}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {auditorias.length > 0 ? (
        <Card>
          <CardHeader
            title="Auditorías Asignadas"
            subheader={`${auditorias.length} auditorías del período activo`}
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Sitio</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Progreso</TableCell>
                    <TableCell>Fecha Límite</TableCell>
                    <TableCell>Documentos</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditorias.map((auditoria) => (
                    <TableRow key={auditoria.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600">
                          {auditoria.codigo_auditoria}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {auditoria.sitio_nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {auditoria.sitio_localidad}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={auditoria.estado}
                          color={getEstadoColorMUI(auditoria.estado)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={auditoria.progreso_porcentaje || 0}
                            sx={{ height: 8, borderRadius: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {auditoria.progreso_porcentaje || 0}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(auditoria.fecha_limite_carga)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Description />}
                          label={`${auditoria.documentos_cargados || 0}`}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<UploadIcon />}
                          onClick={() => handleStartAuditoria(auditoria)}
                        >
                          Trabajar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : (
        !loading && periodoActivo && (
          <Alert severity="info">
            No tienes auditorías asignadas para el período activo.
          </Alert>
        )
      )}

      {showFormulario && currentAudit && (
        <Card sx={{ mt: 3 }}>
          <CardHeader
            title={`Auditoría: ${currentAudit.codigo_auditoria}`}
            subheader={`${currentAudit.sitio_nombre} - ${currentAudit.sitio_localidad}`}
            action={
              <IconButton onClick={handleCloseFormulario}>
                <CloseIcon />
              </IconButton>
            }
          />
          <CardContent>
            <AuditoriaFormulario
              auditData={currentAudit}
              onClose={handleCloseFormulario}
              onSave={(data) => {
                console.log('Auditoría guardada:', data);
                handleCloseFormulario();
                loadMisAuditorias(); // Reload to update progress
              }}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AuditoriasPage;