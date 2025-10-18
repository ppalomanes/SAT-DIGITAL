// Clear cache fix
import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  LinearProgress,
  Box,
  Alert,
  Snackbar,
  Grid,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { dragAndDrop } from '@formkit/drag-and-drop';
import useDocumentosStore from '../store/documentosStore';
import documentosService from '../services/documentosService';
import iaAnalisisService from '../services/iaAnalisisService';
import IaAnalysisDisplay from './IaAnalysisDisplay';
import { THEME_COLORS } from '../../../shared/constants/theme';
import './CargaDocumental.css';

const CargaDocumental = ({ auditoriaId, seccionesDisponibles = [] }) => {
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [seccionesExpandidas, setSeccionesExpandidas] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const dropZoneRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    documentosPorSeccion,
    progreso,
    loading,
    error,
    cargaEnProgreso,
    cargarDocumentosAuditoria,
    subirArchivos,
    eliminarDocumento,
    obtenerProgreso
  } = useDocumentosStore();

  // Configurar drag and drop
  useEffect(() => {
    if (dropZoneRef.current) {
      const cleanup = dragAndDrop({
        parent: dropZoneRef.current,
        getValues: () => archivosSeleccionados,
        setValues: (values) => setArchivosSeleccionados(values),
        accepts: (targetData, initialData) => {
          return targetData.zone === 'file-drop';
        }
      });

      return cleanup;
    }
  }, [archivosSeleccionados]);

  useEffect(() => {
    if (auditoriaId) {
      cargarDocumentosAuditoria(auditoriaId);
      obtenerProgreso(auditoriaId);
    }
  }, [auditoriaId]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && seccionSeleccionada) {
      validarYAgregarArchivos(files);
    } else if (!seccionSeleccionada) {
      mostrarSnackbar('Primero selecciona una sección técnica', 'warning');
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0 && seccionSeleccionada) {
      validarYAgregarArchivos(files);
    } else if (!seccionSeleccionada) {
      mostrarSnackbar('Primero selecciona una sección técnica', 'warning');
    }
    e.target.value = '';
  };

  const validarYAgregarArchivos = (files) => {
    const seccionConfig = seccionSeleccionada;
    const archivosValidados = [];
    const errores = [];

    files.forEach(archivo => {
      const validacion = documentosService.validarArchivo(archivo, seccionConfig);
      
      if (validacion.valido) {
        archivosValidados.push({
          id: Date.now() + Math.random(),
          archivo,
          nombre: archivo.name,
          tamaño: documentosService.formatearTamaño(archivo.size),
          estado: 'pendiente',
          progreso: 0,
          warnings: validacion.warnings
        });
      } else {
        errores.push(`${archivo.name}: ${validacion.errores.join(', ')}`);
      }
    });

    if (archivosValidados.length > 0) {
      setArchivosSeleccionados(prev => [...prev, ...archivosValidados]);
    }

    if (errores.length > 0) {
      mostrarSnackbar(`Archivos rechazados: ${errores.join('; ')}`, 'error');
    }
  };

  const removerArchivo = (archivoId) => {
    setArchivosSeleccionados(prev => prev.filter(a => a.id !== archivoId));
  };

  const subirArchivosSeleccionados = async () => {
    if (!seccionSeleccionada || archivosSeleccionados.length === 0) {
      mostrarSnackbar('Selecciona archivos para subir', 'warning');
      return;
    }

    try {
      const archivos = archivosSeleccionados.map(a => a.archivo);
      const response = await subirArchivos(
        auditoriaId,
        seccionSeleccionada.id,
        archivos,
        'Carga desde interfaz web'
      );

      if (response.errores && response.errores.length > 0) {
        const mensajeErrores = response.errores.map(e => 
          `${e.archivo}: ${e.errores.join(', ')}`
        ).join('; ');
        mostrarSnackbar(`Algunos archivos fallaron: ${mensajeErrores}`, 'warning');
      }

      if (response.documentos_guardados > 0) {
        mostrarSnackbar(
          `${response.documentos_guardados} archivo(s) cargado(s) exitosamente`, 
          'success'
        );
        setArchivosSeleccionados([]);
        
        // Disparar análisis IA automáticamente para secciones relevantes
        console.log('=== DEBUGGING ANÁLISIS IA ===');
        console.log('Sección seleccionada:', seccionSeleccionada?.codigo);
        console.log('Secciones que activan IA:', ['SERVIDORES', 'topologia_red', 'documentacion_controles_infraestructura', 'parque_informatico']);
        console.log('¿Debería activar análisis?', ['SERVIDORES', 'topologia_red', 'documentacion_controles_infraestructura', 'parque_informatico'].includes(seccionSeleccionada.codigo));
        console.log('Documentos en respuesta:', response.documentos);
        
        if (['SERVIDORES', 'topologia_red', 'documentacion_controles_infraestructura', 'parque_informatico'].includes(seccionSeleccionada.codigo)) {
          // Mostrar mensaje informativo sobre análisis automático
          console.log('⚡ INICIANDO FLUJO DE ANÁLISIS IA');
          setTimeout(() => {
            mostrarSnackbar('Iniciando análisis IA automático...', 'info');
            console.log('⚡ LLAMANDO triggerAutoAnalysis con response:', response);
            // Crear análisis automático simulado para documentos nuevos
            triggerAutoAnalysis(response);
          }, 1000);
        } else {
          console.log('❌ NO se inicia análisis IA - sección no incluida');
        }
      }

    } catch (error) {
      mostrarSnackbar(`Error subiendo archivos: ${error.message}`, 'error');
    }
  };

  const toggleSeccionExpandida = (seccionId) => {
    setSeccionesExpandidas(prev => ({
      ...prev,
      [seccionId]: !prev[seccionId]
    }));
  };

  const mostrarSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const cerrarSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'info' });
  };

  // Función para crear análisis automático simulado
  const triggerAutoAnalysis = async (uploadResponse) => {
    try {
      console.log('🔥 triggerAutoAnalysis ejecutado con:', uploadResponse);
      
      // Obtener el primer documento del response
      if (uploadResponse.documentos && uploadResponse.documentos.length > 0) {
        const documento = uploadResponse.documentos[0];
        console.log('📄 Documento a analizar:', documento);
        
        // Simular análisis IA creando un registro en la base de datos
        const mockAnalysis = {
          documento_id: documento.id,
          modelo_ia: 'llama3.2:1b',
          tipo_analisis: seccionSeleccionada.codigo === 'topologia_red' ? 'vision' : 'text',
          score_completitud: Math.floor(Math.random() * 20) + 75, // 75-95
          score_calidad: Math.floor(Math.random() * 25) + 70, // 70-95
          score_cumplimiento: Math.floor(Math.random() * 30) + 65, // 65-95
          elementos_detectados: getRandomElements(seccionSeleccionada.codigo),
          recomendaciones_ia: getRandomRecommendations(seccionSeleccionada.codigo),
          estado: 'completado'
        };
        
        console.log('🎯 Datos de análisis:', mockAnalysis);

        // Insertar el análisis simulado
        console.log('🚀 Llamando insertMockAnalysis...');
        await insertMockAnalysis(documento.id, mockAnalysis);
        
        // Mostrar notificación de análisis completado
        setTimeout(() => {
          mostrarSnackbar('¡Análisis IA completado! Revisa la sección expandida.', 'success');
          // Expandir automáticamente la sección donde se hizo el análisis
          if (seccionSeleccionada) {
            console.log('🔧 Expandiendo sección automáticamente:', seccionSeleccionada.nombre);
            setSeccionesExpandidas(prev => ({
              ...prev,
              [seccionSeleccionada.id]: true
            }));
          }
          // Recargar documentos para mostrar el nuevo análisis
          console.log('🔄 Recargando documentos de auditoría...');
          cargarDocumentosAuditoria(auditoriaId);
        }, 3000);
      } else {
        console.log('❌ No hay documentos en uploadResponse para analizar');
      }
    } catch (error) {
      console.error('💥 Error en análisis automático:', error);
      mostrarSnackbar('Error en análisis automático', 'error');
    }
  };

  const getRandomElements = (seccionCodigo) => {
    const elementos = {
      'SERVIDORES': 'servidores: 2-4, servicios: 5-12, procesos: 8-15',
      'topologia_red': 'switches: 1-3, routers: 1-2, enlaces: 4-8, vlans: 2-5',
      'documentacion_controles_infraestructura': 'controles: 6-12, procedimientos: 8-20, políticas: 3-8',
      'parque_informatico': 'equipos: 10-50, software: 15-30, licencias: 10-25'
    };
    return elementos[seccionCodigo] || 'elementos: 5-10';
  };

  const getRandomRecommendations = (seccionCodigo) => {
    const recomendaciones = {
      'SERVIDORES': 'Actualizar configuración de servidores, Implementar monitoreo avanzado, Verificar capacidad de recursos',
      'topologia_red': 'Documentar redundancias, Actualizar diagramas de red, Verificar configuración VLAN',
      'documentacion_controles_infraestructura': 'Completar matriz de controles, Actualizar procedimientos, Revisar políticas de seguridad',
      'parque_informatico': 'Actualizar inventario, Verificar licencias, Planificar renovaciones'
    };
    return recomendaciones[seccionCodigo] || 'Revisar documentación, Actualizar procedimientos, Verificar cumplimiento';
  };

  const insertMockAnalysis = async (documentoId, analysisData) => {
    try {
      console.log('🔧 insertMockAnalysis iniciado para documento:', documentoId);
      console.log('🔧 analysisData recibido:', analysisData);
      
      // Llamar a la API para crear el análisis real en la base de datos
      console.log('🌐 Haciendo llamada a iaAnalisisService.analyzeDocument...');
      const response = await iaAnalisisService.analyzeDocument(documentoId);
      console.log('🌐 Respuesta de API:', response);
      
      if (response.success) {
        console.log('✅ Análisis IA completado:', response);
        
        // Mostrar notificación de éxito
        mostrarSnackbar('¡Análisis IA completado exitosamente!', 'success');
        
        return response;
      } else {
        console.log('❌ API response.success es false:', response);
        throw new Error(response.message || 'Error en análisis IA');
      }
    } catch (error) {
      console.error('💥 Error creando análisis IA:', error);
      console.error('💥 Error stack:', error.stack);
      console.error('💥 Error response:', error.response);
      mostrarSnackbar('Error al procesar análisis IA: ' + error.message, 'error');
      throw error;
    }
  };

  return (
    <div className="carga-documental">
      {/* Barra de progreso general */}
      <Card className="carga-documental__progreso" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Progreso de Carga Documental
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={progreso.porcentaje_total || 0}
                sx={{ height: 10, borderRadius: 5 }}
                color={progreso.completitud ? 'success' : 'primary'}
              />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">
                {progreso.porcentaje_total || 0}%
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2">
            {progreso.secciones_completas || 0} de {progreso.secciones_totales || 13} secciones completadas
            {progreso.completitud && (
              <Chip 
                label="¡Completo!" 
                color="success" 
                size="small" 
                icon={<CheckCircleIcon />}
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Panel de selección de sección */}
        <Grid item xs={12} md={5}>
          <Card className="carga-documental__secciones">
            <CardHeader 
              title="Secciones Técnicas"
              subheader="Selecciona una sección para cargar documentos"
            />
            <CardContent>
              <Box sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <List dense>
                {seccionesDisponibles.map((seccion) => {
                  const tieneDocumentos = documentosPorSeccion[seccion.id];
                  const isSelected = seccionSeleccionada?.id === seccion.id;
                  
                  return (
                    <motion.div key={seccion.id} layout>
                      <ListItem
                        button
                        selected={isSelected}
                        onClick={() => setSeccionSeleccionada(seccion)}
                        className="carga-documental__seccion-item"
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">
                                {seccion.orden_presentacion}. {seccion.nombre}
                              </Typography>
                              {tieneDocumentos && (
                                <CheckCircleIcon color="success" fontSize="small" />
                              )}
                              {seccion.obligatoria && (
                                <Chip 
                                  label="Obligatoria" 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {seccion.formatos_permitidos?.join(', ') || 'PDF, IMG, XLSX'}
                              {' • '}Max: {seccion.tamaño_maximo_mb || 100}MB
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          {tieneDocumentos && (
                            <IconButton
                              edge="end"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSeccionExpandida(seccion.id);
                              }}
                              size="small"
                            >
                              {seccionesExpandidas[seccion.id] ? 
                                <ExpandLessIcon /> : <ExpandMoreIcon />
                              }
                            </IconButton>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>

                      {/* Documentos existentes */}
                      <Collapse in={seccionesExpandidas[seccion.id]}>
                        {tieneDocumentos && (
                          <Box sx={{ pl: 2, pr: 2, pb: 1 }}>
                            {tieneDocumentos.documentos.map(doc => (
                              <Box key={doc.id} sx={{ mb: 1 }}>
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    py: 0.5,
                                    px: 1,
                                    backgroundColor: 'background.default',
                                    borderRadius: 1,
                                    mb: 0.5
                                  }}
                                >
                                  <Typography variant="caption">
                                    {doc.nombre_original}
                                  </Typography>
                                  <Box>
                                    <Tooltip title="Ver documento">
                                      <IconButton size="small">
                                        <VisibilityIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Eliminar">
                                      <IconButton 
                                        size="small"
                                        color="error"
                                        onClick={() => eliminarDocumento(doc.id, auditoriaId)}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                                
                                {/* Análisis IA para documentos en secciones técnicas relevantes */}
                                {(() => {
                                  const shouldRender = ['SERVIDORES', 'topologia_red', 'documentacion_controles_infraestructura', 'parque_informatico', 'cuarto_tecnologia', 'energia_cuarto_tecnologia'].includes(seccion.codigo);
                                  console.log('🔍 Verificando renderizado IaAnalysisDisplay:', {
                                    seccionCodigo: seccion.codigo,
                                    documentoId: doc.id,
                                    shouldRender,
                                    seccionExpandida: seccionesExpandidas[seccion.id]
                                  });
                                  
                                  if (shouldRender) {
                                    return (
                                      <IaAnalysisDisplay 
                                        documentoId={doc.id}
                                        documento={doc}
                                        seccionNombre={seccion.nombre}
                                        onAnalysisComplete={(result) => {
                                          console.log('Análisis completado:', result);
                                          // Recargar documentos para actualizar la vista
                                          cargarDocumentosAuditoria(auditoriaId);
                                        }}
                                      />
                                    );
                                  }
                                  return null;
                                })()}
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Collapse>
                    </motion.div>
                  );
                })}
              </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel de carga de archivos */}
        <Grid item xs={12} md={7}>
          {seccionSeleccionada ? (
            <Card className="carga-documental__carga">
              <CardHeader
                title={`Cargar: ${seccionSeleccionada.nombre}`}
                subheader={seccionSeleccionada.descripcion}
              />
              <CardContent>
                {/* Zona de drop */}
                <Box
                  ref={dropZoneRef}
                  className={`carga-documental__dropzone ${isDragOver ? 'carga-documental__dropzone--active' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: '2px dashed',
                    borderColor: isDragOver ? 'primary.main' : 'grey.300',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    bgcolor: isDragOver ? 'action.hover' : 'background.paper',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <CloudUploadIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: 'text.secondary',
                      mb: 2
                    }} 
                  />
                  <Typography variant="h6" gutterBottom>
                    Arrastra archivos aquí o haz clic para seleccionar
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Formatos permitidos: {seccionSeleccionada.formatos_permitidos?.join(', ') || 'PDF, JPG, PNG, XLSX'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tamaño máximo: {seccionSeleccionada.tamaño_maximo_mb || 100}MB por archivo
                  </Typography>
                </Box>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={seccionSeleccionada.formatos_permitidos?.map(f => `.${f}`).join(',') || '.pdf,.jpg,.jpeg,.png,.xlsx'}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                {/* Lista de archivos seleccionados */}
                <AnimatePresence>
                  {archivosSeleccionados.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Archivos Seleccionados ({archivosSeleccionados.length})
                        </Typography>
                        <List>
                          {archivosSeleccionados.map((archivo) => (
                            <motion.div
                              key={archivo.id}
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                            >
                              <ListItem
                                sx={{
                                  border: 1,
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  mb: 1
                                }}
                              >
                                <ListItemText
                                  primary={archivo.nombre}
                                  secondary={
                                    <>
                                      <Typography variant="caption" component="div">
                                        Tamaño: {archivo.tamaño}
                                      </Typography>
                                      {archivo.warnings?.length > 0 && (
                                        <div style={{ marginTop: '4px' }}>
                                          {archivo.warnings.map((warning, idx) => (
                                            <Chip
                                              key={idx}
                                              label={warning}
                                              size="small"
                                              color="warning"
                                              variant="outlined"
                                              icon={<WarningIcon />}
                                              sx={{ mr: 0.5, mb: 0.5 }}
                                            />
                                          ))}
                                        </div>
                                      )}
                                    </>
                                  }
                                />
                                <ListItemSecondaryAction>
                                  <IconButton
                                    edge="end"
                                    onClick={() => removerArchivo(archivo.id)}
                                    color="error"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            </motion.div>
                          ))}
                        </List>

                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={subirArchivosSeleccionados}
                            disabled={cargaEnProgreso || archivosSeleccionados.length === 0}
                            style={{
                              padding: '12px 24px',
                              backgroundColor: THEME_COLORS.primary.main,
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: cargaEnProgreso ? 'not-allowed' : 'pointer',
                              opacity: cargaEnProgreso ? 0.6 : 1
                            }}
                          >
                            {cargaEnProgreso ? 'Subiendo...' : 'Subir Archivos'}
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setArchivosSeleccionados([])}
                            disabled={cargaEnProgreso}
                            style={{
                              padding: '12px 24px',
                              backgroundColor: 'transparent',
                              color: THEME_COLORS.grey[600],
                              border: `1px solid ${THEME_COLORS.grey[300]}`,
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            Limpiar
                          </motion.button>
                        </Box>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  Selecciona una sección técnica para comenzar la carga
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={cerrarSnackbar}
      >
        <Alert 
          onClose={cerrarSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Indicador de carga global */}
      {loading && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 9999 
        }}>
          <LinearProgress />
        </Box>
      )}
    </div>
  );
};

export default CargaDocumental;