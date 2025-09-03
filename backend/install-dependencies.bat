@echo off
echo =====================================================
echo SAT-Digital Backend - Instalacion de Dependencias
echo Checkpoint 2.4: Sistema de Notificaciones y Alertas
echo =====================================================

echo.
echo [1/4] Instalando dependencias faltantes...
call npm install handlebars cron redis ioredis

echo.
echo [2/4] Verificando instalacion de socket.io...
call npm install socket.io

echo.
echo [3/4] Instalando todas las dependencias del proyecto...
call npm install

echo.
echo [4/4] Verificando dependencias criticas...
node -e "
const deps = ['socket.io', 'handlebars', 'cron', 'nodemailer', 'bull', 'mysql2', 'express', 'jsonwebtoken'];
deps.forEach(dep => {
  try {
    require.resolve(dep);
    console.log('✅', dep, '- OK');
  } catch (e) {
    console.log('❌', dep, '- FALTA');
  }
});
"

echo.
echo =====================================================
echo ✅ Instalacion completada!
echo.
echo Para iniciar el backend:
echo   npm run dev
echo.
echo Configurar archivo .env con datos SMTP reales:
echo   cp .env.example .env
echo   # Editar .env con configuracion de email
echo =====================================================
pause
