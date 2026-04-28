@echo off
setlocal enabledelayedexpansion
title SAT-Digital - Deploy Produccion

echo.
echo ================================================
echo   SAT-Digital - Deploy a Produccion
echo   Servidor: DWIN0540 - sat.personal.com.ar
echo ================================================
echo.

REM --- Verificar que se ejecuta como Administrador ---
net session >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Ejecutar como Administrador
    pause
    exit /b 1
)

set ROOT_DIR=D:\webs\SAT-DIGITAL
set BACKEND_DIR=D:\webs\SAT-DIGITAL\backend
set FRONTEND_DIR=D:\webs\SAT-DIGITAL\frontend
set SERVICE_NAME=satbackend.exe

cd /d %ROOT_DIR%

REM --- 1. Detener servicio ---
echo [1/5] Deteniendo servicio %SERVICE_NAME%...
sc stop "%SERVICE_NAME%" >nul 2>&1
timeout /t 5 /nobreak >nul
echo       Listo

REM --- 2. Actualizar codigo desde GitHub ---
echo [2/5] Actualizando codigo desde GitHub (main)...
git pull origin main
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: git pull fallo. Reiniciando servicio y abortando...
    sc start "%SERVICE_NAME%" >nul 2>&1
    pause
    exit /b 1
)
echo       Listo

REM --- 3. Instalar dependencias backend ---
echo [3/5] Instalando dependencias backend...
cd /d %BACKEND_DIR%
call npm install --production --silent
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm install del backend fallo.
    pause
    exit /b 1
)
echo       Listo

REM --- 4. Construir frontend ---
echo [4/5] Construyendo frontend...
cd /d %FRONTEND_DIR%
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm run build fallo.
    pause
    exit /b 1
)
echo       Listo

REM --- 5. Iniciar servicio ---
echo [5/5] Iniciando servicio %SERVICE_NAME%...
sc start "%SERVICE_NAME%" >nul 2>&1
timeout /t 4 /nobreak >nul

sc query "%SERVICE_NAME%" | find "RUNNING" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo       Servicio corriendo OK
) else (
    echo       ADVERTENCIA: Verificar con "sc query %SERVICE_NAME%"
)

echo.
echo ================================================
echo   Deploy completado
echo   Sitio: http://sat.personal.com.ar
echo ================================================
echo.
pause
