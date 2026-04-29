@echo off
REM ===============================================
REM SAT-Digital - Script de Instalación
REM ===============================================
REM Servidor: DWIN0540
REM Ubicación: D:\webs\SAT-DIGITAL
REM Fecha: 2025-12-29
REM ===============================================

echo.
echo =========================================
echo  SAT-Digital - Instalacion de Dependencias
echo =========================================
echo.

REM Verificar si Node.js está instalado
echo [1/6] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instale Node.js v18 o superior desde https://nodejs.org
    pause
    exit /b 1
)
echo OK - Node.js detectado
node --version

REM Verificar npm
echo.
echo [2/6] Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm no esta instalado
    pause
    exit /b 1
)
echo OK - npm detectado
npm --version

REM Ir a la carpeta del backend
echo.
echo [3/6] Instalando dependencias del BACKEND...
cd D:\webs\SAT-DIGITAL\backend
if errorlevel 1 (
    echo ERROR: No se encontro la carpeta D:\webs\SAT-DIGITAL\backend
    pause
    exit /b 1
)

echo Ejecutando npm install en backend...
call npm install --production
if errorlevel 1 (
    echo ERROR: Fallo la instalacion de dependencias del backend
    pause
    exit /b 1
)
echo OK - Dependencias del backend instaladas

REM Copiar archivo .env
echo.
echo [4/6] Configurando archivo .env del backend...
if exist .env (
    echo Archivo .env ya existe, creando backup...
    copy .env .env.backup.%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
)
echo Copiando .env.backend.production a .env...
copy /Y ..\deploy\.env.backend.production .env
if errorlevel 1 (
    echo ADVERTENCIA: No se pudo copiar el archivo .env
) else (
    echo OK - Archivo .env configurado
)

REM Ir a la carpeta del frontend
echo.
echo [5/6] Instalando dependencias del FRONTEND...
cd D:\webs\SAT-DIGITAL\frontend
if errorlevel 1 (
    echo ERROR: No se encontro la carpeta D:\webs\SAT-DIGITAL\frontend
    pause
    exit /b 1
)

echo Ejecutando npm install en frontend...
call npm install
if errorlevel 1 (
    echo ERROR: Fallo la instalacion de dependencias del frontend
    pause
    exit /b 1
)
echo OK - Dependencias del frontend instaladas

REM Copiar archivo .env del frontend
echo.
echo [6/6] Configurando archivo .env del frontend...
if exist .env (
    echo Archivo .env ya existe, creando backup...
    copy .env .env.backup.%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
)
echo Copiando .env.frontend.production a .env...
copy /Y ..\deploy\.env.frontend.production .env
if errorlevel 1 (
    echo ADVERTENCIA: No se pudo copiar el archivo .env
) else (
    echo OK - Archivo .env configurado
)

echo.
echo =========================================
echo  INSTALACION COMPLETADA
echo =========================================
echo.
echo Proximos pasos:
echo 1. Configurar base de datos SQL Server (ejecutar migraciones)
echo 2. Construir el frontend: npm run build
echo 3. Configurar IIS o PM2 segun la opcion elegida
echo.
echo Para mas informacion, consulte README-DEPLOY.md
echo.
pause
