// Authentication and authorization constants

export const AUTH_STRATEGIES = {
  LOCAL: 'local',
  JWT: 'jwt',
  GOOGLE: 'google',
  GITHUB: 'github',
} as const;

export const TOKEN_TYPES = {
  ACCESS_TOKEN: 'access_token',
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
  INVITE_TOKEN: 'invite_token',
} as const;

export const AUTH_PROVIDERS = {
  LOCAL: 'local',
  GOOGLE: 'google',
  GITHUB: 'github',
  MICROSOFT: 'microsoft',
  FACEBOOK: 'facebook',
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  SUPER_ADMIN: 'super_admin',
} as const;

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
} as const;

export const SESSION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
  TERMINATED: 'terminated',
} as const;

export const AUTH_ERRORS = {
  // Authentication Errors
  INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'AUTH_ACCOUNT_LOCKED',
  ACCOUNT_DEACTIVATED: 'AUTH_ACCOUNT_DEACTIVATED',
  EMAIL_NOT_VERIFIED: 'AUTH_EMAIL_NOT_VERIFIED',

  // Token Errors
  INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  TOKEN_REVOKED: 'AUTH_TOKEN_REVOKED',
  TOKEN_NOT_FOUND: 'AUTH_TOKEN_NOT_FOUND',

  // User Errors
  USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  USER_EXISTS: 'AUTH_USER_EXISTS',

  // Password Errors
  WEAK_PASSWORD: 'AUTH_WEAK_PASSWORD',
  PASSWORD_MISMATCH: 'AUTH_PASSWORD_MISMATCH',
  CURRENT_PASSWORD_INCORRECT: 'AUTH_CURRENT_PASSWORD_INCORRECT',

  // Rate Limiting
  TOO_MANY_ATTEMPTS: 'AUTH_TOO_MANY_ATTEMPTS',
  TOO_MANY_SESSIONS: 'AUTH_TOO_MANY_SESSIONS',

  // Service Errors
  SERVICE_ERROR: 'AUTH_SERVICE_ERROR',
  HASHING_ERROR: 'AUTH_HASHING_ERROR',
  TOKEN_GENERATION_ERROR: 'AUTH_TOKEN_GENERATION_ERROR',
} as const;

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SYMBOLS: true,
  MIN_STRENGTH_SCORE: 3,
} as const;

export const LOCKOUT_SETTINGS = {
  MAX_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  RESET_AFTER_SUCCESS: true,
} as const;

export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '20d',
  EMAIL_VERIFICATION: '1h',
  PASSWORD_RESET: '1h',
  INVITE_TOKEN: '7d',
} as const;

export const SECURITY_HEADERS = {
  REQUEST_ID: 'X-Request-ID',
  RATE_LIMIT_LIMIT: 'X-RateLimit-Limit',
  RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',
  RATE_LIMIT_RESET: 'X-RateLimit-Reset',
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  USER_AGENT: 'User-Agent',
} as const;

export const COOKIE_NAMES = {
  SESSION_ID: 'sessionId',
  CSRF_TOKEN: 'csrfToken',
} as const;

export const JWT_CLAIMS = {
  ISSUER: 'iss',
  SUBJECT: 'sub',
  AUDIENCE: 'aud',
  EXPIRATION: 'exp',
  NOT_BEFORE: 'nbf',
  ISSUED_AT: 'iat',
  JWT_ID: 'jti',
} as const;

// Type definitions
export type AuthStrategy = typeof AUTH_STRATEGIES[keyof typeof AUTH_STRATEGIES];
export type TokenType = typeof TOKEN_TYPES[keyof typeof TOKEN_TYPES];
export type AuthProvider = typeof AUTH_PROVIDERS[keyof typeof AUTH_PROVIDERS];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS];
export type AuthError = typeof AUTH_ERRORS[keyof typeof AUTH_ERRORS];
export type SecurityHeader = typeof SECURITY_HEADERS[keyof typeof SECURITY_HEADERS];
export type CookieName = typeof COOKIE_NAMES[keyof typeof COOKIE_NAMES];
export type JwtClaim = typeof JWT_CLAIMS[keyof typeof JWT_CLAIMS];