@echo off
echo ==========================================
echo     SAT-Digital - Sistema Completo
echo ==========================================
echo.

echo Verificando prerrequisitos...

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado
    pause
    exit /b 1
)

REM Verificar XAMPP/MySQL
echo Verificando MySQL en XAMPP...

echo.
echo Iniciando Backend y Frontend...
echo.
echo INSTRUCCIONES:
echo 1. Backend estará en: http://localhost:3001
echo 2. Frontend estará en: http://localhost:3000  
echo 3. Usuarios de prueba:
echo    - admin@satdigital.com / admin123 (Administrador)
echo    - auditor@satdigital.com / auditor123 (Auditor)
echo    - proveedor@activo.com / proveedor123 (Proveedor)
echo.

REM Iniciar backend en nueva ventana
start "SAT-Digital Backend" cmd /k "cd /d C:\xampp\htdocs\SAT-Digital\backend && npm start"

REM Esperar un poco para que el backend arranque
timeout /t 5 /nobreak >nul

REM Iniciar frontend en nueva ventana
start "SAT-Digital Frontend" cmd /k "cd /d C:\xampp\htdocs\SAT-Digital\frontend && npm run dev"

echo.
echo Sistema iniciado! 
echo - Backend: Ventana "SAT-Digital Backend"
echo - Frontend: Ventana "SAT-Digital Frontend"
echo.
pause
