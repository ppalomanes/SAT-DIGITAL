/**
 * Tests de Integración - API Auth Endpoints
 * Sistema de Autenticación SAT-Digital
 */

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');

// Mock de modelos para evitar conexión real a BD en tests
jest.mock('../../src/shared/database/models', () => ({
  Usuario: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(),
    close: jest.fn().mockResolvedValue()
  }
}));

const { Usuario } = require('../../src/shared/database/models');

describe('API Auth Endpoints - Tests de Integración', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Cerrar servidor y limpiar recursos
  });

  describe('POST /api/auth/login', () => {
    it('debe permitir login con credenciales válidas', async () => {
      // Arrange
      const email = 'admin@satdigital.com';
      const password = 'admin123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const mockUser = {
        id: 1,
        email,
        password_hash: hashedPassword,
        nombre: 'Administrador',
        rol: 'admin',
        estado: 'activo',
        proveedor_id: null,
        update: jest.fn().mockResolvedValue(),
        increment: jest.fn().mockResolvedValue()
      };

      Usuario.findOne.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('usuario');
      expect(response.body.data.usuario.email).toBe(email);
      expect(response.body.data.usuario).not.toHaveProperty('password_hash');
    });

    it('debe rechazar login con email inválido', async () => {
      // Arrange
      Usuario.findOne.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inexistente@example.com',
          password: 'password123'
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Credenciales inválidas');
    });

    it('debe rechazar login con password incorrecta', async () => {
      // Arrange
      const email = 'admin@satdigital.com';
      const correctPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(correctPassword, 10);
      
      const mockUser = {
        id: 1,
        email,
        password_hash: hashedPassword,
        estado: 'activo',
        increment: jest.fn().mockResolvedValue()
      };

      Usuario.findOne.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password: 'password-incorrecto'
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Credenciales inválidas');
    });

    it('debe validar formato de email', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'email-invalido',
          password: 'password123'
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('email');
    });

    it('debe validar password requerida', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // password omitida
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('password');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('debe generar nuevo token con refresh token válido', async () => {
      // Arrange
      const jwt = require('jsonwebtoken');
      const userId = 1;
      const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET);
      
      const mockUser = {
        id: userId,
        email: 'admin@satdigital.com',
        rol: 'admin',
        proveedor_id: null,
        estado: 'activo',
        token_refresh: refreshToken
      };

      Usuario.findOne.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      
      // Verificar que el token es válido
      const decodedToken = jwt.verify(response.body.data.token, process.env.JWT_SECRET);
      expect(decodedToken.id).toBe(userId);
    });

    it('debe rechazar refresh token inválido', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'token-completamente-invalido'
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Refresh token inválido');
    });

    it('debe validar refresh token requerido', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('refreshToken');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('debe hacer logout exitoso con token válido', async () => {
      // Arrange
      const jwt = require('jsonwebtoken');
      const userId = 1;
      const token = jwt.sign({ 
        id: userId, 
        email: 'admin@satdigital.com', 
        rol: 'admin' 
      }, process.env.JWT_SECRET);

      const mockUser = {
        id: userId,
        update: jest.fn().mockResolvedValue()
      };

      Usuario.findByPk.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send();

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout exitoso');
      expect(mockUser.update).toHaveBeenCalledWith({ token_refresh: null });
    });

    it('debe rechazar logout sin token', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/logout')
        .send();

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Acceso denegado. Token requerido.');
    });

    it('debe rechazar logout con token inválido', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer token-invalido')
        .send();

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token inválido');
    });
  });

  describe('GET /api/auth/me', () => {
    it('debe obtener información del usuario autenticado', async () => {
      // Arrange
      const jwt = require('jsonwebtoken');
      const userId = 1;
      const token = jwt.sign({ 
        id: userId, 
        email: 'admin@satdigital.com', 
        rol: 'admin' 
      }, process.env.JWT_SECRET);

      const mockUser = {
        id: userId,
        email: 'admin@satdigital.com',
        nombre: 'Administrador',
        rol: 'admin',
        estado: 'activo',
        proveedor_id: null
      };

      Usuario.findByPk.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.usuario.id).toBe(userId);
      expect(response.body.data.usuario.email).toBe('admin@satdigital.com');
      expect(response.body.data.usuario).not.toHaveProperty('password_hash');
    });

    it('debe rechazar sin token de autenticación', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/me');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Acceso denegado. Token requerido.');
    });
  });

  describe('Middleware de autenticación', () => {
    it('debe validar token en rutas protegidas', async () => {
      // Arrange
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ 
        id: 1, 
        email: 'admin@satdigital.com', 
        rol: 'admin' 
      }, process.env.JWT_SECRET);

      const mockUser = {
        id: 1,
        email: 'admin@satdigital.com',
        rol: 'admin',
        estado: 'activo'
      };

      Usuario.findByPk.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
    });

    it('debe rechazar tokens expirados', async () => {
      // Arrange
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign({ 
        id: 1, 
        email: 'admin@satdigital.com', 
        rol: 'admin' 
      }, process.env.JWT_SECRET, { expiresIn: '0s' });

      // Esperar un poco para que expire
      await new Promise(resolve => setTimeout(resolve, 100));

      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token inválido');
    });
  });

  describe('Rate limiting', () => {
    it('debe aplicar rate limiting en endpoint de login', async () => {
      // Arrange
      Usuario.findOne.mockResolvedValue(null);

      const requests = [];
      // Hacer múltiples requests rápidos
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'password123'
            })
        );
      }

      // Act
      const responses = await Promise.all(requests);

      // Assert
      // Algunos requests deben ser bloqueados por rate limiting
      const blockedRequests = responses.filter(r => r.status === 429);
      expect(blockedRequests.length).toBeGreaterThan(0);
    });
  });
});
