# ✅ Checklist de Despliegue SAT-Digital

## 📋 Pre-requisitos

- [ ] Node.js v18+ instalado en DWIN0540
- [ ] npm v8+ instalado
- [ ] Acceso a SQL Server DWIN0293 (10.11.33.10:1433)
- [ ] Credenciales de BD: calidad / passcalidad
- [ ] IIS instalado con módulos necesarios o PM2 instalado
- [ ] Permisos de administrador en DWIN0540

---

## 📦 1. Preparación del Proyecto

- [ ] Copiar todo el proyecto a `D:\webs\SAT-DIGITAL`
- [ ] Verificar estructura de carpetas:

  ```
  D:\webs\SAT-DIGITAL\
  ├── backend/
  ├── frontend/
  └── deploy/
  ```

---

## 🔧 2. Backend

### Instalación

- [ ] `cd D:\webs\SAT-DIGITAL\backend`
- [ ] `npm install --production`

### Configuración

- [ ] Copiar `.env`: `copy ..\deploy\.env.backend.production .env`
- [ ] Editar `.env` y cambiar:
  - [ ] `JWT_SECRET` (generar valor aleatorio fuerte)
  - [ ] `JWT_REFRESH_SECRET` (generar valor aleatorio fuerte)
  - [ ] `SESSION_SECRET` (generar valor aleatorio fuerte)
  - [ ] `SMTP_PASS` (configurar SMTP real)
  - [ ] `ATERNITY_PASSWORD` (configurar password real)

### Web.config (si usa IIS)

- [ ] Copiar: `copy ..\deploy\web.config.backend web.config`
- [ ] Copiar: `copy ..\deploy\iisnode.yml iisnode.yml`

### Base de Datos

- [ ] Conectar a SQL Server DWIN0293
- [ ] Crear base de datos: `CREATE DATABASE sat_digital_v2`
- [ ] Crear usuario si no existe (ver README-DEPLOY.md)
- [ ] Ejecutar migraciones: `npm run migrate`
- [ ] Ejecutar seeders (primera vez): `npm run seed`

---

## 🎨 3. Frontend

### Instalación

- [ ] `cd D:\webs\SAT-DIGITAL\frontend`
- [ ] `npm install`

### Configuración

- [ ] Copiar `.env`: `copy ..\deploy\.env.frontend.production .env`
- [ ] Verificar URLs en `.env` apuntan a backend correcto

### Build

- [ ] `npm run build`
- [ ] Verificar carpeta `dist` creada
- [ ] Copiar web.config: `copy ..\deploy\web.config.frontend dist\web.config`

---

## 🌐 4. Configuración IIS (Opción A)

### Backend

- [ ] Crear Application Pool: `SAT-Digital-Backend`
  - [ ] .NET CLR: No Managed Code
  - [ ] Pipeline: Integrated
- [ ] Crear sitio web:
  - [ ] Nombre: SAT-Digital-Backend
  - [ ] Ruta: `D:\webs\SAT-DIGITAL\backend`
  - [ ] Binding: http, 10.75.247.181:3001
  - [ ] App Pool: SAT-Digital-Backend

### Frontend

- [ ] Crear Application Pool: `SAT-Digital-Frontend`
  - [ ] .NET CLR: No Managed Code
  - [ ] Pipeline: Integrated
- [ ] Crear sitio web:
  - [ ] Nombre: SAT-Digital-Frontend
  - [ ] Ruta: `D:\webs\SAT-DIGITAL\frontend\dist`
  - [ ] Binding: http, 10.75.247.181:80
  - [ ] App Pool: SAT-Digital-Frontend

### Permisos

- [ ] Dar permisos a Application Pools:

  ```powershell
  icacls "D:\webs\SAT-DIGITAL" /grant "IIS APPPOOL\SAT-Digital-Backend:(OI)(CI)F" /T
  icacls "D:\webs\SAT-DIGITAL" /grant "IIS APPPOOL\SAT-Digital-Frontend:(OI)(CI)F" /T
  ```

### Reiniciar IIS

- [ ] `iisreset`

---

## 🔄 5. Configuración PM2 (Opción B - Recomendada)

### Instalación PM2

- [ ] `npm install -g pm2`
- [ ] `npm install -g pm2-windows-service`
- [ ] `pm2-service-install -n PM2-SAT-Digital`

### Backend con PM2

- [ ] `cd D:\webs\SAT-DIGITAL\backend`
- [ ] Copiar config: `copy ..\deploy\ecosystem.config.js .`
- [ ] Iniciar: `pm2 start ecosystem.config.js`
- [ ] Guardar: `pm2 save`
- [ ] Verificar: `pm2 status`

### Frontend con IIS

- [ ] Crear sitio IIS para `D:\webs\SAT-DIGITAL\frontend\dist`
- [ ] Binding: http, 10.75.247.181:80

---

## ✅ 6. Verificación

### Health Check Backend

- [ ] Abrir: <http://10.75.247.181:3001/health>
- [ ] Verificar respuesta JSON con `"status": "ok"`

### Frontend

- [ ] Abrir: <http://10.75.247.181>
- [ ] Verificar que carga la aplicación React

### Login

- [ ] Probar login con usuario: `admin@satdigital.com` / `admin123`
- [ ] Verificar que redirige al dashboard

### Base de Datos

- [ ] Verificar tablas creadas en SQL Server
- [ ] Verificar datos iniciales (usuarios, proveedores, etc.)

### WebSocket/Chat

- [ ] Probar funcionalidad de chat en la aplicación
- [ ] Verificar notificaciones en tiempo real

### Logs

- [ ] Verificar logs en `D:\webs\SAT-DIGITAL\backend\logs\app.log`
- [ ] Si usa PM2: `pm2 logs sat-digital-backend`

---

## 🔐 7. Seguridad

- [ ] Cambiar todos los secrets en `.env` del backend
- [ ] Configurar firewall para puertos 80, 443, 3001
- [ ] Configurar certificado SSL (HTTPS)
- [ ] Actualizar URLs de HTTP a HTTPS en .env
- [ ] Verificar permisos de archivos y carpetas
- [ ] Configurar backup automático de base de datos

---

## 📊 8. Monitoreo

- [ ] Configurar logs rotation
- [ ] Configurar alertas de errores
- [ ] Verificar PM2 monit: `pm2 monit`
- [ ] Configurar monitoreo de recursos del servidor

---

## 🚀 9. Post-Despliegue

- [ ] Documentar URLs de acceso
- [ ] Documentar credenciales (en lugar seguro)
- [ ] Capacitar usuarios administradores
- [ ] Realizar pruebas de carga
- [ ] Configurar backups periódicos
- [ ] Crear procedimientos de actualización
- [ ] Crear plan de contingencia

---

## 📝 Información de Acceso

### URLs

- **Frontend:** <http://10.75.247.181>
- **Backend API:** <http://10.75.247.181:3001/api>
- **Health Check:** <http://10.75.247.181:3001/health>

### Usuarios Iniciales

- **Admin:** <admin@satdigital.com> / admin123
- **Auditor:** <auditor@satdigital.com> / auditor123
- **Proveedor:** <proveedor@activo.com> / proveedor123

### Servidores

- **Web Server:** DWIN0540 (10.75.247.181)
- **DB Server:** DWIN0293 (10.11.33.10)
- **Base de Datos:** sat_digital_v2
- **Usuario BD:** calidad / passcalidad

---

## ❌ Troubleshooting

Si algo falla:

1. **Backend no inicia:**

   - [ ] Verificar logs: `type D:\webs\SAT-DIGITAL\backend\logs\error.log`
   - [ ] Verificar conexión BD: `telnet 10.11.33.10 1433`
   - [ ] Verificar puerto: `netstat -ano | findstr :3001`

2. **Frontend no carga:**

   - [ ] Verificar build existe: `dir D:\webs\SAT-DIGITAL\frontend\dist`
   - [ ] Verificar web.config en dist
   - [ ] Verificar permisos IIS

3. **Error de conexión BD:**

   - [ ] Ping al servidor: `ping 10.11.33.10`
   - [ ] Verificar firewall
   - [ ] Verificar credenciales en .env

4. **Socket.IO no conecta:**
   - [ ] Verificar CORS en backend .env
   - [ ] Verificar WebSocket habilitado en IIS
   - [ ] Verificar URL en frontend .env

---

## 📞 Soporte

- **Administrador:** <PJPalomanes@teco.com.ar>
- **Documentación:** D:\webs\SAT-DIGITAL\documentacion
- **Logs:** D:\webs\SAT-DIGITAL\backend\logs

---

**Fecha de despliegue:** ********\_********

**Desplegado por:** ********\_********

**Firma:** ********\_********
