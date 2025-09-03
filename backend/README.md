# SAT-Digital Backend

Sistema de Auditorías Técnicas Digitalizado - Backend API

## 🎯 Descripción

Backend del sistema SAT-Digital para automatizar auditorías técnicas de infraestructura de centros de datos. Proporciona APIs RESTful para gestión de usuarios, proveedores, auditorías y análisis automático con IA.

## 🚀 Inicio Rápido

### Prerequisitos

- **Node.js 18+** - [Descargar](https://nodejs.org/)
- **XAMPP** - Con MySQL funcionando
- **Git** - Para control de versiones

### Instalación Automatizada

#### Windows (PowerShell):
```powershell
.\setup.ps1
```

#### Linux/Mac (Bash):
```bash
chmod +x setup.sh
./setup.sh
```

### Instalación Manual

1. **Clonar dependencias:**
```bash
npm install
```

2. **Configurar entorno:**
```bash
cp .env.example .env
# Editar .env con tu configuración
```

3. **Crear base de datos:**
- Abrir phpMyAdmin (http://localhost/phpmyadmin)
- Crear base de datos `sat_digital`

4. **Ejecutar aplicación:**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📁 Estructura del Proyecto

```
src/
├── domains/              # Separación por dominios de negocio
│   ├── auth/             # Autenticación y autorización
│   ├── users/            # Gestión de usuarios
│   ├── providers/        # Gestión de proveedores
│   └── audits/           # Gestión de auditorías
├── shared/               # Código compartido
│   ├── database/         # Configuración DB y modelos
│   ├── middleware/       # Middlewares globales
│   ├── utils/            # Utilidades comunes
│   └── scripts/          # Scripts de utilidad
└── app.js               # Punto de entrada principal
```

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo con nodemon
npm start            # Producción
npm test             # Ejecutar tests
npm test:watch       # Tests en modo watch
npm test:coverage    # Coverage de tests
npm run lint         # Linting con ESLint
npm run lint:fix     # Fix automático de lint
npm run format       # Formateo con Prettier
npm run health-check # Verificar estado del sistema
```

## 🌐 Endpoints Principales

### Health Check
- `GET /health` - Estado del servidor

### Autenticación (Fase 1 - Checkpoint 1.3)
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/refresh` - Renovar token
- `POST /api/v1/auth/logout` - Cerrar sesión

### Usuarios (Fase 1 - Checkpoint 1.4)
- `GET /api/v1/users` - Listar usuarios
- `POST /api/v1/users` - Crear usuario
- `GET /api/v1/users/:id` - Obtener usuario
- `PUT /api/v1/users/:id` - Actualizar usuario

### Proveedores (Fase 1 - Checkpoint 1.4)
- `GET /api/v1/providers` - Listar proveedores
- `POST /api/v1/providers` - Crear proveedor
- `GET /api/v1/providers/:id/sites` - Sitios del proveedor

### Auditorías (Fase 2)
- `GET /api/v1/audits` - Listar auditorías
- `POST /api/v1/audits` - Crear auditoría
- `POST /api/v1/audits/:id/documents` - Cargar documentos

## 🗄️ Base de Datos

### Configuración MySQL (XAMPP)

1. **Iniciar XAMPP:**
   - Apache ✅
   - MySQL ✅

2. **Crear base de datos:**
```sql
CREATE DATABASE sat_digital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. **Variables de entorno (.env):**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sat_digital
DB_USERNAME=root
DB_PASSWORD=
```

### Modelos Principales (Implementación en Checkpoint 1.2)

- **usuarios** - Sistema de autenticación y roles
- **proveedores** - 5 proveedores principales
- **sitios** - 12 sitios distribuidos
- **auditorias** - Ciclo semestral de auditorías
- **documentos** - Gestión documental con versiones
- **bitacora** - Auditoría completa del sistema

## 🔐 Seguridad

### Autenticación JWT
- Access tokens (1 hora)
- Refresh tokens (7 días)
- Bcrypt para passwords (12 rounds)

### Roles y Permisos
- **Admin** - Gestión completa
- **Auditor** - Evaluaciones y asignaciones
- **Proveedor** - Solo sus sitios (segregación crítica)
- **Visualizador** - Dashboards ejecutivos

### Middlewares de Seguridad
- Helmet (headers HTTP)
- CORS configurado
- Rate limiting (100 req/15min)
- Validación con Zod

## 🧪 Testing

### Configuración Jest
```bash
# Ejecutar todos los tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm test:watch
```

### Estructura de Tests
```
tests/
├── setup.js              # Configuración global
├── auth/                  # Tests de autenticación
├── users/                 # Tests de usuarios
└── integration/           # Tests de integración
```

## 📊 Monitoreo y Logs

### Sistema de Logging (Winston)
- **Desarrollo:** Consola + archivos
- **Producción:** Solo archivos rotativos
- **Logs estructurados** con metadata

### Ubicaciones de Logs
```
logs/
├── combined.log          # Todos los logs
├── error.log            # Solo errores
└── audit.log            # Logs de auditoría
```

### Health Check Automatizado
```bash
npm run health-check
```

Verifica:
- ✅ Conexión a MySQL
- ✅ Variables de entorno
- ✅ Directorios críticos
- ⏳ Estado de Ollama (Fase 3)

## 🚀 Fases de Desarrollo

### ✅ Fase 1: Infraestructura Base (Actual)
- [x] Configuración del entorno
- [ ] Estructura de base de datos
- [ ] Sistema de autenticación
- [ ] API base y validaciones
- [ ] Testing framework

### ⏳ Fase 2: Gestión de Auditorías
- Calendario programable
- Carga documental por secciones
- Chat asíncrono proveedor-auditor
- Notificaciones automáticas

### ⏳ Fase 3: IA y Análisis
- Integración Ollama local
- Análisis automático PDFs/Excel/imágenes
- Puntajes automáticos
- Recomendaciones inteligentes

### ⏳ Fase 4: Visitas y Reportes
- Workflow móvil para visitas
- Comparación IA vs realidad
- Dashboards customizables
- Business Intelligence

## 📚 Documentación Completa

**Ubicación:** `C:\xampp\htdocs\SAT-Digital\documentacion\`

- `01-DOCUMENTO-MAESTRO.md` - Visión completa del proyecto
- `02-FASE-1-INFRAESTRUCTURA.md` - Especificaciones detalladas
- `06-ESTADO-PROYECTO.md` - Control de progreso
- `07-CHECKPOINTS-GENERAL.md` - Todos los checkpoints

## 🔄 Workflow de Desarrollo

### Metodología
- **Separación por dominios** - Arquitectura limpia
- **Metodología BEM** - CSS estructurado
- **Código limpio** - Sin hardcoding ni estilos inline
- **Testing pyramid** - 60% Unit, 25% Integration, 15% E2E

### Control de Calidad
- ESLint + Prettier configurados
- Pre-commit hooks
- Code coverage > 70%
- Documentación actualizada por fase

## 🌐 URLs Importantes

- **Health Check:** http://localhost:3001/health
- **API Base:** http://localhost:3001/api/v1
- **phpMyAdmin:** http://localhost/phpmyadmin
- **Documentación:** Archivos .md locales

## 📞 Soporte

### Troubleshooting Común

**Error de conexión MySQL:**
```bash
# Verificar XAMPP
# Revisar .env
# Crear base de datos sat_digital
```

**Puerto en uso:**
```bash
# Cambiar PORT en .env
# O detener proceso en puerto 3001
```

**Dependencias faltantes:**
```bash
npm install
```

### Logs de Error
```bash
# Ver logs en tiempo real
tail -f logs/error.log

# Health check completo
npm run health-check
```

## 📊 Métricas del Proyecto

- **Líneas de código estimadas:** ~30,000
- **Tests objetivo:** 200+ tests
- **Coverage objetivo:** 80%+
- **APIs:** ~50 endpoints
- **Modelos DB:** 15+ tablas

---

## 🎯 Estado Actual

**Checkpoint 1.1: Configuración del Entorno** ✅ **COMPLETADO**

- ✅ Estructura de proyecto creada
- ✅ package.json con todas las dependencias
- ✅ Configuración de desarrollo (ESLint, Prettier, Jest)
- ✅ Sistema de logging con Winston
- ✅ Scripts de setup automatizado
- ✅ Health check implementado
- ✅ Rutas básicas configuradas

**Próximo paso:** Checkpoint 1.2 - Estructura de Base de Datos

---

*Para continuar el desarrollo, consultar: `02-FASE-1-INFRAESTRUCTURA.md`*
