const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../shared/database/connection');

/**
 * Modelo para asignaciones de auditores a sitios específicos
 */
const AsignacionAuditor = sequelize.define('AsignacionAuditor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  auditoria_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  auditor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_asignacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_visita_programada: {
    type: DataTypes.DATE
  },
  prioridad: {
    type: DataTypes.ENUM('baja', 'normal', 'alta'),
    defaultValue: 'normal'
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  estado_asignacion: {
    type: DataTypes.ENUM('asignado', 'confirmado', 'reagendado', 'completado'),
    defaultValue: 'asignado'
  }
}, {
  tableName: 'asignaciones_auditor',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

AsignacionAuditor.prototype.estaCompletada = function() {
  return this.estado_asignacion === 'completado';
};

module.exports = AsignacionAuditor;
