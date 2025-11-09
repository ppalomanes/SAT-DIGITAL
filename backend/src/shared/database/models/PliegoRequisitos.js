const { DataTypes } = require('sequelize');

/**
 * Modelo PliegoRequisitos
 *
 * Define los requisitos técnicos que aplican a períodos completos de auditoría.
 * Un pliego centraliza la configuración de umbrales mínimos para:
 * - Parque Informático (CPU, RAM, SSD, Headsets)
 * - Conectividad (Velocidades internet)
 * - Infraestructura (UPS, Generador, etc.)
 * - Seguridad (Controles obligatorios)
 *
 * Los períodos de auditoría se asocian a un pliego, garantizando que todas
 * las auditorías del período usen los mismos criterios de evaluación.
 */

const PliegoRequisitos = (sequelize) => {
  return sequelize.define('PliegoRequisitos', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID del tenant (organización)'
    },

    // Identificación
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Código único del pliego (Ej: "2025-1", "2025-2")'
    },

    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Nombre descriptivo del pliego'
    },

    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción detallada del alcance del pliego'
    },

    // Vigencia
    vigencia_desde: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Fecha de inicio de vigencia'
    },

    vigencia_hasta: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Fecha de fin de vigencia (null = indefinido)'
    },

    // Estado
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'borrador',
      comment: 'Estado del pliego: borrador, activo, vencido, archivado'
    },

    es_vigente: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica si es el pliego vigente actualmente para este tenant'
    },

    // Configuraciones por sección técnica (JSON)
    parque_informatico: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('parque_informatico');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('parque_informatico', value ? JSON.stringify(value) : null);
      },
      comment: 'Requisitos de hardware/software (CPU, RAM, SSD, SO, etc.)'
    },

    conectividad: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('conectividad');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('conectividad', value ? JSON.stringify(value) : null);
      },
      comment: 'Requisitos de conectividad hogar/sitio'
    },

    infraestructura: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('infraestructura');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('infraestructura', value ? JSON.stringify(value) : null);
      },
      comment: 'Requisitos de infraestructura física (UPS, Generador, etc.)'
    },

    seguridad: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('seguridad');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('seguridad', value ? JSON.stringify(value) : null);
      },
      comment: 'Requisitos de seguridad informática y física'
    },

    documentacion: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('documentacion');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('documentacion', value ? JSON.stringify(value) : null);
      },
      comment: 'Requisitos de documentación obligatoria'
    },

    personal: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('personal');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('personal', value ? JSON.stringify(value) : null);
      },
      comment: 'Requisitos de personal (capacitaciones, certific

aciones)'
    },

    // Archivo de headsets homologados
    archivo_headsets_path: {
      type: DataTypes.STRING(500),
      allowNull: true
    },

    archivo_headsets_nombre: {
      type: DataTypes.STRING(200),
      allowNull: true
    },

    total_headsets: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },

    // Auditoría de cambios
    creado_por: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    creado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },

    modificado_por: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    modificado_en: {
      type: DataTypes.DATE,
      allowNull: true
    },

    // Versionado
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Número de versión del pliego'
    },

    pliego_padre_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID del pliego desde el cual fue duplicado (trazabilidad)'
    },

    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'pliegos_requisitos',
    timestamps: false,
    indexes: [
      { fields: ['tenant_id'] },
      { fields: ['tenant_id', 'es_vigente'] },
      { fields: ['tenant_id', 'codigo'] }
    ]
  });
};

module.exports = PliegoRequisitos;
