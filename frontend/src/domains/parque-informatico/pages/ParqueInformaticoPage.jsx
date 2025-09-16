import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Paper,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Computer,
  CloudUpload,
  Analytics,
  Settings,
  Memory,
  Storage,
  NetworkCheck,
  SmartToy,
  Assessment
} from '@mui/icons-material';

// Importar componentes (similares al normalizador original)
import FileUploader from '../components/FileUploader';
import ValidationRulesEditor from '../components/ValidationRulesEditor';
import StatsDisplay from '../components/StatsDisplay';
import DataTable from '../components/DataTable';
import RecommendationsPanel from '../components/RecommendationsPanel';
import AIAnalysisPanel from '../components/AIAnalysisPanel';

// Servicios
import { parqueInformaticoService } from '../services/parqueInformaticoService';

const ParqueInformaticoPage = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState(0);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [normalizedData, setNormalizedData] = useState(null);
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [validationRules, setValidationRules] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  // Estados de la tabla
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    loadValidationRules();
  }, []);

  const loadValidationRules = async () => {
    try {
      const result = await parqueInformaticoService.getValidationRules();
      setValidationRules(result.data.rules);
    } catch (error) {
      console.error('Error cargando reglas de validación:', error);
      showNotification('Error al cargar reglas de validación', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ open: true, message, type });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Procesar archivo cuando cambia
  const handleFileUpload = async (uploadedFile, customRules = null) => {
    setFile(uploadedFile);
    setIsProcessing(true);
    setError(null);
    setNormalizedData(null);
    setStats(null);
    setRecommendations([]);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      
      if (customRules) {
        formData.append('customRules', JSON.stringify(customRules));
      }

      const result = await parqueInformaticoService.processHardwareFile(formData);

      setNormalizedData(result.data.normalizedData);
      setStats(result.data.stats);
      setRecommendations(result.data.recommendations || []);

      showNotification(`Archivo procesado exitosamente: ${result.data.totalRecords} registros analizados`, 'success');

    } catch (error) {
      console.error('Error procesando archivo:', error);
      setError(`Error al procesar archivo: ${error.message}`);
      showNotification(error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Cargar datos de demostración
  const loadDemoData = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await parqueInformaticoService.generateDemoData();

      setNormalizedData(result.data.normalizedData);
      setStats(result.data.stats);
      setRecommendations(result.data.recommendations || []);
      setFile({ name: 'datos_demo_hardware.xlsx', isDemoData: true });

      showNotification(`Datos de demostración generados: ${result.data.totalRecords} registros`, 'success');

    } catch (error) {
      console.error('Error generando datos de demostración:', error);
      setError(`Error al generar datos de demostración: ${error.message}`);
      showNotification(error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Definir tabs con funcionalidades
  const tabsData = [
    {
      label: 'Análisis Principal',
      icon: <Analytics />,
      description: 'Carga y análisis de inventario de hardware'
    },
    {
      label: 'Configuración',
      icon: <Settings />,
      description: 'Reglas de validación y configuración'
    },
    {
      label: 'Análisis IA',
      icon: <SmartToy />,
      description: 'Análisis automático con Inteligencia Artificial (Fase 3)'
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Parque Informático
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sistema de análisis y normalización de inventario de hardware
          </Typography>
        </div>
      </Box>

      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary" gutterBottom>
                  {stats.overview.totalRecords}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total de Equipos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main" gutterBottom>
                  {stats.overview.complianceRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cumplimiento
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="info.main" gutterBottom>
                  {stats.hardware?.storage?.ssdPercentage}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Equipos con SSD
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="warning.main" gutterBottom>
                  {stats.network?.averageDownloadSpeed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Velocidad Promedio (Mbps)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Mensaje de bienvenida si no hay datos */}
      {!file && !isProcessing && !normalizedData && (
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #f6f9fc 0%, #e9f4ff 100%)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Computer sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Bienvenido al Analizador de Parque Informático
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Sistema avanzado de análisis ETL para inventario de hardware con capacidades de IA
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                  <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    1. Cargue su Inventario
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Suba un archivo Excel con datos de procesadores, RAM, almacenamiento, red y más
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                  <Analytics sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    2. Análisis Automático
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Normalización ETL, validación contra estándares y estadísticas avanzadas
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                  <SmartToy sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    3. IA Integrada
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Análisis con Ollama/LLaVA, scoring automático y recomendaciones inteligentes
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={loadDemoData}
                disabled={isProcessing}
                sx={{ mr: 2 }}
              >
                Ver Datos de Demostración
              </Button>
              <Chip 
                label="Fase 3: IA Próximamente" 
                color="warning" 
                variant="outlined"
                icon={<SmartToy />}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Progress bar cuando está procesando */}
      {isProcessing && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Procesando inventario de hardware...
              </Typography>
              <Chip label="Analizando" color="primary" />
            </Box>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Normalizando datos, aplicando reglas de validación y generando estadísticas
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Navegación por tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          {tabsData.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
              sx={{ minHeight: 72, textTransform: 'none' }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Contenido de tabs */}
      <Box>
        {/* Tab 0: Análisis Principal */}
        {activeTab === 0 && (
          <Box>
            {/* File Uploader */}
            <FileUploader
              onFileUpload={handleFileUpload}
              isProcessing={isProcessing}
              file={file}
              error={error}
              onLoadDemo={loadDemoData}
            />

            {/* Estadísticas y gráficos */}
            {stats && normalizedData && (
              <>
                <StatsDisplay 
                  stats={stats} 
                  normalizedData={normalizedData} 
                />
                
                <RecommendationsPanel 
                  stats={stats} 
                  recommendations={recommendations}
                  normalizedData={normalizedData} 
                />
                
                <DataTable
                  normalizedData={normalizedData}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  sortConfig={sortConfig}
                  setSortConfig={setSortConfig}
                />
              </>
            )}
          </Box>
        )}

        {/* Tab 1: Configuración */}
        {activeTab === 1 && (
          <ValidationRulesEditor
            rules={validationRules}
            onRulesUpdate={setValidationRules}
            onNotification={showNotification}
          />
        )}

        {/* Tab 2: Análisis IA */}
        {activeTab === 2 && (
          <AIAnalysisPanel
            normalizedData={normalizedData}
            stats={stats}
            onNotification={showNotification}
          />
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ParqueInformaticoPage;