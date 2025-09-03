/**
 * SAT-Digital Backend Application
 * Sistema de Auditorías Técnicas Digitalizado
 * 
 * Archivo principal de la aplicación Express.js con WebSockets
 * Configuración de middleware, rutas, Socket.IO para chat en tiempo real
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Importar configuraciones y utilities
const { sequelize } = require('./shared/database/connection');
const logger = require('./shared/utils/logger');
const { errorHandler, notFoundHandler } = require('./shared/middleware/errorHandlers');
// TEMP: Comentado para debug
// const ChatHandler = require('./domains/comunicacion/websockets/chatHandler');

// Importar rutas por dominio
const authRoutes = require('./domains/auth/routes');
// const userRoutes = require('./domains/users/routes'); // TEMP: Comentado para debug
const providerRoutes = require('./domains/providers/routes');
const auditRoutes = require('./domains/audits/routes');
const calendarioRoutes = require('./domains/calendario/routes');
// const documentosRoutes = require('./domains/documentos/routes'); // TEMP: Comentado para debug
// const comunicacionRoutes = require('./domains/comunicacion/routes'); // TEMP: Comentado para debug
// const notificacionesRoutes = require('./domains/notificaciones/routes'); // TEMP: Comentado para debug

// Inicializar Express y HTTP Server
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Configuración de Socket.IO
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3003',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3003', 
      'http://127.0.0.1:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Configuración de Rate Limiting (más permisivo para desarrollo)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // 1000 requests por ventana (más permisivo)
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Saltar rate limiting en desarrollo para localhost
    return req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1';
  }
});

// Configuración de CORS
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3003',  // Puerto actual del frontend
    'http://localhost:5173',  // Puerto por defecto de Vite
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3003',
    'http://127.0.0.1:5173'
  ],
  credentials: process.env.CORS_CREDENTIALS === 'true' || true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// ===== MIDDLEWARE GLOBAL =====
app.use(helmet()); // Seguridad headers HTTP
app.use(compression()); // Compresión gzip
app.use(cors(corsOptions)); // CORS
app.use(limiter); // Rate limiting
app.use(morgan('combined', { 
  stream: { write: message => logger.info(message.trim()) } 
})); // Logging de requests
app.use(cookieParser()); // Parse cookies
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parse URL-encoded bodies

// Middleware para hacer Socket.IO disponible en rutas
app.use((req, res, next) => {
  req.io = io;
  req.chatHandler = global.chatHandler;
  next();
});

// ===== RUTAS =====
// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION || '1.0.0',
    websocket_status: 'enabled',
    connected_users: global.chatHandler ? global.chatHandler.obtenerUsuariosConectados().length : 0
  });
});

// API Routes con prefijo
const API_PREFIX = '/api';

app.use(`${API_PREFIX}/auth`, authRoutes);
// app.use(`${API_PREFIX}/usuarios`, userRoutes); // TEMP: Comentado
app.use(`${API_PREFIX}/proveedores`, providerRoutes);
app.use(`${API_PREFIX}/auditorias`, auditRoutes);
app.use(`${API_PREFIX}/calendario`, calendarioRoutes);
// app.use(`${API_PREFIX}/documentos`, documentosRoutes); // TEMP: Comentado
// app.use(`${API_PREFIX}/comunicacion`, comunicacionRoutes); // TEMP: Comentado
// app.use(`${API_PREFIX}/notificaciones`, notificacionesRoutes); // TEMP: Comentado

// Documentación API (Swagger) - solo en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.get('/api-docs', (req, res) => {
    res.json({
      message: 'API Documentation endpoint - Swagger UI will be implemented here',
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      websocket_enabled: true,
      chat_system: 'active'
    });
  });
}

// ===== MANEJO DE ERRORES =====
app.use(notFoundHandler);
app.use(errorHandler);

// ===== INICIALIZACIÓN DEL SERVIDOR =====
const startServer = async () => {
  try {
    // Verificar conexión a base de datos
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');

    // Sincronizar modelos (solo en desarrollo) - DESACTIVADO TEMPORALMENTE
    // if (process.env.NODE_ENV === 'development') {
    //   await sequelize.sync({ alter: true });
    //   logger.info('✅ Database models synchronized');
    // }

    // Inicializar WebSocket handler - TEMP: Comentado
    // global.chatHandler = new ChatHandler(io);
    // logger.info('✅ WebSocket chat handler initialized');
    global.chatHandler = null; // Placeholder

    // Iniciar servidor
    server.listen(PORT, () => {
      logger.info(`🚀 SAT-Digital Backend running on port ${PORT}`);
      logger.info(`📚 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🌐 API Base URL: http://localhost:${PORT}${API_PREFIX}`);
      logger.info(`💬 WebSocket Chat: ws://localhost:${PORT}`);
      logger.info(`❤️  Health Check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      // Cerrar WebSocket connections
      if (global.chatHandler) {
        io.close(() => {
          logger.info('WebSocket server closed');
        });
      }
      
      server.close(() => {
        logger.info('HTTP server closed');
        sequelize.close().then(() => {
          logger.info('Database connection closed');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Iniciar aplicación solo si no está siendo importada para tests
if (require.main === module) {
  startServer();
}

module.exports = { app, server, io };
