import * as XLSX from 'xlsx';

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

    return {
      normalizedData,
      stats,
      originalData: jsonData
    };

  } catch (error) {
    throw new Error(`Error al procesar el archivo: ${error.message}`);
  }
};

// Normalizar un registro individual
const normalizeRecord = async (record, validationRules) => {
  const normalized = {
    // Campos originales
    hostname: record.Hostname || record.hostname || record.Host || '',
    
    // Procesador
    procesadorOriginal: record['Procesador (marca, modelo y velocidad)'] || 
                       record.Procesador || record.CPU || record.Processor || '',
    procesadorNormalizado: '',
    procesadorMarca: '',
    procesadorModelo: '',
    procesadorVelocidad: 0,
    procesadorNucleos: 0,
    
    // Memoria
    memoriaOriginal: record.RAM || record.Memoria || record.Memory || '',
    memoriaNormalizada: '',
    memoriaCapacidad: 0,
    memoriaTipo: '',
    
    // Almacenamiento
    almacenamientoOriginal: record.Almacenamiento || record.Storage || record.Disco || '',
    almacenamientoNormalizado: '',
    almacenamientoCapacidad: 0,
    almacenamientoTipo: '',
    
    // Estado de validación
    cumpleRequisitos: false,
    observaciones: []
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
  normalized.memoriaCapacidad = memoriaInfo.capacidad;
  normalized.memoriaTipo = memoriaInfo.tipo;

  // Normalizar almacenamiento
  const almacenamientoInfo = normalizeAlmacenamiento(normalized.almacenamientoOriginal);
  normalized.almacenamientoNormalizado = almacenamientoInfo.normalized;
  normalized.almacenamientoCapacidad = almacenamientoInfo.capacidad;
  normalized.almacenamientoTipo = almacenamientoInfo.tipo;

  // Verificar cumplimiento de requisitos
  normalized.cumpleRequisitos = checkRequirements(normalized, validationRules);
  
  return normalized;
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
  if (processorString.toLowerCase().includes('intel')) {
    info.marca = 'Intel';
  } else if (processorString.toLowerCase().includes('amd')) {
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

// Normalizar memoria
const normalizeMemoria = (memoriaString) => {
  const info = {
    normalized: '',
    capacidad: 0,
    tipo: ''
  };
  
  if (!memoriaString) return info;
  
  info.normalized = memoriaString.trim();
  
  // Extraer capacidad
  const capacidadMatch = memoriaString.match(/(\d+)\s*GB/i);
  if (capacidadMatch) {
    info.capacidad = parseInt(capacidadMatch[1]);
  }
  
  // Extraer tipo
  if (memoriaString.toLowerCase().includes('ddr4')) {
    info.tipo = 'DDR4';
  } else if (memoriaString.toLowerCase().includes('ddr3')) {
    info.tipo = 'DDR3';
  } else if (memoriaString.toLowerCase().includes('ddr5')) {
    info.tipo = 'DDR5';
  }
  
  return info;
};

// Normalizar almacenamiento
const normalizeAlmacenamiento = (almacenamientoString) => {
  const info = {
    normalized: '',
    capacidad: 0,
    tipo: ''
  };
  
  if (!almacenamientoString) return info;
  
  info.normalized = almacenamientoString.trim();
  
  // Extraer capacidad
  let capacidadMatch = almacenamientoString.match(/(\d+)\s*GB/i);
  if (capacidadMatch) {
    info.capacidad = parseInt(capacidadMatch[1]);
  } else {
    capacidadMatch = almacenamientoString.match(/(\d+)\s*TB/i);
    if (capacidadMatch) {
      info.capacidad = parseInt(capacidadMatch[1]) * 1024; // Convertir TB a GB
    }
  }
  
  // Extraer tipo
  if (almacenamientoString.toLowerCase().includes('ssd')) {
    info.tipo = 'SSD';
  } else if (almacenamientoString.toLowerCase().includes('hdd')) {
    info.tipo = 'HDD';
  } else if (almacenamientoString.toLowerCase().includes('nvme')) {
    info.tipo = 'NVMe';
  }
  
  return info;
};

// Verificar cumplimiento de requisitos
const checkRequirements = (record, validationRules) => {
  if (!validationRules) return true;
  
  let cumple = true;
  
  // Verificar procesador
  if (validationRules.procesador) {
    if (validationRules.procesador.velocidadMinima && 
        record.procesadorVelocidad < validationRules.procesador.velocidadMinima) {
      cumple = false;
      record.observaciones.push(`Velocidad de procesador insuficiente: ${record.procesadorVelocidad}GHz < ${validationRules.procesador.velocidadMinima}GHz`);
    }
    
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
  }
  
  // Verificar almacenamiento
  if (validationRules.almacenamiento) {
    if (validationRules.almacenamiento.capacidadMinima && 
        record.almacenamientoCapacidad < validationRules.almacenamiento.capacidadMinima) {
      cumple = false;
      record.observaciones.push(`Capacidad de almacenamiento insuficiente: ${record.almacenamientoCapacidad}GB < ${validationRules.almacenamiento.capacidadMinima}GB`);
    }
  }
  
  return cumple;
};

// Actualizar estadísticas
const updateStats = (stats, record) => {
  // Estadísticas de procesador
  if (record.procesadorVelocidad > 0) {
    if (record.cumpleRequisitos) {
      stats.procesadorStats.passed++;
    } else {
      stats.procesadorStats.failed++;
    }
  }
  
  // Estadísticas de memoria
  if (record.memoriaCapacidad > 0) {
    if (record.memoriaCapacidad >= 8) { // Mínimo base
      stats.memoriaStats.passed++;
    } else {
      stats.memoriaStats.failed++;
    }
  }
  
  // Estadísticas de almacenamiento
  if (record.almacenamientoCapacidad > 0) {
    if (record.almacenamientoCapacidad >= 256) { // Mínimo base
      stats.almacenamientoStats.passed++;
    } else {
      stats.almacenamientoStats.failed++;
    }
  }
};