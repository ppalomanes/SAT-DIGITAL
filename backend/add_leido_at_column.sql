-- Agregar columna leido_at a tabla mensajes
-- Fix para error: Unknown column 'leido_at' in 'field list'

USE sat_digital;

ALTER TABLE mensajes 
ADD COLUMN leido_at DATETIME NULL AFTER estado_mensaje;

-- Verificar que se agregó correctamente
DESCRIBE mensajes;