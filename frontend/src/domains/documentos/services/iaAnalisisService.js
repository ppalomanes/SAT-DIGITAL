import apiClient from '../../../shared/services/apiClient';

/**
 * Servicio para interactuar con el sistema de análisis IA
 */
class IaAnalisisService {
  /**
   * Verificar estado del servicio IA
   */
  async checkHealth() {
    try {
      const response = await apiClient.get('/ia-analisis/health');
      return response.data;
    } catch (error) {
      console.error('Error verificando estado IA:', error);
      throw error;
    }
  }

  /**
   * Obtener análisis de un documento
   */
  async getDocumentAnalysis(documentoId) {
    try {
      const response = await apiClient.get(`/ia-analisis/document/${documentoId}/analysis`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo análisis:', error);
      throw error;
    }
  }

  /**
   * Iniciar análisis de documento individual
   */
  async analyzeDocument(documentoId, forceReanalysis = false) {
    try {
      const response = await apiClient.post(`/ia-analisis/document/${documentoId}/analyze`, {
        force_reanalysis: forceReanalysis
      });
      return response.data;
    } catch (error) {
      console.error('Error iniciando análisis:', error);
      throw error;
    }
  }

  /**
   * Obtener estado de un job de análisis
   */
  async getJobStatus(jobId) {
    try {
      const response = await apiClient.get(`/ia-analisis/job/${jobId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estado de job:', error);
      throw error;
    }
  }

  /**
   * Análisis en lote por auditoría
   */
  async analyzeBatchByAuditoria(auditoriaId, secciones = [], forceReanalysis = false) {
    try {
      const response = await apiClient.post(`/ia-analisis/auditoria/${auditoriaId}/analyze-batch`, {
        secciones,
        force_reanalysis: forceReanalysis
      });
      return response.data;
    } catch (error) {
      console.error('Error iniciando análisis en lote:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de cola de análisis
   */
  async getQueueStats() {
    try {
      const response = await apiClient.get('/ia-analisis/queue/stats');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de cola:', error);
      throw error;
    }
  }

  /**
   * Test rápido de análisis IA
   */
  async testAnalysis(text, type = 'text') {
    try {
      const response = await apiClient.post('/ia-analisis/test', {
        text,
        type
      });
      return response.data;
    } catch (error) {
      console.error('Error en test de análisis:', error);
      throw error;
    }
  }
}

const iaAnalisisService = new IaAnalisisService();
export default iaAnalisisService;