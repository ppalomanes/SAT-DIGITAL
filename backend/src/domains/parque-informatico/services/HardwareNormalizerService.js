/**
 * SAT-Digital Backend - Hardware Normalizer Service
 * Servicio para normalización y análisis de inventario de hardware
 * Replicación exacta del normalizador-procesadores con mejoras para IA
 */

const XLSX = require('xlsx');
const logger = require('../../../shared/utils/logger');

class HardwareNormalizerService {
  constructor() {
    // Reglas de validación por defecto (configurables)
    this.defaultValidationRules = {
      cpu: {
        minSpeedIntel: 3.0,
        minSpeedAMD: 3.7,
        supportedBrands: ['Intel', 'AMD'],
        supportedIntelModels: ['Core i3', 'Core i5', 'Core i7', 'Core i9', 'Xeon'],
        supportedAMDModels: ['Ryzen 3', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9', 'EPYC']
      },
      ram: {
        minSize: 16, // GB
        supportedTypes: ['DDR4', 'DDR5'],
        recommendedSizes: [8, 16, 32, 64]
      },
      storage: {
        minCapacity: 500, // GB
        preferredType: 'SSD',
        supportedTypes: ['HDD', 'SSD', 'NVMe'],
        minFreeSpace: 25 // porcentaje
      },
      network: {
        minDownloadSpeed: 15, // Mbps
        minUploadSpeed: 6, // Mbps
        supportedConnectionTypes: ['Cable', 'Fibra', '4G', 'Satelital'],
        preferredTypes: ['Cable', 'Fibra']
      },
      os: {
        supportedSystems: ['Windows 11', 'Windows 10'],
        preferredSystem: 'Windows 11',
        requiredArchitecture: '64-bit'
      }
    };
  }

  /**
   * Procesar archivo Excel con datos de hardware
   */
  async processExcelFile(fileBuffer, customRules = null) {
    try {
      const rules = customRules || this.defaultValidationRules;
      
      // Leer archivo Excel
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (!rawData || rawData.length === 0) {
        throw new Error('El archivo no contiene datos válidos');
      }

      logger.info(`Procesando ${rawData.length} registros de hardware`);

      // Normalizar datos
      const normalizedData = rawData.map((row, index) => {
        return this.normalizeHardwareRecord(row, index + 1, rules);
      });

      // Generar estadísticas
      const stats = this.generateStats(normalizedData, rules);

      // Generar recomendaciones
      const recommendations = this.generateRecommendations(stats, normalizedData);

      return {
        normalizedData,
        stats,
        recommendations,
        totalRecords: rawData.length,
        validRecords: normalizedData.filter(record => record.isValid).length,
        processedAt: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error procesando archivo Excel:', error);
      throw new Error(`Error al procesar archivo: ${error.message}`);
    }
  }

  /**
   * Normalizar un registro individual de hardware
   */
  normalizeHardwareRecord(rawRecord, recordIndex, rules) {
    try {
      const normalized = {
        // Metadatos
        recordId: recordIndex,
        auditId: this.generateAuditId(rawRecord),
        auditDate: new Date().toISOString().split('T')[0],
        auditCycle: this.getCurrentCycle(),
        auditVersion: 1,

        // Datos básicos
        proveedor: this.cleanText(rawRecord.Proveedor || ''),
        sitio: this.cleanText(rawRecord.Sitio || ''),
        atencion: this.normalizeAttentionType(rawRecord.Atención || rawRecord.Atencion || ''),
        usuarioId: this.normalizeUserId(rawRecord.Usuario || ''),
        hostname: this.cleanText(rawRecord.Hostname || ''),

        // Hardware - CPU
        ...this.normalizeCPU(rawRecord['Procesador (marca, modelo y velocidad)'] || rawRecord.Procesador || ''),
        
        // Hardware - RAM
        ...this.normalizeRAM(rawRecord.RAM || ''),
        
        // Hardware - Storage
        ...this.normalizeStorage(rawRecord.Disco || rawRecord.Almacenamiento || ''),
        
        // Software - OS
        ...this.normalizeOS(rawRecord['Sistema Operativo'] || rawRecord.OS || ''),
        
        // Software - Browser
        ...this.normalizeBrowser(rawRecord.Navegador || rawRecord.Browser || ''),
        
        // Periféricos
        ...this.normalizeHeadset(rawRecord.Headset || rawRecord.Auriculares || ''),
        
        // Red/Conectividad
        ...this.normalizeNetwork(rawRecord),
        
        // Seguridad
        ...this.normalizeAntivirus(rawRecord.Antivirus || ''),

        // Raw data para referencia
        rawData: rawRecord
      };

      // Validar contra reglas
      normalized.validation = this.validateRecord(normalized, rules);
      normalized.isValid = normalized.validation.isCompliant;
      normalized.complianceScore = normalized.validation.complianceScore;

      return normalized;

    } catch (error) {
      logger.error(`Error normalizando registro ${recordIndex}:`, error);
      return {
        recordId: recordIndex,
        error: error.message,
        isValid: false,
        complianceScore: 0,
        rawData: rawRecord
      };
    }
  }

  /**
   * Normalizar información de CPU
   */
  normalizeCPU(cpuString) {
    if (!cpuString) return { cpuBrand: '', cpuModel: '', cpuSpeedGHz: 0 };

    const cpu = cpuString.toString().trim();
    
    // Extraer marca
    let cpuBrand = '';
    if (/intel/i.test(cpu)) cpuBrand = 'Intel';
    else if (/amd/i.test(cpu)) cpuBrand = 'AMD';

    // Extraer modelo
    let cpuModel = '';
    const intelModelMatch = cpu.match(/(Core\s+i[3579]|Xeon|Pentium|Celeron)/i);
    const amdModelMatch = cpu.match(/(Ryzen\s+[3579]|EPYC|Athlon|FX)/i);
    
    if (intelModelMatch) cpuModel = intelModelMatch[1];
    else if (amdModelMatch) cpuModel = amdModelMatch[1];

    // Extraer velocidad en GHz
    let cpuSpeedGHz = 0;
    const speedMatch = cpu.match(/(\d+\.?\d*)\s*GHz/i);
    if (speedMatch) {
      cpuSpeedGHz = parseFloat(speedMatch[1]);
    }

    return {
      cpuBrand: this.cleanText(cpuBrand),
      cpuModel: this.cleanText(cpuModel),
      cpuSpeedGHz: cpuSpeedGHz,
      cpuRaw: cpu
    };
  }

  /**
   * Normalizar información de RAM
   */
  normalizeRAM(ramString) {
    if (!ramString) return { ramGB: 0, ramType: '' };

    const ram = ramString.toString().trim();
    
    // Extraer tamaño en GB
    let ramGB = 0;
    const gbMatch = ram.match(/(\d+)\s*(GB|Gb)/i);
    if (gbMatch) {
      ramGB = parseInt(gbMatch[1]);
    }

    // Extraer tipo
    let ramType = '';
    if (/DDR5/i.test(ram)) ramType = 'DDR5';
    else if (/DDR4/i.test(ram)) ramType = 'DDR4';
    else if (/DDR3/i.test(ram)) ramType = 'DDR3';

    return {
      ramGB: ramGB,
      ramType: ramType,
      ramRaw: ram
    };
  }

  /**
   * Normalizar información de almacenamiento
   */
  normalizeStorage(storageString) {
    if (!storageString) return { diskType: '', diskCapacityGB: 0 };

    const storage = storageString.toString().trim();
    
    // Extraer tipo
    let diskType = '';
    if (/SSD|NVMe/i.test(storage)) diskType = 'SSD';
    else if (/HDD/i.test(storage)) diskType = 'HDD';

    // Extraer capacidad
    let diskCapacityGB = 0;
    const tbMatch = storage.match(/(\d+\.?\d*)\s*(TB|Tb)/i);
    const gbMatch = storage.match(/(\d+\.?\d*)\s*(GB|Gb)/i);
    
    if (tbMatch) {
      diskCapacityGB = Math.round(parseFloat(tbMatch[1]) * 1024);
    } else if (gbMatch) {
      diskCapacityGB = parseInt(gbMatch[1]);
    }

    return {
      diskType: diskType,
      diskCapacityGB: diskCapacityGB,
      diskRaw: storage
    };
  }

  /**
   * Normalizar sistema operativo
   */
  normalizeOS(osString) {
    if (!osString) return { osName: '', osVersion: '' };

    const os = osString.toString().trim();
    
    let osName = '';
    let osVersion = '';

    if (/Windows\s*11/i.test(os)) {
      osName = 'Windows 11';
      const versionMatch = os.match(/(\d+H\d+|\d+\.\d+)/i);
      if (versionMatch) osVersion = versionMatch[1];
    } else if (/Windows\s*10/i.test(os)) {
      osName = 'Windows 10';
      const versionMatch = os.match(/(\d+H\d+|\d+\.\d+)/i);
      if (versionMatch) osVersion = versionMatch[1];
    }

    return {
      osName: osName,
      osVersion: osVersion,
      osRaw: os
    };
  }

  /**
   * Normalizar información de navegador
   */
  normalizeBrowser(browserString) {
    if (!browserString) return { browserName: '', browserVersion: '' };

    const browser = browserString.toString().trim();
    
    let browserName = '';
    let browserVersion = '';

    if (/Chrome/i.test(browser)) {
      browserName = 'Chrome';
      const versionMatch = browser.match(/Chrome\/?([\d.]+)/i);
      if (versionMatch) browserVersion = versionMatch[1];
    } else if (/Edge/i.test(browser)) {
      browserName = 'Edge';
      const versionMatch = browser.match(/Edge\/?([\d.]+)/i);
      if (versionMatch) browserVersion = versionMatch[1];
    } else if (/Firefox/i.test(browser)) {
      browserName = 'Firefox';
      const versionMatch = browser.match(/Firefox\/?([\d.]+)/i);
      if (versionMatch) browserVersion = versionMatch[1];
    }

    return {
      browserName: browserName,
      browserVersion: browserVersion,
      browserRaw: browser
    };
  }

  /**
   * Normalizar información de headset
   */
  normalizeHeadset(headsetString) {
    if (!headsetString) return { headsetBrand: '', headsetModel: '' };

    const headset = headsetString.toString().trim();
    
    let headsetBrand = '';
    let headsetModel = '';

    // Marcas comunes
    const brands = ['Logitech', 'Jabra', 'Plantronics', 'Sennheiser', 'HyperX'];
    
    for (const brand of brands) {
      if (new RegExp(brand, 'i').test(headset)) {
        headsetBrand = brand;
        // Extraer modelo (todo después de la marca)
        const modelMatch = headset.match(new RegExp(`${brand}\\s+(.+)`, 'i'));
        if (modelMatch) headsetModel = modelMatch[1].trim();
        break;
      }
    }

    return {
      headsetBrand: headsetBrand,
      headsetModel: headsetModel,
      headsetRaw: headset
    };
  }

  /**
   * Normalizar información de red
   */
  normalizeNetwork(rawRecord) {
    const result = {
      ispName: this.cleanText(rawRecord['Nombre ISP'] || rawRecord.ISP || ''),
      connectionType: this.cleanText(rawRecord['Tipo de conexión'] || rawRecord.ConnectionType || ''),
      speedDownloadMbps: this.extractSpeed(rawRecord['Velocidad Down'] || rawRecord.DownloadSpeed || ''),
      speedUploadMbps: this.extractSpeed(rawRecord['Velocidad Up'] || rawRecord.UploadSpeed || '')
    };

    // Normalizar tipo de conexión
    const connType = result.connectionType.toLowerCase();
    if (connType.includes('fibra')) result.connectionType = 'Fibra';
    else if (connType.includes('cable')) result.connectionType = 'Cable';
    else if (connType.includes('4g') || connType.includes('móvil')) result.connectionType = '4G';
    else if (connType.includes('satelital')) result.connectionType = 'Satelital';

    return result;
  }

  /**
   * Normalizar información de antivirus
   */
  normalizeAntivirus(antivirusString) {
    if (!antivirusString) return { antivirusBrand: '', antivirusModel: '' };

    const antivirus = antivirusString.toString().trim();
    
    let antivirusBrand = '';
    let antivirusModel = '';

    const brands = ['Bitdefender', 'Kaspersky', 'Norton', 'McAfee', 'Avast', 'AVG', 'Windows Defender'];
    
    for (const brand of brands) {
      if (new RegExp(brand, 'i').test(antivirus)) {
        antivirusBrand = brand;
        // Extraer modelo/versión
        const modelMatch = antivirus.match(new RegExp(`${brand}\\s+(.+)`, 'i'));
        if (modelMatch) antivirusModel = modelMatch[1].trim();
        break;
      }
    }

    return {
      antivirusBrand: antivirusBrand,
      antivirusModel: antivirusModel,
      antivirusRaw: antivirus
    };
  }

  /**
   * Validar registro contra reglas
   */
  validateRecord(record, rules) {
    const violations = [];
    let complianceScore = 100;

    // Validar CPU
    if (record.cpuBrand === 'Intel' && record.cpuSpeedGHz < rules.cpu.minSpeedIntel) {
      violations.push(`CPU Intel con velocidad ${record.cpuSpeedGHz}GHz inferior al mínimo ${rules.cpu.minSpeedIntel}GHz`);
      complianceScore -= 15;
    }
    if (record.cpuBrand === 'AMD' && record.cpuSpeedGHz < rules.cpu.minSpeedAMD) {
      violations.push(`CPU AMD con velocidad ${record.cpuSpeedGHz}GHz inferior al mínimo ${rules.cpu.minSpeedAMD}GHz`);
      complianceScore -= 15;
    }

    // Validar RAM
    if (record.ramGB < rules.ram.minSize) {
      violations.push(`RAM ${record.ramGB}GB inferior al mínimo ${rules.ram.minSize}GB`);
      complianceScore -= 20;
    }

    // Validar almacenamiento
    if (record.diskCapacityGB < rules.storage.minCapacity) {
      violations.push(`Capacidad de disco ${record.diskCapacityGB}GB inferior al mínimo ${rules.storage.minCapacity}GB`);
      complianceScore -= 15;
    }

    // Validar red
    if (record.speedDownloadMbps < rules.network.minDownloadSpeed) {
      violations.push(`Velocidad de descarga ${record.speedDownloadMbps}Mbps inferior al mínimo ${rules.network.minDownloadSpeed}Mbps`);
      complianceScore -= 10;
    }

    // Validar OS
    if (!rules.os.supportedSystems.includes(record.osName)) {
      violations.push(`Sistema operativo ${record.osName} no está en la lista de sistemas soportados`);
      complianceScore -= 15;
    }

    return {
      isCompliant: violations.length === 0,
      violations: violations,
      complianceScore: Math.max(0, complianceScore)
    };
  }

  /**
   * Generar estadísticas completas
   */
  generateStats(normalizedData, rules) {
    const total = normalizedData.length;
    const valid = normalizedData.filter(r => r.isValid).length;

    return {
      overview: {
        totalRecords: total,
        validRecords: valid,
        invalidRecords: total - valid,
        averageComplianceScore: this.calculateAverage(normalizedData, 'complianceScore'),
        complianceRate: total > 0 ? (valid / total * 100).toFixed(2) : 0
      },
      
      hardware: {
        cpu: this.generateCPUStats(normalizedData, rules),
        ram: this.generateRAMStats(normalizedData, rules),
        storage: this.generateStorageStats(normalizedData, rules)
      },
      
      software: {
        os: this.generateOSStats(normalizedData),
        browser: this.generateBrowserStats(normalizedData)
      },
      
      network: this.generateNetworkStats(normalizedData, rules),
      
      compliance: {
        byProvider: this.generateProviderCompliance(normalizedData),
        bySite: this.generateSiteCompliance(normalizedData),
        topViolations: this.getTopViolations(normalizedData)
      }
    };
  }

  /**
   * Generar estadísticas de CPU
   */
  generateCPUStats(data, rules) {
    const cpuData = data.filter(r => r.cpuSpeedGHz > 0);
    
    return {
      totalRecords: cpuData.length,
      averageSpeed: this.calculateAverage(cpuData, 'cpuSpeedGHz'),
      brandDistribution: this.getDistribution(cpuData, 'cpuBrand'),
      modelDistribution: this.getDistribution(cpuData, 'cpuModel'),
      complianceRate: this.calculateComplianceRate(cpuData, (record) => {
        if (record.cpuBrand === 'Intel') return record.cpuSpeedGHz >= rules.cpu.minSpeedIntel;
        if (record.cpuBrand === 'AMD') return record.cpuSpeedGHz >= rules.cpu.minSpeedAMD;
        return false;
      })
    };
  }

  /**
   * Generar estadísticas de RAM
   */
  generateRAMStats(data, rules) {
    const ramData = data.filter(r => r.ramGB > 0);
    
    return {
      totalRecords: ramData.length,
      averageSize: this.calculateAverage(ramData, 'ramGB'),
      sizeDistribution: this.getDistribution(ramData, 'ramGB'),
      typeDistribution: this.getDistribution(ramData, 'ramType'),
      complianceRate: this.calculateComplianceRate(ramData, (record) => record.ramGB >= rules.ram.minSize)
    };
  }

  /**
   * Generar estadísticas de almacenamiento
   */
  generateStorageStats(data, rules) {
    const storageData = data.filter(r => r.diskCapacityGB > 0);
    
    return {
      totalRecords: storageData.length,
      averageCapacity: this.calculateAverage(storageData, 'diskCapacityGB'),
      typeDistribution: this.getDistribution(storageData, 'diskType'),
      capacityDistribution: this.getCapacityDistribution(storageData),
      ssdPercentage: this.calculatePercentage(storageData, (record) => record.diskType === 'SSD'),
      complianceRate: this.calculateComplianceRate(storageData, (record) => record.diskCapacityGB >= rules.storage.minCapacity)
    };
  }

  // Métodos utilitarios
  cleanText(text) {
    return typeof text === 'string' ? text.trim() : '';
  }

  extractSpeed(speedString) {
    if (!speedString) return 0;
    const match = speedString.toString().match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  }

  normalizeAttentionType(attention) {
    const att = attention.toLowerCase();
    if (att.includes('presencial')) return 'Presencial';
    if (att.includes('remoto')) return 'Remoto';
    return attention;
  }

  normalizeUserId(userId) {
    const match = userId.toString().match(/u\d+/i);
    return match ? match[0] : userId;
  }

  generateAuditId(rawRecord) {
    const cycle = this.getCurrentCycle();
    const provider = this.cleanText(rawRecord.Proveedor || 'Unknown');
    return `${cycle}_${provider}`;
  }

  getCurrentCycle() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const semester = month <= 6 ? 'S1' : 'S2';
    return `${year}-${semester}`;
  }

  calculateAverage(data, field) {
    if (!data.length) return 0;
    const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0);
    return (sum / data.length).toFixed(2);
  }

  getDistribution(data, field) {
    const counts = {};
    data.forEach(item => {
      const value = item[field] || 'Unknown';
      counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
  }

  calculateComplianceRate(data, predicate) {
    if (!data.length) return 0;
    const compliant = data.filter(predicate).length;
    return ((compliant / data.length) * 100).toFixed(2);
  }

  calculatePercentage(data, predicate) {
    if (!data.length) return 0;
    const matching = data.filter(predicate).length;
    return ((matching / data.length) * 100).toFixed(2);
  }

  getCapacityDistribution(data) {
    const ranges = {
      '< 500GB': 0,
      '500GB - 1TB': 0,
      '1TB - 2TB': 0,
      '> 2TB': 0
    };

    data.forEach(item => {
      const capacity = item.diskCapacityGB;
      if (capacity < 500) ranges['< 500GB']++;
      else if (capacity < 1024) ranges['500GB - 1TB']++;
      else if (capacity < 2048) ranges['1TB - 2TB']++;
      else ranges['> 2TB']++;
    });

    return ranges;
  }

  generateProviderCompliance(data) {
    const providers = {};
    data.forEach(record => {
      const provider = record.proveedor || 'Unknown';
      if (!providers[provider]) {
        providers[provider] = { total: 0, compliant: 0 };
      }
      providers[provider].total++;
      if (record.isValid) providers[provider].compliant++;
    });

    Object.keys(providers).forEach(provider => {
      const p = providers[provider];
      p.complianceRate = p.total > 0 ? ((p.compliant / p.total) * 100).toFixed(2) : 0;
    });

    return providers;
  }

  generateSiteCompliance(data) {
    const sites = {};
    data.forEach(record => {
      const site = record.sitio || 'Unknown';
      if (!sites[site]) {
        sites[site] = { total: 0, compliant: 0 };
      }
      sites[site].total++;
      if (record.isValid) sites[site].compliant++;
    });

    Object.keys(sites).forEach(site => {
      const s = sites[site];
      s.complianceRate = s.total > 0 ? ((s.compliant / s.total) * 100).toFixed(2) : 0;
    });

    return sites;
  }

  getTopViolations(data) {
    const violationCounts = {};
    
    data.forEach(record => {
      if (record.validation && record.validation.violations) {
        record.validation.violations.forEach(violation => {
          violationCounts[violation] = (violationCounts[violation] || 0) + 1;
        });
      }
    });

    return Object.entries(violationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([violation, count]) => ({ violation, count }));
  }

  generateOSStats(data) {
    return {
      distribution: this.getDistribution(data, 'osName'),
      versionDistribution: this.getDistribution(data, 'osVersion')
    };
  }

  generateBrowserStats(data) {
    return {
      distribution: this.getDistribution(data, 'browserName'),
      versionDistribution: this.getDistribution(data, 'browserVersion')
    };
  }

  generateNetworkStats(data, rules) {
    const networkData = data.filter(r => r.speedDownloadMbps > 0);
    
    return {
      averageDownloadSpeed: this.calculateAverage(networkData, 'speedDownloadMbps'),
      averageUploadSpeed: this.calculateAverage(networkData, 'speedUploadMbps'),
      connectionTypeDistribution: this.getDistribution(networkData, 'connectionType'),
      ispDistribution: this.getDistribution(networkData, 'ispName'),
      speedComplianceRate: this.calculateComplianceRate(networkData, (record) => 
        record.speedDownloadMbps >= rules.network.minDownloadSpeed && 
        record.speedUploadMbps >= rules.network.minUploadSpeed
      )
    };
  }

  /**
   * Generar recomendaciones basadas en el análisis
   */
  generateRecommendations(stats, data) {
    const recommendations = [];

    // Recomendaciones de hardware
    if (parseFloat(stats.hardware.cpu.complianceRate) < 80) {
      recommendations.push({
        category: 'Hardware',
        priority: 'High',
        title: 'Actualizar CPUs por debajo del estándar',
        description: `${100 - parseFloat(stats.hardware.cpu.complianceRate)}% de los CPUs no cumplen los requisitos mínimos de velocidad`,
        action: 'Considerar actualización de procesadores Intel a 3.0GHz+ y AMD a 3.7GHz+'
      });
    }

    if (parseFloat(stats.hardware.ram.complianceRate) < 80) {
      recommendations.push({
        category: 'Hardware',
        priority: 'High',
        title: 'Incrementar memoria RAM',
        description: `${100 - parseFloat(stats.hardware.ram.complianceRate)}% de los equipos tienen menos de 16GB de RAM`,
        action: 'Actualizar equipos a mínimo 16GB de RAM DDR4'
      });
    }

    if (parseFloat(stats.hardware.storage.ssdPercentage) < 70) {
      recommendations.push({
        category: 'Hardware',
        priority: 'Medium',
        title: 'Migrar a almacenamiento SSD',
        description: `Solo ${stats.hardware.storage.ssdPercentage}% de los equipos usan SSD`,
        action: 'Reemplazar discos HDD por SSD para mejorar rendimiento'
      });
    }

    // Recomendaciones de red
    if (parseFloat(stats.network.speedComplianceRate) < 90) {
      recommendations.push({
        category: 'Network',
        priority: 'Medium',
        title: 'Mejorar conectividad de red',
        description: `${100 - parseFloat(stats.network.speedComplianceRate)}% de conexiones no cumplen velocidad mínima`,
        action: 'Verificar y mejorar conexiones de internet a 15Mbps down / 6Mbps up mínimo'
      });
    }

    return recommendations;
  }
}

module.exports = HardwareNormalizerService;