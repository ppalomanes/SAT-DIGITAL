/**
 * SAT-Digital Backend - Parque Informático Controller
 * Controlador para gestión y análisis de inventario de hardware
 * Preparado para integración con IA (Ollama/LLaVA)
 */

const HardwareNormalizerService = require('../services/HardwareNormalizerService');
const multer = require('multer');
const logger = require('../../../shared/utils/logger');

// Configurar multer para carga de archivos
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no soportado. Solo se permiten archivos Excel (.xlsx, .xls) y CSV'));
    }
  }
});

class ParqueInformaticoController {
  constructor() {
    this.hardwareService = new HardwareNormalizerService();
  }

  /**
   * @swagger
   * /api/parque-informatico/info:
   *   get:
   *     summary: Información del servicio de Parque Informático
   *     tags: [Parque Informático]
   *     responses:
   *       200:
   *         description: Información del servicio
   */
  getServiceInfo = (req, res) => {
    try {
      res.json({
        success: true,
        service: 'SAT-Digital Parque Informático',
        version: '1.0.0',
        description: 'Sistema de análisis y normalización de inventario de hardware con IA integrada',
        features: [
          'Normalización automática ETL de hardware',
          'Validación contra estándares configurables',
          'Estadísticas y métricas avanzadas',
          'Sistema de recomendaciones inteligente',
          'Análisis automático con Ollama/LLaVA (Fase 3)',
          'Scoring automático por IA',
          'Exportación múltiple (Excel, PDF, CSV)'
        ],
        supportedFields: [
          'Proveedor', 'Sitio', 'Atención', 'Usuario', 'Hostname',
          'Procesador', 'RAM', 'Almacenamiento', 'Sistema Operativo',
          'Navegador', 'Headset', 'ISP', 'Conexión', 'Velocidades', 'Antivirus'
        ],
        aiFeatures: {
          available: false, // Se activará en Fase 3
          models: ['LLaVA (vision)', 'Llama 3.1 (text)'],
          capabilities: ['Análisis automático', 'Scoring inteligente', 'Detección de anomalías']
        }
      });
    } catch (error) {
      logger.error('Error obteniendo información del servicio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * @swagger
   * /api/parque-informatico/process:
   *   post:
   *     summary: Procesar archivo Excel con inventario de hardware
   *     tags: [Parque Informático]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *               customRules:
   *                 type: string
   *                 description: JSON con reglas de validación personalizadas
   *     responses:
   *       200:
   *         description: Archivo procesado exitosamente
   *       400:
   *         description: Error en el archivo o parámetros
   */
  processHardwareFile = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se recibió ningún archivo'
        });
      }

      // Parsear reglas personalizadas si se enviaron
      let customRules = null;
      if (req.body.customRules) {
        try {
          customRules = JSON.parse(req.body.customRules);
        } catch (error) {
          logger.warn('Error parseando reglas personalizadas:', error);
        }
      }

      logger.info(`Procesando archivo ${req.file.originalname} (${req.file.size} bytes) para usuario ${req.usuario.email}`);

      // Procesar archivo
      const result = await this.hardwareService.processExcelFile(req.file.buffer, customRules);

      // Agregar metadatos de auditoría
      result.auditInfo = {
        processedBy: req.usuario.email,
        processedAt: new Date().toISOString(),
        fileName: req.file.originalname,
        fileSize: req.file.size,
        userRole: req.usuario.rol,
        proveedor: req.usuario.proveedor_id ? req.usuario.proveedor?.razon_social : null
      };

      // Log del resultado
      logger.info(`Procesamiento completado: ${result.totalRecords} registros, ${result.validRecords} válidos (${((result.validRecords/result.totalRecords)*100).toFixed(2)}%)`);

      res.json({
        success: true,
        data: result,
        message: `Archivo procesado exitosamente: ${result.totalRecords} registros analizados`
      });

    } catch (error) {
      logger.error('Error procesando archivo de hardware:', error);
      res.status(500).json({
        success: false,
        message: `Error al procesar archivo: ${error.message}`
      });
    }
  };

  /**
   * @swagger
   * /api/parque-informatico/demo-data:
   *   get:
   *     summary: Generar datos de demostración para testing
   *     tags: [Parque Informático]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Datos de demostración generados
   */
  generateDemoData = async (req, res) => {
    try {
      logger.info(`Generando datos de demostración para usuario ${req.usuario.email}`);

      // Crear datos de demostración realistas
      const demoData = this.createDemoData();
      
      // Procesar como si fuera un archivo real
      const XLSX = require('xlsx');
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(demoData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Demo Hardware');

      const excelBuffer = XLSX.write(workbook, {
        type: 'array',
        bookType: 'xlsx'
      });

      const result = await this.hardwareService.processExcelFile(Buffer.from(excelBuffer));

      // Agregar metadatos
      result.auditInfo = {
        processedBy: req.usuario.email,
        processedAt: new Date().toISOString(),
        fileName: 'datos_demo_hardware.xlsx',
        fileSize: excelBuffer.length,
        userRole: req.usuario.rol,
        isDemoData: true
      };

      res.json({
        success: true,
        data: result,
        message: `Datos de demostración generados: ${result.totalRecords} registros simulados`
      });

    } catch (error) {
      logger.error('Error generando datos de demostración:', error);
      res.status(500).json({
        success: false,
        message: `Error al generar datos de demostración: ${error.message}`
      });
    }
  };

  /**
   * @swagger
   * /api/parque-informatico/validation-rules:
   *   get:
   *     summary: Obtener reglas de validación actuales
   *     tags: [Parque Informático]
   *     security:
   *       - bearerAuth: []
   */
  getValidationRules = (req, res) => {
    try {
      const rules = this.hardwareService.defaultValidationRules;
      
      res.json({
        success: true,
        data: {
          rules: rules,
          description: 'Reglas de validación para análisis de hardware',
          modifiable: true,
          aiEnhanced: false // Se activará en Fase 3
        }
      });

    } catch (error) {
      logger.error('Error obteniendo reglas de validación:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener reglas de validación'
      });
    }
  };

  /**
   * @swagger
   * /api/parque-informatico/validation-rules:
   *   put:
   *     summary: Actualizar reglas de validación
   *     tags: [Parque Informático]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               rules:
   *                 type: object
   *                 description: Nuevas reglas de validación
   */
  updateValidationRules = (req, res) => {
    try {
      const { rules } = req.body;

      if (!rules || typeof rules !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Se requieren reglas de validación válidas'
        });
      }

      // Validar estructura básica de reglas
      const requiredSections = ['cpu', 'ram', 'storage', 'network', 'os'];
      const missingSections = requiredSections.filter(section => !rules[section]);

      if (missingSections.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Faltan secciones requeridas en las reglas: ${missingSections.join(', ')}`
        });
      }

      // Actualizar reglas (en producción esto se guardaría en BD)
      this.hardwareService.defaultValidationRules = { ...this.hardwareService.defaultValidationRules, ...rules };

      logger.info(`Reglas de validación actualizadas por usuario ${req.usuario.email}`);

      res.json({
        success: true,
        message: 'Reglas de validación actualizadas correctamente',
        data: {
          updatedRules: this.hardwareService.defaultValidationRules
        }
      });

    } catch (error) {
      logger.error('Error actualizando reglas de validación:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar reglas de validación'
      });
    }
  };

  /**
   * Crear datos de demostración realistas
   */
  createDemoData() {
    const proveedores = ['Grupo Activo SRL', 'APEX', 'CityTech S.A.', 'CAT Technologies', 'Stratton Argentina'];
    const sitios = ['Córdoba Centro', 'Buenos Aires Norte', 'Mendoza', 'Rosario', 'La Plata'];
    
    const procesadores = [
      'Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz',
      'Intel(R) Core(TM) i5-9400F CPU @ 2.90GHz',
      'Intel(R) Core(TM) i3-10100 CPU @ 3.60GHz',
      'AMD Ryzen 7 5800X 8-Core Processor',
      'AMD Ryzen 5 3600 6-Core Processor',
      'Intel(R) Core(TM) i5-8400 CPU @ 2.80GHz',
      'AMD Ryzen 7 3700X 8-Core Processor',
      'Intel(R) Core(TM) i7-9700K CPU @ 3.60GHz'
    ];

    const ramOptions = ['8 GB DDR4', '16 GB DDR4', '32 GB DDR4', '12 GB DDR4'];
    const storageOptions = ['256 GB SSD', '512 GB SSD', '1 TB HDD', '1 TB SSD', '480 GB SSD'];
    const osOptions = ['Windows 11 - version 22H2', 'Windows 10 - version 21H2'];
    const navegadores = ['Chrome 118.0.5993.88', 'Edge 118.0.2088.46', 'Firefox 119.0'];

    const data = [];
    for (let i = 1; i <= 100; i++) {
      data.push({
        Proveedor: proveedores[Math.floor(Math.random() * proveedores.length)],
        Sitio: sitios[Math.floor(Math.random() * sitios.length)],
        Atención: Math.random() > 0.3 ? 'Presencial' : 'Remoto',
        Usuario: `u${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
        Hostname: `PC-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
        'Procesador (marca, modelo y velocidad)': procesadores[Math.floor(Math.random() * procesadores.length)],
        RAM: ramOptions[Math.floor(Math.random() * ramOptions.length)],
        Almacenamiento: storageOptions[Math.floor(Math.random() * storageOptions.length)],
        'Sistema Operativo': osOptions[Math.floor(Math.random() * osOptions.length)],
        Navegador: navegadores[Math.floor(Math.random() * navegadores.length)],
        Headset: 'Logitech H390',
        'Nombre ISP': 'Fibertel',
        'Tipo de conexión': Math.random() > 0.2 ? 'Fibra' : 'Cable',
        'Velocidad Down': `${(Math.random() * 80 + 20).toFixed(1)} Mbps`,
        'Velocidad Up': `${(Math.random() * 20 + 5).toFixed(1)} Mbps`,
        Antivirus: 'Bitdefender Total Security'
      });
    }

    return data;
  }

  /**
   * Middleware de multer para manejar upload
   */
  static getUploadMiddleware() {
    return upload.single('file');
  }
}

module.exports = ParqueInformaticoController;