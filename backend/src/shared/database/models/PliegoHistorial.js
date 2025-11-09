const { DataTypes } = require('sequelize');

/**
 * Modelo PliegoHistorial
 *
 * Mantiene un registro completo de todas las modificaciones realizadas
 * a los pliegos de requisitos, con snapshots completos en cada versión.
 *
 * Permite:
 * - Auditar quién cambió qué y cuándo
 * - Comparar versiones para entender la evolución
 * - Restaurar versiones anteriores si es necesario
 */

const PliegoHistorial = (sequelize) => {
  return sequelize.define('PliegoHistorial', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    pliego_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID del pliego al que pertenece este registro'
    },

    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Número de versión (incremental)'
    },

    pliego_snapshot: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('pliego_snapshot');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('pliego_snapshot', JSON.stringify(value));
      },
      comment: 'Snapshot completo del pliego en esta versión'
    },

    cambios_descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción de los cambios realizados'
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
      },
      comment: 'Diferencias específicas respecto a la versión anterior'
    },

    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID del usuario que realizó el cambio'
    },

    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Fecha y hora del cambio'
    }
  }, {
    tableName: 'pliegos_historial',
    timestamps: false,
    indexes: [
      { fields: ['pliego_id'] },
      { fields: ['pliego_id', 'version'] }
    ]
  });
};

module.exports = PliegoHistorial;
