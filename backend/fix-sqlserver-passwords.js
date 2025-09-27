/**
 * Script para generar hashes correctos de contraseñas en SQL Server
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/shared/database/connection');

async function fixPasswords() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a SQL Server');

    // Generar hashes para las contraseñas conocidas
    const saltRounds = 10;

    const passwords = {
      'admin@satdigital.com': 'admin123',
      'auditor@satdigital.com': 'auditor123',
      'proveedor@activo.com': 'proveedor123',
      'visualizador@satdigital.com': 'visual123'
    };

    console.log('\n🔐 Generando hashes de contraseñas...');

    for (const [email, password] of Object.entries(passwords)) {
      const hash = await bcrypt.hash(password, saltRounds);
      console.log(`   📧 ${email}`);
      console.log(`   🔑 Password: ${password}`);
      console.log(`   🎯 Hash: ${hash}`);

      // Actualizar el hash en la base de datos
      await sequelize.query(`
        UPDATE [usuarios]
        SET password_hash = :hash
        WHERE email = :email
      `, {
        replacements: { hash, email }
      });

      console.log('   ✅ Hash actualizado en BD');
      console.log('   ---');
    }

    console.log('\n🎉 Todos los hashes actualizados correctamente!');

    // Verificar los usuarios actualizados
    console.log('\n👥 Verificando usuarios actualizados:');
    const [usuarios] = await sequelize.query('SELECT email, nombre, rol FROM [usuarios]');
    usuarios.forEach(user => {
      console.log(`   ✅ ${user.email} | ${user.nombre} | ${user.rol}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

fixPasswords();