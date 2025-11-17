/**
 * Migración: Tabla de configuraciones de validación
 * Almacena umbrales y requisitos mínimos configurados por administradores
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('configuraciones_validacion', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      // Alcance de la configuración
      auditoria_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // NULL = configuración global/default
        references: {
          model: 'auditorias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      tipo_seccion: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'parque_informatico',
        comment: 'Tipo de sección: parque_informatico, conectividad, etc.'
      },

      // Configuración en formato JSON
      requisitos_minimos: {
        type: Sequelize.TEXT('long'), // Para SQL Server: NVARCHAR(MAX)
        allowNull: false,
        comment: 'JSON con todos los requisitos mínimos configurados'
      },

      // Metadatos
      nombre_configuracion: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Nombre descriptivo de la configuración'
      },

      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción de los cambios o propósito'
      },

      // Control de bloqueo
      bloqueado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si está bloqueada, solo admin puede modificar'
      },

      // Archivo de headsets asociado
      archivo_headsets_path: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Ruta al archivo Excel de headsets homologados'
      },

      archivo_headsets_nombre: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Nombre original del archivo de headsets'
      },

      total_headsets: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Cantidad de headsets en el archivo'
      },

      // Auditoría
      creado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      creado_en: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      modificado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      modificado_en: {
        type: Sequelize.DATE,
        allowNull: true
      },

      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    }, {
      tableName: 'configuraciones_validacion',
      timestamps: false,
      indexes: [
        {
          name: 'idx_configuraciones_auditoria',
          fields: ['auditoria_id']
        },
        {
          name: 'idx_configuraciones_tipo',
          fields: ['tipo_seccion']
        },
        {
          name: 'idx_configuraciones_activo',
          fields: ['activo']
        }
      ]
    });

    // Crear tabla de historial de cambios
    await queryInterface.createTable('configuraciones_historial', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      configuracion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'configuraciones_validacion',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Número de versión incremental'
      },

      // Snapshot de la configuración en este momento
      requisitos_minimos_snapshot: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
        comment: 'JSON con el estado de los requisitos en esta versión'
      },

      // Cambios realizados
      cambios_descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción de los cambios realizados'
      },

      cambios_diff: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'JSON con diff de cambios (antes/después)'
      },

      // Usuario que hizo el cambio
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      tableName: 'configuraciones_historial',
      timestamps: false,
      indexes: [
        {
          name: 'idx_historial_configuracion',
          fields: ['configuracion_id']
        },
        {
          name: 'idx_historial_version',
          fields: ['configuracion_id', 'version']
        }
      ]
    });

    console.log('✅ Tablas configuraciones_validacion y configuraciones_historial creadas');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('configuraciones_historial');
    await queryInterface.dropTable('configuraciones_validacion');
    console.log('✅ Tablas configuraciones_validacion y configuraciones_historial eliminadas');
  }
};
