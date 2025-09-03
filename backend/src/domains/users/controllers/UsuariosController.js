const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { Op } = require('sequelize');
const { Usuario, Proveedor } = require('../../../shared/database/models');
const { registrarBitacora } = require('../../../shared/utils/bitacora');

// Esquemas de validación
const createUserSchema = z.object({
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Password debe tener al menos 6 caracteres'),
  rol: z.enum(['administrador', 'auditor_general', 'auditor_interno', 'jefe_proveedor', 'tecnico_proveedor', 'responsable_decisiones']),
  proveedor_id: z.number().optional(),
  estado: z.enum(['activo', 'inactivo']).default('activo'),
});

const updateUserSchema = createUserSchema.partial().omit({ password: true });

/**
 * Controller para gestión de usuarios
 * Solo accesible por administradores
 */
class UsuariosController {
  /**
   * Obtener todos los usuarios
   * GET /api/usuarios
   */
  static async obtenerUsuarios(req, res) {
    try {
      const { page = 1, limit = 10, rol, estado, search } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      
      if (rol) whereClause.rol = rol;
      if (estado) whereClause.estado = estado;
      if (search) {
        whereClause[Op.or] = [
          { nombre: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows: usuarios } = await Usuario.findAndCountAll({
        where: whereClause,
        include: [{
          model: Proveedor,
          as: 'proveedor',
          attributes: ['id', 'razon_social', 'nombre_comercial']
        }],
        attributes: { exclude: ['password_hash', 'token_refresh'] },
        offset: parseInt(offset),
        limit: parseInt(limit),
        order: [['created_at', 'DESC']]
      });

      await registrarBitacora(
        req.usuario.id,
        'CONSULTA_USUARIOS',
        'Usuario',
        null,
        `Consulta lista de usuarios - Página: ${page}`,
        req
      );

      res.json({
        usuarios,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener usuario por ID
   * GET /api/usuarios/:id
   */
  static async obtenerUsuario(req, res) {
    try {
      const { id } = req.params;

      const usuario = await Usuario.findByPk(id, {
        include: [{
          model: Proveedor,
          as: 'proveedor',
          attributes: ['id', 'razon_social', 'nombre_comercial']
        }],
        attributes: { exclude: ['password_hash', 'token_refresh'] }
      });

      if (!usuario) {
        return res.status(404).json({
          message: 'Usuario no encontrado'
        });
      }

      await registrarBitacora(
        req.usuario.id,
        'CONSULTA_USUARIO',
        'Usuario',
        id,
        `Consulta usuario: ${usuario.email}`,
        req
      );

      res.json({ usuario });

    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Crear nuevo usuario
   * POST /api/usuarios
   */
  static async crearUsuario(req, res) {
    try {
      const validatedData = createUserSchema.parse(req.body);

      // Verificar que el email no exista
      const usuarioExistente = await Usuario.findOne({
        where: { email: validatedData.email }
      });

      if (usuarioExistente) {
        return res.status(400).json({
          message: 'El email ya está registrado'
        });
      }

      // Si es rol de proveedor, verificar que el proveedor exista
      if (['jefe_proveedor', 'tecnico_proveedor'].includes(validatedData.rol)) {
        if (!validatedData.proveedor_id) {
          return res.status(400).json({
            message: 'Debe especificar un proveedor para este rol'
          });
        }

        const proveedor = await Proveedor.findByPk(validatedData.proveedor_id);
        if (!proveedor) {
          return res.status(400).json({
            message: 'Proveedor no encontrado'
          });
        }
      }

      // Hash del password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      // Crear usuario
      const nuevoUsuario = await Usuario.create({
        ...validatedData,
        password_hash: hashedPassword
      });

      // Obtener usuario creado sin el password
      const usuarioCreado = await Usuario.findByPk(nuevoUsuario.id, {
        include: [{
          model: Proveedor,
          as: 'proveedor',
          attributes: ['id', 'razon_social', 'nombre_comercial']
        }],
        attributes: { exclude: ['password_hash', 'token_refresh'] }
      });

      await registrarBitacora(
        req.usuario.id,
        'CREAR_USUARIO',
        'Usuario',
        nuevoUsuario.id,
        `Usuario creado: ${validatedData.email} - Rol: ${validatedData.rol}`,
        req
      );

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        usuario: usuarioCreado
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Datos inválidos',
          errors: error.errors
        });
      }

      console.error('Error creando usuario:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Actualizar usuario
   * PUT /api/usuarios/:id
   */
  static async actualizarUsuario(req, res) {
    try {
      const { id } = req.params;
      const validatedData = updateUserSchema.parse(req.body);

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({
          message: 'Usuario no encontrado'
        });
      }

      // Verificar email único si se está cambiando
      if (validatedData.email && validatedData.email !== usuario.email) {
        const emailExistente = await Usuario.findOne({
          where: { email: validatedData.email, id: { [Op.ne]: id } }
        });

        if (emailExistente) {
          return res.status(400).json({
            message: 'El email ya está registrado'
          });
        }
      }

      await usuario.update(validatedData);

      const usuarioActualizado = await Usuario.findByPk(id, {
        include: [{
          model: Proveedor,
          as: 'proveedor',
          attributes: ['id', 'razon_social', 'nombre_comercial']
        }],
        attributes: { exclude: ['password_hash', 'token_refresh'] }
      });

      await registrarBitacora(
        req.usuario.id,
        'ACTUALIZAR_USUARIO',
        'Usuario',
        id,
        `Usuario actualizado: ${usuario.email}`,
        req
      );

      res.json({
        message: 'Usuario actualizado exitosamente',
        usuario: usuarioActualizado
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Datos inválidos',
          errors: error.errors
        });
      }

      console.error('Error actualizando usuario:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Eliminar usuario (cambiar estado a inactivo)
   * DELETE /api/usuarios/:id
   */
  static async eliminarUsuario(req, res) {
    try {
      const { id } = req.params;

      // No permitir eliminar el propio usuario
      if (parseInt(id) === req.usuario.id) {
        return res.status(400).json({
          message: 'No puedes eliminar tu propia cuenta'
        });
      }

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({
          message: 'Usuario no encontrado'
        });
      }

      await usuario.update({ estado: 'inactivo' });

      await registrarBitacora(
        req.usuario.id,
        'ELIMINAR_USUARIO',
        'Usuario',
        id,
        `Usuario eliminado: ${usuario.email}`,
        req
      );

      res.json({
        message: 'Usuario eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando usuario:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = UsuariosController;
