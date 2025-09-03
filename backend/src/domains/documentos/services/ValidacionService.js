const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ValidacionService {
  /**
   * Validar documento según su sección técnica
   */
  static async validarDocumento(archivo, seccionCodigo, metadata = {}) {
    try {
      const validaciones = [];

      // Validación básica del archivo
      const validacionBasica = await this.validacionBasica(archivo);
      validaciones.push(validacionBasica);

      // Validación específica por sección
      const validacionSeccion = await this.validacionPorSeccion(
        archivo, seccionCodigo, metadata
      );
      validaciones.push(validacionSeccion);

      // Compilar resultado
      const errores = validaciones.flatMap(v => v.errores).filter(Boolean);
      const warnings = validaciones.flatMap(v => v.warnings).filter(Boolean);

      return {
        valido: errores.length === 0,
        errores,
        warnings,
        metadata: {
          hash: await this.calcularHash(archivo.path),
          tamaño: archivo.size,
          tipo: archivo.mimetype,
          validado_en: new Date()
        }
      };

    } catch (error) {
      return {
        valido: false,
        errores: [`Error durante validación: ${error.message}`],
        warnings: [],
        metadata: null
      };
    }
  }

  /**
   * Validaciones básicas aplicables a todos los archivos
   */
  static async validacionBasica(archivo) {
    const errores = [];
    const warnings = [];

    // Verificar que el archivo existe y es legible
    try {
      await fs.access(archivo.path);
    } catch (error) {
      errores.push('Archivo no accesible o corrupto');
      return { errores, warnings };
    }

    // Validar tamaño (máximo 200MB)
    if (archivo.size > 200 * 1024 * 1024) {
      errores.push('Archivo excede el tamaño máximo permitido (200MB)');
    }

    // Validar nombre de archivo
    if (!/^[\w\-. ]+$/i.test(archivo.originalname)) {
      errores.push('Nombre de archivo contiene caracteres no permitidos');
    }

    // Verificar que no esté vacío
    if (archivo.size === 0) {
      errores.push('Archivo está vacío');
    }

    return { errores, warnings };
  }

  /**
   * Validaciones específicas según la sección técnica
   */
  static async validacionPorSeccion(archivo, seccionCodigo, metadata) {
    const errores = [];
    const warnings = [];

    // Validación genérica para todas las secciones
    const extensionesPermitidas = ['pdf', 'jpg', 'jpeg', 'png', 'xlsx'];
    const extension = archivo.originalname.toLowerCase().split('.').pop();
    
    if (!extensionesPermitidas.includes(extension)) {
      errores.push(`Tipo de archivo no permitido para esta sección: .${extension}`);
    }

    return { errores, warnings };
  }

  /**
   * Generar hash del archivo para detectar duplicados y cambios
   */
  static async calcularHash(rutaArchivo) {
    try {
      const contenido = await fs.readFile(rutaArchivo);
      return crypto.createHash('sha256').update(contenido).digest('hex');
    } catch (error) {
      throw new Error(`Error calculando hash: ${error.message}`);
    }
  }
}

module.exports = ValidacionService;