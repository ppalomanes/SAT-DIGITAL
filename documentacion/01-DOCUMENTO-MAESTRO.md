# SAT-Digital: Sistema de Auditorías Técnicas Digitalizado

## 📋 DOCUMENTO MAESTRO DEL PROYECTO

> **Versión:** 1.0
> **Fecha:** Agosto 2025
> **Estado:** Aprobado para desarrollo
> **Próximo archivo:** 02-FASE-1-INFRAESTRUCTURA.md

---

## 🎯 RESUMEN EJECUTIVO

SAT-Digital es un sistema web completo para gestionar auditorías técnicas de infraestructura de centros de datos y tecnología, con análisis automático mediante IA local (Ollama) y capacidad de comercialización como servicio.

### Problemática Actual

- Auditorías semestrales (mayo/noviembre) completamente manuales
- 5 proveedores, 12 sitios, ~520 documentos por período
- 13 secciones técnicas por auditoría
- Gestión manual en Excel por sitio
- Proceso fragmentado sin estandarización
- Falta de trazabilidad histórica efectiva
- Tiempo excesivo en validación de documentos
- Sin métricas consolidadas

### Solución Propuesta

Sistema multi-tenant que automatiza el proceso completo de auditorías técnicas, desde la planificación hasta la generación de reportes y dashboards ejecutivos.

---

## 🏗️ ARQUITECTURA TÉCNICA

### Stack Tecnológico Principal

**Backend:**

- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Base de datos:** MySQL 8.0 (via XAMPP)
- **ORM:** Sequelize/Prisma
- **Autenticación:** JWT + bcrypt
- **API:** RESTful + GraphQL híbrido
- **WebSockets:** Para chat y notificaciones

**Frontend:**

- **Framework:** React 18/Vue.js 3
- **UI Library:** Material-UI/Tailwind CSS
- **Estado:** Zustand (manejo estado global)
- **Tablas:** TanStack Table
- **Gráficos:** Chart.js
- **Fechas:** Day.js
- **Validaciones:** Zod
- **Animaciones:** Motion
- **Tipografías:** Fontsource
- **Drag & Drop:** FormKit Drag-and-Drop
- **Atajos:** Hotkeys.js

**IA y Análisis:**

- **Motor:** Ollama (local)
- **Modelos:** LLaVA (visión) + Llama 3.1 (texto)
- **Procesamiento:** PDF.js para conversión
- **Queue:** Bull/Agenda para trabajos pesados

**Infraestructura:**

- **OS:** Windows 11
- **Servidor local:** XAMPP
- **Terminal:** PowerShell
- **Proxy:** Nginx (opcional)
- **Logs:** Winston + rotación
- **Backup:** Automatizado diario
- **Índices:** Optimizados para reportes

### Metodología de Desarrollo

**CSS:**

- Metodología BEM para nomenclatura
- Arquitectura modular con clases semánticas
- Sin estilos inline ni hardcoding

**Organización del código:**

- Separación por dominios
- Arquitectura limpia por capas
- Documentación fase por fase actualizada

**Control de calidad:**

- Testing pyramid (60% Unit, 25% Integration, 15% E2E)
- Linting y formateo automático
- Code reviews en checkpoints

---

## 👥 STAKEHOLDERS Y ROLES DEL SISTEMA

### 1. **Administradores** (1-2 usuarios)

- Gestión completa de usuarios y roles
- Configuración de parámetros del sistema
- Moderación de chats
- Gestión de proveedores y sitios
- Acceso a bitácora de eventos

### 2. **Auditores** (2 usuarios activos)

- Planificar calendario de auditorías
- Verificar documentación recibida
- Realizar visitas presenciales
- Validar puntajes de IA
- Generar observaciones y cierres

### 3. **Proveedores/Auditados** (5 proveedores, 12 sitios)

- Cargar documentación por sección
- Responder consultas durante período de carga
- Recibir visitas presenciales
- Presentar planes de acción post-auditoría

### 4. **Visualizadores/Gerentes** (Variable)

- Acceso a dashboards ejecutivos
- Visualización de métricas consolidadas
- Análisis de tendencias históricas
- Comunicación con auditores via chat

---

## 🔄 FLUJO DE TRABAJO COMPLETO

### **Etapa 1: Notificación** (T-30 días)

- Sistema envía notificación automática a proveedores
- Incluye pliego técnico vigente por sitio
- Define fecha límite de entrega de documentación
- Programa fecha de visita presencial (+15 días post-cierre)

### **Etapa 2: Carga de Documentación** (15 días)

- Proveedores suben documentos por sección
- Validación automática de formato y período
- Sistema verifica completitud por sección
- Notificaciones de recordatorio automáticas

### **Etapa 3: Consultas Asíncronas** (Durante carga)

- Chat integrado proveedor ↔ auditor
- Resolución de dudas técnicas
- Solicitud de documentación adicional
- Historial completo de conversaciones

### **Etapa 4: Análisis y Verificación IA**

- IA analiza automáticamente cada documento
- Extrae datos técnicos estructurados
- Asigna puntajes preliminares
- Genera observaciones automáticas
- Auditor valida y ajusta resultados IA

### **Etapa 5: Visita Presencial**

- Auditor visita sitio según cronograma
- Carga evidencia fotográfica adicional
- Documenta discrepancias in-situ
- Valida información previamente recibida

### **Etapa 6: Consolidación Final**

- Auditor ajusta puntajes post-visita
- Compara análisis IA vs realidad presencial
- Genera observaciones finales
- Aprueba cierre de auditoría

### **Etapa 7: Resultados y Dashboards**

- Sistema genera dashboard automático por sitio
- Consolida métricas por proveedor
- Envía notificación de resultados
- Habilita carga de planes de acción (30 días)

### **Etapa 8: Inteligencia de Negocio**

- Dashboards ejecutivos consolidados
- Análisis de tendencias históricas
- Métricas de cumplimiento por proveedor
- Alertas de equipos críticos

---

## 📊 SECCIONES TÉCNICAS DE AUDITORÍA

### **Análisis en Tiempo Real:**

1. Topología de red
2. Documentación y Controles Infraestructura
3. Energía del Cuarto de Tecnología
4. Temperatura CT
5. Servidores
6. Internet
7. Personal capacitado en sitio
8. Escalamiento (Tel. de Contacto)

### **Análisis por Lotes:**

9. Cuarto de Tecnología
10. Conectividad (Certificación de Cableado)
11. Estado del Hardware, Software, Headset e internet en el hogar
12. Seguridad informática
13. Información de entorno

### **Equipos y Tecnologías Auditadas**

**Equipos de Red:**

- Marcas: Cisco, Juniper, Palo Alto, Fortinet
- Tipos: Racks, CPE, Routers, Switches, Firewalls, Cableado estructurado

**Servidores:**

- Tipos: Correo, antivirus, clonación
- Tecnologías: Opensource y propietarios

**Energía:**

- Grupos Electrógenos: VOLVO, Perkins
- UPS: Ethon, Legrand
- Otros: Tableros de transferencia, termografías

**Clima:**

- Aires Acondicionados: Carrier, LG

**Seguridad:**

- Sistemas: Control de acceso, matafuegos, sensores humo/gas

---

## 🎯 MÓDULOS FUNCIONALES PRINCIPALES

### **1. Módulo de Gestión de Auditorías**

- **Calendario programable** para definir períodos de auditoría
- **Cronograma de visitas** con asignación de auditores
- **Contador de tiempo límite** para recepción de documentos
- **Workflow de estados** (Programada → En Carga → Pendiente Evaluación → Evaluada → Cerrada)

### **2. Módulo de Gestión Documental**

- **Carga por secciones** con validación de formatos
- **Control de versiones** automático por documento
- **Almacenamiento organizado** por proveedor/sitio/período
- **Búsqueda avanzada** por metadatos y contenido

### **3. Módulo de Análisis con IA**

- **Procesamiento automático** de documentos PDF/Excel/Imágenes
- **Extracción de datos estructurados** según tipo de documento
- **Validación de umbrales técnicos** automática
- **Generación de puntajes preliminares** por sección

### **4. Módulo de Comunicación**

- **Chat asíncrono** contextual por auditoría
- **Sistema de notificaciones** por email y plataforma
- **Categorización de mensajes** (técnico, administrativo, solicitud, etc.)
- **Historial completo** de comunicaciones

### **5. Módulo de Dashboards y Reportes**

- **Dashboards personalizables** por rol de usuario
- **Métricas en tiempo real** del estado de auditorías
- **Reportes ejecutivos automáticos** por sitio y consolidados
- **Análisis de tendencias históricas** y predicciones

### **6. Módulo de Bitácora y Auditoría**

- **Registro inmutable** de todas las acciones del sistema
- **Trazabilidad completa** de cambios y versiones
- **Auditoría de accesos** y permisos por usuario
- **Exportación de logs** para compliance

---

## 📈 BENEFICIOS ESPERADOS

### **Operacionales:**

- **Automatización del 70%** del proceso de análisis documental
- **Reducción del 80%** en tiempo de procesamiento por auditoría
- **Estandarización completa** de criterios de evaluación
- **Dashboards ejecutivos** en tiempo real
- **Trazabilidad histórica** efectiva de 6+ años

### **Técnicos:**

- **Validación automática** de umbrales técnicos del parque informático
- **Detección proactiva** de equipos próximos a fin de vida útil
- **Análisis predictivo** de mantenimientos requeridos
- **Alertas automáticas** de incumplimientos críticos

### **Gerenciales:**

- **Métricas consolidadas** por proveedor en tiempo real
- **Análisis de tendencias** y evolución de cumplimiento
- **ROI cuantificable** de mantenimientos preventivos
- **Capacidad de comercialización** como SaaS ($500-2000/mes por cliente)

---

## 🛡️ SEGURIDAD Y COMPLIANCE

### **Autenticación:**

- JWT con refresh tokens
- Hash de passwords con bcrypt
- 2FA opcional para administradores

### **Autorización:**

- RBAC (Role-Based Access Control)
- Segregación estricta por proveedor
- Logs de auditoría completos

### **Datos:**

- Encriptación en tránsito (HTTPS)
- Backups automatizados cifrados
- Retención de datos 10 años
- Cumplimiento GDPR básico

---

## 💰 ESTIMACIÓN ECONÓMICA

### **Desarrollo Interno:**

- **MVP (Fases 1-3):** 6 meses
- **Sistema Completo:** 16-24 meses
- **Recursos:** 2-3 desarrolladores + 1 PM

### **Infraestructura (mensual):**

- **Desarrollo:** Local (costo mínimo)
- **Producción:** VPS/Cloud (~$200-500/mes)
- **IA:** Local Ollama (sin costo adicional)

### **ROI Proyectado:**

- **Ahorro operativo:** 70% reducción tiempo auditorías
- **Comercialización:** SaaS $500-2000/mes por cliente
- **Break-even:** 12-18 meses post-MVP

---

## 📋 INFORMACIÓN DE CONTACTO DE PROVEEDORES

### **Grupo Activo SRL**

- CUIT: 30-71044895-3
- Sitio: ACTIVO - Florida 141, CABA

### **Centro de Interacción Multimedia S.A. (APEX America)**

- CUIT: 30-70827680-0
- Sitios: APEX CBA, APEX RES 1, APEX RES 2

### **CityTech Sociedad Anónima (Teleperformance)**

- CUIT: 30-70908678-9
- Sitios: TELEPERFORMANCE RES, TELEPERFORMANCE TUC 3, TELEPERFORMANCE TUC 1

### **CAT Technologies Argentina S.A**

- CUIT: 30-70949292-2
- Sitio: CAT-TECHNOLOGIES - Mitre 853 piso 1, CABA

### **Stratton Argentina SA (Konecta)**

- CUIT: 30698477411
- Sitios: KONECTA CBA, KONECTA RES, KONECTA ROS

---

## 🔗 INTEGRACIONES EXTERNAS

### **API Aternity (Inventario):**

- URL: https://us3-odata.aternity.com/aternity.odata/latest/
- Usuario: PJPalomanes@teco.com.ar
- Propósito: Consulta de inventario de equipos en tiempo real

---

## 📝 NOTAS ADICIONALES IMPORTANTES

### **Consideraciones Técnicas:**

- Sistema diseñado para Windows 11 + XAMPP
- Ollama debe instalarse y configurarse localmente
- Requiere mínimo 16GB RAM para IA óptima
- Diseño responsive para uso móvil en visitas

### **Escalabilidad:**

- Arquitectura preparada para multi-tenancy
- Base de datos normalizada para grandes volúmenes
- IA local evita costos de APIs externas
- Cache inteligente para reportes frecuentes

### **Mantenimiento:**

- Backups automatizados diarios
- Logs rotativos con retención 6 meses
- Actualizaciones programadas fuera de períodos de auditoría
- Monitoreo de performance automatizado

---

## ➡️ PRÓXIMOS PASOS

**Estado actual:** ✅ Documento maestro creado y aprobado

**Siguiente paso:** Iniciar Fase 1 - Infraestructura Base

**Archivo a consultar:** `02-FASE-1-INFRAESTRUCTURA.md`

**Checklist para continuar:**

- [ ] Revisar y aprobar documento maestro
- [ ] Configurar entorno de desarrollo local
- [ ] Inicializar estructura de proyecto
- [ ] Configurar base de datos MySQL
- [ ] Implementar sistema de autenticación básico

---

> 📌 **RECORDATORIO:** Este es el documento de referencia principal. Siempre consultar este archivo para entender el contexto completo del proyecto antes de continuar con cualquier fase específica.
