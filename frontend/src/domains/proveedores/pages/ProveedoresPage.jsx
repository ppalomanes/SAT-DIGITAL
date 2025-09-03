import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
} from '@mui/material';
import { Add, Business } from '@mui/icons-material';

/**
 * Página de gestión de proveedores - Administradores y auditores
 */
const ProveedoresPage = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Gestión de Proveedores
          </Typography>
          <Chip
            icon={<Business />}
            label="Administradores y Auditores"
            color="secondary"
            size="small"
          />
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          color="secondary"
          onClick={() => console.log('Próximamente: Crear proveedor')}
        >
          Nuevo Proveedor
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Lista de Proveedores
          </Typography>
          <Typography color="textSecondary">
            Próximamente: Gestión completa de proveedores y sus sitios.
            Funcionalidades:
          </Typography>
          <ul style={{ marginTop: '16px', color: '#666' }}>
            <li>CRUD de proveedores (5 proveedores actuales)</li>
            <li>Gestión de sitios por proveedor (12 sitios totales)</li>
            <li>Información de contacto y CUIT</li>
            <li>Estado de auditorías por proveedor</li>
            <li>Métricas de cumplimiento histórico</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProveedoresPage;
