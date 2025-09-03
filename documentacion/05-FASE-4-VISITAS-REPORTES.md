# SAT-Digital: Fase 4 - Visitas Presenciales y Reportes
## 🏃‍♂️ WORKFLOW DE CAMPO Y BUSINESS INTELLIGENCE

> **Fase:** 4 de 4 (FINAL)  
> **Duración estimada:** 1-2 meses  
> **Estado:** ⏳ Pendiente (requiere Fase 3 completada)  
> **Archivo anterior:** 04-FASE-3-IA-ANALISIS.md  
> **Próximo archivo:** 06-ESTADO-PROYECTO.md (Control de estado)  
> **Prerequisitos:** ✅ Fase 3 completada con IA funcionando completamente

---

## 🎯 OBJETIVOS DE LA FASE 4

Esta fase final completa el ciclo de auditorías integrando las visitas presenciales con comparación IA versus realidad, sistema de correcciones, dashboards customizables para todos los stakeholders, y generación automática de reportes ejecutivos consolidados.

### **Objetivos Específicos:**
1. **Workflow móvil-friendly** para visitas presenciales con carga de evidencia
2. **Sistema de comparación IA vs realidad** con ajustes automáticos de puntajes
3. **Módulo de correcciones** para discrepancias encontradas en campo
4. **Dashboards customizables** por rol y nivel de acceso
5. **Generador automático de reportes ejecutivos** por sitio y consolidados
6. **Sistema de planes de acción** post-auditoría con seguimiento
7. **Business Intelligence** con análisis de tendencias y predicciones

---

## 📋 CHECKPOINTS DE LA FASE 4

### **Checkpoint 4.1: Workflow de Visitas Presenciales (Semana 1-2)**
**Criterios de éxito:**
- [ ] Interfaz móvil-friendly completamente funcional en tablets/smartphones
- [ ] Sistema de carga de evidencia fotográfica con geolocalización
- [ ] Documentación de discrepancias in-situ integrada
- [ ] Sincronización offline/online para áreas sin conectividad
- [ ] Integración con análisis previo de IA para comparación

**Entregables:**
- Aplicación web responsive optimizada para móviles
- Sistema de carga de evidencia geolocalizada
- Formularios de validación in-situ
- Modo offline con sincronización automática

**Validación:**
```
Criterio: Un auditor en campo debe poder:
1. Acceder a los datos de análisis previo de IA desde tablet
2. Cargar fotos con coordenadas GPS automáticas
3. Documentar discrepancias con formularios estructurados
4. Trabajar sin conexión y sincronizar al regresar
5. Generar resumen de visita directamente desde móvil
```

### **Checkpoint 4.2: Comparación IA vs Realidad (Semana 2-3)**
**Criterios de éxito:**
- [ ] Sistema automático de comparación entre predicciones IA y hallazgos reales
- [ ] Algoritmo de ajuste de puntajes basado en evidencia presencial
- [ ] Identificación de patrones de discrepancias para mejora del modelo IA
- [ ] Dashboard de precisión de IA con métricas de mejora continua
- [ ] Feedback automático para reentrenamiento de prompts

**Entregables:**
- Motor de comparación IA vs realidad
- Sistema de ajuste automático de puntajes
- Dashboard de métricas de precisión de IA
- Módulo de feedback para mejora continua

**Validación:**
```
Criterio: El sistema debe poder:
1. Detectar que IA predijo "Buena organización" pero realidad es "Cables desordenados"
2. Ajustar automáticamente puntaje de 85% a 65% según evidencia
3. Registrar discrepancia para mejorar futuros análisis de imágenes
4. Generar alerta si discrepancias superan 20% en múltiples casos
5. Sugerir reajuste de umbrales basado en patrones encontrados
```

### **Checkpoint 4.3: Sistema de Correcciones (Semana 3-4)**
**Criterios de éxito:**
- [ ] Módulo de gestión de discrepancias completamente operativo
- [ ] Workflow de aprobación de correcciones por nivel de impacto
- [ ] Sistema de versionado de auditorías con historial de cambios
- [ ] Notificaciones automáticas por correcciones significativas
- [ ] Integración con bitácora para trazabilidad completa

**Entregables:**
- Sistema de gestión de correcciones estructuradas
- Workflow de aprobación multinivel
- Versionado automático con snapshots
- Sistema de notificaciones por cambios críticos

**Validación:**
```
Criterio: Cuando se detecta una discrepancia crítica:
1. Sistema crea ticket de corrección automáticamente
2. Requiere aprobación de supervisor si impacto > 15 puntos
3. Genera nueva versión de auditoría con cambios documentados
4. Notifica automáticamente a proveedor y stakeholders
5. Actualiza dashboards y reportes en tiempo real
```

### **Checkpoint 4.4: Dashboards Customizables (Semana 4-5)**
**Criterios de éxito:**
- [ ] Dashboard personalizable por rol completamente funcional
- [ ] Widgets drag-and-drop para configuración por usuario
- [ ] Filtros avanzados por proveedor, período, sitio, sección
- [ ] Exportación de datos en múltiples formatos (PDF, Excel, PowerBI)
- [ ] Actualización en tiempo real sin refresh manual

**Entregables:**
- Sistema de dashboards con widgets customizables
- Generador de filtros dinámicos
- Exportador multi-formato
- Sistema de templates por rol

**Validación:**
```
Criterio: Un visualizador/gerente debe poder:
1. Arrastrar widget "Puntaje Promedio por Proveedor" a su dashboard
2. Filtrar datos por "Último semestre" y "Solo incumplimientos críticos"
3. Exportar gráfico específico a PowerPoint para presentación
4. Crear template personalizado y compartir con su equipo
5. Recibir actualizaciones automáticas cuando cambien los datos
```

### **Checkpoint 4.5: Generador de Reportes Ejecutivos (Semana 5-6)**
**Criterios de éxito:**
- [ ] Generación automática de reportes por sitio completamente operativa
- [ ] Reportes consolidados por proveedor con análisis comparativo
- [ ] Resúmenes ejecutivos con insights automáticos generados por IA
- [ ] Templates profesionales configurables por marca corporativa
- [ ] Programación automática de entrega por email

**Entregables:**
- Generador automático de reportes multi-nivel
- Templates profesionales personalizables
- Motor de insights ejecutivos con IA
- Sistema de distribución automática

**Validación:**
```
Criterio: Al finalizar una auditoría, el sistema debe:
1. Generar automáticamente reporte detallado del sitio (20+ páginas)
2. Crear resumen ejecutivo de 2 páginas con hallazgos principales
3. Producir análisis comparativo vs período anterior automáticamente
4. Incluir recomendaciones priorizadas con timeline de implementación
5. Enviar por email automáticamente a lista predefinida de stakeholders
```

### **Checkpoint 4.6: Business Intelligence y Analytics (Semana 6-8)**
**Criterios de éxito:**
- [ ] Análisis de tendencias históricas completamente funcional
- [ ] Predicciones basadas en patrones históricos operativas
- [ ] Benchmarking automático contra promedios de industria
- [ ] Alertas proactivas por deterioro de métricas
- [ ] Integración con sistemas externos (APIs) para enriquecimiento de datos

**Entregables:**
- Motor de análisis predictivo
- Sistema de benchmarking automatizado
- Generador de alertas proactivas
- APIs para integración con sistemas corporativos

**Validación:**
```
Criterio: El sistema de BI debe poder:
1. Predecir que Proveedor X tendrá problemas en próxima auditoría basado en tendencia
2. Alertar automáticamente si puntaje de sitio baja >10% vs promedio histórico
3. Comparar rendimiento contra benchmarks de industria automáticamente
4. Generar insights: "Equipos actualizados en Q1 muestran 15% mejor rendimiento"
5. Integrar datos de inventario en tiempo real via API externa
```

---

## 📱 WORKFLOW MÓVIL PARA VISITAS PRESENCIALES

### **Arquitectura Móvil-First**

**Componentes Principales:**
```
MovilModule/
├── components/
│   ├── VisitaPresencial/
│   │   ├── FormularioValidacion.jsx    # Validación in-situ
│   │   ├── CamaraEvidencia.jsx        # Captura de evidencia
│   │   ├── ComparadorIA.jsx           # Comparación con análisis IA
│   │   └── ResumenVisita.jsx          # Generación de resumen
│   ├── Offline/
│   │   ├── SyncManager.jsx            # Manejo de sincronización
│   │   └── StorageLocal.jsx           # Almacenamiento local
│   └── Geolocation/
│       ├── GPS.jsx                    # Captura de coordenadas
│       └── MapaVisita.jsx             # Visualización de ubicación
├── services/
│   ├── SincronizacionService.js       # Sync offline/online
│   ├── EvidenciaService.js            # Gestión de evidencia
│   └── GeolocationService.js          # Servicios de ubicación
└── utils/
    ├── offlineStorage.js              # Persistencia local
    ├── imageCompression.js            # Compresión de imágenes
    └── networkDetection.js           # Detección de conectividad
```

### **Componente Principal de Visita Presencial**

```jsx
// frontend/src/domains/visitas/components/VisitaPresencial.jsx
import { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Steps, 
  Button, 
  Row, 
  Col, 
  Upload, 
  Form, 
  Input, 
  Select, 
  Rate,
  Alert,
  Progress,
  Space,
  Tag,
  Modal
} from 'antd';
import { 
  CameraOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  WifiOutlined,
  DisconnectOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useVisitaStore } from '../store/visitaStore';
import { useGeolocation } from '../hooks/useGeolocation';
import { useSincronizacion } from '../hooks/useSincronizacion';

const { Step } = Steps;
const { TextArea } = Input;

function VisitaPresencial({ auditoriaId, auditor }) {
  const [pasoActual, setPasoActual] = useState(0);
  const [form] = Form.useForm();
  const [evidenciasCargadas, setEvidenciasCargadas] = useState([]);
  const [discrepanciasDetectadas, setDiscrepanciasDetectadas] = useState([]);
  
  const { ubicacion, error: errorGPS } = useGeolocation();
  const { 
    online, 
    sincronizar, 
    datosPendientes, 
    ultimaSync 
  } = useSincronizacion();

  const {
    auditoria,
    analisisIA,
    validacionesPresenciales,
    obtenerAuditoriaParaVisita,
    validarSeccionPresencial,
    cargarEvidenciaVisita,
    finalizarVisita,
    loading
  } = useVisitaStore();

  useEffect(() => {
    if (auditoriaId) {
      obtenerAuditoriaParaVisita(auditoriaId);
    }
  }, [auditoriaId]);

  const pasos = [
    {
      title: 'Preparación',
      content: 'PreparacionVisita',
      icon: <CheckCircleOutlined />
    },
    {
      title: 'Validación Presencial',
      content: 'ValidacionPresencial', 
      icon: <ExclamationCircleOutlined />
    },
    {
      title: 'Evidencia Fotográfica',
      content: 'EvidenciaFotografica',
      icon: <CameraOutlined />
    },
    {
      title: 'Finalización',
      content: 'FinalizacionVisita',
      icon: <CheckCircleOutlined />
    }
  ];

  const manejarCargaEvidencia = async (archivo) => {
    try {
      const evidencia = {
        archivo,
        timestamp: new Date().toISOString(),
        ubicacion: ubicacion ? {
          lat: ubicacion.latitude,
          lng: ubicacion.longitude,
          precision: ubicacion.accuracy
        } : null,
        seccion_id: form.getFieldValue('seccion_actual'),
        descripcion: form.getFieldValue('descripcion_evidencia')
      };

      if (online) {
        const resultado = await cargarEvidenciaVisita(auditoriaId, evidencia);
        setEvidenciasCargadas(prev => [...prev, resultado]);
      } else {
        // Almacenar localmente si no hay conexión
        localStorage.setItem(
          `evidencia_pending_${Date.now()}`, 
          JSON.stringify(evidencia)
        );
        setEvidenciasCargadas(prev => [...prev, { ...evidencia, estado: 'pendiente_sync' }]);
      }

    } catch (error) {
      Modal.error({
        title: 'Error cargando evidencia',
        content: error.message
      });
    }
  };

  const compararConAnalisisIA = (seccionId, validacionPresencial) => {
    const analisisSeccion = analisisIA.find(a => a.seccion_id === seccionId);
    
    if (!analisisSeccion) return null;

    const puntajeIA = analisisSeccion.puntaje_ia;
    const puntajePresencial = validacionPresencial.puntaje;
    const diferencia = Math.abs(puntajeIA - puntajePresencial);

    if (diferencia > 15) { // Discrepancia significativa
      const discrepancia = {
        seccion_id: seccionId,
        puntaje_ia: puntajeIA,
        puntaje_presencial: puntajePresencial,
        diferencia: diferencia,
        descripcion: validacionPresencial.observaciones,
        requiere_revision: true,
        timestamp: new Date().toISOString()
      };

      setDiscrepanciasDetectadas(prev => [...prev, discrepancia]);
      
      return discrepancia;
    }

    return null;
  };

  const renderPreparacionVisita = () => (
    <Card title="Preparación de Visita" className="paso-preparacion">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Alert
            message={`Visitando: ${auditoria?.sitio?.nombre}`}
            description={`Dirección: ${auditoria?.sitio?.domicilio}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </Col>

        <Col span={12}>
          <Card size="small" title="Estado de Conectividad">
            <Space>
              {online ? (
                <>
                  <WifiOutlined style={{ color: '#52c41a' }} />
                  <span style={{ color: '#52c41a' }}>Online</span>
                </>
              ) : (
                <>
                  <DisconnectOutlined style={{ color: '#ff4d4f' }} />
                  <span style={{ color: '#ff4d4f' }}>Offline</span>
                </>
              )}
            </Space>
            
            {datosPendientes > 0 && (
              <div style={{ marginTop: 8 }}>
                <Button size="small" onClick={sincronizar}>
                  Sincronizar ({datosPendientes} pendientes)
                </Button>
              </div>
            )}
          </Card>
        </Col>

        <Col span={12}>
          <Card size="small" title="Ubicación GPS">
            <Space>
              <EnvironmentOutlined style={{ color: '#1890ff' }} />
              {ubicacion ? (
                <span>
                  Lat: {ubicacion.latitude.toFixed(6)}, 
                  Lng: {ubicacion.longitude.toFixed(6)}
                </span>
              ) : (
                <span style={{ color: '#faad14' }}>
                  {errorGPS ? 'Error GPS' : 'Obteniendo ubicación...'}
                </span>
              )}
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <Card size="small" title="Resumen de Análisis IA Previo">
            <Row gutter={[8, 8]}>
              {analisisIA?.map(analisis => (
                <Col key={analisis.seccion_id} span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div>{analisis.seccion_nombre}</div>
                    <Progress 
                      type="circle" 
                      percent={analisis.puntaje_ia} 
                      width={60}
                      status={analisis.puntaje_ia < 70 ? 'exception' : 'success'}
                    />
                    {analisis.requiere_revision && (
                      <Tag color="orange" style={{ marginTop: 4 }}>
                        Revisar
                      </Tag>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  const renderValidacionPresencial = () => (
    <Card title="Validación Presencial" className="paso-validacion">
      <Form 
        form={form} 
        layout="vertical"
        onValuesChange={(_, allValues) => {
          // Comparar automáticamente con IA al cambiar valores
          if (allValues.seccion_actual && allValues.puntaje_presencial) {
            compararConAnalisisIA(allValues.seccion_actual, {
              puntaje: allValues.puntaje_presencial,
              observaciones: allValues.observaciones
            });
          }
        }}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name="seccion_actual"
              label="Sección a Validar"
              rules={[{ required: true }]}
            >
              <Select placeholder="Seleccionar sección">
                {analisisIA?.map(analisis => (
                  <Select.Option key={analisis.seccion_id} value={analisis.seccion_id}>
                    {analisis.seccion_nombre}
                    <Tag color={analisis.puntaje_ia < 70 ? 'red' : 'green'} style={{ marginLeft: 8 }}>
                      IA: {analisis.puntaje_ia}%
                    </Tag>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="puntaje_presencial"
              label="Puntaje Presencial"
              rules={[{ required: true }]}
            >
              <Rate 
                count={10} 
                tooltips={['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%']}
                onChange={(value) => form.setFieldsValue({ puntaje_presencial: value * 10 })}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="observaciones"
              label="Observaciones Presenciales"
              rules={[{ required: true }]}
            >
              <TextArea 
                rows={4} 
                placeholder="Describir hallazgos, discrepancias con análisis IA, o confirmaciones..."
              />
            </Form.Item>
          </Col>

          {discrepanciasDetectadas.length > 0 && (
            <Col span={24}>
              <Alert
                message="Discrepancias Detectadas"
                description={
                  <ul>
                    {discrepanciasDetectadas.map((disc, idx) => (
                      <li key={idx}>
                        <strong>Sección:</strong> {disc.seccion_id} - 
                        <strong> IA:</strong> {disc.puntaje_ia}% vs 
                        <strong> Presencial:</strong> {disc.puntaje_presencial}%
                        ({disc.diferencia}% diferencia)
                      </li>
                    ))}
                  </ul>
                }
                type="warning"
                showIcon
              />
            </Col>
          )}
        </Row>
      </Form>
    </Card>
  );

  return (
    <div className="visita-presencial">
      <Card 
        title={`Visita Presencial - ${auditoria?.sitio?.nombre}`}
        extra={
          <Space>
            <Tag color={online ? 'green' : 'red'}>
              {online ? 'Online' : 'Offline'}
            </Tag>
            {ubicacion && (
              <Tag color="blue">
                GPS OK
              </Tag>
            )}
          </Space>
        }
      >
        <Steps 
          current={pasoActual} 
          onChange={setPasoActual}
          style={{ marginBottom: 24 }}
        >
          {pasos.map((paso, index) => (
            <Step 
              key={index} 
              title={paso.title} 
              icon={paso.icon}
            />
          ))}
        </Steps>

        <div className="pasos-content">
          {pasoActual === 0 && renderPreparacionVisita()}
          {pasoActual === 1 && renderValidacionPresencial()}
          {pasoActual === 2 && renderEvidenciaFotografica()}
          {pasoActual === 3 && renderFinalizacionVisita()}
        </div>

        <div className="pasos-navegacion" style={{ marginTop: 24, textAlign: 'center' }}>
          {pasoActual > 0 && (
            <Button onClick={() => setPasoActual(pasoActual - 1)}>
              Anterior
            </Button>
          )}
          {pasoActual < pasos.length - 1 && (
            <Button 
              type="primary" 
              onClick={() => setPasoActual(pasoActual + 1)}
              style={{ marginLeft: 8 }}
            >
              Siguiente
            </Button>
          )}
          {pasoActual === pasos.length - 1 && (
            <Button 
              type="primary" 
              onClick={() => finalizarVisita(auditoriaId, {
                validaciones: validacionesPresenciales,
                evidencias: evidenciasCargadas,
                discrepancias: discrepanciasDetectadas,
                ubicacion_visita: ubicacion
              })}
              loading={loading}
              style={{ marginLeft: 8 }}
            >
              Finalizar Visita
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

export default VisitaPresencial;
```

---

## 📊 GENERADOR DE REPORTES EJECUTIVOS

### **Motor de Generación de Reportes**

```javascript
// backend/src/domains/reportes/services/ReportGenerator.js
const fs = require('fs').promises;
const path = require('path');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Auditoria, AnalisisIA, RecomendacionIA } = require('../../../shared/database/models');
const OllamaService = require('../../ia/services/OllamaService');

class ReportGenerator {
  /**
   * Generar reporte ejecutivo completo de auditoría
   */
  static async generarReporteEjecutivo(auditoriaId, opciones = {}) {
    try {
      // Obtener datos completos de la auditoría
      const datosCompletos = await this.obtenerDatosCompletos(auditoriaId);
      
      // Generar insights ejecutivos con IA
      const insightsExecutivos = await this.generarInsightsEjecutivos(datosCompletos);

      // Crear estructura del reporte
      const estructuraReporte = {
        resumen_ejecutivo: await this.generarResumenEjecutivo(datosCompletos, insightsExecutivos),
        metricas_principales: this.calcularMetricasPrincipales(datosCompletos),
        analisis_por_seccion: this.generarAnalisisPorSeccion(datosCompletos),
        comparacion_historica: await this.generarComparacionHistorica(datosCompletos),
        recomendaciones_priorizadas: this.priorizarRecomendaciones(datosCompletos.recomendaciones),
        plan_accion_sugerido: await this.generarPlanAccion(datosCompletos),
        anexos: this.generarAnexos(datosCompletos)
      };

      // Generar archivo según formato solicitado
      switch (opciones.formato || 'pdf') {
        case 'pdf':
          return await this.generarPDF(estructuraReporte, opciones);
        case 'excel':
          return await this.generarExcel(estructuraReporte, opciones);
        case 'powerpoint':
          return await this.generarPowerPoint(estructuraReporte, opciones);
        case 'json':
          return estructuraReporte;
        default:
          throw new Error('Formato de reporte no soportado');
      }

    } catch (error) {
      throw new Error(`Error generando reporte ejecutivo: ${error.message}`);
    }
  }

  /**
   * Generar insights ejecutivos usando IA
   */
  static async generarInsightsEjecutivos(datosCompletos) {
    const ollamaService = new OllamaService();
    
    const prompt = `
Eres un consultor senior de infraestructura IT. Analiza los siguientes datos de auditoría técnica y genera insights ejecutivos clave.

DATOS DE AUDITORÍA:
- Sitio: ${datosCompletos.auditoria.sitio.nombre}
- Proveedor: ${datosCompletos.auditoria.sitio.proveedor.nombre}
- Puntaje General: ${datosCompletos.puntaje_final}/100
- Período: ${datosCompletos.auditoria.periodo}
- Total Equipos: ${datosCompletos.parque_informatico?.equipos_analizados || 0}

PUNTAJES POR SECCIÓN:
${datosCompletos.puntajes_seccion.map(s => `${s.seccion}: ${s.puntaje}/100`).join('\n')}

INCUMPLIMIENTOS CRÍTICOS:
${datosCompletos.incumplimientos.filter(i => i.criticidad === 'critica').map(i => i.descripcion).join('\n')}

Genera insights en el siguiente formato JSON:
{
  "hallazgos_principales": [
    "Lista de 3-5 hallazgos más importantes encontrados"
  ],
  "tendencias_identificadas": [
    "Patrones o tendencias detectados en los datos"
  ],
  "riesgos_principales": [
    "Principales riesgos identificados para el negocio"
  ],
  "oportunidades_mejora": [
    "Oportunidades de mejora más impactantes"
  ],
  "comparacion_benchmark": "Comparación vs estándares de industria",
  "recomendacion_ejecutiva": "Recomendación principal para la gerencia",
  "impacto_business": "Impacto potencial en el negocio",
  "inversion_sugerida": "Nivel de inversión recomendado (alto/medio/bajo)"
}
`;

    const resultado = await ollamaService.client.generateText('llama3.1:latest', prompt, {
      temperature: 0.2,
      max_tokens: 2000
    });

    if (resultado.success) {
      try {
        return JSON.parse(resultado.content);
      } catch {
        // Si no puede parsear JSON, extraer insights manualmente
        return this.extraerInsightsManual(resultado.content);
      }
    }

    return this.generarInsightsDefault(datosCompletos);
  }

  /**
   * Generar resumen ejecutivo de 2 páginas
   */
  static async generarResumenEjecutivo(datosCompletos, insights) {
    return {
      objetivo: `Auditoría técnica integral del sitio ${datosCompletos.auditoria.sitio.nombre} del proveedor ${datosCompletos.auditoria.sitio.proveedor.razon_social}`,
      
      resultados_generales: {
        puntaje_global: datosCompletos.puntaje_final,
        clasificacion: this.clasificarPuntaje(datosCompletos.puntaje_final),
        equipos_evaluados: datosCompletos.parque_informatico?.equipos_analizados || 0,
        secciones_auditadas: datosCompletos.puntajes_seccion.length,
        fecha_auditoria: datosCompletos.auditoria.fecha_visita_realizada
      },

      hallazgos_principales: insights.hallazgos_principales || [
        'Sin hallazgos específicos disponibles'
      ],

      areas_fortaleza: datosCompletos.puntajes_seccion
        .filter(s => s.puntaje >= 85)
        .map(s => ({
          seccion: s.seccion,
          puntaje: s.puntaje,
          descripcion: `Excelente cumplimiento en ${s.seccion}`
        })),

      areas_mejora: datosCompletos.puntajes_seccion
        .filter(s => s.puntaje < 70)
        .map(s => ({
          seccion: s.seccion,
          puntaje: s.puntaje,
          riesgo: s.puntaje < 50 ? 'Alto' : 'Medio',
          descripcion: `Requiere atención prioritaria`
        })),

      impacto_business: insights.impacto_business || 'Impacto medio en operaciones',
      
      recomendacion_ejecutiva: insights.recomendacion_ejecutiva || 
        'Implementar mejoras en áreas críticas identificadas',

      inversion_estimada: insights.inversion_sugerida || 'Media',
      
      proximos_pasos: [
        'Revisar plan de acción detallado',
        'Priorizar implementación por criticidad',
        'Establecer cronograma de mejoras',
        'Asignar recursos necesarios',
        'Programar seguimiento en 90 días'
      ]
    };
  }

  /**
   * Generar reporte consolidado por proveedor
   */
  static async generarReporteConsolidadoProveedor(proveedorId, periodo, opciones = {}) {
    try {
      // Obtener todas las auditorías del proveedor en el período
      const auditorias = await Auditoria.findAll({
        where: { periodo },
        include: [{
          model: Sitio,
          where: { proveedor_id: proveedorId },
          include: ['proveedor']
        }]
      });

      if (auditorias.length === 0) {
        throw new Error('No se encontraron auditorías para el proveedor en el período especificado');
      }

      // Compilar datos de todas las auditorías
      const datosConsolidados = {
        proveedor: auditorias[0].sitio.proveedor,
        periodo,
        total_sitios: auditorias.length,
        auditorias: await Promise.all(
          auditorias.map(a => this.obtenerDatosCompletos(a.id))
        )
      };

      // Calcular métricas consolidadas
      const metricsConsolidadas = this.calcularMetricasConsolidadas(datosConsolidados);

      // Generar insights del proveedor
      const insightsProveedor = await this.generarInsightsProveedor(datosConsolidados);

      const reporteConsolidado = {
        informacion_proveedor: {
          razon_social: datosConsolidados.proveedor.razon_social,
          cuit: datosConsolidados.proveedor.cuit,
          sitios_auditados: datosConsolidados.total_sitios,
          periodo: periodo
        },

        metricas_consolidadas: metricsConsolidadas,
        
        ranking_sitios: this.generarRankingSitios(datosConsolidados.auditorias),
        
        tendencias_proveedor: insightsProveedor.tendencias,
        
        areas_fortaleza_proveedor: insightsProveedor.fortalezas,
        
        oportunidades_mejora_proveedor: insightsProveedor.oportunidades,
        
        comparacion_inter_sitios: this.compararEntreSitios(datosConsolidados.auditorias),
        
        recomendaciones_estrategicas: insightsProveedor.recomendaciones_estrategicas,
        
        plan_mejora_consolidado: await this.generarPlanMejoraConsolidado(datosConsolidados)
      };

      // Generar archivo según formato
      switch (opciones.formato || 'pdf') {
        case 'pdf':
          return await this.generarPDFConsolidado(reporteConsolidado, opciones);
        case 'excel':
          return await this.generarExcelConsolidado(reporteConsolidado, opciones);
        case 'powerpoint':
          return await this.generarPowerPointConsolidado(reporteConsolidado, opciones);
        default:
          return reporteConsolidado;
      }

    } catch (error) {
      throw new Error(`Error generando reporte consolidado: ${error.message}`);
    }
  }

  /**
   * Generar PDF profesional
   */
  static async generarPDF(estructuraReporte, opciones = {}) {
    const doc = new PDFDocument({ 
      size: 'A4', 
      margins: { top: 50, left: 50, right: 50, bottom: 50 }
    });

    const rutaArchivo = path.join(
      process.env.TEMP_DIR || '/tmp',
      `reporte_ejecutivo_${Date.now()}.pdf`
    );

    doc.pipe(require('fs').createWriteStream(rutaArchivo));

    // Página de portada
    this.generarPortadaPDF(doc, estructuraReporte, opciones);
    
    // Resumen ejecutivo
    doc.addPage();
    this.generarResumenEjecutivoPDF(doc, estructuraReporte.resumen_ejecutivo);
    
    // Métricas principales
    doc.addPage();
    this.generarMetricasPDF(doc, estructuraReporte.metricas_principales);
    
    // Análisis detallado por sección
    estructuraReporte.analisis_por_seccion.forEach((seccion, index) => {
      if (index > 0 || estructuraReporte.analisis_por_seccion.length > 3) {
        doc.addPage();
      }
      this.generarSeccionPDF(doc, seccion);
    });

    // Recomendaciones priorizadas
    doc.addPage();
    this.generarRecomendacionesPDF(doc, estructuraReporte.recomendaciones_priorizadas);

    // Plan de acción
    doc.addPage();
    this.generarPlanAccionPDF(doc, estructuraReporte.plan_accion_sugerido);

    doc.end();

    // Esperar a que termine la generación
    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve({
          archivo: rutaArchivo,
          tipo: 'application/pdf',
          nombre: `Reporte_Ejecutivo_${estructuraReporte.resumen_ejecutivo.resultados_generales.fecha_auditoria}.pdf`
        });
      });
    });
  }

  /**
   * Calcular métricas consolidadas para proveedor
   */
  static calcularMetricasConsolidadas(datosConsolidados) {
    const auditorias = datosConsolidados.auditorias;
    
    return {
      puntaje_promedio_proveedor: auditorias.reduce((sum, a) => sum + a.puntaje_final, 0) / auditorias.length,
      
      mejor_sitio: auditorias.reduce((mejor, actual) => 
        actual.puntaje_final > mejor.puntaje_final ? actual : mejor
      ),
      
      sitio_requiere_atencion: auditorias.reduce((peor, actual) => 
        actual.puntaje_final < peor.puntaje_final ? actual : peor
      ),
      
      total_equipos_proveedor: auditorias.reduce((sum, a) => 
        sum + (a.parque_informatico?.equipos_analizados || 0), 0
      ),
      
      equipos_no_conformes: auditorias.reduce((sum, a) => 
        sum + (a.parque_informatico?.equipos_no_conformes || 0), 0
      ),
      
      incumplimientos_criticos_totales: auditorias.reduce((sum, a) => 
        sum + a.incumplimientos.filter(i => i.criticidad === 'critica').length, 0
      ),
      
      tendencia_vs_periodo_anterior: 'Pendiente', // Implementar comparación histórica
      
      areas_consistentemente_fuertes: this.identificarAreasConsistentes(auditorias, 'fortalezas'),
      
      areas_consistentemente_debiles: this.identificarAreasConsistentes(auditorias, 'debilidades'),
      
      variabilidad_entre_sitios: this.calcularVariabilidad(auditorias.map(a => a.puntaje_final))
    };
  }
}

module.exports = ReportGenerator;
```

---

## 📈 DASHBOARDS CUSTOMIZABLES

### **Sistema de Widgets Drag & Drop**

```jsx
// frontend/src/domains/dashboards/components/DashboardCustomizable.jsx
import { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Modal, 
  Form, 
  Select, 
  Input,
  Drawer,
  List,
  Space,
  Tag,
  Tooltip,
  Switch
} from 'antd';
import { 
  DragOutlined, 
  SettingOutlined, 
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useDashboardStore } from '../store/dashboardStore';
import { useAuthStore } from '../../auth/store/authStore';

// Widgets disponibles
import MetricasPrincipales from './widgets/MetricasPrincipales';
import GraficoCumplimiento from './widgets/GraficoCumplimiento';
import RankingProveedores from './widgets/RankingProveedores';
import TendenciasHistoricas from './widgets/TendenciasHistoricas';
import AlertasCriticas from './widgets/AlertasCriticas';
import ProgressoAuditorias from './widgets/ProgressoAuditorias';

const WIDGETS_DISPONIBLES = {
  'metricas_principales': {
    componente: MetricasPrincipales,
    nombre: 'Métricas Principales',
    descripcion: 'KPIs principales del sistema',
    roles_permitidos: ['admin', 'visualizador', 'auditor'],
    tamaño_default: { w: 12, h: 4 }
  },
  'grafico_cumplimiento': {
    componente: GraficoCumplimiento,
    nombre: 'Gráfico de Cumplimiento',
    descripcion: 'Distribución de puntajes de auditoría',
    roles_permitidos: ['admin', 'visualizador'],
    tamaño_default: { w: 6, h: 6 }
  },
  'ranking_proveedores': {
    componente: RankingProveedores,
    nombre: 'Ranking de Proveedores',
    descripcion: 'Ranking por performance',
    roles_permitidos: ['admin', 'visualizador'],
    tamaño_default: { w: 6, h: 8 }
  },
  'tendencias_historicas': {
    componente: TendenciasHistoricas,
    nombre: 'Tendencias Históricas',
    descripcion: 'Evolución de métricas en el tiempo',
    roles_permitidos: ['admin', 'visualizador'],
    tamaño_default: { w: 12, h: 6 }
  },
  'alertas_criticas': {
    componente: AlertasCriticas,
    nombre: 'Alertas Críticas',
    descripcion: 'Notificaciones y alertas del sistema',
    roles_permitidos: ['admin', 'auditor'],
    tamaño_default: { w: 6, h: 4 }
  },
  'progreso_auditorias': {
    componente: ProgressoAuditorias,
    nombre: 'Progreso de Auditorías',
    descripcion: 'Estado actual de auditorías en curso',
    roles_permitidos: ['admin', 'auditor'],
    tamaño_default: { w: 6, h: 6 }
  }
};

function DashboardCustomizable() {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalConfigWidget, setModalConfigWidget] = useState(null);
  const [form] = Form.useForm();

  const { usuario } = useAuthStore();
  const {
    layoutActual,
    widgetsDisponibles,
    configuraciones,
    loading,
    cargarDashboard,
    guardarLayout,
    agregarWidget,
    removerWidget,
    actualizarConfigWidget,
    exportarDashboard,
    compartirDashboard
  } = useDashboardStore();

  useEffect(() => {
    cargarDashboard(usuario.id);
  }, [usuario.id]);

  const widgetsPermitidos = Object.entries(WIDGETS_DISPONIBLES)
    .filter(([key, widget]) => 
      widget.roles_permitidos.includes(usuario.rol) ||
      usuario.rol === 'admin'
    );

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const newLayout = Array.from(layoutActual);
    const [reorderedItem] = newLayout.splice(result.source.index, 1);
    newLayout.splice(result.destination.index, 0, reorderedItem);
    
    guardarLayout(newLayout);
  };

  const agregarNuevoWidget = (tipoWidget) => {
    const widgetConfig = WIDGETS_DISPONIBLES[tipoWidget];
    
    const nuevoWidget = {
      id: `${tipoWidget}_${Date.now()}`,
      tipo: tipoWidget,
      posicion: layoutActual.length,
      configuracion: {
        titulo: widgetConfig.nombre,
        filtros: {},
        ...widgetConfig.tamaño_default
      }
    };

    agregarWidget(nuevoWidget);
    setDrawerVisible(false);
  };

  const configurarWidget = (widgetId) => {
    const widget = layoutActual.find(w => w.id === widgetId);
    if (widget) {
      form.setFieldsValue(widget.configuracion);
      setModalConfigWidget(widget);
    }
  };

  const guardarConfiguracionWidget = () => {
    const valores = form.getFieldsValue();
    actualizarConfigWidget(modalConfigWidget.id, valores);
    setModalConfigWidget(null);
  };

  const renderWidget = (widget, index) => {
    const WidgetComponent = WIDGETS_DISPONIBLES[widget.tipo]?.componente;
    
    if (!WidgetComponent) {
      return (
        <Card>
          <div>Widget no encontrado: {widget.tipo}</div>
        </Card>
      );
    }

    return (
      <Draggable 
        key={widget.id} 
        draggableId={widget.id} 
        index={index}
        isDragDisabled={!modoEdicion}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            style={{
              ...provided.draggableProps.style,
              marginBottom: 16
            }}
          >
            <Card
              title={widget.configuracion.titulo}
              extra={modoEdicion && (
                <Space>
                  <Tooltip title="Configurar">
                    <Button 
                      icon={<SettingOutlined />} 
                      size="small"
                      onClick={() => configurarWidget(widget.id)}
                    />
                  </Tooltip>
                  <Tooltip title="Mover">
                    <div {...provided.dragHandleProps}>
                      <DragOutlined style={{ cursor: 'move' }} />
                    </div>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small"
                      danger
                      onClick={() => removerWidget(widget.id)}
                    />
                  </Tooltip>
                </Space>
              )}
            >
              <WidgetComponent 
                configuracion={widget.configuracion}
                datos={configuraciones[widget.id]}
                usuario={usuario}
              />
            </Card>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="dashboard-customizable">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h2>Mi Dashboard</h2>
          </Col>
          <Col>
            <Space>
              <Switch
                checked={modoEdicion}
                onChange={setModoEdicion}
                checkedChildren="Editando"
                unCheckedChildren="Vista"
              />
              
              {modoEdicion && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setDrawerVisible(true)}
                >
                  Agregar Widget
                </Button>
              )}
              
              <Button 
                icon={<DownloadOutlined />}
                onClick={() => exportarDashboard('pdf')}
              >
                Exportar
              </Button>
              
              <Button 
                icon={<ShareAltOutlined />}
                onClick={() => compartirDashboard()}
              >
                Compartir
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  {layoutActual.map((widget, index) => 
                    renderWidget(widget, index)
                  )}
                  {provided.placeholder}
                </Col>
              </Row>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {layoutActual.length === 0 && !loading && (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3>Dashboard vacío</h3>
          <p>Agrega widgets para comenzar a visualizar tus datos</p>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setModoEdicion(true);
              setDrawerVisible(true);
            }}
          >
            Agregar Primer Widget
          </Button>
        </Card>
      )}

      {/* Drawer para agregar widgets */}
      <Drawer
        title="Agregar Widget"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
      >
        <List
          dataSource={widgetsPermitidos}
          renderItem={([key, widget]) => (
            <List.Item
              actions={[
                <Button 
                  type="primary" 
                  size="small"
                  onClick={() => agregarNuevoWidget(key)}
                >
                  Agregar
                </Button>
              ]}
            >
              <List.Item.Meta
                title={widget.nombre}
                description={widget.descripcion}
              />
              <div>
                {widget.roles_permitidos.map(rol => (
                  <Tag key={rol} size="small">
                    {rol}
                  </Tag>
                ))}
              </div>
            </List.Item>
          )}
        />
      </Drawer>

      {/* Modal de configuración de widget */}
      <Modal
        title="Configurar Widget"
        open={!!modalConfigWidget}
        onOk={guardarConfiguracionWidget}
        onCancel={() => setModalConfigWidget(null)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="titulo" label="Título del Widget">
            <Input placeholder="Título personalizado" />
          </Form.Item>
          
          <Form.Item name="periodo_filtro" label="Período">
            <Select placeholder="Seleccionar período">
              <Select.Option value="ultimo_mes">Último mes</Select.Option>
              <Select.Option value="ultimo_trimestre">Último trimestre</Select.Option>
              <Select.Option value="ultimo_semestre">Último semestre</Select.Option>
              <Select.Option value="ultimo_año">Último año</Select.Option>
            </Select>
          </Form.Item>

          {usuario.rol !== 'proveedor' && (
            <Form.Item name="proveedor_filtro" label="Proveedor">
              <Select placeholder="Todos los proveedores" allowClear>
                {/* Opciones dinámicas de proveedores */}
              </Select>
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="w" label="Ancho (columnas)">
                <Select defaultValue={6}>
                  <Select.Option value={6}>Medio (6)</Select.Option>
                  <Select.Option value={8}>Ancho (8)</Select.Option>
                  <Select.Option value={12}>Completo (12)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="h" label="Alto">
                <Select defaultValue={6}>
                  <Select.Option value={4}>Bajo (4)</Select.Option>
                  <Select.Option value={6}>Medio (6)</Select.Option>
                  <Select.Option value={8}>Alto (8)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

export default DashboardCustomizable;
```

---

## ✅ CRITERIOS DE ACEPTACIÓN DE LA FASE 4

### **Funcionalidades Críticas que Deben Funcionar:**

1. **Workflow de visitas presenciales debe:**
   - Funcionar perfectamente en tablets y smartphones
   - Permitir trabajo offline con sincronización automática
   - Cargar evidencia fotográfica con geolocalización automática
   - Comparar automáticamente hallazgos presenciales con predicciones IA
   - Generar reportes de visita directamente desde móvil

2. **Sistema de reportes debe:**
   - Generar automáticamente reportes ejecutivos de 15-20 páginas por sitio
   - Crear resúmenes ejecutivos de 2 páginas con insights de IA
   - Producir reportes consolidados por proveedor con análisis comparativo
   - Enviar automáticamente reportes por email a stakeholders predefinidos
   - Exportar en múltiples formatos (PDF, Excel, PowerPoint)

3. **Dashboards customizables deben:**
   - Permitir drag & drop de widgets por usuario
   - Filtrar datos según permisos de usuario automáticamente
   - Actualizar en tiempo real sin refresh manual
   - Exportar vistas personalizadas a presentaciones
   - Guardar configuraciones personalizadas por usuario

4. **Sistema de BI debe:**
   - Identificar tendencias automáticamente en datos históricos
   - Generar alertas proactivas por deterioro de métricas
   - Comparar automáticamente contra benchmarks de industria
   - Predecir problemas potenciales basado en patrones

### **Métricas de Rendimiento Final:**
- Generación de reportes ejecutivos: máximo 3 minutos
- Carga de dashboards: máximo 5 segundos
- Sincronización móvil: máximo 30 segundos para 50 fotos
- Precisión de predicciones BI: mínimo 80%
- Satisfacción de usuarios finales: mínimo 85%

---

## 🎯 FINALIZACIÓN COMPLETA DEL PROYECTO

### **Entregables Finales de la Fase 4:**
1. **Aplicación móvil-friendly** completamente funcional
2. **Sistema completo de reportes automáticos** con IA
3. **Dashboards customizables** por rol y usuario
4. **Motor de Business Intelligence** predictivo
5. **Workflow end-to-end completo** desde planificación hasta reportes
6. **Sistema de mejora continua** basado en feedback

### **Criterio de Éxito del Proyecto Completo:**
El proyecto SAT-Digital se considera completamente exitoso cuando:

- **Un ciclo completo de auditoría** (planificación → carga → análisis IA → visita → reportes) puede ejecutarse sin intervención manual significativa
- **Tiempo de procesamiento total** se reduce en 70% versus proceso manual actual
- **Precisión de análisis automático** alcanza 90%+ con validación mínima de auditores
- **Dashboards ejecutivos** proporcionan insights accionables automáticamente
- **Sistema es adoptado exitosamente** por todos los stakeholders (5 proveedores, auditores, gerencia)

### **Próximo Paso:**
📄 **Archivo:** `06-ESTADO-PROYECTO.md`

Control completo de estado del proyecto para seguimiento y continuidad entre conversaciones.

---

> 📌 **PROYECTO COMPLETO:** Con la finalización de la Fase 4, SAT-Digital estará completamente operativo como un sistema de clase empresarial para gestión automatizada de auditorías técnicas con IA integrada.

> 🚀 **IMPACTO ESPERADO:** Transformación completa del proceso manual actual hacia un sistema inteligente que reduce tiempo, aumenta precisión, y proporciona insights estratégicos para la toma de decisiones.