@echo off
echo 🔄 Cerrando procesos que usan el puerto 3001...

REM Buscar y matar procesos usando el puerto 3001
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001"') do (
    echo 🔌 Cerrando proceso %%a que usa puerto 3001...
    taskkill /f /pid %%a
)

echo ✅ Puerto 3001 liberado
echo 🚀 Ahora puedes ejecutar: npm start
pause
