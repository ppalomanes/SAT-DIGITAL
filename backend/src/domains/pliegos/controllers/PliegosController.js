const { PliegoRequisitos, PliegoHistorial, HeadsetHomologado, sequelize } = require('../../../shared/database/models');
const { Op } = require('sequelize');

/**
 * Formatea una fecha para SQL Server (sin timezone offset)
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha formateada como 'YYYY-MM-DD HH:mm:ss'
 */
const formatDateForSQLServer = (date = new Date()) => {
  const pad = (num) => String(num).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * PliegosController
 *
 * Gestiona los Pliegos de Requisitos - documentos centralizados que definen
 * los umbrales técnicos para períodos completos de auditoría.
 *
 * Un Pliego contiene configuraciones para:
 * - Parque Informático (CPU, RAM, SSD, Headsets)
 * - Conectividad (Velocidades internet)
 * - Infraestructura (UPS, Generador)
 * - Seguridad (Controles obligatorios)
 * - Documentación y Personal
 *
 * Arquitectura: Tenant → Pliego → Período → Auditorías
 *
 * @module PliegosController
 */

class PliegosController {
  /**
   * Lista todos los pliegos del tenant actual
   *
   * Retorna pliegos ordenados por:
   * 1. es_vigente (vigente primero)
   * 2. estado (activo primero)
   * 3. vigencia_desde (más reciente primero)
   *
   * @param {Object} req - Express request (requiere req.user.tenant_id)
   * @param {Object} res - Express response
   * @returns {Array} Lista de pliegos con información resumida
   */
  async listarPliegos(req, res) {
    try {
      const { tenant_id } = req.usuario;

      const pliegos = await PliegoRequisitos.findAll({
        where: {
          tenant_id,
          activo: true
        },
        attributes: [
          'id',
          'codigo',
          'nombre',
          'descripcion',
          'vigencia_desde',
          'vigencia_hasta',
          'estado',
          'es_vigente',
          'version',
          'creado_en',
          'modificado_en'
        ],
        order: [
          ['es_vigente', 'DESC'],
          ['estado', 'ASC'],
          ['vigencia_desde', 'DESC']
        ]
      });

      res.json({
        success: true,
        data: pliegos,
        total: pliegos.length
      });

    } catch (error) {
      console.error('❌ Error al listar pliegos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener lista de pliegos',
        error: error.message
      });
    }
  }

  /**
   * Obtiene un pliego específico con todos sus detalles
   *
   * Incluye todas las secciones técnicas completas:
   * - parque_informatico
   * - conectividad
   * - infraestructura
   * - seguridad
   * - documentacion
   * - personal
   *
   * @param {Object} req - Express request (req.params.id)
   * @param {Object} res - Express response
   * @returns {Object} Pliego completo con todas las configuraciones
   */
  async obtenerPliego(req, res) {
    try {
      const { tenant_id } = req.usuario;
      const { id } = req.params;

      const pliego = await PliegoRequisitos.findOne({
        where: {
          id,
          tenant_id,
          activo: true
        }
      });

      if (!pliego) {
        return res.status(404).json({
          success: false,
          message: 'Pliego no encontrado'
        });
      }

      // Cargar headsets homologados activos del tenant dinámicamente
      const headsetsHomologados = await HeadsetHomologado.findAll({
        where: {
          tenant_id,
          activo: true
        },
        attributes: ['id', 'marca', 'modelo', 'conector'],
        order: [['marca', 'ASC'], ['modelo', 'ASC']]
      });

      // Convertir a plain objects
      const pliegoData = pliego.toJSON();

      // Asegurar que parque_informatico existe y agregar headsets
      if (pliegoData.parque_informatico) {
        pliegoData.parque_informatico.headset_homologacion = headsetsHomologados.length > 0;
        pliegoData.parque_informatico.headsets_homologados = headsetsHomologados;
      }

      res.json({
        success: true,
        data: pliegoData
      });

    } catch (error) {
      console.error('❌ Error al obtener pliego:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener pliego',
        error: error.message
      });
    }
  }

  /**
   * Crea un nuevo pliego de requisitos
   *
   * Validaciones automáticas:
   * - Solo un pliego puede estar marcado como vigente por tenant
   * - Código debe ser único dentro del tenant
   * - vigencia_desde es obligatorio
   *
   * @param {Object} req - Express request con datos del pliego en body
   * @param {Object} res - Express response
   * @returns {Object} Pliego creado
   */
  async crearPliego(req, res) {
    try {
      const { tenant_id, id: usuario_id } = req.usuario;

      const {
        codigo,
        nombre,
        descripcion,
        vigencia_desde,
        vigencia_hasta,
        estado = 'borrador',
        es_vigente = false,
        parque_informatico,
        conectividad,
        infraestructura,
        seguridad,
        documentacion,
        personal,
        archivo_headsets_path,
        archivo_headsets_nombre,
        total_headsets
      } = req.body;

      // Validar campos obligatorios
      if (!codigo || !nombre || !vigencia_desde) {
        return res.status(400).json({
          success: false,
          message: 'Campos obligatorios: codigo, nombre, vigencia_desde'
        });
      }

      // Limpiar y validar fechas
      // Convertir strings inválidos como 'Invalid date', '', o undefined a null
      const vigenciaHastaLimpia = (vigencia_hasta && vigencia_hasta !== 'Invalid date' && vigencia_hasta.trim() !== '')
        ? vigencia_hasta
        : null;

      // Verificar código único en el tenant
      const codigoExistente = await PliegoRequisitos.findOne({
        where: { tenant_id, codigo, activo: true }
      });

      if (codigoExistente) {
        return res.status(400).json({
          success: false,
          message: `Ya existe un pliego con el código "${codigo}"`
        });
      }

      // Si se marca como vigente, quitar vigencia de otros
      if (es_vigente) {
        await PliegoRequisitos.update(
          { es_vigente: false },
          { where: { tenant_id, es_vigente: true } }
        );
      }

      // Crear pliego
      const ahora = new Date();
      const fechaFormateada = ahora.toISOString().slice(0, 19).replace('T', ' ');

      const pliego = await PliegoRequisitos.create({
        tenant_id,
        codigo,
        nombre,
        descripcion,
        vigencia_desde,
        vigencia_hasta: vigenciaHastaLimpia,
        estado,
        es_vigente,
        parque_informatico,
        conectividad,
        infraestructura,
        seguridad,
        documentacion,
        personal,
        archivo_headsets_path,
        archivo_headsets_nombre,
        total_headsets,
        creado_por: usuario_id,
        creado_en: sequelize.literal(`'${fechaFormateada}'`),
        version: 1
      });

      // Crear registro en historial (versión inicial)
      await PliegoHistorial.create({
        pliego_id: pliego.id,
        version: 1,
        pliego_snapshot: pliego.toJSON(),
        cambios_descripcion: 'Versión inicial del pliego',
        usuario_id,
        fecha: sequelize.literal(`'${fechaFormateada}'`)
      });

      res.status(201).json({
        success: true,
        message: 'Pliego creado exitosamente',
        data: pliego
      });

    } catch (error) {
      console.error('❌ Error al crear pliego:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear pliego',
        error: error.message
      });
    }
  }

  /**
   * Actualiza un pliego existente
   *
   * Características:
   * - Incrementa automáticamente la versión
   * - Guarda snapshot completo en historial
   * - Calcula diferencias respecto a versión anterior
   * - Actualiza modificado_por y modificado_en
   *
   * @param {Object} req - Express request con datos actualizados en body
   * @param {Object} res - Express response
   * @returns {Object} Pliego actualizado
   */
  async actualizarPliego(req, res) {
    try {
      const { tenant_id, id: usuario_id } = req.usuario;
      const { id } = req.params;

      const pliego = await PliegoRequisitos.findOne({
        where: { id, tenant_id, activo: true }
      });

      if (!pliego) {
        return res.status(404).json({
          success: false,
          message: 'Pliego no encontrado'
        });
      }

      // Guardar estado anterior para diff
      const estadoAnterior = pliego.toJSON();

      const {
        nombre,
        descripcion,
        vigencia_desde,
        vigencia_hasta,
        estado,
        es_vigente,
        parque_informatico,
        conectividad,
        infraestructura,
        seguridad,
        documentacion,
        personal,
        archivo_headsets_path,
        archivo_headsets_nombre,
        total_headsets,
        cambios_descripcion
      } = req.body;

      // Limpiar y validar fechas
      // Convertir strings inválidos como 'Invalid date', '', o undefined a null
      const vigenciaHastaLimpia = vigencia_hasta !== undefined
        ? ((vigencia_hasta && vigencia_hasta !== 'Invalid date' && vigencia_hasta.trim() !== '') ? vigencia_hasta : null)
        : pliego.vigencia_hasta;

      // Si se marca como vigente, quitar vigencia de otros
      if (es_vigente && !pliego.es_vigente) {
        await PliegoRequisitos.update(
          { es_vigente: false },
          { where: { tenant_id, es_vigente: true, id: { [Op.ne]: id } } }
        );
      }

      // Incrementar versión
      const nuevaVersion = pliego.version + 1;

      // Actualizar pliego
      await pliego.update({
        nombre: nombre || pliego.nombre,
        descripcion: descripcion !== undefined ? descripcion : pliego.descripcion,
        vigencia_desde: vigencia_desde || pliego.vigencia_desde,
        vigencia_hasta: vigenciaHastaLimpia,
        estado: estado || pliego.estado,
        es_vigente: es_vigente !== undefined ? es_vigente : pliego.es_vigente,
        parque_informatico: parque_informatico !== undefined ? parque_informatico : pliego.parque_informatico,
        conectividad: conectividad !== undefined ? conectividad : pliego.conectividad,
        infraestructura: infraestructura !== undefined ? infraestructura : pliego.infraestructura,
        seguridad: seguridad !== undefined ? seguridad : pliego.seguridad,
        documentacion: documentacion !== undefined ? documentacion : pliego.documentacion,
        personal: personal !== undefined ? personal : pliego.personal,
        archivo_headsets_path: archivo_headsets_path !== undefined ? archivo_headsets_path : pliego.archivo_headsets_path,
        archivo_headsets_nombre: archivo_headsets_nombre !== undefined ? archivo_headsets_nombre : pliego.archivo_headsets_nombre,
        total_headsets: total_headsets !== undefined ? total_headsets : pliego.total_headsets,
        version: nuevaVersion,
        modificado_por: usuario_id,
        modificado_en: sequelize.literal(`'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`)
      });

      // Calcular cambios
      const estadoNuevo = pliego.toJSON();
      const diff = this._calcularDiferencias(estadoAnterior, estadoNuevo);

      // Guardar en historial
      const fechaActualizacion = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await PliegoHistorial.create({
        pliego_id: pliego.id,
        version: nuevaVersion,
        pliego_snapshot: estadoNuevo,
        cambios_descripcion: cambios_descripcion || 'Actualización del pliego',
        cambios_diff: diff,
        usuario_id,
        fecha: sequelize.literal(`'${fechaActualizacion}'`)
      });

      res.json({
        success: true,
        message: 'Pliego actualizado exitosamente',
        data: pliego
      });

    } catch (error) {
      console.error('❌ Error al actualizar pliego:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar pliego',
        error: error.message
      });
    }
  }

  /**
   * Marca un pliego como vigente (activo)
   *
   * Solo puede haber un pliego vigente por tenant a la vez.
   * Al marcar uno como vigente, todos los demás se marcan como no vigentes.
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Object} Confirmación de cambio
   */
  async marcarVigente(req, res) {
    try {
      const { tenant_id } = req.usuario;
      const { id } = req.params;

      const pliego = await PliegoRequisitos.findOne({
        where: { id, tenant_id, activo: true }
      });

      if (!pliego) {
        return res.status(404).json({
          success: false,
          message: 'Pliego no encontrado'
        });
      }

      // Quitar vigencia de todos los demás
      await PliegoRequisitos.update(
        { es_vigente: false },
        { where: { tenant_id, es_vigente: true } }
      );

      // Marcar este como vigente
      await pliego.update({ es_vigente: true });

      res.json({
        success: true,
        message: `Pliego "${pliego.nombre}" marcado como vigente`,
        data: pliego
      });

    } catch (error) {
      console.error('❌ Error al marcar pliego como vigente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al marcar pliego como vigente',
        error: error.message
      });
    }
  }

  /**
   * Obtiene el historial de versiones de un pliego
   *
   * Retorna todas las versiones ordenadas de más reciente a más antigua,
   * incluyendo snapshots completos y diferencias calculadas.
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Array} Historial de versiones
   */
  async obtenerHistorial(req, res) {
    try {
      const { tenant_id } = req.usuario;
      const { id } = req.params;

      // Verificar que el pliego pertenece al tenant
      const pliego = await PliegoRequisitos.findOne({
        where: { id, tenant_id, activo: true }
      });

      if (!pliego) {
        return res.status(404).json({
          success: false,
          message: 'Pliego no encontrado'
        });
      }

      const historial = await PliegoHistorial.findAll({
        where: { pliego_id: id },
        order: [['version', 'DESC']]
      });

      res.json({
        success: true,
        data: historial,
        total: historial.length
      });

    } catch (error) {
      console.error('❌ Error al obtener historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener historial de versiones',
        error: error.message
      });
    }
  }

  /**
   * Duplica un pliego existente
   *
   * Crea una copia completa de un pliego con:
   * - Nuevo código
   * - Referencia al pliego padre (trazabilidad)
   * - Versión 1
   * - Estado 'borrador'
   *
   * @param {Object} req - Express request (req.body.nuevo_codigo, req.params.id)
   * @param {Object} res - Express response
   * @returns {Object} Nuevo pliego duplicado
   */
  async duplicarPliego(req, res) {
    try {
      const { tenant_id, id: usuario_id } = req.usuario;
      const { id } = req.params;
      const { nuevo_codigo, nuevo_nombre } = req.body;

      if (!nuevo_codigo) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar un código para el nuevo pliego'
        });
      }

      const pliegoOriginal = await PliegoRequisitos.findOne({
        where: { id, tenant_id, activo: true }
      });

      if (!pliegoOriginal) {
        return res.status(404).json({
          success: false,
          message: 'Pliego original no encontrado'
        });
      }

      // Verificar código único
      const codigoExistente = await PliegoRequisitos.findOne({
        where: { tenant_id, codigo: nuevo_codigo, activo: true }
      });

      if (codigoExistente) {
        return res.status(400).json({
          success: false,
          message: `Ya existe un pliego con el código "${nuevo_codigo}"`
        });
      }

      // Crear copia
      const pliegoDuplicado = await PliegoRequisitos.create({
        tenant_id,
        codigo: nuevo_codigo,
        nombre: nuevo_nombre || `${pliegoOriginal.nombre} (Copia)`,
        descripcion: pliegoOriginal.descripcion,
        vigencia_desde: pliegoOriginal.vigencia_desde,
        vigencia_hasta: pliegoOriginal.vigencia_hasta,
        estado: 'borrador',
        es_vigente: false,
        parque_informatico: pliegoOriginal.parque_informatico,
        conectividad: pliegoOriginal.conectividad,
        infraestructura: pliegoOriginal.infraestructura,
        seguridad: pliegoOriginal.seguridad,
        documentacion: pliegoOriginal.documentacion,
        personal: pliegoOriginal.personal,
        archivo_headsets_path: pliegoOriginal.archivo_headsets_path,
        archivo_headsets_nombre: pliegoOriginal.archivo_headsets_nombre,
        total_headsets: pliegoOriginal.total_headsets,
        creado_por: usuario_id,
        version: 1,
        pliego_padre_id: pliegoOriginal.id
      });

      // Crear registro en historial
      const fechaDuplicado = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await PliegoHistorial.create({
        pliego_id: pliegoDuplicado.id,
        version: 1,
        pliego_snapshot: pliegoDuplicado.toJSON(),
        cambios_descripcion: `Duplicado desde pliego "${pliegoOriginal.nombre}" (ID: ${pliegoOriginal.id})`,
        usuario_id,
        fecha: sequelize.literal(`'${fechaDuplicado}'`)
      });

      res.status(201).json({
        success: true,
        message: 'Pliego duplicado exitosamente',
        data: pliegoDuplicado
      });

    } catch (error) {
      console.error('❌ Error al duplicar pliego:', error);
      res.status(500).json({
        success: false,
        message: 'Error al duplicar pliego',
        error: error.message
      });
    }
  }

  /**
   * Desactiva un pliego (soft delete)
   *
   * No elimina físicamente el pliego, solo lo marca como inactivo.
   * Si era vigente, no se marca automáticamente otro como vigente.
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Object} Confirmación de desactivación
   */
  async desactivarPliego(req, res) {
    try {
      const { tenant_id } = req.usuario;
      const { id } = req.params;

      const pliego = await PliegoRequisitos.findOne({
        where: { id, tenant_id, activo: true }
      });

      if (!pliego) {
        return res.status(404).json({
          success: false,
          message: 'Pliego no encontrado'
        });
      }

      await pliego.update({ activo: false });

      res.json({
        success: true,
        message: 'Pliego desactivado exitosamente',
        data: { id: pliego.id, codigo: pliego.codigo }
      });

    } catch (error) {
      console.error('❌ Error al desactivar pliego:', error);
      res.status(500).json({
        success: false,
        message: 'Error al desactivar pliego',
        error: error.message
      });
    }
  }

  /**
   * Calcula diferencias entre dos versiones de un pliego
   *
   * @private
   * @param {Object} anterior - Estado anterior del pliego
   * @param {Object} nuevo - Estado nuevo del pliego
   * @returns {Object} Objeto con campos modificados
   */
  _calcularDiferencias(anterior, nuevo) {
    const diff = {};
    const camposComparar = [
      'nombre', 'descripcion', 'vigencia_desde', 'vigencia_hasta',
      'estado', 'es_vigente', 'parque_informatico', 'conectividad',
      'infraestructura', 'seguridad', 'documentacion', 'personal',
      'archivo_headsets_path', 'total_headsets'
    ];

    camposComparar.forEach(campo => {
      if (JSON.stringify(anterior[campo]) !== JSON.stringify(nuevo[campo])) {
        diff[campo] = {
          anterior: anterior[campo],
          nuevo: nuevo[campo]
        };
      }
    });

    return diff;
  }
}

module.exports = new PliegosController();
