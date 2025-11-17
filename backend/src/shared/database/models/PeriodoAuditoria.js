const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

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
    defaultValue: 'planificacion'
  },
  configuracion_especial: {
    type: DataTypes.JSON,
    allowNull: true
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tenants',
      key: 'id'
    },
    comment: 'ID del tenant (multi-tenancy)'
  },
  pliego_requisitos_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'pliegos_requisitos',
      key: 'id'
    },
    comment: 'Pliego de requisitos técnicos aplicable a este período'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  }
}, {
  tableName: 'periodos_auditoria',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PeriodoAuditoria;