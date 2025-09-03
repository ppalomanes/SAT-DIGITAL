import { useState } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  IconButton, 
  Paper, 
  Tooltip,
  Chip,
  Badge
} from '@mui/material';
import { 
  ChevronLeft, 
  ChevronRight, 
  Today 
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

/**
 * Componente de calendario mensual para visualizar asignaciones
 */
function CalendarioMensual({ asignaciones, fechaSeleccionada, onFechaSeleccionada }) {
  const [mesActual, setMesActual] = useState(dayjs(fechaSeleccionada));

  // Generar días del mes
  const inicioMes = mesActual.startOf('month');
  const finMes = mesActual.endOf('month');
  const inicioCalendario = inicioMes.startOf('week');
  const finCalendario = finMes.endOf('week');

  const dias = [];
  let diaActual = inicioCalendario;

  while (diaActual.isBefore(finCalendario) || diaActual.isSame(finCalendario, 'day')) {
    dias.push(diaActual);
    diaActual = diaActual.add(1, 'day');
  }

  // Obtener asignaciones por fecha
  const getAsignacionesPorFecha = (fecha) => {
    const fechaStr = fecha.format('YYYY-MM-DD');
    return asignaciones.filter(asignacion => 
      dayjs(asignacion.fecha_visita_programada).format('YYYY-MM-DD') === fechaStr
    );
  };

  const navegarMes = (direccion) => {
    const nuevoMes = direccion === 'anterior' 
      ? mesActual.subtract(1, 'month')
      : mesActual.add(1, 'month');
    setMesActual(nuevoMes);
  };

  const irHoy = () => {
    const hoy = dayjs();
    setMesActual(hoy);
    onFechaSeleccionada(hoy);
  };

  const getColorEstado = (estado) => {
    const colores = {
      'asignado': '#6c757d',
      'confirmado': '#007bff', 
      'reagendado': '#ffc107',
      'completado': '#28a745'
    };
    return colores[estado] || '#6c757d';
  };

  return (
    <Box className="calendario-mensual">
      {/* Header del calendario */}
      <Box className="calendario-mensual__header" 
           display="flex" 
           justifyContent="space-between" 
           alignItems="center"
           mb={2}>
        <IconButton onClick={() => navegarMes('anterior')}>
          <ChevronLeft />
        </IconButton>
        
        <Typography variant="h5" fontWeight="bold">
          {mesActual.format('MMMM YYYY')}
        </Typography>
        
        <Box display="flex" gap={1}>
          <Tooltip title="Ir a hoy">
            <IconButton onClick={irHoy}>
              <Today />
            </IconButton>
          </Tooltip>
          
          <IconButton onClick={() => navegarMes('siguiente')}>
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {/* Días de la semana */}
      <Grid container spacing={0} className="calendario-mensual__dias-semana">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
          <Grid item xs key={dia}>
            <Typography 
              variant="body2" 
              textAlign="center" 
              fontWeight="bold"
              color="text.secondary"
              py={1}
            >
              {dia}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Grid de días */}
      <Grid container spacing={0} className="calendario-mensual__dias">
        {dias.map((dia, index) => {
          const asignacionesDia = getAsignacionesPorFecha(dia);
          const esMesActual = dia.month() === mesActual.month();
          const esHoy = dia.isSame(dayjs(), 'day');
          const estaSeleccionado = dia.isSame(fechaSeleccionada, 'day');

          return (
            <Grid item xs key={index}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Paper
                  className={`calendario-mensual__dia ${
                    estaSeleccionado ? 'calendario-mensual__dia--seleccionado' : ''
                  }`}
                  onClick={() => onFechaSeleccionada(dia)}
                  sx={{
                    minHeight: 120,
                    p: 1,
                    cursor: 'pointer',
                    backgroundColor: estaSeleccionado 
                      ? 'primary.light' 
                      : esHoy 
                        ? 'action.hover' 
                        : 'background.paper',
                    opacity: esMesActual ? 1 : 0.5,
                    border: esHoy ? '2px solid' : '1px solid',
                    borderColor: esHoy ? 'primary.main' : 'divider',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  {/* Número del día */}
                  <Typography 
                    variant="body2" 
                    fontWeight={esHoy ? 'bold' : 'normal'}
                    color={esMesActual ? 'text.primary' : 'text.secondary'}
                    mb={1}
                  >
                    {dia.date()}
                  </Typography>

                  {/* Asignaciones del día */}
                  <Box>
                    {asignacionesDia.slice(0, 3).map(asignacion => (
                      <Tooltip
                        key={asignacion.id}
                        title={
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {asignacion.Auditoria?.Sitio?.nombre}
                            </Typography>
                            <Typography variant="caption">
                              Auditor: {asignacion.Usuario?.nombre}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Estado: {asignacion.estado_asignacion}
                            </Typography>
                          </Box>
                        }
                      >
                        <Chip
                          size="small"
                          label={asignacion.Auditoria?.Sitio?.nombre?.substring(0, 10) + '...'}
                          sx={{
                            fontSize: '0.7rem',
                            height: 20,
                            mb: 0.5,
                            backgroundColor: getColorEstado(asignacion.estado_asignacion),
                            color: 'white',
                            '&:hover': {
                              backgroundColor: getColorEstado(asignacion.estado_asignacion)
                            }
                          }}
                        />
                      </Tooltip>
                    ))}

                    {/* Indicador de más asignaciones */}
                    {asignacionesDia.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{asignacionesDia.length - 3} más
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* Leyenda */}
      <Box className="calendario-mensual__leyenda" mt={2}>
        <Typography variant="body2" color="text.secondary" mb={1}>
          Estados:
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {[
            { estado: 'asignado', label: 'Asignado' },
            { estado: 'confirmado', label: 'Confirmado' },
            { estado: 'reagendado', label: 'Reagendado' },
            { estado: 'completado', label: 'Completado' }
          ].map(({ estado, label }) => (
            <Chip
              key={estado}
              size="small"
              label={label}
              sx={{
                backgroundColor: getColorEstado(estado),
                color: 'white',
                fontSize: '0.75rem'
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default CalendarioMensual;
