import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Fab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Alert,
  Paper,
  Avatar,
  Stack,
  Divider
} from '@mui/material';
import {
  NetworkCheck as NetworkIcon,
  Description as DocumentIcon,
  PowerSettingsNew as PowerIcon,
  DeviceThermostat as ThermoIcon,
  Storage as ServerIcon,
  Language as InternetIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Home as RoomIcon,
  Cable as CableIcon,
  Computer as ComputerIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Save as SaveIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Analytics
} from '@mui/icons-material';

// Importar formularios específicos
import TopologiaForm from './sections/TopologiaForm';
import DocumentacionForm from './sections/DocumentacionForm';
import HardwareSoftwareForm from './sections/HardwareSoftwareForm';
import CuartoTecnologiaForm from './sections/CuartoTecnologiaForm';
import EnergiaForm from './sections/EnergiaForm';
import TemperaturaForm from './sections/TemperaturaForm';
import ServidoresForm from './sections/ServidoresForm';
import InternetForm from './sections/InternetForm';
import PersonalCapacitadoForm from './sections/PersonalCapacitadoForm';
import EscalamientoForm from './sections/EscalamientoForm';
import ConectividadForm from './sections/ConectividadForm';
import SeguridadInformacionForm from './sections/SeguridadInformacionForm';
import EntornoInformacionForm from './sections/EntornoInformacionForm';

// Componente para cada tarjeta de sección
const SectionCard = ({ section, onClick, status = 'pending' }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckIcon sx={{ color: '#4caf50', fontSize: 20 }} />;
      case 'warning':
        return <WarningIcon sx={{ color: '#ff9800', fontSize: 20 }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#f44336', fontSize: 20 }} />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'visible',
        height: '220px',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
          '& .section-icon': {
            transform: 'scale(1.1)',
            color: 'primary.main'
          }
        },
        border: status !== 'pending' ? `2px solid` : '1px solid',
        borderColor: status === 'completed' ? '#4caf50' : 
                    status === 'warning' ? '#ff9800' :
                    status === 'error' ? '#f44336' : 'divider'
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center', py: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Box
            className="section-icon"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 1,
              transition: 'all 0.3s ease'
            }}
          >
            {React.cloneElement(section.icon, { 
              sx: { fontSize: 40, color: 'text.secondary' }
            })}
          </Box>
          {getStatusIcon() && (
            <Box sx={{
              position: 'absolute',
              top: -8,
              right: '50%',
              transform: 'translateX(50%)',
            }}>
              {getStatusIcon()}
            </Box>
          )}
        </Box>
        
        <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 300, fontFamily: '"Inter", sans-serif' }}>
          {section.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', fontWeight: 300, fontFamily: '"Inter", sans-serif' }}>
          {section.description}
        </Typography>
        
        {section.badge && (
          <Chip
            label={section.badge}
            size="small"
            color={getStatusColor()}
            variant="outlined"
            sx={{ mt: 1, fontSize: '0.75rem' }}
          />
        )}
      </CardContent>
    </Card>
  );
};

const AuditoriaFormulario = ({ auditData, onClose, onSave }) => {
  const [openModal, setOpenModal] = useState(null);
  const [sectionStatuses, setSectionStatuses] = useState({});
  const [progress, setProgress] = useState(0);

  // Definición de las 13 secciones técnicas basadas en auditorías presenciales reales
  const technicalSections = [
    {
      id: 'topologia',
      title: 'Topología de Red',
      description: 'Configuración y esquemas de red',
      icon: <NetworkIcon />,
      badge: 'Análisis por Lotes',
      category: 'batch'
    },
    {
      id: 'documentacion',
      title: 'Documentación de Infraestructura y Controles',
      description: 'Documentación técnica y procedimientos',
      icon: <DocumentIcon />,
      badge: 'Análisis por Lotes',
      category: 'batch'
    },
    {
      id: 'energia',
      title: 'Energía del Cuarto de Tecnología',
      description: 'UPS, generadores y sistema eléctrico',
      icon: <PowerIcon />,
      badge: 'Análisis por Lotes',
      category: 'batch'
    },
    {
      id: 'temperatura',
      title: 'Temperatura CT',
      description: 'Sensores, monitoreo y climatización',
      icon: <ThermoIcon />,
      badge: 'Análisis por Lotes',
      category: 'batch'
    },
    {
      id: 'servidores',
      title: 'Servidores',
      description: 'Hardware de servidores y equipos de telecom',
      icon: <ServerIcon />,
      badge: 'Análisis por Lotes',
      category: 'batch'
    },
    {
      id: 'internet',
      title: 'Internet',
      description: 'Conectividad y ancho de banda',
      icon: <InternetIcon />,
      badge: 'Análisis por Lotes',
      category: 'batch'
    },
    {
      id: 'personal',
      title: 'Personal Capacitado en Sitio',
      description: 'Horarios y recursos humanos técnicos',
      icon: <PersonIcon />,
      badge: 'Análisis por Lotes',
      category: 'batch'
    },
    {
      id: 'escalamiento',
      title: 'Escalamiento (Números de Contacto)',
      description: 'Procedimientos de escalamiento técnico',
      icon: <PhoneIcon />,
      badge: 'Análisis por Lotes',
      category: 'batch'
    },
    {
      id: 'cuarto-tecnologia',
      title: 'Cuarto de Tecnología',
      description: 'Infraestructura física, acceso biométrico',
      icon: <RoomIcon />,
      badge: 'Análisis por Lotes',
      category: 'batch'
    },
    {
      id: 'conectividad',
      title: 'Conectividad (Certificación de Cableado)',
      description: 'Certificaciones y estado del cableado',
      icon: <CableIcon />,
      badge: 'Análisis por Lotes',
      category: 'batch'
    },
    {
      id: 'hardware-software',
      title: 'Parque Informático - Hardware/Software',
      description: 'Inventario completo con normalización IA',
      icon: <ComputerIcon />,
      badge: 'IA + Por Lotes',
      category: 'batch'
    },
    {
      id: 'seguridad',
      title: 'Seguridad de la Información',
      description: 'Sensores de humo, matafuegos, extintores',
      icon: <SecurityIcon />,
      badge: 'Análisis por Lotes',
      category: 'batch'
    },
    {
      id: 'ambiente',
      title: 'Información del Ambiente',
      description: 'Condiciones ambientales y observaciones',
      icon: <InfoIcon />,
      badge: 'Análisis por Lotes',
      category: 'batch'
    }
  ];

  const realtimeSections = technicalSections.filter(s => s.category === 'realtime');
  const batchSections = technicalSections.filter(s => s.category === 'batch');

  const handleSectionClick = (sectionId) => {
    setOpenModal(sectionId);
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  const handleSectionComplete = (sectionId, status = 'completed') => {
    setSectionStatuses(prev => ({
      ...prev,
      [sectionId]: status
    }));
    
    // Actualizar progreso
    const completedCount = Object.keys({ ...sectionStatuses, [sectionId]: status })
      .filter(key => sectionStatuses[key] === 'completed' || (sectionId === key && status === 'completed')).length;
    setProgress((completedCount / technicalSections.length) * 100);
    
    handleCloseModal();
  };

  const handleSectionSave = (sectionData) => {
    setSectionStatuses(prev => ({
      ...prev,
      [sectionData.sectionId]: sectionData.status
    }));
    
    // Actualizar progreso
    const completedCount = Object.keys({ ...sectionStatuses, [sectionData.sectionId]: sectionData.status })
      .filter(key => sectionStatuses[key] === 'completed' || (sectionData.sectionId === key && sectionData.status === 'completed')).length;
    setProgress((completedCount / technicalSections.length) * 100);
    
    // Guardar los datos de la sección (aquí se puede enviar a la API)
    console.log('Datos de sección guardados:', sectionData);
    
    handleCloseModal();
  };

  const renderSectionForm = () => {
    switch (openModal) {
      case 'topologia':
        return (
          <TopologiaForm
            onSave={handleSectionSave}
            onCancel={handleCloseModal}
            initialData={{}}
            auditData={auditData}
          />
        );
      case 'documentacion':
        return (
          <DocumentacionForm
            onSave={handleSectionSave}
            onCancel={handleCloseModal}
            initialData={{}}
            auditData={auditData}
          />
        );
      case 'hardware-software':
        return (
          <HardwareSoftwareForm
            onSave={handleSectionSave}
            onCancel={handleCloseModal}
            initialData={{}}
            auditData={auditData}
          />
        );
      case 'cuarto-tecnologia':
        return (
          <CuartoTecnologiaForm
            onSave={handleSectionSave}
            onCancel={handleCloseModal}
            initialData={{}}
            auditData={auditData}
          />
        );
      case 'energia':
        return (
          <EnergiaForm
            onSave={handleSectionSave}
            onCancel={handleCloseModal}
            initialData={{}}
            auditData={auditData}
          />
        );
      case 'temperatura':
        return (
          <TemperaturaForm
            onSave={handleSectionSave}
            onCancel={handleCloseModal}
            initialData={{}}
            auditData={auditData}
          />
        );
      case 'servidores':
        return (
          <ServidoresForm
            onSave={handleSectionSave}
            onCancel={handleCloseModal}
            initialData={{}}
            auditData={auditData}
          />
        );
      case 'internet':
        return (
          <InternetForm
            onSave={handleSectionSave}
            onCancel={handleCloseModal}
            initialData={{}}
            auditData={auditData}
          />
        );
      case 'personal':
        return (
          <PersonalCapacitadoForm
            onSave={handleSectionSave}
            onCancel={handleCloseModal}
            initialData={{}}
            auditData={auditData}
          />
        );
      case 'escalamiento':
        return (
          <EscalamientoForm
            onSave={handleSectionSave}
            onCancel={handleCloseModal}
            initialData={{}}
            auditData={auditData}
          />
        );
      case 'conectividad':
        return (
          <ConectividadForm
            onSave={handleSectionSave}
            onCancel={handleCloseModal}
            initialData={{}}
            auditData={auditData}
          />
        );
      case 'seguridad':
        return (
          <SeguridadInformacionForm
            onSave={handleSectionSave}
            onCancel={handleCloseModal}
            initialData={{}}
            auditData={auditData}
          />
        );
      case 'ambiente':
        return (
          <EntornoInformacionForm
            onSave={handleSectionSave}
            onCancel={handleCloseModal}
            initialData={{}}
            auditData={auditData}
          />
        );
      default:
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Formulario de {technicalSections.find(s => s.id === openModal)?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {technicalSections.find(s => s.id === openModal)?.description}
            </Typography>
            
            {/* Formulario genérico temporal */}
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                🚧 Formulario específico para esta sección en desarrollo. 
                Próximamente se implementarán los campos y validaciones correspondientes.
              </Typography>
            </Alert>

            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={() => handleSectionComplete(openModal, 'completed')}
                startIcon={<CheckIcon />}
              >
                Marcar como Completada
              </Button>
            </Box>
          </Box>
        );
    }
  };

  const handleSaveAudit = () => {
    const auditResult = {
      ...auditData,
      sectionStatuses,
      progress,
      completedAt: progress === 100 ? new Date().toISOString() : null
    };
    onSave(auditResult);
  };

  return (
    <Box sx={{ py: 2, background: 'transparent' }}>
      {/* Header de la auditoría */}
      <Box sx={{ mb: 4 }}>
        <Paper 
          elevation={0}
          sx={{
            background: '#fafbfc',
            p: 3,
            borderRadius: 2,
            border: '1px solid #e9ecef',
            boxShadow: 'none'
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 400,
                  color: '#1e293b'
                }}
              >
                Auditoría Técnica{auditData?.sitio?.nombre ? ` - ${auditData.sitio.nombre}` : ''}
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  color: '#868e96',
                  fontWeight: 300
                }}
              >
                {[auditData?.proveedor?.nombre_comercial, auditData?.sitio?.localidad].filter(Boolean).join(' | ')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography 
                  variant="body2" 
                  gutterBottom
                  sx={{
                    fontFamily: '"Inter", sans-serif',
                    color: '#868e96',
                    fontWeight: 300,
                    letterSpacing: '0.08em',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase'
                  }}
                >
                  Progreso General
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography 
                  variant="body2"
                  sx={{
                    fontFamily: '"Lato", sans-serif',
                    fontWeight: 500
                  }}
                >
                  {Math.round(progress)}% completado ({Object.keys(sectionStatuses).length}/{technicalSections.length} secciones)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>


      {/* Alert de información */}
      <Alert severity="warning" sx={{ mb: 3, background: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.2)' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, fontFamily: '"Inter", sans-serif', color: '#1e293b' }}>
          Instrucciones Importantes
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 300, fontFamily: '"Inter", sans-serif', lineHeight: 1.6 }}>
          • Toda la documentación en PDF debe incluir explicaciones u observaciones claras.<br/>
          • Evite archivos que solo contengan imágenes o tablas sin referencias.<br/>
          • Todas las hojas deben llevar el membrete del sitio auditado.<br/>
          • Incluya la fecha actual correspondiente (mes y año) y la respectiva fecha de revisión 2025.<br/>
          • La falta de presentación de la documentación requerida representará un incumplimiento sobre el punto correspondiente.<br/>
          • Para la sección "Home Office", se ha añadido una columna para indicar el usuario (u) de los asesores que atienden en esta modalidad.
        </Typography>
      </Alert>

      {/* Todas las Secciones - Análisis por Lotes */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 300, fontFamily: '"Inter", sans-serif' }}>
          <Chip label="ANÁLISIS POR LOTES" color="primary" size="small" />
          13 Secciones Técnicas Basadas en Auditorías Presenciales
        </Typography>
        <Alert severity="info" sx={{ mb: 3, background: 'rgba(23, 162, 184, 0.03)', border: '1px solid rgba(23, 162, 184, 0.15)' }}>
          <Typography variant="body2" sx={{ fontWeight: 300, fontFamily: '"Inter", sans-serif' }}>
            <strong>Modalidad por Lotes:</strong> Todas las secciones se procesan después de completar 
            la carga de documentos y formularios. El análisis con IA se ejecuta una vez finalizada 
            toda la captura de información, siguiendo el modelo de las auditorías presenciales reales.
          </Typography>
        </Alert>
        <Grid container spacing={3}>
          {technicalSections.map((section) => (
            <Grid item xs={12} sm={6} md={4} key={section.id}>
              <SectionCard
                section={section}
                status={sectionStatuses[section.id]}
                onClick={() => handleSectionClick(section.id)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Botón de guardado en posición normal */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSaveAudit}
          sx={{
            fontFamily: '"Inter", sans-serif',
            background: '#1e293b',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            letterSpacing: '0.01em',
            px: 4,
            py: 1.5,
            '&:hover': {
              background: '#206bc4',
              boxShadow: '0 4px 12px rgba(32, 107, 196, 0.3)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Guardar Auditoría
        </Button>
      </Box>

      {/* Modal genérico para secciones */}
      <Dialog
        open={openModal !== null}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            minHeight: '70vh',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" component="span">
            {technicalSections.find(s => s.id === openModal)?.title || 'Sección Técnica'}
          </Typography>
          <Chip 
            label={technicalSections.find(s => s.id === openModal)?.badge || ''} 
            size="small" 
            color="primary" 
          />
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {renderSectionForm()}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AuditoriaFormulario;