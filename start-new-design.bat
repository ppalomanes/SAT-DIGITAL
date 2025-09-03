@echo off
echo ==========================================
echo SAT-Digital: Iniciando con nuevo diseno
echo ==========================================
echo.

echo [1/3] Verificando frontend...
cd frontend
if not exist node_modules (
    echo Instalando dependencias de frontend...
    npm install
)

echo [2/3] Iniciando servidor frontend...
start "SAT-Digital Frontend" npm run dev

echo [3/3] Iniciando servidor backend...
cd ../backend
start "SAT-Digital Backend" npm run dev

echo.
echo ==========================================
echo Sistema iniciado con exito!
echo ==========================================
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001  
echo Health:   http://localhost:3001/health
echo.
echo NUEVO DISENO IMPLEMENTADO:
echo - Sidebar colapsable estilo moderno
echo - Colores personalizados (#667eea, #764ba2)
echo - Fuente Inter integrada
echo - Dashboard mejorado con estadisticas
echo - Responsive para movil
echo ==========================================

pause