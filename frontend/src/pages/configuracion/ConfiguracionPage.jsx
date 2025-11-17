import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  ContentCopy as DuplicateIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import pliegosService from '../../services/pliegosService';
import HelpTooltip from '../../components/common/HelpTooltip';

/**
 * ConfiguracionPage - Vista principal de configuración de Pliegos
 *
 * Muestra la lista de pliegos de requisitos del tenant actual y permite:
 * - Ver todos los pliegos (activos, borradores, vencidos, archivados)
 * - Crear nuevo pliego
 * - Editar pliego existente
 * - Duplicar pliego
 * - Marcar como vigente
 * - Ver historial de versiones
 * - Desactivar pliego
 */
const ConfiguracionPage = () => {
  const navigate = useNavigate();

  // Estados
  const [pliegos, setPliegos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duplicateDialog, setDuplicateDialog] = useState({ open: false, pliego: null });
  const [duplicateData, setDuplicateData] = useState({ codigo: '', nombre: '' });

  // Cargar pliegos al montar el componente
  useEffect(() => {
    cargarPliegos();
  }, []);

  /**
   * Carga la lista de pliegos desde el backend
   */
  const cargarPliegos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pliegosService.listarPliegos();
      setPliegos(response.data || []);
    } catch (err) {
      console.error('Error al cargar pliegos:', err);
      setError('Error al cargar la lista de pliegos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Marca un pliego como vigente
   */
  const handleMarcarVigente = async (id) => {
    try {
      await pliegosService.marcarVigente(id);
      await cargarPliegos(); // Recargar lista
    } catch (err) {
      console.error('Error al marcar pliego como vigente:', err);
      setError('Error al marcar el pliego como vigente.');
    }
  };

  /**
   * Abre el diálogo para duplicar un pliego
   */
  const handleAbrirDuplicar = (pliego) => {
    setDuplicateDialog({ open: true, pliego });
    setDuplicateData({
      codigo: `${pliego.codigo}-COPIA`,
      nombre: `${pliego.nombre} (Copia)`
    });
  };

  /**
   * Confirma la duplicación de un pliego
   */
  const handleConfirmarDuplicar = async () => {
    try {
      await pliegosService.duplicarPliego(
        duplicateDialog.pliego.id,
        duplicateData.codigo,
        duplicateData.nombre
      );
      setDuplicateDialog({ open: false, pliego: null });
      await cargarPliegos();
    } catch (err) {
      console.error('Error al duplicar pliego:', err);
      setError('Error al duplicar el pliego.');
    }
  };

  /**
   * Desactiva un pliego
   */
  const handleDesactivar = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas desactivar este pliego?')) {
      return;
    }

    try {
      await pliegosService.desactivarPliego(id);
      await cargarPliegos();
    } catch (err) {
      console.error('Error al desactivar pliego:', err);
      setError('Error al desactivar el pliego.');
    }
  };

  /**
   * Retorna el color del chip según el estado
   */
  const getEstadoColor = (estado) => {
    const colores = {
      'activo': 'success',
      'borrador': 'warning',
      'vencido': 'error',
      'archivado': 'default'
    };
    return colores[estado] || 'default';
  };

  /**
   * Formatea la fecha
   */
  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Typography variant="h4" component="h1">
            Pliegos de Requisitos
          </Typography>
          <HelpTooltip
            title="¿Qué es un Pliego de Requisitos?"
            content={`Un Pliego define los requisitos técnicos que aplican a períodos completos de auditoría.\n\nIncluye configuraciones para:\n• Parque Informático (CPU, RAM, SSD, Headsets)\n• Conectividad (Velocidades internet)\n• Infraestructura (UPS, Generador)\n• Seguridad (Controles obligatorios)\n• Documentación y Personal\n\nTodas las auditorías de un período heredan los requisitos del pliego asignado.`}
            placement="right"
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Gestiona los documentos de requisitos técnicos que aplican a períodos de auditoría
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/configuracion/nuevo')}
          size="large"
        >
          Crear Nuevo Pliego
        </Button>
      </Box>

      {/* Mensaje de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabla de pliegos */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : pliegos.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay pliegos de requisitos creados
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Crea tu primer pliego para definir los requisitos técnicos de tus auditorías
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/configuracion/nuevo')}
            >
              Crear Primer Pliego
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Vigente</TableCell>
                  <TableCell>Vigencia</TableCell>
                  <TableCell align="center">Versión</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pliegos.map((pliego) => (
                  <TableRow
                    key={pliego.id}
                    hover
                    sx={{
                      backgroundColor: pliego.es_vigente ? 'success.lighter' : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {pliego.codigo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {pliego.nombre}
                      </Typography>
                      {pliego.descripcion && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {pliego.descripcion.substring(0, 60)}
                          {pliego.descripcion.length > 60 ? '...' : ''}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={pliego.estado.toUpperCase()}
                        color={getEstadoColor(pliego.estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {pliego.es_vigente ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <IconButton
                          size="small"
                          onClick={() => handleMarcarVigente(pliego.id)}
                          title="Marcar como vigente"
                        >
                          <CheckCircleIcon color="disabled" />
                        </IconButton>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        Desde: {formatearFecha(pliego.vigencia_desde)}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Hasta: {formatearFecha(pliego.vigencia_hasta) || 'Indefinido'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={`v${pliego.version}`} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/configuracion/${pliego.id}`)}
                          title="Ver detalles"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/configuracion/editar/${pliego.id}`)}
                          title="Editar"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/configuracion/${pliego.id}/historial`)}
                          title="Ver historial"
                        >
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleAbrirDuplicar(pliego)}
                          title="Duplicar"
                        >
                          <DuplicateIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDesactivar(pliego.id)}
                          title="Desactivar"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Diálogo de duplicación */}
      <Dialog
        open={duplicateDialog.open}
        onClose={() => setDuplicateDialog({ open: false, pliego: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Duplicar Pliego</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Se creará una copia del pliego "{duplicateDialog.pliego?.nombre}" con un nuevo código y nombre.
          </Typography>
          <TextField
            label="Nuevo Código"
            value={duplicateData.codigo}
            onChange={(e) => setDuplicateData({ ...duplicateData, codigo: e.target.value })}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Nuevo Nombre"
            value={duplicateData.nombre}
            onChange={(e) => setDuplicateData({ ...duplicateData, nombre: e.target.value })}
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialog({ open: false, pliego: null })}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarDuplicar}
            variant="contained"
            disabled={!duplicateData.codigo || !duplicateData.nombre}
          >
            Duplicar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ConfiguracionPage;
