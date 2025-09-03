const { SeccionTecnica } = require('../models');

const secciones = [
  {
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

async function seedSeccionesTecnicas() {
  try {
    console.log('🌱 Sembrando secciones técnicas...');
    
    for (const seccion of secciones) {
      const [seccionCreada, created] = await SeccionTecnica.findOrCreate({
        where: { codigo: seccion.codigo },
        defaults: seccion
      });
      
      if (created) {
        console.log(`✅ Sección creada: ${seccion.nombre}`);
      } else {
        console.log(`📋 Sección ya existe: ${seccion.nombre}`);
      }
    }
    
    console.log('🎉 Secciones técnicas sembradas exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error sembrando secciones técnicas:', error);
    throw error;
  }
}

module.exports = {
  seedSeccionesTecnicas,
  secciones
};