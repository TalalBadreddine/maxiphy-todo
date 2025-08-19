// Users module error messages

export const USERS_ERRORS = {
  // User Management Errors
  NOT_FOUND: 'User account not found',
  CREATION_FAILED: 'Failed to create user account',
  UPDATE_FAILED: 'Failed to update user information',
  DELETION_FAILED: 'Failed to delete user account',

  // Profile Errors
  PROFILE_NOT_FOUND: 'User profile not found',
  PROFILE_UPDATE_FAILED: 'Failed to update user profile',
  INVALID_USER_DATA: 'Invalid user data provided',

  // Permission Errors
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this action',
  SELF_MODIFICATION_ERROR: 'Cannot perform this action on your own account',

  // Session Management Errors
  SESSION_NOT_FOUND: 'User session not found',
  SESSION_EXPIRED: 'User session has expired',
  TOO_MANY_SESSIONS: 'Too many active sessions',

  // Data Validation Errors
  INVALID_NAME: 'Name must be between 2 and 50 characters and contain only letters and spaces',
  INVALID_EMAIL_FORMAT: 'Invalid email format',
  EMAIL_ALREADY_IN_USE: 'Email address is already in use',

  // Service Errors
  SERVICE_ERROR: 'User service temporarily unavailable',
  STATS_ERROR: 'Failed to retrieve user statistics',
} as const;