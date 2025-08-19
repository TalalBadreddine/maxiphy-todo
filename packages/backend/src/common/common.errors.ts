// Common module error messages

export const COMMON_ERRORS = {
  // Service Errors
  UNAVAILABLE: 'Service is currently down',
  INTERNAL_ERROR: 'An unexpected error occurred',
  DATABASE_ERROR: 'Database operation failed',
  VALIDATION_ERROR: 'Invalid request data',

  // Validation Errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format provided',
  INVALID_LENGTH: 'Invalid length',
  INVALID_VALUE: 'Invalid value provided',

  // Generic HTTP Errors
  BAD_REQUEST: 'Invalid request',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource conflict',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',
} as const;