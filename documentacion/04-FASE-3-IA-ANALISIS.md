# SAT-Digital: Fase 3 - IA y Análisis Automático  
## 🤖 AUTOMATIZACIÓN INTELIGENTE

> **Fase:** 3 de 4  
> **Duración estimada:** 2-3 meses  
> **Estado:** ⏳ Pendiente (requiere Fase 2 completada)  
> **Archivo anterior:** 03-FASE-2-GESTION-AUDITORIAS.md  
> **Próximo archivo:** 05-FASE-4-VISITAS-REPORTES.md  
> **Prerequisitos:** ✅ Fase 2 completada + Ollama instalado y configurado

---

## 🎯 OBJETIVOS DE LA FASE 3

Esta fase integra inteligencia artificial local (Ollama) para automatizar el análisis de documentos, extracción de datos técnicos, validación de umbrales, y generación de puntajes preliminares. Es la fase que convierte al sistema de manual a inteligente.

### **Objetivos Específicos:**
1. **Integración completa con Ollama** para procesamiento local de documentos
2. **Análisis automático por tipo de documento** (PDF, Excel, imágenes) 
3. **Extracción de datos técnicos estructurados** según secciones de auditoría
4. **Sistema de puntajes automáticos** basado en umbrales técnicos
5. **Generación de recomendaciones automáticas** por incumplimientos detectados
6. **Queue de procesamiento** para manejar trabajos pesados sin bloquear UI
7. **Dashboard de análisis IA** para auditores con validación y ajustes

---

## 📋 CHECKPOINTS DE LA FASE 3

### **Checkpoint 3.1: Configuración e Integración Ollama (Semana 1-2)**
**Criterios de éxito:**
- [ ] Ollama instalado y funcionando correctamente en el servidor
- [ ] Modelos LLaVA (visión) y Llama 3.1 (texto) descargados y operativos
- [ ] API de conexión con Ollama implementada y probada
- [ ] Sistema de health check para monitorear estado de Ollama
- [ ] Configuración de memoria y recursos optimizada

**Entregables:**
- Servicio de integración con Ollama completamente funcional
- Scripts de instalación y configuración automatizados
- Documentación técnica de setup de IA
- Tests de conectividad y rendimiento

**Validación:**
```
Criterio: El sistema debe poder:
1. Conectarse exitosamente a Ollama local
2. Procesar una consulta de texto simple en < 10 segundos
3. Analizar una imagen básica con LLaVA en < 30 segundos
4. Manejar errores de conexión de forma elegante
5. Reportar estado de salud de los modelos
```

### **Checkpoint 3.2: Procesamiento de Documentos PDF (Semana 2-4)**
**Criterios de éxito:**
- [ ] Conversión automática de PDF a texto estructurado
- [ ] Extracción de información específica por sección técnica
- [ ] Identificación de tablas, datos numéricos y fechas
- [ ] Procesamiento de PDFs con imágenes embebidas
- [ ] Sistema de caché para evitar reprocesar documentos idénticos

**Entregables:**
- Motor de procesamiento PDF con IA integrada
- Extractores específicos por tipo de documento técnico
- Sistema de caché inteligente por hash de documento
- Reportes de calidad de extracción

**Validación:**
```
Criterio: Dado un PDF de topología de red, el sistema debe:
1. Extraer automáticamente equipos de red mencionados
2. Identificar direcciones IP, VLANs, y configuraciones
3. Detectar fechas de última actualización
4. Generar resumen estructurado en JSON
5. Asignar nivel de confianza a cada extracción
```

### **Checkpoint 3.3: Análisis de Parque Informático Excel (Semana 3-5)**
**Criterios de éxito:**
- [ ] Lectura automática de archivos Excel con validación de estructura
- [ ] Extracción de datos técnicos de equipos (CPU, RAM, OS, etc.)
- [ ] Validación automática contra umbrales técnicos configurados
- [ ] Conteo automático de equipos OS/HO con detección de inconsistencias
- [ ] Generación de reportes de cumplimiento por equipo

**Entregables:**
- Analizador automático de parque informático
- Sistema de validación de umbrales configurable
- Generador de reportes de incumplimientos
- Dashboard de estadísticas de parque informático

**Validación:**
```
Criterio: Dado un Excel de parque informático, el sistema debe:
1. Validar que Intel Core i5 3.2GHz cumple umbral mínimo
2. Detectar que 8GB RAM no cumple (mínimo 16GB)
3. Identificar Windows 10 como incumplimiento (requiere Windows 11)
4. Contar correctamente equipos OS vs HO
5. Generar reporte con % de cumplimiento por categoría
```

### **Checkpoint 3.4: Procesamiento de Imágenes con LLaVA (Semana 4-6)**
**Criterios de éxito:**
- [ ] Análisis automático de fotografías del cuarto de tecnología
- [ ] Identificación de equipos de red, servidores, y cableado
- [ ] Detección de problemas visuales (cables desordenados, equipos dañados)
- [ ] Extracción de información de etiquetas y pantallas
- [ ] Validación de cumplimiento de normas visuales

**Entregables:**
- Analizador de imágenes con LLaVA integrado
- Detectores de problemas visuales comunes
- Sistema de extracción de texto de imágenes (OCR con IA)
- Generador de reportes visuales con anotaciones

**Validación:**
```
Criterio: Dada una foto del cuarto de tecnología, el sistema debe:
1. Identificar tipos de equipos presentes (switches, routers, servidores)
2. Detectar si hay cables desordenados o fuera de canaletas
3. Verificar presencia de etiquetado en equipos
4. Evaluar limpieza y organización general
5. Generar score de cumplimiento visual (1-100)
```

### **Checkpoint 3.5: Sistema de Puntajes y Recomendaciones (Semana 5-7)**
**Criterios de éxito:**
- [ ] Motor de puntajes configurable por sección técnica
- [ ] Algoritmo de ponderación por criticidad de incumplimientos
- [ ] Generación automática de recomendaciones específicas
- [ ] Sistema de alertas para incumplimientos críticos
- [ ] Comparación con benchmarks históricos y de la industria

**Entregables:**
- Motor de scoring automático configurable
- Generador de recomendaciones contextuales
- Sistema de alertas por criticidad
- Dashboard de análisis comparativo

**Validación:**
```
Criterio: El motor de puntajes debe:
1. Asignar peso mayor a incumplimientos de seguridad críticos
2. Generar recomendación específica: "Actualizar 15 equipos a Windows 11"
3. Calcular puntaje ponderado considerando todas las secciones
4. Comparar contra promedios históricos del proveedor
5. Alertar automáticamente si puntaje < 70%
```

### **Checkpoint 3.6: Queue y Performance (Semana 6-8)**
**Criterios de éxito:**
- [ ] Sistema de cola de procesamiento para trabajos pesados implementado
- [ ] Procesamiento en background sin bloquear interfaz de usuario
- [ ] Monitoreo de uso de recursos (CPU, memoria, GPU)
- [ ] Sistema de prioridades para procesamiento urgente
- [ ] Métricas de tiempo de procesamiento por tipo de documento

**Entregables:**
- Sistema de queue con Bull/Agenda configurado
- Monitor de recursos y rendimiento
- Dashboard de estadísticas de procesamiento IA
- Sistema de priorización de trabajos

**Validación:**
```
Criterio: El sistema de queue debe:
1. Procesar múltiples documentos simultáneamente sin bloqueo
2. Priorizar análisis de documentos con fecha límite próxima
3. Monitorear uso de memoria y alertar si excede 80%
4. Completar análisis de 50 documentos en menos de 2 horas
5. Recuperarse automáticamente de fallos de Ollama
```

---

## 🤖 ARQUITECTURA DE INTEGRACIÓN CON IA

### **Componentes Principales**

```
IAModule/
├── controllers/
│   ├── AnalisisController.js        # Endpoints de análisis
│   ├── OllamaController.js         # Gestión de Ollama
│   └── PuntajesController.js       # Sistema de scoring
├── services/
│   ├── OllamaService.js            # Integración principal con Ollama
│   ├── DocumentProcessor.js        # Procesamiento por tipo
│   ├── ImageAnalyzer.js            # Análisis de imágenes con LLaVA
│   ├── ExcelAnalyzer.js            # Análisis de hojas de cálculo
│   ├── ScoringEngine.js            # Motor de puntajes
│   └── RecommendationService.js    # Generador de recomendaciones
├── models/
│   ├── AnalisisIA.js               # Resultados de análisis
│   ├── UmbralTecnico.js            # Configuración de umbrales
│   └── RecomendacionIA.js          # Recomendaciones generadas
├── queue/
│   ├── documentQueue.js            # Cola de procesamiento
│   ├── workers/                    # Workers especializados
│   │   ├── pdfWorker.js
│   │   ├── excelWorker.js
│   │   └── imageWorker.js
└── utils/
    ├── ollamaClient.js             # Cliente HTTP para Ollama
    ├── promptTemplates.js          # Plantillas de prompts
    └── performanceMonitor.js       # Monitor de rendimiento
```

### **Base de Datos - Módulo de IA**

**Tabla: analisis_ia**
```sql
CREATE TABLE analisis_ia (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  documento_id INT NOT NULL,
  tipo_analisis ENUM('pdf_texto', 'excel_parque', 'imagen_visual', 'texto_libre') NOT NULL,
  modelo_usado VARCHAR(50) NOT NULL, -- 'llama3.1', 'llava', etc.
  prompt_utilizado TEXT NOT NULL,
  resultado_bruto JSON NOT NULL, -- Respuesta completa de Ollama
  datos_estructurados JSON NULL, -- Datos extraídos y estructurados
  nivel_confianza DECIMAL(5,2) DEFAULT 0, -- 0-100%
  tiempo_procesamiento INT NOT NULL, -- En milisegundos
  recursos_utilizados JSON, -- CPU, memoria usada
  estado_analisis ENUM('pendiente', 'procesando', 'completado', 'error') DEFAULT 'pendiente',
  error_mensaje TEXT NULL,
  validado_por_auditor BOOLEAN DEFAULT FALSE,
  ajustes_auditor JSON NULL, -- Correcciones manuales
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (documento_id) REFERENCES documentos(id),
  INDEX idx_documento_tipo (documento_id, tipo_analisis),
  INDEX idx_estado_fecha (estado_analisis, created_at)
);
```

**Tabla: umbrales_tecnicos**
```sql
CREATE TABLE umbrales_tecnicos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  seccion_codigo VARCHAR(20) NOT NULL,
  categoria VARCHAR(50) NOT NULL, -- 'procesador', 'ram', 'disco', etc.
  criterio VARCHAR(100) NOT NULL,
  valor_minimo VARCHAR(255), -- Valores mínimos aceptables
  valor_recomendado VARCHAR(255), -- Valores recomendados
  tipo_validacion ENUM('numerico', 'texto', 'regex', 'lista') NOT NULL,
  patron_validacion TEXT, -- Regex o lista de valores válidos
  peso_puntaje DECIMAL(3,2) DEFAULT 1.00, -- Peso en puntaje final
  criticidad ENUM('baja', 'media', 'alta', 'critica') DEFAULT 'media',
  mensaje_incumplimiento TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_seccion_activo (seccion_codigo, activo)
);
```

**Tabla: recomendaciones_ia**
```sql
CREATE TABLE recomendaciones_ia (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  auditoria_id INT NOT NULL,
  seccion_id INT NOT NULL,
  analisis_id BIGINT NOT NULL,
  tipo_recomendacion ENUM('mejora', 'correccion', 'actualizacion', 'mantenimiento') NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  prioridad ENUM('baja', 'media', 'alta', 'urgente') NOT NULL,
  impacto_estimado ENUM('bajo', 'medio', 'alto') NOT NULL,
  costo_estimado ENUM('bajo', 'medio', 'alto', 'muy_alto') NULL,
  tiempo_implementacion_dias INT NULL,
  equipos_afectados JSON, -- Lista de equipos específicos
  estado_recomendacion ENUM('generada', 'revisada', 'aprobada', 'rechazada', 'implementada') DEFAULT 'generada',
  validada_por_auditor BOOLEAN DEFAULT FALSE,
  notas_auditor TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (auditoria_id) REFERENCES auditorias(id),
  FOREIGN KEY (seccion_id) REFERENCES secciones_tecnicas(id),
  FOREIGN KEY (analisis_id) REFERENCES analisis_ia(id)
);
```

---

## 🔌 SERVICIO DE INTEGRACIÓN CON OLLAMA

### **Cliente de Conexión Ollama**

```javascript
// backend/src/domains/ia/utils/ollamaClient.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs').promises;

class OllamaClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || 'http://localhost:11434';
    this.timeout = config.timeout || 300000; // 5 minutos por defecto
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Configurar interceptores para logging y retry
    this.setupInterceptors();
  }

  /**
   * Verificar que Ollama está funcionando
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/api/tags');
      const modelos = response.data.models || [];
      
      return {
        status: 'healthy',
        models: modelos.map(m => ({
          name: m.name,
          size: m.size,
          modified_at: m.modified_at
        })),
        version: response.headers['ollama-version'] || 'unknown'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        models: []
      };
    }
  }

  /**
   * Generar respuesta de texto con Llama
   */
  async generateText(modelo, prompt, options = {}) {
    try {
      const startTime = Date.now();
      
      const requestBody = {
        model: modelo,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.1, // Más determinístico
          top_p: options.top_p || 0.9,
          num_predict: options.max_tokens || 2000,
          ...options.ollama_options
        }
      };

      const response = await this.client.post('/api/generate', requestBody);
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        content: response.data.response,
        model: modelo,
        processing_time_ms: processingTime,
        tokens_generated: response.data.eval_count || 0,
        tokens_per_second: response.data.eval_count ? 
          (response.data.eval_count / (processingTime / 1000)).toFixed(2) : 0,
        metadata: {
          eval_duration: response.data.eval_duration,
          load_duration: response.data.load_duration,
          total_duration: response.data.total_duration
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        model: modelo,
        processing_time_ms: Date.now() - startTime
      };
    }
  }

  /**
   * Analizar imagen con LLaVA
   */
  async analyzeImage(rutaImagen, prompt, options = {}) {
    try {
      const startTime = Date.now();
      
      // Leer imagen y convertir a base64
      const imageBuffer = await fs.readFile(rutaImagen);
      const imageBase64 = imageBuffer.toString('base64');

      const requestBody = {
        model: 'llava:latest',
        prompt: prompt,
        images: [imageBase64],
        stream: false,
        options: {
          temperature: options.temperature || 0.1,
          ...options.ollama_options
        }
      };

      const response = await this.client.post('/api/generate', requestBody);
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        content: response.data.response,
        model: 'llava:latest',
        processing_time_ms: processingTime,
        image_path: rutaImagen,
        tokens_generated: response.data.eval_count || 0,
        metadata: response.data
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        model: 'llava:latest',
        image_path: rutaImagen,
        processing_time_ms: Date.now() - startTime
      };
    }
  }

  /**
   * Configurar interceptores para manejo de errores y logging
   */
  setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🤖 Ollama Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Ollama Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ Ollama Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Ollama Response Error:', error.response?.status, error.message);
        
        // Reintentar automáticamente para algunos errores
        if (error.response?.status === 503 && !error.config._retry) {
          error.config._retry = true;
          console.log('🔄 Reintentando request a Ollama...');
          return this.client.request(error.config);
        }
        
        return Promise.reject(error);
      }
    );
  }
}

module.exports = OllamaClient;
```

### **Servicio Principal de IA**

```javascript
// backend/src/domains/ia/services/OllamaService.js
const OllamaClient = require('../utils/ollamaClient');
const PromptTemplates = require('../utils/promptTemplates');
const PerformanceMonitor = require('../utils/performanceMonitor');
const { AnalisisIA, UmbralTecnico } = require('../../../shared/database/models');

class OllamaService {
  constructor() {
    this.client = new OllamaClient({
      baseURL: process.env.OLLAMA_URL || 'http://localhost:11434',
      timeout: 300000 // 5 minutos
    });
    
    this.performanceMonitor = new PerformanceMonitor();
  }

  /**
   * Analizar documento PDF de topología de red
   */
  async analizarTopologiaPDF(documentoId, rutaPDF, contenidoTexto) {
    try {
      this.performanceMonitor.start(`analisis_topologia_${documentoId}`);

      const prompt = PromptTemplates.generarPromptTopologia(contenidoTexto);
      
      const resultado = await this.client.generateText('llama3.1:latest', prompt, {
        temperature: 0.1,
        max_tokens: 3000
      });

      if (!resultado.success) {
        throw new Error(`Error en Ollama: ${resultado.error}`);
      }

      // Extraer datos estructurados de la respuesta
      const datosEstructurados = this.extraerDatosTopologia(resultado.content);

      // Guardar análisis en base de datos
      const analisis = await AnalisisIA.create({
        documento_id: documentoId,
        tipo_analisis: 'pdf_texto',
        modelo_usado: 'llama3.1:latest',
        prompt_utilizado: prompt,
        resultado_bruto: { response: resultado.content, metadata: resultado.metadata },
        datos_estructurados: datosEstructurados,
        nivel_confianza: this.calcularNivelConfianza(datosEstructurados),
        tiempo_procesamiento: resultado.processing_time_ms,
        recursos_utilizados: this.performanceMonitor.getResourceUsage(),
        estado_analisis: 'completado'
      });

      this.performanceMonitor.end(`analisis_topologia_${documentoId}`);

      return {
        analisis_id: analisis.id,
        datos_extraidos: datosEstructurados,
        tiempo_procesamiento: resultado.processing_time_ms,
        nivel_confianza: analisis.nivel_confianza,
        requiere_revision: analisis.nivel_confianza < 80
      };

    } catch (error) {
      console.error('Error analizando topología PDF:', error);
      
      // Registrar error en base de datos
      await AnalisisIA.create({
        documento_id: documentoId,
        tipo_analisis: 'pdf_texto',
        modelo_usado: 'llama3.1:latest',
        resultado_bruto: {},
        estado_analisis: 'error',
        error_mensaje: error.message,
        tiempo_procesamiento: this.performanceMonitor.end(`analisis_topologia_${documentoId}`)
      });

      throw error;
    }
  }

  /**
   * Analizar parque informático desde Excel
   */
  async analizarParqueInformatico(documentoId, datosExcel, umbralConfig) {
    try {
      this.performanceMonitor.start(`analisis_parque_${documentoId}`);

      const equipos = datosExcel.equipos;
      const resultadosAnalisis = [];
      const incumplimientos = [];
      const recomendaciones = [];

      // Obtener umbrales configurados
      const umbrales = await UmbralTecnico.findAll({
        where: { seccion_codigo: 'parque_informatico', activo: true }
      });

      for (const equipo of equipos) {
        const analisisEquipo = await this.analizarEquipoIndividual(equipo, umbrales);
        resultadosAnalisis.push(analisisEquipo);

        if (analisisEquipo.incumplimientos.length > 0) {
          incumplimientos.push(...analisisEquipo.incumplimientos);
        }

        if (analisisEquipo.recomendaciones.length > 0) {
          recomendaciones.push(...analisisEquipo.recomendaciones);
        }
      }

      // Calcular estadísticas generales
      const estadisticas = this.calcularEstadisticasParque(resultadosAnalisis);

      // Generar recomendaciones consolidadas con IA
      const recomendacionesIA = await this.generarRecomendacionesConsolidadas(
        incumplimientos, estadisticas
      );

      // Guardar análisis
      const analisis = await AnalisisIA.create({
        documento_id: documentoId,
        tipo_analisis: 'excel_parque',
        modelo_usado: 'llama3.1:latest',
        prompt_utilizado: 'Análisis automático de parque informático',
        resultado_bruto: { 
          equipos_analizados: equipos.length,
          resultados: resultadosAnalisis 
        },
        datos_estructurados: {
          estadisticas,
          incumplimientos,
          recomendaciones: recomendacionesIA,
          equipos_detalle: resultadosAnalisis
        },
        nivel_confianza: 95, // Alta confianza en validaciones automáticas
        tiempo_procesamiento: this.performanceMonitor.end(`analisis_parque_${documentoId}`),
        estado_analisis: 'completado'
      });

      return {
        analisis_id: analisis.id,
        estadisticas,
        incumplimientos,
        recomendaciones: recomendacionesIA,
        equipos_analizados: equipos.length,
        porcentaje_cumplimiento: estadisticas.porcentaje_cumplimiento_general
      };

    } catch (error) {
      console.error('Error analizando parque informático:', error);
      throw error;
    }
  }

  /**
   * Analizar imagen del cuarto de tecnología
   */
  async analizarImagenCuarto(documentoId, rutaImagen, tipoAnalisis = 'general') {
    try {
      this.performanceMonitor.start(`analisis_imagen_${documentoId}`);

      const prompt = PromptTemplates.generarPromptImagenCuarto(tipoAnalisis);
      
      const resultado = await this.client.analyzeImage(rutaImagen, prompt, {
        temperature: 0.1
      });

      if (!resultado.success) {
        throw new Error(`Error analizando imagen: ${resultado.error}`);
      }

      // Procesar respuesta de LLaVA
      const datosEstructurados = this.extraerDatosImagen(resultado.content, tipoAnalisis);

      // Generar score de cumplimiento visual
      const scoreCumplimiento = this.calcularScoreVisual(datosEstructurados);

      const analisis = await AnalisisIA.create({
        documento_id: documentoId,
        tipo_analisis: 'imagen_visual',
        modelo_usado: 'llava:latest',
        prompt_utilizado: prompt,
        resultado_bruto: { 
          response: resultado.content, 
          metadata: resultado.metadata 
        },
        datos_estructurados: {
          ...datosEstructurados,
          score_cumplimiento: scoreCumplimiento
        },
        nivel_confianza: this.calcularConfianzaImagen(datosEstructurados),
        tiempo_procesamiento: resultado.processing_time_ms,
        estado_analisis: 'completado'
      });

      this.performanceMonitor.end(`analisis_imagen_${documentoId}`);

      return {
        analisis_id: analisis.id,
        datos_visuales: datosEstructurados,
        score_cumplimiento: scoreCumplimiento,
        requiere_revision: scoreCumplimiento < 70,
        tiempo_procesamiento: resultado.processing_time_ms
      };

    } catch (error) {
      console.error('Error analizando imagen:', error);
      throw error;
    }
  }

  /**
   * Analizar equipo individual contra umbrales
   */
  async analizarEquipoIndividual(equipo, umbrales) {
    const incumplimientos = [];
    const recomendaciones = [];
    let puntajeTotal = 100;

    for (const umbral of umbrales) {
      const validacion = this.validarUmbral(equipo, umbral);
      
      if (!validacion.cumple) {
        incumplimientos.push({
          categoria: umbral.categoria,
          criterio: umbral.criterio,
          valor_actual: validacion.valor_actual,
          valor_requerido: umbral.valor_minimo,
          criticidad: umbral.criticidad,
          mensaje: umbral.mensaje_incumplimiento
        });

        // Descontar puntos según peso y criticidad
        const descuento = this.calcularDescuentoPuntaje(umbral);
        puntajeTotal -= descuento;

        // Generar recomendación específica
        if (umbral.criticidad === 'alta' || umbral.criticidad === 'critica') {
          recomendaciones.push({
            tipo: 'actualizacion',
            descripcion: `Actualizar ${umbral.categoria} de ${validacion.valor_actual} a ${umbral.valor_recomendado || umbral.valor_minimo}`,
            prioridad: umbral.criticidad === 'critica' ? 'urgente' : 'alta'
          });
        }
      }
    }

    return {
      hostname: equipo.hostname,
      sitio: equipo.sitio,
      puntaje: Math.max(0, puntajeTotal), // No permitir puntajes negativos
      incumplimientos,
      recomendaciones,
      cumple_minimos: incumplimientos.length === 0
    };
  }

  /**
   * Calcular nivel de confianza basado en la calidad de los datos extraídos
   */
  calcularNivelConfianza(datosEstructurados) {
    let confianza = 100;

    // Reducir confianza si faltan datos críticos
    if (!datosEstructurados.equipos_identificados || datosEstructurados.equipos_identificados.length === 0) {
      confianza -= 30;
    }

    if (!datosEstructurados.fecha_actualizacion) {
      confianza -= 20;
    }

    // Reducir si hay muchos datos con formato incierto
    const camposIncompletos = Object.values(datosEstructurados)
      .filter(v => v === null || v === undefined || v === '').length;
    
    confianza -= camposIncompletos * 5;

    return Math.max(0, Math.min(100, confianza));
  }
}

module.exports = OllamaService;
```

### **Plantillas de Prompts**

```javascript
// backend/src/domains/ia/utils/promptTemplates.js

class PromptTemplates {
  /**
   * Prompt para análisis de topología de red
   */
  static generarPromptTopologia(contenidoTexto) {
    return `
Eres un especialista en redes e infraestructura IT. Analiza el siguiente documento de topología de red y extrae información estructurada.

DOCUMENTO:
${contenidoTexto}

INSTRUCCIONES:
1. Identifica todos los equipos de red mencionados (routers, switches, firewalls, etc.)
2. Extrae direcciones IP, subredes, y VLANs
3. Identifica protocolos de routing y configuraciones especiales
4. Busca fechas de última actualización o modificación
5. Detecta cualquier problema o advertencia mencionada

Responde ÚNICAMENTE en el siguiente formato JSON:
{
  "equipos_identificados": [
    {
      "tipo": "router/switch/firewall/servidor",
      "marca": "Cisco/Juniper/etc",
      "modelo": "modelo específico",
      "direccion_ip": "IP si está disponible",
      "ubicacion": "ubicación física"
    }
  ],
  "redes_identificadas": [
    {
      "red": "192.168.1.0/24",
      "vlan": "VLAN ID si aplica",
      "proposito": "LAN/WAN/DMZ/etc"
    }
  ],
  "protocolos": ["OSPF", "BGP", "VRRP", "etc"],
  "fecha_actualizacion": "YYYY-MM-DD o null",
  "problemas_detectados": ["descripción de problemas encontrados"],
  "nivel_detalle": "alto/medio/bajo",
  "observaciones": "comentarios adicionales relevantes"
}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.
    `.trim();
  }

  /**
   * Prompt para análisis de imágenes del cuarto de tecnología
   */
  static generarPromptImagenCuarto(tipoAnalisis = 'general') {
    const promptsEspecificos = {
      'general': `
Analiza esta imagen del cuarto de tecnología y evalúa:
1. Organización general del espacio
2. Estado del cableado (ordenado, etiquetado, en canaletas)
3. Equipos visibles y su estado aparente
4. Limpieza y mantenimiento del área
5. Cumplimiento de normas básicas de datacenter
      `,
      'cableado': `
Enfócate específicamente en el cableado:
1. ¿Están los cables organizados en canaletas?
2. ¿Hay etiquetado visible en los cables?
3. ¿Se ven cables sueltos o desordenados?
4. ¿Los patch panels están organizados?
5. ¿Hay colores estándar para diferentes tipos de conexión?
      `,
      'equipos': `
Identifica y evalúa los equipos visibles:
1. Tipos de equipos (switches, routers, servidores, UPS)
2. Marcas visibles
3. Estados de LEDs (si son claramente visibles)
4. Etiquetado de equipos
5. Disposición en racks
      `
    };

    return `
Eres un experto en infraestructura de datacenter. Analiza esta imagen del cuarto de tecnología.

${promptsEspecificos[tipoAnalisis]}

Responde en el siguiente formato JSON:
{
  "equipos_identificados": [
    {
      "tipo": "switch/router/servidor/ups/otros",
      "marca": "marca si es visible",
      "cantidad_estimada": "número",
      "estado_aparente": "bueno/regular/malo",
      "ubicacion_rack": "posición si es clara"
    }
  ],
  "estado_cableado": {
    "organizacion": "excelente/buena/regular/mala",
    "uso_canaletas": true/false,
    "etiquetado_visible": true/false,
    "cables_sueltos": true/false,
    "observaciones": "detalles específicos"
  },
  "limpieza_mantenimiento": {
    "nivel_limpieza": "excelente/buena/regular/mala",
    "polvo_visible": true/false,
    "equipos_sucios": true/false,
    "observaciones": "detalles específicos"
  },
  "organizacion_general": {
    "distribucion_equipos": "excelente/buena/regular/mala",
    "uso_espacio": "eficiente/adecuado/deficiente",
    "señalizacion": true/false,
    "observaciones": "detalles específicos"
  },
  "problemas_detectados": ["lista de problemas visibles"],
  "score_cumplimiento": 85,
  "requiere_atencion": ["aspectos que necesitan mejora"],
  "puntos_fuertes": ["aspectos bien implementados"]
}

IMPORTANTE: Sé específico y objetivo. Solo reporta lo que realmente puedes ver en la imagen.
    `.trim();
  }

  /**
   * Prompt para generar recomendaciones consolidadas
   */
  static generarPromptRecomendaciones(incumplimientos, estadisticas) {
    return `
Eres un consultor experto en infraestructura IT. Basándote en los incumplimientos detectados y estadísticas del parque informático, genera recomendaciones priorizadas.

INCUMPLIMIENTOS DETECTADOS:
${JSON.stringify(incumplimientos, null, 2)}

ESTADÍSTICAS DEL PARQUE:
${JSON.stringify(estadisticas, null, 2)}

Genera recomendaciones en el siguiente formato JSON:
{
  "recomendaciones": [
    {
      "titulo": "Título conciso de la recomendación",
      "descripcion": "Descripción detallada de la acción recomendada",
      "tipo": "actualizacion/mejora/mantenimiento/reemplazo",
      "prioridad": "urgente/alta/media/baja",
      "impacto": "alto/medio/bajo",
      "costo_estimado": "alto/medio/bajo",
      "tiempo_estimado_dias": 30,
      "equipos_afectados": ["lista de equipos o cantidad"],
      "justificacion": "Por qué es importante esta recomendación",
      "riesgos_no_implementar": "Qué puede pasar si no se implementa"
    }
  ],
  "resumen_ejecutivo": "Resumen de las principales áreas de mejora",
  "inversion_estimada": "Estimación general de inversión requerida",
  "tiempo_total_implementacion": "Tiempo estimado para implementar todas las recomendaciones"
}

IMPORTANTE: Prioriza por impacto en seguridad, después por costo-beneficio.
    `.trim();
  }
}

module.exports = PromptTemplates;
```

---

## 📊 SISTEMA DE PUNTAJES Y SCORING

### **Motor de Scoring Configurable**

```javascript
// backend/src/domains/ia/services/ScoringEngine.js
const { UmbralTecnico, AnalisisIA, RecomendacionIA } = require('../../../shared/database/models');

class ScoringEngine {
  /**
   * Calcular puntaje consolidado de una auditoría
   */
  static async calcularPuntajeAuditoria(auditoriaId, resultadosAnalisis) {
    try {
      const puntajesPorSeccion = {};
      let puntajeTotal = 0;
      let pesoTotal = 0;

      // Configuración de pesos por sección
      const pesosSecciones = await this.obtenerPesosSecciones();

      for (const [seccionId, analisis] of Object.entries(resultadosAnalisis)) {
        const puntajeSeccion = await this.calcularPuntajeSeccion(seccionId, analisis);
        const pesoSeccion = pesosSecciones[seccionId] || 1.0;

        puntajesPorSeccion[seccionId] = {
          puntaje: puntajeSeccion.puntaje,
          peso: pesoSeccion,
          detalles: puntajeSeccion.detalles,
          incumplimientos: puntajeSeccion.incumplimientos
        };

        puntajeTotal += puntajeSeccion.puntaje * pesoSeccion;
        pesoTotal += pesoSeccion;
      }

      const puntajeFinal = pesoTotal > 0 ? puntajeTotal / pesoTotal : 0;

      return {
        puntaje_final: Math.round(puntajeFinal * 100) / 100,
        puntajes_por_seccion: puntajesPorSeccion,
        clasificacion: this.clasificarPuntaje(puntajeFinal),
        areas_criticas: this.identificarAreasCriticas(puntajesPorSeccion),
        recomendaciones_principales: await this.generarRecomendacionesPrincipales(puntajesPorSeccion)
      };

    } catch (error) {
      throw new Error(`Error calculando puntaje de auditoría: ${error.message}`);
    }
  }

  /**
   * Calcular puntaje de una sección específica
   */
  static async calcularPuntajeSeccion(seccionId, analisis) {
    const umbrales = await UmbralTecnico.findAll({
      where: { seccion_codigo: seccionId, activo: true }
    });

    let puntajeBase = 100;
    const incumplimientos = [];
    const detalles = [];

    for (const umbral of umbrales) {
      const validacion = this.validarContraUmbral(analisis, umbral);
      
      if (!validacion.cumple) {
        const penalizacion = this.calcularPenalizacion(umbral, validacion.severidad);
        puntajeBase -= penalizacion;

        incumplimientos.push({
          criterio: umbral.criterio,
          valor_esperado: umbral.valor_minimo,
          valor_encontrado: validacion.valor_actual,
          penalizacion: penalizacion,
          criticidad: umbral.criticidad
        });
      }

      detalles.push({
        criterio: umbral.criterio,
        cumple: validacion.cumple,
        valor: validacion.valor_actual,
        peso: umbral.peso_puntaje
      });
    }

    return {
      puntaje: Math.max(0, puntajeBase), // No permitir puntajes negativos
      detalles,
      incumplimientos,
      total_criterios: umbrales.length,
      criterios_cumplidos: umbrales.length - incumplimientos.length
    };
  }

  /**
   * Calcular penalización por incumplimiento
   */
  static calcularPenalizacion(umbral, severidad = 1.0) {
    const penalizacionBase = {
      'baja': 2,
      'media': 5,
      'alta': 10,
      'critica': 20
    };

    const penalizacion = (penalizacionBase[umbral.criticidad] || 5) * umbral.peso_puntaje * severidad;
    return Math.min(penalizacion, 30); // Máximo 30 puntos por criterio
  }

  /**
   * Clasificar puntaje en categorías
   */
  static clasificarPuntaje(puntaje) {
    if (puntaje >= 90) return { nivel: 'Excelente', color: 'green', descripcion: 'Cumplimiento excepcional' };
    if (puntaje >= 80) return { nivel: 'Bueno', color: 'blue', descripcion: 'Cumplimiento satisfactorio' };
    if (puntaje >= 70) return { nivel: 'Regular', color: 'yellow', descripcion: 'Requiere mejoras menores' };
    if (puntaje >= 60) return { nivel: 'Deficiente', color: 'orange', descripcion: 'Requiere mejoras importantes' };
    return { nivel: 'Crítico', color: 'red', descripcion: 'Requiere acción inmediata' };
  }

  /**
   * Identificar áreas que requieren atención prioritaria
   */
  static identificarAreasCriticas(puntajesPorSeccion) {
    const areasCriticas = [];

    for (const [seccionId, datos] of Object.entries(puntajesPorSeccion)) {
      if (datos.puntaje < 70 || datos.incumplimientos.some(i => i.criticidad === 'critica')) {
        areasCriticas.push({
          seccion: seccionId,
          puntaje: datos.puntaje,
          incumplimientos_criticos: datos.incumplimientos.filter(i => 
            i.criticidad === 'alta' || i.criticidad === 'critica'
          ).length,
          requiere_atencion_inmediata: datos.puntaje < 60
        });
      }
    }

    return areasCriticas.sort((a, b) => a.puntaje - b.puntaje);
  }

  /**
   * Generar recomendaciones principales basadas en puntajes
   */
  static async generarRecomendacionesPrincipales(puntajesPorSeccion) {
    const recomendaciones = [];

    for (const [seccionId, datos] of Object.entries(puntajesPorSeccion)) {
      if (datos.incumplimientos.length > 0) {
        // Agrupar incumplimientos similares
        const gruposIncumplimientos = this.agruparIncumplimientos(datos.incumplimientos);
        
        for (const grupo of gruposIncumplimientos) {
          const recomendacion = await this.generarRecomendacionGrupo(seccionId, grupo);
          if (recomendacion) {
            recomendaciones.push(recomendacion);
          }
        }
      }
    }

    // Ordenar por prioridad e impacto
    return recomendaciones.sort((a, b) => {
      const prioridadPeso = { 'urgente': 4, 'alta': 3, 'media': 2, 'baja': 1 };
      const impactoPeso = { 'alto': 3, 'medio': 2, 'bajo': 1 };
      
      const pesoA = prioridadPeso[a.prioridad] * impactoPeso[a.impacto];
      const pesoB = prioridadPeso[b.prioridad] * impactoPeso[b.impacto];
      
      return pesoB - pesoA;
    });
  }

  /**
   * Agrupar incumplimientos similares para generar recomendaciones consolidadas
   */
  static agruparIncumplimientos(incumplimientos) {
    const grupos = {};

    for (const incumplimiento of incumplimientos) {
      const categoria = this.categorizarIncumplimiento(incumplimiento);
      
      if (!grupos[categoria]) {
        grupos[categoria] = [];
      }
      
      grupos[categoria].push(incumplimiento);
    }

    return Object.entries(grupos).map(([categoria, items]) => ({
      categoria,
      incumplimientos: items,
      criticidad_maxima: Math.max(...items.map(i => 
        ['baja', 'media', 'alta', 'critica'].indexOf(i.criticidad)
      )),
      cantidad_afectada: items.length
    }));
  }
}

module.exports = ScoringEngine;
```

---

## 📈 DASHBOARD DE ANÁLISIS IA

### **Componente de Dashboard para Auditores**

```jsx
// frontend/src/domains/ia/components/DashboardAnalisisIA.jsx
import { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Progress, 
  Table, 
  Tag, 
  Button,
  Statistic,
  Alert,
  Tabs,
  Badge,
  Space
} from 'antd';
import { 
  RobotOutlined,
  CheckCircleOutlined,
  ExclamationTriangleOutlined,
  ClockCircleOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useAnalisisIAStore } from '../store/analisisStore';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const { TabPane } = Tabs;

function DashboardAnalisisIA({ auditoriaId }) {
  const [tabActiva, setTabActiva] = useState('resumen');
  
  const {
    analisisCompletos,
    estadisticasIA,
    recomendaciones,
    loading,
    obtenerAnalisisAuditoria,
    validarAnalisisIA,
    ajustarPuntaje
  } = useAnalisisIAStore();

  useEffect(() => {
    if (auditoriaId) {
      obtenerAnalisisAuditoria(auditoriaId);
    }
  }, [auditoriaId]);

  const datosGraficoCumplimiento = {
    labels: ['Cumple', 'No Cumple', 'Pendiente'],
    datasets: [{
      data: [
        estadisticasIA.criterios_cumplidos || 0,
        estadisticasIA.criterios_incumplidos || 0,
        estadisticasIA.criterios_pendientes || 0
      ],
      backgroundColor: ['#52c41a', '#ff4d4f', '#faad14'],
      borderWidth: 0
    }]
  };

  const datosGraficoPuntajes = {
    labels: analisisCompletos.map(a => a.seccion_nombre),
    datasets: [{
      label: 'Puntaje IA',
      data: analisisCompletos.map(a => a.puntaje_ia),
      backgroundColor: '#1890ff',
      borderColor: '#0050b3',
      borderWidth: 1
    }, {
      label: 'Puntaje Ajustado',
      data: analisisCompletos.map(a => a.puntaje_final || a.puntaje_ia),
      backgroundColor: '#52c41a',
      borderColor: '#389e0d',
      borderWidth: 1
    }]
  };

  const columnasTablaAnalisis = [
    {
      title: 'Sección',
      dataIndex: 'seccion_nombre',
      key: 'seccion',
      render: (text, record) => (
        <Space>
          {text}
          {record.requiere_revision && (
            <Badge status="warning" title="Requiere revisión" />
          )}
        </Space>
      )
    },
    {
      title: 'Estado',
      dataIndex: 'estado_analisis',
      key: 'estado',
      render: (estado) => {
        const config = {
          'completado': { color: 'green', icon: <CheckCircleOutlined /> },
          'procesando': { color: 'blue', icon: <ClockCircleOutlined /> },
          'error': { color: 'red', icon: <ExclamationTriangleOutlined /> },
          'pendiente': { color: 'orange', icon: <ClockCircleOutlined /> }
        };
        
        return (
          <Tag color={config[estado]?.color} icon={config[estado]?.icon}>
            {estado.charAt(0).toUpperCase() + estado.slice(1)}
          </Tag>
        );
      }
    },
    {
      title: 'Puntaje IA',
      dataIndex: 'puntaje_ia',
      key: 'puntaje_ia',
      render: (puntaje) => (
        <Progress 
          percent={puntaje} 
          size="small"
          status={puntaje < 70 ? 'exception' : puntaje < 85 ? 'normal' : 'success'}
        />
      )
    },
    {
      title: 'Confianza',
      dataIndex: 'nivel_confianza',
      key: 'confianza',
      render: (confianza) => (
        <Progress 
          percent={confianza} 
          size="small"
          strokeColor={confianza < 70 ? '#ff4d4f' : confianza < 85 ? '#faad14' : '#52c41a'}
        />
      )
    },
    {
      title: 'Tiempo',
      dataIndex: 'tiempo_procesamiento',
      key: 'tiempo',
      render: (tiempo) => `${(tiempo / 1000).toFixed(1)}s`
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            type="primary"
            onClick={() => validarAnalisisIA(record.id)}
            disabled={record.validado_por_auditor}
          >
            {record.validado_por_auditor ? 'Validado' : 'Validar'}
          </Button>
          
          {record.requiere_revision && (
            <Button 
              size="small"
              onClick={() => abrirModalAjuste(record)}
            >
              Ajustar
            </Button>
          )}
        </Space>
      )
    }
  ];

  const columnasRecomendaciones = [
    {
      title: 'Recomendación',
      dataIndex: 'titulo',
      key: 'titulo',
      width: '30%'
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_recomendacion',
      key: 'tipo',
      render: (tipo) => {
        const colores = {
          'actualizacion': 'blue',
          'mejora': 'green', 
          'correccion': 'orange',
          'mantenimiento': 'purple'
        };
        return <Tag color={colores[tipo]}>{tipo}</Tag>;
      }
    },
    {
      title: 'Prioridad',
      dataIndex: 'prioridad',
      key: 'prioridad',
      render: (prioridad) => {
        const colores = {
          'urgente': 'red',
          'alta': 'orange',
          'media': 'yellow',
          'baja': 'green'
        };
        return <Tag color={colores[prioridad]}>{prioridad}</Tag>;
      }
    },
    {
      title: 'Impacto',
      dataIndex: 'impacto_estimado',
      key: 'impacto'
    },
    {
      title: 'Estado',
      dataIndex: 'estado_recomendacion',
      key: 'estado',
      render: (estado) => (
        <Tag color={estado === 'aprobada' ? 'green' : 'default'}>
          {estado}
        </Tag>
      )
    }
  ];

  return (
    <div className="dashboard-analisis-ia">
      <Row gutter={[16, 16]} className="estadisticas-principales">
        <Col span={6}>
          <Card>
            <Statistic
              title="Análisis Completados"
              value={estadisticasIA.analisis_completados || 0}
              prefix={<RobotOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card>
            <Statistic
              title="Puntaje Promedio IA"
              value={estadisticasIA.puntaje_promedio || 0}
              suffix="/ 100"
              precision={1}
              valueStyle={{ color: estadisticasIA.puntaje_promedio >= 80 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card>
            <Statistic
              title="Requieren Revisión"
              value={estadisticasIA.requieren_revision || 0}
              prefix={<ExclamationTriangleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card>
            <Statistic
              title="Recomendaciones IA"
              value={recomendaciones.length || 0}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="dashboard-principal">
        <Tabs activeKey={tabActiva} onChange={setTabActiva}>
          
          <TabPane tab="Resumen" key="resumen">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="Distribución de Cumplimiento" size="small">
                  <Pie 
                    data={datosGraficoCumplimiento} 
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                  />
                </Card>
              </Col>
              
              <Col span={12}>
                <Card title="Puntajes por Sección" size="small">
                  <Bar 
                    data={datosGraficoPuntajes}
                    options={{
                      responsive: true,
                      scales: {
                        y: { beginAtZero: true, max: 100 }
                      },
                      plugins: {
                        legend: { position: 'top' }
                      }
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {estadisticasIA.areas_criticas?.length > 0 && (
              <Alert
                message="Áreas Críticas Detectadas"
                description={
                  <ul>
                    {estadisticasIA.areas_criticas.map((area, idx) => (
                      <li key={idx}>
                        <strong>{area.seccion}</strong>: Puntaje {area.puntaje}% 
                        ({area.incumplimientos_criticos} incumplimientos críticos)
                      </li>
                    ))}
                  </ul>
                }
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </TabPane>

          <TabPane tab="Análisis Detallado" key="detalle">
            <Table
              dataSource={analisisCompletos}
              columns={columnasTablaAnalisis}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              expandable={{
                expandedRowRender: (record) => (
                  <div style={{ padding: 16, background: '#fafafa' }}>
                    <h4>Detalles del Análisis</h4>
                    <p><strong>Modelo usado:</strong> {record.modelo_usado}</p>
                    <p><strong>Tiempo de procesamiento:</strong> {(record.tiempo_procesamiento / 1000).toFixed(2)}s</p>
                    
                    {record.incumplimientos?.length > 0 && (
                      <div>
                        <h5>Incumplimientos Detectados:</h5>
                        <ul>
                          {record.incumplimientos.map((inc, idx) => (
                            <li key={idx}>
                              <Tag color="red">{inc.criticidad}</Tag>
                              {inc.criterio}: {inc.descripcion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              }}
            />
          </TabPane>

          <TabPane tab="Recomendaciones" key="recomendaciones">
            <Table
              dataSource={recomendaciones}
              columns={columnasRecomendaciones}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              expandable={{
                expandedRowRender: (record) => (
                  <div style={{ padding: 16 }}>
                    <p><strong>Descripción:</strong> {record.descripcion}</p>
                    <p><strong>Justificación:</strong> {record.justificacion}</p>
                    {record.equipos_afectados && (
                      <p><strong>Equipos afectados:</strong> {record.equipos_afectados.join(', ')}</p>
                    )}
                    <div style={{ marginTop: 12 }}>
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => aprobarRecomendacion(record.id)}
                        disabled={record.estado_recomendacion === 'aprobada'}
                      >
                        Aprobar
                      </Button>
                      <Button 
                        size="small" 
                        style={{ marginLeft: 8 }}
                        onClick={() => rechazarRecomendacion(record.id)}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </div>
                )
              }}
            />
          </TabPane>

        </Tabs>
      </Card>
    </div>
  );
}

export default DashboardAnalisisIA;
```

---

## ✅ CRITERIOS DE ACEPTACIÓN DE LA FASE 3

### **Funcionalidades Críticas que Deben Funcionar:**

1. **Sistema de IA debe:**
   - Procesar automáticamente PDFs y extraer información técnica relevante
   - Analizar archivos Excel de parque informático con 95%+ precisión
   - Procesar imágenes del cuarto de tecnología identificando equipos y problemas
   - Generar puntajes automáticos basados en umbrales configurables
   - Producir recomendaciones específicas y priorizadas

2. **Auditor debe poder:**
   - Revisar y validar todos los análisis automáticos de IA
   - Ajustar puntajes cuando el análisis automático sea incorrecto
   - Aprobar o rechazar recomendaciones generadas por IA
   - Ver estadísticas de rendimiento y precisión del sistema

3. **Sistema debe:**
   - Procesar documentos en background sin bloquear la interfaz
   - Manejar fallos de Ollama de forma elegante con reintentos
   - Mantener historial completo de todos los análisis realizados
   - Permitir reconfiguración de umbrales sin afectar análisis existentes

### **Métricas de Rendimiento IA:**
- Tiempo de análisis PDF: máximo 60 segundos para documentos de 50 páginas
- Análisis de Excel: máximo 30 segundos para 500 equipos
- Análisis de imagen: máximo 45 segundos con LLaVA
- Precisión de extracción: mínimo 90% para datos estructurados
- Disponibilidad de Ollama: 99%+ uptime

---

## ➡️ FINALIZACIÓN DE FASE 3

### **Entregables Finales:**
1. **Sistema completo de IA** integrado con Ollama funcionando
2. **Extractores automáticos** para todos los tipos de documento
3. **Motor de puntajes** configurable y preciso
4. **Dashboard de análisis IA** para auditores completo
5. **Sistema de recomendaciones** automático funcional
6. **Cola de procesamiento** robusta y escalable

### **Criterio de Continuidad:**
La Fase 3 se considera completa cuando el sistema puede analizar automáticamente todos los documentos de una auditoría completa (13 secciones) y generar puntajes y recomendaciones que requieren validación mínima del auditor.

### **Próximo Paso:**
📄 **Archivo:** `05-FASE-4-VISITAS-REPORTES.md`

El sistema estará listo para la fase final que integra las visitas presenciales con comparación IA vs realidad, y generación de reportes ejecutivos automatizados.

---

> 📌 **NOTA CRÍTICA:** Esta fase convierte el sistema de manual a inteligente. La calidad de los prompts y la configuración de umbrales determinarán la efectividad del sistema completo.