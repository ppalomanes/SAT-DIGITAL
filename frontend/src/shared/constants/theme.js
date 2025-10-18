/**
 * SAT-Digital - Constantes de Tema
 * Colores y estilos centralizados para consistencia
 *
 * Uso:
 * import { THEME_COLORS, ESTADOS_AUDITORIA } from '@/shared/constants/theme';
 */

/**
 * COLORES PRINCIPALES DEL TEMA
 * Evita duplicación de códigos de color en múltiples archivos
 */
export const THEME_COLORS = {
  // Colores primarios
  primary: {
    main: '#206bc4',
    dark: '#185a9d',
    light: '#3d7cc4',
    lighter: '#e6f2ff',
    contrastText: '#ffffff',
  },

  // Colores secundarios
  secondary: {
    main: '#6c757d',
    dark: '#545b62',
    light: '#868e96',
    contrastText: '#ffffff',
  },

  // Estados semánticos
  success: {
    main: '#2fb344',
    dark: '#238b34',
    light: '#4ec165',
    lighter: '#e6f9ea',
    contrastText: '#ffffff',
  },

  warning: {
    main: '#fd7e14',
    dark: '#dc6502',
    light: '#fd9843',
    lighter: '#fff3e6',
    contrastText: '#ffffff',
  },

  error: {
    main: '#d63384',
    dark: '#b02868',
    light: '#de5c9d',
    lighter: '#fce8f3',
    contrastText: '#ffffff',
  },

  info: {
    main: '#17a2b8',
    dark: '#117a8b',
    light: '#3fb5c9',
    lighter: '#e6f7f9',
    contrastText: '#ffffff',
  },

  // Escala de grises
  grey: {
    50: '#f8f9fa',
    100: '#f1f3f5',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#6c757d',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
  },

  // Backgrounds
  background: {
    default: '#ffffff',
    paper: '#ffffff',
    dark: '#f8f9fa',
    darker: '#e9ecef',
  },

  // Texto
  text: {
    primary: '#212529',
    secondary: '#6c757d',
    disabled: '#adb5bd',
    hint: '#ced4da',
  },
};

/**
 * ESTADOS DE AUDITORÍA
 * Configuración de colores y estilos por estado
 */
export const ESTADOS_AUDITORIA = {
  programada: {
    label: 'Programada',
    color: '#17a2b8',
    backgroundColor: '#e6f7f9',
    icon: '📅',
    descripcion: 'Auditoría programada, pendiente de inicio',
  },

  en_carga: {
    label: 'En Carga',
    color: '#fd7e14',
    backgroundColor: '#fff3e6',
    icon: '📤',
    descripcion: 'Proveedor cargando documentación',
  },

  en_evaluacion: {
    label: 'En Evaluación',
    color: '#206bc4',
    backgroundColor: '#e6f2ff',
    icon: '🔍',
    descripcion: 'Auditor evaluando documentación',
  },

  completada: {
    label: 'Completada',
    color: '#2fb344',
    backgroundColor: '#e6f9ea',
    icon: '✅',
    descripcion: 'Auditoría finalizada exitosamente',
  },

  observada: {
    label: 'Observada',
    color: '#d63384',
    backgroundColor: '#fce8f3',
    icon: '⚠️',
    descripcion: 'Auditoría con observaciones',
  },

  vencida: {
    label: 'Vencida',
    color: '#dc3545',
    backgroundColor: '#ffe6e9',
    icon: '⏰',
    descripcion: 'Auditoría fuera de plazo',
  },

  // Alias comunes para compatibilidad con mock data
  'en progreso': {
    label: 'En Progreso',
    color: '#fd7e14',
    backgroundColor: '#fff3e6',
    icon: '📤',
    descripcion: 'Auditoría en progreso',
  },

  pendiente: {
    label: 'Pendiente',
    color: '#17a2b8',
    backgroundColor: '#e6f7f9',
    icon: '📅',
    descripcion: 'Auditoría pendiente',
  },

  revisión: {
    label: 'Revisión',
    color: '#206bc4',
    backgroundColor: '#e6f2ff',
    icon: '🔍',
    descripcion: 'Auditoría en revisión',
  },
};

/**
 * NIVELES DE CUMPLIMIENTO
 * Colores para indicadores de cumplimiento
 */
export const NIVELES_CUMPLIMIENTO = {
  excelente: {
    label: 'Excelente',
    color: '#2fb344',
    backgroundColor: '#e6f9ea',
    min: 90,
    max: 100,
  },

  bueno: {
    label: 'Bueno',
    color: '#17a2b8',
    backgroundColor: '#e6f7f9',
    min: 75,
    max: 89,
  },

  regular: {
    label: 'Regular',
    color: '#fd7e14',
    backgroundColor: '#fff3e6',
    min: 60,
    max: 74,
  },

  deficiente: {
    label: 'Deficiente',
    color: '#d63384',
    backgroundColor: '#fce8f3',
    min: 40,
    max: 59,
  },

  critico: {
    label: 'Crítico',
    color: '#dc3545',
    backgroundColor: '#ffe6e9',
    min: 0,
    max: 39,
  },
};

/**
 * PRIORIDADES
 * Colores para niveles de prioridad
 */
export const PRIORIDADES = {
  alta: {
    label: 'Alta',
    color: '#dc3545',
    backgroundColor: '#ffe6e9',
    icon: '🔴',
  },

  media: {
    label: 'Media',
    color: '#fd7e14',
    backgroundColor: '#fff3e6',
    icon: '🟡',
  },

  baja: {
    label: 'Baja',
    color: '#17a2b8',
    backgroundColor: '#e6f7f9',
    icon: '🟢',
  },
};

/**
 * ROLES DE USUARIO
 * Configuración visual por rol
 */
export const ROLES_USUARIO = {
  admin: {
    label: 'Administrador',
    color: '#d63384',
    backgroundColor: '#fce8f3',
    icon: '👑',
  },

  auditor_general: {
    label: 'Auditor General',
    color: '#206bc4',
    backgroundColor: '#e6f2ff',
    icon: '🔍',
  },

  auditor_interno: {
    label: 'Auditor Interno',
    color: '#17a2b8',
    backgroundColor: '#e6f7f9',
    icon: '🔎',
  },

  jefe_proveedor: {
    label: 'Jefe de Proveedor',
    color: '#fd7e14',
    backgroundColor: '#fff3e6',
    icon: '👤',
  },

  tecnico_proveedor: {
    label: 'Técnico de Proveedor',
    color: '#6c757d',
    backgroundColor: '#f1f3f5',
    icon: '🔧',
  },

  visualizador: {
    label: 'Visualizador',
    color: '#2fb344',
    backgroundColor: '#e6f9ea',
    icon: '👁️',
  },
};

/**
 * Obtiene el color de un estado de auditoría
 * @param {string} estado - Estado de la auditoría
 * @returns {object} Objeto con color y backgroundColor
 */
export const getEstadoColor = (estado) => {
  const estadoNormalizado = estado?.toLowerCase().replace(/ /g, '_');
  const config = ESTADOS_AUDITORIA[estadoNormalizado];

  if (!config) {
    return {
      color: THEME_COLORS.grey[600],
      backgroundColor: THEME_COLORS.grey[100],
    };
  }

  return {
    color: config.color,
    backgroundColor: config.backgroundColor,
  };
};

/**
 * Obtiene el nivel de cumplimiento según el porcentaje
 * @param {number} porcentaje - Porcentaje de cumplimiento (0-100)
 * @returns {object} Configuración del nivel de cumplimiento
 */
export const getNivelCumplimiento = (porcentaje) => {
  const nivel = Object.values(NIVELES_CUMPLIMIENTO).find(
    (n) => porcentaje >= n.min && porcentaje <= n.max
  );

  return nivel || NIVELES_CUMPLIMIENTO.critico;
};

/**
 * Obtiene la configuración de un rol
 * @param {string} rol - Rol del usuario
 * @returns {object} Configuración del rol
 */
export const getRolConfig = (rol) => {
  return ROLES_USUARIO[rol] || {
    label: rol,
    color: THEME_COLORS.grey[600],
    backgroundColor: THEME_COLORS.grey[100],
    icon: '👤',
  };
};

/**
 * CONFIGURACIÓN DE GRÁFICOS
 * Paleta de colores para charts
 */
export const CHART_COLORS = [
  '#206bc4', // Primary
  '#2fb344', // Success
  '#fd7e14', // Warning
  '#d63384', // Error
  '#17a2b8', // Info
  '#6c757d', // Secondary
  '#495057', // Grey 700
  '#3fb5c9', // Info Light
  '#4ec165', // Success Light
  '#fd9843', // Warning Light
];

/**
 * SOMBRAS PREDEFINIDAS
 * Para consistencia en elevaciones
 */
export const SHADOWS = {
  none: 'none',
  xs: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0px 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0px 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0px 20px 25px rgba(0, 0, 0, 0.1)',
  '2xl': '0px 25px 50px rgba(0, 0, 0, 0.15)',
};

/**
 * TAMAÑOS DE ICONOS
 */
export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
  '2xl': 64,
};

/**
 * ESPACIADO COMÚN
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

export default {
  THEME_COLORS,
  ESTADOS_AUDITORIA,
  NIVELES_CUMPLIMIENTO,
  PRIORIDADES,
  ROLES_USUARIO,
  CHART_COLORS,
  SHADOWS,
  ICON_SIZES,
  SPACING,
  // Helper functions
  getEstadoColor,
  getNivelCumplimiento,
  getRolConfig,
};
