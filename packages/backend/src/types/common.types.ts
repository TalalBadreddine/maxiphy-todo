export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorDetails {
  code: string;
  message: string;
  field?: string;
  context?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  messages: string[];
}

export interface RequestContext {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId: string;
}

export interface LogContext {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: Record<string, 'ok' | 'error'>;
}

export interface DatabaseStats {
  users: {
    total: number;
    active: number;
    verified: number;
    recent: number;
  };
  sessions: {
    total: number;
    active: number;
  };
}

export interface SystemMetrics {
  uptime: number;
  memory: {
    used: string;
    total: string;
    external: string;
    rss: string;
  };
  nodeVersion: string;
  platform: string;
  arch: string;
  pid: number;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export type EntityAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VERIFY' | 'RESET';
export type EmailStatus = 'pending' | 'sent' | 'failed' | 'delivered' | 'opened' | 'clicked';