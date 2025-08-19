"use client"

import * as React from "react"
import { Toast, ToastProps, ToastViewport } from "@/components/ui/toast"

interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, "id">) => string
  removeToast: (id: string) => void
  removeAllToasts: () => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: React.ReactNode
  maxToasts?: number
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastProps = {
      ...toast,
      id,
      duration: toast.duration ?? 5000, // Default 5 seconds
    }

    setToasts((prevToasts) => {
      const updatedToasts = [newToast, ...prevToasts]
      // Limit the number of toasts
      return updatedToasts.slice(0, maxToasts)
    })

    return id
  }, [maxToasts])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  const removeAllToasts = React.useCallback(() => {
    setToasts([])
  }, [])

  const contextValue = React.useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      removeAllToasts,
    }),
    [toasts, addToast, removeToast, removeAllToasts]
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastViewport>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastViewport>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// Convenience functions for different toast types
export function useToastHelpers() {
  const { addToast } = useToast()

  return React.useMemo(
    () => ({
      success: (props: Omit<ToastProps, "id" | "type">) =>
        addToast({ ...props, type: "success" }),
      error: (props: Omit<ToastProps, "id" | "type">) =>
        addToast({ ...props, type: "error" }),
      warning: (props: Omit<ToastProps, "id" | "type">) =>
        addToast({ ...props, type: "warning" }),
      info: (props: Omit<ToastProps, "id" | "type">) =>
        addToast({ ...props, type: "info" }),
    }),
    [addToast]
  )
}