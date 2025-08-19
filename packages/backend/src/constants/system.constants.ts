// System constants for logging, status, and configuration

export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

export const LOG_CONTEXTS = {
  // Application Contexts
  BOOTSTRAP: 'Bootstrap',
  APPLICATION: 'Application',
  SHUTDOWN: 'Shutdown',
  
  // Service Contexts
  AUTH_SERVICE: 'AuthService',
  USER_SERVICE: 'UserService',
  TOKEN_SERVICE: 'TokenService',
  EMAIL_SERVICE: 'EmailService',
  HEALTH_SERVICE: 'HealthService',
  LOGGER_SERVICE: 'LoggerService',
  PRISMA_SERVICE: 'PrismaService',
  
  // Infrastructure Contexts
  DATABASE: 'Database',
  CACHE: 'Cache',
  QUEUE: 'Queue',
  SMTP: 'SMTP',
  SECURITY: 'Security',
  PERFORMANCE: 'Performance',
  
  // Request Contexts
  REQUEST: 'Request',
  RESPONSE: 'Response',
  MIDDLEWARE: 'Middleware',
  GUARD: 'Guard',
  INTERCEPTOR: 'Interceptor',
  FILTER: 'Filter',
  
  // External Contexts
  WEBHOOK: 'Webhook',
  API_CLIENT: 'ApiClient',
  INTEGRATION: 'Integration',
} as const;

export const HEALTH_STATUS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
  OK: 'ok',
  ERROR: 'error',
} as const;

export const SYSTEM_EVENTS = {
  APPLICATION_STARTED: 'APPLICATION_STARTED',
  APPLICATION_STOPPED: 'APPLICATION_STOPPED',
  DATABASE_CONNECTED: 'DATABASE_CONNECTED',
  DATABASE_DISCONNECTED: 'DATABASE_DISCONNECTED',
  CACHE_CONNECTED: 'CACHE_CONNECTED',
  CACHE_DISCONNECTED: 'CACHE_DISCONNECTED',
  MEMORY_WARNING: 'MEMORY_WARNING',
  MEMORY_CRITICAL: 'MEMORY_CRITICAL',
  DISK_WARNING: 'DISK_WARNING',
  DISK_CRITICAL: 'DISK_CRITICAL',
  PERFORMANCE_DEGRADED: 'PERFORMANCE_DEGRADED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  SERVICE_RESTORED: 'SERVICE_RESTORED',
} as const;

export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const REQUEST_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD',
} as const;

export const CACHE_KEYS = {
  USER_PROFILE: 'user:profile:',
  USER_SESSIONS: 'user:sessions:',
  AUTH_TOKENS: 'auth:tokens:',
  HEALTH_CHECK: 'health:check',
  SYSTEM_STATS: 'system:stats',
  EMAIL_RATE_LIMIT: 'email:rate:',
  LOGIN_ATTEMPTS: 'login:attempts:',
} as const;

export const RATE_LIMIT_TYPES = {
  LOGIN: 'login',
  REGISTER: 'register',
  PASSWORD_RESET: 'password_reset',
  EMAIL_VERIFICATION: 'email_verification',
  API_GENERAL: 'api_general',
  EMAIL_SEND: 'email_send',
} as const;

// Type definitions
export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];
export type LogContext = typeof LOG_CONTEXTS[keyof typeof LOG_CONTEXTS];
export type HealthStatus = typeof HEALTH_STATUS[keyof typeof HEALTH_STATUS];
export type SystemEvent = typeof SYSTEM_EVENTS[keyof typeof SYSTEM_EVENTS];
export type Environment = typeof ENVIRONMENTS[keyof typeof ENVIRONMENTS];
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
export type RequestMethod = typeof REQUEST_METHODS[keyof typeof REQUEST_METHODS];
export type CacheKey = typeof CACHE_KEYS[keyof typeof CACHE_KEYS];
export type RateLimitType = typeof RATE_LIMIT_TYPES[keyof typeof RATE_LIMIT_TYPES];