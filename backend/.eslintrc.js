/**
 * ESLint Configuration - SAT-Digital Backend
 * Reglas de linting para Node.js y metodología BEM
 */

module.exports = {
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'prettier'
  ],
  
  plugins: [
    'node'
  ],
  
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  
  rules: {
    // Reglas de código limpio
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    
    // Reglas de Node.js
    'node/no-unsupported-features/es-syntax': 'off',
    'node/no-missing-import': 'off',
    'node/no-extraneous-import': 'error',
    
    // Reglas de estructura de código
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    
    // Reglas específicas para SAT-Digital
    'camelcase': ['error', { properties: 'always', ignoreDestructuring: false }],
    'max-len': ['warn', { code: 100, ignoreComments: true }],
    'no-magic-numbers': ['warn', { ignore: [0, 1, -1, 200, 400, 401, 403, 404, 500] }],
    
    // Reglas de funciones
    'function-paren-newline': ['error', 'multiline'],
    'prefer-template': 'error',
    'template-curly-spacing': ['error', 'never'],
    
    // Reglas de objetos y arrays
    'object-shorthand': 'error',
    'prefer-destructuring': ['error', { object: true, array: false }],
    
    // Reglas de promesas
    'prefer-promise-reject-errors': 'error',
    
    // Reglas de seguridad
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error'
  },
  
  overrides: [
    {
      // Reglas específicas para archivos de test
      files: ['**/*.test.js', '**/*.spec.js', '**/tests/**/*.js'],
      env: {
        jest: true
      },
      rules: {
        'no-magic-numbers': 'off',
        'max-len': 'off'
      }
    },
    {
      // Reglas específicas para archivos de configuración
      files: ['*.config.js', 'jest.config.js', 'babel.config.js'],
      rules: {
        'no-magic-numbers': 'off'
      }
    },
    {
      // Reglas específicas para migraciones y seeders
      files: ['src/shared/database/migrations/**/*.js', 'src/shared/database/seeders/**/*.js'],
      rules: {
        'no-magic-numbers': 'off',
        'camelcase': 'off'
      }
    }
  ],
  
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'coverage/',
    'uploads/',
    'temp/',
    '*.min.js'
  ]
};
