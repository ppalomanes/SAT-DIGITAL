/**
 * Índice de todas las interfaces DAO
 * Exporta todas las interfaces para facilitar las importaciones
 */

const IBaseDAO = require('./IBaseDAO');
const IUsuarioDAO = require('./IUsuarioDAO');
const IProveedorDAO = require('./IProveedorDAO');
const IAuditoriaDAO = require('./IAuditoriaDAO');

module.exports = {
  IBaseDAO,
  IUsuarioDAO,
  IProveedorDAO,
  IAuditoriaDAO
};

// Exportaciones adicionales para compatibilidad
module.exports.interfaces = {
  IBaseDAO,
  IUsuarioDAO,
  IProveedorDAO,
  IAuditoriaDAO
};

// Lista de todas las interfaces disponibles
module.exports.availableInterfaces = [
  'IBaseDAO',
  'IUsuarioDAO',
  'IProveedorDAO',
  'IAuditoriaDAO'
];

// Función helper para verificar si una clase implementa una interfaz
module.exports.implementsInterface = (instance, interfaceName) => {
  const Interface = module.exports[interfaceName];
  if (!Interface) {
    throw new Error(`Interface ${interfaceName} not found`);
  }

  return instance instanceof Interface;
};

// Función helper para validar implementación de métodos requeridos
module.exports.validateImplementation = (instance, interfaceName) => {
  const Interface = module.exports[interfaceName];
  if (!Interface) {
    throw new Error(`Interface ${interfaceName} not found`);
  }

  const interfacePrototype = Interface.prototype;
  const instancePrototype = Object.getPrototypeOf(instance);

  const missingMethods = [];

  // Verificar métodos del prototipo de la interfaz
  for (const methodName of Object.getOwnPropertyNames(interfacePrototype)) {
    if (typeof interfacePrototype[methodName] === 'function' && methodName !== 'constructor') {
      if (typeof instance[methodName] !== 'function') {
        missingMethods.push(methodName);
      }
    }
  }

  if (missingMethods.length > 0) {
    throw new Error(`Class does not implement required methods from ${interfaceName}: ${missingMethods.join(', ')}`);
  }

  return true;
};