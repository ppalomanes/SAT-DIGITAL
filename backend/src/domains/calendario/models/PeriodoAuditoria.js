const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../shared/database/connection');

/**
 * Modelo para gestión de períodos de auditoría semestrales
 */
const PeriodoAuditoria = sequelize.define('PeriodoAuditoria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_limite_carga: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_inicio_visitas: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_fin_visitas: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('planificacion', 'activo', 'carga', 'visitas', 'cerrado'),
    defaultValue: 'planificacion',
    allowNull: false
  },
  configuracion_especial: {
    type: DataTypes.JSON
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'periodos_auditoria',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

PeriodoAuditoria.prototype.estaActivo = function() {
  return this.estado === 'activo';
};

PeriodoAuditoria.obtenerActivo = async function() {
  return this.findOne({ where: { estado: 'activo' } });
};

module.exports = PeriodoAuditoria;
