/**
 * pliegoValidator.js
 *
 * Utilidad para validar datos de equipos contra requisitos del pliego.
 * Integra con el backend PliegoValidatorService para validación consistente.
 *
 * @author SAT-Digital Team
 * @version 1.0.0
 * @since Checkpoint 2.11 - Validación Automática con Pliegos
 */

/**
 * Validar equipos procesados contra pliego de requisitos
 *
 * @param {Array} equipos - Equipos normalizados del Excel
 * @param {Object} pliego - Pliego de requisitos completo
 * @returns {Object} Resultados de validación con scoring
 */
export const validarContraPliego = (equipos, pliego) => {
  if (!pliego || !pliego.parque_informatico) {
    return {
      validado: false,
      mensaje: 'No hay pliego de requisitos asociado',
      equipos: equipos.map(e => ({ ...e, validacion_pliego: null }))
    };
  }

  const requisitos = pliego.parque_informatico;
  const equiposValidados = equipos.map(equipo => {
    const validacion = validarEquipoContraRequisitos(equipo, requisitos);
    return {
      ...equipo,
      validacion_pliego: validacion
    };
  });

  // Calcular estadísticas generales
  const stats = calcularEstadisticasValidacion(equiposValidados);

  return {
    validado: true,
    pliego_codigo: pliego.codigo,
    pliego_nombre: pliego.nombre,
    requisitos_aplicados: {
      cpu: requisitos.procesadores_aceptados,
      ram_minima: requisitos.ram_minima_gb,
      discos: requisitos.discos,
      sistema_operativo: requisitos.sistema_operativo
    },
    equipos: equiposValidados,
    estadisticas: stats
  };
};

/**
 * Validar un equipo individual contra requisitos
 *
 * @param {Object} equipo - Equipo normalizado
 * @param {Object} requisitos - Requisitos de parque_informatico
 * @returns {Object} Resultado de validación
 */
const validarEquipoContraRequisitos = (equipo, requisitos) => {
  const resultado = {
    cumple_global: true,
    puntuacion: 100,
    validaciones: {
      procesador: null,
      ram: null,
      disco: null,
      sistema_operativo: null,
      navegador: null,
      headset: null,
      conectividad: null
    },
    errores: [],
    warnings: []
  };

  // VALIDACIÓN 1: Procesador
  if (requisitos.procesadores_aceptados && requisitos.procesadores_aceptados.length > 0) {
    const validacionCPU = validarProcesador(
      equipo.procesadorNormalizado || equipo.procesadorOriginal || '',
      requisitos.procesadores_aceptados
    );

    resultado.validaciones.procesador = validacionCPU;

    if (!validacionCPU.cumple) {
      resultado.cumple_global = false;
      resultado.puntuacion -= 30;
      resultado.errores.push({
        campo: 'Procesador',
        mensaje: validacionCPU.motivo,
        severidad: 'error'
      });
    }
  }

  // VALIDACIÓN 2: RAM
  if (requisitos.ram_minima_gb) {
    // CRÍTICO: Usar memoriaCapacidad ya normalizada en lugar de parsear de nuevo
    const ramEquipo = equipo.memoriaCapacidad || parseRAM(equipo.memoriaOriginal || equipo.memoria || '0');
    const ramMinima = requisitos.ram_minima_gb;

    const validacionRAM = {
      valor: ramEquipo,
      minimo: ramMinima,
      cumple: ramEquipo >= ramMinima
    };

    resultado.validaciones.ram = validacionRAM;

    if (!validacionRAM.cumple) {
      resultado.cumple_global = false;
      resultado.puntuacion -= 25;
      resultado.errores.push({
        campo: 'RAM',
        mensaje: `${ramEquipo}GB insuficiente (mínimo: ${ramMinima}GB)`,
        severidad: 'error'
      });
    }
  }

  // VALIDACIÓN 3: Disco
  if (requisitos.discos && requisitos.discos.length > 0) {
    // CRÍTICO: Pasar datos normalizados en lugar de parsear de nuevo
    const validacionDisco = validarDisco(
      equipo.almacenamientoOriginal || equipo.almacenamiento || '',
      requisitos.discos,
      equipo.almacenamientoTipo,
      equipo.almacenamientoCapacidad
    );

    resultado.validaciones.disco = validacionDisco;

    if (!validacionDisco.cumple) {
      resultado.cumple_global = false;
      resultado.puntuacion -= 25;
      resultado.errores.push({
        campo: 'Disco',
        mensaje: validacionDisco.motivo,
        severidad: 'error'
      });
    }
  }

  // VALIDACIÓN 4: Sistema Operativo
  if (requisitos.sistema_operativo) {
    const validacionSO = validarSistemaOperativo(
      equipo.sistemaOperativoOriginal || equipo.sistemaOperativo || '',
      requisitos.sistema_operativo,
      requisitos.sistema_operativo_version_min
    );

    resultado.validaciones.sistema_operativo = validacionSO;

    if (!validacionSO.cumple) {
      resultado.puntuacion -= 10;
      resultado.warnings.push({
        campo: 'Sistema Operativo',
        mensaje: validacionSO.motivo,
        severidad: 'warning'
      });
    }
  }

  // VALIDACIÓN 5: Navegador
  if (requisitos.navegadores && requisitos.navegadores.length > 0) {
    const validacionNavegador = validarNavegador(
      equipo.navegadorOriginal || equipo.navegador || '',
      requisitos.navegadores
    );

    resultado.validaciones.navegador = validacionNavegador;

    if (!validacionNavegador.cumple) {
      resultado.cumple_global = false;
      resultado.puntuacion -= 15;
      resultado.errores.push({
        campo: 'Navegador',
        mensaje: validacionNavegador.motivo,
        severidad: 'error'
      });
    }
  }

  // VALIDACIÓN 6: Headset Homologado
  if (requisitos.headset_homologacion && requisitos.headsets_homologados) {
    const validacionHeadset = validarHeadset(
      equipo.headsetOriginal || equipo.headset || '',
      requisitos.headsets_homologados
    );

    resultado.validaciones.headset = validacionHeadset;

    if (!validacionHeadset.cumple) {
      resultado.cumple_global = false;
      resultado.puntuacion -= 10;
      resultado.errores.push({
        campo: 'Headset',
        mensaje: validacionHeadset.motivo,
        severidad: 'error'
      });
    }
  }

  // VALIDACIÓN 7: Conectividad (solo para teletrabajo)
  if (equipo.esTeletrabajo && requisitos.conectividad_minima) {
    const validacionConectividad = validarConectividad(
      equipo.tipoConexion || '',
      equipo.velocidadDown || 0,
      equipo.velocidadUp || 0,
      requisitos.conectividad_minima
    );

    resultado.validaciones.conectividad = validacionConectividad;

    if (!validacionConectividad.cumple) {
      resultado.cumple_global = false;
      resultado.puntuacion -= 15;
      resultado.errores.push({
        campo: 'Conectividad',
        mensaje: validacionConectividad.motivo,
        severidad: 'error'
      });
    }
  }

  // Asegurar que puntuación no sea negativa
  resultado.puntuacion = Math.max(0, resultado.puntuacion);

  return resultado;
};

/**
 * Validar procesador contra lista de aceptados
 */
const validarProcesador = (procesador, procesadores_aceptados) => {
  const resultado = { cumple: false, motivo: '', marca_encontrada: null };

  const cpuNormalizado = normalizarTexto(procesador);

  for (const proc of procesadores_aceptados) {
    const marca = normalizarTexto(proc.marca || '');
    const familiaMin = normalizarTexto(proc.familia_min || '');

    // Verificar si contiene la marca
    // Para Intel: buscar "intel" O patrones i3/i5/i7/i9
    // Para AMD: buscar "amd" O "ryzen"
    let esMarcaCorrecta = false;

    if (marca === 'intel') {
      esMarcaCorrecta = cpuNormalizado.includes('intel') || /\bi[3579][-\s]/.test(cpuNormalizado);
    } else if (marca === 'amd') {
      esMarcaCorrecta = cpuNormalizado.includes('amd') || cpuNormalizado.includes('ryzen');
    } else {
      esMarcaCorrecta = cpuNormalizado.includes(marca);
    }

    if (!esMarcaCorrecta) {
      continue;
    }

    resultado.marca_encontrada = proc.marca;

    // Intel: Validar familia (i3, i5, i7, i9)
    if (marca === 'intel') {
      const match = cpuNormalizado.match(/i(\d)/);
      if (match) {
        const familia = parseInt(match[1]);
        const familiaMinNum = parseInt(familiaMin.replace(/[^0-9]/g, ''));

        if (proc.aceptar_superior && familia >= familiaMinNum) {
          resultado.cumple = true;
          resultado.motivo = `Cumple: ${proc.marca} ${proc.familia_min} o superior`;
          return resultado;
        } else if (!proc.aceptar_superior && familia === familiaMinNum) {
          resultado.cumple = true;
          resultado.motivo = `Cumple: ${proc.marca} ${proc.familia_min}`;
          return resultado;
        }
      }
    }

    // AMD: Validar familia (Ryzen 3, 5, 7, 9)
    if (marca === 'amd') {
      const match = cpuNormalizado.match(/ryzen\s*(\d)/);
      if (match) {
        const familia = parseInt(match[1]);
        const familiaMinNum = parseInt(familiaMin.replace(/[^0-9]/g, ''));

        if (proc.aceptar_superior && familia >= familiaMinNum) {
          resultado.cumple = true;
          resultado.motivo = `Cumple: ${proc.marca} ${proc.familia_min} o superior`;
          return resultado;
        } else if (!proc.aceptar_superior && familia === familiaMinNum) {
          resultado.cumple = true;
          resultado.motivo = `Cumple: ${proc.marca} ${proc.familia_min}`;
          return resultado;
        }
      }
    }
  }

  resultado.motivo = `No cumple con requisitos: ${procesadores_aceptados.map(p =>
    `${p.marca} ${p.familia_min}${p.aceptar_superior ? '+' : ''}`
  ).join(', ')}`;

  return resultado;
};

/**
 * Validar disco
 * @param {string} disco - Texto original del disco
 * @param {Array} discos_requisitos - Requisitos de discos del pliego
 * @param {string} tipoNormalizado - Tipo ya normalizado (SSD/HDD)
 * @param {number} capacidadNormalizada - Capacidad ya normalizada en GB
 */
const validarDisco = (disco, discos_requisitos, tipoNormalizado = null, capacidadNormalizada = null) => {
  const resultado = { cumple: false, motivo: '', tipo_encontrado: null };

  // CRÍTICO: Usar valores normalizados si están disponibles
  const tipo = tipoNormalizado || normalizarTexto(disco);
  const capacidad = capacidadNormalizada || parseCapacidad(disco);

  for (const req of discos_requisitos) {
    const tipoRequerido = normalizarTexto(req.tipo || '');

    // Verificar tipo (SSD, HDD, etc.)
    if (!normalizarTexto(tipo).includes(tipoRequerido)) {
      continue;
    }

    resultado.tipo_encontrado = req.tipo;

    const minimo = req.capacidad_gb;

    if (capacidad >= minimo) {
      resultado.cumple = true;
      resultado.motivo = `Cumple: ${req.tipo} ${minimo}GB+`;
      resultado.capacidad = capacidad;
      resultado.minimo = minimo;
      return resultado;
    } else {
      resultado.motivo = `${req.tipo} insuficiente: ${capacidad}GB (mínimo: ${minimo}GB)`;
      resultado.capacidad = capacidad;
      resultado.minimo = minimo;
      return resultado;
    }
  }

  resultado.motivo = `Tipo de disco no aceptado. Requiere: ${discos_requisitos.map(d => `${d.tipo} ${d.capacidad_gb}GB`).join(' o ')}`;
  return resultado;
};

/**
 * Validar sistema operativo
 */
const validarSistemaOperativo = (so, so_requerido, version_min) => {
  const resultado = { cumple: true, motivo: '' };

  const soNormalizado = normalizarTexto(so);
  const requeridoNormalizado = normalizarTexto(so_requerido);

  if (!soNormalizado.includes(requeridoNormalizado)) {
    resultado.cumple = false;
    resultado.motivo = `Se requiere ${so_requerido}`;
    return resultado;
  }

  // Validar versión si está especificada
  if (version_min && version_min !== '0') {
    const versionMatch = soNormalizado.match(/\d+/);
    if (versionMatch) {
      const version = parseInt(versionMatch[0]);
      const minVersion = parseInt(version_min);

      if (version < minVersion) {
        resultado.cumple = false;
        resultado.motivo = `Versión mínima requerida: ${so_requerido} ${minVersion}`;
        return resultado;
      }
    }
  }

  resultado.motivo = 'Cumple';
  return resultado;
};

/**
 * Validar navegador y versión mínima
 *
 * @param {string} navegador - String del navegador (ej: "Google Chrome Version 141.0.7339.127")
 * @param {Array} navegadores_requisitos - Array de { marca: "Chrome", version_minima: "120" }
 * @returns {Object} Resultado de validación
 */
const validarNavegador = (navegador, navegadores_requisitos) => {
  const resultado = { cumple: false, motivo: '', version_detectada: null, navegador_encontrado: null };

  if (!navegador || !navegadores_requisitos || navegadores_requisitos.length === 0) {
    resultado.motivo = 'No se pudo validar navegador';
    return resultado;
  }

  const navegadorNormalizado = normalizarTexto(navegador);

  // Buscar si el navegador coincide con alguno de los permitidos
  let navegadorEncontrado = null;
  for (const navReq of navegadores_requisitos) {
    const marcaNormalizada = normalizarTexto(navReq.marca || '');
    if (navegadorNormalizado.includes(marcaNormalizada)) {
      navegadorEncontrado = navReq;
      break;
    }
  }

  if (!navegadorEncontrado) {
    const navegadoresPermitidos = navegadores_requisitos.map(n => n.marca).join(', ');
    resultado.motivo = `Navegador no permitido. Permitidos: ${navegadoresPermitidos}`;
    return resultado;
  }

  resultado.navegador_encontrado = navegadorEncontrado;

  // Extraer versión (solo primer número hasta el primer punto)
  // Ejemplo: "Google Chrome Version 141.0.7390.123" → "141"
  const versionMatch = navegador.match(/version\s+(\d+)/i) || navegador.match(/(\d+)\.\d+\.\d+/);

  if (versionMatch) {
    const versionDetectada = parseInt(versionMatch[1]);
    resultado.version_detectada = versionDetectada;

    const versionMinima = parseInt(navegadorEncontrado.version_minima || '0');

    if (versionMinima > 0 && versionDetectada < versionMinima) {
      resultado.cumple = false;
      resultado.motivo = `Versión de ${navegadorEncontrado.marca} insuficiente: ${versionDetectada} (mínimo: ${versionMinima})`;
      return resultado;
    }

    resultado.cumple = true;
    resultado.motivo = `Cumple: ${navegadorEncontrado.marca} ${versionDetectada}${versionMinima > 0 ? ` (mínimo: ${versionMinima})` : ''}`;
    return resultado;
  }

  // Si no se pudo extraer versión pero el navegador es correcto
  if (navegadorEncontrado.version_minima && navegadorEncontrado.version_minima !== '0') {
    resultado.cumple = false;
    resultado.motivo = `No se pudo verificar versión de ${navegadorEncontrado.marca}`;
  } else {
    resultado.cumple = true;
    resultado.motivo = `Cumple: ${navegadorEncontrado.marca} detectado`;
  }

  return resultado;
};

/**
 * Validar headset contra lista de homologados
 *
 * @param {string} headset - String del headset (ej: "Jabra Biz 2300 Duo")
 * @param {Array} headsets_homologados - Array de { marca, modelo, conector }
 * @returns {Object} Resultado de validación
 */
const validarHeadset = (headset, headsets_homologados) => {
  const resultado = { cumple: false, motivo: '', headset_encontrado: null };

  if (!headset || !headsets_homologados || headsets_homologados.length === 0) {
    resultado.motivo = 'No se pudo validar headset';
    return resultado;
  }

  const headsetNormalizado = normalizarTexto(headset);

  // Buscar en lista de homologados
  const encontrado = headsets_homologados.find(homologado => {
    const marcaNormalizada = normalizarTexto(homologado.marca || '');
    const modeloNormalizado = normalizarTexto(homologado.modelo || '');

    // Verificar si el headset contiene la marca y modelo
    return headsetNormalizado.includes(marcaNormalizada) &&
           headsetNormalizado.includes(modeloNormalizado);
  });

  if (encontrado) {
    resultado.cumple = true;
    resultado.motivo = `Cumple: ${encontrado.marca} ${encontrado.modelo} (Homologado)`;
    resultado.headset_encontrado = encontrado;
  } else {
    resultado.cumple = false;
    resultado.motivo = `Headset NO homologado: "${headset}" (Total homologados: ${headsets_homologados.length})`;
  }

  return resultado;
};

/**
 * Validar conectividad para teletrabajo
 *
 * @param {string} tipoConexion - Tipo de conexión (Fibra Óptica, Cable, etc.)
 * @param {number} velocidadDown - Velocidad de descarga en Mbps
 * @param {number} velocidadUp - Velocidad de subida en Mbps
 * @param {Object} conectividad_requisitos - { tecnologias: [...] }
 * @returns {Object} Resultado de validación
 */
const validarConectividad = (tipoConexion, velocidadDown, velocidadUp, conectividad_requisitos) => {
  const resultado = { cumple: false, motivo: '', tecnologia_aplicable: null };

  if (!conectividad_requisitos || !conectividad_requisitos.tecnologias) {
    resultado.motivo = 'No se pudo validar conectividad';
    return resultado;
  }

  const tipoNormalizado = normalizarTexto(tipoConexion);

  // Buscar tecnología aplicable
  const tecnologiaEncontrada = conectividad_requisitos.tecnologias.find(tech => {
    const tipoTechNormalizado = normalizarTexto(tech.tipo || '');
    return tipoNormalizado.includes(tipoTechNormalizado);
  });

  if (!tecnologiaEncontrada) {
    // Si no se encuentra tecnología específica, usar requisitos genéricos si existen
    if (conectividad_requisitos.velocidad_minima_down || conectividad_requisitos.velocidad_minima_up) {
      const minDown = conectividad_requisitos.velocidad_minima_down || 0;
      const minUp = conectividad_requisitos.velocidad_minima_up || 0;

      if (velocidadDown < minDown) {
        resultado.cumple = false;
        resultado.motivo = `Velocidad de descarga insuficiente: ${velocidadDown}Mbps (mínimo: ${minDown}Mbps)`;
        return resultado;
      }

      if (velocidadUp < minUp) {
        resultado.cumple = false;
        resultado.motivo = `Velocidad de subida insuficiente: ${velocidadUp}Mbps (mínimo: ${minUp}Mbps)`;
        return resultado;
      }

      resultado.cumple = true;
      resultado.motivo = `Cumple: ${velocidadDown}Mbps↓ / ${velocidadUp}Mbps↑`;
      return resultado;
    }

    resultado.cumple = true;
    resultado.motivo = 'Conectividad no especificada en requisitos';
    return resultado;
  }

  resultado.tecnologia_aplicable = tecnologiaEncontrada;

  // Validar velocidades contra tecnología específica
  if (velocidadDown < tecnologiaEncontrada.velocidadMinimaDown) {
    resultado.cumple = false;
    resultado.motivo = `Velocidad de descarga insuficiente para ${tecnologiaEncontrada.tipo}: ${velocidadDown}Mbps (mínimo: ${tecnologiaEncontrada.velocidadMinimaDown}Mbps)`;
    return resultado;
  }

  if (velocidadUp < tecnologiaEncontrada.velocidadMinimaUp) {
    resultado.cumple = false;
    resultado.motivo = `Velocidad de subida insuficiente para ${tecnologiaEncontrada.tipo}: ${velocidadUp}Mbps (mínimo: ${tecnologiaEncontrada.velocidadMinimaUp}Mbps)`;
    return resultado;
  }

  resultado.cumple = true;
  resultado.motivo = `Cumple: ${tecnologiaEncontrada.tipo} ${velocidadDown}Mbps↓ / ${velocidadUp}Mbps↑`;
  return resultado;
};

/**
 * Calcular estadísticas generales de validación
 */
const calcularEstadisticasValidacion = (equipos) => {
  const stats = {
    total: equipos.length,
    cumplen: 0,
    no_cumplen: 0,
    con_warnings: 0,
    porcentaje_cumplimiento: 0,
    puntuacion_promedio: 0,
    errores_por_campo: {
      procesador: 0,
      ram: 0,
      disco: 0,
      sistema_operativo: 0,
      navegador: 0,
      headset: 0,
      conectividad: 0
    },
    distribucion_puntuacion: {
      excelente: 0, // 90-100
      bueno: 0,      // 70-89
      regular: 0,    // 50-69
      deficiente: 0  // 0-49
    }
  };

  let sumaPuntuaciones = 0;

  equipos.forEach(equipo => {
    const validacion = equipo.validacion_pliego;

    if (!validacion) return;

    // Contar cumplimientos
    if (validacion.cumple_global) {
      stats.cumplen++;
    } else {
      stats.no_cumplen++;
    }

    if (validacion.warnings && validacion.warnings.length > 0) {
      stats.con_warnings++;
    }

    // Sumar puntuaciones
    sumaPuntuaciones += validacion.puntuacion;

    // Distribuir por rango de puntuación
    if (validacion.puntuacion >= 90) {
      stats.distribucion_puntuacion.excelente++;
    } else if (validacion.puntuacion >= 70) {
      stats.distribucion_puntuacion.bueno++;
    } else if (validacion.puntuacion >= 50) {
      stats.distribucion_puntuacion.regular++;
    } else {
      stats.distribucion_puntuacion.deficiente++;
    }

    // Contar errores por campo
    validacion.errores.forEach(error => {
      const campo = normalizarTexto(error.campo);
      if (campo.includes('procesador') || campo.includes('cpu')) {
        stats.errores_por_campo.procesador++;
      } else if (campo.includes('ram') || campo.includes('memoria')) {
        stats.errores_por_campo.ram++;
      } else if (campo.includes('disco') || campo.includes('almacenamiento')) {
        stats.errores_por_campo.disco++;
      } else if (campo.includes('sistema') || campo.includes('operativo')) {
        stats.errores_por_campo.sistema_operativo++;
      } else if (campo.includes('navegador') || campo.includes('browser')) {
        stats.errores_por_campo.navegador++;
      } else if (campo.includes('headset') || campo.includes('auricular')) {
        stats.errores_por_campo.headset++;
      } else if (campo.includes('conectividad') || campo.includes('internet')) {
        stats.errores_por_campo.conectividad++;
      }
    });
  });

  // Calcular porcentajes
  stats.porcentaje_cumplimiento = stats.total > 0
    ? Math.round((stats.cumplen / stats.total) * 100)
    : 0;

  stats.puntuacion_promedio = stats.total > 0
    ? Math.round(sumaPuntuaciones / stats.total)
    : 0;

  return stats;
};

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Normalizar texto para comparaciones
 */
const normalizarTexto = (texto) => {
  if (!texto) return '';
  return texto.toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

/**
 * Parsear RAM de string a número en GB
 */
const parseRAM = (ramStr) => {
  if (!ramStr) return 0;

  const str = ramStr.toString().toLowerCase();
  const match = str.match(/(\d+)\s*(gb|mb)?/);

  if (!match) return 0;

  let valor = parseInt(match[1]);
  const unidad = match[2];

  if (unidad === 'mb') {
    valor = Math.round(valor / 1024);
  }

  return valor;
};

/**
 * Parsear capacidad de disco de string a GB
 */
const parseCapacidad = (discoStr) => {
  if (!discoStr) return 0;

  const str = discoStr.toString().toLowerCase();
  const match = str.match(/(\d+)\s*(gb|tb|mb)?/);

  if (!match) return 0;

  let valor = parseInt(match[1]);
  const unidad = match[2];

  if (unidad === 'tb') {
    valor = valor * 1024;
  } else if (unidad === 'mb') {
    valor = Math.round(valor / 1024);
  }

  return valor;
};

/**
 * Obtener color según puntuación
 */
export const obtenerColorPuntuacion = (puntuacion) => {
  if (puntuacion >= 90) return 'success';
  if (puntuacion >= 70) return 'info';
  if (puntuacion >= 50) return 'warning';
  return 'error';
};

/**
 * Obtener etiqueta según puntuación
 */
export const obtenerEtiquetaPuntuacion = (puntuacion) => {
  if (puntuacion >= 90) return 'Excelente';
  if (puntuacion >= 70) return 'Bueno';
  if (puntuacion >= 50) return 'Regular';
  return 'Deficiente';
};

export default {
  validarContraPliego,
  obtenerColorPuntuacion,
  obtenerEtiquetaPuntuacion
};
