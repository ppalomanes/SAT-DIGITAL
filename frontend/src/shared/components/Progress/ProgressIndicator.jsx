// Componente de Indicador de Progreso para Workflow de Auditorías
// Checkpoint 2.9 - Sistema de Estados Automáticos

import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  Typography,
  Chip,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Assignment as AssignmentIcon,
  Done as DoneIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  FastForward as FastForwardIcon
} from '@mui/icons-material';

const ProgressIndicator = ({ 
  progreso, 
  onForzarTransicion, 
  onVerificarTransiciones,
  showDetails = true,
  compact = false,
  interactivo = false
}) => {
  
  const estados = {
    programada: { 
      index: 0, 
      label: 'Programada', 
      icon: <ScheduleIcon />, 
      color: 'default',
      description: 'Auditoría creada y en espera de inicio'
    },
    en_carga: { 
      index: 1, 
      label: 'En Carga', 
      icon: <PlayArrowIcon />, 
      color: 'primary',
      description: 'Carga de documentos en progreso'
    },
    pendiente_evaluacion: { 
      index: 2, 
      label: 'Pendiente Evaluación', 
      icon: <AssignmentIcon />, 
      color: 'warning',
      description: 'Lista para evaluación por auditor'
    },
    evaluada: { 
      index: 3, 
      label: 'Evaluada', 
      icon: <CheckCircleIcon />, 
      color: 'success',
      description: 'Evaluación completada'
    },
    cerrada: { 
      index: 4, 
      label: 'Cerrada', 
      icon: <DoneIcon />, 
      color: 'success',
      description: 'Proceso de auditoría finalizado'
    }
  };

  const estadoActual = progreso?.estado_actual || 'programada';
  const activeStep = estados[estadoActual]?.index || 0;
  const porcentaje = progreso?.porcentaje || 0;

  const getStepStatus = (stepIndex) => {
    if (stepIndex < activeStep) return 'completed';
    if (stepIndex === activeStep) return 'active';
    return 'pending';
  };

  const getColorByStatus = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'primary';
      default: return 'disabled';
    }
  };

  const renderCompactView = () => (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {estados[estadoActual]?.icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {estados[estadoActual]?.label}
        </Typography>
        <Chip 
          label={`${porcentaje}%`} 
          color={estados[estadoActual]?.color}
          size="small"
          sx={{ ml: 2 }}
        />
      </Box>
      
      <LinearProgress 
        variant="determinate" 
        value={porcentaje} 
        sx={{ mb: 1, height: 8, borderRadius: 4 }}
        color={estados[estadoActual]?.color}
      />
      
      <Typography variant="body2" color="text.secondary">
        {estados[estadoActual]?.description}
      </Typography>

      {progreso?.secciones && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2">
            Secciones: {progreso.secciones.completadas}/{progreso.secciones.obligatorias}
          </Typography>
          {progreso.documentos_cargados > 0 && (
            <Chip 
              label={`${progreso.documentos_cargados} docs`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      )}
    </Box>
  );

  const renderDetailedView = () => (
    <Box sx={{ p: 3 }}>
      {/* Header con estado actual */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Progreso de Auditoría
          </Typography>
          {interactivo && (
            <Box sx={{ ml: 2 }}>
              <Tooltip title="Verificar transiciones automáticas">
                <IconButton 
                  onClick={() => onVerificarTransiciones?.()}
                  size="small"
                  color="primary"
                >
                  <FastForwardIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
        
        <Chip 
          label={`${porcentaje}% Completado`} 
          color={estados[estadoActual]?.color}
          icon={estados[estadoActual]?.icon}
        />
      </Box>

      {/* Barra de progreso general */}
      <Box sx={{ mb: 4 }}>
        <LinearProgress 
          variant="determinate" 
          value={porcentaje} 
          sx={{ height: 12, borderRadius: 6 }}
          color={estados[estadoActual]?.color}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {estados[estadoActual]?.description}
        </Typography>
      </Box>

      {/* Stepper detallado */}
      <Stepper activeStep={activeStep} orientation="vertical">
        {Object.entries(estados).map(([key, estado], index) => {
          const stepStatus = getStepStatus(index);
          
          return (
            <Step key={key}>
              <StepLabel 
                StepIconComponent={() => (
                  <Box sx={{ 
                    color: stepStatus === 'completed' ? 'success.main' : 
                           stepStatus === 'active' ? 'primary.main' : 'text.disabled'
                  }}>
                    {estado.icon}
                  </Box>
                )}
              >
                <Typography 
                  variant="subtitle1" 
                  color={stepStatus === 'completed' ? 'success.main' : 
                         stepStatus === 'active' ? 'primary.main' : 'text.secondary'}
                >
                  {estado.label}
                </Typography>
              </StepLabel>
              
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  {estado.description}
                </Typography>
                
                {/* Información adicional para estado activo */}
                {stepStatus === 'active' && progreso && (
                  <Box sx={{ mt: 2 }}>
                    {renderActiveStepDetails()}
                  </Box>
                )}
              </StepContent>
            </Step>
          );
        })}
      </Stepper>

      {/* Alertas y acciones */}
      {renderAlertsAndActions()}
    </Box>
  );

  const renderActiveStepDetails = () => {
    const secciones = progreso?.secciones;
    
    return (
      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Detalles del Estado Actual
        </Typography>
        
        {/* Información de secciones */}
        {secciones && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              📋 Secciones completadas: {secciones.completadas}/{secciones.obligatorias}
            </Typography>
            <Typography variant="body2">
              📄 Documentos cargados: {progreso.documentos_cargados}
            </Typography>
            
            {/* Secciones faltantes */}
            {secciones.faltantes?.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="warning.main">
                  ⚠️ Secciones pendientes:
                </Typography>
                <List dense>
                  {secciones.faltantes.slice(0, 3).map((seccion) => (
                    <ListItem key={seccion.id} sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: 20 }}>
                        <WarningIcon fontSize="small" color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={seccion.nombre}
                        secondary={`Código: ${seccion.codigo}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                  {secciones.faltantes.length > 3 && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                      ... y {secciones.faltantes.length - 3} más
                    </Typography>
                  )}
                </List>
              </Box>
            )}
          </Box>
        )}

        {/* Información de fechas */}
        {progreso?.fechas && (
          <Box>
            <Typography variant="body2">
              📅 Última actualización: {new Date(progreso.fechas.ultima_actualizacion).toLocaleDateString()}
            </Typography>
            {progreso.fechas.dias_restantes !== null && (
              <Typography 
                variant="body2" 
                color={progreso.fechas.dias_restantes < 7 ? 'error.main' : 'text.secondary'}
              >
                ⏰ Días restantes: {progreso.fechas.dias_restantes > 0 ? 
                  progreso.fechas.dias_restantes : 'VENCIDO'}
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    );
  };

  const renderAlertsAndActions = () => {
    const transiciones = progreso?.transiciones;
    const fechas = progreso?.fechas;
    
    return (
      <Box sx={{ mt: 3 }}>
        {/* Alerta de vencimiento */}
        {fechas?.dias_restantes !== null && fechas.dias_restantes < 7 && (
          <Alert 
            severity={fechas.dias_restantes <= 0 ? 'error' : 'warning'} 
            sx={{ mb: 2 }}
          >
            {fechas.dias_restantes <= 0 ? 
              'La fecha límite de carga ha vencido' :
              `Quedan ${fechas.dias_restantes} días para el límite de carga`
            }
          </Alert>
        )}

        {/* Información de transiciones */}
        {transiciones && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Transiciones Disponibles
            </Typography>
            
            {transiciones.puede_avanzar ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                ✅ Puede avanzar al siguiente estado: {transiciones.siguiente_estado}
              </Alert>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>
                ℹ️ No se puede avanzar automáticamente al siguiente estado
              </Alert>
            )}

            {/* Botones de acción para administradores */}
            {interactivo && transiciones.estados_disponibles?.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {transiciones.estados_disponibles.map((estado) => (
                  <Chip
                    key={estado}
                    label={`→ ${estados[estado]?.label || estado}`}
                    onClick={() => onForzarTransicion?.(estado)}
                    color="primary"
                    variant="outlined"
                    size="small"
                    clickable
                  />
                ))}
              </Box>
            )}
          </Paper>
        )}
      </Box>
    );
  };

  if (!progreso) {
    return (
      <Alert severity="info">
        <Typography>No hay información de progreso disponible</Typography>
      </Alert>
    );
  }

  return compact ? renderCompactView() : renderDetailedView();
};

export default ProgressIndicator;