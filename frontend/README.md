# SAT-Digital Frontend

Frontend desarrollado en React 18 para el Sistema de Auditorías Técnicas Digitalizado.

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 18+
- npm o yarn
- Backend SAT-Digital ejecutándose en puerto 3001

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:3000
```

### Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_NAME=SAT-Digital
VITE_APP_VERSION=1.0.0
```

## 🏗️ Arquitectura

### Estructura de Carpetas

```
src/
├── domains/              # Organización por dominio de negocio
│   ├── auth/             # Autenticación
│   ├── dashboard/        # Dashboard principal
│   ├── usuarios/         # Gestión de usuarios
│   └── proveedores/      # Gestión de proveedores
├── shared/               # Código compartido
│   ├── components/       # Componentes reutilizables
│   ├── store/           # Stores de Zustand
│   ├── utils/           # Utilidades
│   └── styles/          # Estilos y tema
└── main.jsx             # Punto de entrada
```

### Tecnologías Principales

- **React 18** - Framework frontend
- **Vite** - Build tool y dev server
- **Material-UI** - Biblioteca de componentes
- **Zustand** - Gestión de estado
- **React Router** - Routing
- **Axios** - Cliente HTTP
- **Zod** - Validación de esquemas
- **Framer Motion** - Animaciones

## 👥 Roles y Permisos

### Administrador
- Gestión completa de usuarios
- Gestión de proveedores y sitios
- Supervisión de auditorías
- Acceso a todas las funcionalidades

### Auditor General/Interno
- Planificación de auditorías
- Evaluación de documentos
- Generación de reportes
- Comunicación con proveedores

### Jefe/Técnico Proveedor
- Carga de documentación
- Chat con auditores
- Seguimiento de auditorías propias
- Acceso limitado a sus sitios

## 🔐 Autenticación

El sistema usa JWT tokens con refresh tokens automáticos:

```javascript
// Usuarios de prueba (desarrollo)
admin@satdigital.com / admin123     (Administrador)
auditor@satdigital.com / auditor123 (Auditor General)
proveedor@activo.com / proveedor123 (Jefe Proveedor)
```

## 🎨 Sistema de Diseño

### Metodología BEM

```css
/* Bloque */
.dashboard {}

/* Elemento */
.dashboard__header {}
.dashboard__content {}

/* Modificador */
.dashboard--loading {}
.dashboard__header--collapsed {}
```

### Tema Material-UI

Configuración personalizada en `src/shared/styles/theme.js`:

- Colores primarios: Azul (#1976d2)
- Colores secundarios: Rojo (#dc004e)
- Tipografía: Roboto
- Componentes customizados

## 📡 Integración con Backend

### Cliente Axios

```javascript
// Configuración automática con interceptors
// - Token JWT automático
// - Refresh token automático
// - Manejo de errores
import { apiClient } from '@/shared/utils/authService';

const response = await apiClient.get('/usuarios');
```

### Store de Autenticación

```javascript
// Zustand store con persistencia
import useAuthStore from '@/shared/store/authStore';

const { login, logout, usuario, isAuthenticated } = useAuthStore();
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 🚀 Build y Deploy

```bash
# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
npm run lint:fix

# Formateo de código
npm run format
```

## 📱 Responsive Design

- **Desktop**: Layout completo con sidebar
- **Tablet**: Sidebar colapsable
- **Mobile**: Drawer navigation

## 🔄 Estado de Desarrollo

### ✅ Completado
- [x] Configuración inicial con Vite
- [x] Sistema de autenticación JWT
- [x] Layout responsive con Material-UI
- [x] Routing protegido por roles
- [x] Store de estado con Zustand
- [x] Integración con backend
- [x] Páginas básicas por rol

### 🚧 En Desarrollo
- [ ] CRUD completo de usuarios
- [ ] CRUD de proveedores y sitios
- [ ] Sistema de auditorías
- [ ] Chat asíncrono
- [ ] Dashboards con gráficos

### 📋 Pendiente
- [ ] Análisis con IA
- [ ] Reportes automáticos
- [ ] Modo offline
- [ ] Notificaciones push

## 🤝 Contribución

1. Seguir metodología BEM para CSS
2. Usar bibliotecas especificadas en package.json
3. Mantener separación por dominios
4. Documentar componentes complejos
5. Testing obligatorio para lógica crítica

## 📞 Soporte

Para problemas o preguntas:
- Documentación completa: `../documentacion/`
- Estado del proyecto: `../documentacion/06-ESTADO-PROYECTO.md`
- Checkpoints: `../documentacion/07-CHECKPOINTS-GENERAL.md`
