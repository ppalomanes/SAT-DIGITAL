@echo off
echo ========================================
echo  SAT-Digital - Servidor de Desarrollo
echo  DWIN0540 - 10.75.247.181
echo ========================================
echo.

echo [1/3] Verificando MySQL...
echo Asegurese de que MySQL este corriendo en XAMPP
timeout /t 3 /nobreak > nul

echo.
echo [2/3] Iniciando Backend (Puerto 3001)...
start "SAT-Digital Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo Esperando 5 segundos para que el backend inicie...
timeout /t 5 /nobreak > nul

echo.
echo [3/3] Iniciando Frontend (Puerto 5173)...
start "SAT-Digital Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo Sistema iniciado correctamente
echo.
echo URLs de acceso:
echo   Backend API:  http://10.75.247.181:3001/api
echo   Frontend:     http://10.75.247.181:5173
echo   Health Check: http://10.75.247.181:3001/health
echo.
echo Rama activa: dev
echo ========================================
echo.
echo Presione cualquier tecla para cerrar esta ventana...
pause > nul
