-- Script para inicializar datos de auditorías en SQL Server
-- Ejecutar en SQL Server Management Studio

USE sat_digital_v2;
GO

PRINT '🚀 Iniciando creación de datos de auditorías...';
PRINT '';

-- 1. Verificar y crear período activo
PRINT '📅 1. Verificando período activo...';

DECLARE @periodo_existe INT;
SELECT @periodo_existe = COUNT(*) FROM periodos_auditoria WHERE activo = 1;

IF @periodo_existe = 0
BEGIN
    PRINT '⚠️  No hay período activo, creando uno...';

    -- Desactivar otros períodos
    UPDATE periodos_auditoria SET activo = 0 WHERE activo = 1;

    -- Crear período Mayo-Noviembre 2025
    INSERT INTO periodos_auditoria
    (nombre, codigo, fecha_inicio, fecha_limite_carga, fecha_inicio_visitas, fecha_fin_visitas, fecha_fin, activo, estado, created_by, created_at, updated_at)
    VALUES
    ('Mayo-Noviembre 2025', '2025-2S', '2025-05-01', '2025-06-15', '2025-07-01', '2025-11-30', '2025-11-30', 1, 'activo', 1, GETDATE(), GETDATE());

    PRINT '✅ Período activo creado: Mayo-Noviembre 2025';
END
ELSE
BEGIN
    PRINT '✅ Ya existe un período activo';
    SELECT nombre, codigo, fecha_inicio, fecha_fin FROM periodos_auditoria WHERE activo = 1;
END
PRINT '';

-- 2. Verificar proveedores y sitios
PRINT '🏢 2. Verificando proveedores...';
DECLARE @total_proveedores INT;
SELECT @total_proveedores = COUNT(*) FROM proveedores WHERE estado = 'activo';
PRINT '✅ Proveedores activos: ' + CAST(@total_proveedores AS VARCHAR(10));

PRINT '🏠 3. Verificando sitios...';
DECLARE @total_sitios INT;
SELECT @total_sitios = COUNT(*) FROM sitios WHERE estado = 'activo';
PRINT '✅ Sitios activos: ' + CAST(@total_sitios AS VARCHAR(10));
PRINT '';

-- 3. Crear auditorías para el período activo (si no existen)
PRINT '📋 4. Verificando auditorías para período activo...';

DECLARE @periodo_codigo VARCHAR(20);
SELECT TOP 1 @periodo_codigo = codigo FROM periodos_auditoria WHERE activo = 1;

DECLARE @auditorias_existentes INT;
SELECT @auditorias_existentes = COUNT(*) FROM auditorias WHERE periodo = @periodo_codigo;

IF @auditorias_existentes = 0
BEGIN
    PRINT '⚠️  No hay auditorías, creando para todos los sitios activos...';

    -- Crear auditoría para cada sitio activo
    INSERT INTO auditorias
    (sitio_id, periodo, fecha_inicio, fecha_limite_carga, fecha_visita_programada, estado, created_by, created_at, updated_at)
    SELECT
        s.id,
        @periodo_codigo,
        '2025-05-01',
        '2025-06-15',
        '2025-07-15',
        'en_carga',
        1,
        GETDATE(),
        GETDATE()
    FROM sitios s
    WHERE s.estado = 'activo';

    DECLARE @auditorias_creadas INT;
    SELECT @auditorias_creadas = @@ROWCOUNT;

    PRINT '✅ Auditorías creadas: ' + CAST(@auditorias_creadas AS VARCHAR(10));
END
ELSE
BEGIN
    PRINT '✅ Ya existen auditorías: ' + CAST(@auditorias_existentes AS VARCHAR(10));
END
PRINT '';

-- 4. Verificar secciones técnicas
PRINT '📚 5. Verificando secciones técnicas...';
DECLARE @total_secciones INT;
SELECT @total_secciones = COUNT(*) FROM secciones_tecnicas WHERE activo = 1;

IF @total_secciones < 13
BEGIN
    PRINT '⚠️  Faltan secciones técnicas, creando las 13 secciones estándar...';

    -- Limpiar secciones existentes
    DELETE FROM secciones_tecnicas;

    -- Crear las 13 secciones técnicas
    INSERT INTO secciones_tecnicas (nombre, codigo, descripcion, orden, tipo_analisis, formatos_permitidos, activo, created_at, updated_at)
    VALUES
    ('Topología de Red', 'topologia', 'Diseño y distribución de la infraestructura de red', 1, 'tiempo_real', 'pdf,jpg,png', 1, GETDATE(), GETDATE()),
    ('Documentación y Controles', 'documentacion', 'Documentación necesaria para el control de la infraestructura', 2, 'tiempo_real', 'pdf,doc,docx', 1, GETDATE(), GETDATE()),
    ('Energía CT', 'energia', 'Sistema de energía del cuarto tecnológico', 3, 'tiempo_real', 'pdf,jpg,png', 1, GETDATE(), GETDATE()),
    ('Temperatura CT', 'temperatura', 'Control de temperatura del cuarto tecnológico', 4, 'tiempo_real', 'pdf,xlsx', 1, GETDATE(), GETDATE()),
    ('Servidores', 'servidores', 'Información técnica de servidores', 5, 'tiempo_real', 'pdf,xlsx', 1, GETDATE(), GETDATE()),
    ('Internet', 'internet', 'Conectividad y ancho de banda', 6, 'tiempo_real', 'pdf,xlsx', 1, GETDATE(), GETDATE()),
    ('Personal Capacitado', 'personal', 'Personal técnico en sitio', 7, 'tiempo_real', 'pdf', 1, GETDATE(), GETDATE()),
    ('Escalamiento', 'escalamiento', 'Contactos de escalamiento técnico', 8, 'tiempo_real', 'pdf,xlsx', 1, GETDATE(), GETDATE()),
    ('Cuarto de Tecnología', 'cuarto_tecnologia', 'Fotografías e inventario del Data Center', 9, 'batch', 'pdf,jpg,png', 1, GETDATE(), GETDATE()),
    ('Conectividad', 'conectividad', 'Certificación de cableado de datos', 10, 'batch', 'pdf,xlsx', 1, GETDATE(), GETDATE()),
    ('Hardware/Software', 'hardware_software', 'Parque informático presencial y teletrabajo', 11, 'batch', 'xlsx', 1, GETDATE(), GETDATE()),
    ('Seguridad de la Información', 'seguridad', 'Políticas y procedimientos de seguridad', 12, 'batch', 'pdf', 1, GETDATE(), GETDATE()),
    ('Entorno de la Información', 'entorno', 'Información del entorno tecnológico', 13, 'batch', 'pdf,xlsx', 1, GETDATE(), GETDATE());

    PRINT '✅ Secciones técnicas creadas: 13';
END
ELSE
BEGIN
    PRINT '✅ Secciones técnicas existentes: ' + CAST(@total_secciones AS VARCHAR(10));
END
PRINT '';

-- 5. Resumen final
PRINT '📊 RESUMEN FINAL:';
PRINT '============================================';

SELECT
    'Período Activo' as Concepto,
    nombre as Valor
FROM periodos_auditoria
WHERE activo = 1;

SELECT
    'Proveedores Activos' as Concepto,
    CAST(COUNT(*) AS VARCHAR(10)) as Valor
FROM proveedores
WHERE estado = 'activo';

SELECT
    'Sitios Activos' as Concepto,
    CAST(COUNT(*) AS VARCHAR(10)) as Valor
FROM sitios
WHERE estado = 'activo';

SELECT
    'Auditorías Creadas' as Concepto,
    CAST(COUNT(*) AS VARCHAR(10)) as Valor
FROM auditorias
WHERE periodo = @periodo_codigo;

SELECT
    'Secciones Técnicas' as Concepto,
    CAST(COUNT(*) AS VARCHAR(10)) as Valor
FROM secciones_tecnicas
WHERE activo = 1;

PRINT '============================================';
PRINT '';
PRINT '🎯 PASOS SIGUIENTES:';
PRINT '1. Inicia sesión como usuario proveedor:';
PRINT '   Email: proveedor@activo.com';
PRINT '   Pass: proveedor123';
PRINT '';
PRINT '2. Navega a http://localhost:3010/auditorias';
PRINT '';
PRINT '3. Deberías ver las auditorías asignadas para el período activo';
PRINT '';
PRINT '✅ PROCESO COMPLETADO EXITOSAMENTE';
GO
