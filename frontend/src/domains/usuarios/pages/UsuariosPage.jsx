import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  TablePagination,
} from '@mui/material';
import {
  Add,
  People,
  Search as SearchIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { apiClient } from '../../../shared/utils/authService';
import { proveedoresService } from '../../proveedores/services/proveedoresService';

const ROL_LABELS = {
  admin: 'Administrador',
  auditor_general: 'Auditor General',
  auditor_interno: 'Auditor Interno',
  jefe_proveedor: 'Jefe Proveedor',
  tecnico_proveedor: 'Técnico Proveedor',
  visualizador: 'Visualizador',
};

const ROL_COLORS = {
  admin: 'error',
  auditor_general: 'primary',
  auditor_interno: 'info',
  jefe_proveedor: 'warning',
  tecnico_proveedor: 'default',
  visualizador: 'success',
};

const ROLES_PROVEEDOR = ['jefe_proveedor', 'tecnico_proveedor'];

const EMPTY_FORM = {
  nombre: '',
  email: '',
  password: '',
  rol: 'auditor_interno',
  proveedor_id: '',
  estado: 'activo',
};

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filtros
  const [search, setSearch] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Diálogos
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = crear, object = editar
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const cargarProveedores = useCallback(async () => {
    try {
      const data = await proveedoresService.getProveedores();
      setProveedores(Array.isArray(data) ? data : (data?.proveedores || []));
    } catch {
      // No es bloqueante
    }
  }, []);

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search }),
        ...(filtroRol && { rol: filtroRol }),
        ...(filtroEstado && { estado: filtroEstado }),
      });
      const resp = await apiClient.get(`/usuarios?${params}`);
      setUsuarios(resp.data?.usuarios || []);
      setTotal(resp.data?.pagination?.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, filtroRol, filtroEstado]);

  useEffect(() => {
    cargarProveedores();
  }, [cargarProveedores]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const handleAbrirCrear = () => {
    setEditingUser(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleAbrirEditar = (usuario) => {
    setEditingUser(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      proveedor_id: usuario.proveedor_id || '',
      estado: usuario.estado,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleGuardar = async () => {
    setFormError(null);

    if (!formData.nombre.trim() || !formData.email.trim()) {
      setFormError('Nombre y email son obligatorios');
      return;
    }
    if (!editingUser && !formData.password) {
      setFormError('La contraseña es obligatoria para nuevos usuarios');
      return;
    }
    if (ROLES_PROVEEDOR.includes(formData.rol) && !formData.proveedor_id) {
      setFormError('Debe seleccionar un proveedor para este rol');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        rol: formData.rol,
        estado: formData.estado,
        ...(ROLES_PROVEEDOR.includes(formData.rol) && { proveedor_id: parseInt(formData.proveedor_id) }),
        ...(!ROLES_PROVEEDOR.includes(formData.rol) && { proveedor_id: undefined }),
      };
      if (formData.password) payload.password = formData.password;

      if (editingUser) {
        await apiClient.put(`/usuarios/${editingUser.id}`, payload);
        setSuccessMsg('Usuario actualizado correctamente');
      } else {
        await apiClient.post('/usuarios', payload);
        setSuccessMsg('Usuario creado correctamente');
      }

      setDialogOpen(false);
      await cargarUsuarios();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al guardar el usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEstado = async (usuario) => {
    const nuevoEstado = usuario.estado === 'activo' ? 'inactivo' : 'activo';
    const accion = nuevoEstado === 'inactivo' ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Deseas ${accion} al usuario ${usuario.nombre}?`)) return;

    try {
      await apiClient.put(`/usuarios/${usuario.id}`, { estado: nuevoEstado });
      setSuccessMsg(`Usuario ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} correctamente`);
      await cargarUsuarios();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar estado del usuario');
    }
  };

  const handleBuscar = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleFiltroRol = (e) => { setFiltroRol(e.target.value); setPage(0); };
  const handleFiltroEstado = (e) => { setFiltroEstado(e.target.value); setPage(0); };

  return (
    <Box>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Gestión de Usuarios
          </Typography>
          <Chip icon={<People />} label="Solo administradores" color="primary" size="small" />
        </div>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={cargarUsuarios}>
            Actualizar
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={handleAbrirCrear}>
            Nuevo Usuario
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              size="small"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={handleBuscar}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              sx={{ flex: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Rol</InputLabel>
              <Select value={filtroRol} label="Rol" onChange={handleFiltroRol}>
                <MenuItem value="">Todos</MenuItem>
                {Object.entries(ROL_LABELS).map(([val, label]) => (
                  <MenuItem key={val} value={val}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Estado</InputLabel>
              <Select value={filtroEstado} label="Estado" onChange={handleFiltroEstado}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="inactivo">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : usuarios.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">No se encontraron usuarios con los filtros aplicados</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Proveedor</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuarios.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">{u.nombre}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ROL_LABELS[u.rol] || u.rol}
                          color={ROL_COLORS[u.rol] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {u.proveedor?.nombre_comercial || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={u.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          color={u.estado === 'activo' ? 'success' : 'default'}
                          size="small"
                          variant={u.estado === 'activo' ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleAbrirEditar(u)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={u.estado === 'activo' ? 'Desactivar' : 'Activar'}>
                            <IconButton
                              size="small"
                              color={u.estado === 'activo' ? 'error' : 'success'}
                              onClick={() => handleToggleEstado(u)}
                            >
                              {u.estado === 'activo'
                                ? <BlockIcon fontSize="small" />
                                : <ActiveIcon fontSize="small" />
                              }
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
              rowsPerPageOptions={[10, 25, 50]}
              labelRowsPerPage="Filas por página"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            />
          </>
        )}
      </Paper>

      {/* Diálogo crear/editar */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Nombre completo"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label={editingUser ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
              required={!editingUser}
            />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.rol}
                label="Rol"
                onChange={(e) => setFormData({ ...formData, rol: e.target.value, proveedor_id: '' })}
              >
                {Object.entries(ROL_LABELS).map(([val, label]) => (
                  <MenuItem key={val} value={val}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {ROLES_PROVEEDOR.includes(formData.rol) && (
              <FormControl fullWidth required>
                <InputLabel>Proveedor</InputLabel>
                <Select
                  value={formData.proveedor_id}
                  label="Proveedor"
                  onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                >
                  {proveedores.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.nombre_comercial || p.razon_social}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.estado}
                label="Estado"
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              >
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="inactivo">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleGuardar} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : editingUser ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsuariosPage;
