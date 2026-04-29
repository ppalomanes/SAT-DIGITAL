@echo off
REM ===============================================
REM SAT-Digital - Detener PM2
REM ===============================================

echo.
echo =========================================
echo  SAT-Digital - Detener PM2
echo =========================================
echo.

cd D:\webs\SAT-DIGITAL\backend

REM Verificar si PM2 está instalado
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: PM2 no esta instalado
    pause
    exit /b 1
)

echo Deteniendo SAT-Digital Backend...
pm2 stop sat-digital-backend

echo.
echo Estado de las aplicaciones:
pm2 status

echo.
echo =========================================
echo  SAT-Digital detenido
echo =========================================
echo.
pause
