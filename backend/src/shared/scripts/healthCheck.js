/**
 * Health Check Script - SAT-Digital
 * Verifica el estado completo del sistema
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const mysql = require('mysql2/promise');

const execAsync = promisify(exec);

class HealthChecker {
  constructor() {
    this.results = {
      overall: 'UNKNOWN',
      checks: {}
    };
  }

  /**
   * Ejecuta todos los checks de salud
   */
  async runAllChecks() {
    console.log('🏥 SAT-Digital Health Check - Iniciando verificación completa...\n');

    try {
      // Checks de sistema
      await this.checkNodeVersion();
      await this.checkNpmVersion();
      await this.checkXamppStatus();
      
      // Checks de base de datos
      await this.checkDatabaseConnection();
      await this.checkDatabaseTables();
      
      // Checks de dependencias
      await this.checkBackendDependencies();
      await this.checkFrontendDependencies();
      
      // Checks de configuración
      await this.checkEnvironmentFiles();
      await this.checkDirectoryStructure();
      
      // Checks de testing
      await this.checkTestFrameworks();
      await this.checkLintingSetup();
      
      // Determinar estado general
      this.determineOverallHealth();
      
      // Mostrar resumen
      this.displaySummary();
      
    } catch (error) {
      console.error('❌ Error ejecutando health check:', error.message);
      this.results.overall = 'CRITICAL';
    }

    return this.results;
  }

  /**
   * Check versión de Node.js
   */
  async checkNodeVersion() {
    try {
      const { stdout } = await execAsync('node --version');
      const version = stdout.trim();
      const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
      
      if (majorVersion >= 18) {
        this.addResult('node_version', 'HEALTHY', `Node.js ${version} ✅`);
      } else {
        this.addResult('node_version', 'WARNING', `Node.js ${version} ⚠️ (Recomendado: v18+)`);
      }
    } catch (error) {
      this.addResult('node_version', 'CRITICAL', 'Node.js no instalado ❌');
    }
  }

  /**
   * Check versión de npm
   */
  async checkNpmVersion() {
    try {
      const { stdout } = await execAsync('npm --version');
      const version = stdout.trim();
      this.addResult('npm_version', 'HEALTHY', `npm ${version} ✅`);
    } catch (error) {
      this.addResult('npm_version', 'CRITICAL', 'npm no disponible ❌');
    }
  }

  /**
   * Check estado de XAMPP
   */
  async checkXamppStatus() {
    try {
      // Verificar si MySQL está corriendo
      const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: ''
      });
      
      await connection.ping();
      await connection.end();
      
      this.addResult('xampp_mysql', 'HEALTHY', 'MySQL (XAMPP) funcionando ✅');
    } catch (error) {
      this.addResult('xampp_mysql', 'CRITICAL', 'MySQL (XAMPP) no disponible ❌');
    }

    // Check básico de Apache (asumiendo puerto 80)
    try {
      const { stdout } = await execAsync('netstat -an | findstr :80', { timeout: 5000 });
      if (stdout.includes(':80')) {
        this.addResult('xampp_apache', 'HEALTHY', 'Apache (XAMPP) funcionando ✅');
      } else {
        this.addResult('xampp_apache', 'WARNING', 'Apache puerto 80 no detectado ⚠️');
      }
    } catch (error) {
      this.addResult('xampp_apache', 'WARNING', 'No se pudo verificar Apache ⚠️');
    }
  }

  /**
   * Check conexión a base de datos
   */
  async checkDatabaseConnection() {
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'sat_digital'
      });

      await connection.execute('SELECT 1');
      await connection.end();
      
      this.addResult('database_connection', 'HEALTHY', 'Conexión a BD sat_digital ✅');
    } catch (error) {
      this.addResult('database_connection', 'CRITICAL', 'No se puede conectar a BD sat_digital ❌');
    }
  }

  /**
   * Check tablas principales de la base de datos
   */
  async checkDatabaseTables() {
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'sat_digital'
      });

      const requiredTables = [
        'usuarios', 'proveedores', 'sitios', 'auditorias', 
        'documentos', 'secciones_tecnicas', 'bitacora'
      ];

      let tablesFound = 0;
      
      for (const table of requiredTables) {
        const [rows] = await connection.execute(
          `SELECT COUNT(*) as count FROM information_schema.tables 
           WHERE table_schema = 'sat_digital' AND table_name = ?`,
          [table]
        );
        
        if (rows[0].count > 0) {
          tablesFound++;
        }
      }

      await connection.end();

      if (tablesFound === requiredTables.length) {
        this.addResult('database_tables', 'HEALTHY', `${tablesFound}/${requiredTables.length} tablas encontradas ✅`);
      } else {
        this.addResult('database_tables', 'WARNING', `${tablesFound}/${requiredTables.length} tablas encontradas ⚠️`);
      }
    } catch (error) {
      this.addResult('database_tables', 'CRITICAL', 'Error verificando tablas ❌');
    }
  }

  /**
   * Check dependencias del backend
   */
  async checkBackendDependencies() {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      const criticalDeps = [
        'express', 'sequelize', 'mysql2', 'bcryptjs', 
        'jsonwebtoken', 'zod', 'winston'
      ];

      let depsFound = 0;
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      for (const dep of criticalDeps) {
        if (allDeps[dep]) {
          depsFound++;
        }
      }

      if (depsFound === criticalDeps.length) {
        this.addResult('backend_dependencies', 'HEALTHY', `${depsFound}/${criticalDeps.length} dependencias críticas ✅`);
      } else {
        this.addResult('backend_dependencies', 'WARNING', `${depsFound}/${criticalDeps.length} dependencias críticas ⚠️`);
      }
    } catch (error) {
      this.addResult('backend_dependencies', 'CRITICAL', 'Error verificando dependencias backend ❌');
    }
  }

  /**
   * Check dependencias del frontend
   */
  async checkFrontendDependencies() {
    try {
      const frontendPackageJsonPath = path.join(process.cwd(), '../frontend/package.json');
      const packageJson = JSON.parse(await fs.readFile(frontendPackageJsonPath, 'utf8'));
      
      const criticalDeps = [
        'react', 'react-dom', 'react-router-dom', '@mui/material', 
        'zustand', 'axios', 'zod', 'dayjs'
      ];

      let depsFound = 0;
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      for (const dep of criticalDeps) {
        if (allDeps[dep]) {
          depsFound++;
        }
      }

      if (depsFound === criticalDeps.length) {
        this.addResult('frontend_dependencies', 'HEALTHY', `${depsFound}/${criticalDeps.length} dependencias críticas ✅`);
      } else {
        this.addResult('frontend_dependencies', 'WARNING', `${depsFound}/${criticalDeps.length} dependencias críticas ⚠️`);
      }
    } catch (error) {
      this.addResult('frontend_dependencies', 'WARNING', 'Error verificando dependencias frontend ⚠️');
    }
  }

  /**
   * Check archivos de entorno
   */
  async checkEnvironmentFiles() {
    const envFiles = [
      { file: '.env', status: 'OPTIONAL' },
      { file: '.env.test', status: 'REQUIRED' }
    ];

    for (const envFile of envFiles) {
      try {
        await fs.access(path.join(process.cwd(), envFile.file));
        this.addResult(`env_${envFile.file.replace('.', '_')}`, 'HEALTHY', `${envFile.file} existe ✅`);
      } catch (error) {
        const status = envFile.status === 'REQUIRED' ? 'WARNING' : 'INFO';
        this.addResult(`env_${envFile.file.replace('.', '_')}`, status, `${envFile.file} no encontrado ${status === 'WARNING' ? '⚠️' : 'ℹ️'}`);
      }
    }
  }

  /**
   * Check estructura de directorios
   */
  async checkDirectoryStructure() {
    const requiredDirs = [
      'src/domains/auth',
      'src/domains/dashboard', 
      'src/shared/database',
      'src/shared/middleware',
      'tests/unit',
      'tests/integration'
    ];

    let dirsFound = 0;

    for (const dir of requiredDirs) {
      try {
        const stats = await fs.stat(path.join(process.cwd(), dir));
        if (stats.isDirectory()) {
          dirsFound++;
        }
      } catch (error) {
        // Directorio no existe
      }
    }

    if (dirsFound === requiredDirs.length) {
      this.addResult('directory_structure', 'HEALTHY', `${dirsFound}/${requiredDirs.length} directorios requeridos ✅`);
    } else {
      this.addResult('directory_structure', 'WARNING', `${dirsFound}/${requiredDirs.length} directorios requeridos ⚠️`);
    }
  }

  /**
   * Check frameworks de testing
   */
  async checkTestFrameworks() {
    // Check Jest (backend)
    try {
      const packageJson = JSON.parse(await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf8'));
      const hasJest = packageJson.devDependencies?.jest || packageJson.dependencies?.jest;
      
      if (hasJest) {
        this.addResult('jest_framework', 'HEALTHY', 'Jest configurado ✅');
      } else {
        this.addResult('jest_framework', 'WARNING', 'Jest no encontrado ⚠️');
      }
    } catch (error) {
      this.addResult('jest_framework', 'WARNING', 'Error verificando Jest ⚠️');
    }

    // Check Vitest (frontend)
    try {
      const frontendPackageJson = JSON.parse(await fs.readFile(path.join(process.cwd(), '../frontend/package.json'), 'utf8'));
      const hasVitest = frontendPackageJson.devDependencies?.vitest || frontendPackageJson.dependencies?.vitest;
      
      if (hasVitest) {
        this.addResult('vitest_framework', 'HEALTHY', 'Vitest configurado ✅');
      } else {
        this.addResult('vitest_framework', 'WARNING', 'Vitest no encontrado ⚠️');
      }
    } catch (error) {
      this.addResult('vitest_framework', 'WARNING', 'Error verificando Vitest ⚠️');
    }
  }

  /**
   * Check configuración de linting
   */
  async checkLintingSetup() {
    // Check ESLint backend
    try {
      await fs.access(path.join(process.cwd(), '.eslintrc.js'));
      this.addResult('eslint_backend', 'HEALTHY', 'ESLint backend configurado ✅');
    } catch (error) {
      this.addResult('eslint_backend', 'WARNING', 'ESLint backend no configurado ⚠️');
    }

    // Check Prettier backend
    try {
      await fs.access(path.join(process.cwd(), '.prettierrc'));
      this.addResult('prettier_backend', 'HEALTHY', 'Prettier backend configurado ✅');
    } catch (error) {
      this.addResult('prettier_backend', 'WARNING', 'Prettier backend no configurado ⚠️');
    }

    // Check ESLint frontend
    try {
      await fs.access(path.join(process.cwd(), '../frontend/.eslintrc.js'));
      this.addResult('eslint_frontend', 'HEALTHY', 'ESLint frontend configurado ✅');
    } catch (error) {
      this.addResult('eslint_frontend', 'WARNING', 'ESLint frontend no configurado ⚠️');
    }
  }

  /**
   * Añadir resultado de check
   */
  addResult(checkName, status, message) {
    this.results.checks[checkName] = { status, message };
    console.log(`${this.getStatusIcon(status)} ${message}`);
  }

  /**
   * Determinar estado general del sistema
   */
  determineOverallHealth() {
    const statuses = Object.values(this.results.checks).map(check => check.status);
    
    if (statuses.includes('CRITICAL')) {
      this.results.overall = 'CRITICAL';
    } else if (statuses.includes('WARNING')) {
      this.results.overall = 'WARNING';
    } else {
      this.results.overall = 'HEALTHY';
    }
  }

  /**
   * Mostrar resumen final
   */
  displaySummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN HEALTH CHECK SAT-DIGITAL');
    console.log('='.repeat(60));
    
    const statusCounts = {
      HEALTHY: 0,
      WARNING: 0,
      CRITICAL: 0,
      INFO: 0
    };

    Object.values(this.results.checks).forEach(check => {
      statusCounts[check.status] = (statusCounts[check.status] || 0) + 1;
    });

    console.log(`✅ Checks Saludables: ${statusCounts.HEALTHY}`);
    console.log(`⚠️  Checks con Advertencias: ${statusCounts.WARNING}`);
    console.log(`❌ Checks Críticos: ${statusCounts.CRITICAL}`);
    console.log(`ℹ️  Checks Informativos: ${statusCounts.INFO}`);

    console.log('\n' + '='.repeat(60));
    console.log(`🏥 ESTADO GENERAL: ${this.getOverallStatusMessage()}`);
    console.log('='.repeat(60));

    if (this.results.overall === 'CRITICAL') {
      console.log('\n🚨 ACCIÓN REQUERIDA: Resolver problemas críticos antes de continuar');
    } else if (this.results.overall === 'WARNING') {
      console.log('\n⚠️ RECOMENDACIÓN: Revisar advertencias para óptimo funcionamiento');
    } else {
      console.log('\n🎉 ¡Sistema en perfecto estado para desarrollo!');
    }
  }

  /**
   * Obtener icono según estado
   */
  getStatusIcon(status) {
    const icons = {
      HEALTHY: '✅',
      WARNING: '⚠️',
      CRITICAL: '❌',
      INFO: 'ℹ️'
    };
    return icons[status] || '❓';
  }

  /**
   * Obtener mensaje de estado general
   */
  getOverallStatusMessage() {
    const messages = {
      HEALTHY: '🟢 SALUDABLE - Sistema operativo',
      WARNING: '🟡 ADVERTENCIAS - Funcionando con problemas menores',
      CRITICAL: '🔴 CRÍTICO - Requiere atención inmediata'
    };
    return messages[this.results.overall] || '❓ DESCONOCIDO';
  }
}

/**
 * Ejecutar health check
 */
async function runHealthCheck() {
  const healthChecker = new HealthChecker();
  const results = await healthChecker.runAllChecks();
  
  // Exit code basado en el estado general
  const exitCodes = {
    HEALTHY: 0,
    WARNING: 1,
    CRITICAL: 2
  };
  
  process.exit(exitCodes[results.overall] || 2);
}

// Ejecutar si el script es llamado directamente
if (require.main === module) {
  runHealthCheck().catch(error => {
    console.error('❌ Error fatal en health check:', error);
    process.exit(2);
  });
}

module.exports = { HealthChecker };
