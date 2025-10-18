# 📊 Estado Actual: Sistema de Carga de Documentos

**Fecha:** 14/10/2025
**Última Actualización:** Sistema completamente funcional en TopologiaForm

---

## ✅ ESTADO ACTUAL

### Sistema Funcionando en TopologiaForm

- ✅ Upload de archivos PDF operativo
- ✅ Progress bar con porcentaje en tiempo real (0% → 100%)
- ✅ Chips verdes mostrando archivos subidos
- ✅ Persistencia en base de datos
- ✅ Recarga de documentos existentes al abrir modal
- ✅ Contador de documentos actualizado
- ✅ Validación de seccionId antes de subir
- ✅ Manejo de errores con mensajes claros
- ✅ Spinner en botón durante upload
- ✅ Limpieza de input después de subir

### Errores Corregidos

1. ✅ **401 Unauthorized** - Cambiado de `axios` a `httpClient` con JWT
2. ✅ **400 Bad Request** - Campo `archivos` → `documentos`
3. ✅ **undefined documentos** - Uso correcto de `response.data.documentos_guardados` (número) y `response.data.documentos` (array)
4. ✅ **Botón bloqueado** - Carga correcta de `seccionId` desde backend

### Flujo Completo Verificado

```text
Usuario abre modal → TopologiaForm carga
  ↓
useEffect #1: Obtiene seccionId desde /documentos/secciones-tecnicas
  ↓
useEffect #2: Carga documentos existentes desde /documentos/auditoria/17
  ↓
Usuario selecciona PDF → handleFileChange
  ↓
Validaciones: auditData.id ✓, seccionId ✓
  ↓
Upload con FormData → POST /documentos/cargar
  ↓
Progress bar: 0% → 100% (onUploadProgress)
  ↓
Response exitosa → Alert de éxito
  ↓
Actualiza uploadedFiles state → Muestra chips verdes
  ↓
Recarga documentos → fetchExistingDocuments()
  ↓
Usuario ve: "✅ 1 documento(s) cargado(s) exitosamente"
  ↓
Chips muestran: "topologia.pdf (245.3 KB)"
```

---

## 🎯 PRÓXIMOS PASOS

### 1. Replicar Patrón a 12 Secciones Restantes

**Secciones Pendientes:**

- DocumentacionForm.jsx
- EnergiaForm.jsx
- TemperaturaForm.jsx
- ServidoresForm.jsx
- InternetForm.jsx
- PersonalCapacitadoForm.jsx
- EscalamientoForm.jsx
- CuartoTecnologiaForm.jsx
- ConectividadForm.jsx
- HardwareSoftwareForm.jsx
- SeguridadInformacionForm.jsx
- EntornoInformacionForm.jsx

**Tiempo Estimado:** 20-30 minutos por sección = 4-6 horas total

### 2. Patrón a Copiar

Para cada formulario (`XXXForm.jsx`):

#### A. Imports (líneas 1-28)

```javascript
import React, { useState, useEffect } from "react"; // ✅ Agregar useEffect
import {
  // ... otros imports MUI
  LinearProgress, // ✅ Agregar
  CircularProgress, // ✅ Agregar
} from "@mui/material";
import {
  // ... otros icons
  CheckCircle as CheckIcon, // ✅ Agregar
} from "@mui/icons-material";
import httpClient from "../../../../shared/services/httpClient"; // ✅ Cambiar de axios
```

#### B. Props (línea 30)

```javascript
// ANTES:
const XXXForm = ({ onSave, onCancel, initialData = {} }) => {

// DESPUÉS:
const XXXForm = ({ onSave, onCancel, initialData = {}, auditData }) => {
```

#### C. State Variables (después de línea 64)

```javascript
const [seccionId, setSeccionId] = useState(null);
const [uploadedFiles, setUploadedFiles] = useState([]);
const [uploading, setUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
```

#### D. useEffect para Obtener seccionId (después de línea 68)

```javascript
useEffect(() => {
  const fetchSeccionId = async () => {
    try {
      const response = await httpClient.get("/documentos/secciones-tecnicas");
      // ⚠️ CAMBIAR EL CÓDIGO SEGÚN LA SECCIÓN
      const seccion = response.data.data.find(
        (s) => s.codigo === "CODIGO_SECCION"
      );
      if (seccion) {
        setSeccionId(seccion.id);
      }
    } catch (error) {
      console.error("Error fetching seccion ID:", error);
    }
  };
  fetchSeccionId();
}, []);
```

**Códigos por sección:**

- DocumentacionForm → `'documentacion'`
- EnergiaForm → `'energia'`
- TemperaturaForm → `'temperatura'`
- ServidoresForm → `'servidores'`
- InternetForm → `'internet'`
- PersonalCapacitadoForm → `'personal_capacitado'`
- EscalamientoForm → `'escalamiento'`
- CuartoTecnologiaForm → `'cuarto_tecnologia'`
- ConectividadForm → `'conectividad'`
- HardwareSoftwareForm → `'hardware_software'`
- SeguridadInformacionForm → `'seguridad_informacion'`
- EntornoInformacionForm → `'entorno_informacion'`

#### E. useEffect para Cargar Documentos Existentes

```javascript
useEffect(() => {
  if (auditData?.id) {
    fetchExistingDocuments();
  }
}, [auditData]);

const fetchExistingDocuments = async () => {
  try {
    const response = await httpClient.get(
      `/documentos/auditoria/${auditData.id}`
    );
    // ⚠️ CAMBIAR EL CÓDIGO SEGÚN LA SECCIÓN
    const docs =
      response.data.data?.filter(
        (doc) => doc.seccion_codigo === "CODIGO_SECCION"
      ) || [];
    setUploadedFiles(docs);
  } catch (error) {
    console.error("Error fetching existing documents:", error);
  }
};
```

#### F. Handler de Upload (copiar completo)

```javascript
const handleFileChange = async (event) => {
  const files = Array.from(event.target.files);

  if (files.length === 0) return;

  if (!auditData?.id) {
    alert("Error: No se encontró ID de auditoría");
    return;
  }

  if (!seccionId) {
    alert(
      "Error: No se encontró ID de sección. Espere un momento e intente nuevamente."
    );
    return;
  }

  setUploading(true);
  setUploadProgress(0);

  try {
    const formDataToUpload = new FormData();
    formDataToUpload.append("auditoria_id", auditData.id);
    formDataToUpload.append("seccion_id", seccionId);
    formDataToUpload.append("observaciones", formData.observaciones || "");

    files.forEach((file) => {
      formDataToUpload.append("documentos", file);
    });

    const response = await httpClient.post(
      "/documentos/cargar",
      formDataToUpload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      }
    );

    if (response.data.success) {
      alert(
        `✅ ${response.data.documentos_guardados} documento(s) cargado(s) exitosamente`
      );

      if (response.data.documentos && response.data.documentos.length > 0) {
        setUploadedFiles((prev) => [...prev, ...response.data.documentos]);
      }

      await fetchExistingDocuments();
      event.target.value = "";
    }
  } catch (error) {
    console.error("Error uploading files:", error);
    const errorMsg = error.response?.data?.error || error.message;
    alert("❌ Error al cargar documentos: " + errorMsg);
  } finally {
    setUploading(false);
    setUploadProgress(0);
  }
};
```

#### G. Actualizar Botón de Upload

Buscar el botón de subir archivos y agregar:

```jsx
<Button
  variant="contained"
  component="label"
  startIcon={
    uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />
  }
  disabled={uploading || !seccionId}
  sx={{
    mr: 2,
    background: THEME_COLORS.error.main,
    "&:hover": {
      background: THEME_COLORS.error.dark,
    },
  }}
>
  {uploading ? "Subiendo..." : "Subir PDF (OBLIGATORIO)"}
  <input
    type="file"
    hidden
    accept=".pdf"
    required
    onChange={handleFileChange} // ⚠️ CONECTAR HANDLER
    disabled={uploading}
  />
</Button>;
{
  !seccionId && (
    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
      Cargando configuración...
    </Typography>
  );
}
```

#### H. Agregar Progress Bar (después del botón)

```jsx
{
  uploading && (
    <Grid item xs={12}>
      <Box sx={{ width: "100%" }}>
        <LinearProgress variant="determinate" value={uploadProgress} />
        <Typography
          variant="caption"
          sx={{ mt: 1, display: "block", textAlign: "center" }}
        >
          Subiendo... {uploadProgress}%
        </Typography>
      </Box>
    </Grid>
  );
}
```

#### I. Agregar Visualización de Archivos Subidos

```jsx
{
  uploadedFiles.length > 0 && (
    <Grid item xs={12}>
      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          ✅ Documentos cargados ({uploadedFiles.length}):
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
          {uploadedFiles.map((file, index) => (
            <Chip
              key={file.id || index}
              icon={<CheckIcon />}
              label={`${file.nombre_original} (${(
                file.tamaño_bytes / 1024
              ).toFixed(1)} KB)`}
              color="success"
              size="small"
            />
          ))}
        </Box>
      </Alert>
    </Grid>
  );
}
```

#### J. Actualizar handleSave

```javascript
const handleSave = () => {
  if (validateForm()) {
    onSave({
      sectionId: "CODIGO_SECCION", // ⚠️ CAMBIAR SEGÚN SECCIÓN
      data: formData,
      completedAt: new Date().toISOString(),
      status: uploadedFiles.length > 0 ? "completed" : "warning",
      documentCount: uploadedFiles.length,
    });
  }
};
```

### 3. Actualizar AuditoriaFormulario.jsx

Verificar que TODAS las 13 secciones reciban `auditData`:

```javascript
case 'documentacion':
  return (
    <DocumentacionForm
      onSave={handleSectionSave}
      onCancel={handleCloseModal}
      initialData={{}}
      auditData={auditData}  // ⚠️ VERIFICAR QUE EXISTA
    />
  );

// Repetir para las 13 secciones
```

---

## 📝 CHECKLIST POR SECCIÓN

Para cada formulario de sección:

- [ ] Importar `useEffect` desde React
- [ ] Importar `httpClient` en lugar de axios
- [ ] Importar `LinearProgress`, `CircularProgress` de MUI
- [ ] Importar `CheckCircle as CheckIcon` de MUI icons
- [ ] Agregar `auditData` a props del componente
- [ ] Agregar 4 state variables: seccionId, uploadedFiles, uploading, uploadProgress
- [ ] Agregar useEffect para cargar seccionId (cambiar código de sección)
- [ ] Agregar useEffect para cargar documentos existentes
- [ ] Agregar función fetchExistingDocuments
- [ ] Agregar función handleFileChange completa
- [ ] Conectar input file con `onChange={handleFileChange}`
- [ ] Actualizar botón con spinner y disabled
- [ ] Agregar progress bar durante upload
- [ ] Agregar visualización de chips con archivos subidos
- [ ] Actualizar handleSave con documentCount
- [ ] Verificar en AuditoriaFormulario que pasa auditData

---

## 🧪 TESTING

### Pruebas Requeridas por Sección

1. **Test de Upload:**

   - [ ] Seleccionar archivo PDF
   - [ ] Ver progress bar 0% → 100%
   - [ ] Ver alert de éxito
   - [ ] Ver chip verde con nombre de archivo

2. **Test de Persistencia:**

   - [ ] Subir archivo
   - [ ] Guardar sección
   - [ ] Cerrar modal
   - [ ] Reabrir modal
   - [ ] Verificar que archivo sigue apareciendo

3. **Test de Múltiples Archivos:**

   - [ ] Subir primer archivo
   - [ ] Subir segundo archivo
   - [ ] Verificar que ambos aparecen en chips

4. **Test de Errores:**
   - [ ] Intentar subir sin auditoria_id (debe mostrar error)
   - [ ] Intentar subir antes de cargar seccionId (botón disabled)
   - [ ] Subir archivo no-PDF (debe rechazar)

---

## 📊 PROGRESO

**Secciones Completadas:** 1/13 (7.7%)
**Tiempo Invertido:** ~4 horas en análisis y desarrollo de TopologiaForm
**Tiempo Restante Estimado:** 4-6 horas para replicar a las 12 secciones

**Estado:** ✅ **Sistema base funcionando perfectamente en TopologiaForm**

---

## 🚀 RECOMENDACIÓN

**Siguiente Paso Inmediato:** Replicar el patrón a `DocumentacionForm.jsx` como prueba piloto y verificar que funciona correctamente. Luego continuar con las 11 secciones restantes.

**Orden Sugerido:**

1. DocumentacionForm (similar a TopologiaForm)
2. EnergiaForm
3. TemperaturaForm
4. ServidoresForm
5. InternetForm
6. PersonalCapacitadoForm
7. EscalamientoForm
8. CuartoTecnologiaForm
9. ConectividadForm
10. HardwareSoftwareForm
11. SeguridadInformacionForm
12. EntornoInformacionForm

---

**Documento actualizado:** 14/10/2025
**Estado:** Sistema operativo y listo para replicación masiva
