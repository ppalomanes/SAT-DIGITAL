@echo off
echo Iniciando SAT-Digital Backend...
cd /d "C:\xampp\htdocs\SAT-Digital\backend"
echo Directorio actual: %CD%
echo.

REM Verificar que Node.js esté disponible
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado o no está en el PATH
    pause
    exit /b 1
)

REM Verificar que las dependencias estén instaladas
if not exist "node_modules" (
    echo Las dependencias no están instaladas. Ejecutando npm install...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Verificar que MySQL esté funcionando
echo Verificando conexión a MySQL...

REM Iniciar el servidor
echo Iniciando servidor en puerto 3001...
npm start

pause
