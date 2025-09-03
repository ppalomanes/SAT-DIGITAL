'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('asignaciones_auditor', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      auditoria_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'auditorias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      auditor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE'
      },
      fecha_asignacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      fecha_visita_programada: {
        type: Sequelize.DATE,
        comment: 'Fecha programada para visita presencial'
      },
      prioridad: {
        type: Sequelize.ENUM('baja', 'normal', 'alta'),
        defaultValue: 'normal',
        allowNull: false
      },
      observaciones: {
        type: Sequelize.TEXT,
        comment: 'Notas sobre la asignación o visita'
      },
      estado_asignacion: {
        type: Sequelize.ENUM('asignado', 'confirmado', 'reagendado', 'completado'),
        defaultValue: 'asignado',
        allowNull: false
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

    await queryInterface.addIndex('asignaciones_auditor', ['auditoria_id', 'auditor_id'], {
      unique: true,
      name: 'unique_asignacion'
    });
    await queryInterface.addIndex('asignaciones_auditor', ['auditor_id']);
    await queryInterface.addIndex('asignaciones_auditor', ['fecha_visita_programada']);
    await queryInterface.addIndex('asignaciones_auditor', ['estado_asignacion']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('asignaciones_auditor');
  }
};
