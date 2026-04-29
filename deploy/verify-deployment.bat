@echo off
REM ===============================================
REM SAT-Digital - Verificación de Despliegue
REM ===============================================
REM Este script verifica que todo esté correctamente configurado
REM ===============================================

echo.
echo =========================================
echo  SAT-Digital - Verificacion de Despliegue
echo =========================================
echo.

set ERROR_COUNT=0
set WARNING_COUNT=0

REM ==========================================
REM 1. VERIFICAR NODE.JS
REM ==========================================
echo [1/12] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no esta instalado
    set /a ERROR_COUNT+=1
) else (
    node --version
    echo [OK] Node.js detectado
)
echo.

REM ==========================================
REM 2. VERIFICAR NPM
REM ==========================================
echo [2/12] Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm no esta instalado
    set /a ERROR_COUNT+=1
) else (
    npm --version
    echo [OK] npm detectado
)
echo.

REM ==========================================
REM 3. VERIFICAR CARPETA BACKEND
REM ==========================================
echo [3/12] Verificando carpeta backend...
if exist D:\webs\SAT-DIGITAL\backend (
    echo [OK] Carpeta backend encontrada
    cd D:\webs\SAT-DIGITAL\backend
) else (
    echo [ERROR] No se encuentra D:\webs\SAT-DIGITAL\backend
    set /a ERROR_COUNT+=1
    goto :end
)
echo.

REM ==========================================
REM 4. VERIFICAR ARCHIVO .ENV BACKEND
REM ==========================================
echo [4/12] Verificando .env del backend...
if exist .env (
    echo [OK] Archivo .env encontrado
    findstr /C:"DB_TYPE=sqlserver" .env >nul
    if errorlevel 1 (
        echo [WARNING] DB_TYPE no esta configurado como sqlserver
        set /a WARNING_COUNT+=1
    ) else (
        echo [OK] DB_TYPE configurado como sqlserver
    )
) else (
    echo [ERROR] Archivo .env no encontrado
    set /a ERROR_COUNT+=1
)
echo.

REM ==========================================
REM 5. VERIFICAR NODE_MODULES BACKEND
REM ==========================================
echo [5/12] Verificando node_modules del backend...
if exist node_modules (
    echo [OK] node_modules encontrado
) else (
    echo [ERROR] node_modules no encontrado - Ejecutar: npm install
    set /a ERROR_COUNT+=1
)
echo.

REM ==========================================
REM 6. VERIFICAR CARPETA FRONTEND
REM ==========================================
echo [6/12] Verificando carpeta frontend...
cd D:\webs\SAT-DIGITAL\frontend
if exist D:\webs\SAT-DIGITAL\frontend (
    echo [OK] Carpeta frontend encontrada
) else (
    echo [ERROR] No se encuentra D:\webs\SAT-DIGITAL\frontend
    set /a ERROR_COUNT+=1
    goto :end
)
echo.

REM ==========================================
REM 7. VERIFICAR ARCHIVO .ENV FRONTEND
REM ==========================================
echo [7/12] Verificando .env del frontend...
if exist .env (
    echo [OK] Archivo .env encontrado
) else (
    echo [WARNING] Archivo .env no encontrado
    set /a WARNING_COUNT+=1
)
echo.

REM ==========================================
REM 8. VERIFICAR BUILD DEL FRONTEND
REM ==========================================
echo [8/12] Verificando build del frontend...
if exist dist (
    echo [OK] Carpeta dist encontrada
    if exist dist\index.html (
        echo [OK] index.html encontrado en dist
    ) else (
        echo [ERROR] index.html no encontrado en dist - Ejecutar: npm run build
        set /a ERROR_COUNT+=1
    )
    if exist dist\web.config (
        echo [OK] web.config encontrado en dist
    ) else (
        echo [WARNING] web.config no encontrado en dist
        set /a WARNING_COUNT+=1
    )
) else (
    echo [ERROR] Carpeta dist no encontrada - Ejecutar: npm run build
    set /a ERROR_COUNT+=1
)
echo.

REM ==========================================
REM 9. VERIFICAR CONECTIVIDAD AL SERVIDOR BD
REM ==========================================
echo [9/12] Verificando conectividad al servidor BD (10.11.33.10)...
ping -n 1 10.11.33.10 >nul 2>&1
if errorlevel 1 (
    echo [ERROR] No se puede hacer ping a 10.11.33.10
    set /a ERROR_COUNT+=1
) else (
    echo [OK] Ping exitoso a 10.11.33.10
)
echo.

REM ==========================================
REM 10. VERIFICAR PM2 (si está instalado)
REM ==========================================
echo [10/12] Verificando PM2...
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] PM2 no esta instalado (opcional)
) else (
    pm2 --version
    echo [OK] PM2 detectado
    pm2 list
)
echo.

REM ==========================================
REM 11. VERIFICAR IIS (si está disponible)
REM ==========================================
echo [11/12] Verificando IIS...
sc query W3SVC >nul 2>&1
if errorlevel 1 (
    echo [INFO] IIS no esta instalado o no esta corriendo
) else (
    echo [OK] IIS detectado
    sc query W3SVC | findstr "RUNNING" >nul
    if errorlevel 1 (
        echo [WARNING] IIS no esta corriendo
        set /a WARNING_COUNT+=1
    ) else (
        echo [OK] IIS esta corriendo
    )
)
echo.

REM ==========================================
REM 12. VERIFICAR BACKEND HEALTH CHECK
REM ==========================================
echo [12/12] Verificando health check del backend...
echo Intentando conectar a http://localhost:3001/health...

REM Usar curl si está disponible
curl --version >nul 2>&1
if not errorlevel 1 (
    curl -s http://localhost:3001/health
    if not errorlevel 1 (
        echo.
        echo [OK] Backend responde correctamente
    ) else (
        echo [ERROR] Backend no responde en http://localhost:3001/health
        echo Verificar que el backend este corriendo
        set /a ERROR_COUNT+=1
    )
) else (
    echo [INFO] curl no disponible - No se puede verificar health check
    echo Verificar manualmente en: http://10.75.247.181:3001/health
)
echo.

REM ==========================================
REM RESUMEN
REM ==========================================
:end
echo.
echo =========================================
echo  RESUMEN DE VERIFICACION
echo =========================================
echo.

if %ERROR_COUNT% EQU 0 (
    if %WARNING_COUNT% EQU 0 (
        echo [OK] Verificacion completada SIN ERRORES ni ADVERTENCIAS
        echo El sistema esta listo para produccion
    ) else (
        echo [WARNING] Verificacion completada con %WARNING_COUNT% ADVERTENCIAS
        echo Revisar las advertencias antes de pasar a produccion
    )
) else (
    echo [ERROR] Verificacion completada con %ERROR_COUNT% ERRORES y %WARNING_COUNT% ADVERTENCIAS
    echo Debe corregir los errores antes de pasar a produccion
)

echo.
echo Errores encontrados: %ERROR_COUNT%
echo Advertencias: %WARNING_COUNT%
echo.

REM ==========================================
REM VERIFICACIONES ADICIONALES RECOMENDADAS
REM ==========================================
echo =========================================
echo  VERIFICACIONES ADICIONALES MANUALES
echo =========================================
echo.
echo 1. Conectividad a SQL Server:
echo    sqlcmd -S 10.11.33.10 -U calidad -P passcalidad -d sat_digital_v2 -Q "SELECT @@VERSION"
echo.
echo 2. Backend Health Check:
echo    http://10.75.247.181:3001/health
echo.
echo 3. Frontend:
echo    http://10.75.247.181
echo.
echo 4. Login con usuario de prueba:
echo    Usuario: admin@satdigital.com
echo    Password: admin123
echo.
echo 5. Verificar logs del backend:
echo    type D:\webs\SAT-DIGITAL\backend\logs\app.log
echo.
echo 6. Si usa PM2, verificar estado:
echo    pm2 status
echo    pm2 logs sat-digital-backend
echo.
echo 7. Si usa IIS, verificar sitios:
echo    Abrir IIS Manager y verificar que los sitios esten iniciados
echo.

pause
