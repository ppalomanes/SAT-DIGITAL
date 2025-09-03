/**
 * Tests Unitarios - AuthService
 * Sistema de Autenticación SAT-Digital
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthService = require('../../../src/domains/auth/services/AuthService');

// Mock de modelos de Sequelize
jest.mock('../../../src/shared/database/models', () => ({
  Usuario: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

const { Usuario } = require('../../../src/shared/database/models');

describe('AuthService - Tests Unitarios', () => {
  
  beforeEach(() => {
    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
    
    // Configurar variables de entorno para testing
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  describe('login', () => {
    it('debe hacer login exitoso con credenciales válidas', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const mockUser = {
        id: 1,
        email,
        password_hash: hashedPassword,
        nombre: 'Usuario Test',
        rol: 'admin',
        estado: 'activo',
        proveedor_id: null,
        update: jest.fn().mockResolvedValue(),
        increment: jest.fn().mockResolvedValue()
      };

      Usuario.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.login(email, password);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('token');
      expect(result.data).toHaveProperty('refreshToken');
      expect(result.data).toHaveProperty('usuario');
      expect(result.data.usuario.email).toBe(email);
      expect(result.data.usuario).not.toHaveProperty('password_hash');
      
      expect(Usuario.findOne).toHaveBeenCalledWith({
        where: { email, estado: 'activo' }
      });
      
      expect(mockUser.update).toHaveBeenCalledWith({
        intentos_fallidos: 0,
        ultimo_acceso: expect.any(Date),
        token_refresh: expect.any(String)
      });
    });

    it('debe fallar login con email inexistente', async () => {
      // Arrange
      const email = 'inexistente@example.com';
      const password = 'password123';
      
      Usuario.findOne.mockResolvedValue(null);

      // Act
      const result = await AuthService.login(email, password);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Credenciales inválidas');
      expect(result.code).toBe(401);
      
      expect(Usuario.findOne).toHaveBeenCalledWith({
        where: { email, estado: 'activo' }
      });
    });

    it('debe fallar login con password incorrecto', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password-incorrecto';
      const correctPassword = 'password123';
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
      const result = await AuthService.login(email, password);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Credenciales inválidas');
      expect(result.code).toBe(401);
      
      expect(mockUser.increment).toHaveBeenCalledWith('intentos_fallidos');
    });

    it('debe fallar login con usuario inactivo', async () => {
      // Arrange
      const email = 'inactivo@example.com';
      const password = 'password123';
      
      Usuario.findOne.mockResolvedValue(null); // Usuario inactivo no se encuentra

      // Act
      const result = await AuthService.login(email, password);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Credenciales inválidas');
      expect(result.code).toBe(401);
    });
  });

  describe('refreshToken', () => {
    it('debe generar nuevo token con refresh token válido', async () => {
      // Arrange
      const userId = 1;
      const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET);
      
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        rol: 'admin',
        proveedor_id: null,
        estado: 'activo',
        token_refresh: refreshToken
      };

      Usuario.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.refreshToken(refreshToken);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('token');
      
      // Verificar que el nuevo token contiene la información correcta
      const decodedToken = jwt.verify(result.data.token, process.env.JWT_SECRET);
      expect(decodedToken.id).toBe(userId);
      expect(decodedToken.email).toBe('test@example.com');
      expect(decodedToken.rol).toBe('admin');
    });

    it('debe fallar con refresh token inválido', async () => {
      // Arrange
      const invalidRefreshToken = 'token-invalido';
      
      // Act & Assert
      await expect(AuthService.refreshToken(invalidRefreshToken))
        .rejects.toThrow();
    });

    it('debe fallar con refresh token de usuario inexistente', async () => {
      // Arrange
      const refreshToken = jwt.sign({ id: 999 }, process.env.JWT_REFRESH_SECRET);
      
      Usuario.findOne.mockResolvedValue(null);

      // Act
      const result = await AuthService.refreshToken(refreshToken);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Refresh token inválido');
      expect(result.code).toBe(401);
    });
  });

  describe('verifyToken', () => {
    it('debe verificar token JWT válido', async () => {
      // Arrange
      const payload = {
        id: 1,
        email: 'test@example.com',
        rol: 'admin',
        proveedor_id: null
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        rol: 'admin',
        estado: 'activo'
      };

      Usuario.findByPk.mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.verifyToken(token);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.usuario.id).toBe(payload.id);
      expect(result.data.usuario.email).toBe(payload.email);
      expect(result.data.usuario.rol).toBe(payload.rol);
    });

    it('debe fallar con token inválido', async () => {
      // Arrange
      const invalidToken = 'token-completamente-invalido';

      // Act
      const result = await AuthService.verifyToken(invalidToken);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Token inválido');
      expect(result.code).toBe(401);
    });

    it('debe fallar con token de usuario inactivo', async () => {
      // Arrange
      const payload = { id: 1, email: 'test@example.com', rol: 'admin' };
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      
      Usuario.findByPk.mockResolvedValue(null); // Usuario no encontrado o inactivo

      // Act
      const result = await AuthService.verifyToken(token);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuario inválido o inactivo');
      expect(result.code).toBe(401);
    });
  });

  describe('logout', () => {
    it('debe hacer logout exitoso invalidando refresh token', async () => {
      // Arrange
      const userId = 1;
      const mockUser = {
        id: userId,
        update: jest.fn().mockResolvedValue()
      };

      Usuario.findByPk.mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.logout(userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Logout exitoso');
      
      expect(mockUser.update).toHaveBeenCalledWith({
        token_refresh: null
      });
    });

    it('debe fallar logout con usuario inexistente', async () => {
      // Arrange
      const userId = 999;
      Usuario.findByPk.mockResolvedValue(null);

      // Act
      const result = await AuthService.logout(userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuario no encontrado');
      expect(result.code).toBe(404);
    });
  });

  describe('hashPassword', () => {
    it('debe generar hash de password correctamente', async () => {
      // Arrange
      const password = 'password123';

      // Act
      const hashedPassword = await AuthService.hashPassword(password);

      // Assert
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(await bcrypt.compare(password, hashedPassword)).toBe(true);
    });

    it('debe generar hashes diferentes para la misma password', async () => {
      // Arrange
      const password = 'password123';

      // Act
      const hash1 = await AuthService.hashPassword(password);
      const hash2 = await AuthService.hashPassword(password);

      // Assert
      expect(hash1).not.toBe(hash2);
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });
  });

  describe('validateRole', () => {
    it('debe validar roles correctos', () => {
      // Arrange & Act & Assert
      expect(AuthService.validateRole('admin')).toBe(true);
      expect(AuthService.validateRole('auditor')).toBe(true);
      expect(AuthService.validateRole('proveedor')).toBe(true);
      expect(AuthService.validateRole('visualizador')).toBe(true);
    });

    it('debe rechazar roles inválidos', () => {
      // Arrange & Act & Assert
      expect(AuthService.validateRole('invalid-role')).toBe(false);
      expect(AuthService.validateRole('')).toBe(false);
      expect(AuthService.validateRole(null)).toBe(false);
      expect(AuthService.validateRole(undefined)).toBe(false);
    });
  });
});
