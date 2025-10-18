-- Script para verificar datos en SQL Server sat_digital_v2
-- Ejecutar en SQL Server Management Studio

USE sat_digital_v2;
GO

-- 1. Verificar tablas existentes
PRINT '=== TABLAS EXISTENTES ===';
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO

-- 2. Verificar períodos de auditoría
PRINT '';
PRINT '=== PERÍODOS DE AUDITORÍA ===';
SELECT
    id,
    nombre,
    codigo,
    fecha_inicio,
    fecha_fin,
    activo,
    estado
FROM periodos_auditoria
ORDER BY created_at DESC;
GO

-- 3. Verificar proveedores activos
PRINT '';
PRINT '=== PROVEEDORES ACTIVOS ===';
SELECT
    id,
    nombre_comercial,
    razon_social,
    estado
FROM proveedores
WHERE estado = 'activo'
ORDER BY nombre_comercial;
GO

-- 4. Verificar sitios activos
PRINT '';
PRINT '=== SITIOS ACTIVOS ===';
SELECT
    s.id,
    s.nombre as sitio_nombre,
    s.localidad,
    p.nombre_comercial as proveedor,
    s.estado
FROM sitios s
INNER JOIN proveedores p ON s.proveedor_id = p.id
WHERE s.estado = 'activo'
ORDER BY p.nombre_comercial, s.nombre;
GO

-- 5. Verificar auditorías existentes
PRINT '';
PRINT '=== AUDITORÍAS EXISTENTES ===';
SELECT
    COUNT(*) as total_auditorias,
    estado,
    periodo
FROM auditorias
GROUP BY estado, periodo
ORDER BY periodo DESC, estado;
GO

-- 6. Verificar usuarios de proveedores
PRINT '';
PRINT '=== USUARIOS DE PROVEEDORES ===';
SELECT
    u.id,
    u.nombre,
    u.email,
    u.rol,
    p.nombre_comercial as proveedor
FROM usuarios u
LEFT JOIN proveedores p ON u.proveedor_id = p.id
WHERE u.rol IN ('jefe_proveedor', 'tecnico_proveedor')
ORDER BY p.nombre_comercial, u.nombre;
GO

-- 7. Verificar secciones técnicas
PRINT '';
PRINT '=== SECCIONES TÉCNICAS ===';
SELECT
    id,
    nombre,
    codigo,
    orden,
    activo
FROM secciones_tecnicas
ORDER BY orden;
GO
