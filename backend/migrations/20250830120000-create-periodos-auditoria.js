'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('periodos_auditoria', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'ej: "Mayo 2025", "Noviembre 2025"'
      },
      codigo: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'ej: "2025-05", "2025-11"'
      },
      fecha_inicio: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Inicio del período de auditoría'
      },
      fecha_limite_carga: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha límite para carga de documentos'
      },
      fecha_inicio_visitas: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Inicio del período de visitas presenciales'
      },
      fecha_fin_visitas: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fin del período de visitas presenciales'
      },
      estado: {
        type: Sequelize.ENUM('planificacion', 'activo', 'carga', 'visitas', 'cerrado'),
        defaultValue: 'planificacion',
        allowNull: false
      },
      configuracion_especial: {
        type: Sequelize.JSON,
        comment: 'Excepciones, días no laborables, configuraciones específicas'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        }
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('periodos_auditoria', ['codigo']);
    await queryInterface.addIndex('periodos_auditoria', ['estado']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('periodos_auditoria');
  }
};
