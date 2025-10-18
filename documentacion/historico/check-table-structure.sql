-- Script para verificar estructura de tablas en SQL Server
USE sat_digital_v2;
GO

-- Verificar columnas de periodos_auditoria
PRINT '=== ESTRUCTURA: periodos_auditoria ===';
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'periodos_auditoria'
ORDER BY ORDINAL_POSITION;
GO

-- Verificar columnas de auditorias
PRINT '';
PRINT '=== ESTRUCTURA: auditorias ===';
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'auditorias'
ORDER BY ORDINAL_POSITION;
GO

-- Verificar columnas de secciones_tecnicas
PRINT '';
PRINT '=== ESTRUCTURA: secciones_tecnicas ===';
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'secciones_tecnicas'
ORDER BY ORDINAL_POSITION;
GO

-- Verificar datos existentes
PRINT '';
PRINT '=== PERÍODOS EXISTENTES ===';
SELECT * FROM periodos_auditoria;
GO

PRINT '';
PRINT '=== AUDITORÍAS EXISTENTES ===';
SELECT TOP 5 * FROM auditorias;
GO

PRINT '';
PRINT '=== SECCIONES TÉCNICAS EXISTENTES ===';
SELECT * FROM secciones_tecnicas;
GO
