const { DataTypes } = require('sequelize');

const ConfiguracionHistorial = (sequelize) => {
  return sequelize.define('ConfiguracionHistorial', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    configuracion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID de la configuración padre'
    },

    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Número de versión incremental'
    },

    requisitos_minimos_snapshot: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('requisitos_minimos_snapshot');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('requisitos_minimos_snapshot', JSON.stringify(value));
      },
      comment: 'Snapshot de requisitos en esta versión'
    },

    cambios_descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    cambios_diff: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('cambios_diff');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('cambios_diff', value ? JSON.stringify(value) : null);
      }
    },

    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'configuraciones_historial',
    timestamps: false,
    indexes: [
      { fields: ['configuracion_id'] },
      { fields: ['configuracion_id', 'version'] }
    ]
  });
};

module.exports = ConfiguracionHistorial;
