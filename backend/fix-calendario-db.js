/**
 * Script para crear/verificar tablas del módulo calendario
 * Ejecutar con: node fix-calendario-db.js
 */

require('dotenv').config();
const { sequelize } = require('./src/shared/database/connection');
const { PeriodoAuditoria, AsignacionAuditor } = require('./src/shared/database/models');

async function fixCalendarioDB() {
  try {
    console.log('🔄 Conectando a base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    console.log('🔄 Sincronizando modelos de calendario...');
    
    // Forzar creación de tablas del calendario
    await sequelize.sync({ 
      force: false, // No eliminar tablas existentes
      alter: true   // Modificar estructura si es necesario
    });
    
    console.log('✅ Tablas de calendario sincronizadas');
    
    // Verificar tablas
    const [periodos] = await sequelize.query("SHOW TABLES LIKE 'periodos_auditoria'");
    const [asignaciones] = await sequelize.query("SHOW TABLES LIKE 'asignaciones_auditor'");
    
    console.log('📊 Estado de tablas:');
    console.log(`- periodos_auditoria: ${periodos.length > 0 ? '✅ Existe' : '❌ No existe'}`);
    console.log(`- asignaciones_auditor: ${asignaciones.length > 0 ? '✅ Existe' : '❌ No existe'}`);
    
    // Crear datos de prueba si no existen
    const periodosCount = await PeriodoAuditoria.count();
    if (periodosCount === 0) {
      console.log('📝 Creando período de prueba...');
      await PeriodoAuditoria.create({
        nombre: 'Noviembre 2025',
        codigo: '2025-11',
        fecha_inicio: '2025-11-01',
        fecha_limite_carga: '2025-11-15',
        fecha_inicio_visitas: '2025-11-18',
        fecha_fin_visitas: '2025-11-30',
        estado: 'planificacion',
        created_by: 1 // Asumiendo que existe usuario ID 1
      });
      console.log('✅ Período de prueba creado');
    }
    
    await sequelize.close();
    console.log('✅ Script completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixCalendarioDB();
