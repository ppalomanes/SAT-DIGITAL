import React, { useState } from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import CargaDocumental from '../domains/documentos/components/CargaDocumental';

const secciones = [
  {
    id: 1,
    codigo: 'topologia_red',
    nombre: 'Topología de Red',
    descripcion: 'Documentación de la topología de red del sitio',
    tipo_analisis: 'tiempo_real',
    obligatoria: true,
    orden_presentacion: 1,
    formatos_permitidos: ['pdf'],
    tamaño_maximo_mb: 50
  },
  {
    id: 2,
    codigo: 'documentacion_controles_infraestructura',
    nombre: 'Documentación y Controles Infraestructura',
    descripcion: 'Controles y documentación de infraestructura técnica',
    tipo_analisis: 'tiempo_real',
    obligatoria: true,
    orden_presentacion: 2,
    formatos_permitidos: ['pdf', 'xlsx'],
    tamaño_maximo_mb: 100
  },
  {
    id: 3,
    codigo: 'energia_cuarto_tecnologia',
    nombre: 'Energía del Cuarto de Tecnología',
    descripcion: 'Documentación del sistema eléctrico y UPS',
    tipo_analisis: 'tiempo_real',
    obligatoria: true,
    orden_presentacion: 3,
    formatos_permitidos: ['pdf', 'jpg', 'jpeg', 'png'],
    tamaño_maximo_mb: 100
  },
  {
    id: 11,
    codigo: 'parque_informatico',
    nombre: 'Estado del Hardware, Software, Headset e Internet en el Hogar',
    descripcion: 'Inventario completo del parque informático',
    tipo_analisis: 'lotes',
    obligatoria: true,
    orden_presentacion: 11,
    formatos_permitidos: ['xlsx'],
    tamaño_maximo_mb: 10
  },
  {
    id: 9,
    codigo: 'cuarto_tecnologia',
    nombre: 'Cuarto de Tecnología',
    descripcion: 'Fotografías y documentación del cuarto técnico',
    tipo_analisis: 'lotes',
    obligatoria: true,
    orden_presentacion: 9,
    formatos_permitidos: ['jpg', 'jpeg', 'png', 'pdf'],
    tamaño_maximo_mb: 200
  }
];

const TestCargaDocumental = () => {
  const [auditoriaTest] = useState(1); // ID de auditoría de prueba

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Checkpoint 2.2 - Sistema de Carga Documental
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Prueba del sistema de carga de documentos con drag-and-drop,
            validaciones automáticas y control de versiones.
          </Typography>
        </Box>

        <CargaDocumental 
          auditoriaId={auditoriaTest}
          seccionesDisponibles={secciones}
        />
      </Paper>
    </Container>
  );
};

export default TestCargaDocumental;