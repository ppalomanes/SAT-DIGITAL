@echo off
echo ==========================================
echo     SAT-Digital - Diagnostico Usuarios
echo ==========================================
echo.

echo Navegando al directorio backend...
cd /d "C:\xampp\htdocs\SAT-Digital\backend"

echo.
echo Consultando usuarios actuales en la base de datos...
echo.

node -e "
const { Usuario } = require('./src/shared/database/models');
const { sequelize } = require('./src/shared/database/connection');

async function checkUsers() {
  try {
    await sequelize.authenticate();
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'email', 'nombre', 'rol', 'estado', 'proveedor_id'],
      raw: true
    });
    
    console.log('=======================================');
    console.log('USUARIOS EN LA BASE DE DATOS:');
    console.log('=======================================');
    
    if (usuarios.length === 0) {
      console.log('❌ NO HAY USUARIOS EN LA BASE DE DATOS');
      console.log('Necesitas ejecutar los seeders.');
    } else {
      usuarios.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Nombre: ${user.nombre}`);
        console.log(`   Rol: ${user.rol}`);
        console.log(`   Estado: ${user.estado}`);
        console.log(`   Proveedor ID: ${user.proveedor_id || 'N/A'}`);
        console.log('');
      });
    }
    
    console.log('=======================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error consultando usuarios:', error.message);
    process.exit(1);
  }
}

checkUsers();
"

echo.
pause
