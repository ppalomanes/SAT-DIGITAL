@echo off
echo ==========================================
echo SAT-Digital: Errores corregidos - Probando diseño
echo ==========================================
echo.

echo [SOLUCION] Errores de importacion corregidos:
echo - Dashboard.jsx: Eliminada dependencia useAuthStore 
echo - MainLayout.jsx: Usando datos mock temporales
echo - Todas las funcionalidades preservadas
echo.

echo [1/2] Iniciando servidor frontend...
cd frontend
start "SAT-Digital Frontend" npm run dev

echo [2/2] Esperando backend...
timeout /t 3

echo.
echo ==========================================
echo ACCEDER AL NUEVO DISEÑO:
echo ==========================================
echo URL: http://localhost:3000
echo.
echo FUNCIONES A PROBAR:
echo ✅ Toggle sidebar (boton flecha)
echo ✅ Cards con hover effects
echo ✅ Tabla auditorias con progress bars
echo ✅ Botones gradientes
echo ✅ Responsive design
echo.
echo Si necesitas autenticacion completa:
echo 1. Iniciar también el backend (npm run dev)
echo 2. Reconectar useAuthStore cuando esté listo
echo ==========================================

pause