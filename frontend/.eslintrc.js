/**
 * ESLint Configuration - SAT-Digital Frontend
 * Reglas de linting para React y metodología BEM
 */

export default {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
    'vitest-globals/env': true
  },
  
  extends: [
    'eslint:recommended',
    '@vitejs/eslint-config-react',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:vitest-globals/recommended'
  ],
  
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  
  settings: {
    react: {
      version: '18.2'
    }
  },
  
  plugins: [
    'react',
    'react-hooks',
    'react-refresh',
    'vitest-globals'
  ],
  
  rules: {
    // React rules
    'react/jsx-no-target-blank': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    
    // Reglas de hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Reglas de código limpio
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    
    // Reglas de estructura de código
    'indent': ['error', 2, { SwitchCase: 1 }],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    
    // Reglas específicas para metodología BEM en className
    'jsx-quotes': ['error', 'prefer-double'],
    
    // Reglas de JSX
    'react/jsx-indent': ['error', 2],
    'react/jsx-indent-props': ['error', 2],
    'react/jsx-closing-bracket-location': ['error', 'tag-aligned'],
    'react/jsx-closing-tag-location': 'error',
    'react/jsx-curly-spacing': ['error', 'never'],
    'react/jsx-equals-spacing': ['error', 'never'],
    'react/jsx-first-prop-new-line': ['error', 'multiline'],
    'react/jsx-max-props-per-line': ['error', { maximum: 1, when: 'multiline' }],
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-pascal-case': 'error',
    'react/jsx-tag-spacing': ['error', { beforeSelfClosing: 'always' }],
    'react/jsx-wrap-multilines': ['error', {
      declaration: 'parens-new-line',
      assignment: 'parens-new-line',
      return: 'parens-new-line',
      arrow: 'parens-new-line'
    }],
    
    // Reglas específicas para SAT-Digital
    'camelcase': ['error', { properties: 'always', ignoreDestructuring: false }],
    'max-len': ['warn', { 
      code: 100, 
      ignoreComments: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true
    }],
    
    // Reglas de funciones
    'function-paren-newline': ['error', 'multiline'],
    'prefer-template': 'error',
    'template-curly-spacing': ['error', 'never'],
    
    // Reglas de objetos y arrays
    'object-shorthand': 'error',
    'prefer-destructuring': ['error', { object: true, array: false }],
    
    // Reglas de importaciones
    'sort-imports': ['error', {
      ignoreCase: true,
      ignoreDeclarationSort: true,
      ignoreMemberSort: false,
      memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      allowSeparatedGroups: true
    }]
  },
  
  overrides: [
    {
      // Reglas específicas para archivos de test
      files: ['**/*.test.{js,jsx}', '**/*.spec.{js,jsx}', 'src/test/**/*.{js,jsx}'],
      env: {
        'vitest-globals/env': true
      },
      rules: {
        'no-magic-numbers': 'off',
        'max-len': 'off'
      }
    },
    {
      // Reglas específicas para archivos de configuración
      files: ['*.config.{js,jsx}', 'vite.config.js'],
      rules: {
        'no-magic-numbers': 'off'
      }
    },
    {
      // Reglas específicas para stores (Zustand)
      files: ['**/store/**/*.{js,jsx}', '**/*Store.{js,jsx}'],
      rules: {
        'no-param-reassign': 'off'
      }
    }
  ]
}
