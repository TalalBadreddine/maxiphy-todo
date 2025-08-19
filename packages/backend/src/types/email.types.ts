
export interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailData {
  to: string;
  from: string;
  subject: string;
  html?: string;
  text?: string;
  template?: string;
}

export interface EmailLogData {
  to: string;
  from: string;
  subject: string;
  template?: string;
  status: 'sent' | 'failed' | 'pending';
  errorMessage?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  metadata?: Record<string, any>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface VerificationEmailData {
  email: string;
  token: string;
  name?: string;
}

export interface PasswordResetEmailData {
  email: string;
  token: string;
  name?: string;
}