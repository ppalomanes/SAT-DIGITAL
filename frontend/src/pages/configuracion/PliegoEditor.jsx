import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Tabs,
  Tab,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  IconButton,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import pliegosService from '../../services/pliegosService';
import HelpTooltip from '../../components/common/HelpTooltip';

/**
 * PliegoEditor - Editor completo de Pliegos de Requisitos
 *
 * Soporta dos modos:
 * - Creación: /configuracion/nuevo
 * - Edición: /configuracion/editar/:id
 *
 * Estructura de tabs:
 * 1. Información General
 * 2. Parque Informático
 * 3. Conectividad
 * 4. Infraestructura
 * 5. Seguridad
 * 6. Documentación
 * 7. Personal
 */
const PliegoEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Estados principales
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Datos del pliego
  const [formData, setFormData] = useState({
    // Información general
    codigo: '',
    nombre: '',
    descripcion: '',
    vigencia_desde: '',
    vigencia_hasta: '',
    estado: 'borrador',
    es_vigente: false,

    // Secciones técnicas (JSON)
    parque_informatico: {
      // Procesador - Múltiples selecciones permitidas
      procesadores_aceptados: [
        // Ejemplo: { marca: 'Intel', familia_min: 'Core i5', aceptar_superior: true }
        // Se pueden agregar múltiples: Intel i5+ Y AMD Ryzen 5+
      ],

      // RAM - Lógica de mínimo y superiores
      ram_minima_gb: 16, // Mínimo requerido, valores superiores siempre aceptados

      // Disco (array porque puede haber múltiples)
      discos: [
        { capacidad_gb: 256, tipo: 'SSD' }
      ],

      // Sistema Operativo
      sistema_operativo: 'Windows 11',
      sistema_operativo_version_min: '0', // 0 = cualquier versión

      // Navegador
      navegadores: [
        { marca: 'Chrome', version_minima: '120' },
        { marca: 'Edge', version_minima: '120' }
      ]
    },
    conectividad: {
      // ISP
      nombre_isp: '', // Puede estar vacío

      // Tipos de conexión (array)
      tipos_conexion: ['Cable', 'Fibra'], // Cable, 4G, Fibra, Satelital

      // Velocidades
      velocidad_bajada_min_mbps: 15,
      velocidad_subida_min_mbps: 6
    },
    infraestructura: {
      // UPS
      ups_requerido: true,
      ups_capacidad_min_va: 1000,
      ups_vida_util_bateria_anos: 3,

      // Generador
      generador_requerido: false,
      generador_vida_util_bateria_anos: 5,

      // Aire Acondicionado
      aire_acondicionado_requerido: true
    },
    seguridad: {
      antivirus_requerido: true,
      firewall_requerido: true,
      acceso_fisico_controlado: true,
      camaras_seguridad_requeridas: false
    },
    documentacion: {
      planos_topologia_requeridos: true,
      inventario_actualizado: true,
      certificaciones_cableado: true,
      manuales_equipos: false
    },
    personal: {
      personal_tecnico_minimo: 2,
      capacitacion_anual_horas: 40,
      certificaciones_requeridas: []
    }
  });

  // Cargar datos si estamos editando
  useEffect(() => {
    if (isEditMode) {
      cargarPliego();
    }
  }, [id]);

  const cargarPliego = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pliegosService.obtenerPliego(id);

      // Merge los datos cargados con los valores por defecto
      setFormData({
        codigo: response.data.codigo || '',
        nombre: response.data.nombre || '',
        descripcion: response.data.descripcion || '',
        vigencia_desde: response.data.vigencia_desde || '',
        vigencia_hasta: response.data.vigencia_hasta || '',
        estado: response.data.estado || 'borrador',
        es_vigente: response.data.es_vigente || false,
        parque_informatico: response.data.parque_informatico || formData.parque_informatico,
        conectividad: response.data.conectividad || formData.conectividad,
        infraestructura: response.data.infraestructura || formData.infraestructura,
        seguridad: response.data.seguridad || formData.seguridad,
        documentacion: response.data.documentacion || formData.documentacion,
        personal: response.data.personal || formData.personal
      });
    } catch (err) {
      console.error('Error al cargar pliego:', err);
      setError('Error al cargar el pliego. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSectionChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayAdd = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...(prev[section][field] || []), value]
      }
    }));
  };

  const handleArrayRemove = (section, field, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validaciones básicas
      if (!formData.codigo || !formData.nombre || !formData.vigencia_desde) {
        setError('Los campos Código, Nombre y Fecha de Vigencia son obligatorios.');
        return;
      }

      setSaving(true);
      setError(null);

      if (isEditMode) {
        await pliegosService.actualizarPliego(id, formData);
      } else {
        await pliegosService.crearPliego(formData);
      }

      navigate('/configuracion');
    } catch (err) {
      console.error('Error al guardar pliego:', err);
      setError(err.response?.data?.message || 'Error al guardar el pliego. Por favor, intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <IconButton onClick={() => navigate('/configuracion')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEditMode ? 'Editar Pliego' : 'Nuevo Pliego'}
          </Typography>
          <HelpTooltip
            title="Editor de Pliegos"
            content={`Define los requisitos técnicos que aplicarán a períodos completos de auditoría.\n\nCompleta cada sección con los umbrales mínimos requeridos.`}
            placement="right"
          />
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="General" />
          <Tab label="Parque Informático" />
          <Tab label="Conectividad" />
          <Tab label="Infraestructura" />
          <Tab label="Seguridad" />
          <Tab label="Documentación" />
          <Tab label="Personal" />
        </Tabs>

        {/* Tab Panels */}
        <Box sx={{ p: 3 }}>
          {/* TAB 0: Información General */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Información General
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Código"
                    value={formData.codigo}
                    onChange={(e) => handleChange('codigo', e.target.value)}
                    fullWidth
                    required
                    helperText="Código único del pliego (ej: 2025-1, DEFAULT-2025)"
                    disabled={isEditMode}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={formData.estado}
                      onChange={(e) => handleChange('estado', e.target.value)}
                      label="Estado"
                    >
                      <MenuItem value="borrador">Borrador</MenuItem>
                      <MenuItem value="activo">Activo</MenuItem>
                      <MenuItem value="vencido">Vencido</MenuItem>
                      <MenuItem value="archivado">Archivado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Nombre"
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    fullWidth
                    required
                    helperText="Nombre descriptivo del pliego"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Descripción"
                    value={formData.descripcion}
                    onChange={(e) => handleChange('descripcion', e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    helperText="Descripción detallada del alcance y aplicación del pliego"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Vigencia Desde"
                    type="date"
                    value={formData.vigencia_desde}
                    onChange={(e) => handleChange('vigencia_desde', e.target.value)}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Vigencia Hasta"
                    type="date"
                    value={formData.vigencia_hasta}
                    onChange={(e) => handleChange('vigencia_hasta', e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    helperText="Dejar vacío para vigencia indefinida"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 1: Parque Informático */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Parque Informático
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* Procesador */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Procesador (Múltiples selecciones permitidas)
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Selecciona uno o más procesadores aceptables. Ejemplo: Intel Core i5+ OR AMD Ryzen 5+
                  </Alert>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Intel
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.parque_informatico.procesadores_aceptados.some(
                            p => p.marca === 'Intel' && p.familia_min === 'Core i5'
                          )}
                          onChange={(e) => {
                            let nuevos = [...formData.parque_informatico.procesadores_aceptados];
                            if (e.target.checked) {
                              nuevos.push({ marca: 'Intel', familia_min: 'Core i5', aceptar_superior: true });
                            } else {
                              nuevos = nuevos.filter(p => !(p.marca === 'Intel' && p.familia_min === 'Core i5'));
                            }
                            handleSectionChange('parque_informatico', 'procesadores_aceptados', nuevos);
                          }}
                        />
                      }
                      label="Intel Core i5 o superior"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.parque_informatico.procesadores_aceptados.some(
                            p => p.marca === 'Intel' && p.familia_min === 'Core i7'
                          )}
                          onChange={(e) => {
                            let nuevos = [...formData.parque_informatico.procesadores_aceptados];
                            if (e.target.checked) {
                              nuevos.push({ marca: 'Intel', familia_min: 'Core i7', aceptar_superior: true });
                            } else {
                              nuevos = nuevos.filter(p => !(p.marca === 'Intel' && p.familia_min === 'Core i7'));
                            }
                            handleSectionChange('parque_informatico', 'procesadores_aceptados', nuevos);
                          }}
                        />
                      }
                      label="Intel Core i7 o superior"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.parque_informatico.procesadores_aceptados.some(
                            p => p.marca === 'Intel' && p.familia_min === 'Core i9'
                          )}
                          onChange={(e) => {
                            let nuevos = [...formData.parque_informatico.procesadores_aceptados];
                            if (e.target.checked) {
                              nuevos.push({ marca: 'Intel', familia_min: 'Core i9', aceptar_superior: true });
                            } else {
                              nuevos = nuevos.filter(p => !(p.marca === 'Intel' && p.familia_min === 'Core i9'));
                            }
                            handleSectionChange('parque_informatico', 'procesadores_aceptados', nuevos);
                          }}
                        />
                      }
                      label="Intel Core i9 o superior"
                    />
                  </FormGroup>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    AMD
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.parque_informatico.procesadores_aceptados.some(
                            p => p.marca === 'AMD' && p.familia_min === 'Ryzen 5'
                          )}
                          onChange={(e) => {
                            let nuevos = [...formData.parque_informatico.procesadores_aceptados];
                            if (e.target.checked) {
                              nuevos.push({ marca: 'AMD', familia_min: 'Ryzen 5', aceptar_superior: true });
                            } else {
                              nuevos = nuevos.filter(p => !(p.marca === 'AMD' && p.familia_min === 'Ryzen 5'));
                            }
                            handleSectionChange('parque_informatico', 'procesadores_aceptados', nuevos);
                          }}
                        />
                      }
                      label="AMD Ryzen 5 o superior"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.parque_informatico.procesadores_aceptados.some(
                            p => p.marca === 'AMD' && p.familia_min === 'Ryzen 7'
                          )}
                          onChange={(e) => {
                            let nuevos = [...formData.parque_informatico.procesadores_aceptados];
                            if (e.target.checked) {
                              nuevos.push({ marca: 'AMD', familia_min: 'Ryzen 7', aceptar_superior: true });
                            } else {
                              nuevos = nuevos.filter(p => !(p.marca === 'AMD' && p.familia_min === 'Ryzen 7'));
                            }
                            handleSectionChange('parque_informatico', 'procesadores_aceptados', nuevos);
                          }}
                        />
                      }
                      label="AMD Ryzen 7 o superior"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.parque_informatico.procesadores_aceptados.some(
                            p => p.marca === 'AMD' && p.familia_min === 'Ryzen 9'
                          )}
                          onChange={(e) => {
                            let nuevos = [...formData.parque_informatico.procesadores_aceptados];
                            if (e.target.checked) {
                              nuevos.push({ marca: 'AMD', familia_min: 'Ryzen 9', aceptar_superior: true });
                            } else {
                              nuevos = nuevos.filter(p => !(p.marca === 'AMD' && p.familia_min === 'Ryzen 9'));
                            }
                            handleSectionChange('parque_informatico', 'procesadores_aceptados', nuevos);
                          }}
                        />
                      }
                      label="AMD Ryzen 9 o superior"
                    />
                  </FormGroup>
                </Grid>

                {/* RAM */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Memoria RAM (Capacidad Mínima)
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Especifica la capacidad mínima requerida. Valores superiores siempre serán aceptados automáticamente.
                  </Alert>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Capacidad RAM Mínima (GB)"
                    type="number"
                    value={formData.parque_informatico.ram_minima_gb}
                    onChange={(e) => handleSectionChange('parque_informatico', 'ram_minima_gb', parseInt(e.target.value))}
                    fullWidth
                    InputProps={{ inputProps: { min: 1 } }}
                    helperText="Ej: 16 (acepta 16GB, 32GB, 64GB, etc.)"
                  />
                </Grid>

                {/* Discos */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Discos (Almacenamiento)
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Puede haber múltiples discos. Especifica los requisitos mínimos.
                  </Alert>
                </Grid>

                {formData.parque_informatico.discos?.map((disco, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={12} md={5}>
                      <TextField
                        label={`Disco ${index + 1} - Capacidad (GB)`}
                        type="number"
                        value={disco.capacidad_gb}
                        onChange={(e) => {
                          const nuevosDiscos = [...formData.parque_informatico.discos];
                          nuevosDiscos[index].capacidad_gb = parseInt(e.target.value);
                          handleSectionChange('parque_informatico', 'discos', nuevosDiscos);
                        }}
                        fullWidth
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>

                    <Grid item xs={12} md={5}>
                      <FormControl fullWidth>
                        <InputLabel>Tipo de Disco</InputLabel>
                        <Select
                          value={disco.tipo}
                          onChange={(e) => {
                            const nuevosDiscos = [...formData.parque_informatico.discos];
                            nuevosDiscos[index].tipo = e.target.value;
                            handleSectionChange('parque_informatico', 'discos', nuevosDiscos);
                          }}
                          label="Tipo de Disco"
                        >
                          <MenuItem value="HDD">HDD</MenuItem>
                          <MenuItem value="SSD">SSD</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        onClick={() => {
                          const nuevosDiscos = formData.parque_informatico.discos.filter((_, i) => i !== index);
                          handleSectionChange('parque_informatico', 'discos', nuevosDiscos);
                        }}
                        disabled={formData.parque_informatico.discos.length === 1}
                      >
                        Eliminar
                      </Button>
                    </Grid>
                  </React.Fragment>
                ))}

                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      const nuevosDiscos = [...formData.parque_informatico.discos, { capacidad_gb: 256, tipo: 'SSD' }];
                      handleSectionChange('parque_informatico', 'discos', nuevosDiscos);
                    }}
                  >
                    Agregar Disco
                  </Button>
                </Grid>

                {/* Sistema Operativo */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Sistema Operativo
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Sistema Operativo"
                    value={formData.parque_informatico.sistema_operativo}
                    onChange={(e) => handleSectionChange('parque_informatico', 'sistema_operativo', e.target.value)}
                    fullWidth
                    helperText="Ej: Windows 11"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Versión Mínima"
                    value={formData.parque_informatico.sistema_operativo_version_min}
                    onChange={(e) => handleSectionChange('parque_informatico', 'sistema_operativo_version_min', e.target.value)}
                    fullWidth
                    helperText="Formato: ###.##.### (Ej: 22000.0.0) o 0 para cualquier versión"
                  />
                </Grid>

                {/* Navegadores */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Navegadores Permitidos
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Versiones permitidas: hasta la anterior a la más actual en la fecha de auditoría
                  </Alert>
                </Grid>

                {formData.parque_informatico.navegadores?.map((nav, index) => (
                  <React.Fragment key={index}>
                    <Grid item xs={12} md={5}>
                      <TextField
                        label={`Navegador ${index + 1}`}
                        value={nav.marca}
                        onChange={(e) => {
                          const nuevosNav = [...formData.parque_informatico.navegadores];
                          nuevosNav[index].marca = e.target.value;
                          handleSectionChange('parque_informatico', 'navegadores', nuevosNav);
                        }}
                        fullWidth
                        helperText="Ej: Chrome, Edge, Firefox"
                      />
                    </Grid>

                    <Grid item xs={12} md={5}>
                      <TextField
                        label="Versión Mínima"
                        value={nav.version_minima || ''}
                        onChange={(e) => {
                          const nuevosNav = [...formData.parque_informatico.navegadores];
                          nuevosNav[index].version_minima = e.target.value;
                          handleSectionChange('parque_informatico', 'navegadores', nuevosNav);
                        }}
                        fullWidth
                        type="text"
                        placeholder="141"
                        helperText="Número de versión (ej: 141.0.7390.123 → validar 141)"
                      />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        onClick={() => {
                          const nuevosNav = formData.parque_informatico.navegadores.filter((_, i) => i !== index);
                          handleSectionChange('parque_informatico', 'navegadores', nuevosNav);
                        }}
                        disabled={formData.parque_informatico.navegadores.length === 1}
                        sx={{ height: '56px' }}
                      >
                        Eliminar
                      </Button>
                    </Grid>
                  </React.Fragment>
                ))}

                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      const nuevosNav = [...formData.parque_informatico.navegadores, { marca: '', version_minima: '' }];
                      handleSectionChange('parque_informatico', 'navegadores', nuevosNav);
                    }}
                  >
                    Agregar Navegador
                  </Button>
                </Grid>

              </Grid>
            </Box>
          )}

          {/* TAB 2: Conectividad */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Conectividad
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* ISP */}
                <Grid item xs={12}>
                  <TextField
                    label="Nombre ISP"
                    value={formData.conectividad.nombre_isp}
                    onChange={(e) => handleSectionChange('conectividad', 'nombre_isp', e.target.value)}
                    fullWidth
                    helperText="Puede estar vacío si no se requiere un ISP específico"
                  />
                </Grid>

                {/* Tipos de Conexión */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Tipos de Conexión Permitidos
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Selecciona los tipos de conexión aceptables. Puede estar vacío o seleccionar múltiples opciones.
                  </Alert>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Tipos de Conexión</InputLabel>
                    <Select
                      multiple
                      value={formData.conectividad.tipos_conexion}
                      onChange={(e) => handleSectionChange('conectividad', 'tipos_conexion', e.target.value)}
                      label="Tipos de Conexión"
                      renderValue={(selected) => selected.join(', ')}
                    >
                      <MenuItem value="Cable">Cable</MenuItem>
                      <MenuItem value="4G">4G</MenuItem>
                      <MenuItem value="Fibra">Fibra</MenuItem>
                      <MenuItem value="Satelital">Satelital</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Velocidades */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Velocidades Mínimas Requeridas
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Velocidad Bajada Mínima (Mbps)"
                    type="number"
                    value={formData.conectividad.velocidad_bajada_min_mbps}
                    onChange={(e) => handleSectionChange('conectividad', 'velocidad_bajada_min_mbps', parseFloat(e.target.value))}
                    fullWidth
                    InputProps={{ inputProps: { min: 0.1, step: 0.1 } }}
                    helperText="Mínimo recomendado: 15 Mbps"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Velocidad Subida Mínima (Mbps)"
                    type="number"
                    value={formData.conectividad.velocidad_subida_min_mbps}
                    onChange={(e) => handleSectionChange('conectividad', 'velocidad_subida_min_mbps', parseFloat(e.target.value))}
                    fullWidth
                    InputProps={{ inputProps: { min: 0.1, step: 0.1 } }}
                    helperText="Mínimo recomendado: 6 Mbps"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 3: Infraestructura */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Infraestructura
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* UPS */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    UPS (Uninterruptible Power Supply)
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>UPS Requerido</InputLabel>
                    <Select
                      value={formData.infraestructura.ups_requerido}
                      onChange={(e) => handleSectionChange('infraestructura', 'ups_requerido', e.target.value)}
                      label="UPS Requerido"
                    >
                      <MenuItem value={true}>Sí</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Capacidad Mínima UPS (VA)"
                    type="number"
                    value={formData.infraestructura.ups_capacidad_min_va}
                    onChange={(e) => handleSectionChange('infraestructura', 'ups_capacidad_min_va', parseInt(e.target.value))}
                    fullWidth
                    disabled={!formData.infraestructura.ups_requerido}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Vida Útil Batería UPS (años)"
                    type="number"
                    value={formData.infraestructura.ups_vida_util_bateria_anos}
                    onChange={(e) => handleSectionChange('infraestructura', 'ups_vida_util_bateria_anos', parseInt(e.target.value))}
                    fullWidth
                    disabled={!formData.infraestructura.ups_requerido}
                    InputProps={{ inputProps: { min: 1 } }}
                    helperText="Vida útil esperada de la batería"
                  />
                </Grid>

                {/* Generador */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Generador Eléctrico
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Generador Requerido</InputLabel>
                    <Select
                      value={formData.infraestructura.generador_requerido}
                      onChange={(e) => handleSectionChange('infraestructura', 'generador_requerido', e.target.value)}
                      label="Generador Requerido"
                    >
                      <MenuItem value={true}>Sí</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Vida Útil Batería Generador (años)"
                    type="number"
                    value={formData.infraestructura.generador_vida_util_bateria_anos}
                    onChange={(e) => handleSectionChange('infraestructura', 'generador_vida_util_bateria_anos', parseInt(e.target.value))}
                    fullWidth
                    disabled={!formData.infraestructura.generador_requerido}
                    InputProps={{ inputProps: { min: 1 } }}
                    helperText="Vida útil esperada de la batería"
                  />
                </Grid>

                {/* Aire Acondicionado */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Climatización
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Aire Acondicionado Requerido</InputLabel>
                    <Select
                      value={formData.infraestructura.aire_acondicionado_requerido}
                      onChange={(e) => handleSectionChange('infraestructura', 'aire_acondicionado_requerido', e.target.value)}
                      label="Aire Acondicionado Requerido"
                    >
                      <MenuItem value={true}>Sí</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 4: Seguridad */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Seguridad
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Antivirus Requerido</InputLabel>
                    <Select
                      value={formData.seguridad.antivirus_requerido}
                      onChange={(e) => handleSectionChange('seguridad', 'antivirus_requerido', e.target.value)}
                      label="Antivirus Requerido"
                    >
                      <MenuItem value={true}>Sí</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Firewall Requerido</InputLabel>
                    <Select
                      value={formData.seguridad.firewall_requerido}
                      onChange={(e) => handleSectionChange('seguridad', 'firewall_requerido', e.target.value)}
                      label="Firewall Requerido"
                    >
                      <MenuItem value={true}>Sí</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Acceso Físico Controlado</InputLabel>
                    <Select
                      value={formData.seguridad.acceso_fisico_controlado}
                      onChange={(e) => handleSectionChange('seguridad', 'acceso_fisico_controlado', e.target.value)}
                      label="Acceso Físico Controlado"
                    >
                      <MenuItem value={true}>Sí</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Cámaras de Seguridad Requeridas</InputLabel>
                    <Select
                      value={formData.seguridad.camaras_seguridad_requeridas}
                      onChange={(e) => handleSectionChange('seguridad', 'camaras_seguridad_requeridas', e.target.value)}
                      label="Cámaras de Seguridad Requeridas"
                    >
                      <MenuItem value={true}>Sí</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 5: Documentación */}
          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Documentación
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Planos de Topología Requeridos</InputLabel>
                    <Select
                      value={formData.documentacion.planos_topologia_requeridos}
                      onChange={(e) => handleSectionChange('documentacion', 'planos_topologia_requeridos', e.target.value)}
                      label="Planos de Topología Requeridos"
                    >
                      <MenuItem value={true}>Sí</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Inventario Actualizado</InputLabel>
                    <Select
                      value={formData.documentacion.inventario_actualizado}
                      onChange={(e) => handleSectionChange('documentacion', 'inventario_actualizado', e.target.value)}
                      label="Inventario Actualizado"
                    >
                      <MenuItem value={true}>Sí</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Certificaciones de Cableado</InputLabel>
                    <Select
                      value={formData.documentacion.certificaciones_cableado}
                      onChange={(e) => handleSectionChange('documentacion', 'certificaciones_cableado', e.target.value)}
                      label="Certificaciones de Cableado"
                    >
                      <MenuItem value={true}>Sí</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Manuales de Equipos</InputLabel>
                    <Select
                      value={formData.documentacion.manuales_equipos}
                      onChange={(e) => handleSectionChange('documentacion', 'manuales_equipos', e.target.value)}
                      label="Manuales de Equipos"
                    >
                      <MenuItem value={true}>Sí</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 6: Personal */}
          {activeTab === 6 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Personal
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Personal Técnico Mínimo"
                    type="number"
                    value={formData.personal.personal_tecnico_minimo}
                    onChange={(e) => handleSectionChange('personal', 'personal_tecnico_minimo', parseInt(e.target.value))}
                    fullWidth
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Capacitación Anual (Horas)"
                    type="number"
                    value={formData.personal.capacitacion_anual_horas}
                    onChange={(e) => handleSectionChange('personal', 'capacitacion_anual_horas', parseInt(e.target.value))}
                    fullWidth
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Certificaciones Requeridas
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                    {formData.personal.certificaciones_requeridas?.map((cert, index) => (
                      <Chip
                        key={index}
                        label={cert}
                        onDelete={() => handleArrayRemove('personal', 'certificaciones_requeridas', index)}
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      label="Nueva Certificación"
                      size="small"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          handleArrayAdd('personal', 'certificaciones_requeridas', e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                      helperText="Presiona Enter para agregar"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>

        {/* Actions */}
        <Divider />
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/configuracion')}
            disabled={saving}
          >
            Cancelar
          </Button>

          <Stack direction="row" spacing={2}>
            {activeTab > 0 && (
              <Button
                variant="outlined"
                onClick={() => setActiveTab(activeTab - 1)}
              >
                Anterior
              </Button>
            )}

            {activeTab < 6 ? (
              <Button
                variant="contained"
                onClick={() => setActiveTab(activeTab + 1)}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear Pliego')}
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default PliegoEditor;
