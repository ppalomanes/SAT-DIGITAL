import apiClient from '../../../shared/services/apiClient';

const documentosService = {
  /**
   * Cargar documentos para una auditoría
   */
  async cargarDocumentos(formData) {
    try {
      const response = await apiClient.post('/documentos/cargar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Configurar timeout más largo para archivos grandes
        timeout: 300000, // 5 minutos
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          // Emitir evento de progreso si es necesario
          if (formData.onProgress) {
            formData.onProgress(percentCompleted);
          }
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error cargando documentos:', error);
      throw new Error(error.response?.data?.error || 'Error cargando documentos');
    }
  },

  /**
   * Obtener documentos de una auditoría
   */
  async obtenerDocumentos(auditoriaId) {
    try {
      const response = await apiClient.get(`/documentos/auditoria/${auditoriaId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo documentos:', error);
      throw new Error(error.response?.data?.error || 'Error obteniendo documentos');
    }
  },

  /**
   * Eliminar documento
   */
  async eliminarDocumento(documentoId) {
    try {
      const response = await apiClient.delete(`/documentos/${documentoId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando documento:', error);
      throw new Error(error.response?.data?.error || 'Error eliminando documento');
    }
  },

  /**
   * Obtener progreso de carga de auditoría
   */
  async obtenerProgreso(auditoriaId) {
    try {
      const response = await apiClient.get(`/documentos/progreso/${auditoriaId}`);
      return response.data.progreso;
    } catch (error) {
      console.error('Error obteniendo progreso:', error);
      throw new Error(error.response?.data?.error || 'Error obteniendo progreso');
    }
  },

  /**
   * Validar archivo antes de subir
   */
  validarArchivo(archivo, seccionConfig = {}) {
    const errores = [];
    const warnings = [];

    // Validar tamaño
    const tamañoMaximo = seccionConfig.tamaño_maximo_mb || 100;
    const tamañoMaximoBytes = tamañoMaximo * 1024 * 1024;
    
    if (archivo.size > tamañoMaximoBytes) {
      errores.push(`Archivo excede el tamaño máximo de ${tamañoMaximo}MB`);
    }

    // Validar extensión
    const extension = archivo.name.toLowerCase().split('.').pop();
    const formatosPermitidos = seccionConfig.formatos_permitidos || ['pdf', 'jpg', 'jpeg', 'png', 'xlsx'];
    
    if (!formatosPermitidos.includes(extension)) {
      errores.push(`Formato no permitido. Se aceptan: ${formatosPermitidos.join(', ')}`);
    }

    // Validar nombre de archivo
    if (!/^[\w\-.\s]+$/i.test(archivo.name)) {
      warnings.push('El nombre del archivo contiene caracteres especiales');
    }

    // Validar que no esté vacío
    if (archivo.size === 0) {
      errores.push('El archivo está vacío');
    }

    return {
      valido: errores.length === 0,
      errores,
      warnings
    };
  },

  /**
   * Formatear tamaño de archivo
   */
  formatearTamaño(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default documentosService;