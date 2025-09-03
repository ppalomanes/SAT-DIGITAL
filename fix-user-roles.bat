@echo off
echo ==========================================
echo     SAT-Digital - Corregir Roles
echo ==========================================
echo.

cd /d "C:\xampp\htdocs\SAT-Digital\backend"
echo 📍 Directorio: %CD%
echo.

echo 🔧 Corrigiendo roles de usuarios...
node fix-user-roles.js

pause
