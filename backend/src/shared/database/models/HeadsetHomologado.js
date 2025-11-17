const { DataTypes } = require('sequelize');

/**
 * Modelo HeadsetHomologado
 *
 * Define el catálogo de headsets homologados que cumplen con los requisitos
 * técnicos de la organización. Se utiliza para validar que los equipos
 * reportados por los proveedores estén dentro de los modelos aprobados.
 */

const HeadsetHomologado = (sequelize) => {
  return sequelize.define('HeadsetHomologado', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'ID del tenant (organización)'
    },

    marca: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Marca del headset (ej: Jabra, Plantronics, Logitech)'
    },

    modelo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Modelo específico del headset'
    },

    conector: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Tipo de conector (USB, Plug, QD, RJ9, Wireless, Base Inalámbrica, etc.)'
    },

    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica si el headset está activo en la homologación'
    },

    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones adicionales sobre el headset'
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    }
  }, {
    tableName: 'headsets_homologados',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['tenant_id'] },
      { fields: ['marca'] },
      { fields: ['activo'] },
      {
        fields: ['marca', 'modelo'],
        name: 'idx_headset_marca_modelo'
      }
    ]
  });
};

module.exports = HeadsetHomologado;
