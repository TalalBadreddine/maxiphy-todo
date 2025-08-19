// Error response types that match backend structure

export interface ApiErrorResponse {
  success: false
  message: string
  error: string
  statusCode: number
  timestamp: string
  path: string
  requestId?: string
  validationErrors?: string[]
}

export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

// Frontend error handling types
export interface AppError {
  message: string
  code: string
  category: string
  statusCode?: number
  context?: Record<string, any>
  retryable?: boolean
  timestamp: string
}

// Error boundary types
export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: {
    componentStack: string
  }
}

export interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  errorInfo?: {
    componentStack: string
  }
}