/**
 * Rutas para gestión de proveedores
 */

const express = require('express');
const { sequelize } = require('../../../shared/database/connection');
const { verificarToken } = require('../../../shared/middleware/authMiddleware');
const logger = require('../../../shared/utils/logger');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(verificarToken);

/**
 * GET /api/proveedores - Obtener todos los proveedores
 */
router.get('/', async (req, res) => {
  try {
    const [proveedores] = await sequelize.query(`
      SELECT
        id,
        razon_social,
        cuit,
        nombre_comercial,
        contacto_principal,
        email_contacto,
        telefono,
        estado,
        created_at,
        updated_at
      FROM [proveedores]
      WHERE estado != 'eliminado'
      ORDER BY nombre_comercial
    `);

    res.json({
      success: true,
      data: proveedores
    });
  } catch (error) {
    logger.error('Error obteniendo proveedores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/proveedores/:id - Obtener proveedor por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [proveedor] = await sequelize.query(`
      SELECT * FROM [proveedores] WHERE id = :id AND estado != 'eliminado'
    `, {
      replacements: { id }
    });

    if (!proveedor.length) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    res.json({
      success: true,
      data: proveedor[0]
    });
  } catch (error) {
    logger.error('Error obteniendo proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/proveedores/:id/sitios - Obtener sitios de un proveedor
 */
router.get('/:id/sitios', async (req, res) => {
  try {
    const { id } = req.params;

    const [sitios] = await sequelize.query(`
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
        p.razon_social as proveedor_razon_social,
        p.nombre_comercial as proveedor_nombre_comercial
      FROM [sitios] s
      INNER JOIN [proveedores] p ON s.proveedor_id = p.id
      WHERE s.proveedor_id = :proveedorId AND s.estado != 'eliminado' AND p.estado != 'eliminado'
      ORDER BY s.nombre
    `, {
      replacements: { proveedorId: id }
    });

    res.json({
      success: true,
      data: sitios
    });
  } catch (error) {
    logger.error('Error obteniendo sitios del proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/proveedores/:id/auditorias - Obtener auditorías de un proveedor
 */
router.get('/:id/auditorias', async (req, res) => {
  try {
    const { id } = req.params;

    const [auditorias] = await sequelize.query(`
      SELECT
        a.id,
        a.sitio_id,
        a.periodo,
        a.fecha_inicio,
        a.fecha_limite_carga,
        a.fecha_visita_programada,
        a.fecha_visita_realizada,
        a.estado,
        a.puntaje_final,
        s.nombre as sitio_nombre,
        s.localidad as sitio_localidad
      FROM [auditorias] a
      INNER JOIN [sitios] s ON a.sitio_id = s.id
      WHERE s.proveedor_id = :proveedorId
      ORDER BY a.periodo DESC, s.nombre
    `, {
      replacements: { proveedorId: id }
    });

    res.json({
      success: true,
      data: auditorias
    });
  } catch (error) {
    logger.error('Error obteniendo auditorías del proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/proveedores/sitios/all - Obtener todos los sitios
 */
router.get('/sitios/all', async (req, res) => {
  try {
    const [sitios] = await sequelize.query(`
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
        p.razon_social as proveedor_razon_social,
        p.nombre_comercial as proveedor_nombre_comercial
      FROM [sitios] s
      INNER JOIN [proveedores] p ON s.proveedor_id = p.id
      WHERE s.estado != 'eliminado' AND p.estado != 'eliminado'
      ORDER BY p.nombre_comercial, s.nombre
    `);

    res.json({
      success: true,
      data: sitios
    });
  } catch (error) {
    logger.error('Error obteniendo todos los sitios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/proveedores/stats - Obtener estadísticas generales
 */
router.get('/stats', async (req, res) => {
  try {
    const [stats] = await sequelize.query(`
      SELECT
        COUNT(DISTINCT p.id) as total_proveedores,
        COUNT(DISTINCT CASE WHEN p.estado = 'activo' THEN p.id END) as proveedores_activos,
        COUNT(DISTINCT s.id) as total_sitios,
        COUNT(DISTINCT CASE WHEN s.estado = 'activo' THEN s.id END) as sitios_activos,
        COUNT(DISTINCT a.id) as total_auditorias,
        COUNT(DISTINCT CASE WHEN a.estado = 'completada' THEN a.id END) as auditorias_completadas
      FROM [proveedores] p
      LEFT JOIN [sitios] s ON p.id = s.proveedor_id AND s.estado != 'eliminado'
      LEFT JOIN [auditorias] a ON s.id = a.sitio_id
      WHERE p.estado != 'eliminado'
    `);

    const [sitiosPorLocalidad] = await sequelize.query(`
      SELECT
        s.localidad,
        COUNT(s.id) as cantidad
      FROM [sitios] s
      INNER JOIN [proveedores] p ON s.proveedor_id = p.id
      WHERE s.estado != 'eliminado' AND p.estado != 'eliminado'
      GROUP BY s.localidad
      ORDER BY cantidad DESC
    `);

    res.json({
      success: true,
      data: {
        ...stats[0],
        sitiosPorLocalidad
      }
    });
  } catch (error) {
    logger.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/proveedores - Crear nuevo proveedor
 */
router.post('/', async (req, res) => {
  try {
    const {
      razon_social,
      cuit,
      nombre_comercial,
      contacto_principal,
      email_contacto,
      telefono
    } = req.body;

    // Validaciones básicas
    if (!razon_social || !cuit) {
      return res.status(400).json({
        success: false,
        message: 'Razón social y CUIT son requeridos'
      });
    }

    // Verificar que el CUIT no exista
    const [existing] = await sequelize.query(`
      SELECT id FROM [proveedores] WHERE cuit = :cuit AND estado != 'eliminado'
    `, {
      replacements: { cuit }
    });

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un proveedor con ese CUIT'
      });
    }

    // Crear proveedor
    await sequelize.query(`
      INSERT INTO [proveedores]
      (razon_social, cuit, nombre_comercial, contacto_principal, email_contacto, telefono, estado)
      VALUES (:razon_social, :cuit, :nombre_comercial, :contacto_principal, :email_contacto, :telefono, 'activo')
    `, {
      replacements: {
        razon_social,
        cuit,
        nombre_comercial: nombre_comercial || razon_social,
        contacto_principal,
        email_contacto,
        telefono
      }
    });

    // Obtener el proveedor creado
    const [nuevoProveedor] = await sequelize.query(`
      SELECT * FROM [proveedores] WHERE cuit = :cuit AND estado = 'activo'
    `, {
      replacements: { cuit }
    });

    logger.info(`Proveedor creado: ${razon_social} por usuario ${req.usuario.id}`);

    res.status(201).json({
      success: true,
      data: nuevoProveedor[0],
      message: 'Proveedor creado exitosamente'
    });
  } catch (error) {
    logger.error('Error creando proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * PUT /api/proveedores/:id - Actualizar proveedor
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      razon_social,
      cuit,
      nombre_comercial,
      contacto_principal,
      email_contacto,
      telefono,
      estado
    } = req.body;

    // Verificar que el proveedor existe
    const [existing] = await sequelize.query(`
      SELECT id FROM [proveedores] WHERE id = :id AND estado != 'eliminado'
    `, {
      replacements: { id }
    });

    if (!existing.length) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    // Actualizar proveedor
    await sequelize.query(`
      UPDATE [proveedores] SET
        razon_social = :razon_social,
        cuit = :cuit,
        nombre_comercial = :nombre_comercial,
        contacto_principal = :contacto_principal,
        email_contacto = :email_contacto,
        telefono = :telefono,
        estado = :estado,
        updated_at = GETDATE()
      WHERE id = :id
    `, {
      replacements: {
        id,
        razon_social,
        cuit,
        nombre_comercial,
        contacto_principal,
        email_contacto,
        telefono,
        estado: estado || 'activo'
      }
    });

    // Obtener el proveedor actualizado
    const [proveedorActualizado] = await sequelize.query(`
      SELECT * FROM [proveedores] WHERE id = :id
    `, {
      replacements: { id }
    });

    logger.info(`Proveedor actualizado: ${id} por usuario ${req.usuario.id}`);

    res.json({
      success: true,
      data: proveedorActualizado[0],
      message: 'Proveedor actualizado exitosamente'
    });
  } catch (error) {
    logger.error('Error actualizando proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * DELETE /api/proveedores/:id - Eliminar proveedor (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el proveedor existe
    const [existing] = await sequelize.query(`
      SELECT id FROM [proveedores] WHERE id = :id AND estado != 'eliminado'
    `, {
      replacements: { id }
    });

    if (!existing.length) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    // Verificar si tiene sitios activos
    const [sitiosActivos] = await sequelize.query(`
      SELECT COUNT(*) as count FROM [sitios] WHERE proveedor_id = :id AND estado = 'activo'
    `, {
      replacements: { id }
    });

    if (sitiosActivos[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un proveedor con sitios activos'
      });
    }

    // Soft delete
    await sequelize.query(`
      UPDATE [proveedores] SET estado = 'eliminado', updated_at = GETDATE() WHERE id = :id
    `, {
      replacements: { id }
    });

    logger.info(`Proveedor eliminado: ${id} por usuario ${req.usuario.id}`);

    res.json({
      success: true,
      message: 'Proveedor eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error eliminando proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;