// Email service constants

export const EMAIL_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
  DELIVERED: 'delivered',
  BOUNCED: 'bounced',
  OPENED: 'opened',
  CLICKED: 'clicked',
  UNSUBSCRIBED: 'unsubscribed',
  SPAM: 'spam',
} as const;

export const EMAIL_TEMPLATES = {
  EMAIL_VERIFICATION: 'email-verification',
  PASSWORD_RESET: 'password-reset',
  WELCOME: 'welcome',
  PASSWORD_CHANGED: 'password-changed',
  ACCOUNT_LOCKED: 'account-locked',
  ACCOUNT_UNLOCKED: 'account-unlocked',
  SECURITY_ALERT: 'security-alert',
  NEWSLETTER: 'newsletter',
  NOTIFICATION: 'notification',
} as const;

export const EMAIL_SUBJECTS = {
  EMAIL_VERIFICATION: 'Verify your email address',
  PASSWORD_RESET: 'Reset your password',
  WELCOME: 'Welcome to Maxiphy!',
  PASSWORD_CHANGED: 'Your password has been changed',
  ACCOUNT_LOCKED: 'Your account has been locked',
  ACCOUNT_UNLOCKED: 'Your account has been unlocked',
  SECURITY_ALERT: 'Security alert for your account',
  NEWSLETTER: 'Maxiphy Newsletter',
  NOTIFICATION: 'Notification from Maxiphy',
} as const;

export const EMAIL_ERRORS = {
  CONFIGURATION_ERROR: 'EMAIL_CONFIGURATION_ERROR',
  SMTP_CONFIGURATION_ERROR: 'EMAIL_SMTP_CONFIGURATION_ERROR',
  SEND_ERROR: 'EMAIL_SEND_ERROR',
  TEMPLATE_ERROR: 'EMAIL_TEMPLATE_ERROR',
  VALIDATION_ERROR: 'EMAIL_VALIDATION_ERROR',
  CONNECTION_ERROR: 'EMAIL_SMTP_CONNECTION_ERROR',
  AUTH_ERROR: 'EMAIL_SMTP_AUTH_ERROR',
  TIMEOUT_ERROR: 'EMAIL_SMTP_TIMEOUT',
  RATE_LIMIT_ERROR: 'EMAIL_RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'EMAIL_QUOTA_EXCEEDED',
  CONTENT_ERROR: 'EMAIL_CONTENT_ERROR',
  ATTACHMENT_ERROR: 'EMAIL_ATTACHMENT_ERROR',
  DELIVERY_ERROR: 'EMAIL_DELIVERY_ERROR',
  BOUNCE_ERROR: 'EMAIL_BOUNCE_ERROR',
  SPAM_ERROR: 'EMAIL_SPAM_ERROR',
  LOG_ERROR: 'EMAIL_LOG_ERROR',
  SERVICE_ERROR: 'EMAIL_SERVICE_ERROR',
  SERVICE_UNAVAILABLE: 'EMAIL_SERVICE_UNAVAILABLE',
} as const;

export const EMAIL_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const EMAIL_CONTENT_TYPES = {
  TEXT: 'text/plain',
  HTML: 'text/html',
  MULTIPART: 'multipart/alternative',
} as const;

export const SMTP_SECURITY = {
  NONE: 'none',
  TLS: 'tls',
  SSL: 'ssl',
  STARTTLS: 'starttls',
} as const;

export const EMAIL_EVENTS = {
  QUEUED: 'queued',
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  OPENED: 'opened',
  CLICKED: 'clicked',
  BOUNCED: 'bounced',
  COMPLAINED: 'complained',
  UNSUBSCRIBED: 'unsubscribed',
  FAILED: 'failed',
} as const;

export const BOUNCE_TYPES = {
  HARD: 'hard',
  SOFT: 'soft',
  COMPLAINT: 'complaint',
  SUPPRESSION: 'suppression',
} as const;

export const EMAIL_PROVIDERS = {
  SMTP: 'smtp',
  SENDGRID: 'sendgrid',
  MAILGUN: 'mailgun',
  SES: 'ses',
  MAILCHIMP: 'mailchimp',
  POSTMARK: 'postmark',
} as const;

export const EMAIL_RATE_LIMITS = {
  PER_MINUTE: 'per_minute',
  PER_HOUR: 'per_hour',
  PER_DAY: 'per_day',
  PER_MONTH: 'per_month',
} as const;

export const EMAIL_CATEGORIES = {
  TRANSACTIONAL: 'transactional',
  MARKETING: 'marketing',
  NOTIFICATION: 'notification',
  SYSTEM: 'system',
  SECURITY: 'security',
} as const;

export const EMAIL_HEADERS = {
  MESSAGE_ID: 'Message-ID',
  IN_REPLY_TO: 'In-Reply-To',
  REFERENCES: 'References',
  AUTO_SUBMITTED: 'Auto-Submitted',
  LIST_UNSUBSCRIBE: 'List-Unsubscribe',
  PRECEDENCE: 'Precedence',
  X_MAILER: 'X-Mailer',
  X_PRIORITY: 'X-Priority',
  X_CATEGORY: 'X-Category',
} as const;

export const UNSUBSCRIBE_REASONS = {
  USER_REQUEST: 'user_request',
  SPAM_COMPLAINT: 'spam_complaint',
  BOUNCE: 'bounce',
  ADMIN_ACTION: 'admin_action',
  GDPR_REQUEST: 'gdpr_request',
} as const;

// Type definitions
export type EmailStatus = typeof EMAIL_STATUS[keyof typeof EMAIL_STATUS];
export type EmailTemplate = typeof EMAIL_TEMPLATES[keyof typeof EMAIL_TEMPLATES];
export type EmailSubject = typeof EMAIL_SUBJECTS[keyof typeof EMAIL_SUBJECTS];
export type EmailError = typeof EMAIL_ERRORS[keyof typeof EMAIL_ERRORS];
export type EmailPriority = typeof EMAIL_PRIORITIES[keyof typeof EMAIL_PRIORITIES];
export type EmailContentType = typeof EMAIL_CONTENT_TYPES[keyof typeof EMAIL_CONTENT_TYPES];
export type SmtpSecurity = typeof SMTP_SECURITY[keyof typeof SMTP_SECURITY];
export type EmailEvent = typeof EMAIL_EVENTS[keyof typeof EMAIL_EVENTS];
export type BounceType = typeof BOUNCE_TYPES[keyof typeof BOUNCE_TYPES];
export type EmailProvider = typeof EMAIL_PROVIDERS[keyof typeof EMAIL_PROVIDERS];
export type EmailRateLimit = typeof EMAIL_RATE_LIMITS[keyof typeof EMAIL_RATE_LIMITS];
export type EmailCategory = typeof EMAIL_CATEGORIES[keyof typeof EMAIL_CATEGORIES];
export type EmailHeader = typeof EMAIL_HEADERS[keyof typeof EMAIL_HEADERS];
export type UnsubscribeReason = typeof UNSUBSCRIBE_REASONS[keyof typeof UNSUBSCRIBE_REASONS];