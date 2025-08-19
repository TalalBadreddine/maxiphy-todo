import { AuthService } from '../auth.service'
import { apiClient } from '@/services/api/client'
import { mockUser, mockAuthResponse } from '@/__tests__/test-utils'

// Mock the API client
jest.mock('@/services/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

// Mock window.location
const mockLocation = {
  href: '',
}
Object.defineProperty(window, 'location', { value: mockLocation })

describe('AuthService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocation.href = ''
  })

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    }

    it('should login successfully and store token', async () => {
      const mockResponse = {
        success: true,
        data: mockAuthResponse.data,
        message: 'Login successful',
      }
      mockApiClient.post.mockResolvedValue(mockResponse)

      const result = await AuthService.login(loginData)

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/login',
        loginData,
        { withCredentials: true }
      )
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'auth-token',
        mockAuthResponse.data.accessToken
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should throw error when login fails', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid credentials',
        data: null,
      }
      mockApiClient.post.mockResolvedValue(mockResponse)

      await expect(AuthService.login(loginData)).rejects.toThrow('Invalid credentials')
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network error')
      mockApiClient.post.mockRejectedValue(networkError)

      await expect(AuthService.login(loginData)).rejects.toThrow('Network error')
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })

    it('should throw error when response has no data', async () => {
      const mockResponse = {
        success: false,
        data: null,
        message: 'Login failed',
      }
      mockApiClient.post.mockResolvedValue(mockResponse)

      await expect(AuthService.login(loginData)).rejects.toThrow('Login failed')
    })
  })

  describe('register', () => {
    const registerData = {
      email: 'new@example.com',
      name: 'New User',
      password: 'password123',
      confirmPassword: 'password123',
    }

    it('should register successfully', async () => {
      const mockResponse = {
        success: true,
        data: mockAuthResponse.data,
        message: 'Registration successful',
      }
      mockApiClient.post.mockResolvedValue(mockResponse)

      const result = await AuthService.register(registerData)

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/register',
        {
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          // confirmPassword should be excluded
        },
        { withCredentials: true }
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should exclude confirmPassword from request', async () => {
      const mockResponse = {
        success: true,
        data: mockAuthResponse.data,
        message: 'Registration successful',
      }
      mockApiClient.post.mockResolvedValue(mockResponse)

      await AuthService.register(registerData)

      const requestData = mockApiClient.post.mock.calls[0][1]
      expect(requestData).not.toHaveProperty('confirmPassword')
      expect(requestData).toEqual({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
      })
    })

    it('should throw error when registration fails', async () => {
      const mockResponse = {
        success: false,
        message: 'Email already exists',
        data: null,
      }
      mockApiClient.post.mockResolvedValue(mockResponse)

      await expect(AuthService.register(registerData)).rejects.toThrow('Email already exists')
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockResponse = {
        success: true,
        data: mockUser,
        message: 'User retrieved',
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await AuthService.getCurrentUser()

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/auth/me',
        { withCredentials: true }
      )
      expect(result).toEqual(mockUser)
    })

    it('should throw error when user retrieval fails', async () => {
      const mockResponse = {
        success: false,
        message: 'Unauthorized',
        data: null,
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      await expect(AuthService.getCurrentUser()).rejects.toThrow('Unauthorized')
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network error')
      mockApiClient.get.mockRejectedValue(networkError)

      await expect(AuthService.getCurrentUser()).rejects.toThrow('Network error')
    })
  })

  describe('logout', () => {
    it('should logout successfully and remove token', async () => {
      const mockResponse = {
        success: true,
        message: 'Logged out',
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      await AuthService.logout()

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/auth/logout',
        { withCredentials: true }
      )
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-token')
    })

    it('should remove token even when logout request fails', async () => {
      const networkError = new Error('Network error')
      mockApiClient.get.mockRejectedValue(networkError)

      await AuthService.logout()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-token')
    })
  })

  describe('changePassword', () => {
    const changePasswordData = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
    }

    it('should change password successfully', async () => {
      const mockResponse = {
        success: true,
        data: { success: true, message: 'Password changed successfully' },
      }
      mockApiClient.post.mockResolvedValue(mockResponse)

      const result = await AuthService.changePassword(changePasswordData)

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/change-password',
        changePasswordData,
        { withCredentials: true }
      )
      expect(result).toEqual({ success: true, message: 'Password changed successfully' })
    })

    it('should handle password change failure', async () => {
      const networkError = new Error('Current password is incorrect')
      mockApiClient.post.mockRejectedValue(networkError)

      await expect(AuthService.changePassword(changePasswordData))
        .rejects.toThrow('Current password is incorrect')
    })
  })

  describe('forgotPassword', () => {
    const forgotPasswordData = {
      email: 'test@example.com',
    }

    it('should send forgot password request successfully', async () => {
      const mockResponse = {
        success: true,
        data: { success: true, message: 'Password reset email sent' },
      }
      mockApiClient.post.mockResolvedValue(mockResponse)

      const result = await AuthService.forgotPassword(forgotPasswordData)

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/forgot-password',
        forgotPasswordData
      )
      expect(result).toEqual({ success: true, message: 'Password reset email sent' })
    })

    it('should handle forgot password request failure', async () => {
      const networkError = new Error('Email not found')
      mockApiClient.post.mockRejectedValue(networkError)

      await expect(AuthService.forgotPassword(forgotPasswordData))
        .rejects.toThrow('Email not found')
    })
  })

  describe('resetPassword', () => {
    const resetPasswordData = {
      token: 'reset-token',
      password: 'newPassword123',
      confirmPassword: 'newPassword123',
    }

    it('should reset password successfully', async () => {
      const mockResponse = {
        success: true,
        data: { success: true, message: 'Password reset successfully' },
      }
      mockApiClient.post.mockResolvedValue(mockResponse)

      const result = await AuthService.resetPassword(resetPasswordData)

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/reset-password',
        {
          token: resetPasswordData.token,
          password: resetPasswordData.password,
          // confirmPassword should be excluded
        }
      )
      expect(result).toEqual({ success: true, message: 'Password reset successfully' })
    })

    it('should exclude confirmPassword from request', async () => {
      const mockResponse = {
        success: true,
        data: { success: true, message: 'Password reset successfully' },
      }
      mockApiClient.post.mockResolvedValue(mockResponse)

      await AuthService.resetPassword(resetPasswordData)

      const requestData = mockApiClient.post.mock.calls[0][1]
      expect(requestData).not.toHaveProperty('confirmPassword')
      expect(requestData).toEqual({
        token: resetPasswordData.token,
        password: resetPasswordData.password,
      })
    })
  })

  describe('verifyEmail', () => {
    const token = 'verification-token'

    it('should verify email successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          message: 'Email verified successfully',
          isVerified: true,
          isAlreadyVerified: false,
        },
      }
      mockApiClient.post.mockResolvedValue(mockResponse)

      const result = await AuthService.verifyEmail(token)

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/verify-email',
        { token }
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle email verification failure', async () => {
      const networkError = new Error('Invalid verification token')
      mockApiClient.post.mockRejectedValue(networkError)

      await expect(AuthService.verifyEmail(token))
        .rejects.toThrow('Invalid verification token')
    })
  })

  describe('checkAuthStatus', () => {
    it('should return true when user is authenticated', async () => {
      const mockResponse = {
        success: true,
        data: mockUser,
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await AuthService.checkAuthStatus()

      expect(result).toBe(true)
    })

    it('should return false when user is not authenticated', async () => {
      const networkError = new Error('Unauthorized')
      mockApiClient.get.mockRejectedValue(networkError)

      const result = await AuthService.checkAuthStatus()

      expect(result).toBe(false)
    })
  })

  describe('handleAuthError', () => {
    it('should redirect to login page', () => {
      AuthService.handleAuthError()

      expect(mockLocation.href).toBe('/login')
    })
  })

  describe('getCSRFToken', () => {
    it('should get CSRF token successfully', async () => {
      const mockResponse = {
        success: true,
        data: { csrfToken: 'csrf-token-123' },
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await AuthService.getCSRFToken()

      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/csrf-token')
      expect(result).toBe('csrf-token-123')
    })

    it('should return empty string when CSRF token request fails', async () => {
      const networkError = new Error('Network error')
      mockApiClient.get.mockRejectedValue(networkError)

      const result = await AuthService.getCSRFToken()

      expect(result).toBe('')
    })
  })
})