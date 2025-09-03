/**
 * Vitest Setup - SAT-Digital Frontend
 * Configuración inicial para todos los tests del frontend
 */

import { expect, afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { setupServer } from 'msw/node'
import { rest } from 'msw'

// Extender expect con matchers de testing-library
expect.extend(matchers)

// Limpiar después de cada test
afterEach(() => {
  cleanup()
})

// Mock de API para tests
export const server = setupServer(
  // Auth endpoints mock
  rest.post('http://localhost:3001/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          token: 'fake-jwt-token',
          refreshToken: 'fake-refresh-token',
          usuario: {
            id: 1,
            email: 'admin@satdigital.com',
            nombre: 'Administrador Test',
            rol: 'admin',
            proveedor_id: null
          }
        }
      })
    )
  }),

  rest.post('http://localhost:3001/api/auth/refresh', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          token: 'new-fake-jwt-token'
        }
      })
    )
  }),

  rest.post('http://localhost:3001/api/auth/logout', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        message: 'Logout exitoso'
      })
    )
  }),

  rest.get('http://localhost:3001/api/auth/me', (req, res, ctx) => {
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: 'Token requerido'
        })
      )
    }

    return res(
      ctx.json({
        success: true,
        data: {
          usuario: {
            id: 1,
            email: 'admin@satdigital.com',
            nombre: 'Administrador Test',
            rol: 'admin',
            proveedor_id: null
          }
        }
      })
    )
  }),

  // Dashboard endpoints mock
  rest.get('http://localhost:3001/api/dashboard/stats', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          usuarios_activos: 6,
          proveedores_total: 5,
          auditorias_activas: 2,
          sistema_operativo: 95
        }
      })
    )
  })
)

// Configurar servidor mock
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock de IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock de ResizeObserver  
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock de localStorage
const localStorageMock = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
  removeItem: (key) => window.localStorage.removeItem(key),
  clear: () => window.localStorage.clear(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: (key) => window.sessionStorage.getItem(key),
  setItem: (key, value) => window.sessionStorage.setItem(key, value),  
  removeItem: (key) => window.sessionStorage.removeItem(key),
  clear: () => window.sessionStorage.clear(),
}

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// Helpers globales para tests
global.testHelpers = {
  /**
   * Crea usuario mock para tests
   */
  createMockUser: (overrides = {}) => ({
    id: 1,
    email: 'test@example.com',
    nombre: 'Usuario Test',
    rol: 'admin',
    estado: 'activo',
    proveedor_id: null,
    ...overrides
  }),

  /**
   * Crea respuesta exitosa mock
   */
  createMockResponse: (data = {}) => ({
    success: true,
    data,
    message: 'Operación exitosa'
  }),

  /**
   * Crea respuesta de error mock
   */
  createMockError: (message = 'Error de prueba', code = 400) => ({
    success: false,
    error: message,
    code
  }),

  /**
   * Simula delay para operaciones async
   */
  delay: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Mock de Zustand store
   */
  createMockStore: (initialState = {}) => {
    let state = { ...initialState }
    
    return {
      getState: () => state,
      setState: (newState) => {
        state = typeof newState === 'function' ? newState(state) : { ...state, ...newState }
      },
      subscribe: () => () => {}
    }
  }
}

// Configuración de console para tests
const originalError = console.error
console.error = (...args) => {
  // Silenciar warnings específicos de React en tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
     args[0].includes('Warning: validateDOMNesting'))
  ) {
    return
  }
  originalError.call(console, ...args)
}
