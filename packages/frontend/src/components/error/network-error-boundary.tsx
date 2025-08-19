"use client"

import React, { ReactNode, useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react"

interface NetworkErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onRetry?: () => void
  showOfflineIndicator?: boolean
}

interface NetworkState {
  isOnline: boolean
  hasNetworkError: boolean
  retryCount: number
}

export function NetworkErrorBoundary({
  children,
  fallback,
  onRetry,
  showOfflineIndicator = true
}: NetworkErrorBoundaryProps) {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    hasNetworkError: false,
    retryCount: 0
  })

  useEffect(() => {
    const handleOnline = () => {
      setNetworkState(prev => ({
        ...prev,
        isOnline: true,
        hasNetworkError: false
      }))
    }

    const handleOffline = () => {
      setNetworkState(prev => ({
        ...prev,
        isOnline: false,
        hasNetworkError: true
      }))
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Check if it's a network-related error
      const isNetworkError = 
        event.reason?.name === 'NetworkError' ||
        event.reason?.code === 'NETWORK_ERROR' ||
        event.reason?.message?.includes('fetch') ||
        event.reason?.message?.includes('network') ||
        event.reason?.message?.includes('offline')

      if (isNetworkError) {
        setNetworkState(prev => ({
          ...prev,
          hasNetworkError: true
        }))
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  const handleRetry = () => {
    setNetworkState(prev => ({
      ...prev,
      hasNetworkError: false,
      retryCount: prev.retryCount + 1
    }))
    onRetry?.()
  }

  if (!networkState.isOnline && showOfflineIndicator) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-2 text-center">
        <div className="flex items-center justify-center space-x-2">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">You are currently offline</span>
        </div>
      </div>
    )
  }

  if (networkState.hasNetworkError && !networkState.isOnline) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <div className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Connection Problem
              </h2>
              <p className="text-sm text-gray-600">
                Unable to connect to the server. Please check your internet connection and try again.
              </p>
            </div>

            <div className="flex flex-col w-full space-y-2">
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Connection
              </Button>
              
              {networkState.retryCount > 0 && (
                <p className="text-xs text-gray-500 text-center">
                  Retry attempts: {networkState.retryCount}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-500">
              {networkState.isOnline ? (
                <>
                  <Wifi className="h-3 w-3 text-green-500" />
                  <span>Connected to internet</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-red-500" />
                  <span>No internet connection</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return <>{children}</>
}