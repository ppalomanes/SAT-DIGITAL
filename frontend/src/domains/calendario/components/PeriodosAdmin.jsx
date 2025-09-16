/**
 * Componente de administración de períodos de auditoría
 * Permite visualizar, crear y gestionar períodos semestrales
 * 
 * @author SAT-Digital Team
 * @version 1.0.0
 * @since Checkpoint 2.5
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as ActivateIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import { periodoService } from '../services/periodoService';

// Paleta de colores moderna (consistente con otras páginas)
const COLORS = {
  primary: '#206bc4',
  secondary: '#6c757d',
  success: '#2fb344',
  danger: '#d63384',
  warning: '#fd7e14',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#1e293b',
  muted: '#868e96'
};

const PeriodosAdmin = () => {
  const [periodos, setPeriodos] = useState([]);
  const [periodoActivo, setPeriodoActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    fecha_inicio: '',
    fecha_limite_carga: '',
    fecha_inicio_visitas: '',
    fecha_fin_visitas: '',
    estado: 'planificacion'
  });

  const theme = useTheme();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [periodosData, periodoActivoData] = await Promise.allSettled([
        periodoService.listarPeriodos(),
        periodoService.obtenerPeriodoActivo()
      ]);

      if (periodosData.status === 'fulfilled') {
        setPeriodos(periodosData.value.data || []);
      }

      if (periodoActivoData.status === 'fulfilled') {
        setPeriodoActivo(periodoActivoData.value.data);
      }

      setError(null);
    } catch (err) {
      console.error('Error cargando períodos:', err);
      setError('Error al cargar los períodos');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo':
        return { 
          color: theme.palette.success.main, 
          bg: alpha(theme.palette.success.main, 0.1),
          text: 'Activo'
        };
      case 'planificacion':
        return { 
          color: theme.palette.info.main, 
          bg: alpha(theme.palette.info.main, 0.1),
          text: 'Planificación'
        };
      case 'carga':
        return { 
          color: theme.palette.warning.main, 
          bg: alpha(theme.palette.warning.main, 0.1),
          text: 'Carga'
        };
      case 'visitas':
        return { 
          color: theme.palette.primary.main, 
          bg: alpha(theme.palette.primary.main, 0.1),
          text: 'Visitas'
        };
      case 'cerrado':
        return { 
          color: theme.palette.text.disabled, 
          bg: alpha(theme.palette.text.disabled, 0.1),
          text: 'Cerrado'
        };
      default:
        return { 
          color: theme.palette.text.secondary, 
          bg: alpha(theme.palette.text.secondary, 0.1),
          text: estado
        };
    }
  };

  const handleActivarPeriodo = async (id) => {
    try {
      await periodoService.activarPeriodo(id);
      await cargarDatos();
    } catch (err) {
      console.error('Error activando período:', err);
      setError('Error al activar período');
    }
  };

  const handleSubmit = async () => {
    try {
      await periodoService.crearPeriodo(formData);
      setOpenDialog(false);
      setFormData({
        nombre: '',
        codigo: '',
        fecha_inicio: '',
        fecha_limite_carga: '',
        fecha_inicio_visitas: '',
        fecha_fin_visitas: '',
        estado: 'planificacion'
      });
      await cargarDatos();
    } catch (err) {
      console.error('Error creando período:', err);
      setError('Error al crear período');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando períodos...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Gestión de Períodos
          </Typography>
          <Chip
            icon={<ScheduleIcon />}
            label="Administración de Períodos"
            color="primary"
            size="small"
          />
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
          onClick={() => setOpenDialog(true)}
        >
          Nuevo Período
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {periodoActivo && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckIcon color="success" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" color="success.main">
                  Período Activo: {periodoActivo.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Código: {periodoActivo.codigo} |
                  Desde: {dayjs(periodoActivo.fecha_inicio).format('DD/MM/YYYY')} |
                  Hasta: {dayjs(periodoActivo.fecha_fin_visitas).format('DD/MM/YYYY')}
                </Typography>
              </Box>
              <Chip label="ACTIVO" color="success" />
            </Box>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Lista de Períodos
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Período</TableCell>
                  <TableCell>Código</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fechas</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {periodos.map((periodo) => {
                  const estadoStyle = getEstadoColor(periodo.estado);

                  return (
                    <TableRow key={periodo.id}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {periodo.nombre}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {periodo.codigo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={estadoStyle.text}
                          size="small"
                          sx={{
                            backgroundColor: estadoStyle.bg,
                            color: estadoStyle.color,
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {dayjs(periodo.fecha_inicio).format('DD/MM/YY')} - {dayjs(periodo.fecha_fin_visitas).format('DD/MM/YY')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {periodo.estado !== 'activo' && (
                          <Tooltip title="Activar período">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleActivarPeriodo(periodo.id)}
                            >
                              <ActivateIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Generar auditorías">
                          <IconButton size="small" color="secondary">
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog para crear nuevo período */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nuevo Período</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del período"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                placeholder="ej: Auditorías Mayo 2025"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código"
                value={formData.codigo}
                onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                placeholder="ej: 2025-05"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado inicial</InputLabel>
                <Select
                  value={formData.estado}
                  label="Estado inicial"
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                >
                  <MenuItem value="planificacion">Planificación</MenuItem>
                  <MenuItem value="activo">Activo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de inicio"
                InputLabelProps={{ shrink: true }}
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Límite de carga"
                InputLabelProps={{ shrink: true }}
                value={formData.fecha_limite_carga}
                onChange={(e) => setFormData({...formData, fecha_limite_carga: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Inicio de visitas"
                InputLabelProps={{ shrink: true }}
                value={formData.fecha_inicio_visitas}
                onChange={(e) => setFormData({...formData, fecha_inicio_visitas: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Fin de visitas"
                InputLabelProps={{ shrink: true }}
                value={formData.fecha_fin_visitas}
                onChange={(e) => setFormData({...formData, fecha_fin_visitas: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            Crear Período
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PeriodosAdmin;