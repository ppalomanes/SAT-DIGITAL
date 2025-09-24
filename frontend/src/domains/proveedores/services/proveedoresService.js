/**
 * Servicio para gestión de proveedores
 * Comunicación con backend SQL Server
 */

import httpClient from '../../../shared/services/httpClient';

const PROVEEDORES_ENDPOINT = '/proveedores';
const SITIOS_ENDPOINT = '/sitios';

export const proveedoresService = {
  // CRUD Proveedores
  async getProveedores() {
    const response = await httpClient.get(PROVEEDORES_ENDPOINT);
    return response.data.data || response.data;
  },

  async getProveedorById(id) {
    const response = await httpClient.get(`${PROVEEDORES_ENDPOINT}/${id}`);
    return response.data.data || response.data;
  },

  async createProveedor(proveedorData) {
    const response = await httpClient.post(PROVEEDORES_ENDPOINT, proveedorData);
    return response.data.data || response.data;
  },

  async updateProveedor(id, proveedorData) {
    const response = await httpClient.put(`${PROVEEDORES_ENDPOINT}/${id}`, proveedorData);
    return response.data.data || response.data;
  },

  async deleteProveedor(id) {
    const response = await httpClient.delete(`${PROVEEDORES_ENDPOINT}/${id}`);
    return response.data;
  },

  // Gestión de sitios
  async getSitiosByProveedor(proveedorId) {
    const response = await httpClient.get(`${PROVEEDORES_ENDPOINT}/${proveedorId}/sitios`);
    return response.data.data || response.data;
  },

  async createSitio(sitioData) {
    const response = await httpClient.post(SITIOS_ENDPOINT, sitioData);
    return response.data.data || response.data;
  },

  async updateSitio(id, sitioData) {
    const response = await httpClient.put(`${SITIOS_ENDPOINT}/${id}`, sitioData);
    return response.data.data || response.data;
  },

  async deleteSitio(id) {
    const response = await httpClient.delete(`${SITIOS_ENDPOINT}/${id}`);
    return response.data;
  },

  // Métricas y estadísticas
  async getProveedorStats(proveedorId) {
    const response = await httpClient.get(`${PROVEEDORES_ENDPOINT}/${proveedorId}/stats`);
    return response.data.data || response.data;
  },

  async getAllStats() {
    const response = await httpClient.get(`${PROVEEDORES_ENDPOINT}/stats`);
    return response.data.data || response.data;
  },

  // Auditorías por proveedor
  async getAuditoriasByProveedor(proveedorId) {
    const response = await httpClient.get(`${PROVEEDORES_ENDPOINT}/${proveedorId}/auditorias`);
    return response.data.data || response.data;
  }
};

export default proveedoresService;