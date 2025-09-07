// Modelo Mensaje para chat entre proveedores y auditores
// Checkpoint 2.3 - Sistema Comunicación Asíncrona

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../shared/database/connection');

const Mensaje = sequelize.define(
  'mensajes',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    conversacion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'conversaciones',
        key: 'id'
      }
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tipo_mensaje: {
      type: DataTypes.ENUM('texto', 'archivo', 'sistema'),
      defaultValue: 'texto'
    },
    archivo_adjunto: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    referencia_documento_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'documentos',
        key: 'id'
      }
    },
    responde_a_mensaje_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    estado_mensaje: {
      type: DataTypes.ENUM('enviado', 'leido', 'respondido'),
      defaultValue: 'enviado'
    },
    ip_origen: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    leido_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp de cuando el mensaje fue leído'
    }
  },
  {
    tableName: 'mensajes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  }
);

module.exports = Mensaje;
