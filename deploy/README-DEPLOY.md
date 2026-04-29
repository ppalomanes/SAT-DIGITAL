# 🚀 SAT-Digital - Guía de Despliegue en Producción

## 📋 Información del Servidor

- **Servidor Web:** DWIN0540 (IP: 10.75.247.181)
- **Ubicación:** `D:\webs\SAT-DIGITAL`
- **Servidor BD:** DWIN0293 (IP: 10.11.33.10)
- **Motor BD:** SQL Server 2016
- **Base de Datos:** `sat_digital_v2`
- **Usuario BD:** `calidad` / `passcalidad`

---

## 📦 Contenido de la Carpeta Deploy

```text
deploy/
├── .env.backend.production      # Configuración backend (SQL Server)
├── .env.frontend.production     # Configuración frontend
├── web.config.backend           # IIS config para backend
├── web.config.frontend          # IIS config para frontend (React)
├── ecosystem.config.js          # PM2 configuration
├── install.bat                  # Script de instalación
├── deploy.bat                   # Script de despliegue completo
├── start-pm2.bat               # Iniciar con PM2
├── stop-pm2.bat                # Detener PM2
└── README-DEPLOY.md            # Este archivo
```

---

## 🔧 Pre-requisitos

### 1. Software Necesario

- [x] **Node.js v18+** (ya instalado: v22.21.1)
- [x] **npm v8+** (ya instalado: v10.9.4)
- [ ] **IIS 8.0+** con módulos necesarios
- [ ] **iisnode** (solo si usa IIS) ó **PM2** (alternativa recomendada)
- [ ] **URL Rewrite Module** para IIS
- [x] **SQL Server 2016** (DWIN0293)

### 2. Instalar Módulos de IIS (Opción A - IIS + iisnode)

```powershell
# Ejecutar en PowerShell como Administrador

# Instalar IIS
Install-WindowsFeature -name Web-Server -IncludeManagementTools

# Instalar módulos necesarios
Install-WindowsFeature -name Web-WebSockets
Install-WindowsFeature -name Web-Asp-Net45

# Descargar e instalar iisnode
# https://github.com/Azure/iisnode/releases
# Instalar: iisnode-full-v0.2.21-x64.msi

# Descargar e instalar URL Rewrite Module
# https://www.iis.net/downloads/microsoft/url-rewrite
```

### 3. Instalar PM2 (Opción B - Recomendada)

```powershell
# Instalar PM2 globalmente
npm install -g pm2

# Instalar PM2 Windows Service
npm install -g pm2-windows-service

# Configurar PM2 como servicio de Windows
pm2-service-install -n PM2-SAT-Digital
```

---

## 🚀 Proceso de Despliegue

### Método 1: Script Automático (Recomendado)

```cmd
# 1. Copiar carpeta del proyecto a D:\webs\SAT-DIGITAL

# 2. Ejecutar script de despliegue
cd D:\webs\SAT-DIGITAL\deploy
deploy.bat

# 3. Seguir las instrucciones en pantalla
```

### Método 2: Manual Paso a Paso

#### Paso 1: Copiar Archivos al Servidor

```powershell
# Copiar todo el proyecto a D:\webs\SAT-DIGITAL
# Asegurarse de que la estructura sea:
# D:\webs\SAT-DIGITAL\
# ├── backend/
# ├── frontend/
# └── deploy/
```

#### Paso 2: Configurar Backend

```cmd
# Ir a la carpeta del backend
cd D:\webs\SAT-DIGITAL\backend

# Instalar dependencias
npm install --production

# Copiar archivo .env
copy ..\deploy\.env.backend.production .env

# IMPORTANTE: Editar .env y cambiar valores sensibles:
# - JWT_SECRET
# - JWT_REFRESH_SECRET
# - SESSION_SECRET
# - SMTP_PASS
# - ATERNITY_PASSWORD

# Ejecutar migraciones de base de datos
npm run migrate

# Opcional: Ejecutar seeders si es primera instalación
npm run seed
```

#### Paso 3: Configurar Frontend

```cmd
# Ir a la carpeta del frontend
cd D:\webs\SAT-DIGITAL\frontend

# Instalar dependencias
npm install

# Copiar archivo .env
copy ..\deploy\.env.frontend.production .env

# Construir para producción
npm run build

# Copiar web.config al build
copy ..\deploy\web.config.frontend dist\web.config
```

---

## 🌐 Configuración IIS (Opción A)

### 1. Crear Sitio para el Backend

```powershell
# Abrir IIS Manager (inetmgr.exe)

# Crear nuevo Application Pool
# - Nombre: SAT-Digital-Backend
# - .NET CLR version: No Managed Code
# - Managed pipeline mode: Integrated

# Crear nuevo sitio
# - Nombre: SAT-Digital-Backend
# - Application pool: SAT-Digital-Backend
# - Ruta física: D:\webs\SAT-DIGITAL\backend
# - Binding: http, puerto 3001, IP: 10.75.247.181

# Copiar web.config
copy D:\webs\SAT-DIGITAL\deploy\web.config.backend D:\webs\SAT-DIGITAL\backend\web.config
```

### 2. Crear Sitio para el Frontend

```powershell
# Crear nuevo Application Pool
# - Nombre: SAT-Digital-Frontend
# - .NET CLR version: No Managed Code
# - Managed pipeline mode: Integrated

# Crear nuevo sitio
# - Nombre: SAT-Digital-Frontend
# - Application pool: SAT-Digital-Frontend
# - Ruta física: D:\webs\SAT-DIGITAL\frontend\dist
# - Binding: http, puerto 80, IP: 10.75.247.181

# El web.config ya está en dist/ desde el build
```

### 3. Permisos de Carpetas

```powershell
# Dar permisos al usuario de IIS
icacls "D:\webs\SAT-DIGITAL" /grant "IIS APPPOOL\SAT-Digital-Backend:(OI)(CI)F" /T
icacls "D:\webs\SAT-DIGITAL" /grant "IIS APPPOOL\SAT-Digital-Frontend:(OI)(CI)F" /T

# Permisos específicos para uploads y logs
icacls "D:\webs\SAT-DIGITAL\backend\uploads" /grant "IIS APPPOOL\SAT-Digital-Backend:(OI)(CI)F" /T
icacls "D:\webs\SAT-DIGITAL\backend\logs" /grant "IIS APPPOOL\SAT-Digital-Backend:(OI)(CI)F" /T
```

### 4. Reiniciar IIS

```powershell
iisreset
```

---

## 🔄 Configuración PM2 (Opción B - Recomendada)

### 1. Copiar Configuración

```cmd
cd D:\webs\SAT-DIGITAL\backend
copy ..\deploy\ecosystem.config.js .
```

### 2. Iniciar Aplicación

```cmd
# Opción 1: Usar script
cd D:\webs\SAT-DIGITAL\deploy
start-pm2.bat

# Opción 2: Manual
cd D:\webs\SAT-DIGITAL\backend
pm2 start ecosystem.config.js
pm2 save
```

### 3. Configurar Servicio de Windows

```powershell
# Instalar servicio de Windows
pm2-service-install -n PM2-SAT-Digital

# Configurar para que inicie automáticamente
pm2 startup
pm2 save

# Verificar servicio
services.msc  # Buscar PM2-SAT-Digital
```

### 4. Frontend con IIS

Como el frontend es estático, usar IIS para servir `dist/`:

```powershell
# Crear sitio IIS apuntando a D:\webs\SAT-DIGITAL\frontend\dist
# Binding: http, puerto 80, IP: 10.75.247.181
```

---

## 🗄️ Configuración Base de Datos

### 1. Crear Base de Datos en SQL Server

```sql
-- Conectarse a DWIN0293 (10.11.33.10)
-- Usar SQL Server Management Studio

-- Crear base de datos
CREATE DATABASE sat_digital_v2
COLLATE Latin1_General_CI_AS;
GO

-- Crear usuario (si no existe)
USE [master];
GO

CREATE LOGIN [calidad] WITH PASSWORD = 'passcalidad';
GO

USE [sat_digital_v2];
GO

CREATE USER [calidad] FOR LOGIN [calidad];
GO

ALTER ROLE [db_owner] ADD MEMBER [calidad];
GO
```

### 2. Ejecutar Migraciones

```cmd
cd D:\webs\SAT-DIGITAL\backend
npm run migrate
```

### 3. Poblar Datos Iniciales (Opcional)

```cmd
npm run seed
```

---

## ✅ Verificación del Despliegue

### 1. Health Check del Backend

```powershell
# Verificar que el backend esté funcionando
curl http://10.75.247.181:3001/health

# Respuesta esperada:
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected",
  "version": "1.0.0"
}
```

### 2. Verificar Frontend

```powershell
# Abrir navegador
start http://10.75.247.181

# Debería cargar la aplicación React
```

### 3. Verificar Logs

```powershell
# Si usa PM2
pm2 logs sat-digital-backend

# Si usa IIS
# Revisar D:\webs\SAT-DIGITAL\backend\logs\app.log
# Revisar Event Viewer > Windows Logs > Application
```

### 4. Verificar Base de Datos

```sql
-- Conectarse a DWIN0293
USE sat_digital_v2;

-- Verificar tablas
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- Verificar usuarios iniciales
SELECT id, email, rol FROM usuarios;
```

---

## 🔧 Solución de Problemas

### Problema: Backend no inicia

```powershell
# Verificar logs
type D:\webs\SAT-DIGITAL\backend\logs\error.log

# Verificar conexión a SQL Server
sqlcmd -S 10.11.33.10 -U calidad -P passcalidad -d sat_digital_v2 -Q "SELECT @@VERSION"

# Verificar puerto 3001
netstat -ano | findstr :3001
```

### Problema: Frontend no carga

```powershell
# Verificar que el build exista
dir D:\webs\SAT-DIGITAL\frontend\dist

# Verificar web.config
type D:\webs\SAT-DIGITAL\frontend\dist\web.config

# Verificar permisos
icacls D:\webs\SAT-DIGITAL\frontend\dist
```

### Problema: Error de conexión a BD

```powershell
# Verificar conectividad
ping 10.11.33.10
telnet 10.11.33.10 1433

# Verificar firewall
Test-NetConnection -ComputerName 10.11.33.10 -Port 1433

# Verificar credenciales en .env
type D:\webs\SAT-DIGITAL\backend\.env | findstr SQLSERVER
```

### Problema: Socket.IO no conecta

```powershell
# Verificar CORS en .env backend
type D:\webs\SAT-DIGITAL\backend\.env | findstr CORS

# Verificar URL en .env frontend
type D:\webs\SAT-DIGITAL\frontend\.env | findstr SOCKET

# Verificar WebSocket en IIS
# IIS Manager > Sitio > WebSocket Protocol: Enabled
```

---

## 🔐 Seguridad Post-Despliegue

### 1. Cambiar Secrets

```powershell
# Editar D:\webs\SAT-DIGITAL\backend\.env

# Cambiar TODOS estos valores:
JWT_SECRET=GENERAR-VALOR-ALEATORIO-FUERTE
JWT_REFRESH_SECRET=GENERAR-VALOR-ALEATORIO-FUERTE
SESSION_SECRET=GENERAR-VALOR-ALEATORIO-FUERTE
SMTP_PASS=PASSWORD-REAL-SMTP
ATERNITY_PASSWORD=PASSWORD-REAL-ATERNITY
```

### 2. Configurar HTTPS (Recomendado)

```powershell
# Instalar certificado SSL en IIS
# IIS Manager > Server Certificates > Import Certificate

# Cambiar binding de HTTP a HTTPS
# Sitio > Bindings > Add > https, puerto 443

# Actualizar URLs en .env
FRONTEND_URL=https://10.75.247.181
CORS_ORIGIN=https://10.75.247.181
```

### 3. Configurar Firewall

```powershell
# Abrir solo puertos necesarios
New-NetFirewallRule -DisplayName "SAT-Digital Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "SAT-Digital Frontend" -Direction Inbound -LocalPort 80,443 -Protocol TCP -Action Allow
```

---

## 📊 Monitoreo

### PM2 Dashboard

```powershell
# Monitor en tiempo real
pm2 monit

# Ver logs en tiempo real
pm2 logs sat-digital-backend --lines 100

# Estado de la aplicación
pm2 status
```

### Logs

```powershell
# Backend logs
type D:\webs\SAT-DIGITAL\backend\logs\app.log
type D:\webs\SAT-DIGITAL\backend\logs\error.log

# PM2 logs
type D:\webs\SAT-DIGITAL\backend\logs\pm2-out.log
type D:\webs\SAT-DIGITAL\backend\logs\pm2-error.log

# IIS logs
type C:\inetpub\logs\LogFiles\W3SVC1\*.log
```

---

## 🔄 Actualizaciones

### Actualizar Backend

```cmd
cd D:\webs\SAT-DIGITAL\backend

# Detener aplicación
pm2 stop sat-digital-backend

# Actualizar código (git pull o copiar archivos)
git pull origin main

# Instalar dependencias
npm install --production

# Ejecutar migraciones si hay cambios
npm run migrate

# Reiniciar aplicación
pm2 restart sat-digital-backend
```

### Actualizar Frontend

```cmd
cd D:\webs\SAT-DIGITAL\frontend

# Actualizar código
git pull origin main

# Instalar dependencias
npm install

# Construir
npm run build

# Copiar web.config
copy ..\deploy\web.config.frontend dist\web.config

# Reiniciar IIS (si es necesario)
iisreset
```

---

## 📞 Contacto y Soporte

- **Administrador:** PJPalomanes@teco.com.ar
- **Soporte TI:** soporte.sat@teco.com.ar
- **Documentación:** D:\webs\SAT-DIGITAL\documentacion

---

## ✅ Checklist de Despliegue

- [ ] Node.js v18+ instalado
- [ ] SQL Server 2016 accesible (10.11.33.10:1433)
- [ ] Proyecto copiado a D:\webs\SAT-DIGITAL
- [ ] Dependencias backend instaladas
- [ ] Dependencias frontend instaladas
- [ ] .env backend configurado y secrets cambiados
- [ ] .env frontend configurado
- [ ] Base de datos creada en SQL Server
- [ ] Migraciones ejecutadas
- [ ] Frontend construido (npm run build)
- [ ] IIS o PM2 configurado
- [ ] Permisos de carpetas configurados
- [ ] Health check backend OK (http://10.75.247.181:3001/health)
- [ ] Frontend carga correctamente (http://10.75.247.181)
- [ ] Login funciona con usuarios de prueba
- [ ] WebSocket/Chat funciona
- [ ] Logs generándose correctamente
- [ ] Firewall configurado
- [ ] HTTPS configurado (opcional pero recomendado)
- [ ] Backups automáticos configurados

---

## 🎉 Despliegue Completado

Una vez completado el checklist, el sistema SAT-Digital estará listo para producción en el servidor DWIN0540.

**Próximos pasos:**

1. Realizar pruebas de integración con usuarios reales
2. Configurar backups automáticos de la base de datos
3. Implementar monitoreo y alertas
4. Documentar procedimientos operativos
5. Capacitar usuarios finales

**¡Éxito con el despliegue!** 🚀
