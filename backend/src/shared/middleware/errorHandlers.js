/**
 * Middleware para manejo centralizado de errores
 * Incluye handlers para 404 y errores generales
 */

const logger = require('../utils/logger');

/**
 * Clase para errores personalizados de la aplicación
 */
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handler para rutas no encontradas (404)
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  
  logger.warn('Route not found', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  next(error);
};

/**
 * Manejo de errores de validación de Zod
 */
const handleZodError = (error) => {
  const errors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));

  return new AppError(`Validation failed: ${errors.map(e => e.message).join(', ')}`, 400);
};

/**
 * Manejo de errores de Sequelize
 */
const handleSequelizeError = (error) => {
  if (error.name === 'SequelizeValidationError') {
    const errors = error.errors.map(err => err.message);
    return new AppError(`Database validation failed: ${errors.join(', ')}`, 400);
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0].path;
    return new AppError(`Duplicate value for field: ${field}`, 409);
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return new AppError('Foreign key constraint violation', 400);
  }

  return new AppError('Database operation failed', 500);
};

/**
 * Manejo de errores JWT
 */
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Token has expired. Please log in again.', 401);
};

/**
 * Envío de error en desarrollo (con stack trace completo)
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

/**
 * Envío de error en producción (información limitada)
 */
const sendErrorProd = (err, res) => {
  // Errores operacionales: enviar mensaje al cliente
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } 
  // Errores de programación: no filtrar detalles
  else {
    logger.error('Programming error:', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

/**
 * Middleware principal de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log del error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    statusCode: err.statusCode
  });

  // Manejo específico por tipo de error
  let error = { ...err };
  error.message = err.message;

  // Errores de Zod (validación)
  if (err.name === 'ZodError') {
    error = handleZodError(error);
  }
  
  // Errores de Sequelize
  if (err.name && err.name.startsWith('Sequelize')) {
    error = handleSequelizeError(error);
  }
  
  // Errores JWT
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Envío de respuesta según ambiente
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Wrapper para funciones async que automatiza el catch
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler,
  asyncHandler
};
