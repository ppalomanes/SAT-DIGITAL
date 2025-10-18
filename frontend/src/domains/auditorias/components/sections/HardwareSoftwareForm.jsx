import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../auth/store/authStore';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Assessment as AssessmentIcon,
  Computer as ComputerIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Visibility as ViewIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  GetApp as DownloadIcon,
  FileDownload as ExportIcon
,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { THEME_COLORS } from '../../../../shared/constants/theme';
import httpClient from '../../../../shared/services/httpClient';

// Importar componentes del normalizador
import { processExcelFile } from '../../../../utils/excelProcessor';
import { exportToExcel, exportToCSV, exportToJSON, generateComplianceReport } from '../../../../utils/dataExporter';
import { HEADSETS_HOMOLOGADOS, MARCAS_HEADSETS_HOMOLOGADAS } from '../../../../utils/headsetsHomologados';

const HardwareSoftwareForm = ({ onSave, onCancel, initialData = {}, auditData }) => {
  // Verificar rol de usuario
  const { usuario } = useAuthStore();
  const isAdmin = usuario?.rol === 'admin';

  // Header con descripción basada en auditoria.html
  const renderHeader = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, color: THEME_COLORS.grey[900], mb: 2 }}>
        Parque Informático - Hardware/Software (Presencial y Teletrabajo)
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, color: THEME_COLORS.grey[700], mb: 2 }}>
        Descripción
      </Typography>

      <Typography variant="body1" paragraph sx={{ fontWeight: 300, color: THEME_COLORS.grey[600], lineHeight: 1.6, mb: 3 }}>
        Relevamiento del parque informático del sitio.
      </Typography>

      <Alert severity="info" sx={{ mb: 3, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, color: THEME_COLORS.grey[900] }}>
          Criterio de aceptación
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 300, lineHeight: 1.6 }}>
          Adjuntar planilla Excel (.xlsx o .xls) con los siguientes campos: Hostname, Procesador, RAM, Disco, SO, Navegador, Headset.
        </Typography>
      </Alert>
    </Box>
  );


  // Componente para configuración de requisitos mínimos (solo administrador)
  const renderRequisitosMinimoConfig = () => {
    if (!isAdmin && formData.configuracionBloqueada) {
      return (
        <Grid item xs={12}>
          <Card sx={{ opacity: 0.6, background: '#f8f9fa' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#6c757d' }}>
                ⚙️ Configuración de Requisitos Mínimos (Solo Administrador)
              </Typography>
              <Alert severity="info" sx={{ background: 'rgba(108, 117, 125, 0.1)' }}>
                <Typography variant="body2">
                  Los requisitos mínimos han sido configurados por el administrador y están bloqueados para modificación.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      );
    }

    if (!isAdmin) return null;

    return (
      <Grid item xs={12}>
        <Card sx={{ border: '2px solid #ffc107', background: '#fffbf0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#d68910', fontWeight: 600 }}>
                🛠️ Configuración de Requisitos Mínimos (Solo Administrador)
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.mostrarConfiguracion}
                    onChange={(e) => handleInputChange('mostrarConfiguracion', e.target.checked)}
                    color="warning"
                  />
                }
                label="Mostrar Configuración"
              />
            </Box>

            {formData.mostrarConfiguracion && (
              <Box>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ⚠️ CONFIGURACIÓN EXCLUSIVA DE ADMINISTRADOR
                  </Typography>
                  <Typography variant="body2">
                    Una vez definidos, estos requisitos quedarán bloqueados para otros usuarios hasta nueva modificación.
                  </Typography>
                </Alert>

                {/* Configuración de Procesadores */}
                <Typography variant="h6" sx={{ mb: 2, color: '#495057' }}>
                  🖥️ Procesadores - Criterios de Rendimiento
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2, border: '1px solid #dee2e6' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Marcas Aceptadas
                      </Typography>
                      <FormControl fullWidth size="small">
                        <InputLabel>Fabricantes Permitidos</InputLabel>
                        <Select
                          multiple
                          value={formData.requisitosMinimos.procesador.marcasAceptadas}
                          onChange={(e) => handleRequirementChange('procesador', 'marcasAceptadas', e.target.value)}
                          label="Fabricantes Permitidos"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          <MenuItem value="Intel">Intel</MenuItem>
                          <MenuItem value="AMD">AMD</MenuItem>
                        </Select>
                      </FormControl>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2, border: '1px solid #dee2e6' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Modelos Mínimos
                      </Typography>
                      <FormControl fullWidth size="small">
                        <InputLabel>Líneas de Procesador</InputLabel>
                        <Select
                          multiple
                          value={formData.requisitosMinimos.procesador.modelosMinimos}
                          onChange={(e) => handleRequirementChange('procesador', 'modelosMinimos', e.target.value)}
                          label="Líneas de Procesador"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          <MenuItem value="i3">Intel Core i3</MenuItem>
                          <MenuItem value="i5">Intel Core i5</MenuItem>
                          <MenuItem value="i7">Intel Core i7</MenuItem>
                          <MenuItem value="i9">Intel Core i9</MenuItem>
                          <MenuItem value="Ryzen 3">AMD Ryzen 3</MenuItem>
                          <MenuItem value="Ryzen 5">AMD Ryzen 5</MenuItem>
                          <MenuItem value="Ryzen 7">AMD Ryzen 7</MenuItem>
                          <MenuItem value="Ryzen 9">AMD Ryzen 9</MenuItem>
                        </Select>
                      </FormControl>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2, border: '1px solid #dee2e6' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Rendimiento Mínimo
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Velocidad (GHz)"
                            type="number"
                            step="0.1"
                            value={formData.requisitosMinimos.procesador.velocidadMinima}
                            onChange={(e) => handleRequirementChange('procesador', 'velocidadMinima', parseFloat(e.target.value))}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Núcleos"
                            type="number"
                            value={formData.requisitosMinimos.procesador.nucleosMinimos}
                            onChange={(e) => handleRequirementChange('procesador', 'nucleosMinimos', parseInt(e.target.value))}
                          />
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2, border: '1px solid #e3f2fd', background: '#f8f9fa' }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#1976d2', display: 'block', mb: 1 }}>
                        💡 Guía de Rendimiento
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                        <strong>Intel:</strong> i3 &lt; i5 &lt; i7 &lt; i9 (mayor rendimiento)
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                        <strong>AMD:</strong> Ryzen 3 &lt; Ryzen 5 &lt; Ryzen 7 &lt; Ryzen 9
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        <strong>Velocidad:</strong> Mayor GHz = Mejor rendimiento
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                {/* Configuración de Memoria */}
                <Typography variant="h6" sx={{ mb: 2, color: '#495057' }}>
                  🧠 Memoria RAM - Capacidad y Tipo
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, border: '1px solid #dee2e6' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Capacidad Mínima
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        label="Memoria RAM (GB)"
                        type="number"
                        value={formData.requisitosMinimos.memoria.capacidadMinima}
                        onChange={(e) => handleRequirementChange('memoria', 'capacidadMinima', parseInt(e.target.value))}
                      />
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, border: '1px solid #dee2e6' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Tipos Aceptados
                      </Typography>
                      <FormControl fullWidth size="small">
                        <InputLabel>Tecnología de Memoria</InputLabel>
                        <Select
                          multiple
                          value={formData.requisitosMinimos.memoria.tiposAceptados}
                          onChange={(e) => handleRequirementChange('memoria', 'tiposAceptados', e.target.value)}
                          label="Tecnología de Memoria"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          <MenuItem value="DDR3">DDR3</MenuItem>
                          <MenuItem value="DDR4">DDR4</MenuItem>
                          <MenuItem value="DDR5">DDR5</MenuItem>
                        </Select>
                      </FormControl>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, border: '1px solid #e3f2fd', background: '#f8f9fa' }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#1976d2', display: 'block', mb: 1 }}>
                        💡 Recomendaciones
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                        <strong>Mínimo:</strong> 8GB para uso básico
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                        <strong>Recomendado:</strong> 16GB para multitarea
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        <strong>Tipo:</strong> DDR4/DDR5 para mejor rendimiento
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                {/* Configuración de Almacenamiento */}
                <Typography variant="h6" sx={{ mb: 2, color: '#495057' }}>
                  💾 Almacenamiento - Múltiples Opciones Válidas
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {formData.requisitosMinimos.almacenamiento.opcionesValidas.map((opcion, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Card sx={{ p: 2, border: '1px solid #dee2e6' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          {opcion.tipo}
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          label="Capacidad Mínima (GB)"
                          type="number"
                          value={opcion.capacidadMinima}
                          onChange={(e) => {
                            const newOpciones = [...formData.requisitosMinimos.almacenamiento.opcionesValidas];
                            newOpciones[index].capacidadMinima = parseInt(e.target.value);
                            handleRequirementChange('almacenamiento', 'opcionesValidas', newOpciones);
                          }}
                        />
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Configuración de Conectividad */}
                <Typography variant="h6" sx={{ mb: 2, color: '#495057' }}>
                  🌐 Conectividad - Umbrales por Tecnología
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {formData.requisitosMinimos.conectividad.tecnologias.map((tech, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card sx={{ p: 2, border: '1px solid #dee2e6' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          {tech.tipo}
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Down (Mbps)"
                              type="number"
                              value={tech.velocidadMinimaDown}
                              onChange={(e) => {
                                const newTechs = [...formData.requisitosMinimos.conectividad.tecnologias];
                                newTechs[index].velocidadMinimaDown = parseInt(e.target.value);
                                handleRequirementChange('conectividad', 'tecnologias', newTechs);
                              }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Up (Mbps)"
                              type="number"
                              value={tech.velocidadMinimaUp}
                              onChange={(e) => {
                                const newTechs = [...formData.requisitosMinimos.conectividad.tecnologias];
                                newTechs[index].velocidadMinimaUp = parseInt(e.target.value);
                                handleRequirementChange('conectividad', 'tecnologias', newTechs);
                              }}
                            />
                          </Grid>
                        </Grid>
                        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                          Formas: {tech.formasConexion.join(', ')}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Configuración de Sistema Operativo */}
                <Typography variant="h6" sx={{ mb: 2, color: '#495057' }}>
                  🖥️ Sistema Operativo Aceptado
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Versiones Aceptadas</InputLabel>
                      <Select
                        multiple
                        value={formData.requisitosMinimos.sistemaOperativo.versionesAceptadas}
                        onChange={(e) => handleRequirementChange('sistemaOperativo', 'versionesAceptadas', e.target.value)}
                        label="Versiones Aceptadas"
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        <MenuItem value="Windows 10">Windows 10</MenuItem>
                        <MenuItem value="Windows 11">Windows 11</MenuItem>
                        <MenuItem value="Windows Server 2019">Windows Server 2019</MenuItem>
                        <MenuItem value="Windows Server 2022">Windows Server 2022</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Ediciones Aceptadas</InputLabel>
                      <Select
                        multiple
                        value={formData.requisitosMinimos.sistemaOperativo.edicionesAceptadas}
                        onChange={(e) => handleRequirementChange('sistemaOperativo', 'edicionesAceptadas', e.target.value)}
                        label="Ediciones Aceptadas"
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        <MenuItem value="Home">Home</MenuItem>
                        <MenuItem value="Pro">Pro</MenuItem>
                        <MenuItem value="Enterprise">Enterprise</MenuItem>
                        <MenuItem value="Education">Education</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Configuración de Headsets Homologados */}
                <Typography variant="h6" sx={{ mb: 2, color: '#495057' }}>
                  🎧 Headsets Homologados (Según Pliego Técnico)
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2, border: '1px solid #dee2e6' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Validación Estricta
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.requisitosMinimos.headset.validacionEstricta}
                            onChange={(e) => handleRequirementChange('headset', 'validacionEstricta', e.target.checked)}
                          />
                        }
                        label="Solo headsets homologados"
                      />
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#6c757d' }}>
                        Si está activado, solo acepta los {HEADSETS_HOMOLOGADOS.length} modelos homologados oficiales
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2, border: '1px solid #dee2e6' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Tipos de Conexión Aceptados
                      </Typography>
                      <FormControl fullWidth size="small">
                        <InputLabel>Conectores Permitidos</InputLabel>
                        <Select
                          multiple
                          value={formData.requisitosMinimos.headset.tiposConexion}
                          onChange={(e) => handleRequirementChange('headset', 'tiposConexion', e.target.value)}
                          label="Conectores Permitidos"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          <MenuItem value="USB">USB</MenuItem>
                          <MenuItem value="Bluetooth">Bluetooth</MenuItem>
                          <MenuItem value="3.5mm">3.5mm</MenuItem>
                          <MenuItem value="Plug">Plug</MenuItem>
                          <MenuItem value="QD">QD (Quick Disconnect)</MenuItem>
                          <MenuItem value="Base Inalámbrica">Base Inalámbrica</MenuItem>
                        </Select>
                      </FormControl>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Card sx={{ p: 2, border: '1px solid #e3f2fd', background: '#f8f9fa' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                        📋 Headsets Homologados Oficiales ({HEADSETS_HOMOLOGADOS.length} modelos)
                      </Typography>
                      <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Marca</strong></TableCell>
                                <TableCell><strong>Modelo</strong></TableCell>
                                <TableCell><strong>Conector</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {HEADSETS_HOMOLOGADOS.map((headset, index) => (
                                <TableRow key={index}>
                                  <TableCell>{headset.marca}</TableCell>
                                  <TableCell>{headset.modelo}</TableCell>
                                  <TableCell>{headset.conector}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                      <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#6c757d' }}>
                        Lista extraída del archivo oficial "Headset Homologados.xlsx" del pliego técnico
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, p: 2, background: '#fff3cd', borderRadius: 1 }}>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    onClick={() => {
                      handleInputChange('configuracionBloqueada', true);
                      handleInputChange('mostrarConfiguracion', false);
                    }}
                    sx={{ mr: 2 }}
                  >
                    🔒 Bloquear Configuración
                  </Button>
                  <Typography variant="caption" sx={{ color: '#856404' }}>
                    Al bloquear, otros usuarios no podrán modificar estos requisitos.
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };

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
    
    // Configuraciones de validación flexibles con múltiples opciones
    requisitosMinimos: initialData.requisitosMinimos || {
      procesador: {
        marcasAceptadas: ['Intel', 'AMD'], // Marcas permitidas
        modelosMinimos: ['i5', 'i7', 'Ryzen 5', 'Ryzen 7'], // Modelos mínimos
        velocidadMinima: 2.0, // GHz mínimos
        nucleosMinimos: 4 // Núcleos mínimos
      },
      memoria: {
        capacidadMinima: 8, // GB mínimos
        tiposAceptados: ['DDR4', 'DDR5'] // Tipos permitidos
      },
      almacenamiento: {
        // Múltiples opciones de almacenamiento válidas
        opcionesValidas: [
          { tipo: 'HDD', capacidadMinima: 512 }, // HDD mínimo 512GB
          { tipo: 'SSD', capacidadMinima: 256 }, // SSD mínimo 256GB
          { tipo: 'NVMe', capacidadMinima: 256 } // NVMe mínimo 256GB
        ],
        preferenciaTipos: ['SSD', 'NVMe', 'HDD'] // Orden de preferencia
      },
      sistemaOperativo: {
        versionesAceptadas: ['Windows 10', 'Windows 11'], // SO permitidos
        actualizacionesRequeridas: true,
        edicionesAceptadas: ['Pro', 'Enterprise', 'Home'] // Ediciones válidas
      },
      navegador: {
        navegadoresAceptados: [
          { nombre: 'Chrome', versionMinima: 100 },
          { nombre: 'Firefox', versionMinima: 90 },
          { nombre: 'Edge', versionMinima: 100 }
        ],
        actualizacionesRequeridas: true
      },
      conectividad: { // Solo para teletrabajo - múltiples umbrales
        tecnologias: [
          {
            tipo: '4G',
            velocidadMinimaDown: 25,
            velocidadMinimaUp: 5,
            formasConexion: ['WiFi', 'USB Modem']
          },
          {
            tipo: 'Cablemodem',
            velocidadMinimaDown: 50,
            velocidadMinimaUp: 10,
            formasConexion: ['WiFi', 'Ethernet']
          },
          {
            tipo: 'Fibra',
            velocidadMinimaDown: 100,
            velocidadMinimaUp: 50,
            formasConexion: ['WiFi', 'Ethernet']
          },
          {
            tipo: 'Satelital',
            velocidadMinimaDown: 15,
            velocidadMinimaUp: 3,
            formasConexion: ['WiFi', 'Ethernet']
          }
        ],
        latenciaMaxima: 150, // ms máximos
        estabilidadRequerida: 95 // % de uptime mínimo
      },
      headset: {
        marcasHomologadas: MARCAS_HEADSETS_HOMOLOGADAS,
        modelosHomologados: HEADSETS_HOMOLOGADOS,
        validacionEstricta: true, // Si debe validar contra lista oficial
        tiposConexion: ['USB', 'Bluetooth', '3.5mm', 'Plug', 'QD', 'Base Inalámbrica'],
        conCancelacionRuido: false // Opcional
      }
    },
    
    // Observaciones
    observaciones: initialData.observaciones || '',
    
    // Estado del procesamiento
    procesando: false,
    error: null,

    // Control de configuración de administrador
    mostrarConfiguracion: false,
    configuracionBloqueada: false // Se bloquea una vez definida por admin
  });

  const [previewData, setPreviewData] = useState([]);
  const [showNormalizationGraphics, setShowNormalizationGraphics] = useState(false);
  const [seccionId, setSeccionId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Obtener ID de la sección desde el backend
  useEffect(() => {
    const fetchSeccionId = async () => {
      try {
        const response = await httpClient.get('/documentos/secciones-tecnicas');
        const seccion = response.data.data.find(s => s.codigo === 'hardware_software');
        if (seccion) {
          setSeccionId(seccion.id);
        }
      } catch (error) {
        console.error('Error fetching seccion ID:', error);
      }
    };
    fetchSeccionId();
  }, []);

  // Cargar documentos existentes si hay auditData
  useEffect(() => {
    if (auditData?.id) {
      fetchExistingDocuments();
    }
  }, [auditData]);

  const fetchExistingDocuments = async () => {
    try {
      const response = await httpClient.get(`/documentos/auditoria/${auditData.id}`);
      const seccionData = response.data.documentos_por_seccion?.[seccionId];
      const docs = seccionData?.documentos || [];
      setUploadedFiles(docs);
    } catch (error) {
      console.error('Error fetching existing documents:', error);
    }
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    if (!auditData?.id) {
      alert('Error: No se encontró ID de auditoría');
      return;
    }

    if (!seccionId) {
      alert('Error: No se encontró ID de sección. Espere un momento e intente nuevamente.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append('auditoria_id', auditData.id);
      formDataToUpload.append('seccion_id', seccionId);
      formDataToUpload.append('observaciones', formData.observaciones || '');

      files.forEach((file) => {
        formDataToUpload.append('documentos', file);
      });

      const response = await httpClient.post('/documentos/cargar', formDataToUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        alert(`✅ ${response.data.documentos_guardados} documento(s) cargado(s) exitosamente`);
        await fetchExistingDocuments();
        event.target.value = '';
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      const errorMsg = error.response?.data?.error || error.message;
      alert('❌ Error al cargar documentos: ' + errorMsg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  const [uploadProgress, setUploadProgress] = useState(0);

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

  // Funciones de exportación
  const handleExportExcel = () => {
    if (!formData.datosNormalizados || formData.datosNormalizados.length === 0) {
      alert('No hay datos normalizados para exportar');
      return;
    }

    const filename = `Parque_Informatico_${new Date().toISOString().split('T')[0]}`;
    const success = exportToExcel(
      formData.datosNormalizados,
      formData.estadisticas,
      filename,
      { requisitosMinimos: formData.requisitosMinimos }
    );

    if (success) {
      alert('Archivo Excel exportado exitosamente');
    } else {
      alert('Error al exportar archivo Excel');
    }
  };

  const handleExportCSV = () => {
    if (!formData.datosNormalizados || formData.datosNormalizados.length === 0) {
      alert('No hay datos normalizados para exportar');
      return;
    }

    const filename = `Parque_Informatico_${new Date().toISOString().split('T')[0]}`;
    const success = exportToCSV(formData.datosNormalizados, filename);

    if (success) {
      alert('Archivo CSV exportado exitosamente');
    } else {
      alert('Error al exportar archivo CSV');
    }
  };

  const handleExportJSON = () => {
    if (!formData.datosNormalizados || formData.datosNormalizados.length === 0) {
      alert('No hay datos normalizados para exportar');
      return;
    }

    const filename = `Parque_Informatico_${new Date().toISOString().split('T')[0]}`;
    const success = exportToJSON(formData.datosNormalizados, formData.estadisticas, filename);

    if (success) {
      alert('Archivo JSON exportado exitosamente');
    } else {
      alert('Error al exportar archivo JSON');
    }
  };

  const handleExportComplianceReport = () => {
    if (!formData.datosNormalizados || formData.datosNormalizados.length === 0) {
      alert('No hay datos normalizados para exportar');
      return;
    }

    const filename = `Reporte_Cumplimiento_${new Date().toISOString().split('T')[0]}`;
    const success = generateComplianceReport(formData.datosNormalizados, formData.estadisticas, filename);

    if (success) {
      alert('Reporte de cumplimiento generado exitosamente');
    } else {
      alert('Error al generar reporte de cumplimiento');
    }
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
      const equiposNoCumplen = formData.estadisticas.equiposNoCumplen || 0;
      const totalItems = formData.estadisticas.totalRecords;

      if (equiposNoCumplen > 0) {
        status = 'warning';
        completionPercentage = Math.max(70, ((totalItems - equiposNoCumplen) / totalItems) * 100);
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

        {/* Configuración de Requisitos Mínimos (Solo Administrador) */}
        {renderRequisitosMinimoConfig()}

        {/* Header con controles principales */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="primary">
                  Inventario de Hardware y Software
                </Typography>
                {isAdmin && (
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
                )}
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


        {/* Información de la Planilla Excel */}
        <Grid item xs={12}>
          <Card sx={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: THEME_COLORS.error.main, fontWeight: 500 }}>
                📊 PLANILLA EXCEL OBLIGATORIA
              </Typography>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Especificaciones técnicas del archivo requerido:
                </Typography>
                <Typography component="div" variant="body2">
                  • <strong>Formato:</strong> .xlsx o .xls<br/>
                  • <strong>Campos obligatorios:</strong> Hostname, Procesador, RAM, Disco, SO, Navegador, Headset<br/>
                  • <strong>Para Home Office agregar:</strong> Usuario TECO, Nombre ISP, Tipo de conexión, Velocidad Down/Up<br/>
                  • Debe incluir membrete del sitio auditado
                </Typography>
              </Alert>
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
                        {formData.estadisticas.totalRecords || formData.datosNormalizados.length}
                      </Typography>
                      <Typography variant="body2">Total de Equipos</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                      <Typography variant="h4" color="success.main">
                        {formData.estadisticas.equiposCumplen || 0}
                      </Typography>
                      <Typography variant="body2">Equipos Conformes</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50' }}>
                      <Typography variant="h4" color="error.main">
                        {formData.estadisticas.equiposNoCumplen || 0}
                      </Typography>
                      <Typography variant="body2">Equipos No Conformes</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
                      <Typography variant="h4" color="info.main">
                        {formData.estadisticas.porcentajeCumplimiento || 0}%
                      </Typography>
                      <Typography variant="body2">% Cumplimiento</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Estadísticas detalladas por componente */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: THEME_COLORS.grey[600] }}>
                    Análisis por Componente
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: THEME_COLORS.grey[100] }}>
                        <Typography variant="subtitle2" gutterBottom>
                          💻 Procesadores
                        </Typography>
                        <Typography variant="body2">
                          <span style={{ color: 'green' }}>✓ Conformes: {formData.estadisticas.procesadorStats?.passed || 0}</span><br/>
                          <span style={{ color: 'red' }}>✗ No conformes: {formData.estadisticas.procesadorStats?.failed || 0}</span>
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: THEME_COLORS.grey[100] }}>
                        <Typography variant="subtitle2" gutterBottom>
                          🧠 Memoria RAM
                        </Typography>
                        <Typography variant="body2">
                          <span style={{ color: 'green' }}>✓ Conformes: {formData.estadisticas.memoriaStats?.passed || 0}</span><br/>
                          <span style={{ color: 'red' }}>✗ No conformes: {formData.estadisticas.memoriaStats?.failed || 0}</span>
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: THEME_COLORS.grey[100] }}>
                        <Typography variant="subtitle2" gutterBottom>
                          💾 Almacenamiento
                        </Typography>
                        <Typography variant="body2">
                          <span style={{ color: 'green' }}>✓ Conformes: {formData.estadisticas.almacenamientoStats?.passed || 0}</span><br/>
                          <span style={{ color: 'red' }}>✗ No conformes: {formData.estadisticas.almacenamientoStats?.failed || 0}</span>
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
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

        {/* Botones de Exportación */}
        {formData.datosNormalizados && formData.datosNormalizados.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%)', border: '1px solid #bbdefb' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ExportIcon />
                  Exportar Datos Normalizados
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                  Los datos han sido procesados y normalizados según los requisitos mínimos configurados.
                  Puede exportar los resultados en diferentes formatos para su análisis.
                </Alert>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleExportExcel}
                      sx={{
                        background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
                        '&:hover': { background: 'linear-gradient(45deg, #388e3c 30%, #66bb6a 90%)' }
                      }}
                    >
                      Excel (.xlsx)
                    </Button>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleExportCSV}
                      sx={{
                        background: 'linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)',
                        '&:hover': { background: 'linear-gradient(45deg, #f57c00 30%, #ffa726 90%)' }
                      }}
                    >
                      CSV
                    </Button>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleExportJSON}
                      sx={{
                        background: 'linear-gradient(45deg, #9c27b0 30%, #ba68c8 90%)',
                        '&:hover': { background: 'linear-gradient(45deg, #7b1fa2 30%, #ab47bc 90%)' }
                      }}
                    >
                      JSON
                    </Button>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AssessmentIcon />}
                      onClick={handleExportComplianceReport}
                      sx={{
                        background: 'linear-gradient(45deg, #f44336 30%, #ef5350 90%)',
                        '&:hover': { background: 'linear-gradient(45deg, #d32f2f 30%, #e53935 90%)' }
                      }}
                    >
                      Reporte Cumplimiento
                    </Button>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2, p: 2, background: 'rgba(25, 118, 210, 0.08)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: THEME_COLORS.primary.main, fontWeight: 500 }}>
                    📊 Resumen del análisis:
                  </Typography>
                  {formData.estadisticas && (
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2">
                          <strong>Total equipos:</strong> {formData.datosNormalizados.length}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2">
                          <strong>Cumplen:</strong> {formData.estadisticas.equiposCumplen || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2">
                          <strong>No cumplen:</strong> {formData.estadisticas.equiposNoCumplen || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2">
                          <strong>% Cumplimiento:</strong> {formData.estadisticas.porcentajeCumplimiento || 0}%
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </Box>
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