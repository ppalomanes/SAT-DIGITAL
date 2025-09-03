const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

class FileProcessor {
  /**
   * Procesar archivo según su tipo
   */
  static async procesarArchivo(archivo) {
    const extension = path.extname(archivo.originalname).toLowerCase();
    
    switch (extension) {
      case '.pdf':
        return await this.procesarPDF(archivo);
      case '.jpg':
      case '.jpeg':
      case '.png':
        return await this.procesarImagen(archivo);
      case '.xlsx':
        return await this.procesarExcel(archivo);
      default:
        return this.procesarGenerico(archivo);
    }
  }

  /**
   * Procesar archivo PDF
   */
  static async procesarPDF(archivo) {
    return {
      tipo: 'pdf',
      mimetype: 'application/pdf',
      metadata: {
        paginas: null, // Se implementará en Fase 3 con IA
        texto_extraido: null
      }
    };
  }

  /**
   * Procesar imagen
   */
  static async procesarImagen(archivo) {
    try {
      const metadata = await sharp(archivo.path).metadata();
      
      return {
        tipo: 'imagen',
        mimetype: archivo.mimetype,
        metadata: {
          ancho: metadata.width,
          alto: metadata.height,
          formato: metadata.format,
          tamaño_original: archivo.size,
          densidad: metadata.density
        }
      };
    } catch (error) {
      throw new Error(`Error procesando imagen: ${error.message}`);
    }
  }

  /**
   * Procesar archivo Excel
   */
  static async procesarExcel(archivo) {
    return {
      tipo: 'excel',
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      metadata: {
        hojas: null, // Se implementará con xlsx
        filas_estimadas: null
      }
    };
  }

  /**
   * Procesar archivo genérico
   */
  static procesarGenerico(archivo) {
    return {
      tipo: 'generico',
      mimetype: archivo.mimetype,
      metadata: {}
    };
  }

  /**
   * Validar tamaño máximo
   */
  static validarTamaño(archivo, tamañoMaximoMB = 100) {
    const tamañoMaximoBytes = tamañoMaximoMB * 1024 * 1024;
    return archivo.size <= tamañoMaximoBytes;
  }

  /**
   * Validar tipo de archivo
   */
  static validarTipo(archivo, tiposPermitidos = ['pdf', 'jpg', 'jpeg', 'png', 'xlsx']) {
    const extension = path.extname(archivo.originalname).toLowerCase().substring(1);
    return tiposPermitidos.includes(extension);
  }
}

module.exports = FileProcessor;