# 🏗️ Diseño de Arquitectura DAO Dual MySQL/SQL Server

## 📖 Resumen Ejecutivo

Este documento define la arquitectura de la capa DAO (Data Access Object) que permitirá al sistema SAT-Digital funcionar con **MySQL** (actual) y **SQL Server** (nuevo) sin modificar la lógica de negocio.

## 🎯 Objetivos

- ✅ **Retrocompatibilidad total** con MySQL existente
- ✅ **Integración transparente** de SQL Server
- ✅ **Zero-downtime migration** entre bases de datos
- ✅ **Configuración dinámica** via variables de entorno
- ✅ **Mantenimiento independiente** de cada implementación

## 🏛️ Arquitectura Propuesta

```
backend/src/shared/database/
├── dao/
│   ├── interfaces/           # Contratos comunes
│   │   ├── IBaseDAO.js
│   │   ├── IUsuarioDAO.js
│   │   ├── IProveedorDAO.js
│   │   ├── IAuditoriaDAO.js
│   │   └── ...
│   ├── mysql/               # Implementaciones MySQL
│   │   ├── MySQLBaseDAO.js
│   │   ├── MySQLUsuarioDAO.js
│   │   ├── MySQLProveedorDAO.js
│   │   └── ...
│   ├── sqlserver/           # Implementaciones SQL Server
│   │   ├── SQLServerBaseDAO.js
│   │   ├── SQLServerUsuarioDAO.js
│   │   ├── SQLServerProveedorDAO.js
│   │   └── ...
│   ├── factory/
│   │   └── DAOFactory.js    # Factory Pattern
│   └── config/
│       ├── MySQLConfig.js
│       └── SQLServerConfig.js
```

## 🔌 Interfaces Comunes

### IBaseDAO.js
```javascript
class IBaseDAO {
  async create(data) { throw new Error('Must implement create') }
  async findById(id) { throw new Error('Must implement findById') }
  async findAll(filters = {}) { throw new Error('Must implement findAll') }
  async update(id, data) { throw new Error('Must implement update') }
  async delete(id) { throw new Error('Must implement delete') }
  async count(filters = {}) { throw new Error('Must implement count') }
}
```

### Interfaces Específicas por Entidad
Cada entidad tendrá su interfaz específica heredando de `IBaseDAO`:
- `IUsuarioDAO` - Métodos específicos de usuarios
- `IProveedorDAO` - Métodos específicos de proveedores
- `IAuditoriaDAO` - Métodos específicos de auditorías
- etc.

## ⚙️ Factory Pattern

### DAOFactory.js
```javascript
class DAOFactory {
  static getInstance() {
    const dbType = process.env.DB_TYPE || 'mysql';

    switch(dbType) {
      case 'mysql':
        return new MySQLDAOFactory();
      case 'sqlserver':
        return new SQLServerDAOFactory();
      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }
}
```

## 🔧 Configuración Dual

### Variables de Entorno
```bash
# Tipo de base de datos
DB_TYPE=mysql  # o 'sqlserver'

# MySQL (actual)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=sat_digital_v2
MYSQL_USERNAME=root
MYSQL_PASSWORD=

# SQL Server (nuevo)
SQLSERVER_HOST=localhost
SQLSERVER_PORT=1433
SQLSERVER_DATABASE=sat_digital_v2
SQLSERVER_USERNAME=sa
SQLSERVER_PASSWORD=
```

## 🔄 Migración Estratégica

### Fase 1: Implementación Base
1. ✅ Crear interfaces comunes
2. ✅ Implementar MySQL DAO (wrapper de Sequelize actual)
3. ✅ Crear Factory Pattern
4. ✅ Testear retrocompatibilidad

### Fase 2: SQL Server
1. 🔄 Implementar SQL Server DAO
2. 🔄 Configurar conexiones duales
3. 🔄 Testing paralelo

### Fase 3: Migración de Servicios
1. 🔄 Migrar servicios uno por uno
2. 🔄 Testing A/B entre MySQL y SQL Server
3. 🔄 Switch transparente

## 📋 Beneficios

- **Flexibilidad**: Cambio de DB sin tocar lógica de negocio
- **Testabilidad**: Mocking fácil de DAOs para testing
- **Mantenibilidad**: Separación clara de responsabilidades
- **Escalabilidad**: Preparado para futuras bases de datos
- **Seguridad**: Rollback inmediato en caso de problemas

## 🚀 Próximos Pasos

1. Implementar interfaces base
2. Crear MySQL DAO wrapper
3. Configurar Factory Pattern
4. Testing de retrocompatibilidad
5. Implementar SQL Server DAO
6. Migración gradual de servicios

---
*Documento generado para la implementación de DAO dual en SAT-Digital*