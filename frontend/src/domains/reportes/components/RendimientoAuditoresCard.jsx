// Card de Rendimiento de Auditores
// Checkpoint 2.10 - Visualización de métricas de performance

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  Skeleton,
  Avatar,
  Tooltip,
  Badge
} from '@mui/material';
import {
  People as PeopleIcon,
  Star as StarIcon,
  Timer as TimerIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';

const EficienciaIndicator = ({ eficiencia }) => {
  const getColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getIcon = (score) => {
    if (score >= 90) return <TrophyIcon fontSize="small" />;
    if (score >= 80) return <StarIcon fontSize="small" />;
    return <TrendingUpIcon fontSize="small" />;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LinearProgress
        variant="determinate"
        value={eficiencia}
        color={getColor(eficiencia)}
        sx={{ width: 40, height: 6, borderRadius: 1 }}
      />
      <Chip
        icon={getIcon(eficiencia)}
        label={`${eficiencia}%`}
        size="small"
        color={getColor(eficiencia)}
        variant="outlined"
      />
    </Box>
  );
};

const AuditorRow = ({ auditor, index }) => {
  const {
    nombre,
    email,
    metricas: {
      total_asignadas,
      completadas,
      pendientes,
      porcentaje_completadas,
      tiempo_promedio_dias,
      eficiencia
    }
  } = auditor;

  const isTopPerformer = index < 3;

  return (
    <TableRow hover>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge
            badgeContent={isTopPerformer ? index + 1 : null}
            color={index === 0 ? 'warning' : 'primary'}
            overlap="circular"
            variant={isTopPerformer ? 'standard' : 'dot'}
            invisible={!isTopPerformer}
          >
            <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
              {nombre.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Avatar>
          </Badge>
          <Box>
            <Typography variant="body2" fontWeight={isTopPerformer ? 'bold' : 'normal'}>
              {nombre}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {email.split('@')[0]}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      
      <TableCell align="center">
        <Chip
          label={total_asignadas}
          size="small"
          variant="outlined"
          color="info"
        />
      </TableCell>
      
      <TableCell align="center">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" fontSize="small" />
          <Typography variant="body2" fontWeight="bold" color="success.main">
            {completadas}
          </Typography>
        </Box>
      </TableCell>
      
      <TableCell align="center">
        <Typography 
          variant="body2" 
          color={pendientes > 5 ? 'warning.main' : 'textSecondary'}
          fontWeight={pendientes > 5 ? 'bold' : 'normal'}
        >
          {pendientes}
        </Typography>
      </TableCell>
      
      <TableCell align="center">
        <Box sx={{ minWidth: 80 }}>
          <LinearProgress
            variant="determinate"
            value={porcentaje_completadas}
            color={porcentaje_completadas >= 80 ? 'success' : porcentaje_completadas >= 60 ? 'warning' : 'error'}
            sx={{ mb: 0.5, height: 4, borderRadius: 1 }}
          />
          <Typography variant="caption">
            {porcentaje_completadas}%
          </Typography>
        </Box>
      </TableCell>
      
      <TableCell align="center">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <TimerIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {tiempo_promedio_dias}d
          </Typography>
        </Box>
      </TableCell>
      
      <TableCell align="center">
        <EficienciaIndicator eficiencia={eficiencia} />
      </TableCell>
    </TableRow>
  );
};

const RendimientoAuditoresCard = ({ rendimiento, loading }) => {
  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Rendimiento de Auditores
          </Typography>
          <Box sx={{ mt: 2 }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} variant="rectangular" height={50} sx={{ mb: 1 }} />
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!rendimiento || !rendimiento.auditores || rendimiento.auditores.length === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Alert severity="info">
            No hay datos de rendimiento de auditores disponibles
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { auditores, resumen } = rendimiento;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon />
          Rendimiento de Auditores
        </Typography>

        {/* Resumen General */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Resumen General
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary.main">
                {resumen.total_auditores}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Auditores Activos
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="info.main">
                {resumen.promedio_eficiencia}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Eficiencia Promedio
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">
                {resumen.total_auditorias_completadas}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Total Completadas
              </Typography>
            </Box>
          </Box>
          {resumen.mejor_auditor && (
            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <Chip
                icon={<TrophyIcon />}
                label={`Mejor Auditor: ${resumen.mejor_auditor}`}
                color="warning"
                size="small"
              />
            </Box>
          )}
        </Box>

        {/* Tabla de Auditores */}
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Auditor</TableCell>
                <TableCell align="center">
                  <Tooltip title="Total Asignadas">
                    <AssignmentIcon fontSize="small" />
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Completadas">
                    <CheckCircleIcon fontSize="small" />
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Pendientes">
                    <span>Pend.</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="% Completadas">
                    <span>% Compl.</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Tiempo Promedio">
                    <TimerIcon fontSize="small" />
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Eficiencia">
                    <TrendingUpIcon fontSize="small" />
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditores.map((auditor, index) => (
                <AuditorRow
                  key={auditor.id}
                  auditor={auditor}
                  index={index}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Leyenda */}
        <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="textSecondary">
            <strong>Eficiencia:</strong> Basada en % completadas y tiempo promedio. 
            🏆 Top 3 auditores destacados.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RendimientoAuditoresCard;