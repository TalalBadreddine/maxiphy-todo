// Auth module error messages

export const AUTH_ERRORS = {
  // Authentication Errors
  INVALID_CREDENTIALS: 'Invalid credentials provided',
  ACCOUNT_LOCKED: 'Account temporarily locked due to security reasons',
  EMAIL_NOT_VERIFIED: 'Email verification required',
  ACCOUNT_DEACTIVATED: 'Account access restricted',
  SESSION_EXPIRED: 'Session expired, please login again',
  AUTHENTICATION_REQUIRED: 'Authentication required',
  UNAUTHORIZED_ACCESS: 'Access denied',

  // Registration Errors
  EMAIL_EXISTS: 'An account with this email already exists',
  PASSWORD_MISMATCH: 'Password confirmation does not match',
  WEAK_PASSWORD: 'Password does not meet security requirements',
  INVALID_EMAIL: 'Please provide a valid email address',
  REGISTRATION_FAILED: 'Registration failed, please try again',

  // Token Errors
  INVALID_TOKEN: 'Invalid or expired token',
  EXPIRED_TOKEN: 'Token has expired',
  INVALID_VERIFICATION_TOKEN: 'Invalid or expired verification link',
  VERIFICATION_TOKEN_ALREADY_USED: 'Verification link already used',
  INVALID_RESET_TOKEN: 'Invalid or expired reset link',
  TOKEN_GENERATION_FAILED: 'Unable to complete authentication',

  // Password Errors
  CURRENT_INCORRECT: 'Current password is incorrect',
  RESET_FAILED: 'Password reset failed',
  UPDATE_FAILED: 'Password update failed',
  HASHING_FAILED: 'Authentication service temporarily unavailable',

  // Email Errors
  VERIFICATION_FAILED: 'Email verification failed',
  ALREADY_VERIFIED: 'Email address is already verified',
  SEND_FAILED: 'Failed to send email',
  INVALID_FORMAT: 'Invalid email format',

  // Rate Limiting
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',
  TOO_MANY_LOGIN_ATTEMPTS: 'Too many login attempts, please try again later',
  TOO_MANY_RESET_ATTEMPTS: 'Too many reset attempts, please try again later',
} as const;