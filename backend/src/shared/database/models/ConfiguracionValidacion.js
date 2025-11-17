const { DataTypes } = require('sequelize');
const { getSequelize } = require('../connection');

const ConfiguracionValidacion = (sequelize) => {
  return sequelize.define('ConfiguracionValidacion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    auditoria_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID de auditoría (NULL = configuración global)'
    },

    tipo_seccion: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'parque_informatico',
      comment: 'Tipo de sección técnica'
    },

    requisitos_minimos: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('requisitos_minimos');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('requisitos_minimos', JSON.stringify(value));
      },
      comment: 'JSON con configuración de requisitos mínimos'
    },

    nombre_configuracion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    bloqueado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Si está bloqueado, solo admin puede modificar'
    },

    archivo_headsets_path: {
      type: DataTypes.STRING(500),
      allowNull: true
    },

    archivo_headsets_nombre: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    total_headsets: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },

    creado_por: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    creado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },

    modificado_por: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    modificado_en: {
      type: DataTypes.DATE,
      allowNull: true
    },

    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'configuraciones_validacion',
    timestamps: false,
    indexes: [
      { fields: ['auditoria_id'] },
      { fields: ['tipo_seccion'] },
      { fields: ['activo'] }
    ]
  });
};

module.exports = ConfiguracionValidacion;
