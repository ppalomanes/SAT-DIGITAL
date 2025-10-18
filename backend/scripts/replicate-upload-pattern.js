const fs = require('fs');
const path = require('path');

// Mapeo de formularios y sus códigos de sección
const formsMapping = [
  { file: 'EnergiaForm.jsx', codigo: 'energia', nombre: 'Energía' },
  { file: 'TemperaturaForm.jsx', codigo: 'temperatura', nombre: 'Temperatura' },
  { file: 'ServidoresForm.jsx', codigo: 'servidores', nombre: 'Servidores' },
  { file: 'InternetForm.jsx', codigo: 'internet', nombre: 'Internet' },
  { file: 'PersonalCapacitadoForm.jsx', codigo: 'personal_capacitado', nombre: 'Personal Capacitado' },
  { file: 'EscalamientoForm.jsx', codigo: 'escalamiento', nombre: 'Escalamiento' },
  { file: 'CuartoTecnologiaForm.jsx', codigo: 'cuarto_tecnologia', nombre: 'Cuarto de Tecnología' },
  { file: 'ConectividadForm.jsx', codigo: 'conectividad', nombre: 'Conectividad' },
  { file: 'HardwareSoftwareForm.jsx', codigo: 'hardware_software', nombre: 'Hardware/Software' },
  { file: 'SeguridadInformacionForm.jsx', codigo: 'seguridad_informacion', nombre: 'Seguridad de la Información' },
  { file: 'EntornoInformacionForm.jsx', codigo: 'entorno_informacion', nombre: 'Entorno de la Información' }
];

const basePath = path.join(__dirname, 'frontend/src/domains/auditorias/components/sections');

// Función para verificar si ya tiene las importaciones necesarias
function hasImport(content, importName) {
  return content.includes(importName);
}

// Función para agregar imports faltantes
function addMissingImports(content) {
  let updated = content;

  // Agregar useEffect si no está
  if (!hasImport(content, 'useEffect')) {
    updated = updated.replace(
      /import React, { useState/,
      'import React, { useState, useEffect'
    );
  }

  // Agregar LinearProgress y CircularProgress si no están
  if (!hasImport(content, 'LinearProgress') || !hasImport(content, 'CircularProgress')) {
    const muiImportMatch = updated.match(/from '@mui\/material';/);
    if (muiImportMatch) {
      const muiImportEnd = muiImportMatch.index;
      const beforeImport = updated.substring(0, muiImportEnd);
      const afterImport = updated.substring(muiImportEnd);

      const needsProgress = [];
      if (!hasImport(content, 'LinearProgress')) needsProgress.push('  LinearProgress');
      if (!hasImport(content, 'CircularProgress')) needsProgress.push('  CircularProgress');

      if (needsProgress.length > 0) {
        updated = beforeImport.replace(/} from '@mui\/material';/, `,\n${needsProgress.join(',\n')}\n} from '@mui/material';`) + afterImport.substring(' from \'@mui/material\';'.length);
      }
    }
  }

  // Agregar CheckIcon si no está
  if (!hasImport(content, 'CheckCircle as CheckIcon')) {
    const iconImportMatch = updated.match(/} from '@mui\/icons-material';/);
    if (iconImportMatch) {
      updated = updated.replace(
        /} from '@mui\/icons-material';/,
        `,\n  CheckCircle as CheckIcon\n} from '@mui/icons-material';`
      );
    }
  }

  // Agregar httpClient import si no está
  if (!hasImport(content, 'httpClient')) {
    const themeImportMatch = updated.match(/import.*THEME_COLORS.*from.*theme.*;\n/);
    if (themeImportMatch) {
      const insertPos = themeImportMatch.index + themeImportMatch[0].length;
      updated = updated.substring(0, insertPos) +
                "import httpClient from '../../../../shared/services/httpClient';\n" +
                updated.substring(insertPos);
    }
  }

  return updated;
}

// Función para actualizar la firma del componente
function updateComponentSignature(content, formName) {
  const componentPattern = new RegExp(`const ${formName} = \\(\\{ onSave, onCancel, initialData = \\{\\} \\}\\)`);
  if (componentPattern.test(content)) {
    return content.replace(
      componentPattern,
      `const ${formName} = ({ onSave, onCancel, initialData = {}, auditData })`
    );
  }
  return content;
}

// Función para agregar state variables
function addStateVariables(content) {
  // Buscar el último useState existente
  const lastUseStateMatch = content.match(/const \[[\w,\s]+\] = useState\([^)]*\);(?![\s\S]*useState)/);

  if (lastUseStateMatch && !content.includes('const [seccionId, setSeccionId]')) {
    const insertPos = lastUseStateMatch.index + lastUseStateMatch[0].length;
    const stateVars = `
  const [seccionId, setSeccionId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);`;

    return content.substring(0, insertPos) + stateVars + content.substring(insertPos);
  }
  return content;
}

// Función para agregar los useEffect y funciones
function addUploadFunctions(content, codigo) {
  if (content.includes('// Obtener ID de la sección desde el backend')) {
    return content; // Ya tiene las funciones
  }

  // Buscar donde insertar (después de los state y antes de otras funciones)
  const tiposDocumentoMatch = content.match(/const tiposDocumento = \[[\s\S]*?\];/);
  const insertAfterMatch = tiposDocumentoMatch || content.match(/const \[uploading, setUploading\] = useState\(false\);/);

  if (insertAfterMatch) {
    const insertPos = insertAfterMatch.index + insertAfterMatch[0].length;

    const uploadFunctions = `

  // Obtener ID de la sección desde el backend
  useEffect(() => {
    const fetchSeccionId = async () => {
      try {
        const response = await httpClient.get('/documentos/secciones-tecnicas');
        const seccion = response.data.data.find(s => s.codigo === '${codigo}');
        if (seccion) {
          setSeccionId(seccion.id);
        }
      } catch (error) {
        console.error('Error fetching seccion ID:', error);
      }
    };
    fetchSeccionId();
  }, []);

  // Cargar documentos existentes si hay auditData
  useEffect(() => {
    if (auditData?.id) {
      fetchExistingDocuments();
    }
  }, [auditData]);

  const fetchExistingDocuments = async () => {
    try {
      const response = await httpClient.get(\`/documentos/auditoria/\${auditData.id}\`);
      const seccionData = response.data.documentos_por_seccion?.[seccionId];
      const docs = seccionData?.documentos || [];
      setUploadedFiles(docs);
    } catch (error) {
      console.error('Error fetching existing documents:', error);
    }
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    if (!auditData?.id) {
      alert('Error: No se encontró ID de auditoría');
      return;
    }

    if (!seccionId) {
      alert('Error: No se encontró ID de sección. Espere un momento e intente nuevamente.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append('auditoria_id', auditData.id);
      formDataToUpload.append('seccion_id', seccionId);
      formDataToUpload.append('observaciones', formData.observaciones || '');

      files.forEach((file) => {
        formDataToUpload.append('documentos', file);
      });

      const response = await httpClient.post('/documentos/cargar', formDataToUpload, {
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
        alert(\`✅ \${response.data.documentos_guardados} documento(s) cargado(s) exitosamente\`);
        await fetchExistingDocuments();
        event.target.value = '';
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      const errorMsg = error.response?.data?.error || error.message;
      alert('❌ Error al cargar documentos: ' + errorMsg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };`;

    return content.substring(0, insertPos) + uploadFunctions + content.substring(insertPos);
  }

  return content;
}

// Función principal para procesar un archivo
function processFile(formInfo) {
  const filePath = path.join(basePath, formInfo.file);

  console.log(`\n📝 Procesando ${formInfo.file}...`);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ Archivo no encontrado: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // 1. Agregar imports faltantes
  content = addMissingImports(content);

  // 2. Actualizar firma del componente
  const componentName = formInfo.file.replace('.jsx', '');
  content = updateComponentSignature(content, componentName);

  // 3. Agregar state variables
  content = addStateVariables(content);

  // 4. Agregar funciones de upload
  content = addUploadFunctions(content, formInfo.codigo);

  // 5. Actualizar handleSave para incluir documentCount
  if (!content.includes('documentCount: uploadedFiles.length')) {
    content = content.replace(
      /onSave\(\{[\s\S]*?sectionId: ['"][\w_]+['"]/,
      (match) => match.replace(/sectionId: ['"][\w_]+['"]/, `sectionId: '${formInfo.codigo}'`)
    );

    content = content.replace(
      /(onSave\(\{[\s\S]*?status: ['"][\w]+['"])/,
      `$1,\n        documentCount: uploadedFiles.length`
    );
  }

  // Solo escribir si hubo cambios
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${formInfo.file} actualizado exitosamente (código: '${formInfo.codigo}')`);
    return true;
  } else {
    console.log(`ℹ️  ${formInfo.file} ya estaba actualizado`);
    return true;
  }
}

// Ejecutar
console.log('🚀 Iniciando replicación del patrón de upload...\n');
console.log(`📂 Ruta base: ${basePath}\n`);

let successCount = 0;
let errorCount = 0;

formsMapping.forEach(formInfo => {
  try {
    if (processFile(formInfo)) {
      successCount++;
    } else {
      errorCount++;
    }
  } catch (error) {
    console.log(`❌ Error procesando ${formInfo.file}: ${error.message}`);
    errorCount++;
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN:');
console.log(`✅ Archivos procesados exitosamente: ${successCount}`);
console.log(`❌ Errores: ${errorCount}`);
console.log('='.repeat(60));
