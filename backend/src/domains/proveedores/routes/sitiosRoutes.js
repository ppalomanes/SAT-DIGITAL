/**
 * Rutas para gestión de sitios
 */

const express = require('express');
const { sequelize } = require('../../../shared/database/connection');
const { verificarToken } = require('../../../shared/middleware/authMiddleware');
const logger = require('../../../shared/utils/logger');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(verificarToken);

/**
 * POST /api/sitios - Crear nuevo sitio
 */
router.post('/', async (req, res) => {
  try {
    const {
      proveedor_id,
      nombre_sitio,
      localidad,
      domicilio,
      estado = 'activo'
    } = req.body;

    // Validaciones básicas
    if (!proveedor_id || !nombre_sitio || !localidad || !domicilio) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos requeridos deben estar presentes'
      });
    }

    // Verificar que el proveedor existe y está activo
    const [proveedor] = await sequelize.query(`
      SELECT id, nombre_comercial FROM [proveedores]
      WHERE id = :proveedorId AND estado = 'activo'
    `, {
      replacements: { proveedorId: proveedor_id }
    });

    if (!proveedor.length) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado o inactivo'
      });
    }

    // Verificar que no existe un sitio con el mismo nombre para este proveedor
    const [existingSite] = await sequelize.query(`
      SELECT id FROM [sitios]
      WHERE proveedor_id = :proveedorId AND nombre = :nombre AND estado != 'eliminado'
    `, {
      replacements: {
        proveedorId: proveedor_id,
        nombre: nombre_sitio
      }
    });

    if (existingSite.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un sitio con ese nombre para este proveedor'
      });
    }

    // Insertar el nuevo sitio
    const [result] = await sequelize.query(`
      INSERT INTO [sitios] (
        proveedor_id,
        nombre,
        localidad,
        domicilio,
        estado,
        created_at,
        updated_at
      )
      OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.localidad, INSERTED.domicilio, INSERTED.estado
      VALUES (
        :proveedor_id,
        :nombre_sitio,
        :localidad,
        :domicilio,
        :estado,
        GETDATE(),
        GETDATE()
      )
    `, {
      replacements: {
        proveedor_id,
        nombre_sitio,
        localidad,
        domicilio,
        estado
      }
    });

    // Obtener el sitio creado con información del proveedor
    const [nuevoSitio] = await sequelize.query(`
      SELECT
        s.id,
        s.proveedor_id,
        s.nombre as nombre_sitio,
        s.localidad,
        s.domicilio,
        s.estado,
        s.created_at,
        s.updated_at,
        p.nombre_comercial as proveedor_nombre,
        p.razon_social as proveedor_razon_social
      FROM [sitios] s
      INNER JOIN [proveedores] p ON s.proveedor_id = p.id
      WHERE s.id = :sitioId
    `, {
      replacements: { sitioId: result[0].id }
    });

    logger.info(`Sitio creado: ${nombre_sitio} para proveedor ${proveedor_id} por usuario ${req.usuario.id}`);

    res.status(201).json({
      success: true,
      message: 'Sitio creado exitosamente',
      data: nuevoSitio[0]
    });

  } catch (error) {
    logger.error('Error creando sitio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/sitios/:id - Obtener sitio por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [sitio] = await sequelize.query(`
      SELECT
        s.id,
        s.proveedor_id,
        s.nombre as nombre_sitio,
        s.localidad,
        s.domicilio,
        s.estado,
        s.created_at,
        s.updated_at,
        p.nombre_comercial as proveedor_nombre,
        p.razon_social as proveedor_razon_social
      FROM [sitios] s
      INNER JOIN [proveedores] p ON s.proveedor_id = p.id
      WHERE s.id = :id AND s.estado != 'eliminado'
    `, {
      replacements: { id }
    });

    if (!sitio.length) {
      return res.status(404).json({
        success: false,
        message: 'Sitio no encontrado'
      });
    }

    res.json({
      success: true,
      data: sitio[0]
    });

  } catch (error) {
    logger.error('Error obteniendo sitio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * PUT /api/sitios/:id - Actualizar sitio
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre_sitio,
      localidad,
      domicilio,
      estado
    } = req.body;

    // Verificar que el sitio existe
    const [existing] = await sequelize.query(`
      SELECT id, proveedor_id FROM [sitios] WHERE id = :id AND estado != 'eliminado'
    `, {
      replacements: { id }
    });

    if (!existing.length) {
      return res.status(404).json({
        success: false,
        message: 'Sitio no encontrado'
      });
    }

    // Construir query de actualización dinámicamente
    const updateFields = [];
    const replacements = { id };

    if (nombre_sitio) {
      updateFields.push('nombre = :nombre_sitio');
      replacements.nombre_sitio = nombre_sitio;
    }
    if (localidad) {
      updateFields.push('localidad = :localidad');
      replacements.localidad = localidad;
    }
    if (domicilio) {
      updateFields.push('domicilio = :domicilio');
      replacements.domicilio = domicilio;
    }
    if (estado) {
      updateFields.push('estado = :estado');
      replacements.estado = estado;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }

    updateFields.push('updated_at = GETDATE()');

    await sequelize.query(`
      UPDATE [sitios] SET ${updateFields.join(', ')} WHERE id = :id
    `, {
      replacements
    });

    // Obtener el sitio actualizado
    const [sitioActualizado] = await sequelize.query(`
      SELECT
        s.id,
        s.proveedor_id,
        s.nombre as nombre_sitio,
        s.localidad,
        s.domicilio,
        s.estado,
        s.created_at,
        s.updated_at,
        p.nombre_comercial as proveedor_nombre,
        p.razon_social as proveedor_razon_social
      FROM [sitios] s
      INNER JOIN [proveedores] p ON s.proveedor_id = p.id
      WHERE s.id = :id
    `, {
      replacements: { id }
    });

    logger.info(`Sitio actualizado: ${id} por usuario ${req.usuario.id}`);

    res.json({
      success: true,
      message: 'Sitio actualizado exitosamente',
      data: sitioActualizado[0]
    });

  } catch (error) {
    logger.error('Error actualizando sitio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * DELETE /api/sitios/:id - Eliminar sitio (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el sitio existe
    const [existing] = await sequelize.query(`
      SELECT id FROM [sitios] WHERE id = :id AND estado != 'eliminado'
    `, {
      replacements: { id }
    });

    if (!existing.length) {
      return res.status(404).json({
        success: false,
        message: 'Sitio no encontrado'
      });
    }

    // Verificar si hay auditorías activas para este sitio
    const [auditoriasActivas] = await sequelize.query(`
      SELECT COUNT(*) as count FROM [auditorias]
      WHERE sitio_id = :id AND estado IN ('planificada', 'en_progreso', 'pendiente_evaluacion')
    `, {
      replacements: { id }
    });

    if (auditoriasActivas[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un sitio con auditorías activas'
      });
    }

    // Soft delete
    await sequelize.query(`
      UPDATE [sitios] SET estado = 'eliminado', updated_at = GETDATE() WHERE id = :id
    `, {
      replacements: { id }
    });

    logger.info(`Sitio eliminado: ${id} por usuario ${req.usuario.id}`);

    res.json({
      success: true,
      message: 'Sitio eliminado exitosamente'
    });

  } catch (error) {
    logger.error('Error eliminando sitio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;