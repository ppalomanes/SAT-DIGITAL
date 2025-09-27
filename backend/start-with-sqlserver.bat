@echo off
echo =========================================
echo    SAT-Digital Backend - SQL Server
echo =========================================
echo.

echo 🔄 Configurando variables de entorno para SQL Server...
set DB_TYPE=sqlserver
set SQLSERVER_HOST=dwin0293
set SQLSERVER_PORT=1433
set SQLSERVER_DATABASE=sat_digital_v2
set SQLSERVER_USERNAME=calidad
set SQLSERVER_PASSWORD=passcalidad
set SQLSERVER_ENCRYPT=false
set SQLSERVER_TRUST_CERT=true

echo ✅ Variables configuradas:
echo    📡 Servidor: %SQLSERVER_HOST%:%SQLSERVER_PORT%
echo    💾 Base de datos: %SQLSERVER_DATABASE%
echo    👤 Usuario: %SQLSERVER_USERNAME%
echo.

echo 🚀 Iniciando backend con SQL Server...
nodemon src/app.js

echo.
echo Backend detenido.
pause