/**
 * Tests para AuthStore - Zustand
 * Sistema de Autenticación SAT-Digital Frontend
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useAuthStore } from '../authStore'
import * as authService from '../../services/authService'

// Mock del servicio de autenticación
vi.mock('../../services/authService', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
  getCurrentUser: vi.fn()
}))

describe('AuthStore - Tests Unitarios', () => {
  
  beforeEach(() => {
    // Resetear el store antes de cada test
    act(() => {
      useAuthStore.setState({
        usuario: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null
      })
    })
    
    // Limpiar mocks
    vi.clearAllMocks()
    
    // Limpiar localStorage
    localStorage.clear()
  })

  describe('Estado inicial', () => {
    it('debe tener estado inicial correcto', () => {
      const state = useAuthStore.getState()
      
      expect(state.usuario).toBeNull()
      expect(state.token).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('login', () => {
    it('debe hacer login exitoso y actualizar estado', async () => {
      // Arrange
      const mockLoginResponse = {
        success: true,
        data: {
          token: 'fake-jwt-token',
          refreshToken: 'fake-refresh-token',
          usuario: {
            id: 1,
            email: 'admin@satdigital.com',
            nombre: 'Administrador',
            rol: 'admin',
            proveedor_id: null
          }
        }
      }

      authService.login.mockResolvedValue(mockLoginResponse)

      // Act
      await act(async () => {
        await useAuthStore.getState().login('admin@satdigital.com', 'admin123')
      })

      // Assert
      const state = useAuthStore.getState()
      
      expect(state.isAuthenticated).toBe(true)
      expect(state.usuario).toEqual(mockLoginResponse.data.usuario)
      expect(state.token).toBe('fake-jwt-token')
      expect(state.refreshToken).toBe('fake-refresh-token')
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
      
      // Verificar que se guardó en localStorage
      expect(localStorage.getItem('sat_token')).toBe('fake-jwt-token')
      expect(localStorage.getItem('sat_refresh_token')).toBe('fake-refresh-token')
    })

    it('debe manejar error de login correctamente', async () => {
      // Arrange
      const mockErrorResponse = {
        success: false,
        error: 'Credenciales inválidas'
      }

      authService.login.mockResolvedValue(mockErrorResponse)

      // Act
      await act(async () => {
        await useAuthStore.getState().login('wrong@email.com', 'wrongpass')
      })

      // Assert
      const state = useAuthStore.getState()
      
      expect(state.isAuthenticated).toBe(false)
      expect(state.usuario).toBeNull()
      expect(state.token).toBeNull()
      expect(state.error).toBe('Credenciales inválidas')
      expect(state.loading).toBe(false)
    })

    it('debe mostrar loading durante login', async () => {
      // Arrange
      let resolveLogin
      const loginPromise = new Promise(resolve => {
        resolveLogin = resolve
      })
      
      authService.login.mockReturnValue(loginPromise)

      // Act - iniciar login pero no resolverlo aún
      const loginAction = act(async () => {
        useAuthStore.getState().login('test@example.com', 'password')
      })

      // Assert - verificar que loading es true
      expect(useAuthStore.getState().loading).toBe(true)

      // Resolver el login
      resolveLogin({
        success: true,
        data: {
          token: 'test-token',
          refreshToken: 'test-refresh',
          usuario: { id: 1, email: 'test@example.com', rol: 'admin' }
        }
      })

      await loginAction

      // Assert - verificar que loading es false
      expect(useAuthStore.getState().loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('debe hacer logout exitoso y limpiar estado', async () => {
      // Arrange - establecer estado autenticado
      act(() => {
        useAuthStore.setState({
          usuario: { id: 1, email: 'test@example.com', rol: 'admin' },
          token: 'test-token',
          refreshToken: 'test-refresh',
          isAuthenticated: true
        })
      })

      // Establecer tokens en localStorage
      localStorage.setItem('sat_token', 'test-token')
      localStorage.setItem('sat_refresh_token', 'test-refresh')

      authService.logout.mockResolvedValue({ success: true })

      // Act
      await act(async () => {
        await useAuthStore.getState().logout()
      })

      // Assert
      const state = useAuthStore.getState()
      
      expect(state.isAuthenticated).toBe(false)
      expect(state.usuario).toBeNull()
      expect(state.token).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.error).toBeNull()
      
      // Verificar que se limpió localStorage
      expect(localStorage.getItem('sat_token')).toBeNull()
      expect(localStorage.getItem('sat_refresh_token')).toBeNull()
    })
  })

  describe('refreshToken', () => {
    it('debe renovar token exitosamente', async () => {
      // Arrange
      const mockRefreshResponse = {
        success: true,
        data: {
          token: 'new-jwt-token'
        }
      }

      authService.refreshToken.mockResolvedValue(mockRefreshResponse)

      act(() => {
        useAuthStore.setState({
          refreshToken: 'current-refresh-token',
          isAuthenticated: true
        })
      })

      // Act
      await act(async () => {
        await useAuthStore.getState().refreshToken()
      })

      // Assert
      const state = useAuthStore.getState()
      
      expect(state.token).toBe('new-jwt-token')
      expect(localStorage.getItem('sat_token')).toBe('new-jwt-token')
      expect(authService.refreshToken).toHaveBeenCalledWith('current-refresh-token')
    })

    it('debe manejar error en refresh token', async () => {
      // Arrange
      const mockErrorResponse = {
        success: false,
        error: 'Refresh token inválido'
      }

      authService.refreshToken.mockResolvedValue(mockErrorResponse)

      act(() => {
        useAuthStore.setState({
          refreshToken: 'invalid-refresh-token',
          isAuthenticated: true
        })
      })

      // Act
      await act(async () => {
        await useAuthStore.getState().refreshToken()
      })

      // Assert
      const state = useAuthStore.getState()
      
      expect(state.isAuthenticated).toBe(false)
      expect(state.token).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.error).toBe('Refresh token inválido')
    })
  })

  describe('Funciones helper de roles', () => {
    beforeEach(() => {
      // Establecer usuario con rol admin
      act(() => {
        useAuthStore.setState({
          usuario: { id: 1, email: 'admin@test.com', rol: 'admin' },
          isAuthenticated: true
        })
      })
    })

    it('isAdmin debe retornar true para usuario admin', () => {
      const state = useAuthStore.getState()
      expect(state.isAdmin()).toBe(true)
    })

    it('isAuditor debe retornar false para usuario admin', () => {
      const state = useAuthStore.getState()
      expect(state.isAuditor()).toBe(false)
    })

    it('isProvider debe retornar false para usuario admin', () => {
      const state = useAuthStore.getState()
      expect(state.isProvider()).toBe(false)
    })

    it('isViewer debe retornar false para usuario admin', () => {
      const state = useAuthStore.getState()
      expect(state.isViewer()).toBe(false)
    })
  })

  describe('Funciones helper con diferentes roles', () => {
    it('debe identificar correctamente rol auditor', () => {
      // Arrange
      act(() => {
        useAuthStore.setState({
          usuario: { id: 2, email: 'auditor@test.com', rol: 'auditor' },
          isAuthenticated: true
        })
      })

      // Assert
      const state = useAuthStore.getState()
      expect(state.isAdmin()).toBe(false)
      expect(state.isAuditor()).toBe(true)
      expect(state.isProvider()).toBe(false)
      expect(state.isViewer()).toBe(false)
    })

    it('debe identificar correctamente rol proveedor', () => {
      // Arrange
      act(() => {
        useAuthStore.setState({
          usuario: { id: 3, email: 'proveedor@test.com', rol: 'proveedor', proveedor_id: 1 },
          isAuthenticated: true
        })
      })

      // Assert
      const state = useAuthStore.getState()
      expect(state.isAdmin()).toBe(false)
      expect(state.isAuditor()).toBe(false)
      expect(state.isProvider()).toBe(true)
      expect(state.isViewer()).toBe(false)
    })

    it('debe identificar correctamente rol visualizador', () => {
      // Arrange
      act(() => {
        useAuthStore.setState({
          usuario: { id: 4, email: 'viewer@test.com', rol: 'visualizador' },
          isAuthenticated: true
        })
      })

      // Assert
      const state = useAuthStore.getState()
      expect(state.isAdmin()).toBe(false)
      expect(state.isAuditor()).toBe(false)
      expect(state.isProvider()).toBe(false)
      expect(state.isViewer()).toBe(true)
    })
  })

  describe('clearError', () => {
    it('debe limpiar error correctamente', () => {
      // Arrange
      act(() => {
        useAuthStore.setState({
          error: 'Error de prueba'
        })
      })

      expect(useAuthStore.getState().error).toBe('Error de prueba')

      // Act
      act(() => {
        useAuthStore.getState().clearError()
      })

      // Assert
      expect(useAuthStore.getState().error).toBeNull()
    })
  })

  describe('initializeAuth', () => {
    it('debe inicializar autenticación desde localStorage', async () => {
      // Arrange
      localStorage.setItem('sat_token', 'stored-token')
      localStorage.setItem('sat_refresh_token', 'stored-refresh')

      const mockUser = {
        id: 1,
        email: 'stored@example.com',
        rol: 'admin'
      }

      authService.getCurrentUser.mockResolvedValue({
        success: true,
        data: { usuario: mockUser }
      })

      // Act
      await act(async () => {
        await useAuthStore.getState().initializeAuth()
      })

      // Assert
      const state = useAuthStore.getState()
      
      expect(state.token).toBe('stored-token')
      expect(state.refreshToken).toBe('stored-refresh')
      expect(state.usuario).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
    })

    it('debe limpiar estado si no hay tokens en localStorage', async () => {
      // Arrange - no hay tokens en localStorage
      localStorage.clear()

      // Act
      await act(async () => {
        await useAuthStore.getState().initializeAuth()
      })

      // Assert
      const state = useAuthStore.getState()
      
      expect(state.token).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.usuario).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })
})
