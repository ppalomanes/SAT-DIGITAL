/**
 * Tenant Scope Middleware
 *
 * Inyecta automáticamente el filtro tenant_id en todas las queries de Sequelize
 * usando AsyncLocalStorage para mantener el contexto del tenant actual.
 */

const { AsyncLocalStorage } = require('async_hooks');

// Almacenamiento local asíncrono para el tenant context
const tenantStorage = new AsyncLocalStorage();

/**
 * Middleware para establecer el tenant context usando AsyncLocalStorage
 */
function tenantScopeMiddleware(req, res, next) {
  // Si hay un tenant resuelto en la request, establecer el contexto
  if (req.tenant && req.tenant.id) {
    tenantStorage.run({ tenantId: req.tenant.id }, () => {
      next();
    });
  } else {
    // Si no hay tenant, continuar sin contexto (rutas públicas)
    next();
  }
}

/**
 * Obtener el tenant_id del contexto actual
 */
function getCurrentTenantId() {
  const store = tenantStorage.getStore();
  return store ? store.tenantId : null;
}

/**
 * Agregar hooks globales a Sequelize para filtrado automático por tenant
 *
 * @param {Sequelize} sequelize - Instancia de Sequelize
 */
function addTenantHooks(sequelize) {
  // Hook: beforeFind - Agregar filtro tenant_id automáticamente
  sequelize.addHook('beforeFind', (options) => {
    const tenantId = getCurrentTenantId();

    // Solo aplicar si hay un tenant en el contexto
    if (tenantId) {
      // Verificar si el modelo tiene la columna tenant_id
      const model = options.model || options;
      const attributes = model.rawAttributes || model.tableAttributes || {};

      if (attributes.tenant_id) {
        // Si no hay where, crear uno
        if (!options.where) {
          options.where = {};
        }

        // Si where es un string o número (búsqueda por ID), convertir a objeto
        if (typeof options.where === 'number' || typeof options.where === 'string') {
          options.where = {
            id: options.where
          };
        }

        // Agregar tenant_id al where (solo si no está ya presente)
        if (!options.where.tenant_id) {
          options.where.tenant_id = tenantId;
        }
      }
    }
  });

  // Hook: beforeCreate - Agregar tenant_id automáticamente a nuevos registros
  sequelize.addHook('beforeCreate', (instance, options) => {
    const tenantId = getCurrentTenantId();

    if (tenantId) {
      // Verificar si el modelo tiene la columna tenant_id
      const attributes = instance.constructor.rawAttributes || instance.constructor.tableAttributes || {};

      if (attributes.tenant_id && !instance.tenant_id) {
        instance.tenant_id = tenantId;
      }
    }
  });

  // Hook: beforeBulkCreate - Agregar tenant_id a inserciones masivas
  sequelize.addHook('beforeBulkCreate', (instances, options) => {
    const tenantId = getCurrentTenantId();

    if (tenantId && instances.length > 0) {
      const attributes = instances[0].constructor.rawAttributes || instances[0].constructor.tableAttributes || {};

      if (attributes.tenant_id) {
        instances.forEach(instance => {
          if (!instance.tenant_id) {
            instance.tenant_id = tenantId;
          }
        });
      }
    }
  });

  // Hook: beforeUpdate - Prevenir actualización de registros de otro tenant
  sequelize.addHook('beforeUpdate', (instance, options) => {
    const tenantId = getCurrentTenantId();

    if (tenantId) {
      const attributes = instance.constructor.rawAttributes || instance.constructor.tableAttributes || {};

      if (attributes.tenant_id) {
        // Verificar que el registro pertenece al tenant actual
        if (instance.tenant_id && instance.tenant_id !== tenantId) {
          throw new Error('No se puede actualizar un registro de otro tenant');
        }
      }
    }
  });

  // Hook: beforeDestroy - Prevenir eliminación de registros de otro tenant
  sequelize.addHook('beforeDestroy', (instance, options) => {
    const tenantId = getCurrentTenantId();

    if (tenantId) {
      const attributes = instance.constructor.rawAttributes || instance.constructor.tableAttributes || {};

      if (attributes.tenant_id) {
        // Verificar que el registro pertenece al tenant actual
        if (instance.tenant_id && instance.tenant_id !== tenantId) {
          throw new Error('No se puede eliminar un registro de otro tenant');
        }
      }
    }
  });

  // Hook: beforeBulkUpdate - Agregar filtro en actualizaciones masivas
  sequelize.addHook('beforeBulkUpdate', (options) => {
    const tenantId = getCurrentTenantId();

    if (tenantId) {
      const model = options.model;
      const attributes = model.rawAttributes || model.tableAttributes || {};

      if (attributes.tenant_id) {
        if (!options.where) {
          options.where = {};
        }

        if (!options.where.tenant_id) {
          options.where.tenant_id = tenantId;
        }
      }
    }
  });

  // Hook: beforeBulkDestroy - Agregar filtro en eliminaciones masivas
  sequelize.addHook('beforeBulkDestroy', (options) => {
    const tenantId = getCurrentTenantId();

    if (tenantId) {
      const model = options.model;
      const attributes = model.rawAttributes || model.tableAttributes || {};

      if (attributes.tenant_id) {
        if (!options.where) {
          options.where = {};
        }

        if (!options.where.tenant_id) {
          options.where.tenant_id = tenantId;
        }
      }
    }
  });

  console.log('✅ Tenant scope hooks agregados a Sequelize');
}

/**
 * Helper para ejecutar código sin tenant scope (admin tasks)
 */
function withoutTenantScope(callback) {
  // Ejecutar el callback sin contexto de tenant
  return callback();
}

/**
 * Helper para ejecutar código con un tenant específico
 */
function withTenantScope(tenantId, callback) {
  return tenantStorage.run({ tenantId }, callback);
}

module.exports = {
  tenantScopeMiddleware,
  getCurrentTenantId,
  addTenantHooks,
  withoutTenantScope,
  withTenantScope,
  tenantStorage
};
