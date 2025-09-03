/**
 * Seeder de Umbrales Técnicos
 * Carga los criterios de validación automática para auditorías
 * 
 * @author SAT-Digital Team
 * @version 1.0.0
 * @since Checkpoint 2.4
 */

const { UmbralTecnico, SeccionTecnica } = require('../models');

const umbralesTecnicos = [
  // HARDWARE Y SOFTWARE - Sección más crítica con validaciones automáticas
  {
    seccion_codigo: 'HARDWARE_SOFTWARE',
    criterio: 'PROCESADOR_MINIMO',
    descripcion: 'Procesador mínimo requerido: Intel Core i5-8500 / AMD Ryzen 5 8500G o superior',
    tipo_validacion: 'lista',
    valores_permitidos: [
      'Intel Core i5-8500', 'Intel Core i5-9500', 'Intel Core i5-10500', 
      'Intel Core i5-11500', 'Intel Core i5-12500', 'Intel Core i5-13500',
      'Intel Core i7-8700', 'Intel Core i7-9700', 'Intel Core i7-10700',
      'Intel Core i7-11700', 'Intel Core i7-12700', 'Intel Core i7-13700',
      'AMD Ryzen 5 8500G', 'AMD Ryzen 5 9500G', 'AMD Ryzen 5 7500G',
      'AMD Ryzen 7 8700G', 'AMD Ryzen 7 9700G'
    ],
    campo_excel: 'Procesador',
    obligatorio: true,
    mensaje_error: 'El procesador no cumple con los requisitos mínimos (Intel Core i5-8500 / AMD Ryzen 5 8500G o superior)'
  },
  {
    seccion_codigo: 'HARDWARE_SOFTWARE',
    criterio: 'RAM_MINIMA',
    descripcion: 'Memoria RAM mínima: 16 GB',
    tipo_validacion: 'numerico',
    valor_minimo: '16',
    campo_excel: 'RAM_GB',
    obligatorio: true,
    mensaje_error: 'La memoria RAM debe ser mínimo 16 GB'
  },
  {
    seccion_codigo: 'HARDWARE_SOFTWARE',
    criterio: 'DISCO_SSD_MINIMO',
    descripcion: 'Disco SSD mínimo: 500 GB',
    tipo_validacion: 'numerico',
    valor_minimo: '500',
    campo_excel: 'Disco_GB',
    obligatorio: true,
    mensaje_error: 'El disco debe ser SSD con mínimo 500 GB'
  },
  {
    seccion_codigo: 'HARDWARE_SOFTWARE',
    criterio: 'SISTEMA_OPERATIVO',
    descripcion: 'Sistema operativo requerido: Windows 11',
    tipo_validacion: 'lista',
    valores_permitidos: ['Windows 11 Pro', 'Windows 11 Enterprise', 'Windows 11'],
    campo_excel: 'Sistema_Operativo',
    obligatorio: true,
    mensaje_error: 'El sistema operativo debe ser Windows 11'
  },
  {
    seccion_codigo: 'HARDWARE_SOFTWARE',
    criterio: 'VELOCIDAD_INTERNET_HOME_OFFICE',
    descripcion: 'Velocidad de internet para Home Office: 15/6 Mbps mínimo',
    tipo_validacion: 'expresion_regular',
    patron_regex: '^([1-9][5-9]|[2-9][0-9]|[0-9]{3,})/([6-9]|[1-9][0-9])\\s?Mbps$',
    campo_excel: 'Velocidad_Internet_HO',
    obligatorio: false,
    mensaje_error: 'La velocidad de internet debe ser mínimo 15/6 Mbps para Home Office'
  },
  
  // ENERGÍA DEL CUARTO DE TECNOLOGÍA
  {
    seccion_codigo: 'ENERGIA_CT',
    criterio: 'MANTENIMIENTO_UPS_VIGENTE',
    descripcion: 'Mantenimiento de UPS debe estar vigente (último año)',
    tipo_validacion: 'booleano',
    obligatorio: true,
    mensaje_error: 'Debe presentar mantenimiento de UPS del último año'
  },
  {
    seccion_codigo: 'ENERGIA_CT',
    criterio: 'TERMOGRAFIA_VIGENTE',
    descripcion: 'Termografía debe ser del último semestre',
    tipo_validacion: 'booleano',
    obligatorio: true,
    mensaje_error: 'La termografía debe ser del último semestre'
  },
  
  // TEMPERATURA CT
  {
    seccion_codigo: 'TEMPERATURA_CT',
    criterio: 'TEMPERATURA_OPERACION',
    descripcion: 'Temperatura de operación debe estar entre 18°C y 24°C',
    tipo_validacion: 'numerico',
    valor_minimo: '18',
    valor_maximo: '24',
    campo_excel: 'Temperatura_Promedio',
    obligatorio: true,
    mensaje_error: 'La temperatura debe mantenerse entre 18°C y 24°C'
  },
  
  // INTERNET
  {
    seccion_codigo: 'INTERNET',
    criterio: 'ANCHO_BANDA_MINIMO',
    descripcion: 'Ancho de banda mínimo por puesto: 2 Mbps',
    tipo_validacion: 'numerico',
    valor_minimo: '2',
    campo_excel: 'Mbps_Por_Puesto',
    obligatorio: true,
    mensaje_error: 'El ancho de banda debe ser mínimo 2 Mbps por puesto'
  },
  
  // SEGURIDAD INFORMÁTICA
  {
    seccion_codigo: 'SEGURIDAD_INFORMATICA',
    criterio: 'ANTIVIRUS_CORPORATIVO',
    descripcion: 'Debe tener antivirus corporativo instalado',
    tipo_validacion: 'booleano',
    obligatorio: true,
    mensaje_error: 'Es obligatorio contar con antivirus corporativo'
  },
  {
    seccion_codigo: 'SEGURIDAD_INFORMATICA',
    criterio: 'FIREWALL_CONFIGURADO',
    descripcion: 'Firewall debe estar configurado y activo',
    tipo_validacion: 'booleano',
    obligatorio: true,
    mensaje_error: 'El firewall debe estar configurado y activo'
  },
  
  // PERSONAL CAPACITADO
  {
    seccion_codigo: 'PERSONAL_CAPACITADO',
    criterio: 'HORARIO_COBERTURA',
    descripción: 'Cobertura de personal IT durante horario operativo',
    tipo_validacion: 'texto',
    campo_excel: 'Horario_Cobertura',
    obligatorio: true,
    mensaje_error: 'Debe especificar el horario de cobertura del personal IT'
  }
];

const seedUmbralesTecnicos = async () => {
  try {
    console.log('🔧 Sembrando umbrales técnicos...');
    
    for (const umbralData of umbralesTecnicos) {
      // Buscar la sección técnica por código
      const seccion = await SeccionTecnica.findOne({
        where: { codigo: umbralData.seccion_codigo }
      });
      
      if (!seccion) {
        console.warn(`⚠️  Sección no encontrada: ${umbralData.seccion_codigo}`);
        continue;
      }
      
      // Crear o actualizar el umbral técnico
      const [umbral, created] = await UmbralTecnico.findOrCreate({
        where: {
          seccion_id: seccion.id,
          criterio: umbralData.criterio
        },
        defaults: {
          ...umbralData,
          seccion_id: seccion.id,
          periodo_vigencia: '2025-05'
        }
      });
      
      if (created) {
        console.log(`✅ Umbral creado: ${umbralData.criterio} para ${umbralData.seccion_codigo}`);
      } else {
        console.log(`ℹ️  Umbral existente: ${umbralData.criterio}`);
      }
    }
    
    console.log('🎉 Umbrales técnicos sembrados exitosamente');
    
  } catch (error) {
    console.error('❌ Error sembrando umbrales técnicos:', error);
    throw error;
  }
};

module.exports = { seedUmbralesTecnicos, umbralesTecnicos };