
export interface BasicHealthCheck {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
}

export interface DetailedHealthCheck {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: string;
  responseTime: string;
  memory: MemoryUsage;
  system: SystemInfo;
}


export interface MemoryUsage {
  used: string;
  total: string;
  external: string;
  rss: string;
}

export interface SystemInfo {
  uptime: number;
  nodeVersion: string;
  platform: string;
  arch: string;
  pid: number;
}

export interface ReadinessCheck {
  status: 'ready' | 'not ready';
  timestamp: string;
  checks: {
    database: 'ok' | 'error';
    application: 'ok' | 'error';
  };
  error?: string;
}

export interface LivenessCheck {
  status: 'alive';
  timestamp: string;
  uptime: number;
}

export interface HealthMetrics {
  errorRate: number;
  recentErrors: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}