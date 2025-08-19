"use client"

import React, { ErrorInfo, ReactNode, memo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Copy, Bug, Home } from "lucide-react"
import { SimpleErrorService } from "@/lib/errors/simple-error-service"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showReportButton?: boolean
  enableAutoRetry?: boolean
  retryCount?: number
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId?: string
  retryAttempts: number
}

class ErrorBoundaryClass extends React.Component<Props, State> {
  private retryTimer?: NodeJS.Timeout

  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false,
      retryAttempts: 0
    }
  }

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = Math.random().toString(36).substring(2, 9)
    return { 
      hasError: true, 
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Store error info for better reporting
    this.setState({ errorInfo })
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo)
    
    // Log error for monitoring
    const simpleError = SimpleErrorService.handle(error)
    console.error('Error Boundary:', simpleError)
    
    // Auto-retry if enabled
    if (this.props.enableAutoRetry && this.state.retryAttempts < (this.props.retryCount ?? 3)) {
      this.retryTimer = setTimeout(() => {
        this.setState((prevState) => ({
          retryAttempts: prevState.retryAttempts + 1
        }))
        this.handleReset()
      }, Math.pow(2, this.state.retryAttempts) * 1000) // Exponential backoff
    }
  }

  handleReset = () => {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
    }
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined 
    })
  }

  handleCopyError = () => {
    const errorDetails = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    const errorText = JSON.stringify(errorDetails, null, 2)
    navigator.clipboard.writeText(errorText)
  }

  handleReportError = () => {
    // This would typically integrate with your error reporting service
    console.log("Reporting error:", {
      error: this.state.error,
      errorInfo: this.state.errorInfo,
      errorId: this.state.errorId
    })
  }

  navigateHome = () => {
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="w-full max-w-lg mx-auto">
          <div className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                Something went wrong
              </h2>
              <p className="text-sm text-gray-600 text-center">
                An unexpected error occurred. We&apos;ve been notified and are working to fix it.
              </p>
              
              {this.state.errorId && (
                <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Error ID: {this.state.errorId}
                </p>
              )}

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="w-full">
                  <summary className="text-sm text-red-600 cursor-pointer">
                    Error details (development only)
                  </summary>
                  <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-auto max-h-32">
                    {this.state.error.message}
                    {this.state.error.stack && `\n${this.state.error.stack}`}
                  </pre>
                </details>
              )}

              <div className="flex flex-col w-full space-y-2">
                <Button onClick={this.handleReset} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={this.navigateHome} 
                    className="flex-1"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={this.handleCopyError} 
                    className="flex-1"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Details
                  </Button>
                </div>

                {this.props.showReportButton && (
                  <Button 
                    variant="outline" 
                    onClick={this.handleReportError}
                    className="w-full"
                  >
                    <Bug className="mr-2 h-4 w-4" />
                    Report Issue
                  </Button>
                )}
              </div>

              {this.props.enableAutoRetry && (
                <p className="text-xs text-gray-500 text-center">
                  Retry attempts: {this.state.retryAttempts}/{this.props.retryCount ?? 3}
                </p>
              )}
            </div>
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}

const ErrorBoundary = memo(ErrorBoundaryClass)
ErrorBoundary.displayName = "ErrorBoundary"

export { ErrorBoundary }