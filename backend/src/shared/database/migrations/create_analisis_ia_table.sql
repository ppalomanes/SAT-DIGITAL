-- =====================================================================
-- MIGRACIÓN: TABLA ANALISIS_IA
-- Descripción: Almacena resultados de análisis de documentos con IA
-- Fecha: 2025-09-09
-- Versión: 1.0
-- =====================================================================

USE sat_digital;

-- Crear tabla analisis_ia
CREATE TABLE IF NOT EXISTS analisis_ia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relación con documento
    documento_id INT NOT NULL,
    
    -- Información del modelo de IA
    modelo_ia VARCHAR(100) NOT NULL COMMENT 'Modelo de IA utilizado (llama3.1:8b, llava:7b, etc.)',
    tipo_analisis ENUM('text', 'vision', 'hybrid') NOT NULL COMMENT 'Tipo de análisis realizado',
    
    -- Resultados del análisis
    resultado_ia TEXT COMMENT 'Respuesta completa del modelo de IA en formato JSON',
    
    -- Scores (0-100)
    score_completitud INT DEFAULT NULL COMMENT 'Score de completitud (0-100)',
    score_calidad INT DEFAULT NULL COMMENT 'Score de calidad técnica (0-100)',
    score_cumplimiento INT DEFAULT NULL COMMENT 'Score de cumplimiento normativo (0-100)',
    score_promedio INT DEFAULT NULL COMMENT 'Score promedio calculado',
    
    -- Análisis detallado
    elementos_detectados TEXT COMMENT 'Lista de elementos técnicos detectados (JSON)',
    observaciones_ia TEXT COMMENT 'Observaciones y puntos críticos identificados por la IA',
    recomendaciones_ia TEXT COMMENT 'Recomendaciones sugeridas por la IA',
    
    -- Métricas de procesamiento
    tokens_utilizados INT DEFAULT 0 COMMENT 'Número de tokens utilizados en el análisis',
    tiempo_procesamiento INT DEFAULT NULL COMMENT 'Tiempo de procesamiento en milisegundos',
    
    -- Estado del análisis
    estado ENUM('procesando', 'completado', 'error', 'cancelado') NOT NULL DEFAULT 'procesando' COMMENT 'Estado del análisis',
    observaciones TEXT COMMENT 'Observaciones adicionales o errores',
    
    -- Versión del sistema
    version_analisis VARCHAR(20) NOT NULL DEFAULT '1.0' COMMENT 'Versión del sistema de análisis utilizado',
    
    -- Timestamps
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_analisis_ia_documento 
        FOREIGN KEY (documento_id) 
        REFERENCES documentos(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Validaciones
    CONSTRAINT chk_score_completitud 
        CHECK (score_completitud IS NULL OR (score_completitud >= 0 AND score_completitud <= 100)),
    CONSTRAINT chk_score_calidad 
        CHECK (score_calidad IS NULL OR (score_calidad >= 0 AND score_calidad <= 100)),
    CONSTRAINT chk_score_cumplimiento 
        CHECK (score_cumplimiento IS NULL OR (score_cumplimiento >= 0 AND score_cumplimiento <= 100)),
    CONSTRAINT chk_score_promedio 
        CHECK (score_promedio IS NULL OR (score_promedio >= 0 AND score_promedio <= 100))
) 
ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci
COMMENT='Almacena resultados de análisis de documentos realizados por IA';

-- Crear índices para optimizar consultas
CREATE INDEX idx_analisis_ia_documento_id ON analisis_ia(documento_id);
CREATE INDEX idx_analisis_ia_modelo_ia ON analisis_ia(modelo_ia);
CREATE INDEX idx_analisis_ia_tipo_analisis ON analisis_ia(tipo_analisis);
CREATE INDEX idx_analisis_ia_estado ON analisis_ia(estado);
CREATE INDEX idx_analisis_ia_fecha_creacion ON analisis_ia(fecha_creacion);
CREATE INDEX idx_analisis_ia_score_promedio ON analisis_ia(score_promedio);

-- Índice compuesto para consultas por auditoría
CREATE INDEX idx_analisis_ia_auditoria ON analisis_ia(documento_id, estado, fecha_creacion);

-- Actualizar tabla documentos para agregar campos de análisis IA
ALTER TABLE documentos 
ADD COLUMN IF NOT EXISTS analisis_ia_completado BOOLEAN DEFAULT FALSE COMMENT 'Indica si el análisis de IA fue completado',
ADD COLUMN IF NOT EXISTS fecha_analisis_ia TIMESTAMP NULL COMMENT 'Fecha del último análisis de IA';

-- Crear índices en la tabla documentos
CREATE INDEX IF NOT EXISTS idx_documentos_analisis_ia ON documentos(analisis_ia_completado);
CREATE INDEX IF NOT EXISTS idx_documentos_fecha_analisis_ia ON documentos(fecha_analisis_ia);

-- Insertar datos de configuración inicial
INSERT IGNORE INTO secciones_tecnicas 
(codigo, nombre, descripcion, tipo_analisis, obligatoria, orden_presentacion) 
VALUES 
('IA-CONFIG', 'Configuración de IA', 'Parámetros y configuración del sistema de análisis con IA', 'tiempo_real', false, 99);

-- Comentarios de documentación
ALTER TABLE analisis_ia COMMENT = 'Tabla que almacena los resultados de análisis automático de documentos realizados por modelos de IA como LLaVA y Llama 3.1. Incluye scores de evaluación, observaciones y recomendaciones generadas automáticamente.';

-- Log de migración exitosa
INSERT INTO bitacora (
    usuario_id, 
    accion, 
    entidad_tipo, 
    entidad_id, 
    descripcion, 
    ip_address, 
    timestamp
) VALUES (
    NULL,
    'CREATE_TABLE',
    'analisis_ia',
    NULL,
    'Tabla analisis_ia creada exitosamente con índices y constraints. Sistema de IA integrado.',
    '127.0.0.1',
    NOW()
);

-- Verificar estructura de la tabla
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'sat_digital' 
  AND TABLE_NAME = 'analisis_ia' 
ORDER BY ORDINAL_POSITION;

-- =====================================================================
-- FIN DE MIGRACIÓN
-- =====================================================================