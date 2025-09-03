/**
 * Jest Configuration - SAT-Digital Backend
 * Configuración completa para testing unitario e integración
 */

module.exports = {
  // Entorno de testing
  testEnvironment: 'node',
  
  // Archivos de configuración inicial
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Patrones de archivos de test
  testMatch: [
    '**/__tests__/**/*.js',
    '**/__tests__/**/*.test.js',
    '**/tests/**/*.test.js',
    '**/*.test.js'
  ],
  
  // Archivos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/uploads/'
  ],
  
  // Configuración de coverage
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/database/migrations/**',
    '!src/database/seeders/**',
    '!src/database/models/index.js',
    '!src/app.js',
    '!src/shared/config/**',
    '!src/shared/scripts/**',
    '!**/node_modules/**'
  ],
  
  // Directorios de coverage
  coverageDirectory: 'coverage',
  
  // Reportes de coverage
  coverageReporters: [
    'text',
    'lcov', 
    'html',
    'json'
  ],
  
  // Umbral mínimo de coverage
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    // Coverage específico para módulos críticos
    './src/domains/auth/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Transformadores para ES6+
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Configuración para módulos
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@domains/(.*)$': '<rootDir>/src/domains/$1'
  },
  
  // Variables de entorno para testing
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  
  // Timeout para tests largos
  testTimeout: 30000,
  
  // Configuración verbose para debugging
  verbose: true,
  
  // Limpiar mocks automáticamente
  clearMocks: true,
  
  // Restablecer mocks entre tests
  resetMocks: true
};
