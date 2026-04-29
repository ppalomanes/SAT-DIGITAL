/**
 * ===============================================
 * SAT-Digital PM2 Configuration
 * ===============================================
 * Alternativa a iisnode para ejecutar aplicaciones Node.js
 * en Windows Server con mejor control y monitoreo
 *
 * Servidor: DWIN0540
 * Ubicación: D:\webs\SAT-DIGITAL
 *
 * USO:
 * 1. Instalar PM2 globalmente: npm install -g pm2
 * 2. Instalar pm2-windows-service: npm install -g pm2-windows-service
 * 3. Configurar servicio Windows: pm2-service-install
 * 4. Iniciar aplicación: pm2 start ecosystem.config.js
 * 5. Guardar configuración: pm2 save
 * 6. Ver logs: pm2 logs sat-digital-backend
 * 7. Monitorear: pm2 monit
 * ===============================================
 */

module.exports = {
  apps: [
    {
      // ==========================================
      // BACKEND - Node.js + Express + Socket.IO
      // ==========================================
      name: 'sat-digital-backend',
      script: 'D:\\webs\\SAT-DIGITAL\\backend\\src\\app.js',
      cwd: 'D:\\webs\\SAT-DIGITAL\\backend',

      // Modo de ejecución
      instances: 1,  // Usar 'max' para cluster mode en producción
      exec_mode: 'fork',  // Cambiar a 'cluster' si instances > 1

      // Configuración de ambiente
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0'
      },

      // Archivos .env
      env_file: 'D:\\webs\\SAT-DIGITAL\\backend\\.env',

      // Auto-restart
      autorestart: true,
      watch: false,  // Cambiar a true solo en desarrollo
      max_memory_restart: '1G',

      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: 'D:\\webs\\SAT-DIGITAL\\backend\\logs\\pm2-error.log',
      out_file: 'D:\\webs\\SAT-DIGITAL\\backend\\logs\\pm2-out.log',
      log_file: 'D:\\webs\\SAT-DIGITAL\\backend\\logs\\pm2-combined.log',

      // Merge logs
      combine_logs: true,
      merge_logs: true,

      // Tiempo de espera para shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Control de reinicio
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,

      // Interpreter
      interpreter: 'node',
      interpreter_args: '--max-old-space-size=2048',

      // Windows specific
      windowsHide: true,

      // Cron restart (opcional - reiniciar diariamente a las 3am)
      cron_restart: '0 3 * * *',

      // Source maps support
      source_map_support: true,

      // Instance variables
      instance_var: 'INSTANCE_ID',

      // Post deploy hooks (opcional)
      post_update: ['npm install', 'echo Deployment complete']
    }
  ],

  /**
   * ==========================================
   * DEPLOYMENT CONFIGURATION (Opcional)
   * ==========================================
   * Para deploy automático desde repositorio Git
   */
  deploy: {
    production: {
      user: 'u543524',  // Usuario Windows del servidor
      host: '10.75.247.181',  // IP DWIN0540
      ref: 'origin/main',
      repo: 'git@github.com:sat-digital/backend.git',  // Cambiar por repo real
      path: 'D:\\webs\\SAT-DIGITAL\\backend',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': 'echo Deploying to production...',
      'post-setup': 'npm install'
    }
  }
};

/**
 * ==========================================
 * COMANDOS ÚTILES PM2
 * ==========================================
 *
 * INICIAR APLICACIÓN:
 * pm2 start ecosystem.config.js
 * pm2 start ecosystem.config.js --env production
 *
 * GESTIÓN:
 * pm2 list                    # Listar aplicaciones
 * pm2 stop sat-digital-backend    # Detener
 * pm2 restart sat-digital-backend # Reiniciar
 * pm2 reload sat-digital-backend  # Reload sin downtime
 * pm2 delete sat-digital-backend  # Eliminar
 *
 * LOGS:
 * pm2 logs                    # Ver todos los logs
 * pm2 logs sat-digital-backend    # Logs de app específica
 * pm2 logs --lines 100        # Ver últimas 100 líneas
 * pm2 flush                   # Limpiar logs
 *
 * MONITOREO:
 * pm2 monit                   # Monitor en tiempo real
 * pm2 show sat-digital-backend    # Detalles de la app
 * pm2 status                  # Estado de todas las apps
 *
 * PERSISTENCIA:
 * pm2 save                    # Guardar configuración
 * pm2 resurrect               # Restaurar apps guardadas
 * pm2 unstartup               # Desactivar inicio automático
 *
 * ACTUALIZAR PM2:
 * pm2 update                  # Actualizar PM2 en memoria
 *
 * CLUSTER MODE (para múltiples instancias):
 * 1. Cambiar instances: 'max' o número específico
 * 2. Cambiar exec_mode: 'cluster'
 * 3. pm2 reload sat-digital-backend
 *
 * SERVICIO WINDOWS:
 * pm2-service-install         # Instalar servicio Windows
 * pm2-service-uninstall       # Desinstalar servicio
 *
 * ==========================================
 */
