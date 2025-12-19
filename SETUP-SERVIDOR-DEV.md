# Configuración del Servidor de Desarrollo DWIN0540

**Servidor:** DWIN0540
**IP:** 10.75.247.181
**Rama de trabajo:** `dev`
**Sistema Operativo:** Windows Server 2022

---

## 1. Clonación del Proyecto en el Servidor

### 1.1 Ubicación recomendada

```cmd
C:\inetpub\wwwroot\SAT-Digital
```

### 1.2 Clonar el repositorio

Abrir PowerShell o CMD en el servidor:

```bash
cd C:\inetpub\wwwroot
git clone https://github.com/ppalomanes/SAT-DIGITAL.git
cd SAT-Digital
```

### 1.3 Cambiar a la rama dev

```bash
git checkout dev
```

---

## 2. Requisitos Previos en el Servidor

Verificar que estén instalados:

- **Node.js 18+** (verificar: `node -v`)
- **npm 8+** (verificar: `npm -v`)
- **MySQL 8.0** (XAMPP o MySQL Server)
- **Git** (verificar: `git --version`)

### Instalación de Node.js (si no está instalado)

Descargar desde: https://nodejs.org/en/download/
- Versión recomendada: LTS 18.x o superior

---

## 3. Configuración del Backend

### 3.1 Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3.2 Configurar variables de entorno

Crear el archivo `.env` en la carpeta `backend`:

```bash
copy .env.example .env
```

Editar `backend\.env` con la configuración del servidor:

```env
# ===== APPLICATION SETTINGS =====
NODE_ENV=development
PORT=3001
APP_VERSION=1.0.0

# ===== DATABASE CONFIGURATION =====
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sat_digital
DB_USER=root
DB_PASS=

# ===== JWT CONFIGURATION =====
JWT_SECRET=sat_digital_super_secret_key_2025_change_in_production
JWT_REFRESH_SECRET=sat_digital_refresh_secret_key_2025_change_in_production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# ===== CORS CONFIGURATION =====
CORS_CREDENTIALS=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://10.75.247.181:3000,http://10.75.247.181:5173,http://10.75.247.181:3001

# ===== FRONTEND CONFIGURATION =====
FRONTEND_URL=http://10.75.247.181:5173

# ===== WEBSOCKET SETTINGS =====
WEBSOCKET_ENABLED=true
MAX_WEBSOCKET_CONNECTIONS=100

# ===== FILE UPLOAD SETTINGS =====
MAX_FILE_SIZE=200000000
UPLOAD_PATH=./uploads
TEMP_DIR=./temp

# ===== LOGGING =====
LOG_LEVEL=info
LOG_FILE=./logs/sat-digital.log

# Timezone para Argentina
TIMEZONE=America/Argentina/Buenos_Aires
```

### 3.3 Configurar la base de datos

#### Opción A: Usando MySQL de XAMPP

1. Iniciar XAMPP Control Panel
2. Iniciar MySQL
3. Abrir phpMyAdmin: http://localhost/phpmyadmin
4. Crear la base de datos `sat_digital` (si no existe)

#### Opción B: Usar los scripts del proyecto

```bash
# Ejecutar migraciones (crear tablas)
npm run migrate

# Cargar datos de prueba
npm run seed

# O hacer ambos en un solo comando
npm run db:reset
```

### 3.4 Verificar salud del sistema

```bash
npm run health-check
```

### 3.5 Iniciar el backend

**Modo desarrollo (con nodemon):**

```bash
npm run dev
```

**Modo producción:**

```bash
npm start
```

El backend estará disponible en: http://10.75.247.181:3001

---

## 4. Configuración del Frontend

### 4.1 Instalar dependencias del frontend

Abrir otra terminal/CMD:

```bash
cd frontend
npm install
```

### 4.2 Configurar la URL del backend

Editar `frontend\src\config\api.js` (o el archivo de configuración correspondiente):

```javascript
export const API_BASE_URL = 'http://10.75.247.181:3001/api';
export const WEBSOCKET_URL = 'http://10.75.247.181:3001';
```

### 4.3 Iniciar el frontend

```bash
npm run dev
```

El frontend estará disponible en: http://10.75.247.181:5173

---

## 5. Acceso a la Aplicación

### URLs del sistema

- **Frontend:** http://10.75.247.181:5173
- **Backend API:** http://10.75.247.181:3001/api
- **Health Check:** http://10.75.247.181:3001/health
- **phpMyAdmin:** http://10.75.247.181/phpmyadmin

### Credenciales de acceso

**Administrador:**
- Email: admin@satdigital.com
- Password: admin123

**Auditor:**
- Email: auditor@satdigital.com
- Password: auditor123

**Proveedor:**
- Email: proveedor@activo.com
- Password: proveedor123

---

## 6. Scripts Útiles para Windows

### 6.1 Crear script para iniciar todo el sistema

Crear `start-dev-server.bat` en la raíz del proyecto:

```batch
@echo off
echo ========================================
echo  SAT-Digital - Servidor de Desarrollo
echo  DWIN0540 - 10.75.247.181
echo ========================================
echo.

echo Iniciando Backend (Puerto 3001)...
start "SAT-Digital Backend" cmd /k "cd backend && npm run dev"

timeout /t 5 /nobreak > nul

echo Iniciando Frontend (Puerto 5173)...
start "SAT-Digital Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Sistema iniciado correctamente
echo Backend:  http://10.75.247.181:3001
echo Frontend: http://10.75.247.181:5173
echo ========================================
```

### 6.2 Ejecutar el script

```bash
start-dev-server.bat
```

---

## 7. Workflow de Trabajo con Git

### 7.1 Flujo diario de trabajo

```bash
# Al iniciar el día
git checkout dev
git pull origin dev

# Hacer cambios...
# ...

# Guardar cambios
git add .
git commit -m "Descripción de los cambios"
git push origin dev
```

### 7.2 Sincronizar con la rama local

```bash
# Desde el servidor (rama dev)
git push origin dev

# Desde tu máquina local (rama local)
git checkout local
git pull origin dev  # Traer cambios de dev
git merge dev        # Fusionar cambios
```

---

## 8. Verificación de Instalación

### Checklist de verificación

- [ ] Node.js y npm instalados
- [ ] MySQL corriendo (XAMPP o servicio)
- [ ] Repositorio clonado en rama `dev`
- [ ] Dependencias del backend instaladas
- [ ] Dependencias del frontend instaladas
- [ ] Archivo `.env` configurado
- [ ] Base de datos `sat_digital` creada
- [ ] Migraciones ejecutadas (`npm run migrate`)
- [ ] Datos de prueba cargados (`npm run seed`)
- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 5173
- [ ] Login exitoso con credenciales de prueba

---

## 9. Resolución de Problemas

### Problema: Error de conexión a MySQL

**Solución:**
1. Verificar que MySQL esté corriendo en XAMPP
2. Verificar credenciales en `.env`
3. Verificar que la base de datos `sat_digital` exista

### Problema: Puerto 3001 o 5173 en uso

**Solución:**
```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Matar el proceso (reemplazar PID)
taskkill /PID <numero_pid> /F
```

### Problema: Error "Cannot find module"

**Solución:**
```bash
# Borrar node_modules e instalar de nuevo
rmdir /s /q node_modules
npm install
```

### Problema: Error CORS

**Solución:**
Verificar que `ALLOWED_ORIGINS` en `.env` incluya:
```
http://10.75.247.181:5173,http://10.75.247.181:3001
```

---

## 10. Comandos Rápidos de Referencia

```bash
# Backend
cd backend
npm run dev              # Iniciar en modo desarrollo
npm run health-check     # Verificar salud del sistema
npm run db:reset         # Resetear base de datos
npm run migrate          # Solo ejecutar migraciones
npm run seed             # Solo cargar datos de prueba

# Frontend
cd frontend
npm run dev              # Iniciar en modo desarrollo
npm run build            # Build para producción
npm run preview          # Preview del build

# Git
git status               # Ver estado
git pull origin dev      # Traer cambios
git push origin dev      # Subir cambios
git checkout dev         # Cambiar a rama dev
git branch               # Ver ramas locales
```

---

## 11. Estructura de Directorios

```
C:\inetpub\wwwroot\SAT-Digital\
├── backend\
│   ├── src\
│   │   ├── domains\          # Dominios de negocio
│   │   ├── shared\           # Código compartido
│   │   └── app.js            # Entry point
│   ├── uploads\              # Archivos subidos
│   ├── logs\                 # Logs del sistema
│   ├── .env                  # Variables de entorno
│   └── package.json
│
├── frontend\
│   ├── src\
│   │   ├── components\       # Componentes React
│   │   ├── pages\            # Páginas
│   │   ├── services\         # Servicios API
│   │   └── main.jsx          # Entry point
│   └── package.json
│
├── documentacion\            # Documentación del proyecto
├── SETUP-SERVIDOR-DEV.md     # Este archivo
└── start-dev-server.bat      # Script de inicio
```

---

## 12. Contacto y Soporte

**Documentación del proyecto:**
- Ver carpeta `documentacion/`
- Archivo maestro: `documentacion/01-DOCUMENTO-MAESTRO.md`

**Repositorio:**
- https://github.com/ppalomanes/SAT-DIGITAL

**En caso de problemas:**
1. Revisar logs en `backend/logs/`
2. Ejecutar `npm run health-check` en backend
3. Verificar consola del navegador (F12)
4. Consultar documentación en `CLAUDE.md`

---

**Última actualización:** 2025-12-19
**Responsable:** Pablo Palomanes
**Rama:** dev
**Servidor:** DWIN0540 (10.75.247.181)
