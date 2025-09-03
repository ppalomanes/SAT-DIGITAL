// Dashboard para administradores
// src/domains/dashboard/pages/AdminDashboard.jsx

import { Box, Typography, Grid, Card, CardContent } from '@mui/material';

function AdminDashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Panel de Administración
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Usuarios Activos
              </Typography>
              <Typography variant="h5">
                12
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Proveedores
              </Typography>
              <Typography variant="h5">
                5
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Auditorías Activas
              </Typography>
              <Typography variant="h5">
                8
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pendientes Revisión
              </Typography>
              <Typography variant="h5">
                3
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
        Dashboard de administrador - Implementación completa en desarrollo
      </Typography>
    </Box>
  );
}

export default AdminDashboard;