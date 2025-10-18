/**
 * Tenant Resolver Middleware
 *
 * Este middleware identifica y resuelve el tenant actual basado en:
 * 1. Header X-Tenant-ID (prioridad alta)
 * 2. Subdomain (ej: telecom.satdigital.com)
 * 3. Usuario autenticado (tenant_id del usuario)
 * 4. Query parameter ?tenant=slug
 *
 * Una vez resuelto, agrega el tenant al contexto de la request (req.tenant)
 */

const { Tenant } = require('../database/models');

/**
 * Extrae el tenant desde diferentes fuentes
 */
async function resolveTenant(req) {
  let tenantIdentifier = null;
  let identifierType = null;

  // 1. Header X-Tenant-ID (más explícito y seguro)
  if (req.headers['x-tenant-id']) {
    tenantIdentifier = req.headers['x-tenant-id'];
    identifierType = 'header-id';
  }

  // 2. Header X-Tenant-Slug
  else if (req.headers['x-tenant-slug']) {
    tenantIdentifier = req.headers['x-tenant-slug'];
    identifierType = 'header-slug';
  }

  // 3. Subdomain (ej: telecom.satdigital.com → telecom)
  else if (req.subdomains && req.subdomains.length > 0) {
    // Express popula req.subdomains automáticamente
    tenantIdentifier = req.subdomains[req.subdomains.length - 1];
    identifierType = 'subdomain';
  }

  // 4. Usuario autenticado (tenant_id del JWT)
  // Compatible con req.user (JWT decoded) y req.usuario (Usuario de DB)
  else if (req.user && req.user.tenant_id) {
    tenantIdentifier = req.user.tenant_id;
    identifierType = 'user';
  }
  else if (req.usuario && req.usuario.tenant_id) {
    tenantIdentifier = req.usuario.tenant_id;
    identifierType = 'user';
  }

  // 5. Query parameter (útil para testing/debug)
  else if (req.query.tenant) {
    tenantIdentifier = req.query.tenant;
    identifierType = 'query';
  }

  // Si no se encontró identificador, retornar null
  if (!tenantIdentifier) {
    return null;
  }

  // Buscar tenant en la base de datos
  try {
    let tenant = null;

    if (identifierType === 'header-id' || identifierType === 'user') {
      // Buscar por ID
      tenant = await Tenant.findByPk(tenantIdentifier);
    } else {
      // Buscar por slug
      tenant = await Tenant.findOne({
        where: { slug: tenantIdentifier, activo: true }
      });
    }

    if (!tenant) {
      throw new Error(`Tenant no encontrado: ${tenantIdentifier}`);
    }

    if (!tenant.activo) {
      throw new Error(`Tenant inactivo: ${tenant.nombre}`);
    }

    return tenant;
  } catch (error) {
    throw new Error(`Error resolviendo tenant: ${error.message}`);
  }
}

/**
 * Middleware principal de tenant resolution
 */
async function tenantResolver(req, res, next) {
  try {
    const tenant = await resolveTenant(req);

    if (!tenant) {
      // Si no se pudo resolver el tenant, devolver error
      return res.status(400).json({
        success: false,
        error: 'Tenant requerido',
        message: 'No se pudo identificar el tenant. Proporcione X-Tenant-ID header o autentíquese.'
      });
    }

    // Agregar tenant al contexto de la request
    req.tenant = tenant;
    req.tenantId = tenant.id;

    // Agregar tenant_id a los headers de respuesta (útil para debugging)
    res.setHeader('X-Tenant-ID', tenant.id);
    res.setHeader('X-Tenant-Slug', tenant.slug);

    next();
  } catch (error) {
    console.error('❌ Error en tenant resolver:', error);

    return res.status(403).json({
      success: false,
      error: 'Tenant inválido',
      message: error.message
    });
  }
}

/**
 * Middleware opcional: permite requests sin tenant (para rutas públicas)
 */
async function optionalTenantResolver(req, res, next) {
  try {
    const tenant = await resolveTenant(req);

    if (tenant) {
      req.tenant = tenant;
      req.tenantId = tenant.id;
      res.setHeader('X-Tenant-ID', tenant.id);
      res.setHeader('X-Tenant-Slug', tenant.slug);
    }

    next();
  } catch (error) {
    // En modo opcional, los errores no bloquean la request
    console.warn('⚠️  Advertencia en tenant resolver:', error.message);
    next();
  }
}

/**
 * Middleware para validar que el usuario pertenece al tenant
 */
function validateUserTenant(req, res, next) {
  // Compatible con req.user (JWT) y req.usuario (Usuario de DB)
  const user = req.usuario || req.user;

  if (!user || !req.tenant) {
    return res.status(401).json({
      success: false,
      error: 'Autenticación requerida'
    });
  }

  // Verificar que el usuario pertenece al tenant actual
  if (user.tenant_id !== req.tenant.id) {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado',
      message: 'El usuario no pertenece a este tenant'
    });
  }

  next();
}

/**
 * Helper para obtener el tenant actual desde el contexto de Sequelize
 */
function getCurrentTenant() {
  // Esta función se puede usar dentro de hooks de Sequelize
  // Sequelize guardará el tenant en el contexto de la transacción
  const { AsyncLocalStorage } = require('async_hooks');
  const tenantStorage = new AsyncLocalStorage();

  return tenantStorage.getStore();
}

module.exports = {
  tenantResolver,
  optionalTenantResolver,
  validateUserTenant,
  resolveTenant,
  getCurrentTenant
};
