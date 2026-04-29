@echo off
REM ===============================================
REM SAT-Digital - Iniciar con PM2
REM ===============================================

echo.
echo =========================================
echo  SAT-Digital - Iniciar con PM2
echo =========================================
echo.

cd D:\webs\SAT-DIGITAL\backend

REM Verificar si PM2 está instalado
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: PM2 no esta instalado
    echo Instale PM2 con: npm install -g pm2
    pause
    exit /b 1
)

echo PM2 detectado:
pm2 --version

echo.
echo Iniciando SAT-Digital Backend con PM2...
pm2 start ecosystem.config.js

echo.
echo Guardando configuracion de PM2...
pm2 save

echo.
echo Estado de las aplicaciones:
pm2 status

echo.
echo =========================================
echo  SAT-Digital iniciado correctamente
echo =========================================
echo.
echo Comandos utiles:
echo   pm2 logs sat-digital-backend  - Ver logs
echo   pm2 monit                     - Monitor en tiempo real
echo   pm2 restart sat-digital-backend - Reiniciar
echo   pm2 stop sat-digital-backend    - Detener
echo.
pause
