/**
 * Test del Sistema de Autenticación - SAT-Digital
 * Checkpoint 1.3: Pruebas completas del sistema JWT con RBAC
 * 
 * @author SAT-Digital Team
 * @version 1.0.0
 */

const request = require('supertest');
const { sequelize, Usuario, Proveedor } = require('../../src/shared/database/models');
const app = require('../../src/app');
const bcrypt = require('bcryptjs');

describe('Sistema de Autenticación - Checkpoint 1.3', () => {
  let adminToken = null;
  let auditorGeneralToken = null;
  let jefeProveedorToken = null;
  let testProveedor = null;

  beforeAll(async () => {
    // Limpiar y preparar datos de prueba
    await Usuario.destroy({ where: {}, force: true });
    
    // Crear proveedor de prueba
    testProveedor = await Proveedor.create({
      razon_social: 'Test Provider SA',
      cuit: '30-12345678-9',
      nombre_comercial: 'TestProv',
      email_contacto: 'test@provider.com',
      estado: 'activo'
    });

    // Crear usuarios de prueba con los nuevos roles
    const passwordHash = await bcrypt.hash('TestPass123!', 12);

    await Usuario.bulkCreate([
      {
        email: 'admin@sat-digital.com',
        password_hash: passwordHash,
        nombre: 'Admin Test',
        rol: 'admin',
        estado: 'activo'
      },
      {
        email: 'auditor.general@sat-digital.com',
        password_hash: passwordHash,
        nombre: 'Auditor General Test',
        rol: 'auditor_general',
        estado: 'activo'
      },
      {
        email: 'jefe.proveedor@test.com',
        password_hash: passwordHash,
        nombre: 'Jefe Proveedor Test',
        rol: 'jefe_proveedor',
        proveedor_id: testProveedor.id,
        estado: 'activo'
      }
    ]);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/v1/auth/login', () => {
    it('debe permitir login exitoso con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@sat-digital.com',
          password: 'TestPass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data).toHaveProperty('usuario');
      expect(response.body.data.usuario.rol).toBe('admin');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');

      // Guardar token para tests posteriores
      adminToken = response.body.data.tokens.accessToken;
    });

    it('debe rechazar login con email inexistente', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'noexiste@test.com',
          password: 'TestPass123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('CREDENCIALES_INVALIDAS');
    });

    it('debe incluir permisos específicos por rol', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'jefe.proveedor@test.com',
          password: 'TestPass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.permisos).toContain('documentos.cargar_empresa');
      expect(response.body.data.permisos).toContain('documentos.aprobar');
      expect(response.body.data.usuario.proveedor).toBeDefined();

      jefeProveedorToken = response.body.data.tokens.accessToken;
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('debe retornar información del usuario autenticado', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.usuario.email).toBe('admin@sat-digital.com');
      expect(response.body.data.usuario.rol).toBe('admin');
    });

    it('debe rechazar peticiones sin token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('TOKEN_REQUERIDO');
    });
  });

  describe('RBAC - Control de Acceso por Roles', () => {
    it('admin debe tener acceso a funciones administrativas', async () => {
      const response = await request(app)
        .get('/api/v1/auth/roles')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('jefe_proveedor no debe acceder a funciones administrativas', async () => {
      const response = await request(app)
        .get('/api/v1/auth/roles')
        .set('Authorization', `Bearer ${jefeProveedorToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('PERMISOS_INSUFICIENTES');
    });
  });
});
