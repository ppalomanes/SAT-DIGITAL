import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import pliegosService from '../../services/pliegosService';
import HelpTooltip from '../../components/common/HelpTooltip';

/**
 * PliegoDetalle - Vista de solo lectura de un Pliego de Requisitos
 *
 * Muestra todos los detalles de un pliego organizado por secciones:
 * - Información General
 * - Parque Informático
 * - Conectividad
 * - Infraestructura
 * - Seguridad
 * - Documentación
 * - Personal
 */
const PliegoDetalle = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [pliego, setPliego] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarPliego();
  }, [id]);

  const cargarPliego = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pliegosService.obtenerPliego(id);
      setPliego(response.data);
    } catch (err) {
      console.error('Error al cargar pliego:', err);
      setError('Error al cargar el pliego. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Indefinido';
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'activo': 'success',
      'borrador': 'warning',
      'vencido': 'error',
      'archivado': 'default'
    };
    return colores[estado] || 'default';
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !pliego) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Pliego no encontrado'}</Alert>
        <Button onClick={() => navigate('/configuracion')} sx={{ mt: 2 }}>
          Volver a Configuración
        </Button>
      </Container>
    );
  }

  const InfoRow = ({ label, value, type = 'text' }) => (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={12} md={4}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        {type === 'boolean' ? (
          value ? (
            <Chip icon={<CheckCircleIcon />} label="Sí" color="success" size="small" />
          ) : (
            <Chip icon={<CancelIcon />} label="No" color="default" size="small" />
          )
        ) : type === 'array' ? (
          value && value.length > 0 ? (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {value.map((item, idx) => (
                <Chip key={idx} label={item} size="small" sx={{ mb: 0.5 }} />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">Ninguno</Typography>
          )
        ) : (
          <Typography variant="body2">
            {value || '-'}
          </Typography>
        )}
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={() => navigate('/configuracion')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              {pliego.nombre}
            </Typography>
            <HelpTooltip
              title="Detalle de Pliego"
              content="Vista completa de los requisitos técnicos definidos en este pliego."
              placement="right"
            />
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => navigate(`/configuracion/${id}/historial`)}
            >
              Historial
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/configuracion/editar/${id}`)}
            >
              Editar
            </Button>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={pliego.codigo} variant="outlined" />
          <Chip label={pliego.estado.toUpperCase()} color={getEstadoColor(pliego.estado)} />
          {pliego.es_vigente && <Chip label="VIGENTE" color="success" />}
          <Chip label={`Versión ${pliego.version}`} variant="outlined" size="small" />
        </Stack>
      </Box>

      {/* Información General */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Información General
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <InfoRow label="Código" value={pliego.codigo} />
        <InfoRow label="Nombre" value={pliego.nombre} />
        <InfoRow label="Descripción" value={pliego.descripcion} />
        <InfoRow label="Estado" value={pliego.estado.toUpperCase()} />
        <InfoRow label="Es Vigente" value={pliego.es_vigente} type="boolean" />
        <InfoRow label="Vigencia Desde" value={formatearFecha(pliego.vigencia_desde)} />
        <InfoRow label="Vigencia Hasta" value={formatearFecha(pliego.vigencia_hasta)} />
        <InfoRow label="Versión" value={pliego.version} />
      </Paper>

      {/* Secciones Técnicas en Grid */}
      <Grid container spacing={3}>
        {/* Parque Informático */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Parque Informático
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {pliego.parque_informatico ? (
                <>
                  <InfoRow label="CPU Cores Mínimos" value={pliego.parque_informatico.cpu_cores_min} />
                  <InfoRow label="RAM Mínima (GB)" value={pliego.parque_informatico.ram_gb_min} />
                  <InfoRow label="SSD Mínimo (GB)" value={pliego.parque_informatico.ssd_gb_min} />
                  <InfoRow label="Sistemas Operativos" value={pliego.parque_informatico.sistema_operativo} type="array" />
                  <InfoRow label="Headset Requerido" value={pliego.parque_informatico.headset_requerido} type="boolean" />
                  <InfoRow label="Headset Homologado" value={pliego.parque_informatico.headset_homologado} type="boolean" />
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">No configurado</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Conectividad */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Conectividad
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {pliego.conectividad ? (
                <>
                  <InfoRow label="Velocidad Bajada Mín. (Mbps)" value={pliego.conectividad.velocidad_bajada_min_mbps} />
                  <InfoRow label="Velocidad Subida Mín. (Mbps)" value={pliego.conectividad.velocidad_subida_min_mbps} />
                  <InfoRow label="Conexión Cableada" value={pliego.conectividad.conexion_cableada_requerida} type="boolean" />
                  <InfoRow label="Backup Internet" value={pliego.conectividad.backup_internet_requerido} type="boolean" />
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">No configurado</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Infraestructura */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Infraestructura
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {pliego.infraestructura ? (
                <>
                  <InfoRow label="UPS Requerido" value={pliego.infraestructura.ups_requerido} type="boolean" />
                  <InfoRow label="Capacidad Mín. UPS (VA)" value={pliego.infraestructura.ups_capacidad_min_va} />
                  <InfoRow label="Generador Requerido" value={pliego.infraestructura.generador_requerido} type="boolean" />
                  <InfoRow label="Aire Acondicionado" value={pliego.infraestructura.aire_acondicionado_requerido} type="boolean" />
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">No configurado</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Seguridad */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Seguridad
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {pliego.seguridad ? (
                <>
                  <InfoRow label="Antivirus Requerido" value={pliego.seguridad.antivirus_requerido} type="boolean" />
                  <InfoRow label="Firewall Requerido" value={pliego.seguridad.firewall_requerido} type="boolean" />
                  <InfoRow label="Acceso Físico Controlado" value={pliego.seguridad.acceso_fisico_controlado} type="boolean" />
                  <InfoRow label="Cámaras de Seguridad" value={pliego.seguridad.camaras_seguridad_requeridas} type="boolean" />
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">No configurado</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Documentación */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Documentación
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {pliego.documentacion ? (
                <>
                  <InfoRow label="Planos de Topología" value={pliego.documentacion.planos_topologia_requeridos} type="boolean" />
                  <InfoRow label="Inventario Actualizado" value={pliego.documentacion.inventario_actualizado} type="boolean" />
                  <InfoRow label="Certificaciones Cableado" value={pliego.documentacion.certificaciones_cableado} type="boolean" />
                  <InfoRow label="Manuales de Equipos" value={pliego.documentacion.manuales_equipos} type="boolean" />
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">No configurado</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Personal */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Personal
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {pliego.personal ? (
                <>
                  <InfoRow label="Personal Técnico Mínimo" value={pliego.personal.personal_tecnico_minimo} />
                  <InfoRow label="Capacitación Anual (Horas)" value={pliego.personal.capacitacion_anual_horas} />
                  <InfoRow label="Certificaciones Requeridas" value={pliego.personal.certificaciones_requeridas} type="array" />
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">No configurado</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PliegoDetalle;
