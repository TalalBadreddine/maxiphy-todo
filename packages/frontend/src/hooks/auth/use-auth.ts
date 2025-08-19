"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AuthService } from "@/services/auth/auth.service"
import { AuthResponse } from "@/types/auth"
import {
  LoginFormData,
  RegisterFormData,
  ChangePasswordFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData
} from "@/lib/validations/auth"
import { useRouter } from "next/navigation"

export const AUTH_KEYS = {
  currentUser: ["auth", "currentUser"] as const,
  authStatus: ["auth", "status"] as const,
} as const


export function useLogin() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginFormData) => AuthService.login(credentials),
    onSuccess: (data: AuthResponse) => {
      queryClient.setQueryData(AUTH_KEYS.currentUser, data.user)
      queryClient.setQueryData(AUTH_KEYS.authStatus, true)
      router.push("/dashboard")
    },
    onError: (error: any) => {
      console.log(error)
    },
  })
}

export function useRegister() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: RegisterFormData) => AuthService.register(userData),
    onSuccess: (data: AuthResponse) => {
      queryClient.setQueryData(AUTH_KEYS.currentUser, data.user)
      queryClient.setQueryData(AUTH_KEYS.authStatus, true)
      router.push("/dashboard")
    },
    onError: (error: any) => {
      console.log(error)
    },
  })
}

export function useCurrentUser() {
  const query = useQuery({
    queryKey: AUTH_KEYS.currentUser,
    queryFn: () => AuthService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })

  // Handle 401 errors
  React.useEffect(() => {
    if (query.error && (query.error as any)?.status === 401 || (query.error as any)?.statusCode === 401) {
      AuthService.handleAuthError()
    }
  }, [query.error])

  return query
}

export function useAuthStatus() {
  return useQuery({
    queryKey: AUTH_KEYS.authStatus,
    queryFn: () => AuthService.checkAuthStatus(),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: false,
  })
}

export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => AuthService.logout(),
    onSettled: () => {
      queryClient.clear()
      router.push("/login")
    },
  })
}

export function useChangePassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ChangePasswordFormData) => AuthService.changePassword(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.currentUser })
    },
    onError: (error: any) => {
      console.log(error)
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordFormData) => AuthService.forgotPassword(data),
    onError: (error: any) => {
      console.log(error)
    },
  })
}

export function useResetPassword() {
  const router = useRouter()

  return useMutation({
    mutationFn: (data: ResetPasswordFormData) => AuthService.resetPassword(data),
    onSuccess: () => {
      router.push("/login")
    },
    onError: (error: any) => {
      console.log(error)
    },
  })
}


export function useVerifyEmail() {
  const router = useRouter()

  return useMutation({
    mutationFn: (token: string) => AuthService.verifyEmail(token),
    onSuccess: () => {
      router.push("/dashboard")
    },
    onError: (error: any) => {
      console.log(error)
    },
  })
}


export function useAuth() {
  const { data: user, isLoading: userLoading, error: userError } = useCurrentUser()
  const { data: isAuthenticated, isLoading: statusLoading } = useAuthStatus()
  const logout = useLogout()

  return {
    user,
    isAuthenticated: Boolean(isAuthenticated && user),
    isLoading: userLoading || statusLoading,
    error: userError,
    logout: logout.mutate,
    isLoggingOut: logout.isPending,
  }
}