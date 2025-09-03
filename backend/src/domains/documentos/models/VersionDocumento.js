/**
 * Modelo VersionDocumento - Control de Versiones de Documentos
 * Mantiene el historial completo de versiones de cada documento cargado
 * 
 * @author SAT-Digital Team
 * @version 1.0.0
 * @since Checkpoint 2.4 - Sistema de Versiones
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../shared/database/connection');

const VersionDocumento = sequelize.define(
  'versiones_documentos',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    documento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'documentos',
        key: 'id'
      }
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Número de versión (1, 2, 3...)'
    },
    nombre_archivo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ruta_almacenamiento: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    hash_archivo: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: 'SHA-256 del archivo para verificar integridad'
    },
    tamaño_bytes: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    usuario_carga_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    motivo_cambio: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Razón del cambio de versión'
    },
    cambios_detectados: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Lista de cambios detectados automáticamente'
    },
    estado: {
      type: DataTypes.ENUM('activa', 'reemplazada', 'archivada'),
      defaultValue: 'activa'
    },
    fecha_carga: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    evaluada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indica si esta versión ya fue evaluada por auditores'
    },
    snapshot_metadatos: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Metadatos del estado de la auditoría al momento de la carga'
    }
  },
  {
    tableName: 'versiones_documentos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['documento_id', 'version'],
        name: 'unique_documento_version'
      }
    ]
  }
);

module.exports = VersionDocumento;