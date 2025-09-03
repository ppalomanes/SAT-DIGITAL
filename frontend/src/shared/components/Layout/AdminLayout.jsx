import { useState } from 'react';
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
  Chip
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
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuthStore } from '../../../domains/auth/store/authStore';

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
      icon: <BarChartIcon />,
      path: '/analytics',
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
      icon: <BarChartIcon />,
      path: '/analytics',
      badge: null
    }
  ]
};

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuthStore();

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
    <Box className="admin-layout__drawer">
      {/* Header del Drawer */}
      <Box 
        className="admin-layout__drawer-header"
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" component="h1" fontWeight="bold" mb={1}>
          SAT-Digital
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Sistema de Auditorías Técnicas
        </Typography>
      </Box>

      {/* Información del Usuario */}
      <Box 
        className="admin-layout__user-info"
        sx={{
          p: 2,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40,
              bgcolor: getRolColor(usuario?.rol)
            }}
          >
            {usuario?.nombre?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography variant="subtitle2" fontWeight="bold" noWrap>
              {usuario?.nombre || 'Usuario'}
            </Typography>
            <Chip 
              label={usuario?.rol?.charAt(0).toUpperCase() + usuario?.rol?.slice(1)}
              size="small"
              sx={{
                backgroundColor: getRolColor(usuario?.rol),
                color: 'white',
                fontSize: '0.75rem',
                height: 20
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Navegación */}
      <List className="admin-layout__nav" sx={{ px: 1, py: 2 }}>
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

      {/* Footer del Drawer */}
      <Box 
        className="admin-layout__drawer-footer"
        sx={{
          mt: 'auto',
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
          SAT-Digital v1.0
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
          © 2025 Sistema de Auditorías
        </Typography>
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
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: alpha(theme.palette.primary.main, 0.02)
        }}
      >
        <Toolbar />
        <Box className="admin-layout__page-content">
          {children}
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
      </Box>
    </Box>
  );
};

export default AdminLayout;