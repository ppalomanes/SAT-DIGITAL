-- ===============================================
-- SAT-Digital - SQL Server Database Setup
-- ===============================================
-- Servidor: DWIN0293 (10.11.33.10)
-- Motor: SQL Server 2016
-- Base de Datos: sat_digital_v2
-- Usuario: calidad / passcalidad
--
-- INSTRUCCIONES:
-- 1. Abrir SQL Server Management Studio
-- 2. Conectarse a DWIN0293 (10.11.33.10)
-- 3. Ejecutar este script completo
-- ===============================================

USE [master];
GO

-- ===============================================
-- 1. CREAR BASE DE DATOS
-- ===============================================

PRINT '========================================';
PRINT 'Creando base de datos sat_digital_v2...';
PRINT '========================================';

-- Verificar si la base de datos ya existe
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'sat_digital_v2')
BEGIN
    PRINT 'ADVERTENCIA: La base de datos sat_digital_v2 ya existe.';
    PRINT 'Si desea recrearla, ejecute el siguiente comando manualmente:';
    PRINT 'DROP DATABASE sat_digital_v2;';
    PRINT '';
    PRINT 'Por ahora, continuamos con la base de datos existente...';
END
ELSE
BEGIN
    -- Crear base de datos
    CREATE DATABASE [sat_digital_v2]
    COLLATE Latin1_General_CI_AS;

    PRINT 'OK - Base de datos sat_digital_v2 creada exitosamente.';
END
GO

-- Configurar base de datos
ALTER DATABASE [sat_digital_v2] SET COMPATIBILITY_LEVEL = 130;
GO

ALTER DATABASE [sat_digital_v2] SET ANSI_NULL_DEFAULT OFF;
GO

ALTER DATABASE [sat_digital_v2] SET ANSI_NULLS OFF;
GO

ALTER DATABASE [sat_digital_v2] SET ANSI_PADDING OFF;
GO

ALTER DATABASE [sat_digital_v2] SET ANSI_WARNINGS OFF;
GO

ALTER DATABASE [sat_digital_v2] SET ARITHABORT OFF;
GO

ALTER DATABASE [sat_digital_v2] SET AUTO_CLOSE OFF;
GO

ALTER DATABASE [sat_digital_v2] SET AUTO_SHRINK OFF;
GO

ALTER DATABASE [sat_digital_v2] SET AUTO_CREATE_STATISTICS ON;
GO

ALTER DATABASE [sat_digital_v2] SET AUTO_UPDATE_STATISTICS ON;
GO

ALTER DATABASE [sat_digital_v2] SET RECOVERY FULL;
GO

PRINT '';
PRINT 'OK - Configuración de base de datos aplicada.';
PRINT '';

-- ===============================================
-- 2. CREAR LOGIN Y USUARIO
-- ===============================================

PRINT '========================================';
PRINT 'Creando login y usuario calidad...';
PRINT '========================================';

-- Verificar si el login ya existe
IF EXISTS (SELECT name FROM sys.server_principals WHERE name = N'calidad')
BEGIN
    PRINT 'ADVERTENCIA: El login calidad ya existe.';
    PRINT 'Si desea recrearlo, ejecute manualmente:';
    PRINT 'DROP LOGIN [calidad];';
    PRINT '';
END
ELSE
BEGIN
    -- Crear login
    CREATE LOGIN [calidad] WITH
        PASSWORD = N'passcalidad',
        DEFAULT_DATABASE = [sat_digital_v2],
        CHECK_EXPIRATION = OFF,
        CHECK_POLICY = OFF;

    PRINT 'OK - Login calidad creado exitosamente.';
END
GO

-- Usar la base de datos
USE [sat_digital_v2];
GO

-- Verificar si el usuario ya existe
IF EXISTS (SELECT name FROM sys.database_principals WHERE name = N'calidad')
BEGIN
    PRINT 'El usuario calidad ya existe en la base de datos.';
END
ELSE
BEGIN
    -- Crear usuario en la base de datos
    CREATE USER [calidad] FOR LOGIN [calidad];
    PRINT 'OK - Usuario calidad creado en la base de datos.';
END
GO

-- Asignar rol de db_owner al usuario
ALTER ROLE [db_owner] ADD MEMBER [calidad];
GO

PRINT 'OK - Rol db_owner asignado al usuario calidad.';
PRINT '';

-- ===============================================
-- 3. VERIFICACIÓN
-- ===============================================

PRINT '========================================';
PRINT 'Verificando configuración...';
PRINT '========================================';

-- Verificar base de datos
SELECT
    name AS 'Base de Datos',
    compatibility_level AS 'Nivel de Compatibilidad',
    collation_name AS 'Collation',
    state_desc AS 'Estado'
FROM sys.databases
WHERE name = 'sat_digital_v2';

PRINT '';
PRINT 'Verificando usuario y permisos...';

-- Verificar usuario y roles
SELECT
    dp.name AS 'Usuario',
    dp.type_desc AS 'Tipo',
    r.name AS 'Rol'
FROM sys.database_principals dp
LEFT JOIN sys.database_role_members drm ON dp.principal_id = drm.member_principal_id
LEFT JOIN sys.database_principals r ON drm.role_principal_id = r.principal_id
WHERE dp.name = 'calidad';

PRINT '';
PRINT '========================================';
PRINT 'CONFIGURACIÓN COMPLETADA';
PRINT '========================================';
PRINT '';
PRINT 'Resumen:';
PRINT '- Servidor: DWIN0293 (10.11.33.10)';
PRINT '- Base de Datos: sat_digital_v2';
PRINT '- Usuario: calidad';
PRINT '- Password: passcalidad';
PRINT '- Rol: db_owner';
PRINT '';
PRINT 'String de conexión para Node.js:';
PRINT 'Server=10.11.33.10;Database=sat_digital_v2;User Id=calidad;Password=passcalidad;Encrypt=false;TrustServerCertificate=true;';
PRINT '';
PRINT 'Próximos pasos:';
PRINT '1. Ejecutar migraciones de Sequelize desde el backend';
PRINT '2. Ejecutar seeders para datos iniciales';
PRINT '3. Verificar conectividad desde DWIN0540';
PRINT '';

-- ===============================================
-- 4. SCRIPT DE PRUEBA DE CONEXIÓN (Opcional)
-- ===============================================

PRINT '========================================';
PRINT 'Prueba de conexión (ejecutar como calidad)';
PRINT '========================================';

-- Crear una tabla de prueba
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'test_connection')
BEGIN
    CREATE TABLE test_connection (
        id INT IDENTITY(1,1) PRIMARY KEY,
        mensaje NVARCHAR(255),
        fecha_creacion DATETIME DEFAULT GETDATE()
    );

    INSERT INTO test_connection (mensaje)
    VALUES ('Conexión exitosa desde script de setup');

    PRINT 'OK - Tabla de prueba creada.';

    -- Leer la tabla de prueba
    SELECT * FROM test_connection;

    PRINT '';
    PRINT 'Puede eliminar la tabla de prueba ejecutando:';
    PRINT 'DROP TABLE test_connection;';
END
ELSE
BEGIN
    PRINT 'La tabla de prueba ya existe.';
    SELECT * FROM test_connection;
END

PRINT '';
PRINT '========================================';
PRINT 'FIN DEL SCRIPT';
PRINT '========================================';
GO

-- ===============================================
-- NOTAS ADICIONALES
-- ===============================================

/*
COMANDOS ÚTILES PARA ADMINISTRACIÓN:

1. Ver todas las bases de datos:
   SELECT name, database_id, create_date FROM sys.databases;

2. Ver todos los logins:
   SELECT name, type_desc, create_date FROM sys.server_principals WHERE type IN ('S', 'U');

3. Ver usuarios de una base de datos:
   USE sat_digital_v2;
   SELECT name, type_desc, create_date FROM sys.database_principals WHERE type = 'S';

4. Ver permisos de un usuario:
   USE sat_digital_v2;
   EXEC sp_helprotect NULL, 'calidad';

5. Backup de la base de datos:
   BACKUP DATABASE [sat_digital_v2]
   TO DISK = 'D:\Backups\sat_digital_v2.bak'
   WITH FORMAT, INIT, NAME = 'Full Backup of sat_digital_v2';

6. Restore de la base de datos:
   RESTORE DATABASE [sat_digital_v2]
   FROM DISK = 'D:\Backups\sat_digital_v2.bak'
   WITH REPLACE;

7. Ver tamaño de la base de datos:
   USE sat_digital_v2;
   EXEC sp_spaceused;

8. Ver tablas creadas por Sequelize:
   SELECT TABLE_NAME, TABLE_TYPE
   FROM INFORMATION_SCHEMA.TABLES
   WHERE TABLE_TYPE = 'BASE TABLE'
   ORDER BY TABLE_NAME;

9. Prueba de conectividad desde línea de comandos:
   sqlcmd -S 10.11.33.10 -U calidad -P passcalidad -d sat_digital_v2 -Q "SELECT @@VERSION"

10. String de conexión para testing:
    Server=10.11.33.10,1433;Database=sat_digital_v2;User Id=calidad;Password=passcalidad;Encrypt=false;TrustServerCertificate=true;
*/
