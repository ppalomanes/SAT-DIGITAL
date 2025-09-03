const crypto = require('crypto');
const fs = require('fs').promises;

class HashGenerator {
  /**
   * Generar hash SHA-256 de un archivo
   */
  static async generarHashArchivo(rutaArchivo) {
    try {
      const contenido = await fs.readFile(rutaArchivo);
      return crypto.createHash('sha256').update(contenido).digest('hex');
    } catch (error) {
      throw new Error(`Error generando hash: ${error.message}`);
    }
  }

  /**
   * Generar hash de contenido directo
   */
  static generarHashContenido(contenido) {
    return crypto.createHash('sha256').update(contenido).digest('hex');
  }

  /**
   * Generar nombre único para archivo
   */
  static generarNombreUnico(nombreOriginal) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = nombreOriginal.split('.').pop();
    
    return `${timestamp}_${randomString}.${extension}`;
  }

  /**
   * Verificar integridad de archivo
   */
  static async verificarIntegridad(rutaArchivo, hashEsperado) {
    const hashActual = await this.generarHashArchivo(rutaArchivo);
    return hashActual === hashEsperado;
  }
}

module.exports = HashGenerator;