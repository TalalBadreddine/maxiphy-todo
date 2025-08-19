"use client"

import React, { ReactNode, useEffect, useState } from "react"
import { ErrorBoundary } from "@/components/error-boundary"

interface AsyncErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error) => void
}

interface AsyncErrorState {
  asyncError: Error | null
  errorId: string | null
}

export function AsyncErrorBoundary({
  children,
  fallback,
  onError
}: AsyncErrorBoundaryProps) {
  const [asyncErrorState, setAsyncErrorState] = useState<AsyncErrorState>({
    asyncError: null,
    errorId: null
  })

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason))
      
      const errorId = Math.random().toString(36).substring(2, 9)
      
      setAsyncErrorState({
        asyncError: error,
        errorId
      })
      
      onError?.(error)
      
      // Prevent the error from being logged to console
      event.preventDefault()
    }

    const handleError = (event: ErrorEvent) => {
      const error = event.error || new Error(event.message)
      const errorId = Math.random().toString(36).substring(2, 9)
      
      setAsyncErrorState({
        asyncError: error,
        errorId
      })
      
      onError?.(error)
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [onError])

  const handleReset = () => {
    setAsyncErrorState({
      asyncError: null,
      errorId: null
    })
  }

  // If there's an async error, throw it so the ErrorBoundary can catch it
  if (asyncErrorState.asyncError) {
    return (
      <ErrorBoundary
        fallback={fallback}
        onError={(error, errorInfo) => {
          console.error('Async Error Boundary:', {
            error,
            errorInfo,
            errorId: asyncErrorState.errorId
          })
        }}
      >
        <AsyncErrorThrower 
          error={asyncErrorState.asyncError} 
          onReset={handleReset}
        />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary
      fallback={fallback}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  )
}

// Component that throws the async error to be caught by ErrorBoundary
function AsyncErrorThrower({ 
  error, 
  onReset 
}: { 
  error: Error
  onReset: () => void 
}) {
  useEffect(() => {
    // Schedule the error to be thrown after the component mounts
    const throwError = () => {
      throw error
    }
    
    // Use setTimeout to ensure the error is thrown after render
    const timer = setTimeout(throwError, 0)
    
    return () => clearTimeout(timer)
  }, [error])

  // Provide a way to reset the error state
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onReset()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onReset])

  return null
}