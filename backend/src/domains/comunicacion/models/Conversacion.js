// Modelo Conversacion para chat contextual
// Checkpoint 2.3 - Sistema Comunicación Asíncrona

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../shared/database/connection');

const Conversacion = sequelize.define(
  'conversaciones',
  {
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
    seccion_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'secciones_tecnicas',
        key: 'id'
      }
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    categoria: {
      type: DataTypes.ENUM('tecnico', 'administrativo', 'solicitud', 'problema'),
      defaultValue: 'tecnico'
    },
    estado: {
      type: DataTypes.ENUM('abierta', 'en_proceso', 'respondida', 'cerrada'),
      defaultValue: 'abierta'
    },
    prioridad: {
      type: DataTypes.ENUM('baja', 'normal', 'alta'),
      defaultValue: 'normal'
    },
    iniciada_por: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    }
  },
  {
    tableName: 'conversaciones',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Conversacion;
