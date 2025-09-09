/**
 * SAT-Digital Frontend - Email Test Service
 * Servicio para gestionar testing de templates de email
 */

import httpClient from '../../../shared/services/httpClient';

const API_BASE_URL = '/notificaciones/email-test';

export const emailTestService = {
  /**
   * Obtener lista de templates disponibles
   */
  async getTemplates() {
    try {
      const response = await httpClient.get(`${API_BASE_URL}/templates`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener templates: ${error.response?.data?.message || error.message}`);
    }
  },

  /**
   * Probar un template específico
   */
  async testTemplate(templateName, email, sampleData = {}) {
    try {
      const response = await httpClient.post(
        `${API_BASE_URL}/test/${templateName}/${email}`,
        { sampleData }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Error al probar template: ${error.response?.data?.message || error.message}`);
    }
  },

  /**
   * Probar todos los templates
   */
  async testAllTemplates(email) {
    try {
      const response = await httpClient.post(`${API_BASE_URL}/test-all/${email}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al probar todos los templates: ${error.response?.data?.message || error.message}`);
    }
  },

  /**
   * Envío masivo de emails de prueba
   */
  async bulkTest(emails, template, data = {}) {
    try {
      const response = await httpClient.post(`${API_BASE_URL}/bulk-test`, {
        emails,
        template,
        data
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error en envío masivo: ${error.response?.data?.message || error.message}`);
    }
  },

  /**
   * Verificar configuración SMTP
   */
  async checkSMTPConfig() {
    try {
      const response = await httpClient.get(`${API_BASE_URL}/config`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al verificar configuración: ${error.response?.data?.message || error.message}`);
    }
  }
};