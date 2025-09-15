import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Divider,
  useTheme,
  alpha,
  Chip,
  Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  ExitToApp as LogoutIcon,
  BarChart as BarChartIcon,
  Description as ReportsIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  MenuOpen as MenuIcon,
  Schedule as ScheduleIcon,
  ChatOutlined as ChatIcon,
  Person as PersonIcon,
  Analytics as AnalyticsIcon,
  Search,
  Tune as DiagnosticsIcon
} from '@mui/icons-material';
import { useAuthStore } from '../../../domains/auth/store/authStore';
import { useWebSocket } from '../../../domains/comunicacion/hooks/useWebSocket';
import NotificacionesToast from '../Notifications/NotificacionesToast';
import GlobalSearch from '../Search/GlobalSearch';

const DRAWER_WIDTH = 280;

const menuItems = {
  admin: [
    {
      id: 'dashboard',
      title: 'Overview',
      icon: <DashboardIcon />,
      path: '/dashboard',
      badge: null
    },
    {
      id: 'dashboard-ejecutivo',
      title: 'Dashboard Ejecutivo',
      icon: <AnalyticsIcon />,
      path: '/dashboard-ejecutivo',
      badge: null
    },
    {
      id: 'auditorias',
      title: 'Auditorías',
      icon: <AssignmentIcon />,
      path: '/auditorias',
      badge: 4
    },
    {
      id: 'calendario',
      title: 'Períodos',
      icon: <ScheduleIcon />,
      path: '/calendario',
      badge: null
    },
    {
      id: 'proveedores',
      title: 'Proveedores',
      icon: <BusinessIcon />,
      path: '/proveedores',
      badge: null
    },
    {
      id: 'documentos',
      title: 'Documentos',
      icon: <ReportsIcon />,
      path: '/documentos',
      badge: null
    },
    {
      id: 'comunicacion',
      title: 'Comunicación',
      icon: <ChatIcon />,
      path: '/comunicacion',
      badge: null
    },
    {
      id: 'notificaciones',
      title: 'Notificaciones',
      icon: <NotificationsIcon />,
      path: '/notificaciones',
      badge: null
    },
    {
      id: 'usuarios',
      title: 'Usuarios',
      icon: <PeopleIcon />,
      path: '/usuarios',
      badge: null
    },
    {
      id: 'reportes',
      title: 'Reportes',
      icon: <ReportsIcon />,
      path: '/reportes',
      badge: null
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/analytics',
      badge: null
    },
    {
      id: 'panel-auditor',
      title: 'Panel Auditor',
      icon: <SecurityIcon />,
      path: '/panel-auditor',
      badge: null
    },
    {
      id: 'diagnosticos',
      title: 'Diagnósticos',
      icon: <DiagnosticsIcon />,
      path: '/diagnosticos',
      badge: null
    },
    {
      id: 'configuracion',
      title: 'Configuración',
      icon: <SettingsIcon />,
      path: '/configuracion',
      badge: null
    }
  ],
  auditor: [
    {
      id: 'dashboard',
      title: 'Mi Panel',
      icon: <DashboardIcon />,
      path: '/dashboard',
      badge: null
    },
    {
      id: 'dashboard-ejecutivo',
      title: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/dashboard-ejecutivo',
      badge: null
    },
    {
      id: 'panel-auditor',
      title: 'Panel Control',
      icon: <SecurityIcon />,
      path: '/panel-auditor',
      badge: null
    },
    {
      id: 'mis-auditorias',
      title: 'Mis Auditorías',
      icon: <AssignmentIcon />,
      path: '/mis-auditorias',
      badge: 3
    },
    {
      id: 'cronograma',
      title: 'Cronograma',
      icon: <TimelineIcon />,
      path: '/cronograma',
      badge: null
    },
    {
      id: 'notificaciones',
      title: 'Notificaciones',
      icon: <NotificationsIcon />,
      path: '/notificaciones',
      badge: null
    },
    {
      id: 'reportes',
      title: 'Reportes',
      icon: <ReportsIcon />,
      path: '/reportes',
      badge: null
    }
  ],
  proveedor: [
    {
      id: 'dashboard',
      title: 'Mi Panel',
      icon: <DashboardIcon />,
      path: '/dashboard',
      badge: null
    },
    {
      id: 'mis-sitios',
      title: 'Mis Sitios',
      icon: <BusinessIcon />,
      path: '/mis-sitios',
      badge: null
    },
    {
      id: 'documentacion',
      title: 'Documentación',
      icon: <ReportsIcon />,
      path: '/documentacion',
      badge: 2
    }
  ],
  visualizador: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      badge: null
    },
    {
      id: 'reportes',
      title: 'Reportes',
      icon: <ReportsIcon />,
      path: '/reportes',
      badge: null
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/analytics',
      badge: null
    }
  ]
};

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuthStore();
  
  // Inicializar WebSocket para chat y notificaciones en tiempo real
  const { connected } = useWebSocket();

  // Manejar Ctrl+K para abrir búsqueda
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentMenuItems = menuItems[usuario?.rol] || menuItems.admin;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const getRolColor = (rol) => {
    switch (rol) {
      case 'admin': return theme.palette.error.main;
      case 'auditor': return theme.palette.primary.main;
      case 'proveedor': return theme.palette.success.main;
      case 'visualizador': return theme.palette.warning.main;
      default: return theme.palette.text.secondary;
    }
  };

  const drawer = (
    <Box 
      className="admin-layout__drawer" 
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header del Drawer */}
      <Box 
        className="admin-layout__drawer-header"
        sx={{
          height: 64,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white'
        }}
      >
        <Typography variant="h6" component="h1" fontWeight="bold" sx={{ lineHeight: 1.1, mb: 0.25 }}>
          SAT-Digital
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem', lineHeight: 1 }}>
          Sistema de Auditorías Técnicas
        </Typography>
      </Box>


      {/* Navegación */}
      <Box 
        sx={{ 
          flex: 1, 
          overflow: 'auto',
          // Estilos de scrollbar transparente/discreto
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.text.secondary, 0.08),
            borderRadius: '2px',
            '&:hover': {
              backgroundColor: alpha(theme.palette.text.secondary, 0.15),
            }
          },
          // Para Firefox
          scrollbarWidth: 'thin',
          scrollbarColor: `${alpha(theme.palette.text.secondary, 0.08)} transparent`,
        }}
      >
        <List 
          className="admin-layout__nav" 
          sx={{ px: 1, py: 2 }}
        >
        {currentMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                className={`admin-layout__nav-item ${isActive ? 'admin-layout__nav-item--active' : ''}`}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08)
                  },
                  '&.admin-layout__nav-item--active': {
                    fontWeight: 'bold',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: -8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: 20,
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: 2
                    }
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isActive ? theme.palette.primary.main : 'inherit',
                    minWidth: 40
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.95rem'
                  }}
                />
                {item.badge && (
                  <Badge
                    badgeContent={item.badge}
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.75rem',
                        height: 18,
                        minWidth: 18
                      }
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
        </List>
      </Box>

      {/* Footer del Drawer */}
      <Box 
        className="admin-layout__drawer-footer"
        sx={{
          mt: 'auto',
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        
        {/* Información del Usuario */}
        <Box 
          className="admin-layout__user-info-footer"
          sx={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            px: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Box display="flex" alignItems="center" gap={1.5} flex={1} minWidth={0}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: getRolColor(usuario?.rol)
                }}
              >
                {usuario?.nombre?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Typography variant="body2" fontWeight="600" noWrap sx={{ fontSize: '0.8rem' }}>
                {usuario?.nombre || 'Usuario'}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Chip 
                label={usuario?.rol?.charAt(0).toUpperCase() + usuario?.rol?.slice(1)}
                size="small"
                sx={{
                  backgroundColor: getRolColor(usuario?.rol),
                  color: 'white',
                  fontSize: '0.65rem',
                  height: 18,
                  '& .MuiChip-label': { px: 0.5 }
                }}
              />
              <Chip 
                label={connected ? 'Online' : 'Offline'}
                size="small"
                sx={{
                  backgroundColor: connected ? '#4caf50' : '#9e9e9e',
                  color: 'white',
                  fontSize: '0.65rem',
                  height: 18,
                  '& .MuiChip-label': { px: 0.5 }
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box className="admin-layout" sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        className="admin-layout__appbar"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: theme.shadows[2]
        }}
      >
        <Toolbar className="admin-layout__toolbar">
          <IconButton
            color="inherit"
            aria-label="abrir drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {currentMenuItems.find(item => item.path === location.pathname)?.title || 'Panel'}
          </Typography>

          {/* Controles del Header */}
          <Box display="flex" alignItems="center" gap={1}>
            {/* Búsqueda Global */}
            <IconButton
              color="inherit"
              onClick={() => setSearchOpen(true)}
              className="admin-layout__search"
              title="Buscar (Ctrl+K)"
            >
              <Search />
            </IconButton>
            
            {/* Notificaciones */}
            <IconButton
              color="inherit"
              onClick={handleNotificationClick}
              className="admin-layout__notifications"
            >
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Perfil Usuario */}
            <IconButton
              onClick={handleMenuClick}
              className="admin-layout__user-menu"
              sx={{ ml: 1 }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: getRolColor(usuario?.rol)
                }}
              >
                {usuario?.nombre?.charAt(0)?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer de Navegación */}
      <Box
        component="nav"
        className="admin-layout__nav-container"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH 
            }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              borderRight: `1px solid ${theme.palette.divider}`
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Contenido Principal */}
      <Box
        component="main"
        className="admin-layout__content"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          px: 3,
          pt: 3,
          pb: 0,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          overflow: 'hidden'
        }}
      >
        <Toolbar />
        <Box className="admin-layout__page-content" sx={{ flexGrow: 1, mb: 3 }}>
          {children}
        </Box>

        {/* Footer del Layout */}
        <Box 
          component="footer"
          sx={{ 
            mt: 'auto',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: `1px solid ${theme.palette.divider}`,
            position: 'relative'
          }}
        >
          <Typography variant="caption" color="text.secondary">
            SAT-Digital v1.0 © 2025 Sistema de Auditorías Técnicas
          </Typography>
          
          {/* Connection Status Indicator */}
          <Box
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <Alert
              severity={connected ? 'success' : 'error'}
              variant="outlined"
              sx={{
                height: 28,
                minWidth: 120,
                borderRadius: 3,
                fontSize: '0.7rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: connected ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': {
                    boxShadow: `0 0 0 0 ${connected ? 'rgba(76, 175, 80, 0.7)' : 'rgba(244, 67, 54, 0.7)'}`
                  },
                  '70%': {
                    boxShadow: `0 0 0 8px ${connected ? 'rgba(76, 175, 80, 0)' : 'rgba(244, 67, 54, 0)'}`
                  },
                  '100%': {
                    boxShadow: `0 0 0 0 ${connected ? 'rgba(76, 175, 80, 0)' : 'rgba(244, 67, 54, 0)'}`
                  }
                },
                '& .MuiAlert-message': {
                  padding: '10px',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                },
                '& .MuiAlert-icon': {
                  fontSize: '0.85rem',
                  marginRight: 0.5,
                  display: 'flex',
                  alignItems: 'center'
                },
                '& .MuiAlert-action': {
                  display: 'none'
                }
              }}
            >
              {connected ? 'Conectado' : 'Desconectado'}
            </Alert>
          </Box>
        </Box>

        {/* Menu de Usuario */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          className="admin-layout__user-menu-dropdown"
        >
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mi Perfil</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <SecurityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Configuración</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Cerrar Sesión</ListItemText>
          </MenuItem>
        </Menu>

        {/* Menu de Notificaciones */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          className="admin-layout__notifications-dropdown"
          PaperProps={{
            sx: { width: 320, maxHeight: 400 }
          }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6">Notificaciones</Typography>
          </Box>
          <MenuItem onClick={handleNotificationClose}>
            <ListItemIcon>
              <AssignmentIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Nueva auditoría asignada"
              secondary="CAT-TECHNOLOGIES - hace 2 horas"
            />
          </MenuItem>
          <MenuItem onClick={handleNotificationClose}>
            <ListItemIcon>
              <NotificationsIcon color="warning" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Documentos pendientes"
              secondary="APEX CBA - vence mañana"
            />
          </MenuItem>
          <MenuItem onClick={handleNotificationClose}>
            <ListItemIcon>
              <ReportsIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Reporte generado"
              secondary="Grupo Activo - disponible"
            />
          </MenuItem>
        </Menu>

        {/* Sistema de notificaciones toast global */}
        <NotificacionesToast />
        
        {/* Búsqueda Global */}
        <GlobalSearch 
          open={searchOpen} 
          onClose={() => setSearchOpen(false)} 
        />
      </Box>
    </Box>
  );
};

export default AdminLayout;