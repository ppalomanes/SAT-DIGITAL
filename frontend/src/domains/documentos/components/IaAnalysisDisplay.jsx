import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  CircularProgress,
  Alert,
  Collapse,
  IconButton
} from '@mui/material';
import {
  SmartToy as SmartToyIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Lightbulb as LightbulbIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import iaAnalisisService from '../services/iaAnalisisService';

const IaAnalysisDisplay = ({ documentoId, documento, onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  console.log('🔍 IaAnalysisDisplay renderizado para documentoId:', documentoId);

  // Cargar análisis existente al montar el componente
  useEffect(() => {
    if (documentoId) {
      loadExistingAnalysis();
    }
  }, [documentoId]);

  // Recargar análisis cada 3 segundos para detectar nuevos análisis
  useEffect(() => {
    if (documentoId && !analysis) {
      const interval = setInterval(() => {
        loadExistingAnalysis();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [documentoId, analysis]);

  const loadExistingAnalysis = async () => {
    try {
      setLoading(true);
      console.log('🔄 Buscando análisis para documento:', documentoId);
      
      const response = await iaAnalisisService.getDocumentAnalysis(documentoId);
      console.log('📡 Respuesta del servidor:', response);
      
      if (response.success && response.latest) {
        setAnalysis(response.latest);
        setExpanded(true);
        console.log('✅ Análisis cargado y componente expandido:', response.latest);
      } else {
        console.log('⚠️ No se encontró análisis para el documento:', documentoId, 'Respuesta:', response);
      }
    } catch (err) {
      console.error('❌ Error cargando análisis:', err);
      // No mostrar error si simplemente no hay análisis
    } finally {
      setLoading(false);
    }
  };

  const handleStartAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      
      const response = await iaAnalisisService.analyzeDocument(documentoId);
      
      if (response.success) {
        // Simulamos espera y luego recargamos el análisis
        setTimeout(() => {
          loadExistingAnalysis();
          setAnalyzing(false);
          if (onAnalysisComplete) {
            onAnalysisComplete(response);
          }
        }, 2000);
      }
    } catch (err) {
      setError('Error iniciando análisis IA');
      setAnalyzing(false);
    }
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return 'BAJO';
    if (score >= 60) return 'MEDIO';
    return 'ALTO';
  };

  const getRiskColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircleIcon />;
    if (score >= 60) return <WarningIcon />;
    return <ErrorIcon />;
  };

  if (loading) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Cargando análisis IA...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ mt: 2, border: '1px solid', borderColor: 'primary.light' }}>
        <CardHeader
          avatar={<SmartToyIcon color="primary" />}
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6">Análisis IA</Typography>
              {analysis && (
                <Chip 
                  label="Completado" 
                  color="success" 
                  size="small"
                  icon={<CheckCircleIcon />}
                />
              )}
            </Box>
          }
          subheader={
            analysis 
              ? `Análisis completado - ${documento?.nombre_original || 'Documento'}`
              : 'Análisis con Inteligencia Artificial no disponible'
          }
          action={
            <Box>
              {analysis && (
                <IconButton
                  onClick={() => setExpanded(!expanded)}
                  aria-label="toggle analysis"
                >
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
              <IconButton
                onClick={analysis ? loadExistingAnalysis : handleStartAnalysis}
                disabled={analyzing}
                color="primary"
                title={analysis ? "Recargar análisis" : "Iniciar análisis"}
              >
                {analyzing ? (
                  <CircularProgress size={20} />
                ) : analysis ? (
                  <RefreshIcon />
                ) : (
                  <PlayArrowIcon />
                )}
              </IconButton>
            </Box>
          }
        />

        {error && (
          <CardContent sx={{ pt: 0 }}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </CardContent>
        )}

        {analyzing && (
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <CircularProgress size={24} />
              <Typography variant="body2">
                Analizando documento con IA... Esto puede tomar unos minutos.
              </Typography>
            </Box>
          </CardContent>
        )}

        {!analysis && !analyzing && (
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Este documento aún no ha sido analizado por IA. El análisis automatizado puede:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <TrendingUpIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Evaluar el cumplimiento técnico" 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <LightbulbIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Generar recomendaciones automáticas"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <WarningIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Identificar riesgos potenciales"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<SmartToyIcon />}
                onClick={handleStartAnalysis}
                disabled={analyzing}
                fullWidth
              >
                Iniciar Análisis IA
              </Button>
            </Box>
          </CardContent>
        )}

        <Collapse in={expanded && analysis} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 0 }}>
            {analysis && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Resultados del Análisis
                  </Typography>
                  
                  {/* Scores */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Puntuaciones de Análisis
                    </Typography>
                    
                    {/* Score de Cumplimiento */}
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        {getScoreIcon(analysis.score_cumplimiento || analysis.score_promedio)}
                        <Typography variant="body2">
                          Cumplimiento: {analysis.score_cumplimiento || analysis.score_promedio}%
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 6 }}>
                        <Box
                          sx={{
                            width: `${analysis.score_cumplimiento || analysis.score_promedio}%`,
                            bgcolor: `${getScoreColor(analysis.score_cumplimiento || analysis.score_promedio)}.main`,
                            height: 6,
                            borderRadius: 1,
                            transition: 'width 0.5s ease-in-out'
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Scores adicionales si están disponibles */}
                    {analysis.score_calidad && (
                      <Box sx={{ mb: 2 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Typography variant="body2">
                            Calidad: {analysis.score_calidad}%
                          </Typography>
                        </Box>
                        <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 6 }}>
                          <Box
                            sx={{
                              width: `${analysis.score_calidad}%`,
                              bgcolor: `${getScoreColor(analysis.score_calidad)}.main`,
                              height: 6,
                              borderRadius: 1,
                              transition: 'width 0.5s ease-in-out'
                            }}
                          />
                        </Box>
                      </Box>
                    )}

                    {analysis.score_completitud && (
                      <Box sx={{ mb: 2 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Typography variant="body2">
                            Completitud: {analysis.score_completitud}%
                          </Typography>
                        </Box>
                        <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 6 }}>
                          <Box
                            sx={{
                              width: `${analysis.score_completitud}%`,
                              bgcolor: `${getScoreColor(analysis.score_completitud)}.main`,
                              height: 6,
                              borderRadius: 1,
                              transition: 'width 0.5s ease-in-out'
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Nivel de Riesgo */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Nivel de Riesgo
                    </Typography>
                    <Chip 
                      label={getRiskLevel(analysis.score_cumplimiento || analysis.score_promedio)}
                      color={getRiskColor(analysis.score_cumplimiento || analysis.score_promedio)}
                      icon={<WarningIcon />}
                    />
                  </Box>

                  {/* Recomendaciones */}
                  {analysis.recomendaciones_ia && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Recomendaciones IA
                      </Typography>
                      <List dense>
                        {analysis.recomendaciones_ia.split(',').map((recomendacion, index) => (
                          <ListItem key={index}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <LightbulbIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={recomendacion.trim()}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Elementos Detectados */}
                  {analysis.elementos_detectados && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Elementos Detectados
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {analysis.elementos_detectados}
                      </Typography>
                    </Box>
                  )}

                  {/* Información técnica */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Detalles Técnicos
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip
                        label={`Modelo: ${analysis.modelo_ia}`}
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        label={`Tipo: ${analysis.tipo_analisis}`}
                        variant="outlined"
                        size="small"
                      />
                      {analysis.tiempo_procesamiento && (
                        <Chip
                          label={`Tiempo: ${analysis.tiempo_procesamiento}s`}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Análisis generado automáticamente • 
                  {analysis.fecha_creacion ? new Date(analysis.fecha_creacion).toLocaleString() : 'Fecha no disponible'}
                </Typography>
              </motion.div>
            )}
          </CardContent>
        </Collapse>
      </Card>
    </motion.div>
  );
};

export default IaAnalysisDisplay;