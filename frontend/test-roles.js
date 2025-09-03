// Script para probar las funciones de rol en la consola del navegador
// Ejecutar en F12 > Console después del login

function testRoleFunctions() {
  const authData = JSON.parse(localStorage.getItem('sat-digital-auth'));
  const usuario = authData?.state?.usuario;
  
  console.log('=== TEST DE FUNCIONES DE ROL ===');
  console.log('Usuario actual:', usuario);
  console.log('Rol:', usuario?.rol);
  console.log('');
  
  // Simular las funciones del store
  const isAdmin = () => usuario?.rol === 'admin';
  const isAuditor = () => usuario?.rol === 'auditor';
  const isProvider = () => usuario?.rol === 'proveedor';
  const isViewer = () => usuario?.rol === 'visualizador';
  
  console.log('Resultados de validación:');
  console.log('- isAdmin():', isAdmin());
  console.log('- isAuditor():', isAuditor());
  console.log('- isProvider():', isProvider());
  console.log('- isViewer():', isViewer());
  console.log('');
  
  console.log('Dashboard que debería renderizar:');
  if (isAdmin()) {
    console.log('✅ Panel de Administración');
  } else if (isAuditor()) {
    console.log('✅ Panel de Auditor');
  } else if (isProvider()) {
    console.log('✅ Panel de Proveedor');
  } else {
    console.log('❌ Rol no reconocido');
  }
}

// Ejecutar automáticamente
testRoleFunctions();
