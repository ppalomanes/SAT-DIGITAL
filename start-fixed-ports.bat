@echo off
echo ==========================================
echo SAT-Digital: PUERTOS CORREGIDOS
echo ==========================================
echo.

echo CONFIGURACION ACTUALIZADA:
echo - Frontend: http://localhost:3000 (Vite configurado)
echo - Backend:  http://localhost:3001 (Express)
echo - CORS habilitado para ambos puertos
echo.

echo [1/3] Reiniciando backend con CORS actualizado...
cd backend
taskkill /f /im node.exe > nul 2>&1
timeout /t 2
start "SAT-Digital Backend" npm run dev

echo [2/3] Reiniciando frontend en puerto 3000...
cd ../frontend
timeout /t 3
start "SAT-Digital Frontend" npm run dev

echo [3/3] Esperando que servicios inicien...
timeout /t 5

echo.
echo ==========================================
echo SISTEMA LISTO - PUERTOS CORREGIDOS
echo ==========================================
echo Login: http://localhost:3000/login
echo Dashboard: http://localhost:3000/dashboard
echo API: http://localhost:3001/api
echo Health: http://localhost:3001/health
echo.
echo CREDENCIALES DE PRUEBA:
echo admin@satdigital.com / admin123
echo auditor@satdigital.com / auditor123
echo proveedor@activo.com / proveedor123
echo ==========================================

pause