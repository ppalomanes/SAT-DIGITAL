const { Bitacora } = require('../database/models');

/**
 * Registrar evento en bitácora del sistema
 */
async function registrarBitacora(
  usuarioId, 
  accion, 
  entidadTipo, 
  entidadId, 
  descripcion, 
  datosAntes = null,
  datosDespues = null,
  req = null
) {
  try {
    const registro = {
      usuario_id: usuarioId,
      accion,
      entidad_tipo: entidadTipo,
      entidad_id: entidadId,
      descripcion,
      datos_antes: datosAntes,
      datos_despues: datosDespues,
      ip_address: req?.ip || null,
      user_agent: req?.get('User-Agent') || null
    };

    await Bitacora.create(registro);
  } catch (error) {
    console.error('Error registrando en bitácora:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
}

module.exports = {
  registrarBitacora
};