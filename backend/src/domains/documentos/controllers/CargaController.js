const { z } = require('zod');
const { Documento, SeccionTecnica, Auditoria } = require('../../../shared/database/models');
const AlmacenamientoService = require('../services/AlmacenamientoService');
const ValidacionService = require('../services/ValidacionService');
const { registrarBitacora } = require('../../../shared/utils/bitacora');
const logger = require('../../../shared/utils/logger');

// Schema de validación para carga
const esquemaCarga = z.object({
  auditoria_id: z.string().transform(Number),
  seccion_id: z.string().transform(Number),
  observaciones: z.string().optional()
});

class CargaController {
  /**
   * Cargar documentos
   */
  static async cargar(req, res) {
    try {
      // Validar datos de entrada
      const { auditoria_id, seccion_id, observaciones } = esquemaCarga.parse(req.body);
      
      // Verificar que existan archivos
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No se enviaron archivos'
        });
      }

      // Verificar permisos de auditoría
      const auditoria = await Auditoria.findOne({
        where: { id: auditoria_id },
        include: [{
          model: require('../../../shared/database/models').Sitio,
          as: 'sitio',
          include: ['proveedor']
        }]
      });

      if (!auditoria) {
        return res.status(404).json({
          success: false,
          error: 'Auditoría no encontrada'
        });
      }

      // Verificar que el usuario tenga permisos
      if (req.usuario.rol === 'proveedor' && 
          auditoria.sitio.proveedor.id !== req.usuario.proveedor_id) {
        return res.status(403).json({
          success: false,
          error: 'Sin permisos para esta auditoría'
        });
      }

      // Verificar sección técnica
      const seccion = await SeccionTecnica.findByPk(seccion_id);
      if (!seccion) {
        return res.status(404).json({
          success: false,
          error: 'Sección técnica no encontrada'
        });
      }

      const documentosGuardados = [];
      const erroresValidacion = [];

      // Procesar cada archivo
      for (const archivo of req.files) {
        try {
          // Validar archivo
          const validacion = await ValidacionService.validarDocumento(
            archivo, seccion.codigo
          );

          if (!validacion.valido) {
            erroresValidacion.push({
              archivo: archivo.originalname,
              errores: validacion.errores
            });
            continue;
          }

          // Verificar duplicados
          const hashTemporal = require('crypto')
            .createHash('sha256')
            .update(require('fs').readFileSync(archivo.path))
            .digest('hex');

          const duplicado = await AlmacenamientoService.verificarDuplicado(hashTemporal);
          if (duplicado) {
            // Actualizar versión en lugar de crear duplicado
            duplicado.version += 1;
            duplicado.fecha_ultima_revision = new Date();
            duplicado.observaciones_carga = observaciones;
            await duplicado.save();
            
            documentosGuardados.push(duplicado);
            continue;
          }

          // Guardar archivo físicamente
          const archivoGuardado = await AlmacenamientoService.guardarArchivo(
            archivo, auditoria_id, seccion_id
          );

          // Crear registro en base de datos
          const documento = await Documento.create({
            auditoria_id,
            seccion_id,
            nombre_archivo: archivoGuardado.nombre_archivo,
            nombre_original: archivo.originalname,
            tipo_archivo: require('path').extname(archivo.originalname).substring(1),
            tamaño_bytes: archivo.size,
            ruta_almacenamiento: archivoGuardado.ruta_almacenamiento,
            hash_archivo: archivoGuardado.hash_archivo,
            version: 1,
            observaciones_carga: observaciones,
            usuario_carga_id: req.usuario.id
          });

          documentosGuardados.push(documento);

          // Registrar en bitácora
          await registrarBitacora(
            req.usuario.id,
            'DOCUMENTO_CARGADO',
            'Documento',
            documento.id,
            `Archivo ${archivo.originalname} cargado para auditoría ${auditoria_id}`,
            null,
            { documento_id: documento.id },
            req
          );

        } catch (error) {
          logger.error('Error procesando archivo:', error);
          erroresValidacion.push({
            archivo: archivo.originalname,
            errores: [`Error interno: ${error.message}`]
          });
        }
      }

      // Calcular progreso de la auditoría
      const progreso = await this.calcularProgreso(auditoria_id);

      // Respuesta final
      const respuesta = {
        success: true,
        documentos_guardados: documentosGuardados.length,
        errores: erroresValidacion,
        progreso,
        documentos: documentosGuardados.map(doc => ({
          id: doc.id,
          nombre_original: doc.nombre_original,
          tipo_archivo: doc.tipo_archivo,
          tamaño_bytes: doc.tamaño_bytes,
          version: doc.version,
          created_at: doc.created_at
        }))
      };

      logger.info(`Carga completada: ${documentosGuardados.length} archivos guardados`);
      
      res.status(201).json(respuesta);

    } catch (error) {
      logger.error('Error en carga de documentos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener documentos de una auditoría
   */
  static async obtenerDocumentos(req, res) {
    try {
      const { auditoria_id } = req.params;
      
      const documentos = await Documento.findAll({
        where: { auditoria_id },
        include: [
          {
            model: SeccionTecnica,
            as: 'seccion',
            attributes: ['id', 'nombre', 'codigo']
          },
          {
            model: require('../../../shared/database/models').Usuario,
            as: 'usuario_carga',
            attributes: ['id', 'nombre', 'email']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      // Agrupar por sección
      const documentosPorSeccion = documentos.reduce((acc, doc) => {
        const seccionId = doc.seccion_id;
        if (!acc[seccionId]) {
          acc[seccionId] = {
            seccion: doc.seccion,
            documentos: []
          };
        }
        acc[seccionId].documentos.push(doc);
        return acc;
      }, {});

      res.json({
        success: true,
        documentos_por_seccion: documentosPorSeccion,
        total_documentos: documentos.length
      });

    } catch (error) {
      logger.error('Error obteniendo documentos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Calcular progreso de auditoría
   */
  static async calcularProgreso(auditoriaId) {
    try {
      // Obtener todas las secciones técnicas activas
      const secciones = await SeccionTecnica.findAll({
        where: { estado: 'activa' },
        attributes: ['id', 'nombre', 'obligatoria']
      });

      // Obtener documentos de la auditoría agrupados por sección
      const documentos = await Documento.findAll({
        where: { auditoria_id: auditoriaId },
        attributes: ['seccion_id'],
        group: ['seccion_id']
      });

      const seccionesConDocumentos = documentos.map(d => d.seccion_id);
      const seccionesObligatorias = secciones.filter(s => s.obligatoria);
      
      const seccionesCompletas = secciones.filter(s => 
        seccionesConDocumentos.includes(s.id)
      ).length;

      const seccionesObligatoriasCompletas = seccionesObligatorias.filter(s => 
        seccionesConDocumentos.includes(s.id)
      ).length;

      return {
        secciones_totales: secciones.length,
        secciones_completas: seccionesCompletas,
        secciones_obligatorias_totales: seccionesObligatorias.length,
        secciones_obligatorias_completas: seccionesObligatoriasCompletas,
        porcentaje_total: Math.round((seccionesCompletas / secciones.length) * 100),
        porcentaje_obligatorias: Math.round((seccionesObligatoriasCompletas / seccionesObligatorias.length) * 100),
        completitud: seccionesObligatoriasCompletas === seccionesObligatorias.length
      };
    } catch (error) {
      logger.error('Error calculando progreso:', error);
      return { error: 'No se pudo calcular el progreso' };
    }
  }

  /**
   * Eliminar documento
   */
  static async eliminar(req, res) {
    try {
      const { documento_id } = req.params;
      
      const documento = await Documento.findByPk(documento_id, {
        include: [
          {
            model: require('../../../shared/database/models').Auditoria,
            as: 'auditoria',
            include: [{
              model: require('../../../shared/database/models').Sitio,
              as: 'sitio',
              include: ['proveedor']
            }]
          }
        ]
      });

      if (!documento) {
        return res.status(404).json({
          success: false,
          error: 'Documento no encontrado'
        });
      }

      // Verificar permisos
      if (req.usuario.rol === 'proveedor' && 
          documento.auditoria.sitio.proveedor.id !== req.usuario.proveedor_id) {
        return res.status(403).json({
          success: false,
          error: 'Sin permisos para eliminar este documento'
        });
      }

      // Crear backup antes de eliminar
      await AlmacenamientoService.crearBackup(documento.ruta_almacenamiento);
      
      // Eliminar archivo físico
      await AlmacenamientoService.eliminarArchivo(documento.ruta_almacenamiento);
      
      // Eliminar registro de base de datos
      await documento.destroy();

      // Registrar en bitácora
      await registrarBitacora(
        req.usuario.id,
        'DOCUMENTO_ELIMINADO',
        'Documento',
        documento.id,
        `Documento ${documento.nombre_original} eliminado`,
        { documento_id: documento.id },
        null,
        req
      );

      res.json({
        success: true,
        message: 'Documento eliminado correctamente'
      });

    } catch (error) {
      logger.error('Error eliminando documento:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

module.exports = CargaController;