// utils/dataExporter.js
import * as XLSX from "xlsx";

/**
 * Clase para exportar datos normalizados en diferentes formatos
 */
export class DataExporter {
  /**
   * Exporta datos normalizados a un archivo Excel (.xlsx)
   * @param {Array} normalizedData - Datos normalizados después del análisis
   * @param {Object} analysisStats - Estadísticas del análisis
   * @param {String} filename - Nombre del archivo (sin extensión)
   * @param {Object} options - Opciones adicionales
   */
  static toExcel(normalizedData, analysisStats = {}, filename = "parque_informatico_normalizado", options = {}) {
    try {
      if (!normalizedData || normalizedData.length === 0) {
        console.error("No hay datos normalizados para exportar");
        return false;
      }

      // Crear libro de trabajo
      const workbook = XLSX.utils.book_new();

      // Hoja 1: Datos normalizados
      const normalizedSheet = XLSX.utils.json_to_sheet(normalizedData);

      // Aplicar anchos de columna automáticos
      const cols = Object.keys(normalizedData[0]).map((key) => ({
        wch: Math.max(key.length, 15),
      }));
      normalizedSheet["!cols"] = cols;

      XLSX.utils.book_append_sheet(workbook, normalizedSheet, "Datos Normalizados");

      // Hoja 2: Resumen de análisis (si hay estadísticas)
      if (analysisStats && Object.keys(analysisStats).length > 0) {
        const summaryData = [
          { Métrica: "Total de equipos analizados", Valor: analysisStats.totalEquipos || normalizedData.length },
          { Métrica: "Equipos que cumplen requisitos", Valor: analysisStats.equiposCumplen || 0 },
          { Métrica: "Equipos que NO cumplen requisitos", Valor: analysisStats.equiposNoCumplen || 0 },
          { Métrica: "Porcentaje de cumplimiento", Valor: `${analysisStats.porcentajeCumplimiento || 0}%` },
          { Métrica: "Fecha de análisis", Valor: new Date().toLocaleString() }
        ];

        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        summarySheet["!cols"] = [{ wch: 30 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");
      }

      // Hoja 3: Configuración de requisitos mínimos utilizada
      if (options.requisitosMinimos) {
        const configData = [
          { Componente: "Procesador - Marcas", Requisito: options.requisitosMinimos.procesador?.marcasAceptadas?.join(', ') || 'N/A' },
          { Componente: "Procesador - Modelos Mínimos", Requisito: options.requisitosMinimos.procesador?.modelosMinimos?.join(', ') || 'N/A' },
          { Componente: "Procesador - Velocidad Mínima", Requisito: `${options.requisitosMinimos.procesador?.velocidadMinima || 0} GHz` },
          { Componente: "Procesador - Núcleos Mínimos", Requisito: options.requisitosMinimos.procesador?.nucleosMinimos || 0 },
          { Componente: "Memoria - Capacidad Mínima", Requisito: `${options.requisitosMinimos.memoria?.capacidadMinima || 0} GB` },
          { Componente: "Memoria - Tipos Aceptados", Requisito: options.requisitosMinimos.memoria?.tiposAceptados?.join(', ') || 'N/A' },
          { Componente: "SO - Versiones Aceptadas", Requisito: options.requisitosMinimos.sistemaOperativo?.versionesAceptadas?.join(', ') || 'N/A' }
        ];

        const configSheet = XLSX.utils.json_to_sheet(configData);
        configSheet["!cols"] = [{ wch: 35 }, { wch: 40 }];
        XLSX.utils.book_append_sheet(workbook, configSheet, "Configuración Requisitos");
      }

      // Guardar el archivo
      XLSX.writeFile(workbook, `${filename}.xlsx`);
      return true;
    } catch (error) {
      console.error("Error al exportar datos normalizados a Excel:", error);
      return false;
    }
  }

  /**
   * Exporta datos normalizados a un archivo CSV
   * @param {Array} normalizedData - Datos normalizados
   * @param {String} filename - Nombre del archivo
   */
  static toCSV(normalizedData, filename = "parque_informatico_normalizado") {
    try {
      if (!normalizedData || normalizedData.length === 0) {
        console.error("No hay datos normalizados para exportar");
        return false;
      }

      // Convertir a CSV
      const worksheet = XLSX.utils.json_to_sheet(normalizedData);
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet, {
        FS: ",",
        blankrows: false,
      });

      // Crear un blob y descargar
      const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      console.error("Error al exportar a CSV:", error);
      return false;
    }
  }

  /**
   * Exporta datos normalizados a JSON
   * @param {Array} normalizedData - Datos normalizados
   * @param {Object} analysisStats - Estadísticas del análisis
   * @param {String} filename - Nombre del archivo
   */
  static toJSON(normalizedData, analysisStats = {}, filename = "parque_informatico_normalizado") {
    try {
      if (!normalizedData) {
        console.error("No hay datos normalizados para exportar");
        return false;
      }

      const exportData = {
        metadata: {
          fechaExportacion: new Date().toISOString(),
          totalEquipos: normalizedData.length,
          version: "1.0"
        },
        estadisticas: analysisStats,
        datosNormalizados: normalizedData
      };

      // Convertir a formato JSON (pretty print)
      const jsonStr = JSON.stringify(exportData, null, 2);

      // Crear blob y descargar
      const blob = new Blob([jsonStr], {
        type: "application/json;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      console.error("Error al exportar a JSON:", error);
      return false;
    }
  }

  /**
   * Genera un reporte de cumplimiento
   * @param {Array} normalizedData - Datos normalizados
   * @param {Object} analysisStats - Estadísticas del análisis
   * @param {String} filename - Nombre del archivo
   */
  static generateComplianceReport(normalizedData, analysisStats, filename = "reporte_cumplimiento") {
    try {
      if (!normalizedData || normalizedData.length === 0) {
        console.error("No hay datos para generar el reporte");
        return false;
      }

      // Separar equipos que cumplen y no cumplen
      const equiposCumplen = normalizedData.filter(equipo =>
        equipo.cumpleRequisitos === 'Sí' || equipo.cumpleRequisitos === true
      );
      const equiposNoCumplen = normalizedData.filter(equipo =>
        equipo.cumpleRequisitos === 'No' || equipo.cumpleRequisitos === false
      );

      // Crear libro de trabajo con múltiples hojas
      const workbook = XLSX.utils.book_new();

      // Hoja 1: Equipos que SÍ cumplen
      if (equiposCumplen.length > 0) {
        const cumpleSheet = XLSX.utils.json_to_sheet(equiposCumplen);
        const colsCumple = Object.keys(equiposCumplen[0]).map(key => ({ wch: Math.max(key.length, 15) }));
        cumpleSheet["!cols"] = colsCumple;
        XLSX.utils.book_append_sheet(workbook, cumpleSheet, "Equipos que SÍ cumplen");
      }

      // Hoja 2: Equipos que NO cumplen
      if (equiposNoCumplen.length > 0) {
        const noCumpleSheet = XLSX.utils.json_to_sheet(equiposNoCumplen);
        const colsNoCumple = Object.keys(equiposNoCumplen[0]).map(key => ({ wch: Math.max(key.length, 15) }));
        noCumpleSheet["!cols"] = colsNoCumple;
        XLSX.utils.book_append_sheet(workbook, noCumpleSheet, "Equipos que NO cumplen");
      }

      // Hoja 3: Resumen estadístico
      const summaryData = [
        { Métrica: "Total de equipos", Valor: normalizedData.length },
        { Métrica: "Equipos que cumplen", Valor: equiposCumplen.length },
        { Métrica: "Equipos que NO cumplen", Valor: equiposNoCumplen.length },
        { Métrica: "Porcentaje de cumplimiento", Valor: `${((equiposCumplen.length / normalizedData.length) * 100).toFixed(1)}%` },
        { Métrica: "Fecha del reporte", Valor: new Date().toLocaleString() }
      ];

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      summarySheet["!cols"] = [{ wch: 25 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");

      // Guardar archivo
      XLSX.writeFile(workbook, `${filename}.xlsx`);
      return true;
    } catch (error) {
      console.error("Error al generar reporte de cumplimiento:", error);
      return false;
    }
  }
}

// Exportar funciones individuales para facilitar su uso
export const exportToExcel = DataExporter.toExcel;
export const exportToCSV = DataExporter.toCSV;
export const exportToJSON = DataExporter.toJSON;
export const generateComplianceReport = DataExporter.generateComplianceReport;