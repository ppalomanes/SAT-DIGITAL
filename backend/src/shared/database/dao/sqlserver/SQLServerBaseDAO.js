/**
 * Implementación base SQL Server para DAO
 * Wrapper sobre Sequelize específico para Microsoft SQL Server
 */

const { Op } = require('sequelize');
const logger = require('../../../utils/logger');
const IBaseDAO = require('../interfaces/IBaseDAO');

class SQLServerBaseDAO extends IBaseDAO {
  constructor(sequelize, model) {
    super();
    this.sequelize = sequelize;
    this.model = model;
    this.modelName = model ? model.name : 'Unknown';
  }

  /**
   * Crear un nuevo registro
   */
  async create(data, options = {}) {
    try {
      const sanitizedData = this.sanitize(data);
      const validatedData = await this.validate(sanitizedData, 'create');

      const result = await this.model.create(validatedData, {
        transaction: options.transaction,
        ...options
      });

      logger.debug(`[SQLServer:${this.modelName}] Created record with ID: ${result.id}`);
      return result.toJSON ? result.toJSON() : result;
    } catch (error) {
      logger.error(`[SQLServer:${this.modelName}] Error creating record:`, error);
      throw error;
    }
  }

  /**
   * Buscar registro por ID
   */
  async findById(id, options = {}) {
    try {
      const result = await this.model.findByPk(id, {
        include: options.include,
        attributes: options.attributes,
        transaction: options.transaction,
        ...options
      });

      if (result) {
        logger.debug(`[SQLServer:${this.modelName}] Found record with ID: ${id}`);
        return result.toJSON ? result.toJSON() : result;
      }

      return null;
    } catch (error) {
      logger.error(`[SQLServer:${this.modelName}] Error finding record by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Buscar un registro por criterios
   */
  async findOne(criteria = {}, options = {}) {
    try {
      const where = this._buildWhereClause(criteria);

      const result = await this.model.findOne({
        where,
        include: options.include,
        attributes: options.attributes,
        order: options.order,
        transaction: options.transaction,
        ...options
      });

      if (result) {
        logger.debug(`[SQLServer:${this.modelName}] Found one record`);
        return result.toJSON ? result.toJSON() : result;
      }

      return null;
    } catch (error) {
      logger.error(`[SQLServer:${this.modelName}] Error finding one record:`, error);
      throw error;
    }
  }

  /**
   * Buscar múltiples registros
   */
  async findAll(criteria = {}, options = {}) {
    try {
      const where = this._buildWhereClause(criteria);

      const results = await this.model.findAll({
        where,
        include: options.include,
        attributes: options.attributes,
        order: options.order,
        limit: options.limit,
        offset: options.offset,
        transaction: options.transaction,
        ...options
      });

      logger.debug(`[SQLServer:${this.modelName}] Found ${results.length} records`);
      return results.map(result => result.toJSON ? result.toJSON() : result);
    } catch (error) {
      logger.error(`[SQLServer:${this.modelName}] Error finding records:`, error);
      throw error;
    }
  }

  /**
   * Buscar con paginación
   */
  async findAndCountAll(criteria = {}, pagination = {}, options = {}) {
    try {
      const where = this._buildWhereClause(criteria);
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      const result = await this.model.findAndCountAll({
        where,
        include: options.include,
        attributes: options.attributes,
        order: options.order,
        limit: parseInt(limit),
        offset: parseInt(offset),
        transaction: options.transaction,
        distinct: true, // Para evitar problemas con JOINS en SQL Server
        ...options
      });

      const totalPages = Math.ceil(result.count / limit);

      logger.debug(`[SQLServer:${this.modelName}] Found ${result.count} total records, page ${page}/${totalPages}`);

      return {
        rows: result.rows.map(row => row.toJSON ? row.toJSON() : row),
        count: result.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      };
    } catch (error) {
      logger.error(`[SQLServer:${this.modelName}] Error in findAndCountAll:`, error);
      throw error;
    }
  }

  /**
   * Actualizar registro por ID
   */
  async update(id, data, options = {}) {
    try {
      const sanitizedData = this.sanitize(data);
      const validatedData = await this.validate(sanitizedData, 'update');

      const [affectedRows] = await this.model.update(validatedData, {
        where: { id },
        transaction: options.transaction,
        ...options
      });

      if (affectedRows === 0) {
        throw new Error(`Record with ID ${id} not found`);
      }

      // Obtener el registro actualizado
      const updatedRecord = await this.findById(id, { transaction: options.transaction });

      logger.debug(`[SQLServer:${this.modelName}] Updated record with ID: ${id}`);
      return updatedRecord;
    } catch (error) {
      logger.error(`[SQLServer:${this.modelName}] Error updating record with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar múltiples registros
   */
  async updateMany(criteria, data, options = {}) {
    try {
      const where = this._buildWhereClause(criteria);
      const sanitizedData = this.sanitize(data);

      const [affectedRows] = await this.model.update(sanitizedData, {
        where,
        transaction: options.transaction,
        ...options
      });

      logger.debug(`[SQLServer:${this.modelName}] Updated ${affectedRows} records`);
      return affectedRows;
    } catch (error) {
      logger.error(`[SQLServer:${this.modelName}] Error updating multiple records:`, error);
      throw error;
    }
  }

  /**
   * Eliminar registro por ID
   */
  async delete(id, options = {}) {
    try {
      const affectedRows = await this.model.destroy({
        where: { id },
        transaction: options.transaction,
        ...options
      });

      const wasDeleted = affectedRows > 0;
      logger.debug(`[SQLServer:${this.modelName}] Delete record with ID ${id}: ${wasDeleted ? 'success' : 'not found'}`);
      return wasDeleted;
    } catch (error) {
      logger.error(`[SQLServer:${this.modelName}] Error deleting record with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar múltiples registros
   */
  async deleteMany(criteria, options = {}) {
    try {
      const where = this._buildWhereClause(criteria);

      const affectedRows = await this.model.destroy({
        where,
        transaction: options.transaction,
        ...options
      });

      logger.debug(`[SQLServer:${this.modelName}] Deleted ${affectedRows} records`);
      return affectedRows;
    } catch (error) {
      logger.error(`[SQLServer:${this.modelName}] Error deleting multiple records:`, error);
      throw error;
    }
  }

  /**
   * Contar registros
   */
  async count(criteria = {}, options = {}) {
    try {
      const where = this._buildWhereClause(criteria);

      const count = await this.model.count({
        where,
        include: options.include,
        transaction: options.transaction,
        distinct: true,
        ...options
      });

      logger.debug(`[SQLServer:${this.modelName}] Count: ${count}`);
      return count;
    } catch (error) {
      logger.error(`[SQLServer:${this.modelName}] Error counting records:`, error);
      throw error;
    }
  }

  /**
   * Verificar si existe un registro
   */
  async exists(criteria, options = {}) {
    try {
      const count = await this.count(criteria, options);
      return count > 0;
    } catch (error) {
      logger.error(`[SQLServer:${this.modelName}] Error checking existence:`, error);
      throw error;
    }
  }

  /**
   * Crear o actualizar (upsert)
   */
  async upsert(data, criteria, options = {}) {
    try {
      const where = this._buildWhereClause(criteria);
      const sanitizedData = this.sanitize(data);

      const existingRecord = await this.model.findOne({
        where,
        transaction: options.transaction
      });

      if (existingRecord) {
        // Actualizar registro existente
        await existingRecord.update(sanitizedData, {
          transaction: options.transaction
        });

        logger.debug(`[SQLServer:${this.modelName}] Upsert: updated existing record`);
        return {
          record: existingRecord.toJSON ? existingRecord.toJSON() : existingRecord,
          created: false
        };
      } else {
        // Crear nuevo registro
        const validatedData = await this.validate(sanitizedData, 'create');
        const newRecord = await this.model.create(validatedData, {
          transaction: options.transaction
        });

        logger.debug(`[SQLServer:${this.modelName}] Upsert: created new record`);
        return {
          record: newRecord.toJSON ? newRecord.toJSON() : newRecord,
          created: true
        };
      }
    } catch (error) {
      logger.error(`[SQLServer:${this.modelName}] Error in upsert:`, error);
      throw error;
    }
  }

  /**
   * Ejecutar operación en transacción
   */
  async transaction(operation, options = {}) {
    try {
      return await this.sequelize.transaction(options, operation);
    } catch (error) {
      logger.error(`[SQLServer:${this.modelName}] Transaction error:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de la tabla
   */
  async getStats() {
    try {
      const total = await this.count();

      // SQL Server específico para obtener fechas
      const [newest] = await this.sequelize.query(`
        SELECT TOP 1 created_at
        FROM [${this.model.tableName}]
        WHERE created_at IS NOT NULL
        ORDER BY created_at DESC
      `);

      const [oldest] = await this.sequelize.query(`
        SELECT TOP 1 created_at
        FROM [${this.model.tableName}]
        WHERE created_at IS NOT NULL
        ORDER BY created_at ASC
      `);

      return {
        tableName: this.model.tableName,
        totalRecords: total,
        newestRecord: newest[0] ? newest[0].created_at : null,
        oldestRecord: oldest[0] ? oldest[0].created_at : null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`[SQLServer:${this.modelName}] Error getting stats:`, error);
      throw error;
    }
  }

  /**
   * Construir cláusula WHERE para Sequelize (SQL Server específico)
   * @private
   */
  _buildWhereClause(criteria) {
    if (!criteria || Object.keys(criteria).length === 0) {
      return {};
    }

    const where = {};

    for (const [key, value] of Object.entries(criteria)) {
      if (value === null || value === undefined) {
        where[key] = { [Op.is]: null };
      } else if (Array.isArray(value)) {
        where[key] = { [Op.in]: value };
      } else if (typeof value === 'string' && value.includes('%')) {
        // SQL Server usa LIKE de manera similar a MySQL
        where[key] = { [Op.like]: value };
      } else if (typeof value === 'object' && value.operator) {
        // Operadores personalizados
        where[key] = { [Op[value.operator]]: value.value };
      } else {
        where[key] = value;
      }
    }

    return where;
  }

  /**
   * Limpiar/sanitizar datos (SQL Server específico)
   */
  sanitize(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };

    // Remover propiedades undefined
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined) {
        delete sanitized[key];
      }
    });

    // Trim strings
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitized[key].trim();
      }
    });

    // Convertir fechas a formato SQL Server
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] instanceof Date) {
        // SQL Server maneja mejor las fechas en formato ISO
        sanitized[key] = sanitized[key].toISOString();
      }
    });

    return sanitized;
  }

  /**
   * Ejecutar consulta SQL nativa (específico para SQL Server)
   */
  async executeQuery(sql, replacements = {}, options = {}) {
    try {
      const [results, metadata] = await this.sequelize.query(sql, {
        replacements,
        transaction: options.transaction,
        type: this.sequelize.QueryTypes.SELECT,
        ...options
      });

      logger.debug(`[SQLServer:${this.modelName}] Executed native query`);
      return results;
    } catch (error) {
      logger.error(`[SQLServer:${this.modelName}] Error executing query:`, error);
      throw error;
    }
  }
}

module.exports = SQLServerBaseDAO;