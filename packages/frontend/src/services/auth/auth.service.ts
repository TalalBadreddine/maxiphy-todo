import { apiClient } from "@/services/api/client"
import { SimpleErrorService } from "@/lib/errors/simple-error-service"
import { AuthResponse, User } from "@/types/auth"
import {
  LoginFormData,
  RegisterFormData,
  ChangePasswordFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData
} from "@/lib/validations/auth"

type RegisterRequestData = Omit<RegisterFormData, 'confirmPassword'>
type ResetPasswordRequestData = Omit<ResetPasswordFormData, 'confirmPassword'>

export class AuthService {
  private static readonly ENDPOINTS = {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    CHANGE_PASSWORD: "/auth/change-password",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
  } as const


  static async login(credentials: LoginFormData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        this.ENDPOINTS.LOGIN,
        credentials,
        {
          withCredentials: true,
        }
      )

      if (response.success && response.data) {
        localStorage.setItem("auth-token", response.data.accessToken)
        return response.data
      }

      throw new Error(response.message || 'Login failed')
    } catch (error) {
      const simpleError = SimpleErrorService.handle(error)
      throw simpleError
    }
  }


  static async register(userData: RegisterFormData): Promise<AuthResponse> {
    try {
      const registerData: RegisterRequestData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
      }

      const response = await apiClient.post<AuthResponse>(
        this.ENDPOINTS.REGISTER,
        registerData,
        {
          withCredentials: true,
        }
      )

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.message || 'Registration failed')
    } catch (error) {
      const simpleError = SimpleErrorService.handle(error)
      throw simpleError
    }
  }


  static async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>(this.ENDPOINTS.ME, {
        withCredentials: true,
      })

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.message || 'Failed to get user profile')
    } catch (error) {
      const simpleError = SimpleErrorService.handle(error)
      throw simpleError
    }
  }




  static async logout(): Promise<void> {
    try {
      await apiClient.get(this.ENDPOINTS.LOGOUT, {
        withCredentials: true,
      })
    } catch (error) {
      // Logout errors are handled silently
    } finally {
      // Always remove the token, even if the request fails
      localStorage.removeItem("auth-token")
    }
  }


  static async changePassword(data: ChangePasswordFormData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        this.ENDPOINTS.CHANGE_PASSWORD,
        data,
        {
          withCredentials: true,
        }
      )

      return response.data || { success: false, message: 'Password change failed' }
    } catch (error) {
      const simpleError = SimpleErrorService.handle(error)
      throw simpleError
    }
  }


  static async forgotPassword(data: ForgotPasswordFormData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        this.ENDPOINTS.FORGOT_PASSWORD,
        data
      )

      return response.data || { success: false, message: 'Password reset request failed' }
    } catch (error) {
      const simpleError = SimpleErrorService.handle(error)
      throw simpleError
    }
  }

  static async resetPassword(data: ResetPasswordFormData): Promise<{ success: boolean; message: string }> {
    try {
      // Remove confirmPassword from request - only send token and password
      const resetData: ResetPasswordRequestData = {
        token: data.token,
        password: data.password,
      }

      const response = await apiClient.post<{ success: boolean; message: string }>(
        this.ENDPOINTS.RESET_PASSWORD,
        resetData
      )

      return response.data || { success: false, message: 'Password reset failed' }
    } catch (error) {
      const simpleError = SimpleErrorService.handle(error)
      throw simpleError
    }
  }


  static async verifyEmail(token: string): Promise<{ success: boolean; message: string; isVerified: boolean; isAlreadyVerified: boolean }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string; isVerified: boolean; isAlreadyVerified: boolean }>(
        this.ENDPOINTS.VERIFY_EMAIL,
        { token }
      )

      return response.data || { success: false, message: 'Email verification failed' }
    } catch (error) {
      const simpleError = SimpleErrorService.handle(error)
      throw simpleError
    }
  }


  static async checkAuthStatus(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch {
      return false
    }
  }


  static handleAuthError(): void {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }


  static async getCSRFToken(): Promise<string> {
    try {
      const response = await apiClient.get<{ csrfToken: string }>('/auth/csrf-token')
      return response.data?.csrfToken || ''
    } catch (error) {
      return ''
    }
  }
}