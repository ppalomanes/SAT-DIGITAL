const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Función para analizar el archivo Excel del parque informático
function analyzeExcelFile(filePath) {
  try {
    console.log('🔍 Analizando archivo:', filePath);

    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error('❌ El archivo no existe:', filePath);
      return;
    }

    // Leer el archivo Excel
    const workbook = XLSX.readFile(filePath);
    console.log('📋 Hojas encontradas:', workbook.SheetNames);

    // Analizar cada hoja
    workbook.SheetNames.forEach((sheetName, index) => {
      console.log(`\n📄 === HOJA ${index + 1}: ${sheetName} ===`);

      const worksheet = workbook.Sheets[sheetName];

      // Obtener el rango de datos
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      console.log(`📏 Rango de datos: ${worksheet['!ref']}`);
      console.log(`📊 Filas: ${range.e.r + 1}, Columnas: ${range.e.c + 1}`);

      // Convertir a JSON para análisis
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log(`📈 Registros de datos: ${jsonData.length}`);

      if (jsonData.length > 0) {
        // Mostrar las columnas disponibles
        const columns = Object.keys(jsonData[0]);
        console.log('🏷️  Columnas encontradas:');
        columns.forEach((col, i) => {
          console.log(`   ${i + 1}. ${col}`);
        });

        // Mostrar muestra de los primeros 3 registros
        console.log('\n📋 Muestra de datos (primeros 3 registros):');
        jsonData.slice(0, 3).forEach((record, i) => {
          console.log(`\n--- Registro ${i + 1} ---`);
          Object.entries(record).forEach(([key, value]) => {
            console.log(`${key}: ${value}`);
          });
        });

        // Análisis de compatibilidad con formulario
        console.log('\n🔧 === ANÁLISIS DE COMPATIBILIDAD ===');

        const expectedColumns = [
          'Hostname', 'hostname', 'HOSTNAME',
          'Procesador', 'procesador', 'PROCESADOR', 'CPU', 'cpu',
          'RAM', 'ram', 'Memoria', 'memoria', 'MEMORIA',
          'Disco', 'disco', 'DISCO', 'Storage', 'storage', 'Almacenamiento',
          'SO', 'so', 'Sistema Operativo', 'OS', 'os',
          'Navegador', 'navegador', 'Browser', 'browser',
          'Headset', 'headset', 'HEADSET', 'Auriculares'
        ];

        const foundColumns = [];
        const missingColumns = [];

        // Verificar columnas esperadas
        ['Hostname', 'Procesador', 'RAM', 'Disco', 'SO', 'Navegador', 'Headset'].forEach(expected => {
          const found = columns.find(col =>
            col.toLowerCase().includes(expected.toLowerCase()) ||
            expectedColumns.some(variant =>
              variant.toLowerCase() === col.toLowerCase()
            )
          );

          if (found) {
            foundColumns.push(`✅ ${expected} → ${found}`);
          } else {
            missingColumns.push(`❌ ${expected} (no encontrado)`);
          }
        });

        console.log('\n🟢 Columnas encontradas:');
        foundColumns.forEach(msg => console.log(`   ${msg}`));

        if (missingColumns.length > 0) {
          console.log('\n🔴 Columnas faltantes:');
          missingColumns.forEach(msg => console.log(`   ${msg}`));
        }

        // Verificar columnas adicionales para teletrabajo
        console.log('\n🏠 Columnas específicas de teletrabajo:');
        const teletrabajoColumns = ['Usuario TECO', 'ISP', 'Conexión', 'Velocidad'];
        teletrabajoColumns.forEach(expected => {
          const found = columns.find(col =>
            col.toLowerCase().includes(expected.toLowerCase())
          );
          if (found) {
            console.log(`   ✅ ${expected} → ${found}`);
          } else {
            console.log(`   ⚪ ${expected} (no encontrado - opcional)`);
          }
        });

        // Análisis de calidad de datos
        console.log('\n📊 === ANÁLISIS DE CALIDAD DE DATOS ===');

        columns.forEach(col => {
          const values = jsonData.map(row => row[col]);
          const nonEmpty = values.filter(val => val && val.toString().trim() !== '');
          const completeness = ((nonEmpty.length / values.length) * 100).toFixed(1);

          console.log(`📋 ${col}: ${completeness}% completo (${nonEmpty.length}/${values.length})`);

          // Mostrar algunos valores de ejemplo
          const examples = [...new Set(nonEmpty.slice(0, 3))];
          if (examples.length > 0) {
            console.log(`   Ejemplos: ${examples.join(', ')}`);
          }
        });
      }
    });

  } catch (error) {
    console.error('❌ Error al analizar el archivo:', error.message);
  }
}

// Ejecutar análisis
const filePath = 'C:\\Parque Informático\\2025 - Parque Infromatico en BRUTO.xlsx';
analyzeExcelFile(filePath);