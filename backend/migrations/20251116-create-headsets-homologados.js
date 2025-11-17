'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('headsets_homologados', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Multi-tenancy support'
      },
      marca: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Marca del headset (ej: Jabra, Plantronics, Logitech)'
      },
      modelo: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Modelo del headset'
      },
      conector: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Tipo de conector (USB, Plug, QD, RJ9, Wireless, etc.)'
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: 'Indica si el headset está activo en la homologación'
      },
      observaciones: {
        type: Sequelize.TEXT,
        comment: 'Observaciones adicionales sobre el headset'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Índices para búsquedas rápidas
    await queryInterface.addIndex('headsets_homologados', ['tenant_id']);
    await queryInterface.addIndex('headsets_homologados', ['marca']);
    await queryInterface.addIndex('headsets_homologados', ['activo']);
    await queryInterface.addIndex('headsets_homologados', ['marca', 'modelo'], {
      name: 'idx_headset_marca_modelo'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('headsets_homologados');
  }
};
