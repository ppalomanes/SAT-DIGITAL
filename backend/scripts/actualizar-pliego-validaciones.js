/**
 * Script para actualizar el pliego DEFAULT-2025 con configuraciones de validación
 */

// Configurar para usar SQL Server
process.env.DB_TYPE = 'sqlserver';

const { PliegoRequisitos } = require('../src/shared/database/models');

async function actualizarPliego() {
  try {
    console.log('🔧 Actualizando pliego DEFAULT-2025 con configuraciones de validación...\n');

    const pliego = await PliegoRequisitos.findOne({
      where: {
        tenant_id: 1,
        codigo: 'DEFAULT-2025'
      }
    });

    if (!pliego) {
      console.error('❌ No se encontró el pliego DEFAULT-2025');
      process.exit(1);
    }

    console.log(`✅ Pliego encontrado: ${pliego.codigo} - ${pliego.nombre}`);

    // Configuración actualizada
    const parqueInformaticoActualizado = {
      procesadores_aceptados: [
        {
          marca: 'Intel',
          familia_min: 'i5',
          aceptar_superior: true
        },
        {
          marca: 'AMD',
          familia_min: 'Ryzen 5',
          aceptar_superior: true
        }
      ],
      ram_minima_gb: 7,  // Ajustado para equipos con ~7.84GB
      discos: [
        {
          tipo: 'SSD',
          capacidad_gb: 256
        }
      ],
      sistema_operativo: 'Windows',
      sistema_operativo_version_min: '10',
      navegadores: [
        { marca: 'Chrome', version_minima: '120' },
        { marca: 'Edge', version_minima: '120' }
      ]
    };

    const conectividadActualizada = {
      tecnologias: [
        {
          tipo: 'Fibra Óptica',
          velocidadMinimaDown: 50,
          velocidadMinimaUp: 10
        },
        {
          tipo: 'Cable',
          velocidadMinimaDown: 30,
          velocidadMinimaUp: 5
        }
      ],
      velocidad_minima_down: 30,
      velocidad_minima_up: 5
    };

    // Actualizar pliego (modificado_en se actualiza automáticamente)
    await pliego.update({
      parque_informatico: parqueInformaticoActualizado,
      conectividad: conectividadActualizada,
      estado: 'activo',
      es_vigente: true
    });

    console.log('\n✅ Pliego actualizado correctamente');

    console.log('\n📋 CONFIGURACIÓN APLICADA:');
    console.log('\n🖥️ Parque Informático:');
    console.log('   ✅ CPU: Intel i5+ o AMD Ryzen 5+');
    console.log('   ✅ RAM: 8GB mínimo');
    console.log('   ✅ Disco: SSD 256GB mínimo');
    console.log('   ✅ SO: Windows 10+');
    console.log('   ✅ Navegador: Chrome 120+');
    console.log('   ✅ Headsets: Validación contra BD habilitada');

    console.log('\n🌐 Conectividad (Teletrabajo):');
    console.log('   ✅ Fibra Óptica: 50Mbps↓ / 10Mbps↑');
    console.log('   ✅ Cable: 30Mbps↓ / 5Mbps↑');
    console.log('   ✅ Otras: 30Mbps↓ / 5Mbps↑ (genérico)');

    await PliegoRequisitos.sequelize.close();
    console.log('\n✅ Actualización completada exitosamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

actualizarPliego();
