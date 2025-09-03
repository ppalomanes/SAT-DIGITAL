const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const Documento = sequelize.define('Documento', {
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
  nombre_archivo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nombre_original: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tipo_archivo: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  tamaño_bytes: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  ruta_almacenamiento: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  hash_archivo: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  fecha_ultima_revision: {
    type: DataTypes.DATE,
    allowNull: true
  },
  observaciones_carga: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  usuario_carga_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  estado_analisis: {
    type: DataTypes.ENUM('pendiente', 'procesando', 'completado', 'error'),
    defaultValue: 'pendiente'
  }
}, {
  tableName: 'documentos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Asociaciones
Documento.associate = function(models) {
  Documento.belongsTo(models.Auditoria, {
    foreignKey: 'auditoria_id',
    as: 'auditoria'
  });
  
  Documento.belongsTo(models.SeccionTecnica, {
    foreignKey: 'seccion_id', 
    as: 'seccion'
  });
  
  Documento.belongsTo(models.Usuario, {
    foreignKey: 'usuario_carga_id',
    as: 'usuarioCarga'
  });
};

module.exports = Documento;