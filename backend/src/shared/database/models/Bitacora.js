const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const Bitacora = sequelize.define('Bitacora', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  accion: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  entidad_tipo: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  entidad_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  datos_antes: {
    type: DataTypes.JSON,
    allowNull: true
  },
  datos_despues: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'bitacora',
  timestamps: false
});

module.exports = Bitacora;