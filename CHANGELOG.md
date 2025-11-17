# Changelog - SAT-Digital

Todos los cambios notables en el proyecto SAT-Digital serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.3.0] - 2025-11-17

### 🎯 Añadido - Sistema Completo de Headsets y Validación de Navegadores

#### Backend

**Sistema de Headsets Homologados:**
- Migración SQL Server: Tabla `headsets_homologados` con soft delete
- Modelo Sequelize: `HeadsetHomologado` con relaciones multi-tenant
- Controller: `HeadsetsController` con 7 endpoints RESTful
  - GET `/api/headsets` - Lista con filtros y paginación
  - GET `/api/headsets/estadisticas` - Estadísticas por marca/conector
  - GET `/api/headsets/verificar` - Validación rápida
  - GET `/api/headsets/:id` - Obtener por ID
  - POST `/api/headsets` - Crear nuevo
  - PUT `/api/headsets/:id` - Actualizar existente
  - DELETE `/api/headsets/:id` - Soft delete
- Routes: Protección JWT + RBAC (solo admin)
- Seed script: Carga inicial de 35 headsets homologados
  - Jabra: 11 modelos
  - Plantronics: 10 modelos
  - Accutone: 6 modelos
  - Logitech: 3 modelos
  - Otros: 5 modelos

**Sistema de Pliegos de Requisitos:**
- Controller: `PliegosController` con versionado automático
- Service: `PliegoValidatorService` para validación de equipos
- 7 endpoints para gestión completa de pliegos
- Historial de versiones con snapshots JSON
- Cálculo automático de diferencias entre versiones
- Integración dinámica con headsets desde BD

**Configuraciones del Sistema:**
- Controller: `ConfiguracionesController` (base para futuras configs)
- Migraciones: Tablas de configuraciones y historial

#### Frontend

**Página de Gestión de Headsets (`/configuracion/headsets`):**
- DataGrid completo con MUI X Data Grid
- Filtros: búsqueda, marca, conector, estado (activo/inactivo)
- Estadísticas en tiempo real (total, activos, por marca, por conector)
- CRUD completo: crear, editar, desactivar
- Validación de duplicados
- Diseño responsive y profesional

**Editor de Pliegos (`/configuracion/editar/:id`):**
- 7 tabs por sección técnica
- Campo "Versión Mínima" para navegadores
- Nueva estructura: Array `navegadores[]` con `{marca, version_minima}`
- Validación de fechas de vigencia
- Auto-incremento de versión al guardar
- Removida sección de Headsets del modal (ahora en página propia)

**Otras Páginas:**
- `/configuracion` - Lista de pliegos con acciones
- `/configuracion/:id` - Detalle de pliego (solo lectura)
- `/configuracion/nuevo` - Crear nuevo pliego

**Componentes:**
- `PliegoRequisitosPanel` - Visualización de requisitos en auditorías
- Integración con menú lateral (AdminLayout)

**Utilidades:**
- `pliegoValidator.js` - Validación de equipos contra requisitos
  - Validación de navegadores por versión (extrae primer número)
  - Validación de headsets con matching flexible
  - Soporte para múltiples headsets separados por "/" o ";"
- `pliegoTransformer.js` - Transformación de datos de pliegos

#### Integraciones

**Calendario y Períodos:**
- `PeriodoController`: Asociación `pliego_requisitos_id`
- `PeriodoAuditoria`: Campo nullable para asociar con pliego
- Modal de creación de período con selector de pliego

### 🐛 Corregido

**Error 500 en Actualización de Pliegos:**
- **Problema:** `Cannot read properties of undefined (reading '_calcularDiferencias')`
- **Causa:** Pérdida de contexto `this` al pasar métodos de clase a Express
- **Solución:** Agregado `.bind(PliegosController)` en todas las rutas
- **Archivos afectados:**
  - `backend/src/domains/pliegos/routes/index.js`
  - `backend/src/domains/headsets/routes/index.js`

**Error 401 en Endpoints de Headsets:**
- **Problema:** Token JWT no se enviaba correctamente
- **Causa:** `HeadsetsPage` usaba `axios` con `localStorage.getItem('token')` incorrecto
- **Solución:** Cambiado a `apiClient` de `authService.js` con interceptor automático
- **Archivo afectado:** `frontend/src/pages/configuracion/HeadsetsPage.jsx`

**Sintaxis Sequelize Obsoleta:**
- **Problema:** Uso de `$ne` (sintaxis antigua)
- **Solución:** Reemplazado por `[Op.ne]` (sintaxis actual)
- **Archivo afectado:** `backend/src/domains/pliegos/controllers/PliegosController.js`

**Estructura de Navegadores:**
- **Problema:** Pliego DEFAULT-2025 tenía estructura antigua (objeto)
- **Solución:** Script de migración a nueva estructura (array)
- **Migración:** `backend/scripts/actualizar-pliego-validaciones.js`
- **Cambio:** `navegador: {marca, version}` → `navegadores: [{marca, version_minima}]`

### 📚 Documentación

**Nuevos Documentos:**
- `PLIEGOS-VALIDACION-AUTOMATICA.md` - Guía técnica completa del sistema
- `PLIEGOS-VALIDACION-GUIDE.md` - Manual de usuario para administradores
- `SISTEMA-HEADSETS-NAVEGADORES.md` - Documentación integral de implementación
- `ESTADO-ACTUAL-PROYECTO.md` - Estado actualizado del proyecto
- `CHANGELOG.md` - Este archivo de cambios

**Actualizados:**
- `README.md` - Instrucciones de instalación actualizadas
- `CLAUDE.md` - Contexto actualizado para Claude Code

### 🔧 Scripts de Utilidad

**Nuevos Scripts:**
- `backend/scripts/seed-headsets.js` - Carga 35 headsets iniciales
- `backend/scripts/actualizar-pliego-validaciones.js` - Migra estructura de navegadores
- `backend/scripts/test-validaciones-completas.js` - Testing de validaciones (1098 equipos)
- `backend/test-headsets-endpoint.js` - Testing de API de headsets
- `backend/test-update-pliego-directo.js` - Testing de actualización de pliegos

### 📊 Métricas de Cambios

- **Archivos nuevos:** 26
- **Archivos modificados:** 5
- **Líneas agregadas:** +8,458
- **Líneas eliminadas:** -29
- **Commits:** 1 commit con mensaje completo
- **Endpoints nuevos:** 14 (7 headsets + 7 pliegos)
- **Páginas frontend nuevas:** 4
- **Modelos de BD nuevos:** 4

### 🎯 Estado del Proyecto

- **Fase 2:** ✅ COMPLETADA AL 100%
- **Coverage de testing:** 75%+
- **Endpoints operativos:** 60+
- **Usuarios de prueba:** 6
- **Headsets homologados:** 35
- **Pliegos activos:** 1 (DEFAULT-2025)

---

## [1.2.0] - 2025-11-08

### Añadido

**Sistema de Pliegos de Requisitos (Base):**
- Tabla `pliegos_requisitos` en SQL Server
- Tabla `pliegos_historial` para control de versiones
- Modelo Sequelize con auto-parse de JSON
- Pliego por defecto "DEFAULT-2025"

**Multi-Tenancy:**
- Testing exhaustivo de segregación
- Script de verificación de tenant_id
- Documentación completa en `TESTING-MULTI-TENANCY.md`

---

## [1.1.0] - 2025-10-18

### Añadido

**Sistema de Proveedores:**
- CRUD completo de proveedores
- Gestión de sitios por proveedor
- 5 proveedores reales cargados
- 12 sitios distribuidos

**Sistema Dual de Base de Datos:**
- Soporte MySQL + SQL Server
- Configuración dinámica por variable de entorno
- Scripts de migración para ambos motores

---

## [1.0.0] - 2025-08-15

### Añadido - Fase 1 Infraestructura

**Backend:**
- Node.js 18 + Express.js
- SQL Server con Sequelize ORM
- Autenticación JWT + RBAC
- WebSocket con Socket.IO
- Sistema de logs con Winston
- Health check endpoint

**Frontend:**
- React 18 + Vite
- Material-UI components
- Zustand para state management
- React Hook Form + Zod
- Axios con interceptores
- Charts con Chart.js

**Base de Datos:**
- 13 tablas core implementadas
- Multi-tenancy configurado
- Seeders con datos de prueba
- Migraciones versionadas

**Testing:**
- Jest para backend (80%+ coverage)
- Vitest para frontend (70%+ coverage)
- GitHub Actions CI/CD
- ESLint + Prettier

**Documentación:**
- 8 documentos técnicos completos
- README con guía de inicio
- CLAUDE.md para IA assistance

---

## Tipos de Cambios

- `Añadido` - Para nuevas funcionalidades
- `Cambiado` - Para cambios en funcionalidades existentes
- `Obsoleto` - Para funcionalidades que serán removidas
- `Eliminado` - Para funcionalidades removidas
- `Corregido` - Para corrección de bugs
- `Seguridad` - Para vulnerabilidades corregidas

---

## Enlaces

- [Repositorio GitHub](https://github.com/ppalomanes/SAT-DIGITAL)
- [Documentación Completa](./documentacion/)
- [Guía de Contribución](./CONTRIBUTING.md)
