@echo off
echo ==========================================
echo     SAT-Digital - Actualizar Usuarios
echo ==========================================
echo.

echo Navegando al directorio backend...
cd /d "C:\xampp\htdocs\SAT-Digital\backend"

echo.
echo Ejecutando seeders actualizados...
echo (Esto creará los usuarios correctos para el login)
echo.

node src/shared/database/seeders.js

echo.
echo Usuarios creados/actualizados:
echo - admin@satdigital.com / admin123 (Administrador)
echo - auditor@satdigital.com / auditor123 (Auditor General)
echo - proveedor@activo.com / proveedor123 (Jefe Proveedor)
echo.

pause
