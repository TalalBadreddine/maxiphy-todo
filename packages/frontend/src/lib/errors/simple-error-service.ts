export interface SimpleError extends Error {
  code?: string
  statusCode?: number
}

export class SimpleErrorService {
  static handle(error: any): SimpleError {
    let message: string
    let code: string | undefined
    let statusCode: number | undefined

    // Handle axios/fetch errors
    if (error?.response) {
      message = error.response.data?.message || error.response.statusText || 'Request failed'
      code = error.response.data?.error || 'API_ERROR'
      statusCode = error.response.status
    }
    // Handle network errors
    else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('fetch')) {
      message = 'Network error. Please check your connection.'
      code = 'NETWORK_ERROR'
      statusCode = 0
    }
    // Handle regular errors
    else if (error instanceof Error) {
      message = error.message
      code = 'ERROR'
    }
    // Handle string errors
    else if (typeof error === 'string') {
      message = error
      code = 'ERROR'
    }
    // Fallback
    else {
      message = 'Something went wrong'
      code = 'UNKNOWN_ERROR'
    }

    const simpleError = new Error(message) as SimpleError
    simpleError.code = code
    simpleError.statusCode = statusCode
    
    return simpleError
  }
}