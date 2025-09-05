import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../domains/auth/store/authStore';
import {
  Dashboard,
  People,
  Business,
  Assignment,
  Settings,
  AccountCircle,
  Logout,
  ChevronLeft,
  NotificationsNone,
  CalendarToday,
  DescriptionOutlined,
  ChatOutlined,
} from '@mui/icons-material';
import {
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Typography,
  Badge,
  Box,
  Drawer,
  AppBar,
  Toolbar,
} from '@mui/material';

const SIDEBAR_ITEMS = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: 'all' },
  { text: 'Calendario', icon: <CalendarToday />, path: '/calendario', roles: ['admin', 'auditor'] },
  { text: 'Auditorías', icon: <Assignment />, path: '/auditorias', roles: 'all' },
  { text: 'Documentos', icon: <DescriptionOutlined />, path: '/documentos', roles: 'all' },
  { text: 'Comunicación', icon: <ChatOutlined />, path: '/comunicacion', roles: 'all' },
  { text: 'Proveedores', icon: <Business />, path: '/proveedores', roles: ['admin', 'auditor'] },
  { text: 'Usuarios', icon: <People />, path: '/usuarios', roles: ['admin'] },
  { text: 'Configuración', icon: <Settings />, path: '/configuracion', roles: 'all' },
];

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 70;

const MainLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuthStore();
  
  // Mock data del usuario si no existe
  const usuarioActual = usuario || { nombre: 'Usuario Sistema', email: 'usuario@sistema.com', rol: 'admin' };

  const filteredSidebarItems = SIDEBAR_ITEMS.filter(item => {
    if (item.roles === 'all') return true;
    return true;
  });

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const currentItem = SIDEBAR_ITEMS.find(item => item.path === location.pathname);
    return currentItem ? currentItem.text : 'Settings';
  };

  const getUserInitials = (nombre) => {
    return nombre?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const drawer = (
    <Box
    sx={{
    height: '100%',
    background: 'linear-gradient(145deg, #1a1a1a 0%, #2d3748 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
      overflow: 'hidden',
          width: '100%',
        }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          height: 80,
          overflow: 'hidden',
        }}
      >
        <Box
          onClick={handleSidebarToggle}
          sx={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: sidebarCollapsed ? 0 : 1.5,
            cursor: 'pointer',
            flexShrink: 0,
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <Dashboard sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        {!sidebarCollapsed && (
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '16px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            SAT-Digital
          </Typography>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 3, overflow: 'hidden' }}>
        {filteredSidebarItems.map((item, index) => (
          <Box
            key={item.text}
            sx={{
              mx: 1.5,
              mb: 0.5,
              borderRadius: 1.5,
              position: 'relative',
            }}
          >
            <Box
              onClick={() => handleNavigation(item.path)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: sidebarCollapsed ? 0 : 2,
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                p: '14px 16px',
                color: location.pathname === item.path ? 'white' : 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                borderRadius: 1.5,
                background: location.pathname === item.path 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'transparent',
                boxShadow: location.pathname === item.path 
                  ? '0 4px 15px rgba(102, 126, 234, 0.4)'
                  : 'none',
                '&:hover': {
                  bgcolor: location.pathname === item.path 
                    ? 'transparent' 
                    : 'rgba(255, 255, 255, 0.08)',
                  color: 'white',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Box sx={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.icon}
              </Box>
              {!sidebarCollapsed && (
                <Typography sx={{ fontSize: '14px', fontWeight: 500, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {item.text}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
        <Box
        onClick={handleUserMenuOpen}
        sx={{
        display: 'flex',
        alignItems: 'center',
        gap: sidebarCollapsed ? 0 : 1.5,
        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
        p: 1.5,
        borderRadius: 1.5,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'rgba(255, 255, 255, 0.05)',
        },
          transition: 'all 0.2s ease',
            }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: sidebarCollapsed ? 2 : 1.25,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: sidebarCollapsed ? '18px' : '14px',
              flexShrink: 0,
            }}
          >
            {getUserInitials(usuarioActual?.nombre)}
          </Box>
          {!sidebarCollapsed && (
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 600 }} noWrap>
                {usuarioActual?.nombre || 'Usuario'}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }} noWrap>
                {usuarioActual?.email || 'Sin email'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${sidebarCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px)` },
          ml: { sm: `${sidebarCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px` },
          bgcolor: 'white',
          color: '#1a202c',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar>
          <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>
            {getPageTitle()}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton>
              <Badge badgeContent={4} color="error">
                <NotificationsNone />
              </Badge>
            </IconButton>
            
            <Box
              component="button"
              sx={{
                px: 2,
                py: 1,
                border: 'none',
                borderRadius: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Upgrade
            </Box>
            
            <Box
              component="button"
              sx={{
                px: 2,
                py: 1,
                border: '1px solid #e2e8f0',
                borderRadius: 1,
                bgcolor: 'white',
                color: '#4a5568',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': {
                  borderColor: '#667eea',
                  color: '#667eea',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <AccountCircle sx={{ fontSize: 18 }} />
              Invite
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: sidebarCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              border: 'none',
            },
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
              width: sidebarCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
              border: 'none',
              transition: 'width 0.3s ease',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: '#f5f7fa',
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar />
        {children}
      </Box>

      {/* User menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              fontSize: '14px',
            },
          },
        }}
      >
        <MenuItem disabled>
          <Box>
            <Typography variant="subtitle2">
              {usuarioActual?.nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {usuarioActual?.email}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => navigate('/configuracion')}>
          <Settings fontSize="small" sx={{ mr: 1 }} />
          Configuración
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout fontSize="small" sx={{ mr: 1 }} />
          Cerrar Sesión
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MainLayout;