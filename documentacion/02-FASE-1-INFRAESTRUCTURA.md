# SAT-Digital: Fase 1 - Infraestructura Base
## 🏗️ DOCUMENTACIÓN DETALLADA DE DESARROLLO

> **Fase:** 1 de 4  
> **Duración estimada:** 2-3 meses  
> **Estado:** ⏳ Pendiente de inicio  
> **Archivo anterior:** 01-DOCUMENTO-MAESTRO.md  
> **Próximo archivo:** 03-FASE-2-GESTION-AUDITORIAS.md

---

## 🎯 OBJETIVOS DE LA FASE 1

Esta fase establece los cimientos técnicos del sistema SAT-Digital. Al finalizar, tendremos una aplicación web funcional con autenticación, roles básicos, estructura de base de datos completa, y la interfaz de administrador operativa.

### **Objetivos Específicos:**
1. **Configuración completa del entorno de desarrollo** con todas las herramientas necesarias
2. **Estructura de proyecto organizada** siguiendo metodología de separación por dominios
3. **Base de datos MySQL inicializada** con todas las tablas y relaciones
4. **Sistema de autenticación JWT funcional** con roles y permisos
5. **Interfaz de administrador básica** para gestión de usuarios, proveedores y sitios
6. **API RESTful base** con endpoints principales documentados
7. **Testing framework configurado** para garantizar calidad del código

---

## 📋 CHECKPOINTS DE LA FASE 1

### **Checkpoint 1.1: Configuración del Entorno (Semana 1-2)**
**Criterios de éxito:**
- [ ] XAMPP instalado y funcionando correctamente
- [ ] Node.js 18+ instalado con npm/yarn
- [ ] Estructura de carpetas creada según especificaciones
- [ ] Repositorio Git inicializado con .gitignore apropiado
- [ ] MySQL funcionando con base de datos `sat_digital` creada
- [ ] Todas las librerías principales instaladas y funcionando

**Entregables:**
- Entorno de desarrollo completamente funcional
- Documentación de setup para nuevos desarrolladores
- Scripts de inicialización automatizados

### **Checkpoint 1.2: Estructura de Base de Datos (Semana 2-3)**
**Criterios de éxito:**
- [ ] Todas las tablas principales creadas con relaciones correctas
- [ ] Índices optimizados para consultas frecuentes
- [ ] Sistema de versionado de esquema implementado (migrations)
- [ ] Datos de prueba (seeders) cargados correctamente
- [ ] Backup automático configurado y probado

**Entregables:**
- Schema completo de base de datos documentado
- Scripts SQL de creación y población
- Documentación de estructura de datos

### **Checkpoint 1.3: Sistema de Autenticación (Semana 3-5)**
**Criterios de éxito:**
- [ ] Registro y login de usuarios funcional
- [ ] JWT tokens con refresh tokens implementados
- [ ] Sistema RBAC (Role-Based Access Control) operativo
- [ ] Middleware de autorización funcionando correctamente
- [ ] Hash de passwords con bcrypt implementado
- [ ] Endpoints de autenticación completamente probados

**Entregables:**
- API de autenticación completa y documentada
- Tests automatizados de seguridad
- Documentación de roles y permisos

### **Checkpoint 1.4: API Base y Frontend (Semana 5-8)**
**Criterios de éxito:**
- [ ] Endpoints principales de la API implementados y documentados
- [ ] Frontend React configurado con routing básico
- [ ] Sistema de estado global (Zustand) configurado
- [ ] Componentes UI base implementados con Tailwind/Material-UI
- [ ] Integración frontend-backend funcionando correctamente
- [ ] Validaciones con Zod implementadas tanto en frontend como backend

**Entregables:**
- API documentada con Swagger/OpenAPI
- Interfaz de administrador básica funcional
- Sistema de componentes reutilizables

### **Checkpoint 1.5: Testing y Calidad (Semana 8-10)**
**Criterios de éxito:**
- [ ] Framework de testing configurado (Jest, Vitest)
- [ ] Tests unitarios para funciones críticas
- [ ] Tests de integración para API
- [ ] Linting y formateo automático configurado
- [ ] Coverage de código > 70% en funciones críticas
- [ ] CI/CD básico configurado

**Entregables:**
- Suite de tests automatizados
- Documentación de estándares de código
- Pipeline de integración continua

---

## 🗂️ ESTRUCTURA COMPLETA DEL PROYECTO

```
SAT-Digital/
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── 📁 domains/
│   │   │   ├── 📁 auth/
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   ├── models/
│   │   │   │   ├── routes/
│   │   │   │   └── validators/
│   │   │   ├── 📁 users/
│   │   │   ├── 📁 audits/
│   │   │   ├── 📁 documents/
│   │   │   ├── 📁 providers/
│   │   │   └── 📁 reports/
│   │   ├── 📁 shared/
│   │   │   ├── 📁 middleware/
│   │   │   ├── 📁 utils/
│   │   │   ├── 📁 config/
│   │   │   └── 📁 database/
│   │   └── app.js
│   ├── 📁 tests/
│   ├── 📁 migrations/
│   ├── 📁 seeders/
│   ├── package.json
│   └── .env.example
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 domains/
│   │   │   ├── 📁 auth/
│   │   │   ├── 📁 dashboard/
│   │   │   ├── 📁 audits/
│   │   │   ├── 📁 documents/
│   │   │   └── 📁 reports/
│   │   ├── 📁 shared/
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 hooks/
│   │   │   ├── 📁 store/
│   │   │   ├── 📁 utils/
│   │   │   └── 📁 styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── 📁 public/
│   ├── package.json
│   └── vite.config.js
├── 📁 documentacion/
├── 📁 docs/
├── README.md
└── docker-compose.yml (opcional)
```

---

## 🛠️ CONFIGURACIÓN DEL ENTORNO DE DESARROLLO

### **Paso 1: Preparación del Sistema**

**Verificar XAMPP:**
```bash
# Asegurarse de que XAMPP está funcionando
# Apache en puerto 80
# MySQL en puerto 3306
# phpMyAdmin accesible en http://localhost/phpmyadmin
```

**Verificar Node.js:**
```bash
node --version  # Debe ser 18.0.0 o superior
npm --version   # Debe ser 8.0.0 o superior
```

### **Paso 2: Inicialización del Backend**

**Crear estructura base:**
```bash
cd C:\xampp\htdocs\SAT-Digital\backend
npm init -y
```

**Instalar dependencias principales:**
```bash
# Dependencias de producción
npm install express cors helmet morgan compression
npm install sequelize mysql2 bcryptjs jsonwebtoken
npm install zod express-validator multer
npm install winston nodemailer bull
npm install dotenv express-rate-limit

# Dependencias de desarrollo
npm install --save-dev nodemon jest supertest
npm install --save-dev eslint prettier eslint-config-prettier
npm install --save-dev @babel/preset-env babel-jest
```

**Configurar package.json:**
```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "migrate": "sequelize-cli db:migrate",
    "seed": "sequelize-cli db:seed:all",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  }
}
```

### **Paso 3: Inicialización del Frontend**

**Crear aplicación React:**
```bash
cd C:\xampp\htdocs\SAT-Digital\frontend
npm create vite@latest . -- --template react
```

**Instalar librerías específicas del proyecto:**
```bash
# Estado y utilidades
npm install zustand zod day.js

# UI y componentes
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @fontsource/roboto
npm install @tanstack/react-table

# Navegación y formularios
npm install react-router-dom react-hook-form
npm install @hookform/resolvers

# Animaciones y interacciones
npm install framer-motion @formkit/drag-and-drop
npm install hotkeys-js

# Gráficos y visualizaciones
npm install chart.js react-chartjs-2

# HTTP y comunicación
npm install axios socket.io-client

# Desarrollo
npm install --save-dev @vitejs/plugin-react
npm install --save-dev eslint prettier tailwindcss
```

---

## 🗃️ DISEÑO DE BASE DE DATOS

### **Tablas Principales (Checkpoint 1.2)**

**Tabla: usuarios**
```sql
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'auditor', 'proveedor', 'visualizador') NOT NULL,
  proveedor_id INT NULL,
  estado ENUM('activo', 'inactivo', 'bloqueado') DEFAULT 'activo',
  ultimo_acceso TIMESTAMP NULL,
  intentos_fallidos INT DEFAULT 0,
  token_refresh VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);
```

**Tabla: proveedores**
```sql
CREATE TABLE proveedores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  razon_social VARCHAR(255) NOT NULL,
  cuit VARCHAR(13) NOT NULL UNIQUE,
  nombre_comercial VARCHAR(255),
  contacto_principal VARCHAR(255),
  email_contacto VARCHAR(255),
  telefono VARCHAR(50),
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Tabla: sitios**
```sql
CREATE TABLE sitios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  proveedor_id INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  localidad VARCHAR(255) NOT NULL,
  domicilio VARCHAR(500),
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);
```

**Tabla: auditorias**
```sql
CREATE TABLE auditorias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sitio_id INT NOT NULL,
  periodo VARCHAR(20) NOT NULL, -- "2025-05" o "2025-11"
  fecha_inicio DATE NOT NULL,
  fecha_limite_carga DATE NOT NULL,
  fecha_visita_programada DATE,
  fecha_visita_realizada DATE NULL,
  auditor_asignado_id INT,
  estado ENUM('programada', 'en_carga', 'pendiente_evaluacion', 'evaluada', 'cerrada') DEFAULT 'programada',
  puntaje_final DECIMAL(5,2) NULL,
  observaciones_generales TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sitio_id) REFERENCES sitios(id),
  FOREIGN KEY (auditor_asignado_id) REFERENCES usuarios(id),
  UNIQUE KEY unique_auditoria (sitio_id, periodo)
);
```

### **Tablas de Soporte**

**Tabla: secciones_tecnicas**
```sql
CREATE TABLE secciones_tecnicas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo_analisis ENUM('tiempo_real', 'lotes') NOT NULL,
  obligatoria BOOLEAN DEFAULT FALSE,
  orden_presentacion INT NOT NULL,
  estado ENUM('activa', 'inactiva') DEFAULT 'activa'
);
```

**Tabla: documentos**
```sql
CREATE TABLE documentos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  auditoria_id INT NOT NULL,
  seccion_id INT NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  nombre_original VARCHAR(255) NOT NULL,
  tipo_archivo VARCHAR(10) NOT NULL,
  tamaño_bytes BIGINT NOT NULL,
  ruta_almacenamiento VARCHAR(500) NOT NULL,
  hash_archivo VARCHAR(64) NOT NULL,
  version INT DEFAULT 1,
  fecha_ultima_revision DATE,
  observaciones_carga TEXT,
  usuario_carga_id INT NOT NULL,
  estado_analisis ENUM('pendiente', 'procesando', 'completado', 'error') DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (auditoria_id) REFERENCES auditorias(id),
  FOREIGN KEY (seccion_id) REFERENCES secciones_tecnicas(id),
  FOREIGN KEY (usuario_carga_id) REFERENCES usuarios(id)
);
```

**Tabla: bitacora (Sistema de auditoría)**
```sql
CREATE TABLE bitacora (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT,
  accion VARCHAR(100) NOT NULL,
  entidad_tipo VARCHAR(50) NOT NULL,
  entidad_id INT,
  descripcion TEXT NOT NULL,
  datos_antes JSON NULL,
  datos_despues JSON NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_usuario_fecha (usuario_id, timestamp),
  INDEX idx_entidad (entidad_tipo, entidad_id),
  INDEX idx_fecha (timestamp)
);
```

### **Índices Optimizados**
```sql
-- Índices para consultas frecuentes
CREATE INDEX idx_auditorias_periodo ON auditorias(periodo);
CREATE INDEX idx_auditorias_estado ON auditorias(estado);
CREATE INDEX idx_documentos_auditoria ON documentos(auditoria_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- Índices compuestos para reportes
CREATE INDEX idx_auditorias_sitio_periodo ON auditorias(sitio_id, periodo);
CREATE INDEX idx_documentos_estado_analisis ON documentos(estado_analisis, created_at);
```

---

## 🔐 SISTEMA DE AUTENTICACIÓN (Checkpoint 1.3)

### **Estructura del JWT**
```javascript
// Payload del JWT
{
  "id": 123,
  "email": "usuario@ejemplo.com",
  "rol": "auditor",
  "proveedor_id": 5, // null para admin/auditor/visualizador
  "permisos": ["read_audits", "write_documents"],
  "iat": 1693123456,
  "exp": 1693127056
}
```

### **Middleware de Autorización**
```javascript
// backend/src/shared/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const { Usuario } = require('../database/models');

const verificarToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Acceso denegado. Token requerido.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id);
    
    if (!usuario || usuario.estado !== 'activo') {
      return res.status(401).json({ 
        error: 'Token inválido o usuario inactivo.' 
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Token inválido.' 
    });
  }
};

const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        error: 'Permisos insuficientes para esta operación.' 
      });
    }
    next();
  };
};

module.exports = { verificarToken, verificarRol };
```

### **Controlador de Autenticación**
```javascript
// backend/src/domains/auth/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../../../shared/database/models');
const { registrarBitacora } = require('../../../shared/utils/bitacora.util');

class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      const usuario = await Usuario.findOne({ 
        where: { email, estado: 'activo' } 
      });
      
      if (!usuario) {
        await registrarBitacora(null, 'LOGIN_FALLIDO', 'Usuario', null, 
          `Intento de login con email inexistente: ${email}`, req);
        return res.status(401).json({ 
          error: 'Credenciales inválidas.' 
        });
      }

      const passwordValido = await bcrypt.compare(password, usuario.password_hash);
      
      if (!passwordValido) {
        // Incrementar intentos fallidos
        await usuario.increment('intentos_fallidos');
        await registrarBitacora(usuario.id, 'LOGIN_FALLIDO', 'Usuario', usuario.id, 
          'Password incorrecto', req);
        
        return res.status(401).json({ 
          error: 'Credenciales inválidas.' 
        });
      }

      // Reset intentos fallidos en login exitoso
      await usuario.update({ 
        intentos_fallidos: 0, 
        ultimo_acceso: new Date() 
      });

      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email, 
          rol: usuario.rol,
          proveedor_id: usuario.proveedor_id 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        { id: usuario.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      await usuario.update({ token_refresh: refreshToken });
      
      await registrarBitacora(usuario.id, 'LOGIN_EXITOSO', 'Usuario', usuario.id, 
        'Login exitoso', req);

      res.json({
        token,
        refreshToken,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol,
          proveedor_id: usuario.proveedor_id
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor.' 
      });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({ 
          error: 'Refresh token requerido.' 
        });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const usuario = await Usuario.findOne({
        where: { 
          id: decoded.id, 
          token_refresh: refreshToken,
          estado: 'activo' 
        }
      });

      if (!usuario) {
        return res.status(401).json({ 
          error: 'Refresh token inválido.' 
        });
      }

      const nuevoToken = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email, 
          rol: usuario.rol,
          proveedor_id: usuario.proveedor_id 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ token: nuevoToken });

    } catch (error) {
      console.error('Error en refresh token:', error);
      res.status(401).json({ 
        error: 'Refresh token inválido.' 
      });
    }
  }
}

module.exports = AuthController;
```

---

## 📱 INTERFAZ DE ADMINISTRADOR BÁSICA

### **Componentes Principales del Frontend**

**Layout Principal:**
```jsx
// frontend/src/shared/components/Layout/AdminLayout.jsx
import { useState } from 'react';
import { AppBar, Drawer, Toolbar, Typography, Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';

const DRAWER_WIDTH = 280;

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            SAT-Digital - Sistema de Auditorías Técnicas
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <UserMenu />
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          <Sidebar />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          <Sidebar />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` }
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default AdminLayout;
```

**Dashboard Principal:**
```jsx
// frontend/src/domains/dashboard/pages/AdminDashboard.jsx
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { 
  PeopleIcon, 
  BusinessIcon, 
  AssignmentIcon, 
  TrendingUpIcon 
} from '@mui/icons-material';

function AdminDashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Panel de Administración
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Usuarios Activos
                  </Typography>
                  <Typography variant="h5">
                    {/* Dato dinámico */}
                    12
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <BusinessIcon color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Proveedores
                  </Typography>
                  <Typography variant="h5">
                    5
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Auditorías Activas
                  </Typography>
                  <Typography variant="h5">
                    8
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Cumplimiento Promedio
                  </Typography>
                  <Typography variant="h5">
                    87%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminDashboard;
```

---

## 🧪 CONFIGURACIÓN DE TESTING (Checkpoint 1.5)

### **Jest Configuration (Backend)**
```javascript
// backend/jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/database/migrations/**',
    '!src/database/seeders/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

### **Test Suite Ejemplo**
```javascript
// backend/tests/auth/auth.test.js
const request = require('supertest');
const app = require('../../src/app');
const { Usuario } = require('../../src/shared/database/models');

describe('Autenticación', () => {
  beforeEach(async () => {
    await Usuario.destroy({ where: {}, force: true });
  });

  describe('POST /api/auth/login', () => {
    it('debe permitir login con credenciales válidas', async () => {
      // Crear usuario de prueba
      await Usuario.create({
        email: 'test@ejemplo.com',
        password_hash: await bcrypt.hash('password123', 10),
        nombre: 'Usuario Prueba',
        rol: 'admin'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@ejemplo.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('usuario');
      expect(response.body.usuario.email).toBe('test@ejemplo.com');
    });

    it('debe rechazar login con credenciales inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inexistente@ejemplo.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
```

---

## ✅ CRITERIOS DE ACEPTACIÓN DE LA FASE 1

### **Funcionalidad Mínima Requerida:**
1. **Usuario administrador puede:**
   - Hacer login y logout correctamente
   - Crear, editar y desactivar usuarios
   - Gestionar proveedores y sus sitios
   - Visualizar dashboard con métricas básicas
   - Acceder a logs del sistema

2. **Sistema debe:**
   - Validar todas las entradas con Zod
   - Registrar todas las acciones en bitácora
   - Manejar errores de manera consistente
   - Responder en menos de 500ms para operaciones básicas
   - Mantener sessions de usuario de manera segura

3. **Base de datos debe:**
   - Mantener integridad referencial
   - Realizar backups automáticos diarios
   - Soportar al menos 1000 usuarios concurrentes
   - Ejecutar todas las consultas con índices optimizados

### **Calidad de Código:**
- Cobertura de tests > 70% para funciones críticas
- Cero errores de linting
- Documentación completa de API con ejemplos
- Tiempo de respuesta promedio < 200ms
- Código organizado según estándares definidos

---

## ⚡ SCRIPTS DE AUTOMATIZACIÓN

### **Script de Setup Completo**
```bash
# setup.sh (o setup.bat para Windows)
#!/bin/bash

echo "🚀 Configurando SAT-Digital - Fase 1..."

# Verificar dependencias del sistema
echo "📋 Verificando dependencias..."
node --version || { echo "❌ Node.js no instalado"; exit 1; }
mysql --version || { echo "❌ MySQL no disponible"; exit 1; }

# Configurar backend
echo "🔧 Configurando backend..."
cd backend
npm install
cp .env.example .env
npm run migrate
npm run seed

# Configurar frontend  
echo "🎨 Configurando frontend..."
cd ../frontend
npm install

# Ejecutar tests
echo "🧪 Ejecutando tests..."
cd ../backend
npm test

echo "✅ Setup de Fase 1 completado!"
echo "🌐 Ejecutar 'npm run dev' en backend y frontend para iniciar"
```

---

## ➡️ FINALIZACIÓN DE FASE 1

### **Checklist Final:**
- [ ] Todos los checkpoints 1.1 a 1.5 completados
- [ ] Tests automatizados funcionando
- [ ] Documentación actualizada
- [ ] Demo funcional preparada
- [ ] Métricas de performance validadas
- [ ] Código revisado y aprobado

### **Entregables Finales:**
1. **Aplicación funcional** con login y gestión básica
2. **Base de datos** completamente configurada
3. **Suite de tests** con cobertura adecuada
4. **Documentación técnica** actualizada
5. **Scripts de deployment** automático

### **Próximo Paso:**
Una vez completada exitosamente la Fase 1, proceder con:
📄 **Archivo:** `03-FASE-2-GESTION-AUDITORIAS.md`

### **Criterio de Continuidad:**
La Fase 1 se considera completa cuando:
- Un administrador puede hacer login, gestionar usuarios, proveedores y sitios
- Todos los tests pasan correctamente
- El sistema está listo para implementar el flujo de auditorías

---

> 📌 **RECORDATORIO:** Esta fase establece los cimientos. No avanzar a la Fase 2 hasta que todos los checkpoints estén completados y validados.