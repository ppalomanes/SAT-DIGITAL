/**
 * PliegoValidatorService
 *
 * Servicio de validación de datos contra pliegos de requisitos técnicos.
 * Valida equipos, conectividad e infraestructura contra umbrales mínimos definidos
 * en el pliego asociado al período de auditoría.
 *
 * @author SAT-Digital Team
 * @version 1.0.0
 * @since Checkpoint 2.11 - Validación Automática con Pliegos
 */

const logger = require('../../../shared/utils/logger');

class PliegoValidatorService {

  /**
   * Validar un equipo individual contra requisitos de parque informático
   *
   * @param {Object} equipo - Datos del equipo desde Excel
   * @param {Object} requisitos - Requisitos de parque_informatico del pliego
   * @returns {Object} Resultado de validación con errores y warnings
   */
  static validarEquipo(equipo, requisitos) {
    const resultado = {
      cumple: true,
      errores: [],
      warnings: [],
      detalles: {}
    };

    if (!requisitos) {
      return resultado; // Sin requisitos definidos = cumple por defecto
    }

    // VALIDACIÓN 1: Procesador
    if (requisitos.procesadores_aceptados && requisitos.procesadores_aceptados.length > 0) {
      const cpuCumple = this._validarProcesador(
        equipo.procesador || equipo.cpu || '',
        requisitos.procesadores_aceptados
      );

      resultado.detalles.procesador = cpuCumple;

      if (!cpuCumple.cumple) {
        resultado.cumple = false;
        resultado.errores.push(`Procesador no cumple: ${cpuCumple.motivo}`);
      }
    }

    // VALIDACIÓN 2: RAM
    if (requisitos.ram_minima_gb) {
      const ramEquipo = this._parseRAM(equipo.ram || equipo.memoria || '0');
      const ramMinima = requisitos.ram_minima_gb;

      resultado.detalles.ram = {
        valor: ramEquipo,
        minimo: ramMinima,
        cumple: ramEquipo >= ramMinima
      };

      if (ramEquipo < ramMinima) {
        resultado.cumple = false;
        resultado.errores.push(
          `RAM insuficiente: ${ramEquipo}GB (mínimo: ${ramMinima}GB)`
        );
      }
    }

    // VALIDACIÓN 3: Disco
    if (requisitos.discos && requisitos.discos.length > 0) {
      const discoCumple = this._validarDisco(
        equipo.disco || equipo.almacenamiento || '',
        requisitos.discos
      );

      resultado.detalles.disco = discoCumple;

      if (!discoCumple.cumple) {
        resultado.cumple = false;
        resultado.errores.push(`Disco no cumple: ${discoCumple.motivo}`);
      }
    }

    // VALIDACIÓN 4: Sistema Operativo
    if (requisitos.sistema_operativo) {
      const soCumple = this._validarSistemaOperativo(
        equipo.sistema_operativo || equipo.so || '',
        requisitos.sistema_operativo,
        requisitos.sistema_operativo_version_min
      );

      resultado.detalles.sistema_operativo = soCumple;

      if (!soCumple.cumple) {
        resultado.warnings.push(`SO: ${soCumple.motivo}`);
      }
    }

    // VALIDACIÓN 5: Navegadores
    if (requisitos.navegadores && requisitos.navegadores.length > 0) {
      // Esta validación es más flexible, solo warnings
      const navegador = equipo.navegador || '';
      if (navegador) {
        const navCumple = this._validarNavegador(navegador, requisitos.navegadores);
        resultado.detalles.navegador = navCumple;

        if (!navCumple.cumple) {
          resultado.warnings.push(`Navegador: ${navCumple.motivo}`);
        }
      }
    }

    return resultado;
  }

  /**
   * Validar headset contra lista de homologados del pliego
   *
   * @param {string} modelo - Modelo del headset
   * @param {Array} headsets_homologados - Lista de headsets homologados
   * @returns {Object} Resultado de validación
   */
  static validarHeadset(modelo, headsets_homologados) {
    const resultado = {
      cumple: true,
      modelo: modelo,
      homologado: false,
      motivo: ''
    };

    if (!headsets_homologados || headsets_homologados.length === 0) {
      resultado.motivo = 'No hay lista de headsets homologados';
      return resultado;
    }

    const modeloNormalizado = this._normalizarTexto(modelo);

    const encontrado = headsets_homologados.find(h => {
      const homologadoNormalizado = this._normalizarTexto(h.modelo || h);
      return modeloNormalizado.includes(homologadoNormalizado) ||
             homologadoNormalizado.includes(modeloNormalizado);
    });

    if (encontrado) {
      resultado.homologado = true;
      resultado.motivo = 'Headset homologado encontrado';
    } else {
      resultado.cumple = false;
      resultado.motivo = 'Headset no está en la lista de homologados';
    }

    return resultado;
  }

  /**
   * Validar conectividad (velocidades de internet)
   *
   * @param {Object} conectividad - Datos de conectividad
   * @param {Object} requisitos - Requisitos de conectividad del pliego
   * @returns {Object} Resultado de validación
   */
  static validarConectividad(conectividad, requisitos) {
    const resultado = {
      cumple: true,
      errores: [],
      warnings: [],
      detalles: {}
    };

    if (!requisitos) {
      return resultado;
    }

    // Validar velocidad hogar
    if (requisitos.velocidad_bajada_min_mbps) {
      const velocidad = parseFloat(conectividad.velocidad_hogar || 0);
      const minimo = requisitos.velocidad_bajada_min_mbps;

      resultado.detalles.velocidad_hogar = {
        valor: velocidad,
        minimo: minimo,
        cumple: velocidad >= minimo
      };

      if (velocidad < minimo) {
        resultado.cumple = false;
        resultado.errores.push(
          `Velocidad internet hogar: ${velocidad}Mbps (mínimo: ${minimo}Mbps)`
        );
      }
    }

    // Validar velocidad sitio
    if (requisitos.velocidad_subida_min_mbps) {
      const velocidad = parseFloat(conectividad.velocidad_sitio || 0);
      const minimo = requisitos.velocidad_subida_min_mbps;

      resultado.detalles.velocidad_sitio = {
        valor: velocidad,
        minimo: minimo,
        cumple: velocidad >= minimo
      };

      if (velocidad < minimo) {
        resultado.cumple = false;
        resultado.errores.push(
          `Velocidad internet sitio: ${velocidad}Mbps (mínimo: ${minimo}Mbps)`
        );
      }
    }

    // Validar tipo de conexión
    if (requisitos.tipos_conexion && requisitos.tipos_conexion.length > 0) {
      const tipo = conectividad.tipo_conexion || '';
      const tipoValido = requisitos.tipos_conexion.some(t =>
        this._normalizarTexto(tipo).includes(this._normalizarTexto(t))
      );

      resultado.detalles.tipo_conexion = {
        valor: tipo,
        validos: requisitos.tipos_conexion,
        cumple: tipoValido
      };

      if (!tipoValido) {
        resultado.warnings.push(
          `Tipo de conexión "${tipo}" no está en los tipos aceptados: ${requisitos.tipos_conexion.join(', ')}`
        );
      }
    }

    return resultado;
  }

  /**
   * Validar infraestructura (UPS, Generador, Aire Acondicionado)
   *
   * @param {Object} infraestructura - Datos de infraestructura
   * @param {Object} requisitos - Requisitos de infraestructura del pliego
   * @returns {Object} Resultado de validación
   */
  static validarInfraestructura(infraestructura, requisitos) {
    const resultado = {
      cumple: true,
      errores: [],
      warnings: [],
      detalles: {}
    };

    if (!requisitos) {
      return resultado;
    }

    // Validar UPS
    if (requisitos.ups_requerido) {
      const tieneUPS = infraestructura.tiene_ups === true ||
                       infraestructura.tiene_ups === 'Si' ||
                       infraestructura.tiene_ups === 'Sí';

      resultado.detalles.ups = {
        requerido: true,
        tiene: tieneUPS,
        cumple: tieneUPS
      };

      if (!tieneUPS) {
        resultado.cumple = false;
        resultado.errores.push('UPS requerido no presente');
      }

      // Validar capacidad UPS
      if (tieneUPS && requisitos.ups_capacidad_min_va) {
        const capacidad = parseFloat(infraestructura.ups_capacidad || 0);
        const minimo = requisitos.ups_capacidad_min_va;

        resultado.detalles.ups.capacidad = {
          valor: capacidad,
          minimo: minimo,
          cumple: capacidad >= minimo
        };

        if (capacidad < minimo) {
          resultado.warnings.push(
            `Capacidad UPS: ${capacidad}VA (mínimo recomendado: ${minimo}VA)`
          );
        }
      }
    }

    // Validar Generador
    if (requisitos.generador_requerido) {
      const tieneGenerador = infraestructura.tiene_generador === true ||
                             infraestructura.tiene_generador === 'Si' ||
                             infraestructura.tiene_generador === 'Sí';

      resultado.detalles.generador = {
        requerido: true,
        tiene: tieneGenerador,
        cumple: tieneGenerador
      };

      if (!tieneGenerador) {
        resultado.cumple = false;
        resultado.errores.push('Generador requerido no presente');
      }
    }

    // Validar Aire Acondicionado
    if (requisitos.aire_acondicionado_requerido) {
      const tieneAC = infraestructura.tiene_aire_acondicionado === true ||
                      infraestructura.tiene_aire_acondicionado === 'Si' ||
                      infraestructura.tiene_aire_acondicionado === 'Sí';

      resultado.detalles.aire_acondicionado = {
        requerido: true,
        tiene: tieneAC,
        cumple: tieneAC
      };

      if (!tieneAC) {
        resultado.cumple = false;
        resultado.errores.push('Aire acondicionado requerido no presente');
      }
    }

    return resultado;
  }

  /**
   * Validar lista completa de equipos
   *
   * @param {Array} equipos - Lista de equipos
   * @param {Object} pliego - Pliego completo
   * @returns {Object} Resumen de validación
   */
  static validarListaEquipos(equipos, pliego) {
    const resultados = {
      total: equipos.length,
      cumple: 0,
      no_cumple: 0,
      warnings: 0,
      equipos_validados: [],
      resumen: {
        errores_comunes: {},
        warnings_comunes: {}
      }
    };

    const requisitos = pliego.parque_informatico;

    equipos.forEach((equipo, index) => {
      const validacion = this.validarEquipo(equipo, requisitos);

      if (validacion.cumple) {
        resultados.cumple++;
      } else {
        resultados.no_cumple++;
      }

      if (validacion.warnings.length > 0) {
        resultados.warnings++;
      }

      // Agregar índice para referencia
      validacion.indice = index;
      validacion.nombre = equipo.nombre || equipo.usuario || `Equipo ${index + 1}`;

      resultados.equipos_validados.push(validacion);

      // Acumular errores y warnings comunes
      validacion.errores.forEach(error => {
        resultados.resumen.errores_comunes[error] =
          (resultados.resumen.errores_comunes[error] || 0) + 1;
      });

      validacion.warnings.forEach(warning => {
        resultados.resumen.warnings_comunes[warning] =
          (resultados.resumen.warnings_comunes[warning] || 0) + 1;
      });
    });

    // Calcular porcentaje de cumplimiento
    resultados.porcentaje_cumplimiento = resultados.total > 0
      ? Math.round((resultados.cumple / resultados.total) * 100)
      : 0;

    return resultados;
  }

  // ============================================================================
  // MÉTODOS PRIVADOS DE VALIDACIÓN ESPECÍFICA
  // ============================================================================

  /**
   * Validar procesador contra lista de aceptados
   * @private
   */
  static _validarProcesador(procesador, procesadores_aceptados) {
    const resultado = { cumple: false, motivo: '', detalles: {} };

    const cpuNormalizado = this._normalizarTexto(procesador);

    for (const proc of procesadores_aceptados) {
      const marca = this._normalizarTexto(proc.marca || '');
      const familiaMin = this._normalizarTexto(proc.familia_min || '');

      // Verificar si contiene la marca
      if (!cpuNormalizado.includes(marca)) {
        continue;
      }

      // Intel: Validar familia (i3, i5, i7, i9)
      if (marca === 'intel') {
        const match = cpuNormalizado.match(/i(\d)/);
        if (match) {
          const familia = parseInt(match[1]);
          const familiaMinNum = parseInt(familiaMin.replace('core i', '').replace('i', ''));

          if (proc.aceptar_superior) {
            if (familia >= familiaMinNum) {
              resultado.cumple = true;
              resultado.motivo = `${proc.marca} ${proc.familia_min} o superior`;
              return resultado;
            }
          } else {
            if (familia === familiaMinNum) {
              resultado.cumple = true;
              resultado.motivo = `${proc.marca} ${proc.familia_min}`;
              return resultado;
            }
          }
        }
      }

      // AMD: Validar familia (Ryzen 3, 5, 7, 9)
      if (marca === 'amd') {
        const match = cpuNormalizado.match(/ryzen\s*(\d)/);
        if (match) {
          const familia = parseInt(match[1]);
          const familiaMinNum = parseInt(familiaMin.replace('ryzen', '').trim());

          if (proc.aceptar_superior) {
            if (familia >= familiaMinNum) {
              resultado.cumple = true;
              resultado.motivo = `${proc.marca} ${proc.familia_min} o superior`;
              return resultado;
            }
          } else {
            if (familia === familiaMinNum) {
              resultado.cumple = true;
              resultado.motivo = `${proc.marca} ${proc.familia_min}`;
              return resultado;
            }
          }
        }
      }
    }

    resultado.motivo = `No cumple con ninguno de los procesadores aceptados: ${procesadores_aceptados.map(p => `${p.marca} ${p.familia_min}${p.aceptar_superior ? ' o superior' : ''}`).join(', ')}`;
    return resultado;
  }

  /**
   * Validar disco
   * @private
   */
  static _validarDisco(disco, discos_requisitos) {
    const resultado = { cumple: false, motivo: '', detalles: {} };

    const discoNormalizado = this._normalizarTexto(disco);

    for (const req of discos_requisitos) {
      const tipoRequerido = this._normalizarTexto(req.tipo || '');

      // Verificar tipo (SSD, HDD, etc.)
      if (!discoNormalizado.includes(tipoRequerido)) {
        continue;
      }

      // Extraer capacidad en GB
      const capacidad = this._parseCapacidad(disco);
      const minimo = req.capacidad_gb;

      resultado.detalles.capacidad = {
        valor: capacidad,
        minimo: minimo
      };

      if (capacidad >= minimo) {
        resultado.cumple = true;
        resultado.motivo = `${req.tipo} ${minimo}GB o superior`;
        return resultado;
      }
    }

    resultado.motivo = `Debe tener ${discos_requisitos.map(d => `${d.tipo} ${d.capacidad_gb}GB`).join(' o ')}`;
    return resultado;
  }

  /**
   * Validar sistema operativo
   * @private
   */
  static _validarSistemaOperativo(so, so_requerido, version_min) {
    const resultado = { cumple: true, motivo: '' };

    const soNormalizado = this._normalizarTexto(so);
    const requeridoNormalizado = this._normalizarTexto(so_requerido);

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
          resultado.motivo = `Versión mínima requerida: ${minVersion}`;
          return resultado;
        }
      }
    }

    resultado.motivo = 'Cumple con SO requerido';
    return resultado;
  }

  /**
   * Validar navegador
   * @private
   */
  static _validarNavegador(navegador, navegadores_aceptados) {
    const resultado = { cumple: false, motivo: '' };

    const navNormalizado = this._normalizarTexto(navegador);

    for (const nav of navegadores_aceptados) {
      const marcaNormalizada = this._normalizarTexto(nav.marca || '');

      if (navNormalizado.includes(marcaNormalizada)) {
        resultado.cumple = true;
        resultado.motivo = `Navegador aceptado: ${nav.marca}`;
        return resultado;
      }
    }

    resultado.motivo = `Navegadores aceptados: ${navegadores_aceptados.map(n => n.marca).join(', ')}`;
    return resultado;
  }

  // ============================================================================
  // MÉTODOS UTILITARIOS
  // ============================================================================

  /**
   * Normalizar texto para comparaciones
   * @private
   */
  static _normalizarTexto(texto) {
    if (!texto) return '';
    return texto.toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .trim();
  }

  /**
   * Parsear RAM de string a número en GB
   * @private
   */
  static _parseRAM(ramStr) {
    if (!ramStr) return 0;

    const str = ramStr.toString().toLowerCase();
    const match = str.match(/(\d+)\s*(gb|mb)?/);

    if (!match) return 0;

    let valor = parseInt(match[1]);
    const unidad = match[2];

    // Convertir MB a GB
    if (unidad === 'mb') {
      valor = valor / 1024;
    }

    return valor;
  }

  /**
   * Parsear capacidad de disco de string a GB
   * @private
   */
  static _parseCapacidad(discoStr) {
    if (!discoStr) return 0;

    const str = discoStr.toString().toLowerCase();
    const match = str.match(/(\d+)\s*(gb|tb|mb)?/);

    if (!match) return 0;

    let valor = parseInt(match[1]);
    const unidad = match[2];

    // Convertir a GB
    if (unidad === 'tb') {
      valor = valor * 1024;
    } else if (unidad === 'mb') {
      valor = valor / 1024;
    }

    return valor;
  }
}

module.exports = PliegoValidatorService;
