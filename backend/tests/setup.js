/**
 * Jest Setup - SAT-Digital Backend
 * Configuración inicial para todos los tests
 */

require('dotenv').config({ path: '.env.test' });

// Configuración global para tests
global.testConfig = {
  timeout: 10000,
  baseURL: 'http://localhost:3001',
  testDatabase: 'sat_digital_test'
};

// Mock de console para reducir ruido en tests
const originalError = console.error;
console.error = (...args) => {
  // Silenciar errores específicos conocidos en testing
  if (
    typeof args[0] === 'string' && 
    args[0].includes('Warning: ReactDOM.render')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Configuración de timeout por defecto
jest.setTimeout(30000);

// Setup y teardown para base de datos de test
beforeAll(async () => {
  // Configurar base de datos de test si es necesario
  process.env.NODE_ENV = 'test';
  process.env.DB_NAME = 'sat_digital_test';
  process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-jwt';
});

afterAll(async () => {
  // Limpiar recursos después de todos los tests
  // Cerrar conexiones de base de datos, etc.
});

// Setup por cada test
beforeEach(() => {
  // Limpiar mocks antes de cada test
  jest.clearAllMocks();
});

afterEach(() => {
  // Limpiar después de cada test
});

// Helpers globales para tests
global.testHelpers = {
  /**
   * Genera usuario de prueba
   */
  createTestUser: (overrides = {}) => ({
    email: 'test@example.com',
    password_hash: '$2a$10$test.hash.for.testing.purposes',
    nombre: 'Usuario Test',
    rol: 'admin',
    estado: 'activo',
    ...overrides
  }),

  /**
   * Genera token JWT de prueba
   */
  generateTestToken: (payload = {}) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      {
        id: 1,
        email: 'test@example.com',
        rol: 'admin',
        ...payload
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },

  /**
   * Genera datos de auditoría de prueba
   */
  createTestAuditoria: (overrides = {}) => ({
    sitio_id: 1,
    periodo: '2025-05',
    fecha_inicio: '2025-05-01',
    fecha_limite_carga: '2025-05-15',
    fecha_visita_programada: '2025-05-20',
    auditor_asignado_id: 1,
    estado: 'programada',
    ...overrides
  }),

  /**
   * Mock de respuesta exitosa
   */
  mockSuccessResponse: (data = {}) => ({
    success: true,
    data,
    message: 'Operación exitosa'
  }),

  /**
   * Mock de respuesta de error
   */
  mockErrorResponse: (message = 'Error de prueba', code = 400) => ({
    success: false,
    error: message,
    code
  })
};

// Mocks globales comunes
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

// Mock de Winston para logging
jest.mock('winston', () => ({
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  }
}));
