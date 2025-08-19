// Health module error messages

export const HEALTH_ERRORS = {
  // Health Check Errors
  BASIC_CHECK_FAILED: 'Basic health check failed',
  DETAILED_CHECK_FAILED: 'Detailed health check failed',
  READINESS_CHECK_FAILED: 'Readiness check failed',
  LIVENESS_CHECK_FAILED: 'Liveness check failed',

  // Database Health Errors
  DATABASE_UNAVAILABLE: 'Database service unavailable',
  DATABASE_CONNECTION_FAILED: 'Failed to connect to database',
  DATABASE_TIMEOUT: 'Database operation timed out',

  // Service Health Errors
  SERVICE_UNAVAILABLE: 'Service is currently down',
  DEPENDENCY_UNAVAILABLE: 'Required dependency unavailable',
  RESOURCE_EXHAUSTED: 'System resources exhausted',

  // System Health Errors
  MEMORY_EXHAUSTED: 'System memory exhausted',
  CPU_OVERLOADED: 'System CPU overloaded',
  DISK_SPACE_LOW: 'System disk space low',
} as const;