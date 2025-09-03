# SAT-Digital: Prompts de Continuidad

## 🔄 GUÍAS PARA CONTINUAR EN NUEVOS CHATS

> **Archivo:** Prompts predefinidos para continuidad
> **Propósito:** Mantener contexto completo entre conversaciones
> **Última actualización:** Agosto 2025

---

## 📋 ÍNDICE DE PROMPTS

1. **[Prompt General](#prompt-general)** - Para cualquier situación
2. **[Prompt por Fase](#prompts-por-fase)** - Específico por fase de desarrollo
3. **[Prompt de Troubleshooting](#prompt-troubleshooting)** - Para resolución de problemas
4. **[Prompt de Review](#prompt-review)** - Para revisión de código/progreso
5. **[Prompt de Deployment](#prompt-deployment)** - Para producción/deployment

---

## 🎯 PROMPT GENERAL

**Usar cuando:** Retomar el proyecto desde cualquier punto

```text
Estoy continuando el desarrollo del proyecto SAT-Digital - Sistema de Auditorías Técnicas con IA.

CONTEXTO DEL PROYECTO:
- Sistema para digitalizar auditorías técnicas de infraestructura de centros de datos
- Stack tecnológico: Node.js 18, MySQL (XAMPP), React 18, Ollama IA local
- 5 proveedores, 12 sitios, auditorías semestrales (mayo/noviembre)
- Proceso actual manual con ~520 documentos por período que debe automatizarse

OBJETIVOS PRINCIPALES:
- Automatización del 70% del proceso de análisis documental
- Análisis automático con IA local (Ollama + LLaVA + Llama 3.1)
- Reducción del 80% en tiempo de procesamiento
- Dashboards ejecutivos en tiempo real
- Comercialización como SaaS ($500-2000/mes por cliente)

METODOLOGÍA DE DESARROLLO:
- Bibliotecas JS obligatorias: zod, day.js, tanstack-table, auth.js, motion, fontsource, chart.js, zustand, formkit-drag-and-drop, hotkeys-js
- Metodología BEM para CSS
- Separación por dominios
- Código limpio sin hardcoding ni estilos inline
- Documentación por fases actualizada

ESTADO ACTUAL:
Consultar: C:\xampp\htdocs\SAT-Digital\documentacion\06-ESTADO-PROYECTO.md

DOCUMENTACIÓN COMPLETA:
C:\xampp\htdocs\SAT-Digital\documentacion\
- 01-DOCUMENTO-MAESTRO.md (visión completa)
- 02-FASE-1-INFRAESTRUCTURA.md (base técnica)
- 03-FASE-2-GESTION-AUDITORIAS.md (core negocio)
- 04-FASE-3-IA-ANALISIS.md (automatización IA)
- 05-FASE-4-VISITAS-REPORTES.md (workflow final)
- 07-CHECKPOINTS-GENERAL.md (control progreso)

DATOS DE REFERENCIA:
C:\xampp\htdocs\Auditorias\2025\ (proceso actual manual)

PRÓXIMA ACCIÓN ESPECÍFICA:
[INDICAR AQUÍ LA ACCIÓN ESPECÍFICA A CONTINUAR]

Por favor, ayúdame con [ACCIÓN ESPECÍFICA], manteniendo la arquitectura definida y usando las bibliotecas especificadas.
```

---

## 🔄 PROMPTS POR FASE

### **FASE 1: INFRAESTRUCTURA BASE**

**Usar cuando:** Trabajando en configuración inicial, autenticación, DB, API base

```text
Continuando SAT-Digital - FASE 1: Infraestructura Base

CONTEXTO: Sistema de Auditorías Técnicas con IA para digitalizar proceso manual de 5 proveedores, 12 sitios.

STACK TÉCNICO:
- Backend: Node.js 18 + Express + MySQL (XAMPP) + JWT + Sequelize
- Frontend: React 18 + Zustand + Material-UI + Zod validations
- Bibliotecas específicas: zod, day.js, tanstack-table, auth.js, motion, fontsource, chart.js, zustand, formkit-drag-and-drop, hotkeys-js

FASE 1 OBJETIVOS:
- Entorno de desarrollo funcional con XAMPP
- Base de datos completa con todas las tablas
- Sistema de autenticación JWT + RBAC
- API RESTful base documentada
- Frontend React con componentes base

CHECKPOINTS FASE 1:
Consultar: C:\xampp\htdocs\SAT-Digital\documentacion\07-CHECKPOINTS-GENERAL.md

ARQUITECTURA BASE DE DATOS:
- usuarios (admin, auditor, proveedor, visualizador)
- proveedores (5 proveedores principales)
- sitios (12 sitios distribuidos)
- auditorias (semestrales con workflow de estados)
- documentos (control versiones + análisis IA)
- bitacora (auditoría completa del sistema)

ROLES Y PERMISOS:
- Admin: gestión completa
- Auditor: asignaciones y evaluaciones
- Proveedor: solo sus sitios (segregación crítica)
- Visualizador: dashboards ejecutivos

ESTADO ACTUAL FASE 1:
[INDICAR CHECKPOINT ESPECÍFICO EN DESARROLLO]

DOCUMENTACIÓN DETALLADA:
C:\xampp\htdocs\SAT-Digital\documentacion\02-FASE-1-INFRAESTRUCTURA.md

ACCIÓN REQUERIDA:
[DESCRIBIR ACCIÓN ESPECÍFICA]

Ayúdame con [ACCIÓN], siguiendo la arquitectura de 3 capas y metodología BEM para CSS.
```

### **FASE 2: GESTIÓN DE AUDITORÍAS**

**Usar cuando:** Trabajando en calendario, carga documental, chat, notificaciones

```text
Continuando SAT-Digital - FASE 2: Gestión de Auditorías (Core del Negocio)

CONTEXTO: Sistema digitaliza proceso completo de auditorías técnicas semestrales.

PREREQUISITO: Fase 1 completada ✅ (autenticación, DB, API base funcionando)

FASE 2 OBJETIVOS:
- Calendario programable de auditorías (mayo/noviembre)
- Sistema de carga documental por 13 secciones técnicas
- Chat asíncrono contextual proveedor ↔ auditor
- Notificaciones automáticas (email + plataforma)
- Workflow de estados automatizado
- Panel de control para auditores

WORKFLOW PRINCIPAL:
1. Notificación automática (T-30 días) → 5 proveedores
2. Carga documentación (15 días) → por sección
3. Consultas asíncronas → chat integrado
4. Validación completitud → transición estado
5. Preparación para análisis IA (Fase 3)

SECCIONES TÉCNICAS (13 TOTAL):
Análisis tiempo real: Topología, Infraestructura, Energía CT, Temperatura, Servidores, Internet, Personal, Escalamiento
Análisis por lotes: Cuarto Tecnología, Conectividad, Hardware/Software/Headset, Seguridad, Información entorno

TECNOLOGÍAS CLAVE FASE 2:
- WebSockets para chat tiempo real
- Bull/Agenda para queue de notificaciones
- Multer para carga de archivos
- NodeMailer para emails automáticos
- Drag & Drop con formkit-drag-and-drop

ESTADO ACTUAL FASE 2:
[INDICAR CHECKPOINT ESPECÍFICO]

DOCUMENTACIÓN:
C:\xampp\htdocs\SAT-Digital\documentacion\03-FASE-2-GESTION-AUDITORIAS.md

PRÓXIMA ACCIÓN:
[ACCIÓN ESPECÍFICA]

Necesito ayuda con [ACCIÓN], manteniendo la segregación por proveedor y usando las bibliotecas especificadas.
```

### **FASE 3: IA Y ANÁLISIS**

**Usar cuando:** Trabajando con Ollama, procesamiento de documentos, análisis automático

```text
Continuando SAT-Digital - FASE 3: IA y Análisis Automático

CONTEXTO: Integración completa con IA local (Ollama) para automatización inteligente.

PREREQUISITO: Fase 2 completada ✅ (documentos cargados, workflow funcionando)

FASE 3 OBJETIVOS:
- Ollama local funcionando (LLaVA visión + Llama 3.1 texto)
- Análisis automático PDFs → extracción datos estructurados
- Validación parque informático Excel → umbrales técnicos
- Procesamiento imágenes cuarto tecnología → LLaVA
- Puntajes automáticos configurables
- Recomendaciones IA priorizadas

MODELOS IA:
- Llama 3.1: análisis de texto, extracción datos, generación recomendaciones
- LLaVA: análisis imágenes, detección problemas visuales, OCR inteligente

PROCESSING PIPELINE:
Documento cargado → Queue procesamiento → Ollama analysis → Datos estructurados → Validación umbrales → Puntajes + Recomendaciones → Dashboard auditor

VALIDACIONES AUTOMÁTICAS:
- Parque informático: Intel Core i5+, 16GB+ RAM, Windows 11, SSD 500GB+
- Conectividad HO: 15/6 Mbps mínimo
- Visuales: organización, cableado, etiquetado, limpieza

TECNOLOGÍAS CLAVE:
- Ollama API client (HTTP)
- PDF.js para conversión
- Sharp para procesamiento imágenes
- Bull queue para jobs pesados
- Winston logging con rotación

ESTADO ACTUAL FASE 3:
[INDICAR CHECKPOINT ESPECÍFICO]

DOCUMENTACIÓN:
C:\xampp\htdocs\SAT-Digital\documentacion\04-FASE-3-IA-ANALISIS.md

ACCIÓN REQUERIDA:
[ACCIÓN ESPECÍFICA]

Ayúdame con [ACCIÓN], asegurando que Ollama funcione localmente y los prompts sean optimizados para análisis técnico.
```

### **FASE 4: VISITAS Y REPORTES**

**Usar cuando:** Trabajando en móvil, comparación IA vs realidad, dashboards, reportes

```text
Continuando SAT-Digital - FASE 4: Visitas Presenciales y Reportes (FINAL)

CONTEXTO: Fase final que completa el ciclo con workflow móvil y business intelligence.

PREREQUISITO: Fase 3 completada ✅ (IA analizando documentos automáticamente)

FASE 4 OBJETIVOS:
- Interfaz móvil-friendly para auditorías presenciales
- Comparación automática IA vs realidad en campo
- Dashboards customizables drag & drop por rol
- Generador automático reportes ejecutivos
- Business Intelligence predictivo

WORKFLOW VISITAS:
Auditor en campo → Tablet/smartphone → Validación vs predicciones IA → Evidencia fotográfica geolocalizada → Ajuste puntajes → Sync automática → Reportes finales

REPORTES AUTOMÁTICOS:
- Ejecutivo por sitio (15-20 páginas) con insights IA
- Consolidado por proveedor (análisis comparativo)
- Resúmenes gerenciales (2 páginas con recomendaciones)
- Distribución automática por email

DASHBOARDS PERSONALIZABLES:
- Widgets drag & drop configurables
- Filtros por proveedor/período/sección
- Exportación PowerPoint/Excel
- Tiempo real sin refresh

TECNOLOGÍAS CLAVE:
- PWA para móvil offline-first
- Geolocation API + GPS
- React Beautiful DND para dashboards
- PDFKit para reportes profesionales
- Chart.js para visualizaciones

ESTADO ACTUAL FASE 4:
[INDICAR CHECKPOINT ESPECÍFICO]

DOCUMENTACIÓN:
C:\xampp\htdocs\SAT-Digital\documentacion\05-FASE-4-VISITAS-REPORTES.md

PRÓXIMA ACCIÓN:
[ACCIÓN ESPECÍFICA]

Necesito ayuda con [ACCIÓN], enfocándome en la experiencia móvil y generación automática de insights empresariales.
```

---

## 🚨 PROMPT TROUBLESHOOTING

**Usar cuando:** Hay problemas, errores, o necesitas debug

```text
SAT-Digital - TROUBLESHOOTING: Necesito resolver un problema

CONTEXTO DEL PROYECTO:
Sistema de Auditorías Técnicas con IA (Node.js + MySQL + React + Ollama)

PROBLEMA ESPECÍFICO:
[DESCRIBIR EL PROBLEMA EN DETALLE]

SÍNTOMAS:
[QUÉ ESTÁ PASANDO EXACTAMENTE]

COMPONENTES AFECTADOS:
[Backend/Frontend/Base de datos/Ollama/etc.]

ARCHIVOS RELACIONADOS:
[RUTAS DE ARCHIVOS RELEVANTES]

LOGS/ERRORES:
[COPIAR LOGS O MENSAJES DE ERROR]

FASE ACTUAL DEL DESARROLLO:
[Fase 1/2/3/4 y checkpoint específico]

INTENTOS PREVIOS:
[QUÉ YA PROBASTE]

ENTORNO:
- OS: Windows 11
- XAMPP: [versión]
- Node.js: [versión]
- Navegador: [navegador usado]

DOCUMENTACIÓN DE REFERENCIA:
C:\xampp\htdocs\SAT-Digital\documentacion\
- Para troubleshooting: 09-TROUBLESHOOTING.md
- Estado actual: 06-ESTADO-PROYECTO.md

URGENCIA:
[Baja/Media/Alta/Crítica - indica si bloquea desarrollo]

Por favor, ayúdame a diagnosticar y resolver este problema paso a paso.
```

---

## 🔍 PROMPT REVIEW

**Usar cuando:** Necesitas revisión de código, arquitectura, o decisiones técnicas

```text
SAT-Digital - REVIEW: Necesito revisión técnica

CONTEXTO:
Sistema de Auditorías Técnicas digitalizado (Node.js + React + IA)

TIPO DE REVIEW:
[ ] Revisión de código
[ ] Revisión de arquitectura
[ ] Revisión de diseño de DB
[ ] Revisión de decisiones técnicas
[ ] Revisión de performance
[ ] Revisión de seguridad

COMPONENTE A REVISAR:
[Describe qué específicamente necesita revisión]

CÓDIGO/ARCHIVOS:
[Pegar código o indicar archivos específicos]

CRITERIOS DE REVIEW:
- ✅ Sigue metodología BEM para CSS
- ✅ Usa bibliotecas especificadas (zod, zustand, etc.)
- ✅ Implementa separación por dominios
- ✅ Mantiene segregación por proveedor (seguridad)
- ✅ Código limpio sin hardcoding
- ✅ Documentación actualizada

PREOCUPACIONES ESPECÍFICAS:
[Qué aspectos te preocupan más]

CONTEXTO TÉCNICO:
- Fase actual: [1/2/3/4]
- Checkpoint: [específico]
- Usuarios objetivo: 5 proveedores + auditores + admin
- Volumen: 520+ documentos semestrales

DOCUMENTACIÓN:
Ver especificaciones en C:\xampp\htdocs\SAT-Digital\documentacion\

Por favor, revisa [COMPONENTE] considerando los criterios definidos y sugiere mejoras específicas.
```

---

## 🚀 PROMPT DEPLOYMENT

**Usar cuando:** Preparando para producción o deployment

```text
SAT-Digital - DEPLOYMENT: Preparación para producción

CONTEXTO:
Sistema de Auditorías Técnicas listo para migrar a producción

ESTADO ACTUAL:
- Fase completada: [1/2/3/4]
- Funcionalidades principales: [listar las que están listas]
- Tests: [% cobertura y estado]
- Performance: [métricas actuales]

OBJETIVO DEPLOYMENT:
[ ] Staging environment
[ ] Production deployment
[ ] Migration from manual process
[ ] Performance optimization
[ ] Security hardening
[ ] Backup strategy

INFRAESTRUCTURA TARGET:
[Describir donde se va a deployar - servidor, cloud, etc.]

CONSIDERACIONES CRÍTICAS:
- Datos sensibles de proveedores (segregación estricta)
- Ollama IA funcionando en producción
- Backup de datos históricos
- Migración desde proceso Excel manual
- Capacitación de usuarios (5 proveedores + auditores)

CHECKLIST PRE-DEPLOYMENT:
- [ ] Todos los tests pasando
- [ ] Performance optimizado
- [ ] Logs configurados
- [ ] Backups automatizados
- [ ] Monitoreo implementado
- [ ] Documentación usuario final

PLAN DE ROLLBACK:
[Si algo falla, cómo volver al proceso manual]

DOCUMENTACIÓN:
C:\xampp\htdocs\SAT-Digital\documentacion\

PRÓXIMOS PASOS:
[Qué necesitas hacer específicamente]

Ayúdame a [ACCIÓN DEPLOYMENT], considerando la criticidad del sistema para las auditorías semestrales.
```

---

## 📝 PROMPT TEMPLATES ADICIONALES

### **Para Debugging Específico de IA:**

```text
SAT-Digital - IA DEBUGGING: Problema con Ollama/análisis automático

PROBLEMA IA:
[Ollama no responde/Análisis incorrecto/Performance lento/etc.]

MODELO AFECTADO:
[ ] Llama 3.1 (texto)
[ ] LLaVA (visión)
[ ] Ambos

TIPO DOCUMENTO:
[PDF topología/Excel parque/Imagen cuarto/etc.]

PROMPT USADO:
[Copiar el prompt que está fallando]

RESPUESTA OLLAMA:
[Copiar respuesta si la hay]

ERROR LOG:
[Logs específicos de error]

CONTEXTO: Estamos en Fase 3 del proyecto, integrando análisis automático.
```

### **Para Performance Issues:**

```text
SAT-Digital - PERFORMANCE: Sistema lento o problemas de rendimiento

MÉTRICA PROBLEMÁTICA:
[Tiempo carga/Procesamiento documentos/Query DB/etc.]

TIEMPO ACTUAL:
[X segundos - objetivo: Y segundos]

COMPONENTE AFECTADO:
[Frontend/Backend/DB/IA/etc.]

VOLUMEN DE DATOS:
[Cantidad documentos/usuarios/consultas]

CONTEXTO: Sistema debe manejar 520+ documentos semestralmente.
```

---

## 🎯 INSTRUCCIONES DE USO

### **Cómo Usar Estos Prompts:**

1. **Identifica tu situación** - ¿En qué fase estás? ¿Qué tipo de ayuda necesitas?

2. **Copia el prompt apropiado** - Selecciona el que mejor describa tu contexto

3. **Personaliza los campos** - Completa todos los `[PLACEHOLDERS]` con información específica

4. **Agrega detalles específicos** - Mientras más contexto, mejor será la ayuda

5. **Incluye archivos relevantes** - Menciona rutas específicas de documentación

### **Qué NO Hacer:**

- ❌ No uses prompts genéricos sin personalizar
- ❌ No omitas el contexto del proyecto
- ❌ No olvides mencionar las bibliotecas específicas requeridas
- ❌ No ignores la metodología BEM y separación por dominios

### **Consejos para Mejor Continuidad:**

- ✅ Siempre incluye el estado actual desde `06-ESTADO-PROYECTO.md`
- ✅ Menciona el checkpoint específico en el que estás trabajando
- ✅ Actualiza este archivo si encuentras mejores prompts
- ✅ Mantén las conversaciones enfocadas en una fase/tarea a la vez

---

## 🔄 ACTUALIZACIÓN DE PROMPTS

**Última revisión:** Agosto 25, 2025

**Próxima revisión:** Al completar cada fase

**Para sugerir mejoras:** Documentar en bitácora del proyecto y actualizar este archivo

**Historial de cambios:**

- v1.0: Prompts iniciales creados con documentación completa

---

> 📌 **RECORDATORIO:** Estos prompts están diseñados para mantener continuidad perfecta entre conversaciones. Úsalos consistentemente para obtener ayuda contextualizada y precisa en cualquier momento del desarrollo.
