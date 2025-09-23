/**
 * Implementación MySQL para UsuarioDAO
 * Wrapper sobre Sequelize para operaciones de usuarios
 */

const { Op } = require('sequelize');
const MySQLBaseDAO = require('./MySQLBaseDAO');
const IUsuarioDAO = require('../interfaces/IUsuarioDAO');
const { Usuario, Proveedor } = require('../../models');
const logger = require('../../../utils/logger');

class MySQLUsuarioDAO extends MySQLBaseDAO {
  constructor(sequelize) {
    super(sequelize, Usuario);
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email, options = {}) {
    try {
      const result = await this.model.findOne({
        where: { email },
        include: options.include || [
          {
            model: Proveedor,
            as: 'proveedor',
            attributes: ['id', 'razon_social', 'nombre_comercial']
          }
        ],
        attributes: options.attributes,
        transaction: options.transaction
      });

      if (result) {
        logger.debug(`[MySQL:Usuario] Found user by email: ${email}`);
        return result.toJSON();
      }

      return null;
    } catch (error) {
      logger.error(`[MySQL:Usuario] Error finding user by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Buscar usuarios por rol
   */
  async findByRole(rol, options = {}) {
    try {
      const results = await this.model.findAll({
        where: { rol },
        include: options.include || [
          {
            model: Proveedor,
            as: 'proveedor',
            attributes: ['id', 'razon_social', 'nombre_comercial']
          }
        ],
        attributes: options.attributes,
        order: options.order || [['nombre', 'ASC']],
        transaction: options.transaction
      });

      logger.debug(`[MySQL:Usuario] Found ${results.length} users with role: ${rol}`);
      return results.map(result => result.toJSON());
    } catch (error) {
      logger.error(`[MySQL:Usuario] Error finding users by role ${rol}:`, error);
      throw error;
    }
  }

  /**
   * Buscar usuarios por proveedor
   */
  async findByProveedor(proveedorId, options = {}) {
    try {
      const results = await this.model.findAll({
        where: { proveedor_id: proveedorId },
        include: options.include || [
          {
            model: Proveedor,
            as: 'proveedor',
            attributes: ['id', 'razon_social', 'nombre_comercial']
          }
        ],
        attributes: options.attributes,
        order: options.order || [['nombre', 'ASC']],
        transaction: options.transaction
      });

      logger.debug(`[MySQL:Usuario] Found ${results.length} users for proveedor: ${proveedorId}`);
      return results.map(result => result.toJSON());
    } catch (error) {
      logger.error(`[MySQL:Usuario] Error finding users by proveedor ${proveedorId}:`, error);
      throw error;
    }
  }

  /**
   * Buscar usuarios activos
   */
  async findActive(criteria = {}, options = {}) {
    try {
      const where = {
        estado: 'activo',
        ...this._buildWhereClause(criteria)
      };

      const results = await this.model.findAll({
        where,
        include: options.include || [
          {
            model: Proveedor,
            as: 'proveedor',
            attributes: ['id', 'razon_social', 'nombre_comercial']
          }
        ],
        attributes: options.attributes,
        order: options.order || [['nombre', 'ASC']],
        transaction: options.transaction
      });

      logger.debug(`[MySQL:Usuario] Found ${results.length} active users`);
      return results.map(result => result.toJSON());
    } catch (error) {
      logger.error(`[MySQL:Usuario] Error finding active users:`, error);
      throw error;
    }
  }

  /**
   * Actualizar último acceso del usuario
   */
  async updateLastAccess(userId, timestamp = new Date(), options = {}) {
    try {
      const [affectedRows] = await this.model.update(
        { ultimo_acceso: timestamp },
        {
          where: { id: userId },
          transaction: options.transaction
        }
      );

      const updated = affectedRows > 0;
      logger.debug(`[MySQL:Usuario] Update last access for user ${userId}: ${updated ? 'success' : 'not found'}`);
      return updated;
    } catch (error) {
      logger.error(`[MySQL:Usuario] Error updating last access for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Incrementar intentos fallidos de login
   */
  async incrementFailedAttempts(userId, options = {}) {
    try {
      // Usar operación atómica de incremento
      const [affectedRows] = await this.model.update(
        {
          intentos_fallidos: this.sequelize.literal('intentos_fallidos + 1')
        },
        {
          where: { id: userId },
          transaction: options.transaction
        }
      );

      if (affectedRows === 0) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Obtener el valor actualizado
      const user = await this.findById(userId, {
        attributes: ['intentos_fallidos'],
        transaction: options.transaction
      });

      const failedAttempts = user ? user.intentos_fallidos : 0;
      logger.debug(`[MySQL:Usuario] Incremented failed attempts for user ${userId}: ${failedAttempts}`);
      return failedAttempts;
    } catch (error) {
      logger.error(`[MySQL:Usuario] Error incrementing failed attempts for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Resetear intentos fallidos de login
   */
  async resetFailedAttempts(userId, options = {}) {
    try {
      const [affectedRows] = await this.model.update(
        { intentos_fallidos: 0 },
        {
          where: { id: userId },
          transaction: options.transaction
        }
      );

      const reset = affectedRows > 0;
      logger.debug(`[MySQL:Usuario] Reset failed attempts for user ${userId}: ${reset ? 'success' : 'not found'}`);
      return reset;
    } catch (error) {
      logger.error(`[MySQL:Usuario] Error resetting failed attempts for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Cambiar estado del usuario
   */
  async changeStatus(userId, newState, options = {}) {
    try {
      if (!this.isValidEstado(newState)) {
        throw new Error(`Invalid user state: ${newState}`);
      }

      const updatedUser = await this.update(userId, { estado: newState }, options);

      logger.debug(`[MySQL:Usuario] Changed status for user ${userId} to: ${newState}`);
      return updatedUser;
    } catch (error) {
      logger.error(`[MySQL:Usuario] Error changing status for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Buscar usuarios por múltiples criterios con filtros avanzados
   */
  async searchUsers(filters = {}, pagination = {}, options = {}) {
    try {
      const where = {};

      // Filtros específicos
      if (filters.nombre) {
        where.nombre = { [Op.like]: `%${filters.nombre}%` };
      }

      if (filters.email) {
        where.email = { [Op.like]: `%${filters.email}%` };
      }

      if (filters.rol) {
        where.rol = Array.isArray(filters.rol) ? { [Op.in]: filters.rol } : filters.rol;
      }

      if (filters.estado) {
        where.estado = Array.isArray(filters.estado) ? { [Op.in]: filters.estado } : filters.estado;
      }

      if (filters.proveedor_id) {
        where.proveedor_id = filters.proveedor_id;
      }

      if (filters.ultimo_acceso_desde) {
        where.ultimo_acceso = { [Op.gte]: filters.ultimo_acceso_desde };
      }

      if (filters.ultimo_acceso_hasta) {
        where.ultimo_acceso = {
          ...where.ultimo_acceso,
          [Op.lte]: filters.ultimo_acceso_hasta
        };
      }

      const result = await this.findAndCountAll(where, pagination, {
        include: [
          {
            model: Proveedor,
            as: 'proveedor',
            attributes: ['id', 'razon_social', 'nombre_comercial']
          }
        ],
        order: options.order || [['nombre', 'ASC']],
        ...options
      });

      logger.debug(`[MySQL:Usuario] Search users: found ${result.count} total results`);
      return result;
    } catch (error) {
      logger.error(`[MySQL:Usuario] Error searching users:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios por rol
   */
  async getStatsByRole(options = {}) {
    try {
      const stats = await this.model.findAll({
        attributes: [
          'rol',
          [this.sequelize.fn('COUNT', this.sequelize.col('id')), 'count'],
          [this.sequelize.fn('COUNT', this.sequelize.literal("CASE WHEN estado = 'activo' THEN 1 END")), 'activos'],
          [this.sequelize.fn('COUNT', this.sequelize.literal("CASE WHEN estado = 'inactivo' THEN 1 END")), 'inactivos'],
          [this.sequelize.fn('COUNT', this.sequelize.literal("CASE WHEN estado = 'bloqueado' THEN 1 END")), 'bloqueados']
        ],
        group: ['rol'],
        transaction: options.transaction,
        raw: true
      });

      logger.debug(`[MySQL:Usuario] Generated role stats for ${stats.length} roles`);
      return stats;
    } catch (error) {
      logger.error(`[MySQL:Usuario] Error getting stats by role:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios por proveedor
   */
  async getStatsByProveedor(options = {}) {
    try {
      const stats = await this.model.findAll({
        attributes: [
          'proveedor_id',
          [this.sequelize.fn('COUNT', this.sequelize.col('Usuario.id')), 'count'],
          [this.sequelize.fn('COUNT', this.sequelize.literal("CASE WHEN Usuario.estado = 'activo' THEN 1 END")), 'activos']
        ],
        include: [
          {
            model: Proveedor,
            as: 'proveedor',
            attributes: ['razon_social', 'nombre_comercial']
          }
        ],
        group: ['proveedor_id', 'proveedor.id'],
        transaction: options.transaction
      });

      logger.debug(`[MySQL:Usuario] Generated proveedor stats for ${stats.length} proveedores`);
      return stats.map(stat => stat.toJSON ? stat.toJSON() : stat);
    } catch (error) {
      logger.error(`[MySQL:Usuario] Error getting stats by proveedor:`, error);
      throw error;
    }
  }

  /**
   * Validar estado de usuario
   */
  isValidEstado(estado) {
    const validEstados = ['activo', 'inactivo', 'bloqueado'];
    return validEstados.includes(estado);
  }
}

module.exports = MySQLUsuarioDAO;