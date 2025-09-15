import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Assessment as AssessmentIcon,
  Computer as ComputerIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Visibility as ViewIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Importar componentes del normalizador
import { processExcelFile } from '../../../../utils/excelProcessor';

const HardwareSoftwareForm = ({ onSave, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    // Datos básicos
    inventarioCompleto: initialData.inventarioCompleto || false,
    herramientaInventario: initialData.herramientaInventario || '',
    fechaUltimaActualizacion: initialData.fechaUltimaActualizacion || '',
    
    // Control de normalización
    normalizacionActivada: initialData.normalizacionActivada || false,
    graficosActivados: initialData.graficosActivados || false,
    
    // Archivos y datos
    archivoInventario: initialData.archivoInventario || null,
    datosNormalizados: initialData.datosNormalizados || null,
    estadisticas: initialData.estadisticas || null,
    
    // Configuraciones de validación (heredadas del normalizador)
    requisitosMinimos: initialData.requisitosMinimos || {
      procesador: {
        marca: '',
        modelo: '',
        velocidadMinima: 2.0,
        nucleosMinimos: 4
      },
      memoria: {
        capacidadMinima: 8,
        tipoMinimo: 'DDR4'
      },
      almacenamiento: {
        capacidadMinima: 256,
        tipoMinimo: 'SSD'
      }
    },
    
    // Observaciones
    observaciones: initialData.observaciones || '',
    
    // Estado del procesamiento
    procesando: false,
    error: null
  });

  const [previewData, setPreviewData] = useState([]);
  const [showNormalizationGraphics, setShowNormalizationGraphics] = useState(false);

  // Manejar cambios simples
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar cambios en requisitos mínimos
  const handleRequirementChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      requisitosMinimos: {
        ...prev.requisitosMinimos,
        [category]: {
          ...prev.requisitosMinimos[category],
          [field]: value
        }
      }
    }));
  };

  // Procesar archivo de inventario con normalización
  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;

    setFormData(prev => ({ ...prev, procesando: true, error: null }));
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // Usar el procesador del módulo normalizador
          const { normalizedData, stats } = await processExcelFile(
            e.target.result,
            formData.requisitosMinimos
          );
          
          setFormData(prev => ({
            ...prev,
            archivoInventario: file,
            datosNormalizados: normalizedData,
            estadisticas: stats,
            procesando: false
          }));
          
          // Mostrar preview de los primeros registros
          setPreviewData(normalizedData.slice(0, 5));
          
        } catch (error) {
          console.error('Error al procesar archivo:', error);
          setFormData(prev => ({
            ...prev,
            error: `Error al procesar el archivo: ${error.message}`,
            procesando: false
          }));
        }
      };
      
      reader.onerror = () => {
        setFormData(prev => ({
          ...prev,
          error: 'Error al leer el archivo',
          procesando: false
        }));
      };
      
      reader.readAsArrayBuffer(file);
      
    } catch (error) {
      setFormData(prev => ({
        ...prev,
        error: `Error al manejar el archivo: ${error.message}`,
        procesando: false
      }));
    }
  }, [formData.requisitosMinimos]);

  // Activar/desactivar gráficos de normalización
  const toggleNormalizationGraphics = () => {
    setShowNormalizationGraphics(!showNormalizationGraphics);
    setFormData(prev => ({
      ...prev,
      graficosActivados: !prev.graficosActivados
    }));
  };

  // Reprocesar datos con nuevos requisitos
  const reprocessData = async () => {
    if (!formData.archivoInventario) return;
    
    setFormData(prev => ({ ...prev, procesando: true }));
    await handleFileUpload(formData.archivoInventario);
  };

  // Validar formulario
  const validateForm = () => {
    if (!formData.inventarioCompleto) {
      return 'Debe confirmar que el inventario está completo';
    }
    if (!formData.herramientaInventario) {
      return 'Debe especificar la herramienta de inventario utilizada';
    }
    return null;
  };

  // Guardar sección
  const handleSave = () => {
    const error = validateForm();
    if (error) {
      setFormData(prev => ({ ...prev, error }));
      return;
    }

    // Calcular estado basado en datos normalizados
    let status = 'completed';
    let completionPercentage = 100;
    
    if (formData.estadisticas) {
      const failedItems = formData.estadisticas.procesadorStats?.failed + 
                          formData.estadisticas.memoriaStats?.failed + 
                          formData.estadisticas.almacenamientoStats?.failed;
      const totalItems = formData.estadisticas.totalRecords;
      
      if (failedItems > 0) {
        status = 'warning';
        completionPercentage = Math.max(70, ((totalItems - failedItems) / totalItems) * 100);
      }
    }

    onSave({
      sectionId: 'hardware-software',
      data: formData,
      completedAt: new Date().toISOString(),
      status,
      completionPercentage,
      // Datos adicionales para IA analysis
      normalizationStats: formData.estadisticas,
      processedRecords: formData.datosNormalizados?.length || 0
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        
        {/* Header con controles principales */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="primary">
                  Inventario de Hardware y Software
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.normalizacionActivada}
                        onChange={(e) => handleInputChange('normalizacionActivada', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Normalización IA"
                  />
                  {formData.normalizacionActivada && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showNormalizationGraphics}
                          onChange={toggleNormalizationGraphics}
                          color="secondary"
                        />
                      }
                      label="Gráficos"
                    />
                  )}
                </Box>
              </Box>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Esta sección utiliza IA para normalizar y analizar automáticamente el inventario de hardware y software, 
                  validando el cumplimiento de requisitos mínimos configurables.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Información básica */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información General
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.inventarioCompleto}
                        onChange={(e) => handleInputChange('inventarioCompleto', e.target.checked)}
                      />
                    }
                    label="Inventario completo y actualizado"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Herramienta de Inventario"
                    value={formData.herramientaInventario}
                    onChange={(e) => handleInputChange('herramientaInventario', e.target.value)}
                    placeholder="Ej: GLPI, ServiceNow, Excel, Sistema propietario"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha de Última Actualización"
                    value={formData.fechaUltimaActualizacion}
                    onChange={(e) => handleInputChange('fechaUltimaActualizacion', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Requisitos mínimos configurables */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Requisitos Mínimos
              </Typography>
              <Grid container spacing={2}>
                {/* Procesador */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ComputerIcon fontSize="small" /> Procesador
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Velocidad mínima (GHz)"
                    type="number"
                    step="0.1"
                    value={formData.requisitosMinimos.procesador.velocidadMinima}
                    onChange={(e) => handleRequirementChange('procesador', 'velocidadMinima', parseFloat(e.target.value))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Núcleos mínimos"
                    type="number"
                    value={formData.requisitosMinimos.procesador.nucleosMinimos}
                    onChange={(e) => handleRequirementChange('procesador', 'nucleosMinimos', parseInt(e.target.value))}
                  />
                </Grid>

                {/* Memoria */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <MemoryIcon fontSize="small" /> Memoria RAM
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Capacidad mínima (GB)"
                    type="number"
                    value={formData.requisitosMinimos.memoria.capacidadMinima}
                    onChange={(e) => handleRequirementChange('memoria', 'capacidadMinima', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Tipo mínimo"
                    value={formData.requisitosMinimos.memoria.tipoMinimo}
                    onChange={(e) => handleRequirementChange('memoria', 'tipoMinimo', e.target.value)}
                    placeholder="DDR4"
                  />
                </Grid>

                {/* Almacenamiento */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <StorageIcon fontSize="small" /> Almacenamiento
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Capacidad mínima (GB)"
                    type="number"
                    value={formData.requisitosMinimos.almacenamiento.capacidadMinima}
                    onChange={(e) => handleRequirementChange('almacenamiento', 'capacidadMinima', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Tipo preferido"
                    value={formData.requisitosMinimos.almacenamiento.tipoMinimo}
                    onChange={(e) => handleRequirementChange('almacenamiento', 'tipoMinimo', e.target.value)}
                    placeholder="SSD"
                  />
                </Grid>
              </Grid>

              {formData.datosNormalizados && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={reprocessData}
                    disabled={formData.procesando}
                  >
                    Reprocesar con nuevos requisitos
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Carga de archivo */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Carga de Inventario
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  disabled={formData.procesando}
                >
                  {formData.archivoInventario ? 'Cambiar Archivo' : 'Cargar Inventario Excel'}
                  <input
                    type="file"
                    hidden
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </Button>
                
                {formData.archivoInventario && (
                  <Chip 
                    label={formData.archivoInventario.name} 
                    variant="outlined" 
                    icon={<AssessmentIcon />}
                  />
                )}
              </Box>

              {formData.procesando && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Procesando archivo con IA...
                  </Typography>
                  <LinearProgress />
                </Box>
              )}

              {formData.error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formData.error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Estadísticas de normalización */}
        {formData.estadisticas && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AnalyticsIcon /> Estadísticas de Normalización
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
                      <Typography variant="h4" color="primary">
                        {formData.estadisticas.totalRecords}
                      </Typography>
                      <Typography variant="body2">Total de Equipos</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                      <Typography variant="h4" color="success.main">
                        {formData.estadisticas.procesadorStats?.passed || 0}
                      </Typography>
                      <Typography variant="body2">Procesadores OK</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                      <Typography variant="h4" color="success.main">
                        {formData.estadisticas.memoriaStats?.passed || 0}
                      </Typography>
                      <Typography variant="body2">Memoria OK</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
                      <Typography variant="h4" color="warning.main">
                        {(formData.estadisticas.procesadorStats?.failed || 0) + 
                         (formData.estadisticas.memoriaStats?.failed || 0) + 
                         (formData.estadisticas.almacenamientoStats?.failed || 0)}
                      </Typography>
                      <Typography variant="body2">No Conformes</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Preview de datos normalizados */}
        {previewData.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Vista Previa de Datos Normalizados
                  </Typography>
                  <Tooltip title="Ver datos completos">
                    <IconButton>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Hostname</strong></TableCell>
                        <TableCell><strong>Procesador Normalizado</strong></TableCell>
                        <TableCell><strong>Memoria</strong></TableCell>
                        <TableCell><strong>Almacenamiento</strong></TableCell>
                        <TableCell><strong>Estado</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.hostname || row.Hostname}</TableCell>
                          <TableCell>{row.procesadorNormalizado || 'N/A'}</TableCell>
                          <TableCell>{row.memoria || row.RAM || 'N/A'}</TableCell>
                          <TableCell>{row.almacenamiento || row.Almacenamiento || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              size="small"
                              label={row.cumpleRequisitos ? 'Conforme' : 'No Conforme'}
                              color={row.cumpleRequisitos ? 'success' : 'error'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {formData.datosNormalizados.length > 5 && (
                  <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', color: 'text.secondary' }}>
                    Mostrando 5 de {formData.datosNormalizados.length} registros
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Observaciones */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Observaciones y Comentarios
              </Typography>
              <TextField
                fullWidth
                label="Observaciones sobre Hardware y Software"
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                multiline
                rows={4}
                placeholder="Incluir observaciones sobre el estado del hardware, software, cumplimiento de requisitos, recomendaciones de actualización..."
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Placeholder para gráficos de normalización */}
        {showNormalizationGraphics && formData.estadisticas && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Gráficos de Análisis
                </Typography>
                <Alert severity="info">
                  <Typography variant="body2">
                    🚧 Los gráficos de normalización se mostrarán aquí. 
                    Se integrarán los componentes de charts del módulo normalizador.
                  </Typography>
                </Alert>
                {/* Aquí se integrarán los componentes de gráficos del normalizador */}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Botones de Acción */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={formData.procesando}
        >
          Guardar Sección
        </Button>
      </Box>
    </Box>
  );
};

export default HardwareSoftwareForm;