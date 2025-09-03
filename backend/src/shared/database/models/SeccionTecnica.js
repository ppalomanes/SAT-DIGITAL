const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const SeccionTecnica = sequelize.define('SeccionTecnica', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tipo_analisis: {
    type: DataTypes.ENUM('tiempo_real', 'lotes'),
    allowNull: false
  },
  obligatoria: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  orden_presentacion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('activa', 'inactiva'),
    defaultValue: 'activa'
  },
  formatos_permitidos: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: ['pdf', 'jpg', 'jpeg', 'png', 'xlsx']
  },
  tamaño_maximo_mb: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  }
}, {
  tableName: 'secciones_tecnicas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

SeccionTecnica.associate = function(models) {
  SeccionTecnica.hasMany(models.Documento, {
    foreignKey: 'seccion_id',
    as: 'documentos'
  });
};

module.exports = SeccionTecnica;