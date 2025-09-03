# SAT-Digital

**Sistema de Auditorías Técnicas Digitalizado**

Sistema web integral para la gestión digitalizada de auditorías técnicas de infraestructura de centros de datos, con análisis automático mediante IA local (Ollama) y capacidades de servicios comerciales.

## 🎯 **Descripción del Proyecto**

SAT-Digital digitaliza el proceso manual de auditorías técnicas para **5 proveedores** y **12 sitios** distribuidos, realizando auditorías semestrales (Mayo/Noviembre) que procesan aproximadamente **520 documentos** por período a través de **13 secciones técnicas** especializadas.

**Objetivo**: Alcanzar el **70% de automatización** del proceso de análisis documental mediante IA local.

## 🚀 **Estado Actual del Proyecto**

### ✅ **Fase 1: Infraestructura Base - COMPLETADA**
- ✅ Entorno de desarrollo con XAMPP (Windows 11)
- ✅ Base de datos MySQL completa con todos los modelos
- ✅ Autenticación JWT + RBAC (6 roles)
- ✅ API RESTful base con Node.js/Express
- ✅ Frontend React con componentes base Material-UI

### ✅ **Fase 2: Gestión de Auditorías - EN PROGRESO**
- ✅ **Calendario programable de períodos**: Sistema completo de gestión de períodos de auditoría
- ✅ **Sistema de autenticación real**: Login con JWT válidos y base de datos
- ✅ **Dashboard ejecutivo**: Panel principal con métricas y período activo
- 🚧 **Carga documental por secciones**: Próximo módulo
- 🚧 **Chat asíncrono proveedor ↔ auditor**: Sistema de comunicación
- 🚧 **Notificaciones automáticas**: Sistema de alertas
- 🚧 **Workflow de estados**: Estados de auditoría

### 🔜 **Fase 3: IA & Análisis - PLANIFICADA**
- 🔜 Integración con Ollama local
- 🔜 Análisis automático de PDF/Excel/imágenes  
- 🔜 Scoring automático
- 🔜 Recomendaciones inteligentes

### 🔜 **Fase 4: Visitas & Reportes - PLANIFICADA**
- 🔜 Workflow móvil para visitas
- 🔜 Comparación IA vs realidad
- 🔜 Dashboards personalizables
- 🔜 Business Intelligence

## 🏗️ **Arquitectura Técnica**

### **Backend**
- **Node.js 18** + **Express.js** + **MySQL 8.0** (XAMPP)
- **ORM**: Sequelize con migraciones
- **Autenticación**: JWT + bcrypt + refresh tokens
- **WebSockets**: Socket.IO para chat tiempo real
- **Procesamiento**: Multer, Sharp, procesamiento PDF
- **Colas**: Bull/Agenda para trabajos pesados
- **Logging**: Winston con rotación

### **Frontend**
- **React 18** + **Vite** (puerto 5173)
- **UI**: Material-UI (@mui/material) con tema personalizado
- **Estado**: Zustand con persistencia
- **Formularios**: React Hook Form + Zod validation
- **Archivos**: @formkit/drag-and-drop
- **Gráficos**: Chart.js + react-chartjs-2
- **Tablas**: @mui/x-data-grid + @tanstack/react-table
- **Fechas**: Day.js + @mui/x-date-pickers
- **Animaciones**: Framer Motion
- **HTTP**: Axios con interceptores

### **Base de Datos**
```
sat_digital_v2 (MySQL)
├── usuarios (RBAC: 6 roles)
├── proveedores (5 principales con segregación estricta)
├── sitios (12 sitios distribuidos)
├── periodos_auditoria (ciclos semestrales)
├── auditorias (gestión de auditorías)
├── documentos (13 secciones técnicas)
├── secciones_tecnicas (configuración)
└── bitacora (auditoría completa del sistema)
```

## 👥 **Sistema de Roles y Permisos**

### **Roles Implementados:**
1. **admin**: Gestión completa del sistema
2. **auditor_general**: Evaluaciones y asignaciones completas
3. **auditor_interno**: Evaluaciones técnicas específicas  
4. **jefe_proveedor**: Gestión de sitios del proveedor (segregación crítica)
5. **tecnico_proveedor**: Soporte técnico limitado al proveedor
6. **visualizador**: Solo dashboards ejecutivos

### **Segregación por Proveedor**: 
Los usuarios de proveedor **SOLO** pueden acceder a datos de su propio proveedor (segregación crítica implementada).

## 🔧 **Instalación y Configuración**

### **Prerrequisitos**
- **Windows 11** + **XAMPP** (Apache, MySQL, PHP)
- **Node.js 18+**
- **Git**

### **Instalación Backend**
```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno en .env
npm run migrate    # Ejecutar migraciones
npm run seed       # Sembrar datos iniciales
npm run dev        # Desarrollo con nodemon
```

### **Instalación Frontend**
```bash
cd frontend
npm install
npm run dev        # Desarrollo con Vite (puerto 5173)
```

### **Scripts del Sistema (Windows .bat)**
```bash
start-full-system.bat    # Inicia backend + frontend
start-backend.bat        # Solo backend
start-frontend.bat       # Solo frontend
```

## 🔑 **Credenciales de Acceso**

### **Usuarios de Prueba Disponibles:**
```
🔴 Admin: admin@satdigital.com / admin123
🔵 Auditor General: auditor@satdigital.com / auditor123  
🟡 Auditor Interno: auditoria@satdigital.com / auditor123
🟢 Jefe Proveedor: proveedor@activo.com / proveedor123
🟢 Técnico Proveedor: tecnico@activo.com / tecnico123
🟠 Visualizador: visualizador@satdigital.com / visual123
```

## 📊 **Información de Proveedores**

### **5 Proveedores Principales:**
1. **Grupo Activo SRL** - CUIT: 30-71044895-3 (Florida 141, CABA)
2. **Centro de Interacción Multimedia S.A. (APEX)** - CUIT: 30-70827680-0 (3 sitios)
3. **CityTech S.A. (Teleperformance)** - CUIT: 30-70908678-9 (3 sitios)  
4. **CAT Technologies Argentina S.A** - CUIT: 30-70949292-2 (Mitre 853, CABA)
5. **Stratton Argentina SA (Konecta)** - CUIT: 30698477411 (3 sitios)

## 📋 **Secciones Técnicas (13 Total)**

### **Análisis en Tiempo Real:**
1. Topología de Red
2. Documentación y Controles Infraestructura  
3. Energía del Cuarto de Tecnología
4. Temperatura CT
5. Servidores
6. Internet
7. Personal capacitado en sitio
8. Escalamiento (Números de Contacto)

### **Análisis por Lotes:**
9. Cuarto de Tecnología
10. Conectividad (Certificación de Cableado)
11. Hardware/Software/Headset e Internet en el Hogar
12. Seguridad Informática
13. Información de Entorno

## 🌐 **URLs y Puertos**

- **Backend API**: http://localhost:3001/api
- **Frontend**: http://localhost:3003 (configurado) / http://localhost:5173 (Vite)
- **Health Check**: http://localhost:3001/health
- **phpMyAdmin**: http://localhost/phpmyadmin
- **Base de Datos**: `sat_digital_v2` (MySQL)

## 📚 **Comandos de Desarrollo**

### **Backend**
```bash
npm run dev          # Desarrollo con nodemon
npm start            # Producción
npm run migrate      # Migraciones de BD
npm run seed         # Sembrar datos
npm run db:reset     # Resetear y sembrar BD
npm test             # Ejecutar tests
npm run lint         # ESLint
npm run health-check # Verificación del sistema
```

### **Frontend**
```bash
npm run dev          # Desarrollo con Vite
npm run build        # Build de producción
npm run lint         # ESLint
npm run preview      # Preview del build
```

## 🔗 **Integraciones Externas**

### **API Aternity (Inventario):**
- **URL**: https://us3-odata.aternity.com/aternity.odata/latest/
- **Usuario**: PJPalomanes@teco.com.ar
- **Propósito**: Consultas de inventario de equipos en tiempo real

## 🧪 **Testing**

- **Tests Unitarios**: 60% (Jest + Supertest backend, Vitest frontend)
- **Tests Integración**: 25%
- **Tests E2E**: 15%
- **Cobertura Objetivo**: 80%+

## 📈 **Rendimiento y Escalabilidad**

- Arquitectura multi-tenant lista
- Base de datos normalizada para grandes volúmenes
- IA local evita costos de APIs externas
- Cache inteligente para reportes frecuentes
- Backups automáticos diarios

## 🎯 **Próximos Desarrollos**

1. **Sistema de Carga Documental**: Upload por secciones con validación
2. **Comunicación Asíncrona**: Chat auditor-proveedor en tiempo real
3. **Workflow de Estados**: Estados automáticos de auditoría
4. **Integración IA**: Ollama + LLaVA para análisis automático

## 👨‍💻 **Desarrollo**

**Metodología**: Domain-Driven Design + Clean Architecture
**Estándares CSS**: BEM methodology
**Seguridad**: JWT + RBAC + segregación por proveedor
**Logging**: Auditoría completa del sistema

## 📄 **Licencia**

Proyecto propietario - SAT-Digital Team

---

**Última actualización**: Enero 2025  
**Versión**: 1.0.0  
**Estado**: Fase 2 - Gestión de Auditorías (En progreso)