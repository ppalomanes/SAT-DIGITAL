# 📁 Carpeta Deploy - SAT-Digital

## 📖 Índice de Archivos

Esta carpeta contiene todos los archivos necesarios para desplegar el sistema SAT-Digital en el servidor de producción DWIN0540 con base de datos SQL Server en DWIN0293.

---

## 📋 Documentación

### 📘 README-DEPLOY.md

**Guía completa de despliegue**

- Información del servidor
- Pre-requisitos
- Proceso de despliegue paso a paso
- Configuración IIS y PM2
- Configuración base de datos
- Verificación del despliegue
- Solución de problemas
- Seguridad post-despliegue
- Monitoreo y logs

👉 **LEER PRIMERO** - Documento principal de referencia

---

### ✅ CHECKLIST-DEPLOY.md

**Lista de verificación interactiva**

- Checklist completo del proceso de despliegue
- Organizado por secciones
- Formato imprimible para seguimiento
- Incluye troubleshooting rápido

👉 **Usar durante el despliegue** - Para asegurar que no se omita ningún paso

---

## ⚙️ Archivos de Configuración

### 🔧 .env.backend.production

**Variables de entorno del backend**

- Configuración de base de datos SQL Server
- Configuración de JWT y seguridad
- URLs y CORS
- Configuración de uploads y logs
- Integración SMTP y Aternity
- Configuración Ollama (IA)

⚠️ **IMPORTANTE:** Cambiar los valores de JWT_SECRET, JWT_REFRESH_SECRET, SESSION_SECRET y passwords antes de usar en producción

---

### 🔧 .env.frontend.production

**Variables de entorno del frontend**

- URLs del backend
- Configuración de WebSockets
- Feature flags
- Configuración de UI y localización

---

### 🌐 web.config.backend

**Configuración IIS para el backend**

- Configuración de iisnode para Node.js
- Reglas de reescritura
- Configuración de WebSockets
- Límites de archivos y timeouts
- Headers de seguridad

📝 Copiar a: `D:\webs\SAT-DIGITAL\backend\web.config`

---

### 🌐 web.config.frontend

**Configuración IIS para el frontend**

- Configuración para servir React SPA
- Reglas de reescritura para React Router
- Tipos MIME y compresión
- Headers de seguridad
- CORS

📝 Copiar a: `D:\webs\SAT-DIGITAL\frontend\dist\web.config`

---

### 🔧 iisnode.yml

**Configuración complementaria de iisnode**

- Configuración avanzada de iisnode
- Logging y debugging
- Performance tuning
- File monitoring

📝 Copiar a: `D:\webs\SAT-DIGITAL\backend\iisnode.yml`

---

### 🔄 ecosystem.config.js

**Configuración de PM2**

- Configuración para ejecutar backend con PM2
- Alternativa recomendada a iisnode
- Incluye configuración de cluster mode
- Logs, monitoring y auto-restart
- Deployment hooks

📝 **Alternativa a IIS+iisnode** - Más robusto para aplicaciones Node.js

---

## 🗄️ Base de Datos

### 📊 setup-database.sql

**Script de creación de base de datos SQL Server**

- Crear base de datos `sat_digital_v2`
- Crear login y usuario `calidad`
- Asignar permisos
- Verificación de configuración
- Comandos útiles de administración

📝 Ejecutar en DWIN0293 usando SQL Server Management Studio

---

## 🚀 Scripts de Despliegue

### 📦 install.bat

**Instalación de dependencias**

- Instala dependencias del backend
- Instala dependencias del frontend
- Copia archivos .env
- Verificación de Node.js y npm

🎯 **Primer script a ejecutar** - Instala todo lo necesario

---

### 🚀 deploy.bat

**Despliegue completo automatizado**

- Ejecuta todo el proceso de despliegue
- Instala dependencias
- Copia configuraciones
- Ejecuta migraciones
- Construye el frontend
- Copia archivos de configuración

🎯 **Script principal** - Despliegue completo en un comando

---

### ▶️ start-pm2.bat

**Iniciar aplicación con PM2**

- Inicia el backend usando PM2
- Guarda la configuración
- Muestra el estado

📝 Solo si usa PM2 en lugar de IIS

---

### ⏹️ stop-pm2.bat

**Detener aplicación PM2**

- Detiene el backend de PM2
- Muestra el estado

📝 Solo si usa PM2

---

### ✅ verify-deployment.bat

**Verificación post-despliegue**

- Verifica Node.js y npm
- Verifica carpetas y archivos
- Verifica configuraciones
- Verifica conectividad a BD
- Verifica servicios (IIS/PM2)
- Health check del backend
- Resumen de errores y advertencias

🎯 **Ejecutar después del despliegue** - Para verificar que todo funcione correctamente

---

## 🔄 Flujo de Trabajo Recomendado

### 1️⃣ Preparación

```bash
# Leer documentación completa
📘 README-DEPLOY.md
✅ CHECKLIST-DEPLOY.md
```

### 2️⃣ Copiar Proyecto

```bash
# Copiar todo el proyecto a:
D:\webs\SAT-DIGITAL\
```

### 3️⃣ Configurar Base de Datos

```bash
# En DWIN0293, ejecutar:
📊 setup-database.sql
```

### 4️⃣ Despliegue Automatizado

```bash
# En DWIN0540, ejecutar:
🚀 deploy.bat
```

### 5️⃣ Configurar Servicio

```bash
# Opción A - IIS:
# Seguir instrucciones en README-DEPLOY.md sección "Configuración IIS"

# Opción B - PM2 (Recomendado):
▶️ start-pm2.bat
```

### 6️⃣ Verificación

```bash
# Ejecutar script de verificación:
✅ verify-deployment.bat
```

### 7️⃣ Seguridad

```bash
# Editar .env del backend y cambiar:
# - JWT_SECRET
# - JWT_REFRESH_SECRET
# - SESSION_SECRET
# - Passwords de servicios
```

---

## 📞 Soporte

**Administrador del Sistema:**

- Email: PJPalomanes@teco.com.ar

**Información del Servidor:**

- Web Server: DWIN0540 (10.75.247.181)
- DB Server: DWIN0293 (10.11.33.10)
- Base de Datos: sat_digital_v2
- Usuario BD: calidad / passcalidad

**URLs de Acceso:**

- Frontend: http://10.75.247.181
- Backend API: http://10.75.247.181:3001/api
- Health Check: http://10.75.247.181:3001/health

---

## ⚠️ Notas Importantes

1. **Seguridad:** Cambiar TODOS los secrets y passwords en `.env.backend.production` antes de usar en producción

2. **Base de Datos:** El proyecto está configurado para SQL Server 2016. Si viene de MySQL, las migraciones de Sequelize se encargarán de crear las tablas

3. **IIS vs PM2:**

   - **IIS + iisnode:** Integración nativa con Windows Server
   - **PM2:** Más robusto, mejor monitoreo, recomendado para Node.js

4. **HTTPS:** Después del despliegue inicial, configurar certificado SSL y cambiar a HTTPS

5. **Backups:** Configurar backups automáticos de la base de datos SQL Server

6. **Logs:** Revisar logs periódicamente en `D:\webs\SAT-DIGITAL\backend\logs\`

---

## 📅 Historial de Versiones

- **v1.0.0** (2025-12-29): Configuración inicial de despliegue
  - Soporte para SQL Server 2016
  - Configuración IIS y PM2
  - Scripts de despliegue automatizado
  - Documentación completa

---

**¡Éxito con el despliegue!** 🚀
