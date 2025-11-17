// Modelos completos de SAT-Digital con comunicación
// Archivo: backend/src/shared/database/models/index.js

const { Sequelize, DataTypes, Op } = require('sequelize');
const { sequelize } = require('../connection');

// Importar modelos del dominio calendario
const PeriodoAuditoria = require('../../../domains/calendario/models/PeriodoAuditoria');
const AsignacionAuditor = require('../../../domains/calendario/models/AsignacionAuditor');

// Importar modelos del dominio comunicación
const Conversacion = require('../../../domains/comunicacion/models/Conversacion');
const Mensaje = require('../../../domains/comunicacion/models/Mensaje');
const NotificacionUsuario = require('../../../domains/comunicacion/models/NotificacionUsuario');

// Importar modelos del dominio auditorías
const Evaluacion = require('../../../domains/auditorias/models/Evaluacion');
const UmbralTecnico = require('../../../domains/auditorias/models/UmbralTecnico');

// Importar modelos del dominio documentos
const VersionDocumento = require('../../../domains/documentos/models/VersionDocumento');

// Importar modelos del dominio IA-Análisis
const AnalisisIA = require('./AnalisisIA');

// Importar modelos del dominio Configuraciones
const ConfiguracionValidacionModel = require('./ConfiguracionValidacion');
const ConfiguracionHistorialModel = require('./ConfiguracionHistorial');

// Importar modelos del dominio Pliegos de Requisitos
const PliegoRequisitosModel = require('./PliegoRequisitos');
const PliegoHistorialModel = require('./PliegoHistorial');
const HeadsetHomologadoModel = require('./HeadsetHomologado');

// Importar e inicializar modelo Tenant
const TenantModel = require('./Tenant');
const Tenant = TenantModel(sequelize);

// Inicializar modelos de configuraciones
const ConfiguracionValidacion = ConfiguracionValidacionModel(sequelize);
const ConfiguracionHistorial = ConfiguracionHistorialModel(sequelize);

// Inicializar modelos de pliegos
const PliegoRequisitos = PliegoRequisitosModel(sequelize);
const PliegoHistorial = PliegoHistorialModel(sequelize);
const HeadsetHomologado = HeadsetHomologadoModel(sequelize);

// =============================================================================
// MODELO: PROVEEDORES
// =============================================================================
const Proveedor = sequelize.define(
  'proveedores',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id'
      }
    },
    razon_social: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    cuit: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true
    },
    nombre_comercial: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    contacto_principal: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email_contacto: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    telefono: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo'),
      defaultValue: 'activo'
    }
  },
  {
    tableName: 'proveedores',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// =============================================================================
// MODELO: SITIOS
// =============================================================================
const Sitio = sequelize.define(
  'sitios',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id'
      }
    },
    proveedor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'proveedores',
        key: 'id'
      }
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    localidad: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    domicilio: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo'),
      defaultValue: 'activo'
    }
  },
  {
    tableName: 'sitios',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// =============================================================================
// MODELO: USUARIOS
// =============================================================================
const Usuario = sequelize.define(
  'usuarios',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id'
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rol: {
      type: DataTypes.ENUM('admin', 'auditor_general', 'auditor_interno', 'jefe_proveedor', 'tecnico_proveedor', 'visualizador'),
      allowNull: false
    },
    proveedor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'proveedores',
        key: 'id'
      }
    },
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo', 'bloqueado'),
      defaultValue: 'activo'
    },
    ultimo_acceso: {
      type: DataTypes.DATE,
      allowNull: true
    },
    intentos_fallidos: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    token_refresh: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  },
  {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// =============================================================================
// MODELO: SECCIONES TÉCNICAS
// =============================================================================
const SeccionTecnica = sequelize.define(
  'secciones_tecnicas',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    codigo: {
      type: DataTypes.STRING(50),
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
    }
  },
  {
    tableName: 'secciones_tecnicas',
    timestamps: false
  }
);

// =============================================================================
// MODELO: AUDITORÍAS
// =============================================================================
const Auditoria = sequelize.define(
  'auditorias',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id'
      }
    },
    sitio_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sitios',
        key: 'id'
      }
    },
    periodo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Formato: YYYY-MM (ej: 2025-05, 2025-11)'
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_limite_carga: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_visita_programada: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    fecha_visita_realizada: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    auditor_asignado_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    estado: {
      type: DataTypes.ENUM('programada', 'en_carga', 'pendiente_evaluacion', 'evaluada', 'cerrada'),
      defaultValue: 'programada'
    },
    puntaje_final: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    observaciones_generales: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    tableName: 'auditorias',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['sitio_id', 'periodo'],
        name: 'unique_auditoria_sitio_periodo'
      }
    ]
  }
);

// =============================================================================
// MODELO: DOCUMENTOS
// =============================================================================
const Documento = sequelize.define(
  'documentos',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id'
      }
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
      allowNull: false
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    fecha_ultima_revision: {
      type: DataTypes.DATEONLY,
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
  },
  {
    tableName: 'documentos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  }
);

// =============================================================================
// MODELO: BITÁCORA
// =============================================================================
const Bitacora = sequelize.define(
  'bitacora',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id'
      }
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    accion: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    entidad_tipo: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    entidad_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    datos_antes: {
      type: DataTypes.JSON,
      allowNull: true
    },
    datos_despues: {
      type: DataTypes.JSON,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'bitacora',
    timestamps: false
  }
);

// =============================================================================
// DEFINICIÓN DE RELACIONES
// =============================================================================

// Tenant - Relaciones principales
Tenant.hasMany(Usuario, {
  foreignKey: 'tenant_id',
  as: 'usuarios'
});
Usuario.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

Tenant.hasMany(Proveedor, {
  foreignKey: 'tenant_id',
  as: 'proveedores'
});
Proveedor.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

Tenant.hasMany(Sitio, {
  foreignKey: 'tenant_id',
  as: 'sitios'
});
Sitio.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

Tenant.hasMany(Auditoria, {
  foreignKey: 'tenant_id',
  as: 'auditorias'
});
Auditoria.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

Tenant.hasMany(Documento, {
  foreignKey: 'tenant_id',
  as: 'documentos'
});
Documento.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

Tenant.hasMany(Bitacora, {
  foreignKey: 'tenant_id',
  as: 'bitacora'
});
Bitacora.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

// Usuario - Proveedor
Usuario.belongsTo(Proveedor, {
  foreignKey: 'proveedor_id',
  as: 'proveedor'
});
Proveedor.hasMany(Usuario, {
  foreignKey: 'proveedor_id',
  as: 'usuarios'
});

// Proveedor - Sitios
Proveedor.hasMany(Sitio, {
  foreignKey: 'proveedor_id',
  as: 'sitios'
});
Sitio.belongsTo(Proveedor, {
  foreignKey: 'proveedor_id',
  as: 'proveedor'
});

// Sitio - Auditorías
Sitio.hasMany(Auditoria, {
  foreignKey: 'sitio_id',
  as: 'auditorias'
});
Auditoria.belongsTo(Sitio, {
  foreignKey: 'sitio_id',
  as: 'sitio'
});

// Auditoría - Usuario (Auditor)
Auditoria.belongsTo(Usuario, {
  foreignKey: 'auditor_asignado_id',
  as: 'auditor'
});
Usuario.hasMany(Auditoria, {
  foreignKey: 'auditor_asignado_id',
  as: 'auditorias_asignadas'
});

// Auditoría - Documentos
Auditoria.hasMany(Documento, {
  foreignKey: 'auditoria_id',
  as: 'documentos'
});
Documento.belongsTo(Auditoria, {
  foreignKey: 'auditoria_id',
  as: 'auditoria'
});

// Sección Técnica - Documentos
SeccionTecnica.hasMany(Documento, {
  foreignKey: 'seccion_id',
  as: 'documentos'
});
Documento.belongsTo(SeccionTecnica, {
  foreignKey: 'seccion_id',
  as: 'seccion'
});

// Usuario - Documentos (carga)
Usuario.hasMany(Documento, {
  foreignKey: 'usuario_carga_id',
  as: 'documentos_cargados'
});
Documento.belongsTo(Usuario, {
  foreignKey: 'usuario_carga_id',
  as: 'usuario_carga'
});

// Usuario - Bitácora
Usuario.hasMany(Bitacora, {
  foreignKey: 'usuario_id',
  as: 'actividades'
});
Bitacora.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// ============================================================================= 
// RELACIONES MÓDULO CALENDARIO
// =============================================================================

// Tenant - PeriodoAuditoria
Tenant.hasMany(PeriodoAuditoria, {
  foreignKey: 'tenant_id',
  as: 'periodos_auditoria'
});
PeriodoAuditoria.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

// Usuario - PeriodoAuditoria (creador)
Usuario.hasMany(PeriodoAuditoria, {
  foreignKey: 'created_by',
  as: 'periodos_creados'
});
PeriodoAuditoria.belongsTo(Usuario, {
  foreignKey: 'created_by',
  as: 'creador'
});

// Tenant - AsignacionAuditor
Tenant.hasMany(AsignacionAuditor, {
  foreignKey: 'tenant_id',
  as: 'asignaciones_auditor'
});
AsignacionAuditor.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

// Auditoria - AsignacionAuditor
Auditoria.hasOne(AsignacionAuditor, {
  foreignKey: 'auditoria_id',
  as: 'asignacion'
});
AsignacionAuditor.belongsTo(Auditoria, {
  foreignKey: 'auditoria_id',
  as: 'auditoria'
});

// Usuario - AsignacionAuditor (auditor)
Usuario.hasMany(AsignacionAuditor, {
  foreignKey: 'auditor_id',
  as: 'asignaciones'
});
AsignacionAuditor.belongsTo(Usuario, {
  foreignKey: 'auditor_id',
  as: 'auditor'
});

// =============================================================================
// RELACIONES MÓDULO COMUNICACIÓN
// =============================================================================

// Tenant - Conversaciones
Tenant.hasMany(Conversacion, {
  foreignKey: 'tenant_id',
  as: 'conversaciones_tenant'
});
Conversacion.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

// Auditoria - Conversaciones
Auditoria.hasMany(Conversacion, {
  foreignKey: 'auditoria_id',
  as: 'conversaciones'
});
Conversacion.belongsTo(Auditoria, {
  foreignKey: 'auditoria_id',
  as: 'auditoria'
});

// SeccionTecnica - Conversaciones (opcional)
SeccionTecnica.hasMany(Conversacion, {
  foreignKey: 'seccion_id',
  as: 'conversaciones'
});
Conversacion.belongsTo(SeccionTecnica, {
  foreignKey: 'seccion_id',
  as: 'seccion'
});

// Usuario - Conversaciones (iniciador)
Usuario.hasMany(Conversacion, {
  foreignKey: 'iniciada_por',
  as: 'conversaciones_iniciadas'
});
Conversacion.belongsTo(Usuario, {
  foreignKey: 'iniciada_por',
  as: 'iniciador'
});

// Tenant - Mensajes
Tenant.hasMany(Mensaje, {
  foreignKey: 'tenant_id',
  as: 'mensajes_tenant'
});
Mensaje.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

// Conversacion - Mensajes
Conversacion.hasMany(Mensaje, {
  foreignKey: 'conversacion_id',
  as: 'mensajes'
});
Mensaje.belongsTo(Conversacion, {
  foreignKey: 'conversacion_id',
  as: 'conversacion'
});

// Usuario - Mensajes
Usuario.hasMany(Mensaje, {
  foreignKey: 'usuario_id',
  as: 'mensajes'
});
Mensaje.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Documento - Mensajes (referencia opcional)
Documento.hasMany(Mensaje, {
  foreignKey: 'referencia_documento_id',
  as: 'mensajes_referencia'
});
Mensaje.belongsTo(Documento, {
  foreignKey: 'referencia_documento_id',
  as: 'documento_referencia'
});

// Tenant - Notificaciones
Tenant.hasMany(NotificacionUsuario, {
  foreignKey: 'tenant_id',
  as: 'notificaciones_tenant'
});
NotificacionUsuario.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

// Usuario - Notificaciones
Usuario.hasMany(NotificacionUsuario, {
  foreignKey: 'usuario_id',
  as: 'notificaciones'
});
NotificacionUsuario.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// =============================================================================
// RELACIONES MÓDULO AUDITORÍAS
// =============================================================================

// Auditoria - Evaluaciones
Auditoria.hasMany(Evaluacion, {
  foreignKey: 'auditoria_id',
  as: 'evaluaciones'
});
Evaluacion.belongsTo(Auditoria, {
  foreignKey: 'auditoria_id',
  as: 'auditoria'
});

// SeccionTecnica - Evaluaciones
SeccionTecnica.hasMany(Evaluacion, {
  foreignKey: 'seccion_id',
  as: 'evaluaciones'
});
Evaluacion.belongsTo(SeccionTecnica, {
  foreignKey: 'seccion_id',
  as: 'seccion'
});

// Usuario - Evaluaciones (auditor)
Usuario.hasMany(Evaluacion, {
  foreignKey: 'auditor_id',
  as: 'evaluaciones_realizadas'
});
Evaluacion.belongsTo(Usuario, {
  foreignKey: 'auditor_id',
  as: 'auditor'
});

// SeccionTecnica - Umbrales Técnicos
SeccionTecnica.hasMany(UmbralTecnico, {
  foreignKey: 'seccion_id',
  as: 'umbrales'
});
UmbralTecnico.belongsTo(SeccionTecnica, {
  foreignKey: 'seccion_id',
  as: 'seccion'
});

// =============================================================================
// RELACIONES MÓDULO DOCUMENTOS (VERSIONES)
// =============================================================================

// Documento - Versiones
Documento.hasMany(VersionDocumento, {
  foreignKey: 'documento_id',
  as: 'versiones'
});
VersionDocumento.belongsTo(Documento, {
  foreignKey: 'documento_id',
  as: 'documento'
});

// Usuario - Versiones (carga)
Usuario.hasMany(VersionDocumento, {
  foreignKey: 'usuario_carga_id',
  as: 'versiones_cargadas'
});
VersionDocumento.belongsTo(Usuario, {
  foreignKey: 'usuario_carga_id',
  as: 'usuario_carga'
});

// =============================================================================
// RELACIONES MÓDULO IA-ANÁLISIS
// =============================================================================

// Documento - Análisis IA
Documento.hasMany(AnalisisIA, {
  foreignKey: 'documento_id',
  as: 'analisis'
});
AnalisisIA.belongsTo(Documento, {
  foreignKey: 'documento_id',
  as: 'documento'
});

// =============================================================================
// RELACIONES MÓDULO HEADSETS HOMOLOGADOS
// =============================================================================

// Tenant - HeadsetHomologado
Tenant.hasMany(HeadsetHomologado, {
  foreignKey: 'tenant_id',
  as: 'headsets_homologados'
});
HeadsetHomologado.belongsTo(Tenant, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

module.exports = {
  sequelize,
  Op,
  Tenant,
  Usuario,
  Proveedor,
  Sitio,
  SeccionTecnica,
  Auditoria,
  Documento,
  Bitacora,
  // Modelos de calendario
  PeriodoAuditoria,
  AsignacionAuditor,
  // Modelos de comunicación
  Conversacion,
  Mensaje,
  NotificacionUsuario,
  // Modelos de auditorías
  Evaluacion,
  UmbralTecnico,
  // Modelos de documentos
  VersionDocumento,
  // Modelos de IA-Análisis
  AnalisisIA,
  // Modelos de Configuraciones
  ConfiguracionValidacion,
  ConfiguracionHistorial,
  // Modelos de Pliegos de Requisitos
  PliegoRequisitos,
  PliegoHistorial,
  // Modelos de Headsets Homologados
  HeadsetHomologado
};
