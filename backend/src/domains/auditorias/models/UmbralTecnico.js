/**
 * Modelo UmbralTecnico - Configuración de Validaciones Automáticas
 * Define los criterios técnicos mínimos para cada sección de auditoría
 * 
 * @author SAT-Digital Team
 * @version 1.0.0
 * @since Checkpoint 2.4 - Workflow de Auditorías
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../shared/database/connection');

const UmbralTecnico = sequelize.define(
  'umbrales_tecnicos',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    seccion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'secciones_tecnicas',
        key: 'id'
      }
    },
    criterio: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nombre del criterio técnico (ej: "RAM_MINIMA", "PROCESADOR_MINIMO")'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tipo_validacion: {
      type: DataTypes.ENUM('numerico', 'texto', 'booleano', 'lista', 'expresion_regular'),
      allowNull: false
    },
    valor_minimo: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Valor mínimo aceptable (para validaciones numéricas)'
    },
    valor_maximo: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Valor máximo aceptable (para validaciones numéricas)'
    },
    valores_permitidos: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array de valores permitidos (para listas)'
    },
    patron_regex: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Patrón de expresión regular para validación'
    },
    campo_excel: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Nombre de columna en archivo Excel (si aplica)'
    },
    obligatorio: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    periodo_vigencia: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Período desde el cual aplica este umbral (ej: "2025-05")'
    },
    mensaje_error: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Mensaje personalizado cuando no cumple el criterio'
    },
    configuracion_adicional: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuraciones específicas del criterio'
    }
  },
  {
    tableName: 'umbrales_tecnicos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['seccion_id', 'criterio'],
        name: 'unique_umbral_seccion_criterio'
      }
    ]
  }
);

module.exports = UmbralTecnico;