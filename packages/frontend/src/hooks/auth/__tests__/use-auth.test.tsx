import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useLogin, useRegister, useCurrentUser, useAuth, useLogout } from '../use-auth'
import { AuthService } from '@/services/auth/auth.service'
import { mockUser, mockAuthResponse } from '@/__tests__/test-utils'

// Mock the AuthService
jest.mock('@/services/auth/auth.service', () => ({
  AuthService: {
    login: jest.fn(),
    register: jest.fn(),
    getCurrentUser: jest.fn(),
    checkAuthStatus: jest.fn(),
    logout: jest.fn(),
    handleAuthError: jest.fn(),
  },
}))

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('useAuth hooks', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    })
    jest.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('useLogin', () => {
    it('should login successfully and redirect to dashboard', async () => {
      const mockLogin = AuthService.login as jest.MockedFunction<typeof AuthService.login>
      mockLogin.mockResolvedValue(mockAuthResponse)

      const { result } = renderHook(() => useLogin(), { wrapper })

      await result.current.mutateAsync({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('should handle login error', async () => {
      const mockLogin = AuthService.login as jest.MockedFunction<typeof AuthService.login>
      const loginError = new Error('Invalid credentials')
      mockLogin.mockRejectedValue(loginError)

      const { result } = renderHook(() => useLogin(), { wrapper })

      await expect(result.current.mutateAsync({
        email: 'test@example.com',
        password: 'wrongpassword',
      })).rejects.toThrow('Invalid credentials')

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('useRegister', () => {
    it('should register successfully and redirect to dashboard', async () => {
      const mockRegister = AuthService.register as jest.MockedFunction<typeof AuthService.register>
      mockRegister.mockResolvedValue(mockAuthResponse)

      const { result } = renderHook(() => useRegister(), { wrapper })

      await result.current.mutateAsync({
        email: 'new@example.com',
        name: 'New User',
        password: 'password123',
      })

      expect(mockRegister).toHaveBeenCalledWith({
        email: 'new@example.com',
        name: 'New User',
        password: 'password123',
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('should handle registration error', async () => {
      const mockRegister = AuthService.register as jest.MockedFunction<typeof AuthService.register>
      const registrationError = new Error('Email already exists')
      mockRegister.mockRejectedValue(registrationError)

      const { result } = renderHook(() => useRegister(), { wrapper })

      await expect(result.current.mutateAsync({
        email: 'existing@example.com',
        name: 'User',
        password: 'password123',
      })).rejects.toThrow('Email already exists')

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('useCurrentUser', () => {
    it('should fetch current user successfully', async () => {
      const mockGetCurrentUser = AuthService.getCurrentUser as jest.MockedFunction<typeof AuthService.getCurrentUser>
      mockGetCurrentUser.mockResolvedValue(mockUser)

      const { result } = renderHook(() => useCurrentUser(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockUser)
      expect(mockGetCurrentUser).toHaveBeenCalled()
    })

    it('should handle 401 error and call handleAuthError', async () => {
      const mockGetCurrentUser = AuthService.getCurrentUser as jest.MockedFunction<typeof AuthService.getCurrentUser>
      const mockHandleAuthError = AuthService.handleAuthError as jest.MockedFunction<typeof AuthService.handleAuthError>
      
      const authError = { status: 401, message: 'Unauthorized' }
      mockGetCurrentUser.mockRejectedValue(authError)

      const { result } = renderHook(() => useCurrentUser(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(mockHandleAuthError).toHaveBeenCalled()
    })
  })

  describe('useLogout', () => {
    it('should logout successfully and redirect to login', async () => {
      const mockLogout = AuthService.logout as jest.MockedFunction<typeof AuthService.logout>
      mockLogout.mockResolvedValue(undefined)

      const { result } = renderHook(() => useLogout(), { wrapper })

      await result.current.mutateAsync()

      expect(mockLogout).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('should clear query client on logout regardless of result', async () => {
      const mockLogout = AuthService.logout as jest.MockedFunction<typeof AuthService.logout>
      mockLogout.mockRejectedValue(new Error('Logout failed'))

      const clearSpy = jest.spyOn(queryClient, 'clear')

      const { result } = renderHook(() => useLogout(), { wrapper })

      try {
        await result.current.mutateAsync()
      } catch (error) {
        // Expected to fail
      }

      expect(clearSpy).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  describe('useAuth', () => {
    it('should return authenticated state when user is logged in', async () => {
      const mockGetCurrentUser = AuthService.getCurrentUser as jest.MockedFunction<typeof AuthService.getCurrentUser>
      const mockCheckAuthStatus = AuthService.checkAuthStatus as jest.MockedFunction<typeof AuthService.checkAuthStatus>
      
      mockGetCurrentUser.mockResolvedValue(mockUser)
      mockCheckAuthStatus.mockResolvedValue(true)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isLoading).toBe(false)
    })

    it('should return unauthenticated state when user is not logged in', async () => {
      const mockGetCurrentUser = AuthService.getCurrentUser as jest.MockedFunction<typeof AuthService.getCurrentUser>
      const mockCheckAuthStatus = AuthService.checkAuthStatus as jest.MockedFunction<typeof AuthService.checkAuthStatus>
      
      mockGetCurrentUser.mockResolvedValue(null)
      mockCheckAuthStatus.mockResolvedValue(false)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toBeFalsy()
    })

    it('should show loading state while fetching user data', () => {
      const mockGetCurrentUser = AuthService.getCurrentUser as jest.MockedFunction<typeof AuthService.getCurrentUser>
      const mockCheckAuthStatus = AuthService.checkAuthStatus as jest.MockedFunction<typeof AuthService.checkAuthStatus>
      
      // Create promises that don't resolve immediately
      mockGetCurrentUser.mockImplementation(() => new Promise(() => {}))
      mockCheckAuthStatus.mockImplementation(() => new Promise(() => {}))

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.isAuthenticated).toBe(false)
    })
  })
})