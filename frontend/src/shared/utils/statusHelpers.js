/**
 * SAT-Digital - Utilidades de Estado
 * Funciones para manejo de estados de auditorías y visualización
 *
 * Uso:
 * import { getEstadoStyle, getEstadoIcon, getEstadoLabel } from '@/shared/utils/statusHelpers';
 */

import { ESTADOS_AUDITORIA, NIVELES_CUMPLIMIENTO } from '../constants/theme';

/**
 * Obtiene el estilo completo de un estado de auditoría
 *
 * @param {string} estado - Estado de la auditoría
 * @param {object} theme - Tema de MUI (opcional)
 * @returns {object} Objeto con color, backgroundColor, icon, label
 *
 * @example
 * const style = getEstadoStyle('en_progreso');
 * // { color: '#206bc4', backgroundColor: '#e6f2ff', icon: '🔍', label: 'En Progreso' }
 */
export const getEstadoStyle = (estado, theme = null) => {
  if (!estado) {
    return {
      color: '#6c757d',
      backgroundColor: '#f1f3f5',
      icon: '❓',
      label: 'Sin estado',
    };
  }

  // Normalizar el estado (convertir a snake_case y minúsculas)
  const estadoNormalizado = estado
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Eliminar acentos

  const config = ESTADOS_AUDITORIA[estadoNormalizado];

  if (!config) {
    console.warn(`Estado no reconocido: ${estado}`);
    return {
      color: '#6c757d',
      backgroundColor: '#f1f3f5',
      icon: '❓',
      label: estado,
    };
  }

  return {
    color: config.color,
    backgroundColor: config.backgroundColor,
    icon: config.icon,
    label: config.label,
    descripcion: config.descripcion,
  };
};

/**
 * Obtiene solo el color de un estado
 *
 * @param {string} estado - Estado de la auditoría
 * @returns {string} Código de color hexadecimal
 *
 * @example
 * getEstadoColor('completada') // '#2fb344'
 */
export const getEstadoColor = (estado) => {
  const style = getEstadoStyle(estado);
  return style.color;
};

/**
 * Obtiene solo el color de fondo de un estado
 *
 * @param {string} estado - Estado de la auditoría
 * @returns {string} Código de color hexadecimal
 *
 * @example
 * getEstadoBackgroundColor('completada') // '#e6f9ea'
 */
export const getEstadoBackgroundColor = (estado) => {
  const style = getEstadoStyle(estado);
  return style.backgroundColor;
};

/**
 * Obtiene el ícono de un estado
 *
 * @param {string} estado - Estado de la auditoría
 * @returns {string} Emoji del estado
 *
 * @example
 * getEstadoIcon('completada') // '✅'
 */
export const getEstadoIcon = (estado) => {
  const style = getEstadoStyle(estado);
  return style.icon;
};

/**
 * Obtiene la etiqueta formateada de un estado
 *
 * @param {string} estado - Estado de la auditoría
 * @returns {string} Etiqueta legible
 *
 * @example
 * getEstadoLabel('en_evaluacion') // 'En Evaluación'
 */
export const getEstadoLabel = (estado) => {
  const style = getEstadoStyle(estado);
  return style.label;
};

/**
 * Obtiene la configuración de nivel de cumplimiento según porcentaje
 *
 * @param {number} porcentaje - Porcentaje de cumplimiento (0-100)
 * @returns {object} Configuración del nivel
 *
 * @example
 * const nivel = getNivelCumplimiento(85);
 * // { label: 'Bueno', color: '#17a2b8', backgroundColor: '#e6f7f9', min: 75, max: 89 }
 */
export const getNivelCumplimiento = (porcentaje) => {
  if (porcentaje === null || porcentaje === undefined || isNaN(porcentaje)) {
    return {
      label: 'Sin evaluar',
      color: '#6c757d',
      backgroundColor: '#f1f3f5',
      min: 0,
      max: 0,
    };
  }

  const valor = Number(porcentaje);

  // Encontrar el nivel correspondiente
  const nivel = Object.values(NIVELES_CUMPLIMIENTO).find(
    (n) => valor >= n.min && valor <= n.max
  );

  return nivel || NIVELES_CUMPLIMIENTO.critico;
};

/**
 * Obtiene el color según el nivel de cumplimiento
 *
 * @param {number} porcentaje - Porcentaje de cumplimiento
 * @returns {string} Color hexadecimal
 *
 * @example
 * getCumplimientoColor(95) // '#2fb344' (verde - excelente)
 */
export const getCumplimientoColor = (porcentaje) => {
  const nivel = getNivelCumplimiento(porcentaje);
  return nivel.color;
};

/**
 * Obtiene el color de fondo según el nivel de cumplimiento
 *
 * @param {number} porcentaje - Porcentaje de cumplimiento
 * @returns {string} Color hexadecimal de fondo
 *
 * @example
 * getCumplimientoBackgroundColor(95) // '#e6f9ea'
 */
export const getCumplimientoBackgroundColor = (porcentaje) => {
  const nivel = getNivelCumplimiento(porcentaje);
  return nivel.backgroundColor;
};

/**
 * Verifica si un estado es final (completada, observada, vencida)
 *
 * @param {string} estado - Estado a verificar
 * @returns {boolean} true si es estado final
 *
 * @example
 * isEstadoFinal('completada') // true
 * isEstadoFinal('en_carga') // false
 */
export const isEstadoFinal = (estado) => {
  const estadosFinales = ['completada', 'observada', 'vencida'];
  const estadoNormalizado = estado?.toLowerCase().replace(/\s+/g, '_');
  return estadosFinales.includes(estadoNormalizado);
};

/**
 * Verifica si un estado es en progreso
 *
 * @param {string} estado - Estado a verificar
 * @returns {boolean} true si está en progreso
 *
 * @example
 * isEstadoEnProgreso('en_carga') // true
 * isEstadoEnProgreso('completada') // false
 */
export const isEstadoEnProgreso = (estado) => {
  const estadosEnProgreso = ['en_carga', 'en_evaluacion'];
  const estadoNormalizado = estado?.toLowerCase().replace(/\s+/g, '_');
  return estadosEnProgreso.includes(estadoNormalizado);
};

/**
 * Obtiene el siguiente estado en el flujo de auditoría
 *
 * @param {string} estadoActual - Estado actual
 * @returns {string|null} Siguiente estado o null si es final
 *
 * @example
 * getNextEstado('programada') // 'en_carga'
 * getNextEstado('completada') // null
 */
export const getNextEstado = (estadoActual) => {
  const flujo = {
    programada: 'en_carga',
    en_carga: 'en_evaluacion',
    en_evaluacion: 'completada',
    observada: 'en_carga', // Permite reinicio
    completada: null,
    vencida: null,
  };

  const estadoNormalizado = estadoActual?.toLowerCase().replace(/\s+/g, '_');
  return flujo[estadoNormalizado] || null;
};

/**
 * Obtiene el estado anterior en el flujo
 *
 * @param {string} estadoActual - Estado actual
 * @returns {string|null} Estado anterior o null si es el primero
 *
 * @example
 * getPreviousEstado('en_evaluacion') // 'en_carga'
 * getPreviousEstado('programada') // null
 */
export const getPreviousEstado = (estadoActual) => {
  const flujo = {
    en_carga: 'programada',
    en_evaluacion: 'en_carga',
    completada: 'en_evaluacion',
    observada: 'en_evaluacion',
    programada: null,
    vencida: null,
  };

  const estadoNormalizado = estadoActual?.toLowerCase().replace(/\s+/g, '_');
  return flujo[estadoNormalizado] || null;
};

/**
 * Obtiene todos los estados disponibles
 *
 * @returns {Array} Lista de estados con sus configuraciones
 *
 * @example
 * const estados = getAllEstados();
 * // [{ key: 'programada', label: 'Programada', color: '#17a2b8', ... }, ...]
 */
export const getAllEstados = () => {
  return Object.entries(ESTADOS_AUDITORIA).map(([key, config]) => ({
    key,
    ...config,
  }));
};

/**
 * Filtra auditorías por estado
 *
 * @param {Array} auditorias - Lista de auditorías
 * @param {string|Array} estados - Estado(s) a filtrar
 * @returns {Array} Auditorías filtradas
 *
 * @example
 * const completadas = filterByEstado(auditorias, 'completada');
 * const activas = filterByEstado(auditorias, ['en_carga', 'en_evaluacion']);
 */
export const filterByEstado = (auditorias, estados) => {
  if (!Array.isArray(auditorias)) return [];

  const estadosArray = Array.isArray(estados) ? estados : [estados];
  const estadosNormalizados = estadosArray.map((e) =>
    e.toLowerCase().replace(/\s+/g, '_')
  );

  return auditorias.filter((auditoria) => {
    const estadoNormalizado = auditoria.estado
      ?.toLowerCase()
      .replace(/\s+/g, '_');
    return estadosNormalizados.includes(estadoNormalizado);
  });
};

/**
 * Cuenta auditorías por estado
 *
 * @param {Array} auditorias - Lista de auditorías
 * @returns {object} Objeto con conteo por estado
 *
 * @example
 * const conteo = countByEstado(auditorias);
 * // { programada: 2, en_carga: 5, completada: 3, ... }
 */
export const countByEstado = (auditorias) => {
  if (!Array.isArray(auditorias)) return {};

  const conteo = {};

  // Inicializar con todos los estados en 0
  Object.keys(ESTADOS_AUDITORIA).forEach((estado) => {
    conteo[estado] = 0;
  });

  // Contar auditorías
  auditorias.forEach((auditoria) => {
    const estadoNormalizado = auditoria.estado
      ?.toLowerCase()
      .replace(/\s+/g, '_');
    if (conteo[estadoNormalizado] !== undefined) {
      conteo[estadoNormalizado]++;
    }
  });

  return conteo;
};

/**
 * Calcula el porcentaje de progreso según el estado
 *
 * @param {string} estado - Estado de la auditoría
 * @returns {number} Porcentaje estimado (0-100)
 *
 * @example
 * getEstadoProgress('en_carga') // 30
 * getEstadoProgress('completada') // 100
 */
export const getEstadoProgress = (estado) => {
  const progressMap = {
    programada: 10,
    en_carga: 30,
    en_evaluacion: 70,
    completada: 100,
    observada: 85,
    vencida: 0,
  };

  const estadoNormalizado = estado?.toLowerCase().replace(/\s+/g, '_');
  return progressMap[estadoNormalizado] || 0;
};

/**
 * Formatea el progreso como texto legible
 *
 * @param {number} progreso - Porcentaje de progreso
 * @returns {string} Texto formateado
 *
 * @example
 * formatProgreso(75) // "75% completado"
 * formatProgreso(100) // "Completado"
 */
export const formatProgreso = (progreso) => {
  if (progreso === null || progreso === undefined) return 'Sin progreso';
  if (progreso === 0) return 'No iniciado';
  if (progreso === 100) return 'Completado';
  return `${Math.round(progreso)}% completado`;
};

/**
 * Exportación por defecto con todas las funciones
 */
export default {
  // Funciones de estilo
  getEstadoStyle,
  getEstadoColor,
  getEstadoBackgroundColor,
  getEstadoIcon,
  getEstadoLabel,

  // Funciones de cumplimiento
  getNivelCumplimiento,
  getCumplimientoColor,
  getCumplimientoBackgroundColor,

  // Funciones de verificación
  isEstadoFinal,
  isEstadoEnProgreso,

  // Funciones de flujo
  getNextEstado,
  getPreviousEstado,

  // Funciones de lista
  getAllEstados,
  filterByEstado,
  countByEstado,

  // Funciones de progreso
  getEstadoProgress,
  formatProgreso,
};
