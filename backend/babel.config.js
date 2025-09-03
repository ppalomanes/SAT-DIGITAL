/**
 * Babel Configuration - SAT-Digital Backend
 * Configuración para transpilación ES6+ en Jest
 */

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '18'
        },
        // Usar módulos CommonJS para Jest
        modules: 'commonjs'
      }
    ]
  ],
  
  // Plugins adicionales si son necesarios
  plugins: [],
  
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: '18'
            },
            modules: 'commonjs'
          }
        ]
      ]
    }
  }
};
