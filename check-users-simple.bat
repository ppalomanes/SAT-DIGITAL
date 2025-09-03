@echo off
echo ==========================================
echo     SAT-Digital - Diagnostico Simple
echo ==========================================
echo.

cd /d "C:\xampp\htdocs\SAT-Digital\backend"
echo 📍 Directorio: %CD%
echo.

echo 🔍 Consultando usuarios en la base de datos...
node check-users.js

pause
