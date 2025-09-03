// Layout público para login y páginas sin autenticación
// src/shared/components/Layout/PublicLayout.jsx

import { Box, Container, Paper, Typography } from '@mui/material';

function PublicLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'grey.50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            color="primary"
            textAlign="center"
          >
            SAT-Digital
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            textAlign="center"
            mb={3}
          >
            Sistema de Auditorías Técnicas Digitalizado
          </Typography>
          {children}
        </Paper>
      </Container>
    </Box>
  );
}

export default PublicLayout;