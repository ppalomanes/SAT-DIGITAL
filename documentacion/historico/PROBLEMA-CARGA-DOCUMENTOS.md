# 🔴 PROBLEMA: Carga de Documentos No Funcional

**Fecha:** 14/10/2025
**Reportado por:** Usuario proveedor@activo.com
**Afecta a:** Sistema de carga documental de auditorías

---

## 🎯 PROBLEMAS IDENTIFICADOS

### 1. ❌ Input de Archivo Sin Handler
**Archivo:** `frontend/src/domains/auditorias/components/sections/TopologiaForm.jsx`
**Líneas:** 482-487

**Problema:**
```jsx
<input
  type="file"
  hidden
  accept=".pdf"
  required
/>
```

❌ **No tiene `onChange` handler**
❌ **No almacena el archivo seleccionado**
❌ **No muestra feedback visual al usuario**

**Impacto:** El archivo PDF se selecciona pero nunca se procesa ni se guarda.

---

### 2. ❌ No Hay Llamada al Endpoint de Backend
**Problema:** El componente `TopologiaForm` guarda los datos del formulario solo en **estado local** (líneas 101-110):

```javascript
const handleSave = () => {
  if (validateForm()) {
    onSave({
      sectionId: 'topologia',
      data: formData,  // ❌ Solo datos del form, NO archivos
      completedAt: new Date().toISOString(),
      status: 'completed'
    });
  }
};
```

❌ **No envía archivos al backend**
❌ **No llama a `/api/documentos/cargar`**
❌ **Los datos se pierden al cerrar el modal**

---

### 3. ❌ Botón "Guardar Auditoría" No Persiste Datos
**Archivo:** `frontend/src/domains/auditorias/components/AuditoriaFormulario.jsx`
**Líneas:** 460-469

**Problema:**
```javascript
const handleSaveAuditoria = () => {
  const auditResult = {
    auditId: auditData.id,
    sectionStatuses,
    progress,
    completedAt: progress === 100 ? new Date().toISOString() : null
  };
  onSave(auditResult);  // ❌ Solo cierra el modal
};
```

❌ **No hay llamada API para guardar el progreso**
❌ **No actualiza la auditoría en el backend**
❌ **Los datos solo existen en memoria del navegador**

---

### 4. ❌ Botón "Analizar con IA" Sin Implementar
**Archivo:** `frontend/src/domains/auditorias/components/sections/TopologiaForm.jsx`
**Líneas:** 230-246

**Problema:**
```jsx
<Button
  variant="outlined"
  fullWidth
  startIcon={<UploadIcon />}
>
  🤖 Analizar con IA - Subir documento para auto-completar campos
</Button>
```

❌ **No tiene `onClick` handler**
❌ **No hay integración con Ollama/IA**
❌ **Funcionalidad Fase 3 no implementada**

---

## 🛠️ SOLUCIÓN REQUERIDA

### Paso 1: Agregar State para Archivos en TopologiaForm

```javascript
const [uploadedFiles, setUploadedFiles] = useState([]);
const [uploading, setUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
```

### Paso 2: Handler para Upload de Archivos

```javascript
const handleFileChange = async (event) => {
  const files = Array.from(event.target.files);

  if (files.length === 0) return;

  setUploading(true);
  setUploadProgress(0);

  try {
    const formData = new FormData();
    formData.append('auditoria_id', auditData.id);
    formData.append('seccion_id', seccionId); // Obtener del backend
    formData.append('observaciones', formData.observaciones || '');

    files.forEach((file) => {
      formData.append('archivos', file);
    });

    const response = await axios.post('/api/documentos/cargar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percentCompleted);
      },
    });

    if (response.data.success) {
      setUploadedFiles(prev => [
        ...prev,
        ...response.data.documentos_guardados
      ]);

      // Mostrar success message
      alert('Documentos cargados exitosamente');
    }
  } catch (error) {
    console.error('Error uploading files:', error);
    alert('Error al cargar documentos: ' + error.message);
  } finally {
    setUploading(false);
    setUploadProgress(0);
  }
};
```

### Paso 3: Actualizar Input de Archivo

```jsx
<input
  type="file"
  hidden
  accept=".pdf"
  required
  onChange={handleFileChange}
  disabled={uploading}
/>
```

### Paso 4: Mostrar Archivos Subidos

```jsx
{uploadedFiles.length > 0 && (
  <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle2" gutterBottom>
      Archivos cargados ({uploadedFiles.length}):
    </Typography>
    {uploadedFiles.map((file, index) => (
      <Chip
        key={index}
        icon={<DocumentIcon />}
        label={`${file.nombre_original} (${(file.tamaño_bytes / 1024).toFixed(1)} KB)`}
        color="success"
        sx={{ m: 0.5 }}
      />
    ))}
  </Box>
)}

{uploading && (
  <Box sx={{ mt: 2 }}>
    <LinearProgress variant="determinate" value={uploadProgress} />
    <Typography variant="caption" sx={{ mt: 1 }}>
      Subiendo... {uploadProgress}%
    </Typography>
  </Box>
)}
```

### Paso 5: Obtener `seccion_id` del Backend

Antes de subir, necesitamos obtener el ID de la sección "topologia":

```javascript
const [seccionId, setSeccionId] = useState(null);

useEffect(() => {
  const fetchSeccionId = async () => {
    try {
      const response = await axios.get('/api/documentos/secciones-tecnicas');
      const seccion = response.data.data.find(s => s.codigo === 'topologia');
      if (seccion) {
        setSeccionId(seccion.id);
      }
    } catch (error) {
      console.error('Error fetching seccion ID:', error);
    }
  };

  fetchSeccionId();
}, []);
```

### Paso 6: Pasar `auditData` a Formularios de Sección

El problema es que `TopologiaForm` no recibe el `auditData.id`. Necesitamos modificar `AuditoriaFormulario.jsx`:

```javascript
// En AuditoriaFormulario.jsx, línea 325
<TopologiaForm
  onSave={handleSectionSave}
  onCancel={handleCloseModal}
  initialData={{}}
  auditData={auditData}  // ✅ AGREGAR ESTO
/>
```

Repetir para todas las 13 secciones.

### Paso 7: Actualizar Progreso en Tiempo Real

Después de cada carga exitosa, actualizar el progreso:

```javascript
const fetchProgreso = async () => {
  try {
    const response = await axios.get(`/api/documentos/progreso/${auditData.id}`);
    setProgress(response.data.progreso);
  } catch (error) {
    console.error('Error fetching progress:', error);
  }
};

// Llamar después de subir archivos
await fetchProgreso();
```

---

## 📋 ARCHIVOS QUE NECESITAN CAMBIOS

### Frontend

1. **`frontend/src/domains/auditorias/components/sections/TopologiaForm.jsx`**
   - ✅ Agregar state para archivos subidos
   - ✅ Agregar handler `handleFileChange`
   - ✅ Conectar input file con handler
   - ✅ Mostrar archivos subidos con chips
   - ✅ Mostrar progress bar durante upload
   - ✅ Obtener `seccion_id` del backend
   - ✅ Recibir `auditData` como prop

2. **`frontend/src/domains/auditorias/components/sections/DocumentacionForm.jsx`**
   - ✅ Mismo patrón que TopologiaForm

3. **`frontend/src/domains/auditorias/components/sections/[TODOS LOS DEMÁS FORMS].jsx`**
   - ✅ Aplicar mismo patrón a las 13 secciones

4. **`frontend/src/domains/auditorias/components/AuditoriaFormulario.jsx`**
   - ✅ Pasar `auditData` a cada formulario de sección
   - ✅ Agregar función para actualizar progreso desde backend
   - ✅ Llamar a progreso después de cada sección completada

5. **`frontend/src/domains/auditorias/pages/AuditoriasPage.jsx`**
   - ✅ Recargar lista de auditorías después de guardar
   - ✅ Actualizar contador de documentos en tabla

### Backend (Ya está implementado ✅)

- ✅ `POST /api/documentos/cargar` - Subir documentos
- ✅ `GET /api/documentos/progreso/:auditoria_id` - Obtener progreso
- ✅ `GET /api/documentos/auditoria/:auditoria_id` - Listar documentos
- ✅ `DELETE /api/documentos/:documento_id` - Eliminar documento
- ✅ `GET /api/documentos/secciones-tecnicas` - Listar secciones

---

## 🎯 RESULTADO ESPERADO

Una vez implementadas todas las correcciones:

1. ✅ Usuario selecciona archivo PDF → **se muestra progress bar**
2. ✅ Archivo se sube a backend → **se guarda en BD y filesystem**
3. ✅ Aparece chip con nombre de archivo → **confirma carga exitosa**
4. ✅ Contador de documentos se actualiza → **muestra "1 documento"**
5. ✅ Barra de progreso general se actualiza → **muestra "8% completado (1/13 secciones)"**
6. ✅ Al refrescar página → **los datos persisten** (no se pierden)
7. ✅ Al hacer click en "Guardar Auditoría" → **se actualiza estado en backend**

---

## 🚀 PRIORIDAD DE IMPLEMENTACIÓN

### Alta Prioridad (Bloquea uso del sistema):
1. ✅ Implementar upload de archivos en `TopologiaForm`
2. ✅ Conectar input file con backend `/api/documentos/cargar`
3. ✅ Mostrar progreso de upload
4. ✅ Actualizar progreso general después de cada carga

### Media Prioridad (Mejora UX):
5. ✅ Replicar patrón a las 13 secciones
6. ✅ Agregar validación de formatos de archivo
7. ✅ Mostrar chips con archivos subidos
8. ✅ Permitir eliminar documentos

### Baja Prioridad (Fase 3):
9. ⏳ Implementar botón "Analizar con IA"
10. ⏳ Integrar con Ollama para auto-completar campos
11. ⏳ Extraer texto de PDFs automáticamente

---

**Estado:** 🔴 **BLOQUEANTE - Sistema no funcional sin esta correción**
**Estimación:** 2-3 horas de desarrollo para implementar correctamente
**Riesgo:** ALTO - Afecta funcionalidad core del sistema
