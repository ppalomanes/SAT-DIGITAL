# SAT-Digital: Fase 2 - Gestión de Auditorías
## 🎯 CORE DEL PROCESO DE NEGOCIO

> **Fase:** 2 de 4  
> **Duración estimada:** 3-4 meses  
> **Estado:** ⏳ Pendiente (requiere Fase 1 completada)  
> **Archivo anterior:** 02-FASE-1-INFRAESTRUCTURA.md  
> **Próximo archivo:** 04-FASE-3-IA-ANALISIS.md  
> **Prerequisitos:** ✅ Fase 1 completada con todos los checkpoints

---

## 🎯 OBJETIVOS DE LA FASE 2

Esta fase implementa el proceso completo de gestión de auditorías, desde la planificación hasta la finalización de la carga documental. Es el módulo central que digitaliza completamente el workflow actual manual.

### **Objetivos Específicos:**
1. **Calendario programable de auditorías** con configuración automática de períodos
2. **Sistema de carga documental por secciones** con validación automática
3. **Chat asíncrono integrado** para comunicación proveedor-auditor contextual
4. **Sistema completo de notificaciones** por email y plataforma
5. **Panel de control para auditores** con seguimiento en tiempo real
6. **Workflow de estados automatizado** con transiciones controladas
7. **Dashboard de progreso** para visualizar el estado de todas las auditorías

---

## 📋 CHECKPOINTS DE LA FASE 2

### **Checkpoint 2.1: Calendario y Planificación (Semana 1-3)**
**Criterios de éxito:**
- [ ] Módulo de configuración de períodos de auditoría funcionando
- [ ] Calendario visual con cronograma de visitas implementado
- [ ] Sistema de asignación de auditores a sitios operativo
- [ ] Generación automática de auditorías para todos los sitios
- [ ] Validación de fechas y resolución de conflictos de calendario

**Entregables:**
- Interfaz de configuración de períodos de auditoría
- Calendario interactivo con vista mensual y semanal
- Sistema de asignación y reasignación de auditores
- Reportes de planificación por período

**Validación:**
```
Criterio: Un administrador puede configurar un nuevo período 
(ej: Noviembre 2025) y el sistema debe:
1. Crear automáticamente 12 auditorías (una por sitio)
2. Asignar auditores según disponibilidad
3. Generar cronograma de visitas optimizado
4. Enviar notificaciones a todos los stakeholders
```

### **Checkpoint 2.2: Sistema de Carga Documental (Semana 3-6)**
**Criterios de éxito:**
- [ ] Interfaz de carga por secciones completamente funcional
- [ ] Validación automática de formatos y tipos de archivo
- [ ] Sistema de guardado parcial y recuperación de sesión
- [ ] Control de versiones automático para documentos actualizados
- [ ] Progreso visual por sección y auditoría completa

**Entregables:**
- Componente de carga drag-and-drop con validación
- Sistema de previsualización de documentos
- Indicadores de progreso por sección y total
- Historial de versiones por documento

**Validación:**
```
Criterio: Un proveedor puede cargar documentación y el sistema debe:
1. Validar formato y tamaño de cada archivo
2. Mostrar progreso en tiempo real
3. Permitir guardar parcialmente y retomar después
4. Generar nuevas versiones si actualiza documentos
5. Notificar automáticamente al auditor asignado
```

### **Checkpoint 2.3: Sistema de Comunicación Asíncrona (Semana 4-7)**
**Criterios de éxito:**
- [ ] Chat contextual por auditoría completamente operativo
- [ ] Categorización automática de mensajes implementada
- [ ] Sistema de notificaciones en tiempo real funcionando
- [ ] Historial completo de conversaciones accesible
- [ ] Integración con sistema de estados de auditoría

**Entregables:**
- Componente de chat con mensajería contextual
- Sistema de notificaciones push y email
- Panel de gestión de consultas para auditores
- Exportación de conversaciones para documentación

**Validación:**
```
Criterio: Durante una auditoría activa:
1. Proveedor puede enviar consulta sobre sección específica
2. Auditor recibe notificación inmediata por email y plataforma
3. Conversación queda vinculada a la auditoría y sección
4. Sistema mantiene historial completo accesible
5. Estados de mensaje se actualizan correctamente
```

### **Checkpoint 2.4: Notificaciones y Alertas (Semana 6-8)**
**Criterios de éxito:**
- [ ] Sistema de email automático configurado y funcionando
- [ ] Notificaciones push en la plataforma operativas
- [ ] Alertas de tiempo límite automáticas implementadas
- [ ] Personalización de frecuencia por tipo de usuario
- [ ] Dashboard de notificaciones para administradores

**Entregables:**
- Servicio de email con templates personalizados
- Sistema de notificaciones en tiempo real
- Configuración de alertas personalizables
- Panel de administración de notificaciones

**Validación:**
```
Criterio: Sistema de notificaciones debe:
1. Enviar email de inicio de período a todos los proveedores
2. Recordatorios automáticos a 7, 3 y 1 día del vencimiento
3. Alertas instantáneas por nuevos mensajes en chat
4. Notificaciones de cambio de estado de auditoría
5. Resumen diario para auditores con pendientes
```

### **Checkpoint 2.5: Panel de Control para Auditores (Semana 8-10)**
**Criterios de éxito:**
- [ ] Dashboard de auditorías asignadas completamente funcional
- [ ] Visualización de progreso por sitio en tiempo real
- [ ] Sistema de seguimiento de consultas pendientes
- [ ] Herramientas de revisión documental integradas
- [ ] Reportes de estado exportables

**Entregables:**
- Dashboard personalizado por auditor
- Herramientas de revisión y validación documental
- Sistema de seguimiento de tareas pendientes
- Generador de reportes de progreso

**Validación:**
```
Criterio: Un auditor puede:
1. Ver todas sus auditorías asignadas en dashboard
2. Filtrar por estado, proveedor, fecha límite
3. Acceder directamente a documentos para revisión
4. Responder consultas desde el mismo panel
5. Generar reporte de estado de sus auditorías
```

### **Checkpoint 2.6: Workflow de Estados y Finalización (Semana 10-12)**
**Criterios de éxito:**
- [ ] Transiciones de estado automatizadas funcionando correctamente
- [ ] Validación de completitud antes de cambios de estado
- [ ] Sistema de aprobación de finalización implementado
- [ ] Generación automática de snapshots de estado
- [ ] Integración completa con módulo de bitácora

**Entregables:**
- Motor de workflow con validaciones automáticas
- Sistema de aprobaciones por rol
- Generador de snapshots de auditoría
- Reportes de auditorías finalizadas

**Validación:**
```
Criterio: Workflow de estados debe:
1. Permitir solo transiciones válidas según reglas de negocio
2. Validar completitud antes de pasar a "Pendiente Evaluación"
3. Generar snapshot completo al finalizar carga
4. Registrar todos los cambios en bitácora
5. Notificar automáticamente a stakeholders relevantes
```

---

## 🗓️ MÓDULO DE CALENDARIO Y PLANIFICACIÓN

### **Arquitectura del Sistema de Calendario**

El sistema de calendario maneja la complejidad de coordinar múltiples auditorías, auditores, y sitios distribuidos geográficamente.

**Componentes Principales:**
```
CalendarioModule/
├── controllers/
│   ├── PeriodoController.js      # Gestión de períodos de auditoría
│   ├── CalendarioController.js   # Operaciones de calendario
│   └── AsignacionController.js   # Asignación de auditores
├── services/
│   ├── PlanificacionService.js   # Lógica de planificación automática
│   ├── OptimizacionService.js    # Optimización de rutas y fechas
│   └── ConflictoService.js       # Resolución de conflictos
├── models/
│   ├── Periodo.js               # Modelo de período de auditoría
│   ├── AsignacionAuditor.js     # Asignaciones auditor-sitio
│   └── ConfiguracionCalendario.js # Configuración del sistema
└── validators/
    ├── PeriodoValidator.js      # Validaciones de período
    └── CalendarioValidator.js   # Validaciones de calendario
```

### **Base de Datos - Nuevas Tablas**

**Tabla: periodos_auditoria**
```sql
CREATE TABLE periodos_auditoria (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL, -- "Mayo 2025", "Noviembre 2025"
  codigo VARCHAR(20) NOT NULL UNIQUE, -- "2025-05", "2025-11"
  fecha_inicio DATE NOT NULL,
  fecha_limite_carga DATE NOT NULL,
  fecha_inicio_visitas DATE NOT NULL,
  fecha_fin_visitas DATE NOT NULL,
  estado ENUM('planificacion', 'activo', 'carga', 'visitas', 'cerrado') DEFAULT 'planificacion',
  configuracion_especial JSON, -- Excepciones, días no laborables, etc.
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES usuarios(id)
);
```

**Tabla: asignaciones_auditor**
```sql
CREATE TABLE asignaciones_auditor (
  id INT PRIMARY KEY AUTO_INCREMENT,
  auditoria_id INT NOT NULL,
  auditor_id INT NOT NULL,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_visita_programada DATE,
  prioridad ENUM('baja', 'normal', 'alta') DEFAULT 'normal',
  observaciones TEXT,
  estado_asignacion ENUM('asignado', 'confirmado', 'reagendado', 'completado') DEFAULT 'asignado',
  FOREIGN KEY (auditoria_id) REFERENCES auditorias(id),
  FOREIGN KEY (auditor_id) REFERENCES usuarios(id),
  UNIQUE KEY unique_asignacion (auditoria_id, auditor_id)
);
```

### **Servicio de Planificación Automática**

```javascript
// backend/src/domains/calendario/services/PlanificacionService.js
const dayjs = require('dayjs');
const { Auditoria, Sitio, Usuario, AsignacionAuditor } = require('../../../shared/database/models');

class PlanificacionService {
  /**
   * Genera automáticamente todas las auditorías para un período
   * Optimiza asignaciones considerando ubicación geográfica y disponibilidad
   */
  static async generarAuditoriasPeriodo(periodoId, configuracion) {
    try {
      const periodo = await PeriodoAuditoria.findByPk(periodoId);
      if (!periodo) {
        throw new Error('Período no encontrado');
      }

      // Obtener todos los sitios activos
      const sitios = await Sitio.findAll({
        where: { estado: 'activo' },
        include: ['proveedor']
      });

      // Obtener auditores disponibles
      const auditores = await Usuario.findAll({
        where: { rol: 'auditor', estado: 'activo' }
      });

      const auditorias = [];

      // Crear auditoría para cada sitio
      for (const sitio of sitios) {
        const auditoria = await Auditoria.create({
          sitio_id: sitio.id,
          periodo: periodo.codigo,
          fecha_inicio: periodo.fecha_inicio,
          fecha_limite_carga: periodo.fecha_limite_carga,
          estado: 'programada'
        });

        auditorias.push(auditoria);

        // Asignar auditor óptimo
        const auditorOptimo = await this.seleccionarAuditorOptimo(
          sitio, auditores, periodo
        );

        if (auditorOptimo) {
          await AsignacionAuditor.create({
            auditoria_id: auditoria.id,
            auditor_id: auditorOptimo.auditor_id,
            fecha_visita_programada: auditorOptimo.fecha_sugerida,
            observaciones: auditorOptimo.razon_asignacion
          });
        }
      }

      await this.optimizarCronograma(auditorias, periodo);

      return {
        auditorias_creadas: auditorias.length,
        periodo: periodo.codigo,
        resumen_asignaciones: await this.generarResumenAsignaciones(periodo.id)
      };

    } catch (error) {
      throw new Error(`Error generando auditorías: ${error.message}`);
    }
  }

  /**
   * Selecciona el auditor más adecuado para un sitio específico
   * Considera: carga de trabajo, ubicación, experiencia previa
   */
  static async seleccionarAuditorOptimo(sitio, auditores, periodo) {
    const criterios = [];

    for (const auditor of auditores) {
      // Calcular carga de trabajo actual
      const cargaActual = await AsignacionAuditor.count({
        include: {
          model: Auditoria,
          where: { periodo: periodo.codigo }
        },
        where: { auditor_id: auditor.id }
      });

      // Calcular score de ubicación (implementar lógica geográfica)
      const scoreUbicacion = this.calcularScoreUbicacion(sitio, auditor);

      // Experiencia previa con el proveedor
      const experienciaPrevia = await this.calcularExperienciaPrevia(
        auditor.id, sitio.proveedor_id
      );

      criterios.push({
        auditor_id: auditor.id,
        score_total: this.calcularScoreTotal({
          carga_trabajo: cargaActual,
          ubicacion: scoreUbicacion,
          experiencia: experienciaPrevia
        }),
        carga_actual: cargaActual,
        fecha_sugerida: this.calcularFechaSugerida(auditor, periodo)
      });
    }

    // Ordenar por score y seleccionar el mejor
    criterios.sort((a, b) => b.score_total - a.score_total);
    
    if (criterios.length > 0) {
      const seleccionado = criterios[0];
      seleccionado.razon_asignacion = `Score: ${seleccionado.score_total}, Carga: ${seleccionado.carga_actual}`;
      return seleccionado;
    }

    return null;
  }

  /**
   * Optimiza el cronograma completo para minimizar viajes y maximizar eficiencia
   */
  static async optimizarCronograma(auditorias, periodo) {
    // Agrupar por auditor y región
    const asignacionesPorAuditor = await this.agruparPorAuditor(auditorias);

    for (const [auditorId, asignaciones] of asignacionesPorAuditor) {
      // Ordenar por proximidad geográfica
      const rutaOptima = await this.calcularRutaOptima(asignaciones);
      
      // Asignar fechas considerando la ruta óptima
      let fechaActual = dayjs(periodo.fecha_inicio_visitas);
      
      for (const asignacion of rutaOptima) {
        // Evitar fines de semana y feriados
        fechaActual = this.siguienteDiaHabil(fechaActual);
        
        await AsignacionAuditor.update(
          { fecha_visita_programada: fechaActual.toDate() },
          { where: { id: asignacion.id } }
        );

        // Dejar un día entre visitas para imprevistos
        fechaActual = fechaActual.add(2, 'day');
      }
    }
  }
}

module.exports = PlanificacionService;
```

### **Interfaz de Calendario**

```jsx
// frontend/src/domains/calendario/components/CalendarioAuditorias.jsx
import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Badge, 
  Card, 
  Button, 
  Modal, 
  List, 
  Tag, 
  Tooltip 
} from 'antd';
import dayjs from 'dayjs';
import { useCalendarioStore } from '../store/calendarioStore';

function CalendarioAuditorias() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [modalVisible, setModalVisible] = useState(false);
  const [auditoriasDelDia, setAuditoriasDelDia] = useState([]);

  const {
    auditorias,
    asignaciones,
    loading,
    obtenerAuditoriasDelPeriodo,
    actualizarAsignacion
  } = useCalendarioStore();

  useEffect(() => {
    // Cargar auditorías del período actual
    obtenerAuditoriasDelPeriodo();
  }, []);

  const dateCellRender = (value) => {
    const fechaStr = value.format('YYYY-MM-DD');
    const asignacionesDelDia = asignaciones.filter(
      asignacion => dayjs(asignacion.fecha_visita_programada).format('YYYY-MM-DD') === fechaStr
    );

    return (
      <ul className="events">
        {asignacionesDelDia.map(asignacion => (
          <li key={asignacion.id}>
            <Tooltip title={`${asignacion.sitio.nombre} - ${asignacion.auditor.nombre}`}>
              <Badge 
                status={getStatusColor(asignacion.estado_asignacion)} 
                text={asignacion.sitio.nombre}
              />
            </Tooltip>
          </li>
        ))}
      </ul>
    );
  };

  const onSelect = (date) => {
    setSelectedDate(date);
    const fechaStr = date.format('YYYY-MM-DD');
    const auditoriasDelDia = asignaciones.filter(
      asignacion => dayjs(asignacion.fecha_visita_programada).format('YYYY-MM-DD') === fechaStr
    );
    setAuditoriasDelDia(auditoriasDelDia);
    setModalVisible(true);
  };

  const getStatusColor = (estado) => {
    const colores = {
      'asignado': 'default',
      'confirmado': 'processing',
      'reagendado': 'warning',
      'completado': 'success'
    };
    return colores[estado] || 'default';
  };

  const handleReasignar = async (asignacionId, nuevaFecha) => {
    try {
      await actualizarAsignacion(asignacionId, {
        fecha_visita_programada: nuevaFecha,
        estado_asignacion: 'reagendado'
      });
      // Actualizar vista
      obtenerAuditoriasDelPeriodo();
    } catch (error) {
      console.error('Error reasignando:', error);
    }
  };

  return (
    <div className="calendario-auditorias">
      <Card 
        title="Cronograma de Auditorías"
        extra={
          <Button type="primary" onClick={() => setModalVisible(true)}>
            Optimizar Cronograma
          </Button>
        }
      >
        <Calendar 
          dateCellRender={dateCellRender}
          onSelect={onSelect}
          loading={loading}
        />
      </Card>

      <Modal
        title={`Auditorías del ${selectedDate.format('DD/MM/YYYY')}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={null}
      >
        <List
          dataSource={auditoriasDelDia}
          renderItem={asignacion => (
            <List.Item
              actions={[
                <Button 
                  size="small" 
                  onClick={() => handleReasignar(asignacion.id, selectedDate)}
                >
                  Reasignar
                </Button>
              ]}
            >
              <List.Item.Meta
                title={asignacion.sitio.nombre}
                description={
                  <>
                    <Tag color="blue">{asignacion.auditor.nombre}</Tag>
                    <Tag color={getStatusColor(asignacion.estado_asignacion)}>
                      {asignacion.estado_asignacion}
                    </Tag>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
}

export default CalendarioAuditorias;
```

---

## 📄 MÓDULO DE CARGA DOCUMENTAL

### **Arquitectura del Sistema de Documentos**

**Componentes Principales:**
```
DocumentosModule/
├── controllers/
│   ├── CargaController.js       # Gestión de carga de documentos
│   ├── ValidacionController.js  # Validaciones de formato
│   └── VersionController.js     # Control de versiones
├── services/
│   ├── AlmacenamientoService.js # Gestión de archivos físicos
│   ├── ValidacionService.js     # Validaciones de negocio
│   └── VersionadoService.js     # Control de versiones
├── middleware/
│   ├── upload.middleware.js     # Configuración de multer
│   └── validacion.middleware.js # Validaciones en tiempo real
└── utils/
    ├── fileProcessor.js         # Procesamiento de archivos
    └── hashGenerator.js         # Generación de checksums
```

### **Sistema de Validación Automática**

```javascript
// backend/src/domains/documentos/services/ValidacionService.js
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { z } = require('zod');

class ValidacionService {
  // Esquemas de validación por tipo de sección
  static esquemas = {
    'topologia': z.object({
      tipo_archivo: z.enum(['pdf']),
      tamaño_max: z.number().max(50 * 1024 * 1024), // 50MB
      nombre_patron: z.string().regex(/topologia.*\.pdf$/i)
    }),
    'cuarto_tecnologia': z.object({
      tipo_archivo: z.enum(['pdf', 'jpg', 'png', 'xlsx']),
      tamaño_max: z.number().max(100 * 1024 * 1024), // 100MB
      archivos_requeridos: z.array(z.string()).min(2) // Mínimo fotos + inventario
    }),
    'parque_informatico': z.object({
      tipo_archivo: z.enum(['xlsx']),
      tamaño_max: z.number().max(10 * 1024 * 1024), // 10MB
      columnas_requeridas: z.array(z.string()).includes([
        'Sitio', 'Hostname', 'Procesador marca', 'RAM', 'Sistema Operativo'
      ])
    })
  };

  /**
   * Valida un documento según su sección técnica
   */
  static async validarDocumento(archivo, seccionCodigo, metadata = {}) {
    try {
      const validaciones = [];

      // Validación básica del archivo
      const validacionBasica = await this.validacionBasica(archivo);
      validaciones.push(validacionBasica);

      // Validación específica por sección
      const validacionSeccion = await this.validacionPorSeccion(
        archivo, seccionCodigo, metadata
      );
      validaciones.push(validacionSeccion);

      // Validación de contenido (si es necesario)
      const validacionContenido = await this.validacionContenido(
        archivo, seccionCodigo
      );
      validaciones.push(validacionContenido);

      // Compilar resultado
      const errores = validaciones.flatMap(v => v.errores).filter(Boolean);
      const warnings = validaciones.flatMap(v => v.warnings).filter(Boolean);

      return {
        valido: errores.length === 0,
        errores,
        warnings,
        metadata: {
          hash: await this.calcularHash(archivo.path),
          tamaño: archivo.size,
          tipo: archivo.mimetype,
          validado_en: new Date()
        }
      };

    } catch (error) {
      return {
        valido: false,
        errores: [`Error durante validación: ${error.message}`],
        warnings: [],
        metadata: null
      };
    }
  }

  /**
   * Validaciones básicas aplicables a todos los archivos
   */
  static async validacionBasica(archivo) {
    const errores = [];
    const warnings = [];

    // Verificar que el archivo existe y es legible
    try {
      await fs.access(archivo.path);
    } catch (error) {
      errores.push('Archivo no accesible o corrupto');
      return { errores, warnings };
    }

    // Validar tamaño (máximo 200MB)
    if (archivo.size > 200 * 1024 * 1024) {
      errores.push('Archivo excede el tamaño máximo permitido (200MB)');
    }

    // Validar nombre de archivo
    if (!/^[\w\-. ]+$/i.test(archivo.originalname)) {
      errores.push('Nombre de archivo contiene caracteres no permitidos');
    }

    // Verificar que no esté vacío
    if (archivo.size === 0) {
      errores.push('Archivo está vacío');
    }

    // Warning para archivos muy antiguos en fecha de modificación
    const stats = await fs.stat(archivo.path);
    const diasAntiguedad = (Date.now() - stats.mtime) / (1000 * 60 * 60 * 24);
    if (diasAntiguedad > 365) {
      warnings.push('Archivo parece ser muy antiguo (más de 1 año)');
    }

    return { errores, warnings };
  }

  /**
   * Validaciones específicas según la sección técnica
   */
  static async validacionPorSeccion(archivo, seccionCodigo, metadata) {
    const errores = [];
    const warnings = [];

    switch (seccionCodigo) {
      case 'parque_informatico':
        return await this.validarParqueInformatico(archivo, metadata);
      
      case 'cuarto_tecnologia':
        return await this.validarCuartoTecnologia(archivo, metadata);
      
      case 'topologia':
        return await this.validarTopologia(archivo, metadata);
      
      default:
        // Validación genérica para otras secciones
        if (!['pdf', 'jpg', 'jpeg', 'png', 'xlsx', 'docx'].includes(
          archivo.mimetype.split('/')[1]
        )) {
          errores.push('Tipo de archivo no permitido para esta sección');
        }
    }

    return { errores, warnings };
  }

  /**
   * Validación específica para archivos Excel de parque informático
   */
  static async validarParqueInformatico(archivo, metadata) {
    const errores = [];
    const warnings = [];

    // Debe ser Excel
    if (!archivo.mimetype.includes('spreadsheet')) {
      errores.push('El parque informático debe cargarse en formato Excel (.xlsx)');
      return { errores, warnings };
    }

    try {
      // Leer y validar estructura del Excel (implementar con biblioteca como xlsx)
      const workbook = await this.leerExcel(archivo.path);
      
      // Validar columnas requeridas
      const columnasRequeridas = [
        'Sitio', 'Proveedor', 'Atención', 'Hostname',
        'Procesador marca', 'Procesador modelo', 'RAM',
        'Sistema Operativo', 'Antivirus'
      ];

      const primeraHoja = workbook.Sheets[workbook.SheetNames[0]];
      const columnasEncontradas = this.extraerColumnas(primeraHoja);

      for (const columna of columnasRequeridas) {
        if (!columnasEncontradas.includes(columna)) {
          errores.push(`Columna requerida faltante: ${columna}`);
        }
      }

      // Validar que tenga datos (más de solo cabecera)
      const filas = this.contarFilas(primeraHoja);
      if (filas < 2) {
        errores.push('El archivo debe contener al menos un equipo además de la cabecera');
      } else if (filas > 1000) {
        warnings.push(`Archivo contiene ${filas} equipos. Considere dividir si hay problemas de rendimiento.`);
      }

    } catch (error) {
      errores.push(`Error procesando archivo Excel: ${error.message}`);
    }

    return { errores, warnings };
  }

  /**
   * Genera hash del archivo para detectar duplicados y cambios
   */
  static async calcularHash(rutaArchivo) {
    const contenido = await fs.readFile(rutaArchivo);
    return crypto.createHash('sha256').update(contenido).digest('hex');
  }
}

module.exports = ValidacionService;
```

### **Componente de Carga con Drag & Drop**

```jsx
// frontend/src/domains/documentos/components/CargaDocumental.jsx
import { useState, useCallback } from 'react';
import { 
  Card, 
  Progress, 
  Upload, 
  Button, 
  Alert, 
  List, 
  Tag, 
  Modal 
} from 'antd';
import { 
  InboxOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { useCargaDocumentalStore } from '../store/cargaStore';

const { Dragger } = Upload;

function CargaDocumental({ auditoriaId, seccionId, onComplete }) {
  const [archivosEnCarga, setArchivosEnCarga] = useState([]);
  const [progreso, setProgreso] = useState(0);
  
  const {
    cargarDocumento,
    validarDocumento,
    obtenerHistorialVersiones,
    loading,
    error
  } = useCargaDocumentalStore();

  const props = {
    name: 'documento',
    multiple: true,
    accept: '.pdf,.jpg,.jpeg,.png,.xlsx,.docx',
    customRequest: async ({ file, onProgress, onSuccess, onError }) => {
      try {
        // Validación previa
        const validacion = await validarDocumento(file, seccionId);
        
        if (!validacion.valido) {
          Modal.error({
            title: 'Error de Validación',
            content: (
              <ul>
                {validacion.errores.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            )
          });
          onError(new Error('Validación fallida'));
          return;
        }

        // Mostrar warnings si los hay
        if (validacion.warnings.length > 0) {
          Modal.warning({
            title: 'Advertencias',
            content: (
              <ul>
                {validacion.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            )
          });
        }

        // Proceder con la carga
        const resultado = await cargarDocumento(
          auditoriaId,
          seccionId,
          file,
          {
            onProgress: (percent) => {
              onProgress({ percent });
              setProgreso(percent);
            }
          }
        );

        onSuccess(resultado);
        
        // Actualizar lista de archivos cargados
        setArchivosEnCarga(prev => [...prev, {
          id: resultado.id,
          nombre: file.name,
          estado: 'completado',
          tamaño: file.size,
          hash: resultado.hash
        }]);

      } catch (error) {
        console.error('Error en carga:', error);
        onError(error);
      }
    },
    
    onChange(info) {
      const { status } = info.file;
      
      if (status === 'uploading') {
        setProgreso(info.file.percent || 0);
      }
      
      if (status === 'done') {
        // Éxito - mostrar notificación
        Modal.success({
          title: 'Archivo Cargado',
          content: `${info.file.name} se cargó correctamente.`
        });
      } else if (status === 'error') {
        // Error - mostrar detalles
        Modal.error({
          title: 'Error de Carga',
          content: `Error cargando ${info.file.name}: ${info.file.error?.message || 'Error desconocido'}`
        });
      }
    }
  };

  const calcularProgresoTotal = useCallback(() => {
    // Calcular progreso basado en secciones completadas
    const totalSecciones = 13; // Según documentación original
    const seccionesCompletadas = archivosEnCarga.filter(
      archivo => archivo.estado === 'completado'
    ).length;
    
    return Math.round((seccionesCompletadas / totalSecciones) * 100);
  }, [archivosEnCarga]);

  return (
    <div className="carga-documental">
      <Card title="Carga de Documentación" className="carga-documental__card">
        
        {error && (
          <Alert
            message="Error en Carga"
            description={error}
            type="error"
            closable
            className="carga-documental__error"
          />
        )}

        <div className="carga-documental__progreso">
          <Progress 
            percent={calcularProgresoTotal()} 
            status={loading ? 'active' : 'normal'}
            format={(percent) => `${percent}% completado`}
          />
        </div>

        <Dragger {...props} className="carga-documental__dragger">
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Haga clic o arrastre archivos a esta área para cargar
          </p>
          <p className="ant-upload-hint">
            Soporta archivos PDF, imágenes (JPG, PNG) y Excel (.xlsx).
            Tamaño máximo: 200MB por archivo.
          </p>
        </Dragger>

        {archivosEnCarga.length > 0 && (
          <Card 
            title="Archivos Cargados" 
            size="small" 
            className="carga-documental__lista"
          >
            <List
              dataSource={archivosEnCarga}
              renderItem={archivo => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<FileTextOutlined />}
                    title={archivo.nombre}
                    description={`${Math.round(archivo.tamaño / 1024)} KB`}
                  />
                  <Tag 
                    color={archivo.estado === 'completado' ? 'green' : 'processing'}
                    icon={archivo.estado === 'completado' ? 
                      <CheckCircleOutlined /> : 
                      <ExclamationCircleOutlined />
                    }
                  >
                    {archivo.estado}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        )}

        <div className="carga-documental__acciones">
          <Button 
            type="primary" 
            onClick={onComplete}
            disabled={calcularProgresoTotal() < 100}
          >
            Finalizar Carga
          </Button>
          
          <Button 
            onClick={() => obtenerHistorialVersiones(auditoriaId)}
          >
            Ver Historial
          </Button>
        </div>

      </Card>
    </div>
  );
}

export default CargaDocumental;
```

---

## 💬 SISTEMA DE COMUNICACIÓN ASÍNCRONA

### **Arquitectura del Chat**

**Componentes Principales:**
```
ComunicacionModule/
├── controllers/
│   ├── MensajeController.js     # Gestión de mensajes
│   ├── ConversacionController.js # Hilos de conversación
│   └── NotificacionController.js # Sistema de notificaciones
├── services/
│   ├── MensajeriaService.js     # Lógica de mensajería
│   ├── NotificacionService.js   # Envío de notificaciones
│   └── ContextoService.js       # Contexto por auditoría
├── models/
│   ├── Mensaje.js              # Modelo de mensaje
│   ├── Conversacion.js         # Hilo de conversación
│   └── NotificacionUsuario.js  # Notificaciones personalizadas
└── websockets/
    ├── chatHandler.js          # Manejo de WebSockets
    └── notificacionHandler.js  # Notificaciones en tiempo real
```

### **Base de Datos - Sistema de Mensajería**

**Tabla: conversaciones**
```sql
CREATE TABLE conversaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  auditoria_id INT NOT NULL,
  seccion_id INT NULL, -- NULL = conversación general
  titulo VARCHAR(255) NOT NULL,
  categoria ENUM('tecnico', 'administrativo', 'solicitud', 'problema') DEFAULT 'tecnico',
  estado ENUM('abierta', 'en_proceso', 'respondida', 'cerrada') DEFAULT 'abierta',
  prioridad ENUM('baja', 'normal', 'alta') DEFAULT 'normal',
  iniciada_por INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (auditoria_id) REFERENCES auditorias(id),
  FOREIGN KEY (seccion_id) REFERENCES secciones_tecnicas(id),
  FOREIGN KEY (iniciada_por) REFERENCES usuarios(id)
);
```

**Tabla: mensajes**
```sql
CREATE TABLE mensajes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  conversacion_id INT NOT NULL,
  usuario_id INT NOT NULL,
  contenido TEXT NOT NULL,
  tipo_mensaje ENUM('texto', 'archivo', 'sistema') DEFAULT 'texto',
  archivo_adjunto VARCHAR(500) NULL,
  referencia_documento_id INT NULL,
  responde_a_mensaje_id BIGINT NULL, -- Para hilos anidados
  estado_mensaje ENUM('enviado', 'leido', 'respondido') DEFAULT 'enviado',
  ip_origen VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (referencia_documento_id) REFERENCES documentos(id),
  FOREIGN KEY (responde_a_mensaje_id) REFERENCES mensajes(id),
  INDEX idx_conversacion_fecha (conversacion_id, created_at),
  INDEX idx_usuario_fecha (usuario_id, created_at)
);
```

**Tabla: notificaciones_usuario**
```sql
CREATE TABLE notificaciones_usuario (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  tipo_notificacion ENUM('mensaje_nuevo', 'respuesta_recibida', 'estado_cambiado', 'plazo_venciendo') NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  enlace_accion VARCHAR(500), -- URL para ir directo al contexto
  leida BOOLEAN DEFAULT FALSE,
  leida_en TIMESTAMP NULL,
  data_adicional JSON, -- Información extra según tipo
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_usuario_leida (usuario_id, leida, created_at)
);
```

### **Servicio de Mensajería**

```javascript
// backend/src/domains/comunicacion/services/MensajeriaService.js
const { Conversacion, Mensaje, Usuario } = require('../../../shared/database/models');
const NotificacionService = require('./NotificacionService');
const WebSocketService = require('./WebSocketService');

class MensajeriaService {
  /**
   * Crear nueva conversación contextual
   */
  static async crearConversacion(auditoriaId, datos, usuarioCreador) {
    try {
      const conversacion = await Conversacion.create({
        auditoria_id: auditoriaId,
        seccion_id: datos.seccion_id || null,
        titulo: datos.titulo,
        categoria: datos.categoria || 'tecnico',
        prioridad: datos.prioridad || 'normal',
        iniciada_por: usuarioCreador.id
      });

      // Mensaje inicial si se proporciona
      if (datos.mensaje_inicial) {
        await this.enviarMensaje(conversacion.id, {
          contenido: datos.mensaje_inicial,
          tipo_mensaje: 'texto'
        }, usuarioCreador);
      }

      // Notificar a auditores correspondientes
      await this.notificarNuevaConversacion(conversacion, usuarioCreador);

      return conversacion;

    } catch (error) {
      throw new Error(`Error creando conversación: ${error.message}`);
    }
  }

  /**
   * Enviar mensaje en conversación existente
   */
  static async enviarMensaje(conversacionId, datosMensaje, usuario) {
    try {
      const conversacion = await Conversacion.findByPk(conversacionId, {
        include: ['auditoria', 'seccion']
      });

      if (!conversacion) {
        throw new Error('Conversación no encontrada');
      }

      // Verificar permisos
      await this.verificarPermisosConversacion(conversacion, usuario);

      const mensaje = await Mensaje.create({
        conversacion_id: conversacionId,
        usuario_id: usuario.id,
        contenido: datosMensaje.contenido,
        tipo_mensaje: datosMensaje.tipo_mensaje || 'texto',
        archivo_adjunto: datosMensaje.archivo_adjunto,
        referencia_documento_id: datosMensaje.referencia_documento_id,
        responde_a_mensaje_id: datosMensaje.responde_a_mensaje_id
      });

      // Actualizar estado de conversación
      await conversacion.update({ 
        estado: 'en_proceso',
        updated_at: new Date() 
      });

      // Notificar en tiempo real via WebSocket
      await WebSocketService.notificarMensajeNuevo(conversacion, mensaje, usuario);

      // Enviar notificaciones por email
      await this.notificarMensajeNuevo(conversacion, mensaje, usuario);

      return mensaje;

    } catch (error) {
      throw new Error(`Error enviando mensaje: ${error.message}`);
    }
  }

  /**
   * Obtener conversaciones de una auditoría
   */
  static async obtenerConversacionesAuditoria(auditoriaId, usuario) {
    try {
      // Filtrar por permisos del usuario
      let whereClause = { auditoria_id: auditoriaId };
      
      if (usuario.rol === 'proveedor') {
        // Los proveedores solo ven conversaciones donde participan
        whereClause = {
          ...whereClause,
          iniciada_por: usuario.id
        };
      }

      const conversaciones = await Conversacion.findAll({
        where: whereClause,
        include: [
          {
            model: Mensaje,
            limit: 5, // Últimos 5 mensajes por conversación
            order: [['created_at', 'DESC']]
          },
          { model: Usuario, as: 'iniciador' },
          { model: SeccioTecnica, as: 'seccion' }
        ],
        order: [['updated_at', 'DESC']]
      });

      return conversaciones;

    } catch (error) {
      throw new Error(`Error obteniendo conversaciones: ${error.message}`);
    }
  }

  /**
   * Marcar conversación como leída
   */
  static async marcarComoLeida(conversacionId, usuarioId) {
    try {
      // Marcar todos los mensajes no leídos como leídos
      await Mensaje.update(
        { estado_mensaje: 'leido' },
        {
          where: {
            conversacion_id: conversacionId,
            usuario_id: { [Op.ne]: usuarioId }, // No marcar propios mensajes
            estado_mensaje: 'enviado'
          }
        }
      );

      // Registrar en bitácora
      await registrarBitacora(
        usuarioId,
        'MENSAJE_LEIDO',
        'Conversacion',
        conversacionId,
        'Conversación marcada como leída'
      );

      return true;

    } catch (error) {
      throw new Error(`Error marcando como leída: ${error.message}`);
    }
  }

  /**
   * Notificar nueva conversación a auditores relevantes
   */
  static async notificarNuevaConversacion(conversacion, usuarioCreador) {
    try {
      // Obtener auditores asignados a la auditoría
      const asignaciones = await AsignacionAuditor.findAll({
        where: { auditoria_id: conversacion.auditoria_id },
        include: ['auditor']
      });

      for (const asignacion of asignaciones) {
        if (asignacion.auditor.id !== usuarioCreador.id) {
          await NotificacionService.enviarNotificacion(
            asignacion.auditor.id,
            'mensaje_nuevo',
            'Nueva consulta técnica',
            `${usuarioCreador.nombre} inició una nueva consulta: ${conversacion.titulo}`,
            `/auditorias/${conversacion.auditoria_id}/conversaciones/${conversacion.id}`
          );
        }
      }

    } catch (error) {
      console.error('Error notificando nueva conversación:', error);
    }
  }

  /**
   * Verificar si usuario tiene permisos para acceder a conversación
   */
  static async verificarPermisosConversacion(conversacion, usuario) {
    switch (usuario.rol) {
      case 'admin':
        return true; // Administradores ven todo

      case 'auditor':
        // Auditores ven conversaciones de auditorías asignadas
        const asignacion = await AsignacionAuditor.findOne({
          where: {
            auditoria_id: conversacion.auditoria_id,
            auditor_id: usuario.id
          }
        });
        if (!asignacion) {
          throw new Error('Sin permisos para acceder a esta conversación');
        }
        break;

      case 'proveedor':
        // Proveedores solo ven conversaciones de sus sitios
        const auditoria = await Auditoria.findByPk(conversacion.auditoria_id, {
          include: {
            model: Sitio,
            include: 'proveedor'
          }
        });
        if (auditoria.sitio.proveedor.id !== usuario.proveedor_id) {
          throw new Error('Sin permisos para acceder a esta conversación');
        }
        break;

      default:
        throw new Error('Rol de usuario no autorizado');
    }

    return true;
  }
}

module.exports = MensajeriaService;
```

### **Componente de Chat**

```jsx
// frontend/src/domains/comunicacion/components/ChatAuditoria.jsx
import { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  List, 
  Input, 
  Button, 
  Avatar, 
  Tag, 
  Upload,
  Dropdown,
  Menu,
  Badge
} from 'antd';
import { 
  SendOutlined, 
  PaperClipOutlined,
  MoreOutlined,
  CheckOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../../auth/store/authStore';

const { TextArea } = Input;

function ChatAuditoria({ auditoriaId, seccionId = null }) {
  const [mensaje, setMensaje] = useState('');
  const [conversacionActiva, setConversacionActiva] = useState(null);
  const chatEndRef = useRef(null);

  const { usuario } = useAuthStore();
  const {
    conversaciones,
    mensajes,
    loading,
    obtenerConversaciones,
    enviarMensaje,
    marcarComoLeida,
    crearConversacion
  } = useChatStore();

  useEffect(() => {
    obtenerConversaciones(auditoriaId);
  }, [auditoriaId]);

  useEffect(() => {
    // Auto scroll al final cuando hay mensajes nuevos
    scrollToBottom();
  }, [mensajes]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnviarMensaje = async () => {
    if (!mensaje.trim()) return;

    try {
      let conversacionId = conversacionActiva;

      // Crear conversación si es la primera vez
      if (!conversacionId && !conversaciones.length) {
        const nuevaConversacion = await crearConversacion(auditoriaId, {
          titulo: seccionId ? 
            `Consulta sobre ${seccionId}` : 
            'Consulta general',
          seccion_id: seccionId,
          categoria: 'tecnico',
          mensaje_inicial: mensaje
        });
        
        conversacionId = nuevaConversacion.id;
        setConversacionActiva(conversacionId);
      } else {
        // Enviar mensaje a conversación existente
        await enviarMensaje(conversacionId, {
          contenido: mensaje,
          tipo_mensaje: 'texto'
        });
      }

      setMensaje('');
      
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviarMensaje();
    }
  };

  const renderMensaje = (mensaje) => (
    <List.Item
      key={mensaje.id}
      className={`mensaje ${mensaje.usuario_id === usuario.id ? 'propio' : 'ajeno'}`}
    >
      <List.Item.Meta
        avatar={
          <Avatar>
            {mensaje.usuario.nombre.charAt(0).toUpperCase()}
          </Avatar>
        }
        title={
          <div className="mensaje-header">
            <span className="mensaje-autor">
              {mensaje.usuario.nombre}
            </span>
            <Tag size="small" color={getRoleColor(mensaje.usuario.rol)}>
              {mensaje.usuario.rol}
            </Tag>
            <span className="mensaje-fecha">
              {dayjs(mensaje.created_at).format('DD/MM HH:mm')}
            </span>
          </div>
        }
        description={
          <div className="mensaje-contenido">
            {mensaje.contenido}
            {mensaje.archivo_adjunto && (
              <div className="mensaje-archivo">
                <PaperClipOutlined /> 
                <a href={mensaje.archivo_adjunto} target="_blank" rel="noopener noreferrer">
                  Ver archivo adjunto
                </a>
              </div>
            )}
          </div>
        }
      />
      <div className="mensaje-estado">
        {mensaje.estado_mensaje === 'leido' && <CheckOutlined />}
      </div>
    </List.Item>
  );

  const getRoleColor = (rol) => {
    const colores = {
      'admin': 'red',
      'auditor': 'blue',
      'proveedor': 'green',
      'visualizador': 'orange'
    };
    return colores[rol] || 'default';
  };

  const menuConversaciones = (
    <Menu>
      {conversaciones.map(conv => (
        <Menu.Item 
          key={conv.id}
          onClick={() => setConversacionActiva(conv.id)}
        >
          <Badge dot={conv.mensajes_no_leidos > 0}>
            {conv.titulo}
          </Badge>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Card 
      title="Comunicación" 
      className="chat-auditoria"
      extra={
        conversaciones.length > 1 && (
          <Dropdown overlay={menuConversaciones}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        )
      }
    >
      <div className="chat-mensajes">
        <List
          dataSource={mensajes}
          renderItem={renderMensaje}
          loading={loading}
        />
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <TextArea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escriba su consulta aquí..."
          autoSize={{ minRows: 2, maxRows: 6 }}
        />
        
        <div className="chat-acciones">
          <Upload
            beforeUpload={() => false} // Prevenir carga automática
            onChange={() => {}} // Manejar archivo adjunto
          >
            <Button icon={<PaperClipOutlined />} size="small">
              Adjuntar
            </Button>
          </Upload>
          
          <Button 
            type="primary" 
            icon={<SendOutlined />}
            onClick={handleEnviarMensaje}
            disabled={!mensaje.trim()}
          >
            Enviar
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default ChatAuditoria;
```

---

## ✅ CRITERIOS DE ACEPTACIÓN DE LA FASE 2

### **Funcionalidades Críticas que Deben Funcionar:**

1. **Administrador puede:**
   - Configurar nuevos períodos de auditoría semestrales
   - Generar automáticamente auditorías para todos los sitios
   - Asignar y reasignar auditores a sitios específicos
   - Visualizar progreso de todas las auditorías en dashboard

2. **Proveedor puede:**
   - Cargar documentos por sección con validación automática
   - Ver progreso de su carga en tiempo real
   - Enviar consultas técnicas contextuales via chat
   - Recibir notificaciones de recordatorios y respuestas

3. **Auditor puede:**
   - Ver todas sus auditorías asignadas en panel de control
   - Revisar documentos cargados por los proveedores
   - Responder consultas de manera contextual
   - Generar reportes de estado de sus auditorías

4. **Sistema debe:**
   - Validar automáticamente formatos y contenido de documentos
   - Enviar notificaciones automáticas según cronograma
   - Mantener historial completo de comunicaciones
   - Manejar control de versiones de documentos automáticamente

### **Métricas de Rendimiento:**
- Carga de documentos: máximo 30 segundos para archivos de 100MB
- Respuesta de chat: menos de 2 segundos
- Notificaciones por email: entregadas en menos de 5 minutos
- Dashboard: actualización en tiempo real sin refresh manual

---

## ➡️ FINALIZACIÓN DE FASE 2

### **Entregables Finales:**
1. **Sistema completo de gestión de auditorías** funcionando end-to-end
2. **Chat asíncrono contextual** con notificaciones automáticas  
3. **Sistema de validación documental** automatizado
4. **Dashboards operativos** para todos los roles
5. **Documentación técnica** actualizada con APIs

### **Criterio de Continuidad:**
La Fase 2 se considera completa cuando un flujo completo de auditoría puede ejecutarse desde configuración hasta finalización de carga documental, con todas las comunicaciones y notificaciones funcionando.

### **Próximo Paso:**
📄 **Archivo:** `04-FASE-3-IA-ANALISIS.md`

El sistema estará listo para integrar capacidades de inteligencia artificial para análisis automático de documentos y generación de puntajes preliminares.

---

> 📌 **NOTA CRÍTICA:** La Fase 2 es el corazón operativo del sistema. No proceder a Fase 3 hasta que todos los workflows estén completamente funcionales y probados con datos reales.