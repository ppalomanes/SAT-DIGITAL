/**
 * Modelo Evaluacion - Sistema de Evaluación de Auditorías
 * Maneja la evaluación sección por sección realizada por auditores
 * 
 * @author SAT-Digital Team
 * @version 1.0.0
 * @since Checkpoint 2.4 - Workflow de Auditorías
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../shared/database/connection');

const Evaluacion = sequelize.define(
  'evaluaciones',
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
      allowNull: false,
      references: {
        model: 'secciones_tecnicas',
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
    resultado: {
      type: DataTypes.ENUM('cumple', 'no_cumple', 'cumple_con_observaciones', 'no_aplica'),
      allowNull: false
    },
    puntaje: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    criterios_evaluados: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array de criterios técnicos evaluados con sus resultados'
    },
    requiere_aclaracion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    fecha_evaluacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    version_documento: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Versión del documento evaluado'
    }
  },
  {
    tableName: 'evaluaciones',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['auditoria_id', 'seccion_id'],
        name: 'unique_evaluacion_auditoria_seccion'
      }
    ]
  }
);

module.exports = Evaluacion;