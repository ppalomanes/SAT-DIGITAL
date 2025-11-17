/**
 * pliegoTransformer.js
 *
 * Transforma requisitos del pliego del backend al formato que espera excelProcessor.js
 *
 * @author SAT-Digital Team
 * @version 1.0.0
 */

/**
 * Transformar pliego de requisitos al formato para validación
 *
 * Entrada (formato backend - pliego.parque_informatico):
 * {
 *   procesadores_aceptados: [{ marca: 'AMD', familia_min: 'Ryzen 5', aceptar_superior: true }],
 *   ram_minima_gb: 16,
 *   discos: [{ tipo: 'SSD', capacidad_gb: 480 }],
 *   sistema_operativo: 'Windows',
 *   sistema_operativo_version_min: '11'
 * }
 *
 * Salida (formato excelProcessor - validationRules):
 * {
 *   procesador: { marcasAceptadas: ['AMD', 'Intel'] },
 *   memoria: { capacidadMinima: 16 },
 *   almacenamiento: { opcionesValidas: [{ tipo: 'SSD', capacidadMinima: 480 }] },
 *   sistemaOperativo: { versionesAceptadas: ['Windows 11'] }
 * }
 *
 * @param {Object} pliego - Pliego completo del backend
 * @returns {Object} Reglas de validación para excelProcessor
 */
export const transformarPliegoAValidationRules = (pliego) => {
  if (!pliego || !pliego.parque_informatico) {
    return null;
  }

  const pi = pliego.parque_informatico;
  const rules = {};

  // ========================================================================
  // PROCESADOR
  // ========================================================================
  if (pi.procesadores_aceptados && pi.procesadores_aceptados.length > 0) {
    rules.procesador = {
      marcasAceptadas: pi.procesadores_aceptados.map(p => p.marca)
    };

    // Nota: No podemos validar familia (Core i5, Ryzen 5) en excelProcessor
    // porque usa lógica diferente. Esta validación se hace en pliegoValidator.
    // Aquí solo filtramos por marca para reducir falsos negativos.
  }

  // ========================================================================
  // MEMORIA RAM
  // ========================================================================
  if (pi.ram_minima_gb) {
    rules.memoria = {
      capacidadMinima: pi.ram_minima_gb
    };

    // Opcional: agregar tipos aceptados si el pliego los especifica
    if (pi.tipos_ram_aceptados && pi.tipos_ram_aceptados.length > 0) {
      rules.memoria.tiposAceptados = pi.tipos_ram_aceptados;
    }
  }

  // ========================================================================
  // ALMACENAMIENTO / DISCOS
  // ========================================================================
  if (pi.discos && pi.discos.length > 0) {
    rules.almacenamiento = {
      opcionesValidas: pi.discos.map(disco => ({
        tipo: disco.tipo,
        capacidadMinima: disco.capacidad_gb
      }))
    };
  }

  // ========================================================================
  // SISTEMA OPERATIVO
  // ========================================================================
  if (pi.sistema_operativo) {
    const versionesAceptadas = [];

    // Construir versiones aceptadas
    if (pi.sistema_operativo_version_min && pi.sistema_operativo_version_min !== '0') {
      // Ejemplo: "Windows" + "11" = "Windows 11"
      versionesAceptadas.push(`${pi.sistema_operativo} ${pi.sistema_operativo_version_min}`);
    } else {
      // Si no hay versión mínima o es "0", aceptar cualquier versión del SO
      versionesAceptadas.push(pi.sistema_operativo);
    }

    rules.sistemaOperativo = {
      versionesAceptadas
    };
  }

  // ========================================================================
  // NAVEGADOR
  // ========================================================================
  if (pi.navegador) {
    rules.navegador = {
      nombre: pi.navegador,
      version_min: pi.navegador_version_min || '0'
    };
  }

  // ========================================================================
  // HEADSET (si hay lista de homologados)
  // ========================================================================
  if (pi.headset_homologacion && pi.headsets_homologados) {
    rules.headset = {
      validacionEstricta: true,
      modelosHomologados: pi.headsets_homologados
    };
  }

  // ========================================================================
  // CONECTIVIDAD (si existe en el pliego)
  // ========================================================================
  if (pliego.conectividad && pliego.conectividad.tecnologias) {
    rules.conectividad = {
      tecnologias: pliego.conectividad.tecnologias
    };
  }

  return rules;
};

/**
 * Verificar si un pliego tiene requisitos de parque informático
 *
 * @param {Object} pliego - Pliego del backend
 * @returns {Boolean}
 */
export const tieneRequisitosParqueInformatico = (pliego) => {
  if (!pliego || !pliego.parque_informatico) {
    return false;
  }

  const pi = pliego.parque_informatico;

  return !!(
    (pi.procesadores_aceptados && pi.procesadores_aceptados.length > 0) ||
    pi.ram_minima_gb ||
    (pi.discos && pi.discos.length > 0) ||
    pi.sistema_operativo
  );
};

/**
 * Generar descripción legible de los requisitos
 *
 * @param {Object} pliego - Pliego del backend
 * @returns {String}
 */
export const generarDescripcionRequisitos = (pliego) => {
  if (!pliego || !pliego.parque_informatico) {
    return 'Sin requisitos específicos';
  }

  const pi = pliego.parque_informatico;
  const partes = [];

  // Procesadores
  if (pi.procesadores_aceptados && pi.procesadores_aceptados.length > 0) {
    const cpus = pi.procesadores_aceptados.map(p =>
      `${p.marca} ${p.familia_min}${p.aceptar_superior ? '+' : ''}`
    ).join(', ');
    partes.push(`CPU: ${cpus}`);
  }

  // RAM
  if (pi.ram_minima_gb) {
    partes.push(`RAM: ${pi.ram_minima_gb}GB`);
  }

  // Discos
  if (pi.discos && pi.discos.length > 0) {
    const discos = pi.discos.map(d => `${d.tipo} ${d.capacidad_gb}GB`).join(' o ');
    partes.push(`Disco: ${discos}`);
  }

  // SO
  if (pi.sistema_operativo) {
    const so = (pi.sistema_operativo_version_min && pi.sistema_operativo_version_min !== '0')
      ? `${pi.sistema_operativo} ${pi.sistema_operativo_version_min}+`
      : pi.sistema_operativo;
    partes.push(`SO: ${so}`);
  }

  // Navegador
  if (pi.navegador) {
    const nav = (pi.navegador_version_min && pi.navegador_version_min !== '0')
      ? `${pi.navegador} ${pi.navegador_version_min}+`
      : pi.navegador;
    partes.push(`Navegador: ${nav}`);
  }

  // Headsets
  if (pi.headset_homologacion && pi.headsets_homologados) {
    partes.push(`Headsets: ${pi.headsets_homologados.length} homologados`);
  }

  return partes.join(' | ');
};

export default {
  transformarPliegoAValidationRules,
  tieneRequisitosParqueInformatico,
  generarDescripcionRequisitos
};
