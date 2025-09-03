const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const AsignacionAuditor = sequelize.define('AsignacionAuditor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  auditoria_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'auditorias',
      key: 'id'
    }
  },
  auditor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  fecha_asignacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_visita_programada: {
    type: DataTypes.DATE,
    allowNull: true
  },
  prioridad: {
    type: DataTypes.ENUM('baja', 'normal', 'alta'),
    defaultValue: 'normal'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado_asignacion: {
    type: DataTypes.ENUM('asignado', 'confirmado', 'reagendado', 'completado'),
    defaultValue: 'asignado'
  }
}, {
  tableName: 'asignaciones_auditor',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['auditoria_id', 'auditor_id']
    }
  ]
});

module.exports = AsignacionAuditor;