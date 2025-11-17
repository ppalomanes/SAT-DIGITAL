const { HeadsetHomologado } = require('../../../shared/database/models');
const { Op } = require('sequelize');

/**
 * HeadsetsController
 *
 * Gestiona el catálogo de headsets homologados que pueden ser utilizados
 * por los proveedores. Se utiliza para validar que los equipos reportados
 * estén dentro de los modelos aprobados por la organización.
 *
 * @module HeadsetsController
 */

class HeadsetsController {
  /**
   * Lista todos los headsets homologados del tenant actual
   *
   * Soporta:
   * - Filtrado por marca, conector, activo
   * - Búsqueda por texto (marca o modelo)
   * - Paginación
   * - Ordenamiento
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Array} Lista de headsets con paginación
   */
  async listarHeadsets(req, res) {
    try {
      const { tenant_id } = req.usuario;
      const {
        page = 1,
        limit = 100,
        marca,
        conector,
        activo,
        search
      } = req.query;

      // Construir filtros
      const where = { tenant_id };

      if (marca) {
        where.marca = marca;
      }

      if (conector) {
        where.conector = conector;
      }

      if (activo !== undefined) {
        where.activo = activo === 'true' || activo === '1';
      }

      if (search) {
        where[Op.or] = [
          { marca: { [Op.like]: `%${search}%` } },
          { modelo: { [Op.like]: `%${search}%` } }
        ];
      }

      // Paginación
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows: headsets } = await HeadsetHomologado.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['marca', 'ASC'], ['modelo', 'ASC']]
      });

      res.json({
        success: true,
        data: headsets,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('❌ Error al listar headsets:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener lista de headsets',
        error: error.message
      });
    }
  }

  /**
   * Obtiene un headset específico por ID
   *
   * @param {Object} req - Express request (req.params.id)
   * @param {Object} res - Express response
   * @returns {Object} Headset encontrado
   */
  async obtenerHeadset(req, res) {
    try {
      const { tenant_id } = req.usuario;
      const { id } = req.params;

      const headset = await HeadsetHomologado.findOne({
        where: {
          id,
          tenant_id
        }
      });

      if (!headset) {
        return res.status(404).json({
          success: false,
          message: 'Headset no encontrado'
        });
      }

      res.json({
        success: true,
        data: headset
      });

    } catch (error) {
      console.error('❌ Error al obtener headset:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener headset',
        error: error.message
      });
    }
  }

  /**
   * Crea un nuevo headset homologado
   *
   * @param {Object} req - Express request (req.body: {marca, modelo, conector, activo, observaciones})
   * @param {Object} res - Express response
   * @returns {Object} Headset creado
   */
  async crearHeadset(req, res) {
    try {
      const { tenant_id } = req.usuario;
      const { marca, modelo, conector, activo = true, observaciones } = req.body;

      // Validaciones
      if (!marca || !modelo || !conector) {
        return res.status(400).json({
          success: false,
          message: 'Los campos marca, modelo y conector son obligatorios'
        });
      }

      // Verificar si ya existe
      const existente = await HeadsetHomologado.findOne({
        where: {
          tenant_id,
          marca,
          modelo
        }
      });

      if (existente) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un headset con la misma marca y modelo'
        });
      }

      // Crear headset
      const headset = await HeadsetHomologado.create({
        tenant_id,
        marca,
        modelo,
        conector,
        activo,
        observaciones
      });

      res.status(201).json({
        success: true,
        message: 'Headset creado exitosamente',
        data: headset
      });

    } catch (error) {
      console.error('❌ Error al crear headset:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear headset',
        error: error.message
      });
    }
  }

  /**
   * Actualiza un headset existente
   *
   * @param {Object} req - Express request (req.params.id, req.body)
   * @param {Object} res - Express response
   * @returns {Object} Headset actualizado
   */
  async actualizarHeadset(req, res) {
    try {
      const { tenant_id } = req.usuario;
      const { id } = req.params;
      const { marca, modelo, conector, activo, observaciones } = req.body;

      // Buscar headset
      const headset = await HeadsetHomologado.findOne({
        where: {
          id,
          tenant_id
        }
      });

      if (!headset) {
        return res.status(404).json({
          success: false,
          message: 'Headset no encontrado'
        });
      }

      // Validar si cambió marca/modelo y ya existe otro
      if ((marca && marca !== headset.marca) || (modelo && modelo !== headset.modelo)) {
        const existente = await HeadsetHomologado.findOne({
          where: {
            tenant_id,
            marca: marca || headset.marca,
            modelo: modelo || headset.modelo,
            id: { [Op.ne]: id }
          }
        });

        if (existente) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe otro headset con la misma marca y modelo'
          });
        }
      }

      // Actualizar
      await headset.update({
        marca: marca || headset.marca,
        modelo: modelo || headset.modelo,
        conector: conector || headset.conector,
        activo: activo !== undefined ? activo : headset.activo,
        observaciones: observaciones !== undefined ? observaciones : headset.observaciones
      });

      res.json({
        success: true,
        message: 'Headset actualizado exitosamente',
        data: headset
      });

    } catch (error) {
      console.error('❌ Error al actualizar headset:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar headset',
        error: error.message
      });
    }
  }

  /**
   * Elimina (desactiva) un headset
   *
   * Nota: No elimina físicamente, solo marca como inactivo
   *
   * @param {Object} req - Express request (req.params.id)
   * @param {Object} res - Express response
   * @returns {Object} Confirmación de eliminación
   */
  async eliminarHeadset(req, res) {
    try {
      const { tenant_id } = req.usuario;
      const { id } = req.params;

      const headset = await HeadsetHomologado.findOne({
        where: {
          id,
          tenant_id
        }
      });

      if (!headset) {
        return res.status(404).json({
          success: false,
          message: 'Headset no encontrado'
        });
      }

      // Desactivar en lugar de eliminar
      await headset.update({ activo: false });

      res.json({
        success: true,
        message: 'Headset desactivado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error al eliminar headset:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar headset',
        error: error.message
      });
    }
  }

  /**
   * Obtiene estadísticas de headsets homologados
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Object} Estadísticas (por marca, conector, estado)
   */
  async obtenerEstadisticas(req, res) {
    try {
      const { tenant_id } = req.usuario;

      const [marcas, conectores, estados] = await Promise.all([
        // Por marca
        HeadsetHomologado.findAll({
          where: { tenant_id },
          attributes: [
            'marca',
            [HeadsetHomologado.sequelize.fn('COUNT', '*'), 'cantidad']
          ],
          group: ['marca'],
          order: [[HeadsetHomologado.sequelize.fn('COUNT', '*'), 'DESC']]
        }),
        // Por conector
        HeadsetHomologado.findAll({
          where: { tenant_id },
          attributes: [
            'conector',
            [HeadsetHomologado.sequelize.fn('COUNT', '*'), 'cantidad']
          ],
          group: ['conector'],
          order: [[HeadsetHomologado.sequelize.fn('COUNT', '*'), 'DESC']]
        }),
        // Por estado
        HeadsetHomologado.count({
          where: { tenant_id },
          col: 'activo',
          group: ['activo']
        })
      ]);

      const total = await HeadsetHomologado.count({ where: { tenant_id } });
      const activos = await HeadsetHomologado.count({ where: { tenant_id, activo: true } });

      res.json({
        success: true,
        data: {
          total,
          activos,
          inactivos: total - activos,
          porMarca: marcas.map(m => ({
            marca: m.marca,
            cantidad: parseInt(m.getDataValue('cantidad'))
          })),
          porConector: conectores.map(c => ({
            conector: c.conector,
            cantidad: parseInt(c.getDataValue('cantidad'))
          }))
        }
      });

    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }

  /**
   * Verifica si un headset está homologado
   *
   * Endpoint de validación rápida (usado por el validador)
   *
   * @param {Object} req - Express request (req.query: {marca, modelo})
   * @param {Object} res - Express response
   * @returns {Object} { homologado: boolean, headset: Object|null }
   */
  async verificarHomologacion(req, res) {
    try {
      const { tenant_id } = req.usuario;
      const { marca, modelo } = req.query;

      if (!marca || !modelo) {
        return res.status(400).json({
          success: false,
          message: 'Los parámetros marca y modelo son obligatorios'
        });
      }

      const headset = await HeadsetHomologado.findOne({
        where: {
          tenant_id,
          marca: { [Op.like]: `%${marca}%` },
          modelo: { [Op.like]: `%${modelo}%` },
          activo: true
        }
      });

      res.json({
        success: true,
        homologado: !!headset,
        headset: headset || null
      });

    } catch (error) {
      console.error('❌ Error al verificar homologación:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar homologación',
        error: error.message
      });
    }
  }
}

module.exports = new HeadsetsController();
