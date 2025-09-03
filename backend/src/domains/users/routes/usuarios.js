const express = require('express');
const UsuariosController = require('../controllers/UsuariosController');
const { verificarToken, verificarRol } = require('../../../shared/middleware/authMiddleware');

const router = express.Router();

/**
 * Rutas para gestión de usuarios
 * Todas requieren autenticación y rol de administrador
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);
router.use(verificarRol('administrador'));

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', UsuariosController.obtenerUsuarios);

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', UsuariosController.obtenerUsuario);

// POST /api/usuarios - Crear nuevo usuario
router.post('/', UsuariosController.crearUsuario);

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', UsuariosController.actualizarUsuario);

// DELETE /api/usuarios/:id - Eliminar usuario (soft delete)
router.delete('/:id', UsuariosController.eliminarUsuario);

module.exports = router;
