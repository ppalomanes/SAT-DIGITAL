# Guía de Uso: Sistema de Validación con Pliegos de Requisitos

## Resumen Ejecutivo

El sistema de Pliegos de Requisitos permite definir centralizadamente los requisitos técnicos mínimos que aplicarán a períodos completos de auditoría. Esto automatiza la validación de datos técnicos durante la carga de información.

**Arquitectura:**
```
Tenant → Pliego → Período → Auditorías individuales
```

---

## 1. Estructura del Sistema

### 1.1. Componentes Principales

1. **Backend**:
   - `backend/src/shared/database/models/PliegoRequisitos.js` - Modelo Sequelize
   - `backend/src/domains/pliegos/` - API Controllers y Routes
   - `backend/src/shared/database/models/PeriodoAuditoria.js` - Campo `pliego_requisitos_id`

2. **Frontend**:
   - `frontend/src/pages/configuracion/PliegoEditor.jsx` - Editor de pliegos
   - `frontend/src/pages/configuracion/ConfiguracionPage.jsx` - Lista de pliegos
   - `frontend/src/services/pliegosService.js` - API client
   - `frontend/src/services/pliegoValidacionService.js` - **⭐ Servicio de validación**
   - `frontend/src/domains/calendario/components/ModalCrearPeriodo.jsx` - Selección de pliego

### 1.2. Flujo de Trabajo

```mermaid
graph LR
    A[Admin crea Pliego] --> B[Asigna Pliego a Período]
    B --> C[Período genera Auditorías]
    C --> D[Auditorías heredan requisitos]
    D --> E[Validación automática durante carga]
```

---

## 2. Uso del Servicio de Validación

### 2.1. Importar el Servicio

```javascript
import pliegoValidacionService from '../../../services/pliegoValidacionService';
```

### 2.2. Cargar Pliego por Período

```javascript
// En useEffect o al inicializar el formulario
useEffect(() => {
  const cargarPliego = async () => {
    if (auditData?.periodo_auditoria_id) {
      const cargado = await pliegoValidacionService.cargarPlieguoPorPeriodo(
        auditData.periodo_auditoria_id
      );

      if (cargado) {
        console.log('✅ Pliego cargado:', pliegoValidacionService.getPliego().codigo);
        setPliegoCargado(true);
      } else {
        console.warn('⚠️ No hay pliego asociado a este período');
      }
    }
  };

  cargarPliego();
}, [auditData]);
```

### 2.3. Validar Datos Técnicos

#### Ejemplo 1: Validar Procesador

```javascript
const validarProcesadorInput = () => {
  const resultado = pliegoValidacionService.validarProcesador(
    formData.procesador_marca,    // 'Intel' o 'AMD'
    formData.procesador_familia    // 'Core i5', 'Ryzen 7', etc.
  );

  if (resultado.cumple) {
    console.log(resultado.mensaje); // "✅ Procesador Intel Core i7 cumple..."
  } else {
    console.error(resultado.mensaje); // "❌ Procesador AMD Ryzen 3 NO cumple..."
    // Mostrar alerta al usuario
    setError(resultado.mensaje);
  }

  return resultado;
};
```

#### Ejemplo 2: Validar RAM

```javascript
const validarRAMInput = () => {
  const resultado = pliegoValidacionService.validarRAM(
    parseInt(formData.ram_gb)  // Capacidad en GB: 8, 16, 32, etc.
  );

  if (!resultado.cumple) {
    // Mostrar alerta: "Se requiere mínimo 16GB"
    showAlert(resultado.mensaje, 'warning');
  }

  return resultado;
};
```

#### Ejemplo 3: Validar Sistema Operativo

```javascript
const validarSOInput = () => {
  const resultado = pliegoValidacionService.validarSistemaOperativo(
    formData.so_nombre,    // 'Windows 11'
    formData.so_version    // '22000.1.0'
  );

  console.log(resultado);
  // {
  //   cumple: true,
  //   mensaje: "✅ SO Windows 11 22000.1.0 cumple...",
  //   detalles: { requisito: {...}, aplicable: true }
  // }

  return resultado;
};
```

#### Ejemplo 4: Validar Equipo Completo

```javascript
const validarEquipoCompleto = (equipo) => {
  // Estructura del objeto equipo:
  const equipoData = {
    procesador_marca: 'Intel',
    procesador_familia: 'Core i7',
    ram_gb: 16,
    disco_capacidad_gb: 512,
    disco_tipo: 'SSD',
    so_nombre: 'Windows 11',
    so_version: '22000.1.0',
    headset_marca: 'Jabra',
    headset_modelo: 'Evolve 65'
  };

  const resultado = pliegoValidacionService.validarEquipoCompleto(equipoData);

  console.log(resultado);
  // {
  //   cumpleTotal: true,
  //   validaciones: [
  //     { campo: 'Procesador', cumple: true, mensaje: "✅..." },
  //     { campo: 'RAM', cumple: true, mensaje: "✅..." },
  //     ...
  //   ],
  //   requisitos: { /* pliego completo */ },
  //   pliegoId: 1,
  //   pliegoCodigo: 'DEFAULT-2025'
  // }

  return resultado;
};
```

### 2.4. Validar en Tiempo Real (onChange)

```javascript
const handleProcesadorChange = (campo, valor) => {
  // Actualizar formData
  setFormData(prev => ({
    ...prev,
    [campo]: valor
  }));

  // Validar si ambos campos están completos
  if (campo === 'procesador_marca' || campo === 'procesador_familia') {
    const marca = campo === 'procesador_marca' ? valor : formData.procesador_marca;
    const familia = campo === 'procesador_familia' ? valor : formData.procesador_familia;

    if (marca && familia) {
      const resultado = pliegoValidacionService.validarProcesador(marca, familia);
      setValidacionProcesador(resultado);
    }
  }
};
```

### 2.5. Mostrar Requisitos al Usuario

```javascript
const renderRequisitosPliego = () => {
  if (!pliegoValidacionService.isLoaded()) {
    return (
      <Alert severity="info">
        No hay pliego de requisitos asociado a este período
      </Alert>
    );
  }

  const pliego = pliegoValidacionService.getPliego();

  return (
    <Card sx={{ mb: 3, border: '2px solid #2196f3', background: '#e3f2fd' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📋 Pliego de Requisitos: {pliego.codigo}
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          {pliego.nombre}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Requisitos de Parque Informático:
        </Typography>

        <Box sx={{ pl: 2 }}>
          {/* Procesadores */}
          {pliego.parque_informatico?.procesadores_aceptados?.length > 0 && (
            <Typography variant="body2">
              • Procesadores: {pliego.parque_informatico.procesadores_aceptados
                .map(p => `${p.marca} ${p.familia_min}${p.aceptar_superior ? '+' : ''}`)
                .join(' OR ')}
            </Typography>
          )}

          {/* RAM */}
          {pliego.parque_informatico?.ram_minima_gb && (
            <Typography variant="body2">
              • RAM mínima: {pliego.parque_informatico.ram_minima_gb}GB
            </Typography>
          )}

          {/* Discos */}
          {pliego.parque_informatico?.discos?.length > 0 && (
            <Typography variant="body2">
              • Discos: {pliego.parque_informatico.discos
                .map(d => `${d.tipo} ${d.capacidad_gb}GB`)
                .join(', ')}
            </Typography>
          )}

          {/* SO */}
          {pliego.parque_informatico?.sistema_operativo && (
            <Typography variant="body2">
              • Sistema Operativo: {pliego.parque_informatico.sistema_operativo}
              {pliego.parque_informatico.sistema_operativo_version_min !== '0' &&
                ` (versión ${pliego.parque_informatico.sistema_operativo_version_min}+)`
              }
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
```

---

## 3. Ejemplo Completo de Integración

### 3.1. Componente HardwareSoftwareForm (Simplificado)

```javascript
import React, { useState, useEffect } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import pliegoValidacionService from '../../../services/pliegoValidacionService';

const HardwareSoftwareForm = ({ auditData, onSave }) => {
  const [pliegoCargado, setPliegoCargado] = useState(false);
  const [validaciones, setValidaciones] = useState({});
  const [formData, setFormData] = useState({
    procesador_marca: '',
    procesador_familia: '',
    ram_gb: 0,
    // ... otros campos
  });

  // Cargar pliego al iniciar
  useEffect(() => {
    const cargarPliego = async () => {
      if (auditData?.periodo_auditoria_id) {
        const cargado = await pliegoValidacionService.cargarPlieguoPorPeriodo(
          auditData.periodo_auditoria_id
        );
        setPliegoCargado(cargado);
      }
    };

    cargarPliego();
  }, [auditData]);

  // Validar al cambiar campos
  const handleInputChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));

    // Validar según el campo
    if (campo === 'procesador_familia' && formData.procesador_marca) {
      const validacion = pliegoValidacionService.validarProcesador(
        formData.procesador_marca,
        valor
      );
      setValidaciones(prev => ({ ...prev, procesador: validacion }));
    }

    if (campo === 'ram_gb') {
      const validacion = pliegoValidacionService.validarRAM(parseInt(valor));
      setValidaciones(prev => ({ ...prev, ram: validacion }));
    }
  };

  // Validar antes de guardar
  const handleSubmit = () => {
    const equipoCompleto = {
      procesador_marca: formData.procesador_marca,
      procesador_familia: formData.procesador_familia,
      ram_gb: formData.ram_gb,
      // ... otros campos
    };

    const resultado = pliegoValidacionService.validarEquipoCompleto(equipoCompleto);

    if (!resultado.cumpleTotal) {
      alert('⚠️ El equipo no cumple con todos los requisitos del pliego:\n\n' +
            resultado.validaciones
              .filter(v => !v.cumple)
              .map(v => `• ${v.campo}: ${v.mensaje}`)
              .join('\n'));
      return;
    }

    // Si cumple, guardar
    onSave(formData);
  };

  return (
    <Box>
      {pliegoCargado && renderRequisitosPliego()}

      {/* Formulario con validaciones en tiempo real */}
      {validaciones.procesador && !validaciones.procesador.cumple && (
        <Alert severity="error">{validaciones.procesador.mensaje}</Alert>
      )}

      {/* ... campos del formulario ... */}
    </Box>
  );
};

export default HardwareSoftwareForm;
```

---

## 4. Funciones de Validación Disponibles

### 4.1. Parque Informático

| Función | Parámetros | Retorno |
|---------|-----------|---------|
| `validarProcesador(marca, familia)` | marca: 'Intel'/'AMD', familia: 'Core i5'/'Ryzen 7' | { cumple, mensaje, detalles } |
| `validarRAM(capacidadGB)` | capacidadGB: number | { cumple, mensaje, detalles } |
| `validarDisco(capacidadGB, tipo)` | capacidadGB: number, tipo: 'HDD'/'SSD' | { cumple, mensaje, detalles } |
| `validarSistemaOperativo(nombre, version)` | nombre: string, version: string | { cumple, mensaje, detalles } |
| `validarHeadset(marca, modelo)` | marca: string, modelo: string | { cumple, mensaje, detalles } |
| `validarEquipoCompleto(equipo)` | equipo: Object | { cumpleTotal, validaciones[], requisitos } |

### 4.2. Conectividad

| Función | Parámetros | Retorno |
|---------|-----------|---------|
| `validarVelocidadInternet(bajadaMbps, subidaMbps)` | bajada: number, subida: number | { cumple, mensaje, detalles } |
| `validarTipoConexion(tipoConexion)` | tipo: 'Cable'/'Fibra'/'4G'/'Satelital' | { cumple, mensaje, detalles } |

### 4.3. Infraestructura

| Función | Parámetros | Retorno |
|---------|-----------|---------|
| `validarUPS(tieneUPS, capacidadVA, vidaUtilAnos)` | tiene: boolean, capacidad: number, vidaUtil: number | { cumple, mensaje, detalles } |

---

## 5. Estructura de Respuesta de Validación

Todas las funciones de validación retornan un objeto con la siguiente estructura:

```javascript
{
  cumple: boolean,              // true si cumple con los requisitos
  mensaje: string,              // Mensaje descriptivo para el usuario
  detalles: {
    requisitos: any,            // Requisitos del pliego aplicados
    aplicable: boolean,         // Si hay requisitos definidos
    ...                         // Datos específicos de la validación
  }
}
```

**Ejemplos:**

```javascript
// ✅ Cumple
{
  cumple: true,
  mensaje: "✅ Procesador Intel Core i7 cumple con los requisitos",
  detalles: {
    requisitos: [
      { marca: 'Intel', familia_min: 'Core i5', aceptar_superior: true }
    ],
    aplicable: true,
    marca: 'Intel',
    familia: 'Core i7'
  }
}

// ❌ No cumple
{
  cumple: false,
  mensaje: "❌ RAM de 8GB NO cumple. Se requiere mínimo 16GB",
  detalles: {
    requisito: 16,
    aplicable: true,
    capacidad: 8
  }
}

// ℹ️ No aplicable (sin pliego o sin requisitos)
{
  cumple: true,
  mensaje: "No hay pliego de requisitos cargado",
  detalles: {
    requisito: null,
    aplicable: false
  }
}
```

---

## 6. Casos de Uso Avanzados

### 6.1. Validación en Batch (Múltiples Equipos)

```javascript
const validarInventarioCompleto = async (equipos) => {
  // Asegurar que el pliego esté cargado
  if (!pliegoValidacionService.isLoaded()) {
    await pliegoValidacionService.cargarPlieguoPorPeriodo(periodoId);
  }

  const resultados = equipos.map(equipo => ({
    hostname: equipo.hostname,
    validacion: pliegoValidacionService.validarEquipoCompleto(equipo)
  }));

  // Filtrar equipos que NO cumplen
  const equiposNoCumplen = resultados.filter(r => !r.validacion.cumpleTotal);

  if (equiposNoCumplen.length > 0) {
    console.error(`❌ ${equiposNoCumplen.length} equipos no cumplen:`, equiposNoCumplen);
  }

  return resultados;
};
```

### 6.2. Exportar Reporte de Validación

```javascript
const generarReporteValidacion = (validaciones) => {
  const pliego = pliegoValidacionService.getPliego();

  const reporte = {
    fecha: new Date().toISOString(),
    pliego: {
      codigo: pliego.codigo,
      nombre: pliego.nombre
    },
    equipos_validados: validaciones.length,
    equipos_cumplen: validaciones.filter(v => v.validacion.cumpleTotal).length,
    equipos_no_cumplen: validaciones.filter(v => !v.validacion.cumpleTotal).length,
    detalle: validaciones.map(v => ({
      hostname: v.hostname,
      cumple: v.validacion.cumpleTotal,
      problemas: v.validacion.validaciones
        .filter(val => !val.cumple)
        .map(val => ({ campo: val.campo, mensaje: val.mensaje }))
    }))
  };

  // Exportar a JSON
  const blob = new Blob([JSON.stringify(reporte, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte-validacion-${Date.now()}.json`;
  a.click();
};
```

---

## 7. Preguntas Frecuentes

### 7.1. ¿Qué pasa si no hay pliego asociado al período?

El servicio retornará `cumple: true` con `aplicable: false` para todas las validaciones. No bloqueará el proceso de carga.

### 7.2. ¿Cómo actualizo el pliego durante una auditoría?

El pliego queda asociado al período. Si se modifica el pliego después de iniciar las auditorías, las auditorías en curso mantendrán la referencia al pliego original (se puede guardar un snapshot en el historial).

### 7.3. ¿Puedo validar contra múltiples pliegos?

No. Cada período tiene un único pliego asociado. Si necesitas cambiar requisitos, debes crear un nuevo pliego y asociarlo a un nuevo período.

### 7.4. ¿El servicio funciona offline?

No. Requiere conexión al backend para cargar los pliegos. Una vez cargado, las validaciones se ejecutan localmente.

---

## 8. Roadmap y Mejoras Futuras

- [ ] Upload de XLSX para headsets homologados
- [ ] Validación de navegadores con versiones específicas
- [ ] Integración con Aternity API para validación automática
- [ ] Reportes de compliance por proveedor
- [ ] Alertas proactivas cuando equipos no cumplen
- [ ] Dashboard de cumplimiento de requisitos

---

**Última actualización:** 2025-11-10
**Versión:** 1.0.0
**Mantenido por:** Sistema SAT-Digital
