import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
} from '@mui/material';
import { Add, People } from '@mui/icons-material';

/**
 * Página de gestión de usuarios - Solo administradores
 */
const UsuariosPage = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Gestión de Usuarios
          </Typography>
          <Chip
            icon={<People />}
            label="Solo administradores"
            color="primary"
            size="small"
          />
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => console.log('Próximamente: Crear usuario')}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Lista de Usuarios
          </Typography>
          <Typography color="textSecondary">
            Próximamente: Tabla completa con usuarios del sistema, roles, estado, etc.
            Funcionalidades:
          </Typography>
          <ul style={{ marginTop: '16px', color: '#666' }}>
            <li>CRUD completo de usuarios</li>
            <li>Asignación de roles y permisos</li>
            <li>Filtrado por rol y estado</li>
            <li>Búsqueda por nombre/email</li>
            <li>Auditoría de accesos</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UsuariosPage;
