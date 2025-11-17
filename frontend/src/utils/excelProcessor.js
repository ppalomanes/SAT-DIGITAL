import * as XLSX from 'xlsx';
import { validarHeadsetHomologado } from './headsetsHomologados';

// Funciones de normalización de hardware (adaptadas del normalizador)
export const processExcelFile = async (arrayBuffer, validationRules = {}) => {
  try {
    // Leer el archivo Excel
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convertir a JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (jsonData.length === 0) {
      throw new Error('El archivo no contiene datos válidos');
    }

    // Procesar y normalizar los datos
    const normalizedData = [];
    const stats = {
      totalRecords: jsonData.length,
      equiposCumplen: 0,
      equiposNoCumplen: 0,
      porcentajeCumplimiento: 0,
      procesadorStats: { passed: 0, failed: 0, details: [] },
      memoriaStats: { passed: 0, failed: 0, details: [] },
      almacenamientoStats: { passed: 0, failed: 0, details: [] },
      errors: []
    };

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        // Normalizar cada registro
        const normalizedRecord = await normalizeRecord(row, validationRules);
        
        // Actualizar estadísticas
        updateStats(stats, normalizedRecord);
        
        normalizedData.push(normalizedRecord);
        
      } catch (error) {
        stats.errors.push(`Fila ${i + 1}: ${error.message}`);
      }
    }

    // Calcular estadísticas finales de conformidad total
    stats.equiposCumplen = normalizedData.filter(record => record.cumpleRequisitos === true || record.cumpleRequisitos === 'Sí').length;
    stats.equiposNoCumplen = normalizedData.filter(record => record.cumpleRequisitos === false || record.cumpleRequisitos === 'No').length;
    stats.porcentajeCumplimiento = stats.totalRecords > 0 ?
      Math.round((stats.equiposCumplen / stats.totalRecords) * 100) : 0;

    return {
      normalizedData,
      stats,
      originalData: jsonData
    };

  } catch (error) {
    throw new Error(`Error al procesar el archivo: ${error.message}`);
  }
};

// Función auxiliar para buscar columnas con nombres flexibles
const findColumnValue = (record, keywords) => {
  // Buscar coincidencia exacta primero
  for (const key of keywords) {
    if (record[key] !== undefined) {
      return record[key];
    }
  }

  // Buscar coincidencia parcial (columnas con paréntesis y descripciones)
  const recordKeys = Object.keys(record);
  for (const keyword of keywords) {
    const foundKey = recordKeys.find(k =>
      k.toLowerCase().includes(keyword.toLowerCase())
    );
    if (foundKey && record[foundKey] !== undefined) {
      return record[foundKey];
    }
  }

  return '';
};

// Normalizar un registro individual
const normalizeRecord = async (record, validationRules) => {
  const normalized = {
    // Campos básicos
    proveedor: findColumnValue(record, ['Proveedor']),
    sitio: findColumnValue(record, ['Sitio', 'Site']),
    atencion: findColumnValue(record, ['Atención', 'Atencion', 'Tipo']),
    usuario: findColumnValue(record, ['Usuario', 'User', 'TECO']),
    hostname: findColumnValue(record, ['Hostname', 'Host', 'Equipo', 'PC']),

    // Procesador - buscar por palabra clave "Procesador" o "CPU"
    procesadorOriginal: findColumnValue(record, ['Procesador', 'CPU', 'Processor']),
    procesadorNormalizado: '',
    procesadorMarca: '',
    procesadorModelo: '',
    procesadorVelocidad: 0,
    procesadorNucleos: 0,

    // Memoria - buscar por "RAM" o "Memoria"
    memoriaOriginal: findColumnValue(record, ['RAM', 'Memoria', 'Memory']),
    memoriaNormalizada: '',
    memoriaCapacidad: 0,
    memoriaTipo: '',

    // Almacenamiento - buscar columnas de capacidad y tipo
    almacenamientoCapacidadOriginal: findColumnValue(record, ['Disco (Capacidad', 'Disco', 'Almacenamiento', 'Storage', 'Capacidad']),
    almacenamientoTipoOriginal: findColumnValue(record, ['Disco ( Tipo', 'Tipo [HDD', 'Tipo']),
    almacenamientoOriginal: '', // Se construirá combinando capacidad y tipo
    almacenamientoNormalizado: '',
    almacenamientoCapacidad: 0, // Capacidad comercial redondeada
    almacenamientoCapacidadReal: 0, // Capacidad real del archivo
    almacenamientoTipo: '',

    // Sistema Operativo
    sistemaOperativoOriginal: findColumnValue(record, ['Sistema Operativo', 'SO', 'OS', 'Windows']),
    sistemaOperativoNormalizado: '',

    // Navegador
    navegadorOriginal: findColumnValue(record, ['Navegador', 'Browser']),
    navegadorNormalizado: '',

    // Headset
    headsetOriginal: findColumnValue(record, ['Headset', 'Auriculares']),
    headsetNormalizado: '',

    // Conectividad (para teletrabajo)
    isp: findColumnValue(record, ['Nombre ISP', 'ISP', 'Proveedor Internet']),
    tipoConexion: findColumnValue(record, ['Tipo de conexión', 'Tipo conexión', 'Tecnología', 'Conexión']),
    velocidadDown: findColumnValue(record, ['Velocidad Down', 'Download', 'Bajada', 'Down']),
    velocidadUp: findColumnValue(record, ['Velocidad Up', 'Upload', 'Subida', 'Up']),

    // Seguridad
    antivirus: findColumnValue(record, ['Antivirus', 'Antimalware', 'Seguridad']),

    // Estado de validación
    cumpleRequisitos: false,
    observaciones: [],
    esTeletrabajo: false
  };

  // Normalizar procesador
  normalized.procesadorNormalizado = normalizeProcesador(normalized.procesadorOriginal);
  const procesadorInfo = extractProcessorInfo(normalized.procesadorNormalizado);
  normalized.procesadorMarca = procesadorInfo.marca;
  normalized.procesadorModelo = procesadorInfo.modelo;
  normalized.procesadorVelocidad = procesadorInfo.velocidad;
  normalized.procesadorNucleos = procesadorInfo.nucleos;

  // Normalizar memoria
  const memoriaInfo = normalizeMemoria(normalized.memoriaOriginal);
  normalized.memoriaNormalizada = memoriaInfo.normalized;
  normalized.memoriaCapacidad = memoriaInfo.capacidadComercial || memoriaInfo.capacidad; // Usar capacidad comercial
  normalized.memoriaTipo = memoriaInfo.tipo;

  // Combinar columnas de almacenamiento si están separadas
  if (!normalized.almacenamientoOriginal && (normalized.almacenamientoCapacidadOriginal || normalized.almacenamientoTipoOriginal)) {
    // Combinar capacidad y tipo en un solo string para normalización
    const capacidad = normalized.almacenamientoCapacidadOriginal || '';
    const tipo = normalized.almacenamientoTipoOriginal || '';
    normalized.almacenamientoOriginal = `${capacidad} ${tipo}`.trim();
  }

  // Normalizar almacenamiento
  const almacenamientoInfo = normalizeAlmacenamiento(normalized.almacenamientoOriginal);
  normalized.almacenamientoNormalizado = almacenamientoInfo.normalized;
  normalized.almacenamientoCapacidad = almacenamientoInfo.capacidadComercial || almacenamientoInfo.capacidad; // Usar capacidad comercial
  normalized.almacenamientoCapacidadReal = almacenamientoInfo.capacidad; // Guardar capacidad real también
  normalized.almacenamientoTipo = almacenamientoInfo.tipo;

  // Normalizar sistema operativo
  normalized.sistemaOperativoNormalizado = normalizeSistemaOperativo(normalized.sistemaOperativoOriginal);

  // Normalizar navegador
  normalized.navegadorNormalizado = normalizeNavegador(normalized.navegadorOriginal);

  // Normalizar headset
  normalized.headsetNormalizado = normalizeHeadset(normalized.headsetOriginal);

  // Detectar si es teletrabajo (HO = teletrabajo, OS = presencial)
  normalized.esTeletrabajo = (normalized.atencion === 'HO');

  // Procesar conectividad solo para teletrabajo
  if (normalized.esTeletrabajo) {
    // Limpiar y convertir velocidades (manejar "104 mb", "110", etc.)
    normalized.velocidadDown = parseVelocidad(normalized.velocidadDown);
    normalized.velocidadUp = parseVelocidad(normalized.velocidadUp);
  }

  // Verificar cumplimiento de requisitos
  const cumpleRequisitos = checkRequirements(normalized, validationRules);
  normalized.cumpleRequisitos = cumpleRequisitos ? 'Sí' : 'No';

  return normalized;
};

// Función auxiliar para parsear velocidades
const parseVelocidad = (velocidad) => {
  if (!velocidad) return 0;

  // Convertir a string y limpiar
  const velocidadStr = velocidad.toString().toLowerCase().trim();

  // Extraer número de strings como "104 mb", "110", etc.
  const match = velocidadStr.match(/(\d+[\.,]?\d*)/i);
  if (match) {
    return parseFloat(match[1].replace(',', '.'));
  }

  return 0;
};

// Normalizar información del procesador
const normalizeProcesador = (processorString) => {
  if (!processorString) return '';
  
  let normalized = processorString
    .replace(/Intel\(R\)\s*/gi, 'Intel ')
    .replace(/Core\(TM\)\s*/gi, 'Core ')
    .replace(/CPU\s*@\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
    
  return normalized;
};

// Extraer información del procesador
const extractProcessorInfo = (processorString) => {
  const info = {
    marca: '',
    modelo: '',
    velocidad: 0,
    nucleos: 0
  };
  
  if (!processorString) return info;
  
  // Extraer marca
  const procLower = processorString.toLowerCase();

  // Detectar Intel: por palabra completa O por prefijos i3/i5/i7/i9
  if (procLower.includes('intel') || /\bi[3579]-/.test(procLower)) {
    info.marca = 'Intel';
  }
  // Detectar AMD: por palabra completa O por Ryzen
  else if (procLower.includes('amd') || procLower.includes('ryzen')) {
    info.marca = 'AMD';
  }
  
  // Extraer velocidad (GHz)
  const velocidadMatch = processorString.match(/(\d+\.?\d*)\s*GHz/i);
  if (velocidadMatch) {
    info.velocidad = parseFloat(velocidadMatch[1]);
  }
  
  // Extraer modelo (simplificado)
  const modeloMatch = processorString.match(/(i\d-\d+|Ryzen\s+\d+\s+\d+|Xeon.*?E\d+-\d+)/i);
  if (modeloMatch) {
    info.modelo = modeloMatch[1];
  }
  
  // Estimar núcleos basado en el modelo (aproximación)
  if (info.modelo.includes('i3')) info.nucleos = 4;
  else if (info.modelo.includes('i5')) info.nucleos = 6;
  else if (info.modelo.includes('i7')) info.nucleos = 8;
  else if (info.modelo.includes('i9')) info.nucleos = 12;
  else if (processorString.toLowerCase().includes('quad')) info.nucleos = 4;
  else if (processorString.toLowerCase().includes('dual')) info.nucleos = 2;
  else info.nucleos = 4; // default
  
  return info;
};

// Función para redondear memoria RAM a capacidades comerciales estándar
const roundToCommercialRAM = (capacityGB) => {
  // Capacidades comerciales de RAM ordenadas de menor a mayor
  const commercialTiers = [2, 4, 8, 16, 32, 64, 128, 256, 512];

  // Si es exactamente igual a un tier, devolverlo
  if (commercialTiers.includes(capacityGB)) {
    return capacityGB;
  }

  // Redondear al tier comercial más cercano
  // Para valores como 7.84 GB (8 GB real menos overhead), redondear hacia arriba
  for (const tier of commercialTiers) {
    if (capacityGB < tier) {
      return tier;
    }
  }

  // Para capacidades muy grandes, redondear hacia arriba
  return Math.ceil(capacityGB / 64) * 64;
};

// Normalizar memoria
const normalizeMemoria = (memoriaString) => {
  const info = {
    normalized: '',
    capacidad: 0,
    capacidadComercial: 0,
    tipo: ''
  };

  if (!memoriaString) return info;

  // Manejar diferentes tipos de input
  let memoriaStr = '';
  if (typeof memoriaString === 'number') {
    // Si es número (como 4096, 8192), convertir de MB a GB
    if (memoriaString >= 1024) {
      info.capacidad = memoriaString / 1024;
      memoriaStr = `${info.capacidad}GB`;
    } else {
      info.capacidad = memoriaString;
      memoriaStr = `${memoriaString}GB`;
    }
  } else {
    memoriaStr = memoriaString.toString().trim();

    // Extraer capacidad - soportar números decimales también
    const capacidadMatch = memoriaStr.match(/(\d+[\.,]?\d*)\s*(?:GB|Gb|gb)?/i);
    if (capacidadMatch) {
      // Convertir comas a puntos para parseFloat
      const capacidadStr = capacidadMatch[1].replace(',', '.');
      info.capacidad = parseFloat(capacidadStr);
    }
  }

  // Redondear a capacidad comercial
  if (info.capacidad > 0) {
    info.capacidadComercial = roundToCommercialRAM(info.capacidad);
    // Usar capacidad comercial para el valor normalizado
    info.normalized = `${info.capacidadComercial} GB`;
  } else {
    info.normalized = memoriaStr;
  }

  // Extraer tipo - asumimos DDR4 por defecto ya que el archivo no especifica tipo
  if (memoriaStr.toLowerCase().includes('ddr4')) {
    info.tipo = 'DDR4';
  } else if (memoriaStr.toLowerCase().includes('ddr3')) {
    info.tipo = 'DDR3';
  } else if (memoriaStr.toLowerCase().includes('ddr5')) {
    info.tipo = 'DDR5';
  } else {
    // Asumir DDR4 como estándar actual para equipos sin especificación
    info.tipo = 'DDR4';
  }

  return info;
};

// Función para redondear a capacidades comerciales estándar
const roundToCommercialCapacity = (capacityGB) => {
  // Capacidades comerciales ordenadas de menor a mayor
  const commercialTiers = [32, 64, 120, 128, 240, 250, 256, 480, 500, 512, 1000, 1024, 2000, 2048, 4000, 4096, 8000, 8192];

  // Si es exactamente igual a un tier, devolverlo
  if (commercialTiers.includes(capacityGB)) {
    return capacityGB;
  }

  // Buscar la primera capacidad comercial mayor que la capacidad actual (redondeo hacia arriba)
  for (const tier of commercialTiers) {
    if (capacityGB < tier) {
      return tier;
    }
  }

  // Para capacidades muy grandes (> 8192), redondear al siguiente múltiplo de 1024 (TB)
  return Math.ceil(capacityGB / 1024) * 1024;
};

// Normalizar almacenamiento
const normalizeAlmacenamiento = (almacenamientoString) => {
  const info = {
    normalized: '',
    capacidad: 0,
    capacidadComercial: 0,
    tipo: ''
  };

  if (!almacenamientoString) return info;

  const almacenamientoStr = almacenamientoString.toString().trim();
  info.normalized = almacenamientoStr;

  // Extraer capacidad - soportar diferentes formatos:
  // "465 HDD", "238 SSD", "250GB", "1 TB", "931.51 GB"

  // Primero buscar TB
  let capacidadMatch = almacenamientoStr.match(/(\d+[\.,]?\d*)\s*(?:TB|Tb|tb)/i);
  if (capacidadMatch) {
    const capacidadStr = capacidadMatch[1].replace(',', '.');
    info.capacidad = parseFloat(capacidadStr) * 1024; // Convertir TB a GB
  } else {
    // Buscar GB
    capacidadMatch = almacenamientoStr.match(/(\d+[\.,]?\d*)\s*(?:GB|Gb|gb)/i);
    if (capacidadMatch) {
      const capacidadStr = capacidadMatch[1].replace(',', '.');
      info.capacidad = parseFloat(capacidadStr);
    } else {
      // Buscar números seguidos de HDD/SSD (formato TLPF: "465 HDD", "238 SSD")
      capacidadMatch = almacenamientoStr.match(/(\d+[\.,]?\d*)\s*(?:HDD|SSD|hdd|ssd)/i);
      if (capacidadMatch) {
        const capacidadStr = capacidadMatch[1].replace(',', '.');
        info.capacidad = parseFloat(capacidadStr);
      } else {
        // Buscar solo números seguidos de texto (formato CAT: "250GB" sin espacio)
        capacidadMatch = almacenamientoStr.match(/(\d+[\.,]?\d*)(?:GB|gb)?/i);
        if (capacidadMatch) {
          const capacidadStr = capacidadMatch[1].replace(',', '.');
          info.capacidad = parseFloat(capacidadStr);
        }
      }
    }
  }

  // Extraer tipo - diferentes formatos por proveedor
  const almacenamientoLower = almacenamientoStr.toLowerCase();
  if (almacenamientoLower.includes('ssd')) {
    info.tipo = 'SSD';
  } else if (almacenamientoLower.includes('hdd')) {
    info.tipo = 'HDD';
  } else if (almacenamientoLower.includes('nvme')) {
    info.tipo = 'NVMe';
  } else {
    // Lógica para inferir tipo basado en capacidad y proveedor
    // SSDs típicamente <= 1TB, HDDs típicamente >= 500GB
    if (info.capacidad <= 512) {
      info.tipo = 'SSD';
    } else {
      info.tipo = 'HDD';
    }
  }

  // Redondear a capacidad comercial estándar y actualizar valor normalizado
  if (info.capacidad > 0) {
    info.capacidadComercial = roundToCommercialCapacity(info.capacidad);
    // Actualizar valor normalizado con capacidad comercial
    if (info.capacidadComercial >= 1024) {
      // Convertir a TB si es >= 1TB
      const capacidadTB = info.capacidadComercial / 1024;
      info.normalized = `${capacidadTB} TB ${info.tipo}`.trim();
    } else {
      info.normalized = `${info.capacidadComercial} GB ${info.tipo}`.trim();
    }
  }

  return info;
};

// Verificar cumplimiento de requisitos flexibles
const checkRequirements = (record, validationRules) => {
  if (!validationRules) return true;

  let cumple = true;

  // Verificar procesador
  if (validationRules.procesador) {
    // Verificar marca si está especificada
    if (validationRules.procesador.marcasAceptadas && validationRules.procesador.marcasAceptadas.length > 0) {
      const marcaValida = validationRules.procesador.marcasAceptadas.some(marca =>
        record.procesadorMarca.toLowerCase().includes(marca.toLowerCase())
      );
      if (!marcaValida) {
        cumple = false;
        record.observaciones.push(`Marca de procesador no aceptada: ${record.procesadorMarca} (aceptadas: ${validationRules.procesador.marcasAceptadas.join(', ')})`);
      }
    }

    // Verificar velocidad mínima
    if (validationRules.procesador.velocidadMinima &&
        record.procesadorVelocidad < validationRules.procesador.velocidadMinima) {
      cumple = false;
      record.observaciones.push(`Velocidad de procesador insuficiente: ${record.procesadorVelocidad}GHz < ${validationRules.procesador.velocidadMinima}GHz`);
    }

    // Verificar núcleos mínimos
    if (validationRules.procesador.nucleosMinimos &&
        record.procesadorNucleos < validationRules.procesador.nucleosMinimos) {
      cumple = false;
      record.observaciones.push(`Núcleos de procesador insuficientes: ${record.procesadorNucleos} < ${validationRules.procesador.nucleosMinimos}`);
    }
  }

  // Verificar memoria
  if (validationRules.memoria) {
    if (validationRules.memoria.capacidadMinima &&
        record.memoriaCapacidad < validationRules.memoria.capacidadMinima) {
      cumple = false;
      record.observaciones.push(`Capacidad de memoria insuficiente: ${record.memoriaCapacidad}GB < ${validationRules.memoria.capacidadMinima}GB`);
    }

    // Verificar tipo de memoria si está especificado
    if (validationRules.memoria.tiposAceptados && validationRules.memoria.tiposAceptados.length > 0) {
      const tipoValido = validationRules.memoria.tiposAceptados.includes(record.memoriaTipo);
      if (!tipoValido) {
        record.observaciones.push(`Tipo de memoria no recomendado: ${record.memoriaTipo} (recomendados: ${validationRules.memoria.tiposAceptados.join(', ')})`);
      }
    }
  }

  // Verificar almacenamiento con múltiples opciones válidas
  if (validationRules.almacenamiento && validationRules.almacenamiento.opcionesValidas) {
    const opcionValida = validationRules.almacenamiento.opcionesValidas.some(opcion => {
      return opcion.tipo === record.almacenamientoTipo &&
             record.almacenamientoCapacidad >= opcion.capacidadMinima;
    });

    if (!opcionValida) {
      cumple = false;
      const opcionesTexto = validationRules.almacenamiento.opcionesValidas
        .map(op => `${op.tipo} ${op.capacidadMinima}GB`)
        .join(' o ');
      record.observaciones.push(`Almacenamiento insuficiente: ${record.almacenamientoTipo} ${record.almacenamientoCapacidad}GB (requerido: ${opcionesTexto})`);
    }
  }

  // Verificar sistema operativo
  if (validationRules.sistemaOperativo) {
    if (validationRules.sistemaOperativo.versionesAceptadas && validationRules.sistemaOperativo.versionesAceptadas.length > 0) {
      const versionValida = validationRules.sistemaOperativo.versionesAceptadas.some(version =>
        record.sistemaOperativoNormalizado.includes(version)
      );
      if (!versionValida) {
        cumple = false;
        record.observaciones.push(`Versión de SO no aceptada: ${record.sistemaOperativoNormalizado} (aceptadas: ${validationRules.sistemaOperativo.versionesAceptadas.join(', ')})`);
      }
    }
  }

  // Verificar conectividad para teletrabajo
  if (record.esTeletrabajo && validationRules.conectividad && validationRules.conectividad.tecnologias) {
    const tipoConexion = record.tipoConexion || 'Desconocido';
    const tecnologiaEncontrada = validationRules.conectividad.tecnologias.find(tech =>
      tipoConexion.toLowerCase().includes(tech.tipo.toLowerCase())
    );

    if (tecnologiaEncontrada) {
      if (record.velocidadDown < tecnologiaEncontrada.velocidadMinimaDown) {
        cumple = false;
        record.observaciones.push(`Velocidad de descarga insuficiente para ${tecnologiaEncontrada.tipo}: ${record.velocidadDown}Mbps < ${tecnologiaEncontrada.velocidadMinimaDown}Mbps`);
      }

      if (record.velocidadUp < tecnologiaEncontrada.velocidadMinimaUp) {
        cumple = false;
        record.observaciones.push(`Velocidad de subida insuficiente para ${tecnologiaEncontrada.tipo}: ${record.velocidadUp}Mbps < ${tecnologiaEncontrada.velocidadMinimaUp}Mbps`);
      }
    }
  }

  // Verificar headset homologado
  if (validationRules.headset && validationRules.headset.validacionEstricta) {
    const headsetInfo = extractHeadsetInfo(record.headsetNormalizado);

    if (!validarHeadsetHomologado(headsetInfo.marca, headsetInfo.modelo)) {
      cumple = false;
      record.observaciones.push(`Headset no homologado: ${record.headsetNormalizado} (debe estar en lista oficial de ${validationRules.headset.modelosHomologados?.length || 0} modelos)`);
    }

    // Verificar tipo de conexión si está especificado
    if (validationRules.headset.tiposConexion && validationRules.headset.tiposConexion.length > 0) {
      const tipoConexionValido = validationRules.headset.tiposConexion.some(tipo =>
        record.headsetNormalizado.toLowerCase().includes(tipo.toLowerCase())
      );

      if (!tipoConexionValido) {
        record.observaciones.push(`Tipo de conexión de headset no permitido (permitidos: ${validationRules.headset.tiposConexion.join(', ')})`);
      }
    }
  }

  return cumple;
};

// Actualizar estadísticas
const updateStats = (stats, record) => {
  // Las estadísticas de cumplimiento individual se calculan en base al resultado total
  // ya que el cumplimiento debe ser de TODOS los requisitos simultáneamente

  // Solo actualizar contadores de componentes individuales para análisis detallado
  // pero el cumplimiento final se basa en record.cumpleRequisitos

  // Estadísticas de procesador para análisis
  if (record.procesadorVelocidad > 0) {
    if (record.procesadorVelocidad >= 2.0 && record.procesadorMarca && record.procesadorMarca.length > 0) {
      stats.procesadorStats.passed++;
    } else {
      stats.procesadorStats.failed++;
    }
  }

  // Estadísticas de memoria para análisis
  if (record.memoriaCapacidad > 0) {
    if (record.memoriaCapacidad >= 8) {
      stats.memoriaStats.passed++;
    } else {
      stats.memoriaStats.failed++;
    }
  }

  // Estadísticas de almacenamiento para análisis
  if (record.almacenamientoCapacidad > 0) {
    if (record.almacenamientoCapacidad >= 256) {
      stats.almacenamientoStats.passed++;
    } else {
      stats.almacenamientoStats.failed++;
    }
  }
};

// Normalizar sistema operativo
const normalizeSistemaOperativo = (sistemaString) => {
  if (!sistemaString) return '';

  let normalized = sistemaString.trim();

  // Detectar Windows
  if (normalized.toLowerCase().includes('windows 11')) {
    return 'Windows 11';
  } else if (normalized.toLowerCase().includes('windows 10')) {
    return 'Windows 10';
  } else if (normalized.toLowerCase().includes('windows')) {
    return 'Windows';
  }

  return normalized;
};

// Normalizar navegador
const normalizeNavegador = (navegadorString) => {
  if (!navegadorString) return '';

  let normalized = navegadorString.trim();

  // Extraer navegador principal
  if (normalized.toLowerCase().includes('chrome')) {
    // Extraer versión si está disponible
    const versionMatch = normalized.match(/versión\s*(\d+)/i);
    if (versionMatch) {
      return `Chrome ${versionMatch[1]}`;
    }
    return 'Chrome';
  } else if (normalized.toLowerCase().includes('firefox')) {
    return 'Firefox';
  } else if (normalized.toLowerCase().includes('edge')) {
    return 'Edge';
  }

  return normalized;
};

// Extraer información del headset (marca y modelo)
const extractHeadsetInfo = (headsetString) => {
  const info = {
    marca: '',
    modelo: ''
  };

  if (!headsetString) return info;

  const headsetStr = headsetString.toLowerCase().trim();

  // Extraer marca basada en patrones conocidos
  if (headsetStr.includes('jabra')) {
    info.marca = 'Jabra';
  } else if (headsetStr.includes('plantronics')) {
    info.marca = 'Plantronics';
  } else if (headsetStr.includes('logitech')) {
    info.marca = 'Logitech';
  } else if (headsetStr.includes('imicro')) {
    info.marca = 'IMICRO';
  } else if (headsetStr.includes('accutone')) {
    info.marca = 'Accutone';
  } else if (headsetStr.includes('diqsa')) {
    info.marca = 'Diqsa';
  } else if (headsetStr.includes('noga')) {
    info.marca = 'Noga';
  } else if (headsetStr.includes('eurocase')) {
    info.marca = 'Eurocase';
  }

  // El modelo es básicamente todo el string normalizado
  info.modelo = headsetString.trim();

  return info;
};

// Normalizar headset
const normalizeHeadset = (headsetString) => {
  if (!headsetString) return '';

  let normalized = headsetString.trim();

  // Detectar marcas comunes y normalizar
  if (normalized.toLowerCase().includes('imicro')) {
    return `Imicro ${normalized.split(' ')[1] || ''}`.trim();
  } else if (normalized.toLowerCase().includes('logitech')) {
    return normalized;
  } else if (normalized.toLowerCase().includes('plantronics')) {
    return normalized;
  } else if (normalized.toLowerCase().includes('jabra')) {
    return normalized;
  }

  return normalized;
};