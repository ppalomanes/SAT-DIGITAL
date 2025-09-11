const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const AnalisisIA = sequelize.define('AnalisisIA', {
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
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    modelo_ia: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Modelo de IA utilizado (llama3.1:8b, llava:7b, etc.)'
    },
    tipo_analisis: {
        type: DataTypes.ENUM('text', 'vision', 'hybrid'),
        allowNull: false,
        comment: 'Tipo de análisis realizado'
    },
    resultado_ia: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Respuesta completa del modelo de IA en formato JSON'
    },
    score_completitud: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0,
            max: 100
        },
        comment: 'Score de completitud (0-100)'
    },
    score_calidad: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0,
            max: 100
        },
        comment: 'Score de calidad técnica (0-100)'
    },
    score_cumplimiento: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0,
            max: 100
        },
        comment: 'Score de cumplimiento normativo (0-100)'
    },
    score_promedio: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0,
            max: 100
        },
        comment: 'Score promedio calculado'
    },
    elementos_detectados: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Lista de elementos técnicos detectados (JSON)'
    },
    observaciones_ia: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones y puntos críticos identificados por la IA'
    },
    recomendaciones_ia: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Recomendaciones sugeridas por la IA'
    },
    tokens_utilizados: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Número de tokens utilizados en el análisis'
    },
    tiempo_procesamiento: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Tiempo de procesamiento en milisegundos'
    },
    estado: {
        type: DataTypes.ENUM('procesando', 'completado', 'error', 'cancelado'),
        allowNull: false,
        defaultValue: 'procesando',
        comment: 'Estado del análisis'
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones adicionales o errores'
    },
    version_analisis: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: '1.0',
        comment: 'Versión del sistema de análisis utilizado'
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    fecha_actualizacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'analisis_ia',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
        {
            fields: ['documento_id']
        },
        {
            fields: ['modelo_ia']
        },
        {
            fields: ['tipo_analisis']
        },
        {
            fields: ['estado']
        },
        {
            fields: ['fecha_creacion']
        },
        {
            fields: ['score_promedio']
        }
    ]
});

// Relaciones
AnalisisIA.associate = (models) => {
    // Un análisis pertenece a un documento
    AnalisisIA.belongsTo(models.Documento, {
        foreignKey: 'documento_id',
        as: 'documento',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    });
};

// Métodos de instancia
AnalisisIA.prototype.getScoresTotales = function() {
    return {
        completitud: this.score_completitud,
        calidad: this.score_calidad,
        cumplimiento: this.score_cumplimiento,
        promedio: this.score_promedio
    };
};

AnalisisIA.prototype.isCompleto = function() {
    return this.estado === 'completado';
};

AnalisisIA.prototype.hasError = function() {
    return this.estado === 'error';
};

// Métodos de clase
AnalisisIA.getEstadisticasPorAuditoria = async function(auditoria_id) {
    const { Documento } = require('./');
    
    const results = await this.findAll({
        include: [{
            model: Documento,
            as: 'documento',
            where: { auditoria_id },
            attributes: []
        }],
        where: { estado: 'completado' },
        attributes: [
            'modelo_ia',
            'tipo_analisis',
            [sequelize.fn('COUNT', sequelize.col('AnalisisIA.id')), 'total'],
            [sequelize.fn('AVG', sequelize.col('score_promedio')), 'score_promedio'],
            [sequelize.fn('AVG', sequelize.col('score_completitud')), 'score_completitud'],
            [sequelize.fn('AVG', sequelize.col('score_calidad')), 'score_calidad'],
            [sequelize.fn('AVG', sequelize.col('score_cumplimiento')), 'score_cumplimiento']
        ],
        group: ['modelo_ia', 'tipo_analisis']
    });

    return results;
};

AnalisisIA.getScoresPorSeccion = async function(auditoria_id) {
    const { Documento, SeccionTecnica } = require('./');
    
    const results = await this.findAll({
        include: [
            {
                model: Documento,
                as: 'documento',
                where: { auditoria_id },
                include: [{
                    model: SeccionTecnica,
                    as: 'seccionTecnica',
                    attributes: ['nombre', 'descripcion']
                }]
            }
        ],
        where: { estado: 'completado' },
        attributes: [
            [sequelize.fn('AVG', sequelize.col('score_promedio')), 'score_promedio'],
            [sequelize.fn('AVG', sequelize.col('score_completitud')), 'score_completitud'],
            [sequelize.fn('AVG', sequelize.col('score_calidad')), 'score_calidad'],
            [sequelize.fn('AVG', sequelize.col('score_cumplimiento')), 'score_cumplimiento'],
            [sequelize.fn('COUNT', sequelize.col('AnalisisIA.id')), 'total_documentos']
        ],
        group: ['documento.seccion_tecnica_id', 'documento->seccionTecnica.id']
    });

    return results;
};

module.exports = AnalisisIA;