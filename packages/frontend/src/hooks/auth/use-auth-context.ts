"use client"

import React, { createContext, useContext, useMemo, ReactNode } from "react"
import { useAuth } from "./use-auth"

interface AuthContextValue {
  user: any
  isAuthenticated: boolean
  isLoading: boolean
  error: any
  logout: () => void
  isLoggingOut: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  const value = useMemo(
    () => ({
      user: auth.user,
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      error: auth.error,
      logout: auth.logout,
      isLoggingOut: auth.isLoggingOut,
    }),
    [
      auth.user,
      auth.isAuthenticated,
      auth.isLoading,
      auth.error,
      auth.logout,
      auth.isLoggingOut,
    ]
  )

  return React.createElement(AuthContext.Provider, { value }, children)
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}