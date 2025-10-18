-- Script para inicializar datos de auditorías en SQL Server (CORREGIDO v2)
-- Ejecutar en SQL Server Management Studio

USE sat_digital_v2;
GO

PRINT '🚀 Iniciando creación de datos de auditorías...';
PRINT '';

-- 1. Verificar y crear período activo
PRINT '📅 1. Verificando período activo...';

-- Verificar si existe un período activo (estado = 'activo')
DECLARE @periodo_existe INT;
DECLARE @periodo_id INT;
DECLARE @periodo_codigo VARCHAR(20);

SELECT
    @periodo_existe = COUNT(*),
    @periodo_id = MAX(id),
    @periodo_codigo = MAX(codigo)
FROM periodos_auditoria
WHERE estado = 'activo';

IF @periodo_existe = 0
BEGIN
    PRINT '⚠️  No hay período activo, creando uno...';

    -- Crear período Mayo-Noviembre 2025
    INSERT INTO periodos_auditoria
    (nombre, codigo, fecha_inicio, fecha_limite_carga, fecha_inicio_visitas, fecha_fin_visitas, estado, configuracion_especial, created_by, created_at, updated_at)
    VALUES
    ('Mayo-Noviembre 2025', '2025-2S', '2025-05-01', '2025-06-15', '2025-07-01', '2025-11-30', 'activo', NULL, 1, GETDATE(), GETDATE());

    -- Obtener el ID y código del período creado
    SELECT
        @periodo_id = id,
        @periodo_codigo = codigo
    FROM periodos_auditoria
    WHERE codigo = '2025-2S';

    PRINT '✅ Período activo creado: Mayo-Noviembre 2025 (Código: ' + @periodo_codigo + ')';
END
ELSE
BEGIN
    PRINT '✅ Ya existe un período activo: ' + @periodo_codigo;
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

DECLARE @auditorias_existentes INT;
SELECT @auditorias_existentes = COUNT(*) FROM auditorias WHERE periodo = @periodo_codigo;

IF @auditorias_existentes = 0
BEGIN
    PRINT '⚠️  No hay auditorías, creando para todos los sitios activos...';

    -- Crear auditoría para cada sitio activo
    INSERT INTO auditorias
    (sitio_id, periodo, fecha_inicio, fecha_limite_carga, fecha_visita_programada, fecha_visita_realizada, auditor_asignado_id, estado, puntaje_final, observaciones_generales, created_at, updated_at)
    SELECT
        s.id,
        @periodo_codigo,
        '2025-05-01',
        '2025-06-15',
        '2025-07-15',
        NULL,
        NULL,
        'en_carga',
        NULL,
        NULL,
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
SELECT @total_secciones = COUNT(*) FROM secciones_tecnicas WHERE estado = 'activa';

IF @total_secciones < 13
BEGIN
    PRINT '⚠️  Faltan secciones técnicas, creando las 13 secciones estándar...';

    -- Limpiar secciones existentes
    DELETE FROM secciones_tecnicas;

    -- Crear las 13 secciones técnicas (SIN created_at/updated_at porque timestamps: false)
    INSERT INTO secciones_tecnicas (codigo, nombre, descripcion, tipo_analisis, obligatoria, orden_presentacion, estado)
    VALUES
    ('topologia', 'Topología de Red', 'Diseño y distribución de la infraestructura de red', 'tiempo_real', 1, 1, 'activa'),
    ('documentacion', 'Documentación y Controles', 'Documentación necesaria para el control de la infraestructura', 'tiempo_real', 1, 2, 'activa'),
    ('energia', 'Energía CT', 'Sistema de energía del cuarto tecnológico', 'tiempo_real', 1, 3, 'activa'),
    ('temperatura', 'Temperatura CT', 'Control de temperatura del cuarto tecnológico', 'tiempo_real', 1, 4, 'activa'),
    ('servidores', 'Servidores', 'Información técnica de servidores', 'tiempo_real', 1, 5, 'activa'),
    ('internet', 'Internet', 'Conectividad y ancho de banda', 'tiempo_real', 1, 6, 'activa'),
    ('personal', 'Personal Capacitado', 'Personal técnico en sitio', 'tiempo_real', 1, 7, 'activa'),
    ('escalamiento', 'Escalamiento', 'Contactos de escalamiento técnico', 'tiempo_real', 1, 8, 'activa'),
    ('cuarto_tecnologia', 'Cuarto de Tecnología', 'Fotografías e inventario del Data Center', 'lotes', 1, 9, 'activa'),
    ('conectividad', 'Conectividad', 'Certificación de cableado de datos', 'lotes', 1, 10, 'activa'),
    ('hardware_software', 'Hardware/Software', 'Parque informático presencial y teletrabajo', 'lotes', 1, 11, 'activa'),
    ('seguridad', 'Seguridad de la Información', 'Políticas y procedimientos de seguridad', 'lotes', 1, 12, 'activa'),
    ('entorno', 'Entorno de la Información', 'Información del entorno tecnológico', 'lotes', 1, 13, 'activa');

    SELECT @total_secciones = COUNT(*) FROM secciones_tecnicas WHERE estado = 'activa';
    PRINT '✅ Secciones técnicas creadas: ' + CAST(@total_secciones AS VARCHAR(10));
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
WHERE estado = 'activo';

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
WHERE estado = 'activa';

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
