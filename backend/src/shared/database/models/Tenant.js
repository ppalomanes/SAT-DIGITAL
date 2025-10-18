const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tenant = sequelize.define('Tenant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Nombre de la organización tenant'
    },
    slug: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Identificador único para subdomain/routing'
    },
    dominio: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Dominio personalizado del tenant (ej: telecom.satdigital.com)'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: 'Estado del tenant (activo/suspendido)'
    },
    configuracion: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuración específica del tenant (logos, colores, etc)'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Metadata adicional (contacto, plan, límites, etc)'
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de inicio del contrato'
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de fin del contrato'
    }
  }, {
    tableName: 'tenants',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['slug'], unique: true },
      { fields: ['activo'] },
      { fields: ['dominio'] }
    ]
  });

  // Asociaciones
  Tenant.associate = (models) => {
    Tenant.hasMany(models.Usuario, {
      foreignKey: 'tenant_id',
      as: 'usuarios'
    });

    Tenant.hasMany(models.Proveedor, {
      foreignKey: 'tenant_id',
      as: 'proveedores'
    });

    Tenant.hasMany(models.Sitio, {
      foreignKey: 'tenant_id',
      as: 'sitios'
    });

    Tenant.hasMany(models.Auditoria, {
      foreignKey: 'tenant_id',
      as: 'auditorias'
    });

    Tenant.hasMany(models.PeriodoAuditoria, {
      foreignKey: 'tenant_id',
      as: 'periodos'
    });

    Tenant.hasMany(models.Documento, {
      foreignKey: 'tenant_id',
      as: 'documentos'
    });

    Tenant.hasMany(models.Conversacion, {
      foreignKey: 'tenant_id',
      as: 'conversaciones'
    });

    Tenant.hasMany(models.Mensaje, {
      foreignKey: 'tenant_id',
      as: 'mensajes'
    });

    Tenant.hasMany(models.NotificacionUsuario, {
      foreignKey: 'tenant_id',
      as: 'notificaciones'
    });

    Tenant.hasMany(models.AsignacionAuditor, {
      foreignKey: 'tenant_id',
      as: 'asignaciones'
    });

    Tenant.hasMany(models.Bitacora, {
      foreignKey: 'tenant_id',
      as: 'bitacora'
    });
  };

  // Hooks
  Tenant.addHook('beforeCreate', (tenant) => {
    // Auto-generar slug si no existe
    if (!tenant.slug && tenant.nombre) {
      tenant.slug = tenant.nombre
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
  });

  return Tenant;
};
