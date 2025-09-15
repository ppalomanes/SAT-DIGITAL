import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Card,
  CardContent,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Paper,
  Divider,
  Switch,
  Rating
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Security as SecurityIcon,
  Thermostat as ThermoIcon,
  Power as PowerIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  PhotoCamera as PhotoIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

const CuartoTecnologiaForm = ({ onSave, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    // Acceso y Seguridad
    acceso: {
      sistemaBiometrico: initialData.acceso?.sistemaBiometrico || false,
      marcaModelo: initialData.acceso?.marcaModelo || '',
      funcionamiento: initialData.acceso?.funcionamiento || 'bueno',
      observaciones: initialData.acceso?.observaciones || ''
    },
    
    // Infraestructura Física
    infraestructura: {
      tipoSala: initialData.infraestructura?.tipoSala || '',
      dimensiones: initialData.infraestructura?.dimensiones || '',
      pisoElevado: initialData.infraestructura?.pisoElevado || false,
      techoFalso: initialData.infraestructura?.techoFalso || false,
      iluminacion: initialData.infraestructura?.iluminacion || 'buena',
      ventilacion: initialData.infraestructura?.ventilacion || 'adecuada'
    },
    
    // Sistema de Energía
    energia: {
      upsDisponibles: initialData.energia?.upsDisponibles || 0,
      upsEnUso: initialData.energia?.upsEnUso || 0,
      marcaModeloUPS: initialData.energia?.marcaModeloUPS || '',
      autonomiaUPS: initialData.energia?.autonomiaUPS || '',
      generador: initialData.energia?.generador || false,
      marcaModeloGenerador: initialData.energia?.marcaModeloGenerador || '',
      combustibleGenerador: initialData.energia?.combustibleGenerador || '',
      tableroTransferencia: initialData.energia?.tableroTransferencia || false,
      estadoTablero: initialData.energia?.estadoTablero || 'bueno'
    },
    
    // Monitoreo y Sensores
    monitoreo: {
      sensorHumo: initialData.monitoreo?.sensorHumo || false,
      marcaSensorHumo: initialData.monitoreo?.marcaSensorHumo || '',
      sensorTemperatura: initialData.monitoreo?.sensorTemperatura || false,
      marcaSensorTemp: initialData.monitoreo?.marcaSensorTemp || '',
      temperaturaActual: initialData.monitoreo?.temperaturaActual || '',
      sistemaAlertas: initialData.monitoreo?.sistemaAlertas || false,
      tipoAlertas: initialData.monitoreo?.tipoAlertas || [],
      appMovil: initialData.monitoreo?.appMovil || false,
      nombreApp: initialData.monitoreo?.nombreApp || ''
    },
    
    // Extinción de Incendios
    extincion: {
      matafuegos: initialData.extincion?.matafuegos || [],
      sistemaRociadores: initialData.extincion?.sistemaRociadores || false,
      sistemaGasInerte: initialData.extincion?.sistemaGasInerte || false,
      senalizacionSalidas: initialData.extincion?.senalizacionSalidas || false,
      planEvacuacion: initialData.extincion?.planEvacuacion || false
    },
    
    // IDF y Distribución
    idf: {
      cantidadIDF: initialData.idf?.cantidadIDF || 0,
      ubicaciones: initialData.idf?.ubicaciones || [],
      estadoIDF: initialData.idf?.estadoIDF || [],
      cabledoOrganizado: initialData.idf?.cabledoOrganizado || false,
      etiquetado: initialData.idf?.etiquetado || false,
      seguridadIDF: initialData.idf?.seguridadIDF || 'basica'
    },
    
    // Observaciones y Mejoras
    observaciones: {
      observacionesGenerales: initialData.observaciones?.observacionesGenerales || '',
      mejorasIdentificadas: initialData.observaciones?.mejorasIdentificadas || [],
      recomendaciones: initialData.observaciones?.recomendaciones || '',
      calificacionGeneral: initialData.observaciones?.calificacionGeneral || 0
    },
    
    // Evidencias Fotográficas
    evidencias: initialData.evidencias || []
  });

  const [errors, setErrors] = useState({});
  const [nuevaObservacion, setNuevaObservacion] = useState('');
  const [nuevoMatafuego, setNuevoMatafuego] = useState({
    ubicacion: '',
    tipo: '',
    vencimiento: '',
    estado: 'bueno'
  });

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: Array.isArray(value) ? value : [value]
      }
    }));
  };

  const agregarMatafuego = () => {
    if (nuevoMatafuego.ubicacion && nuevoMatafuego.tipo) {
      setFormData(prev => ({
        ...prev,
        extincion: {
          ...prev.extincion,
          matafuegos: [...prev.extincion.matafuegos, { ...nuevoMatafuego, id: Date.now() }]
        }
      }));
      setNuevoMatafuego({ ubicacion: '', tipo: '', vencimiento: '', estado: 'bueno' });
    }
  };

  const eliminarMatafuego = (id) => {
    setFormData(prev => ({
      ...prev,
      extincion: {
        ...prev.extincion,
        matafuegos: prev.extincion.matafuegos.filter(mat => mat.id !== id)
      }
    }));
  };

  const agregarMejora = () => {
    if (nuevaObservacion.trim()) {
      setFormData(prev => ({
        ...prev,
        observaciones: {
          ...prev.observaciones,
          mejorasIdentificadas: [...prev.observaciones.mejorasIdentificadas, nuevaObservacion.trim()]
        }
      }));
      setNuevaObservacion('');
    }
  };

  const eliminarMejora = (index) => {
    setFormData(prev => ({
      ...prev,
      observaciones: {
        ...prev.observaciones,
        mejorasIdentificadas: prev.observaciones.mejorasIdentificadas.filter((_, i) => i !== index)
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.infraestructura.tipoSala) {
      newErrors['infraestructura.tipoSala'] = 'Tipo de sala es requerido';
    }
    
    if (formData.energia.upsEnUso > formData.energia.upsDisponibles) {
      newErrors['energia.upsEnUso'] = 'UPS en uso no puede ser mayor a UPS disponibles';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calcularPuntuacion = () => {
    let puntos = 0;
    let maxPuntos = 0;
    
    // Acceso y Seguridad (15%)
    maxPuntos += 15;
    if (formData.acceso.sistemaBiometrico) puntos += 15;
    else if (formData.acceso.funcionamiento === 'bueno') puntos += 10;
    
    // Energía (25%)
    maxPuntos += 25;
    if (formData.energia.upsEnUso >= 2) puntos += 15;
    if (formData.energia.generador) puntos += 10;
    
    // Monitoreo (20%)
    maxPuntos += 20;
    if (formData.monitoreo.sensorHumo) puntos += 10;
    if (formData.monitoreo.sensorTemperatura) puntos += 10;
    
    // Extinción (20%)
    maxPuntos += 20;
    if (formData.extincion.matafuegos.length >= 2) puntos += 20;
    
    // Infraestructura (20%)
    maxPuntos += 20;
    if (formData.infraestructura.pisoElevado) puntos += 5;
    if (formData.infraestructura.techoFalso) puntos += 5;
    if (formData.infraestructura.iluminacion === 'buena') puntos += 5;
    if (formData.infraestructura.ventilacion === 'adecuada') puntos += 5;
    
    return Math.round((puntos / maxPuntos) * 100);
  };

  const handleSave = () => {
    if (validateForm()) {
      const puntuacion = calcularPuntuacion();
      const status = puntuacion >= 80 ? 'completed' : puntuacion >= 60 ? 'warning' : 'error';
      
      onSave({
        sectionId: 'cuarto-tecnologia',
        data: formData,
        completedAt: new Date().toISOString(),
        status,
        completionPercentage: puntuacion,
        score: puntuacion
      });
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        
        {/* Header con Puntuación */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'primary.50', border: 1, borderColor: 'primary.200' }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Cuarto de Tecnología - Evaluación Integral
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">Puntuación Estimada:</Typography>
                <Chip 
                  label={`${calcularPuntuacion()}%`}
                  color={calcularPuntuacion() >= 80 ? 'success' : calcularPuntuacion() >= 60 ? 'warning' : 'error'}
                  variant="filled"
                />
                <Rating 
                  value={calcularPuntuacion() / 20} 
                  readOnly 
                  precision={0.5}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Acceso y Seguridad */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon color="primary" />
                Acceso y Seguridad
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.acceso.sistemaBiometrico}
                        onChange={(e) => handleInputChange('acceso', 'sistemaBiometrico', e.target.checked)}
                      />
                    }
                    label="Sistema biométrico de acceso"
                  />
                </Grid>
                
                {formData.acceso.sistemaBiometrico && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Marca y Modelo del Sistema"
                        value={formData.acceso.marcaModelo}
                        onChange={(e) => handleInputChange('acceso', 'marcaModelo', e.target.value)}
                        placeholder="Ej: ProSoft, ZKTeco, etc."
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Estado de Funcionamiento</InputLabel>
                        <Select
                          value={formData.acceso.funcionamiento}
                          onChange={(e) => handleInputChange('acceso', 'funcionamiento', e.target.value)}
                          label="Estado de Funcionamiento"
                        >
                          <MenuItem value="excelente">Excelente</MenuItem>
                          <MenuItem value="bueno">Bueno</MenuItem>
                          <MenuItem value="regular">Regular</MenuItem>
                          <MenuItem value="malo">Malo</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones de Seguridad"
                    value={formData.acceso.observaciones}
                    onChange={(e) => handleInputChange('acceso', 'observaciones', e.target.value)}
                    multiline
                    rows={2}
                    placeholder="Observaciones sobre el control de acceso..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sistema de Energía */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PowerIcon color="warning" />
                Sistema de Energía
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="UPS Disponibles"
                    value={formData.energia.upsDisponibles}
                    onChange={(e) => handleInputChange('energia', 'upsDisponibles', parseInt(e.target.value) || 0)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="UPS En Uso"
                    value={formData.energia.upsEnUso}
                    onChange={(e) => handleInputChange('energia', 'upsEnUso', parseInt(e.target.value) || 0)}
                    error={!!errors['energia.upsEnUso']}
                    helperText={errors['energia.upsEnUso']}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Marca y Modelo UPS"
                    value={formData.energia.marcaModeloUPS}
                    onChange={(e) => handleInputChange('energia', 'marcaModeloUPS', e.target.value)}
                    placeholder="Ej: APC Smart-UPS, Eaton 9PX"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Autonomía UPS (minutos)"
                    value={formData.energia.autonomiaUPS}
                    onChange={(e) => handleInputChange('energia', 'autonomiaUPS', e.target.value)}
                    placeholder="Ej: 15 minutos, 30 minutos"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.energia.generador}
                        onChange={(e) => handleInputChange('energia', 'generador', e.target.checked)}
                      />
                    }
                    label="Generador Eléctrico (GE)"
                  />
                </Grid>
                
                {formData.energia.generador && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Marca y Modelo del Generador"
                        value={formData.energia.marcaModeloGenerador}
                        onChange={(e) => handleInputChange('energia', 'marcaModeloGenerador', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Tipo de Combustible</InputLabel>
                        <Select
                          value={formData.energia.combustibleGenerador}
                          onChange={(e) => handleInputChange('energia', 'combustibleGenerador', e.target.value)}
                          label="Tipo de Combustible"
                        >
                          <MenuItem value="diesel">Diesel</MenuItem>
                          <MenuItem value="gas">Gas</MenuItem>
                          <MenuItem value="gasolina">Gasolina</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.energia.tableroTransferencia}
                            onChange={(e) => handleInputChange('energia', 'tableroTransferencia', e.target.checked)}
                          />
                        }
                        label="Tablero de Transferencia Automática"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Monitoreo y Sensores */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ThermoIcon color="info" />
                Monitoreo y Sensores
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.monitoreo.sensorHumo}
                        onChange={(e) => handleInputChange('monitoreo', 'sensorHumo', e.target.checked)}
                      />
                    }
                    label="Sensor de Humo en Data Center"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.monitoreo.sensorTemperatura}
                        onChange={(e) => handleInputChange('monitoreo', 'sensorTemperatura', e.target.checked)}
                      />
                    }
                    label="Sensor de Temperatura"
                  />
                </Grid>
                
                {formData.monitoreo.sensorTemperatura && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Marca del Sensor de Temperatura"
                        value={formData.monitoreo.marcaSensorTemp}
                        onChange={(e) => handleInputChange('monitoreo', 'marcaSensorTemp', e.target.value)}
                        placeholder="Ej: Sensatronics, APC, ESP"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Temperatura Actual (°C)"
                        value={formData.monitoreo.temperaturaActual}
                        onChange={(e) => handleInputChange('monitoreo', 'temperaturaActual', e.target.value)}
                        placeholder="Ej: 21.4°C"
                      />
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.monitoreo.appMovil}
                        onChange={(e) => handleInputChange('monitoreo', 'appMovil', e.target.checked)}
                      />
                    }
                    label="App Móvil para Monitoreo"
                  />
                </Grid>
                
                {formData.monitoreo.appMovil && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nombre de la Aplicación"
                      value={formData.monitoreo.nombreApp}
                      onChange={(e) => handleInputChange('monitoreo', 'nombreApp', e.target.value)}
                      placeholder="Ej: ESP Environmental, Sensatronics"
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Extinción de Incendios */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="error" />
                Extinción de Incendios
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Agregar Matafuego
                  </Typography>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={3}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Ubicación"
                        value={nuevoMatafuego.ubicacion}
                        onChange={(e) => setNuevoMatafuego(prev => ({ ...prev, ubicacion: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Tipo</InputLabel>
                        <Select
                          value={nuevoMatafuego.tipo}
                          onChange={(e) => setNuevoMatafuego(prev => ({ ...prev, tipo: e.target.value }))}
                          label="Tipo"
                        >
                          <MenuItem value="ABC">ABC (Polvo)</MenuItem>
                          <MenuItem value="CO2">CO2</MenuItem>
                          <MenuItem value="K">Clase K</MenuItem>
                          <MenuItem value="Agua">Agua</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        size="small"
                        fullWidth
                        type="date"
                        label="Vencimiento"
                        value={nuevoMatafuego.vencimiento}
                        onChange={(e) => setNuevoMatafuego(prev => ({ ...prev, vencimiento: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={agregarMatafuego}
                        disabled={!nuevoMatafuego.ubicacion || !nuevoMatafuego.tipo}
                      >
                        Agregar
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {formData.extincion.matafuegos.length > 0 && (
                <List>
                  {formData.extincion.matafuegos.map((matafuego, index) => (
                    <ListItem key={matafuego.id || index} divider>
                      <ListItemIcon>
                        <WarningIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${matafuego.tipo} - ${matafuego.ubicacion}`}
                        secondary={`Vence: ${matafuego.vencimiento || 'No especificado'}`}
                      />
                      <IconButton
                        edge="end"
                        onClick={() => eliminarMatafuego(matafuego.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Observaciones y Mejoras Identificadas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Observaciones y Mejoras Identificadas
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Observaciones Generales"
                    value={formData.observaciones.observacionesGenerales}
                    onChange={(e) => handleInputChange('observaciones', 'observacionesGenerales', e.target.value)}
                    multiline
                    rows={4}
                    placeholder="Observaciones generales sobre el cuarto de tecnología..."
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Recomendaciones"
                    value={formData.observaciones.recomendaciones}
                    onChange={(e) => handleInputChange('observaciones', 'recomendaciones', e.target.value)}
                    multiline
                    rows={4}
                    placeholder="Recomendaciones para mejoras futuras..."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Agregar Mejora Identificada
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Nueva Mejora"
                        value={nuevaObservacion}
                        onChange={(e) => setNuevaObservacion(e.target.value)}
                        placeholder="Ej: IDF sin rack para protección adecuada"
                      />
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={agregarMejora}
                        disabled={!nuevaObservacion.trim()}
                      >
                        Agregar
                      </Button>
                    </Box>
                  </Paper>
                  
                  {formData.observaciones.mejorasIdentificadas.length > 0 && (
                    <List sx={{ mt: 2 }}>
                      {formData.observaciones.mejorasIdentificadas.map((mejora, index) => (
                        <ListItem key={index} divider>
                          <ListItemIcon>
                            <WarningIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText primary={mejora} />
                          <IconButton
                            edge="end"
                            onClick={() => eliminarMejora(index)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Calificación General */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'info.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Calificación General del Cuarto de Tecnología
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1">Puntuación:</Typography>
                <Rating
                  value={formData.observaciones.calificacionGeneral}
                  onChange={(event, newValue) => handleInputChange('observaciones', 'calificacionGeneral', newValue)}
                  size="large"
                />
                <Typography variant="body1">
                  ({formData.observaciones.calificacionGeneral}/5)
                </Typography>
                <Chip 
                  label={`${calcularPuntuacion()}% (Calculado automáticamente)`}
                  color={calcularPuntuacion() >= 80 ? 'success' : calcularPuntuacion() >= 60 ? 'warning' : 'error'}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Botones de Acción */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Guardar Sección
        </Button>
      </Box>
    </Box>
  );
};

export default CuartoTecnologiaForm;