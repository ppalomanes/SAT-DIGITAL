# 🛠️ Scripts de Utilidad - SAT-Digital Backend

**Última actualización:** 2025-10-18

---

## 📂 Estructura de Carpetas

```
backend/scripts/
├── multi-tenancy/    # Scripts de testing y gestión multi-tenancy
├── testing/          # Scripts de testing general
├── database/         # Scripts de creación y seeding de BD
└── README.md         # Este archivo
```

---

## 🏢 Multi-Tenancy Scripts

**Ubicación:** `backend/scripts/multi-tenancy/`

### **test-multi-tenancy.js** ⭐
**Propósito:** Testing exhaustivo de aislamiento multi-tenancy

**Ejecutar:**
```bash
cd backend
node scripts/multi-tenancy/test-multi-tenancy.js
```

**Tests incluidos:**
- ✅ Verificar usuarios por tenant
- ✅ Login y validación JWT con tenant_id
- ✅ Segregación de proveedores (1 por tenant)
- ✅ Segregación de sitios por tenant
- ✅ Detección de datos cross-tenant

**Output:** Reporte visual con colores indicando estado de cada test

---

### **verify-tenants.js**
**Propósito:** Verificación rápida de estructura multi-tenancy

**Ejecutar:**
```bash
node scripts/multi-tenancy/verify-tenants.js
```

**Muestra:**
- Tenants existentes
- Proveedores por tenant
- Sitios por tenant
- Resumen de cantidades

---

### **show-current-structure.js**
**Propósito:** Comparación detallada estructura ACTUAL vs ESPERADA

**Ejecutar:**
```bash
node scripts/multi-tenancy/show-current-structure.js
```

**Útil para:**
- Identificar proveedores extras
- Ver diferencias con modelo original
- Decidir entre mantener datos o limpiar

---

### **clean-to-original-model.js** ⚠️
**Propósito:** Limpiar base de datos al modelo original de 5 proveedores

**ADVERTENCIA:** Este script ELIMINA datos. Usar con precaución.

**Ejecutar:**
```bash
node scripts/multi-tenancy/clean-to-original-model.js
```

**Acciones:**
1. Elimina sitios de proveedores extras
2. Crea/corrige proveedor STRATTON en Tenant 4
3. Mueve sitios KONECTA al proveedor correcto
4. Elimina proveedores que no están en modelo original
5. Verifica estructura final

**Resultado:** 5 tenants, 5 proveedores, 11 sitios exactamente

---

### **fix-tenants-update-only.js**
**Propósito:** Actualizar tenant_id SIN eliminar datos

**Ejecutar:**
```bash
node scripts/multi-tenancy/fix-tenants-update-only.js
```

**Acciones:**
- Actualiza tenant_id de proveedores según CUIT
- Actualiza tenant_id de sitios según su proveedor
- Actualiza tenant_id de usuarios
- NO elimina ningún dato

---

### **fix-tenants-final.js** ⚠️
**Propósito:** Corrección COMPLETA con recreación (DESTRUCTIVO)

**ADVERTENCIA:** Elimina TODOS los proveedores y sitios para recrear desde cero.

**Solo usar si:**
- Base de datos está muy corrupta
- Necesitas reset total
- Tienes backup

---

## 🧪 Testing Scripts

**Ubicación:** `backend/scripts/testing/`

### **test-sqlserver-connection.js**
**Propósito:** Verificar conexión a SQL Server

**Ejecutar:**
```bash
node scripts/testing/test-sqlserver-connection.js
```

**Verifica:**
- Conectividad a SQL Server
- Credenciales correctas
- Base de datos accesible

---

### **test-sqlserver-auth.js**
**Propósito:** Testing de autenticación con SQL Server

**Ejecutar:**
```bash
node scripts/testing/test-sqlserver-auth.js
```

**Tests:**
- Login con usuarios de prueba
- Generación de JWT
- Validación de tokens

---

### **test-db-connection.js**
**Propósito:** Test genérico de conexión DB (MySQL/SQL Server)

**Ejecutar:**
```bash
node scripts/testing/test-db-connection.js
```

---

### **check-auditorias-assignment.js**
**Propósito:** Verificar asignaciones de auditorías a auditores

**Ejecutar:**
```bash
node scripts/testing/check-auditorias-assignment.js
```

**Muestra:**
- Auditorías asignadas
- Auditores disponibles
- Distribución de carga

---

### **check-sqlserver-users.js**
**Propósito:** Listar usuarios en SQL Server con sus roles

**Ejecutar:**
```bash
node scripts/testing/check-sqlserver-users.js
```

---

## 💾 Database Scripts

**Ubicación:** `backend/scripts/database/`

### **create-sqlserver-tables.js**
**Propósito:** Crear todas las tablas en SQL Server

**Ejecutar:**
```bash
node scripts/database/create-sqlserver-tables.js
```

**Crea:**
- Todas las tablas del sistema
- Constraints y foreign keys
- Índices

---

### **seed-sqlserver.js** ⭐
**Propósito:** Poblar base de datos con datos iniciales

**Ejecutar:**
```bash
node scripts/database/seed-sqlserver.js
```

**Datos creados:**
- 5 tenants
- 5 proveedores (1 por tenant)
- 11 sitios
- 6 usuarios (admin, auditores, proveedores)
- Secciones técnicas
- Período de auditoría activo
- Auditorías de ejemplo

---

### **create-periodo-activo.js**
**Propósito:** Crear período de auditoría activo

**Ejecutar:**
```bash
node scripts/database/create-periodo-activo.js
```

**Crea:**
- Período Mayo-Noviembre 2025
- Estado: Activo
- Fechas de inicio/fin

---

### **create-chat-tables.js**
**Propósito:** Crear tablas del sistema de chat

**Ejecutar:**
```bash
node scripts/database/create-chat-tables.js
```

**Tablas:**
- `conversaciones`
- `mensajes`
- `notificaciones_usuario`

---

### **create-auditorias-fixed.js**
**Propósito:** Crear auditorías con estructura correcta

**Ejecutar:**
```bash
node scripts/database/create-auditorias-fixed.js
```

---

### **fix-notifications-table.js**
**Propósito:** Corregir/crear tabla de notificaciones

**Ejecutar:**
```bash
node scripts/database/fix-notifications-table.js
```

---

## 📝 Convenciones de Uso

### **Antes de ejecutar scripts:**

1. **Verificar variables de entorno:**
```bash
# Revisar .env.local
DB_TYPE=sqlserver
SQLSERVER_HOST=dwin0293
SQLSERVER_PORT=1433
SQLSERVER_DATABASE=sat_digital_v2
SQLSERVER_USERNAME=calidad
SQLSERVER_PASSWORD=passcalidad
```

2. **Hacer backup (especialmente con scripts destructivos):**
```bash
# Backup SQL Server (ejecutar en SQL Server Management Studio)
BACKUP DATABASE sat_digital_v2
TO DISK = 'C:\Backups\sat_digital_v2_backup.bak'
```

3. **Ejecutar desde raíz de backend:**
```bash
cd backend
node scripts/[categoria]/[script].js
```

---

## ⚠️ Scripts Destructivos (Usar con Precaución)

| Script | Acción | Backup Recomendado |
|--------|--------|-------------------|
| `clean-to-original-model.js` | Elimina proveedores extras | ✅ OBLIGATORIO |
| `fix-tenants-final.js` | Elimina TODOS los proveedores/sitios | ✅ OBLIGATORIO |
| `create-sqlserver-tables.js` | Puede sobrescribir tablas | ✅ Recomendado |

---

## 🔄 Workflows Comunes

### **Setup Inicial de Base de Datos**
```bash
# 1. Crear tablas
node scripts/database/create-sqlserver-tables.js

# 2. Poblar datos iniciales
node scripts/database/seed-sqlserver.js

# 3. Verificar multi-tenancy
node scripts/multi-tenancy/test-multi-tenancy.js
```

### **Verificar Estado Actual**
```bash
# Ver estructura
node scripts/multi-tenancy/show-current-structure.js

# Verificar tenants
node scripts/multi-tenancy/verify-tenants.js

# Testing completo
node scripts/multi-tenancy/test-multi-tenancy.js
```

### **Corregir Problemas Multi-Tenancy**
```bash
# Opción 1: Solo actualizar tenant_id (seguro)
node scripts/multi-tenancy/fix-tenants-update-only.js

# Opción 2: Limpiar a modelo original (elimina extras)
node scripts/multi-tenancy/clean-to-original-model.js

# Verificar resultado
node scripts/multi-tenancy/test-multi-tenancy.js
```

---

## 📊 Output de Scripts

Todos los scripts usan logging con colores:
- 🟢 **Verde:** Operaciones exitosas
- 🔴 **Rojo:** Errores
- 🟡 **Amarillo:** Advertencias
- 🔵 **Azul:** Información

---

## 🆘 Troubleshooting

### **Error: Cannot connect to SQL Server**
```bash
# Verificar conexión
node scripts/testing/test-sqlserver-connection.js

# Revisar variables de entorno
cat .env.local
```

### **Error: Table already exists**
```bash
# Hacer backup y eliminar tablas manualmente
# O agregar DROP TABLE IF EXISTS en script
```

### **Tenants inconsistentes después de fix**
```bash
# Verificar primero
node scripts/multi-tenancy/show-current-structure.js

# Limpiar a modelo original
node scripts/multi-tenancy/clean-to-original-model.js
```

---

## 📞 Soporte

- **Documentación:** `/documentacion/00-INDICE.md`
- **Testing Multi-Tenancy:** `/documentacion/TESTING-MULTI-TENANCY.md`
- **Logs:** `/backend/logs/`

---

**Generado:** 2025-10-18
**Versión:** 1.0.0
