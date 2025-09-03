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
                              <Box 
                                key={doc.id} 
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
                                    <Box>
                                      <Typography variant="caption">
                                        Tamaño: {archivo.tamaño}
                                      </Typography>
                                      {archivo.warnings?.length > 0 && (
                                        <Box sx={{ mt: 0.5 }}>
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
                                        </Box>
                                      )}
                                    </Box>
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
                              backgroundColor: '#1976d2',
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
                              color: '#666',
                              border: '1px solid #ccc',
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