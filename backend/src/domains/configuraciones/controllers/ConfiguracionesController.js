const { getModels } = require('../../../shared/database/connection');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const XLSX = require('xlsx');
const logger = require('../../../shared/utils/logger');

// Configuración de multer para upload de archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../../../uploads/headsets');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `headsets-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
    }
  }
}).single('file');

class ConfiguracionesController {
  /**
   * Obtener configuración de validación para una auditoría
   */
  static async obtenerConfiguracion(req, res) {
    try {
      const { ConfiguracionValidacion } = getModels();
      const { auditoria_id, tipo_seccion } = req.query;

      let configuracion;

      // Buscar configuración específica de la auditoría
      if (auditoria_id) {
        configuracion = await ConfiguracionValidacion.findOne({
          where: {
            auditoria_id: parseInt(auditoria_id),
            tipo_seccion: tipo_seccion || 'parque_informatico',
            activo: true
          },
          order: [['creado_en', 'DESC']]
        });
      }

      // Si no hay configuración específica, buscar configuración global
      if (!configuracion) {
        configuracion = await ConfiguracionValidacion.findOne({
          where: {
            auditoria_id: null,
            tipo_seccion: tipo_seccion || 'parque_informatico',
            activo: true
          },
          order: [['creado_en', 'DESC']]
        });
      }

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró configuración. Usando valores por defecto.'
        });
      }

      logger.info(`Configuración cargada: ${configuracion.id}`, {
        auditoria_id,
        tipo_seccion,
        bloqueado: configuracion.bloqueado
      });

      res.json({
        success: true,
        data: {
          id: configuracion.id,
          requisitos_minimos: configuracion.requisitos_minimos,
          nombre_configuracion: configuracion.nombre_configuracion,
          descripcion: configuracion.descripcion,
          bloqueado: configuracion.bloqueado,
          archivo_headsets_nombre: configuracion.archivo_headsets_nombre,
          total_headsets: configuracion.total_headsets,
          creado_en: configuracion.creado_en,
          modificado_en: configuracion.modificado_en
        }
      });

    } catch (error) {
      logger.error('Error al obtener configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener configuración',
        error: error.message
      });
    }
  }

  /**
   * Guardar o actualizar configuración de validación
   */
  static async guardarConfiguracion(req, res) {
    try {
      const { ConfiguracionValidacion, ConfiguracionHistorial } = getModels();
      const {
        auditoria_id,
        tipo_seccion,
        requisitos_minimos,
        nombre_configuracion,
        descripcion,
        bloqueado
      } = req.body;

      const usuario_id = req.usuario.id;

      // Buscar configuración existente
      let configuracion = await ConfiguracionValidacion.findOne({
        where: {
          auditoria_id: auditoria_id || null,
          tipo_seccion: tipo_seccion || 'parque_informatico',
          activo: true
        }
      });

      if (configuracion) {
        // Actualizar configuración existente
        const versionAnterior = configuracion.requisitos_minimos;

        configuracion.requisitos_minimos = requisitos_minimos;
        configuracion.nombre_configuracion = nombre_configuracion;
        configuracion.descripcion = descripcion;
        configuracion.bloqueado = bloqueado || false;
        configuracion.modificado_por = usuario_id;
        configuracion.modificado_en = new Date();

        await configuracion.save();

        // Crear registro en historial
        const ultimaVersion = await ConfiguracionHistorial.findOne({
          where: { configuracion_id: configuracion.id },
          order: [['version', 'DESC']]
        });

        const nuevaVersion = (ultimaVersion?.version || 0) + 1;

        await ConfiguracionHistorial.create({
          configuracion_id: configuracion.id,
          version: nuevaVersion,
          requisitos_minimos_snapshot: requisitos_minimos,
          cambios_descripcion: descripcion || 'Actualización de configuración',
          cambios_diff: {
            anterior: versionAnterior,
            nuevo: requisitos_minimos
          },
          usuario_id
        });

        logger.info(`Configuración actualizada: ${configuracion.id} (v${nuevaVersion})`, {
          usuario_id,
          bloqueado
        });

      } else {
        // Crear nueva configuración
        configuracion = await ConfiguracionValidacion.create({
          auditoria_id: auditoria_id || null,
          tipo_seccion: tipo_seccion || 'parque_informatico',
          requisitos_minimos,
          nombre_configuracion,
          descripcion,
          bloqueado: bloqueado || false,
          creado_por: usuario_id,
          modificado_por: usuario_id,
          modificado_en: new Date()
        });

        // Crear primera versión en historial
        await ConfiguracionHistorial.create({
          configuracion_id: configuracion.id,
          version: 1,
          requisitos_minimos_snapshot: requisitos_minimos,
          cambios_descripcion: 'Creación inicial de configuración',
          usuario_id
        });

        logger.info(`Nueva configuración creada: ${configuracion.id}`, {
          usuario_id,
          tipo_seccion
        });
      }

      res.json({
        success: true,
        message: 'Configuración guardada exitosamente',
        data: {
          id: configuracion.id,
          bloqueado: configuracion.bloqueado
        }
      });

    } catch (error) {
      logger.error('Error al guardar configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error al guardar configuración',
        error: error.message
      });
    }
  }

  /**
   * Upload de archivo de headsets homologados
   */
  static uploadHeadsets(req, res) {
    upload(req, res, async (err) => {
      if (err) {
        logger.error('Error en upload de headsets:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se recibió ningún archivo'
        });
      }

      try {
        const { ConfiguracionValidacion } = getModels();
        const { auditoria_id } = req.body;

        // Leer el archivo Excel
        const workbook = XLSX.readFile(req.file.path);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Procesar headsets
        const headsets = jsonData.map(row => ({
          marca: row['Marca'] || row['marca'] || row['MARCA'] || '',
          modelo: row['Modelo'] || row['modelo'] || row['MODELO'] || '',
          conector: row['Conector'] || row['conector'] || row['CONECTOR'] || row['Tipo'] || ''
        })).filter(h => h.marca && h.modelo);

        // Actualizar configuración con archivo de headsets
        const configuracion = await ConfiguracionValidacion.findOne({
          where: {
            auditoria_id: auditoria_id || null,
            tipo_seccion: 'parque_informatico',
            activo: true
          }
        });

        if (configuracion) {
          configuracion.archivo_headsets_path = req.file.path;
          configuracion.archivo_headsets_nombre = req.file.originalname;
          configuracion.total_headsets = headsets.length;

          // Actualizar requisitos_minimos con headsets cargados
          const requisitos = configuracion.requisitos_minimos;
          if (requisitos && requisitos.headset) {
            requisitos.headset.modelosHomologados = headsets;
            requisitos.headset.marcasHomologadas = [...new Set(headsets.map(h => h.marca))];
            configuracion.requisitos_minimos = requisitos;
          }

          configuracion.modificado_por = req.usuario.id;
          configuracion.modificado_en = new Date();

          await configuracion.save();
        }

        logger.info(`Archivo de headsets procesado: ${headsets.length} headsets`, {
          usuario_id: req.usuario.id,
          archivo: req.file.originalname
        });

        res.json({
          success: true,
          message: `${headsets.length} headsets cargados exitosamente`,
          data: {
            total_headsets: headsets.length,
            archivo_nombre: req.file.originalname,
            headsets: headsets.slice(0, 10), // Preview de primeros 10
            marcas: [...new Set(headsets.map(h => h.marca))]
          }
        });

      } catch (error) {
        logger.error('Error procesando archivo de headsets:', error);
        res.status(500).json({
          success: false,
          message: 'Error al procesar archivo de headsets',
          error: error.message
        });
      }
    });
  }

  /**
   * Obtener historial de cambios de una configuración
   */
  static async obtenerHistorial(req, res) {
    try {
      const { ConfiguracionHistorial } = getModels();
      const { configuracion_id } = req.params;

      const historial = await ConfiguracionHistorial.findAll({
        where: { configuracion_id },
        order: [['version', 'DESC']],
        limit: 20
      });

      res.json({
        success: true,
        data: historial.map(h => ({
          version: h.version,
          descripcion: h.cambios_descripcion,
          fecha: h.fecha,
          usuario_id: h.usuario_id
        }))
      });

    } catch (error) {
      logger.error('Error al obtener historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener historial',
        error: error.message
      });
    }
  }
}

module.exports = ConfiguracionesController;
