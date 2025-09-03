const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { Documento } = require('../../../shared/database/models');

class AlmacenamientoService {
  /**
   * Guardar archivo físicamente
   */
  static async guardarArchivo(archivo, auditoriaId, seccionId) {
    try {
      const uploadDir = path.join(
        process.cwd(),
        'uploads',
        'auditorias', 
        auditoriaId.toString(),
        seccionId.toString()
      );

      // Crear directorio si no existe
      await fs.mkdir(uploadDir, { recursive: true });

      // Generar nombre único
      const timestamp = Date.now();
      const extension = path.extname(archivo.originalname);
      const baseName = path.basename(archivo.originalname, extension)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 50);
      
      const nombreArchivo = `${timestamp}_${baseName}${extension}`;
      const rutaDestino = path.join(uploadDir, nombreArchivo);

      // Mover archivo
      await fs.rename(archivo.path, rutaDestino);

      // Calcular hash
      const contenido = await fs.readFile(rutaDestino);
      const hash = crypto.createHash('sha256').update(contenido).digest('hex');

      return {
        nombre_archivo: nombreArchivo,
        ruta_almacenamiento: rutaDestino,
        hash_archivo: hash
      };

    } catch (error) {
      throw new Error(`Error guardando archivo: ${error.message}`);
    }
  }

  /**
   * Verificar si existe duplicado por hash
   */
  static async verificarDuplicado(hash) {
    try {
      return await Documento.findOne({
        where: { hash_archivo: hash }
      });
    } catch (error) {
      console.error('Error verificando duplicado:', error);
      return null;
    }
  }

  /**
   * Eliminar archivo físico
   */
  static async eliminarArchivo(rutaArchivo) {
    try {
      await fs.unlink(rutaArchivo);
    } catch (error) {
      console.error('Error eliminando archivo:', error);
    }
  }

  /**
   * Crear backup de archivo
   */
  static async crearBackup(rutaArchivo) {
    try {
      const backupDir = path.join(process.cwd(), 'uploads', 'backups');
      await fs.mkdir(backupDir, { recursive: true });
      
      const nombreArchivo = path.basename(rutaArchivo);
      const rutaBackup = path.join(backupDir, `${Date.now()}_${nombreArchivo}`);
      
      await fs.copyFile(rutaArchivo, rutaBackup);
      return rutaBackup;
    } catch (error) {
      console.error('Error creando backup:', error);
    }
  }
}

module.exports = AlmacenamientoService;