/**
 * Sistema de Búsqueda Global
 * Checkpoint 2.8: Búsqueda inteligente y avanzada en todo el sistema
 * 
 * Funcionalidades:
 * - Búsqueda en tiempo real
 * - Filtros por tipo de contenido
 * - Resultados categorizados
 * - Historial de búsquedas
 * - Shortcuts de teclado (Ctrl+K)
 * - Búsqueda avanzada con operadores
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  Divider,
  Paper,
  Grid,
  InputAdornment,
  IconButton,
  Fade,
  Avatar,
  ListItemButton,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Search,
  Assignment,
  Business,
  Description,
  Person,
  Chat,
  Schedule,
  Analytics,
  Close,
  History,
  FilterList,
  TrendingUp,
  LocationOn,
  Email,
  Phone,
  CalendarToday,
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../domains/auth/store/authStore';

// Función debounce simple sin dependencias externas
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

const GlobalSearch = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const searchInputRef = useRef(null);

  // Tipos de resultados con iconos y colores
  const resultTypes = {
    auditorias: {
      icon: <Assignment />,
      color: '#1976d2',
      label: 'Auditorías',
      path: '/auditorias'
    },
    proveedores: {
      icon: <Business />,
      color: '#388e3c',
      label: 'Proveedores',
      path: '/proveedores'
    },
    documentos: {
      icon: <Description />,
      color: '#f57c00',
      label: 'Documentos',
      path: '/documentos'
    },
    usuarios: {
      icon: <Person />,
      color: '#7b1fa2',
      label: 'Usuarios',
      path: '/usuarios'
    },
    conversaciones: {
      icon: <Chat />,
      color: '#00796b',
      label: 'Conversaciones',
      path: '/comunicacion'
    },
    sitios: {
      icon: <LocationOn />,
      color: '#d32f2f',
      label: 'Sitios',
      path: '/sitios'
    }
  };

  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  // Búsqueda con debounce
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (!term.trim()) {
        setResults({});
        return;
      }

      setLoading(true);
      try {
        // Simular búsqueda en diferentes categorías
        const searchResults = await performSearch(term);
        setResults(searchResults);
        
        // Guardar en historial
        if (!searchHistory.includes(term)) {
          setSearchHistory(prev => [term, ...prev.slice(0, 9)]);
        }
      } catch (error) {
        console.error('Error en búsqueda:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    [searchHistory]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Simulador de búsqueda
  const performSearch = async (term) => {
    const searchTerm = term.toLowerCase();
    
    // Simular datos de búsqueda
    const mockResults = {
      auditorias: [
        {
          id: 1,
          titulo: 'Auditoría APEX Centro Nov 2024',
          subtitulo: 'Centro de Interacción Multimedia S.A.',
          estado: 'en_carga',
          progreso: 65,
          fecha: '2024-11-15',
          relevancia: 95
        },
        {
          id: 2,
          titulo: 'Auditoría Teleperformance Norte',
          subtitulo: 'CityTech S.A.',
          estado: 'pendiente_evaluacion',
          progreso: 100,
          fecha: '2024-10-30',
          relevancia: 87
        }
      ].filter(item => 
        item.titulo.toLowerCase().includes(searchTerm) ||
        item.subtitulo.toLowerCase().includes(searchTerm)
      ),

      proveedores: [
        {
          id: 1,
          nombre: 'Grupo Activo SRL',
          cuit: '30-71044895-3',
          sitios: 1,
          estado: 'activo',
          contacto: 'contacto@grupoactivo.com',
          relevancia: 92
        },
        {
          id: 2,
          nombre: 'Centro de Interacción Multimedia S.A.',
          cuit: '30-70827680-0',
          sitios: 3,
          estado: 'activo',
          contacto: 'admin@apex.com',
          relevancia: 89
        },
        {
          id: 3,
          nombre: 'CityTech S.A.',
          cuit: '30-70908678-9',
          sitios: 3,
          estado: 'activo',
          contacto: 'gerencia@citytech.com',
          relevancia: 85
        }
      ].filter(item => 
        item.nombre.toLowerCase().includes(searchTerm) ||
        item.cuit.includes(searchTerm) ||
        item.contacto.toLowerCase().includes(searchTerm)
      ),

      documentos: [
        {
          id: 1,
          nombre: 'Topology Network APEX Centro',
          tipo: 'pdf',
          tamaño: '2.4 MB',
          fecha: '2024-11-10',
          auditoria: 'APEX Centro Nov 2024',
          seccion: 'Network Topology',
          relevancia: 88
        },
        {
          id: 2,
          nombre: 'Infrastructure Documentation CityTech',
          tipo: 'excel',
          tamaño: '1.8 MB',
          fecha: '2024-11-08',
          auditoria: 'Teleperformance Norte',
          seccion: 'Infrastructure Documentation',
          relevancia: 84
        }
      ].filter(item => 
        item.nombre.toLowerCase().includes(searchTerm) ||
        item.auditoria.toLowerCase().includes(searchTerm) ||
        item.seccion.toLowerCase().includes(searchTerm)
      ),

      usuarios: [
        {
          id: 1,
          nombre: 'Carlos Martínez',
          email: 'auditor@satdigital.com',
          rol: 'Auditor General',
          estado: 'activo',
          ultimo_acceso: '2024-11-12',
          relevancia: 90
        },
        {
          id: 2,
          nombre: 'María González',
          email: 'proveedor@activo.com',
          rol: 'Jefe Proveedor',
          estado: 'activo',
          ultimo_acceso: '2024-11-11',
          relevancia: 86
        }
      ].filter(item => 
        item.nombre.toLowerCase().includes(searchTerm) ||
        item.email.toLowerCase().includes(searchTerm) ||
        item.rol.toLowerCase().includes(searchTerm)
      ),

      conversaciones: [
        {
          id: 1,
          titulo: 'Consulta sobre documentos APEX Centro',
          participantes: ['Auditor', 'Proveedor APEX'],
          ultimo_mensaje: 'Documentos cargados correctamente',
          fecha: '2024-11-12 14:30',
          no_leidos: 2,
          relevancia: 93
        }
      ].filter(item => 
        item.titulo.toLowerCase().includes(searchTerm) ||
        item.ultimo_mensaje.toLowerCase().includes(searchTerm)
      ),

      sitios: [
        {
          id: 1,
          nombre: 'APEX Centro',
          direccion: 'Av. Corrientes 1234, CABA',
          proveedor: 'Centro de Interacción Multimedia S.A.',
          estado: 'activo',
          auditorias: 5,
          relevancia: 91
        },
        {
          id: 2,
          nombre: 'Teleperformance Norte',
          direccion: 'Av. Belgrano 5678, Vicente López',
          proveedor: 'CityTech S.A.',
          estado: 'activo',
          auditorias: 3,
          relevancia: 87
        }
      ].filter(item => 
        item.nombre.toLowerCase().includes(searchTerm) ||
        item.direccion.toLowerCase().includes(searchTerm) ||
        item.proveedor.toLowerCase().includes(searchTerm)
      )
    };

    // Filtrar por filtros activos
    const filteredResults = {};
    Object.keys(mockResults).forEach(key => {
      if (activeFilters.length === 0 || activeFilters.includes(key)) {
        filteredResults[key] = mockResults[key];
      }
    });

    return filteredResults;
  };

  // Manejo de teclas
  const handleKeyDown = (event) => {
    const totalResults = Object.values(results).flat().length;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, totalResults - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        handleSelectResult();
        break;
      case 'Escape':
        handleClose();
        break;
    }
  };

  const handleSelectResult = () => {
    // Implementar navegación al resultado seleccionado
    const allResults = Object.values(results).flat();
    if (allResults[selectedIndex]) {
      const result = allResults[selectedIndex];
      // Navegar según el tipo de resultado
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setResults({});
    setSelectedIndex(0);
    onClose();
  };

  const toggleFilter = (filterType) => {
    setActiveFilters(prev => 
      prev.includes(filterType) 
        ? prev.filter(f => f !== filterType)
        : [...prev, filterType]
    );
  };

  const renderResultItem = (item, type, index) => {
    const typeConfig = resultTypes[type];
    const isSelected = index === selectedIndex;

    const handleClick = () => {
      // Navegar al resultado específico
      navigate(`${typeConfig.path}/${item.id}`);
      handleClose();
    };

    return (
      <ListItemButton
        key={`${type}-${item.id}`}
        selected={isSelected}
        onClick={handleClick}
        sx={{ 
          borderLeft: `4px solid ${isSelected ? typeConfig.color : 'transparent'}`,
          '&:hover': { borderLeftColor: typeConfig.color }
        }}
      >
        <ListItemIcon>
          <Avatar sx={{ 
            bgcolor: typeConfig.color, 
            width: 32, 
            height: 32 
          }}>
            {typeConfig.icon}
          </Avatar>
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" fontWeight="medium">
                {item.titulo || item.nombre}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {item.relevancia && (
                  <Chip 
                    size="small" 
                    label={`${item.relevancia}%`}
                    color={item.relevancia > 90 ? 'success' : 'default'}
                  />
                )}
                {item.estado && (
                  <Chip 
                    size="small" 
                    label={item.estado}
                    color={
                      item.estado === 'activo' || item.estado === 'completada' ? 'success' :
                      item.estado === 'en_carga' || item.estado === 'pendiente' ? 'warning' : 
                      'default'
                    }
                  />
                )}
              </Box>
            </Box>
          }
          secondary={
            <Typography variant="body2" color="text.secondary">
              {item.subtitulo || item.descripcion || item.contacto || item.direccion || item.auditoria}
            </Typography>
          }
        />
      </ListItemButton>
    );
  };

  const renderResults = () => {
    if (loading) {
      return (
        <Box sx={{ p: 2 }}>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
          ))}
        </Box>
      );
    }

    if (!searchTerm.trim()) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Search sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Buscar en SAT Digital
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Busca auditorías, proveedores, documentos, usuarios y más...
          </Typography>
          
          {searchHistory.length > 0 && (
            <Box sx={{ mt: 3, textAlign: 'left' }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <History />
                Búsquedas recientes
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {searchHistory.slice(0, 5).map((term, index) => (
                  <Chip
                    key={index}
                    label={term}
                    size="small"
                    onClick={() => setSearchTerm(term)}
                    clickable
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      );
    }

    const totalResults = Object.values(results).flat().length;

    if (totalResults === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Search sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Sin resultados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No se encontraron resultados para "{searchTerm}"
          </Typography>
        </Box>
      );
    }

    let currentIndex = 0;
    
    return (
      <Box>
        {Object.entries(results).map(([type, items]) => {
          if (items.length === 0) return null;
          
          const typeConfig = resultTypes[type];
          const sectionItems = items.map((item, idx) => {
            const globalIndex = currentIndex + idx;
            return renderResultItem(item, type, globalIndex);
          });
          
          currentIndex += items.length;
          
          return (
            <Box key={type}>
              <Box sx={{ p: 2, pb: 1 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: typeConfig.color,
                    fontWeight: 600
                  }}
                >
                  {typeConfig.icon}
                  {typeConfig.label} ({items.length})
                </Typography>
              </Box>
              <List dense>
                {sectionItems}
              </List>
              <Divider />
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          minHeight: '60vh',
          maxHeight: '80vh',
          borderRadius: 2
        }
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          ref={searchInputRef}
          fullWidth
          placeholder="Buscar en SAT Digital..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClose}>
                  <Close />
                </IconButton>
              </InputAdornment>
            )
          }}
          variant="outlined"
        />
        
        {/* Filtros */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          {Object.entries(resultTypes).map(([key, config]) => (
            <Chip
              key={key}
              icon={config.icon}
              label={config.label}
              size="small"
              onClick={() => toggleFilter(key)}
              color={activeFilters.includes(key) ? 'primary' : 'default'}
              variant={activeFilters.includes(key) ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>
      
      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        {renderResults()}
      </DialogContent>
      
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              ↑↓ Navegar • Enter Seleccionar • Esc Cerrar
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              Ctrl+K para abrir búsqueda
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Dialog>
  );
};

export default GlobalSearch;