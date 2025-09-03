/**
 * Actualización del modelo Usuario para incluir roles específicos según PDFs
 * Migración para actualizar ENUM de roles
 */

-- SAT-Digital - Actualización de roles de usuario
-- Checkpoint 1.3: Sistema de Autenticación

-- 1. Actualizar tabla usuarios para nuevos roles específicos
ALTER TABLE usuarios 
MODIFY COLUMN rol ENUM(
  'admin', 
  'auditor_general', 
  'auditor_interno', 
  'jefe_proveedor', 
  'tecnico_proveedor', 
  'visualizador'
) NOT NULL;

-- 2. Actualizar usuarios existentes con los nuevos roles
-- Mapear roles genéricos a roles específicos

-- Auditor genérico -> Auditor General (asumiendo que los actuales son generales)
UPDATE usuarios 
SET rol = 'auditor_general' 
WHERE rol = 'auditor';

-- Proveedor genérico -> Jefe Proveedor (asumiendo que los actuales son jefes)
UPDATE usuarios 
SET rol = 'jefe_proveedor' 
WHERE rol = 'proveedor';

-- 3. Verificar que todos los usuarios tienen roles válidos
SELECT email, rol, nombre, proveedor_id 
FROM usuarios 
ORDER BY rol;

-- 4. Crear índices para optimizar consultas por rol
CREATE INDEX idx_usuarios_rol_proveedor ON usuarios(rol, proveedor_id);
CREATE INDEX idx_usuarios_estado_rol ON usuarios(estado, rol);
