/**
 * SAT-Digital Backend Application
 * Sistema de Auditorías Técnicas Digitalizado
 * 
 * Archivo principal de la aplicación Express.js con WebSockets
 * Configuración de middleware, rutas, Socket.IO para chat en tiempo real
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local' });  // Load local overrides for DB switching

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
const { verificarToken } = require('./shared/middleware/authMiddleware');
const { tenantResolver, validateUserTenant } = require('./shared/middleware/tenantResolver');
const { tenantScopeMiddleware } = require('./shared/middleware/tenantScope');
// ChatHandler for WebSocket communication
const ChatHandler = require('./domains/comunicacion/websockets/chatHandler');
// Sistema de notificaciones automáticas
const NotificacionesScheduler = require('./domains/notificaciones/services/NotificacionesScheduler');
// Multi-tenancy tenant scope hooks
const { addTenantHooks } = require('./shared/middleware/tenantScope');

// Importar rutas por dominio
const authRoutes = require('./domains/auth/routes');
const userRoutes = require('./domains/users/routes');
const providerRoutes = require('./domains/providers/routes');
const proveedoresRoutes = require('./domains/proveedores/routes/proveedoresRoutes');
const sitiosRoutes = require('./domains/proveedores/routes/sitiosRoutes');
const auditRoutes = require('./domains/audits/routes');
const calendarioRoutes = require('./domains/calendario/routes');
const documentosRoutes = require('./domains/documentos/routes');
const comunicacionRoutes = require('./domains/comunicacion/routes');
const notificacionesRoutes = require('./domains/notificaciones/routes');
const auditoresRoutes = require('./domains/auditores/routes');
const { parqueInformaticoRoutes } = require('./domains/parque-informatico/routes');
const iaAnalisisRoutes = require('./domains/ia-analisis/routes/analysisRoutes');
const diagnosticsRoutes = require('./domains/diagnosticos/routes/diagnosticsRoutes');
const configuracionesRoutes = require('./domains/configuraciones/routes');
const pliegosRoutes = require('./domains/pliegos/routes');
const headsetsRoutes = require('./domains/headsets/routes');

// Configuración de CORS — debe estar ANTES de Socket.IO y Express
const ALLOWED_ORIGINS = [
  // Producción
  'http://sat.personal.com.ar',
  'https://sat.personal.com.ar',
  'http://10.75.247.181',
  // Desarrollo local
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://localhost:3006',
  'http://localhost:3007',
  'http://localhost:3008',
  'http://localhost:3009',
  'http://localhost:3010',
  'http://localhost:3011',
  'http://localhost:3012',
  'http://localhost:3014',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

// Inicializar Express y HTTP Server
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Configuración de Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
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

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    logger.warn(`CORS bloqueado para origen: ${origin}`);
    callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// ===== MIDDLEWARE GLOBAL =====
app.use(helmet()); // Seguridad headers HTTP
app.use(compression()); // Compresión gzip
app.use(cors(corsOptions)); // CORS
app.options('*', cors(corsOptions)); // Responder preflight OPTIONS explícitamente
app.use(limiter); // Rate limiting
app.use(morgan('combined', { 
  stream: { write: message => logger.info(message.trim()) } 
})); // Logging de requests
app.use(cookieParser()); // Parse cookies
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parse URL-encoded bodies

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static('src/uploads'));

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

// ===== RUTAS PÚBLICAS (sin tenant ni autenticación) =====
app.use(`${API_PREFIX}/auth`, authRoutes);

// ===== RUTAS PROTEGIDAS (requieren autenticación + tenant context) =====
// Middleware chain: verificarToken → tenantResolver → tenantScopeMiddleware → validateUserTenant
const protectedMiddleware = [verificarToken, tenantResolver, tenantScopeMiddleware, validateUserTenant];

app.use(`${API_PREFIX}/usuarios`, ...protectedMiddleware, userRoutes);
app.use(`${API_PREFIX}/proveedores`, ...protectedMiddleware, proveedoresRoutes);
app.use(`${API_PREFIX}/sitios`, ...protectedMiddleware, sitiosRoutes);
app.use(`${API_PREFIX}/providers`, ...protectedMiddleware, providerRoutes);
app.use(`${API_PREFIX}/auditorias`, ...protectedMiddleware, auditRoutes);
app.use(`${API_PREFIX}/calendario`, ...protectedMiddleware, calendarioRoutes);
app.use(`${API_PREFIX}/documentos`, ...protectedMiddleware, documentosRoutes);
app.use(`${API_PREFIX}/comunicacion`, ...protectedMiddleware, comunicacionRoutes);
app.use(`${API_PREFIX}/notificaciones`, ...protectedMiddleware, notificacionesRoutes);
app.use(`${API_PREFIX}/auditores`, ...protectedMiddleware, auditoresRoutes);
app.use(`${API_PREFIX}/parque-informatico`, ...protectedMiddleware, parqueInformaticoRoutes);
app.use(`${API_PREFIX}/ia-analisis`, ...protectedMiddleware, iaAnalisisRoutes);
app.use(`${API_PREFIX}/diagnosticos`, ...protectedMiddleware, diagnosticsRoutes);
app.use(`${API_PREFIX}/configuraciones`, ...protectedMiddleware, configuracionesRoutes);
app.use(`${API_PREFIX}/pliegos`, ...protectedMiddleware, pliegosRoutes);
app.use(`${API_PREFIX}/headsets`, ...protectedMiddleware, headsetsRoutes);

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

    // Agregar hooks globales de tenant scope para aislamiento automático
    addTenantHooks(sequelize);
    logger.info('✅ Tenant scope hooks initialized');

    // Sincronizar modelos (solo en desarrollo) - DESACTIVADO TEMPORALMENTE
    // if (process.env.NODE_ENV === 'development') {
    //   await sequelize.sync({ alter: true });
    //   logger.info('✅ Database models synchronized');
    // }

    // Inicializar WebSocket handler
    global.chatHandler = new ChatHandler(io);
    logger.info('✅ WebSocket chat handler initialized');

    // Inicializar sistema de notificaciones automáticas
    if (process.env.NODE_ENV !== 'test') {
      NotificacionesScheduler.inicializar();
      logger.info('✅ Sistema de notificaciones automáticas inicializado');
    }

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
      
      // Detener scheduler de notificaciones
      if (NotificacionesScheduler) {
        NotificacionesScheduler.detener();
        logger.info('Notifications scheduler stopped');
      }
      
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
// Force restart for diagnostics

