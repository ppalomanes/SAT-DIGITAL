// Modelo NotificacionUsuario para alertas personalizadas
// Checkpoint 2.3 - Sistema Comunicación Asíncrona

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../shared/database/connection');

const NotificacionUsuario = sequelize.define(
  'notificaciones_usuario',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    tipo_notificacion: {
      type: DataTypes.ENUM('mensaje_nuevo', 'respuesta_recibida', 'estado_cambiado', 'plazo_venciendo'),
      allowNull: false
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    enlace_accion: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    leida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    leida_en: {
      type: DataTypes.DATE,
      allowNull: true
    },
    data_adicional: {
      type: DataTypes.JSON,
      allowNull: true
    }
  },
  {
    tableName: 'notificaciones_usuario',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  }
);

module.exports = NotificacionUsuario;
