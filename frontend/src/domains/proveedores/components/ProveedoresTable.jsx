/**
 * Tabla de proveedores con CRUD completo
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Card,
  CardContent,
  Collapse,
  Button,
  Alert
} from '@mui/material';
import {
  Edit,
  Delete,
  MoreVert,
  Business,
  LocationOn,
  Phone,
  Email,
  ExpandMore,
  ExpandLess,
  Assessment
} from '@mui/icons-material';
import { useProveedoresStore } from '../store/proveedoresStore';

const ProveedoresTable = ({ onEdit, onDelete, onViewSitios }) => {
  const {
    proveedores,
    sitios,
    loading,
    error,
    fetchProveedores,
    fetchSitiosByProveedor
  } = useProveedoresStore();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  const handleMenuClick = (event, proveedor) => {
    setAnchorEl(event.currentTarget);
    setSelectedProveedor(proveedor);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProveedor(null);
  };

  const handleExpandRow = async (proveedorId) => {
    const newExpanded = new Set(expandedRows);
    if (expandedRows.has(proveedorId)) {
      newExpanded.delete(proveedorId);
    } else {
      newExpanded.add(proveedorId);
      await fetchSitiosByProveedor(proveedorId);
    }
    setExpandedRows(newExpanded);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo':
        return 'success';
      case 'inactivo':
        return 'error';
      case 'suspendido':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getSitiosProveedor = (proveedorId) => {
    return sitios.filter(sitio => sitio.proveedor_id === proveedorId);
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error al cargar proveedores: {error}
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Proveedores Registrados ({Array.isArray(proveedores) ? proveedores.length : 0})
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell><strong>Razón Social</strong></TableCell>
                <TableCell><strong>CUIT</strong></TableCell>
                <TableCell><strong>Nombre Comercial</strong></TableCell>
                <TableCell><strong>Contacto Principal</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell align="center"><strong>Sitios</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">Cargando...</Typography>
                  </TableCell>
                </TableRow>
              ) : (!Array.isArray(proveedores) || proveedores.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">No hay proveedores registrados</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                (Array.isArray(proveedores) ? proveedores : []).map((proveedor) => (
                  <React.Fragment key={proveedor.id}>
                    {/* Fila principal del proveedor */}
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleExpandRow(proveedor.id)}
                        >
                          {expandedRows.has(proveedor.id) ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {proveedor.razon_social}
                          </Typography>
                          {proveedor.email_contacto && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Email sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {proveedor.email_contacto}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {proveedor.cuit}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Business />}
                          label={proveedor.nombre_comercial}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {proveedor.contacto_principal}
                          </Typography>
                          {proveedor.telefono && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Phone sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {proveedor.telefono}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={proveedor.estado.toUpperCase()}
                          color={getEstadoColor(proveedor.estado)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getSitiosProveedor(proveedor.id).length}
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, proveedor)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    {/* Fila expandible con sitios */}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                        <Collapse in={expandedRows.has(proveedor.id)} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Sitios del Proveedor ({getSitiosProveedor(proveedor.id).length})
                            </Typography>
                            {getSitiosProveedor(proveedor.id).length === 0 ? (
                              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                No hay sitios registrados para este proveedor
                              </Typography>
                            ) : (
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell><strong>Nombre del Sitio</strong></TableCell>
                                    <TableCell><strong>Localidad</strong></TableCell>
                                    <TableCell><strong>Domicilio</strong></TableCell>
                                    <TableCell><strong>Estado</strong></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {getSitiosProveedor(proveedor.id).map((sitio) => (
                                    <TableRow key={sitio.id}>
                                      <TableCell>
                                        <Typography variant="body2">
                                          {sitio.nombre}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                          <Typography variant="body2">
                                            {sitio.localidad}
                                          </Typography>
                                        </Box>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                          {sitio.domicilio}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                          label={sitio.estado.toUpperCase()}
                                          color={getEstadoColor(sitio.estado)}
                                          size="small"
                                          variant="outlined"
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Menú contextual */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            onEdit && onEdit(selectedProveedor);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Editar</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            onViewSitios && onViewSitios(selectedProveedor);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <LocationOn fontSize="small" />
            </ListItemIcon>
            <ListItemText>Gestionar Sitios</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            // TODO: Implementar métricas
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Assessment fontSize="small" />
            </ListItemIcon>
            <ListItemText>Ver Métricas</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              onDelete && onDelete(selectedProveedor);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Eliminar</ListItemText>
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

export default ProveedoresTable;