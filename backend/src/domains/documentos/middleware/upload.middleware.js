const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar almacenamiento de multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { auditoria_id, seccion_id } = req.body;
      
      if (!auditoria_id || !seccion_id) {
        return cb(new Error('auditoria_id y seccion_id son requeridos'), null);
      }

      // Crear directorio si no existe
      const uploadPath = path.join(
        process.cwd(), 
        'uploads', 
        'auditorias', 
        auditoria_id.toString(),
        seccion_id.toString()
      );

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    } catch (error) {
      cb(error, null);
    }
  },
  
  filename: (req, file, cb) => {
    // Generar nombre único
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50);
    
    const fileName = `${timestamp}_${baseName}${extension}`;
    cb(null, fileName);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB máximo
    files: 10 // Máximo 10 archivos por request
  }
}).array('documentos', 10);

// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'Archivo demasiado grande. Máximo 200MB por archivo.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Demasiados archivos. Máximo 10 archivos por carga.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: 'Campo de archivo inesperado.'
        });
      default:
        return res.status(400).json({
          success: false,
          error: `Error de carga: ${err.message}`
        });
    }
  }
  
  if (err.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  next(err);
};

module.exports = {
  upload,
  handleMulterError
};