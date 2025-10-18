/**
 * SAT-Digital - Utilidades de Formateo de Fechas
 * Funciones centralizadas para manejo de fechas
 *
 * Uso:
 * import { formatDate, formatDateTime, formatTime } from '@/shared/utils/dateHelpers';
 */

import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// Configurar dayjs
dayjs.locale('es');
dayjs.extend(relativeTime);
dayjs.extend(calendar);
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * FORMATOS DE FECHA PREDEFINIDOS
 */
export const DATE_FORMATS = {
  // Formatos básicos
  SHORT: 'DD/MM/YYYY',           // 15/01/2025
  MEDIUM: 'DD MMM YYYY',         // 15 Ene 2025
  LONG: 'DD [de] MMMM [de] YYYY', // 15 de enero de 2025
  FULL: 'dddd, DD [de] MMMM [de] YYYY', // miércoles, 15 de enero de 2025

  // Formatos con hora
  DATETIME_SHORT: 'DD/MM/YYYY HH:mm',        // 15/01/2025 14:30
  DATETIME_MEDIUM: 'DD MMM YYYY, HH:mm',     // 15 Ene 2025, 14:30
  DATETIME_LONG: 'DD [de] MMMM [de] YYYY, HH:mm:ss', // 15 de enero de 2025, 14:30:00

  // Solo hora
  TIME_SHORT: 'HH:mm',          // 14:30
  TIME_LONG: 'HH:mm:ss',        // 14:30:45

  // Formatos ISO
  ISO: 'YYYY-MM-DD',            // 2025-01-15
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss', // 2025-01-15T14:30:00

  // Formatos especiales
  MONTH_YEAR: 'MMMM YYYY',      // enero 2025
  YEAR: 'YYYY',                 // 2025
  FILENAME: 'YYYY-MM-DD_HHmmss', // 2025-01-15_143000
};

/**
 * Formatea una fecha según el formato especificado
 *
 * @param {string|Date|dayjs.Dayjs} date - Fecha a formatear
 * @param {string} format - Formato de salida (usar DATE_FORMATS)
 * @returns {string} Fecha formateada o mensaje por defecto
 *
 * @example
 * formatDate('2025-01-15') // "15/01/2025"
 * formatDate('2025-01-15', DATE_FORMATS.MEDIUM) // "15 Ene 2025"
 * formatDate(null) // "No definida"
 */
export const formatDate = (date, format = DATE_FORMATS.SHORT) => {
  if (!date) return 'No definida';

  try {
    return dayjs(date).format(format);
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha con hora
 *
 * @param {string|Date|dayjs.Dayjs} date - Fecha a formatear
 * @param {string} format - Formato de salida
 * @returns {string} Fecha y hora formateadas
 *
 * @example
 * formatDateTime('2025-01-15T14:30:00') // "15/01/2025 14:30"
 */
export const formatDateTime = (date, format = DATE_FORMATS.DATETIME_SHORT) => {
  if (!date) return 'No definida';

  try {
    return dayjs(date).format(format);
  } catch (error) {
    console.error('Error formateando fecha/hora:', error);
    return 'Fecha inválida';
  }
};

/**
 * Formatea solo la hora
 *
 * @param {string|Date|dayjs.Dayjs} date - Fecha de la cual extraer hora
 * @param {string} format - Formato de hora
 * @returns {string} Hora formateada
 *
 * @example
 * formatTime('2025-01-15T14:30:00') // "14:30"
 */
export const formatTime = (date, format = DATE_FORMATS.TIME_SHORT) => {
  if (!date) return '--:--';

  try {
    return dayjs(date).format(format);
  } catch (error) {
    console.error('Error formateando hora:', error);
    return '--:--';
  }
};

/**
 * Formatea fecha de manera relativa (hace X tiempo)
 *
 * @param {string|Date|dayjs.Dayjs} date - Fecha a formatear
 * @returns {string} Tiempo relativo
 *
 * @example
 * formatRelative('2025-01-15T14:00:00') // "hace 2 horas"
 * formatRelative('2025-01-14') // "hace 1 día"
 */
export const formatRelative = (date) => {
  if (!date) return 'Nunca';

  try {
    return dayjs(date).fromNow();
  } catch (error) {
    console.error('Error formateando fecha relativa:', error);
    return 'Fecha inválida';
  }
};

/**
 * Formatea fecha en estilo calendario (Hoy, Ayer, etc.)
 *
 * @param {string|Date|dayjs.Dayjs} date - Fecha a formatear
 * @returns {string} Fecha en formato calendario
 *
 * @example
 * formatCalendar(new Date()) // "Hoy a las 14:30"
 * formatCalendar(yesterday) // "Ayer a las 10:00"
 */
export const formatCalendar = (date) => {
  if (!date) return 'No definida';

  try {
    return dayjs(date).calendar(null, {
      sameDay: '[Hoy a las] HH:mm',
      lastDay: '[Ayer a las] HH:mm',
      lastWeek: 'dddd [pasado a las] HH:mm',
      sameElse: 'DD/MM/YYYY [a las] HH:mm'
    });
  } catch (error) {
    console.error('Error formateando fecha calendario:', error);
    return 'Fecha inválida';
  }
};

/**
 * Calcula días restantes desde hoy hasta una fecha
 *
 * @param {string|Date|dayjs.Dayjs} date - Fecha objetivo
 * @returns {number} Número de días (positivo = futuro, negativo = pasado)
 *
 * @example
 * getDaysRemaining('2025-01-20') // 5 (si hoy es 15/01/2025)
 */
export const getDaysRemaining = (date) => {
  if (!date) return null;

  try {
    const target = dayjs(date);
    const today = dayjs().startOf('day');
    return target.diff(today, 'days');
  } catch (error) {
    console.error('Error calculando días restantes:', error);
    return null;
  }
};

/**
 * Verifica si una fecha está vencida
 *
 * @param {string|Date|dayjs.Dayjs} date - Fecha a verificar
 * @returns {boolean} true si la fecha es anterior a hoy
 *
 * @example
 * isOverdue('2025-01-10') // true (si hoy es después del 10/01)
 */
export const isOverdue = (date) => {
  if (!date) return false;

  try {
    return dayjs(date).isBefore(dayjs(), 'day');
  } catch (error) {
    console.error('Error verificando vencimiento:', error);
    return false;
  }
};

/**
 * Verifica si una fecha está próxima a vencer (dentro de X días)
 *
 * @param {string|Date|dayjs.Dayjs} date - Fecha a verificar
 * @param {number} days - Días de anticipación (default: 7)
 * @returns {boolean} true si la fecha vence pronto
 *
 * @example
 * isDueSoon('2025-01-18', 3) // true (si hoy es 15/01 y faltan 3 días)
 */
export const isDueSoon = (date, days = 7) => {
  if (!date) return false;

  try {
    const target = dayjs(date);
    const today = dayjs();
    const threshold = today.add(days, 'days');

    return target.isAfter(today) && target.isBefore(threshold);
  } catch (error) {
    console.error('Error verificando proximidad:', error);
    return false;
  }
};

/**
 * Formatea un rango de fechas
 *
 * @param {string|Date|dayjs.Dayjs} startDate - Fecha inicio
 * @param {string|Date|dayjs.Dayjs} endDate - Fecha fin
 * @param {string} format - Formato de fechas
 * @returns {string} Rango formateado
 *
 * @example
 * formatDateRange('2025-01-15', '2025-01-20') // "15/01/2025 - 20/01/2025"
 */
export const formatDateRange = (startDate, endDate, format = DATE_FORMATS.SHORT) => {
  if (!startDate || !endDate) return 'Rango no definido';

  try {
    const start = dayjs(startDate).format(format);
    const end = dayjs(endDate).format(format);
    return `${start} - ${end}`;
  } catch (error) {
    console.error('Error formateando rango:', error);
    return 'Rango inválido';
  }
};

/**
 * Obtiene el período de auditoría (formato: Mes Año)
 *
 * @param {string|Date|dayjs.Dayjs} date - Fecha del período
 * @returns {string} Período formateado
 *
 * @example
 * getPeriodLabel('2025-01-15') // "Enero 2025"
 */
export const getPeriodLabel = (date) => {
  if (!date) return 'Sin período';

  try {
    return dayjs(date).format(DATE_FORMATS.MONTH_YEAR);
  } catch (error) {
    console.error('Error formateando período:', error);
    return 'Período inválido';
  }
};

/**
 * Verifica si una fecha está dentro de un rango
 *
 * @param {string|Date|dayjs.Dayjs} date - Fecha a verificar
 * @param {string|Date|dayjs.Dayjs} startDate - Fecha inicio del rango
 * @param {string|Date|dayjs.Dayjs} endDate - Fecha fin del rango
 * @returns {boolean} true si la fecha está dentro del rango
 *
 * @example
 * isDateInRange('2025-01-17', '2025-01-15', '2025-01-20') // true
 */
export const isDateInRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false;

  try {
    return dayjs(date).isBetween(startDate, endDate, 'day', '[]');
  } catch (error) {
    console.error('Error verificando rango:', error);
    return false;
  }
};

/**
 * Obtiene la fecha actual en formato ISO
 *
 * @returns {string} Fecha actual en formato YYYY-MM-DD
 *
 * @example
 * getCurrentDate() // "2025-01-15"
 */
export const getCurrentDate = () => {
  return dayjs().format(DATE_FORMATS.ISO);
};

/**
 * Obtiene fecha/hora actual en formato ISO completo
 *
 * @returns {string} Fecha y hora actual
 *
 * @example
 * getCurrentDateTime() // "2025-01-15T14:30:00"
 */
export const getCurrentDateTime = () => {
  return dayjs().format(DATE_FORMATS.ISO_DATETIME);
};

/**
 * Parsea una fecha en formato personalizado
 *
 * @param {string} dateString - String de fecha
 * @param {string} format - Formato del string
 * @returns {dayjs.Dayjs|null} Objeto dayjs o null si es inválido
 *
 * @example
 * parseDate('15/01/2025', 'DD/MM/YYYY')
 */
export const parseDate = (dateString, format = DATE_FORMATS.SHORT) => {
  if (!dateString) return null;

  try {
    const parsed = dayjs(dateString, format);
    return parsed.isValid() ? parsed : null;
  } catch (error) {
    console.error('Error parseando fecha:', error);
    return null;
  }
};

/**
 * Agrega días a una fecha
 *
 * @param {string|Date|dayjs.Dayjs} date - Fecha base
 * @param {number} days - Días a agregar
 * @returns {string} Fecha resultante en formato ISO
 *
 * @example
 * addDays('2025-01-15', 5) // "2025-01-20"
 */
export const addDays = (date, days) => {
  if (!date) return null;

  try {
    return dayjs(date).add(days, 'days').format(DATE_FORMATS.ISO);
  } catch (error) {
    console.error('Error agregando días:', error);
    return null;
  }
};

/**
 * Resta días a una fecha
 *
 * @param {string|Date|dayjs.Dayjs} date - Fecha base
 * @param {number} days - Días a restar
 * @returns {string} Fecha resultante en formato ISO
 *
 * @example
 * subtractDays('2025-01-15', 5) // "2025-01-10"
 */
export const subtractDays = (date, days) => {
  if (!date) return null;

  try {
    return dayjs(date).subtract(days, 'days').format(DATE_FORMATS.ISO);
  } catch (error) {
    console.error('Error restando días:', error);
    return null;
  }
};

/**
 * Exportación por defecto con todas las funciones
 */
export default {
  // Constantes
  DATE_FORMATS,

  // Funciones de formateo
  formatDate,
  formatDateTime,
  formatTime,
  formatRelative,
  formatCalendar,
  formatDateRange,
  getPeriodLabel,

  // Funciones de cálculo
  getDaysRemaining,
  isOverdue,
  isDueSoon,
  isDateInRange,

  // Funciones de utilidad
  getCurrentDate,
  getCurrentDateTime,
  parseDate,
  addDays,
  subtractDays,
};
