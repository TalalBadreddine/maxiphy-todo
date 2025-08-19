import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as path from 'path';

export interface LogData {
  message: string;
  context?: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: 'auth' | 'security' | 'performance' | 'business' | 'system';
  duration?: number;
  endpoint?: string;
  method?: string;
}

export interface SecurityLogData extends LogData {
  category: 'security';
  securityEvent: 'login_attempt' | 'login_failure' | 'unauthorized_access' | 'rate_limit_exceeded' | 'suspicious_activity';
  threatLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceLogData extends LogData {
  category: 'performance';
  performanceMetric: 'response_time' | 'memory_usage' | 'cpu_usage' | 'database_query' | 'api_call';
  value: number;
  threshold?: number;
  unit: 'ms' | 'mb' | 'percent' | 'count';
}

@Injectable()
export class LoggerService {
  private readonly logger = new Logger(LoggerService.name);
  private readonly infoLogger: winston.Logger;
  private readonly errorLogger: winston.Logger;

  constructor(private readonly configService: ConfigService) {
    const logDir = this.configService.get<string>('app.logDirectory') || './logs';
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';


    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );


    this.infoLogger = winston.createLogger({
      level: 'info',
      format: logFormat,
      defaultMeta: { service: 'maxiphy-backend' },
      transports: [
        new winston.transports.File({
          filename: path.join(logDir, 'info.log'),
          maxsize: 5242880,
          maxFiles: 5,
        }),
        new winston.transports.Console({
          format: isProduction
            ? winston.format.json()
            : winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
        })
      ]
    });


    this.errorLogger = winston.createLogger({
      level: 'error',
      format: logFormat,
      defaultMeta: { service: 'maxiphy-backend' },
      transports: [
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          maxsize: 5242880,
          maxFiles: 5,
        }),
        new winston.transports.Console({
          format: isProduction
            ? winston.format.json()
            : winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
        })
      ],
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          maxsize: 5242880,
          maxFiles: 5,
        })
      ],
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          maxsize: 5242880,
          maxFiles: 5,
        })
      ]
    });
  }

  logInfo(data: LogData): void {
    try {
      this.infoLogger.info(data.message, {
        context: data.context,
        metadata: data.metadata,
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        requestId: data.requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.log('Failed to log info event');
    }
  }

  logError(data: LogData): void {
    try {
      this.errorLogger.error(data.message, {
        context: data.context,
        metadata: data.metadata,
        stackTrace: data.stackTrace,
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        requestId: data.requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to log error event');
    }
  }

  getInfoLogger(): winston.Logger {
    return this.infoLogger;
  }

  getErrorLogger(): winston.Logger {
    return this.errorLogger;
  }

  logSecurity(data: SecurityLogData): void {
    try {
      const logData = {
        ...data,
        severity: data.threatLevel || data.severity || 'medium',
        timestamp: new Date().toISOString(),
        service: 'maxiphy-backend',
        logType: 'security'
      };

      if (data.threatLevel === 'critical' || data.severity === 'critical') {
        this.errorLogger.error(data.message, logData);
      } else {
        this.infoLogger.warn(data.message, logData);
      }
    } catch (error) {
      this.logger.error('Failed to log security event');
    }
  }

  logPerformance(data: PerformanceLogData): void {
    try {
      const logData = {
        ...data,
        timestamp: new Date().toISOString(),
        service: 'maxiphy-backend',
        logType: 'performance',
        isSlowQuery: data.threshold && data.value > data.threshold
      };

      // Log slow operations as warnings
      if (data.threshold && data.value > data.threshold) {
        this.infoLogger.warn(data.message, logData);
      } else {
        this.infoLogger.info(data.message, logData);
      }
    } catch (error) {
      this.logger.error('Failed to log performance event');
    }
  }

  logAuth(action: 'login' | 'logout' | 'register' | 'verify', data: Partial<LogData>): void {
    this.logSecurity({
      ...data,
      message: `User ${action} attempt`,
      category: 'security',
      securityEvent: action === 'login' ? 'login_attempt' : 'login_attempt',
      severity: 'low'
    } as SecurityLogData);
  }

  logAuthFailure(reason: string, data: Partial<LogData>): void {
    this.logSecurity({
      ...data,
      message: `Authentication failed: ${reason}`,
      category: 'security',
      securityEvent: 'login_failure',
      threatLevel: 'medium'
    } as SecurityLogData);
  }

  logUnauthorizedAccess(endpoint: string, data: Partial<LogData>): void {
    this.logSecurity({
      ...data,
      message: `Unauthorized access attempt to ${endpoint}`,
      category: 'security',
      securityEvent: 'unauthorized_access',
      threatLevel: 'high',
      endpoint
    } as SecurityLogData);
  }

  logApiCall(endpoint: string, method: string, duration: number, statusCode: number, data?: Partial<LogData>): void {
    const isError = statusCode >= 400;
    const isSlow = duration > 1000; // 1 second threshold

    if (isError || isSlow) {
      this.logPerformance({
        ...data,
        message: `API ${method} ${endpoint} - ${statusCode} (${duration}ms)`,
        category: 'performance',
        performanceMetric: 'response_time',
        value: duration,
        threshold: 1000,
        unit: 'ms',
        endpoint,
        method,
        severity: isError ? 'high' : 'medium'
      } as PerformanceLogData);
    }
  }

  log(message: string, context?: string): void {
    this.logInfo({ message, context });
  }

  error(message: string, stackTrace?: string, context?: string): void {
    this.logError({ message, stackTrace, context, severity: 'high' });
  }

  warn(message: string, context?: string): void {
    this.logInfo({ message, context, severity: 'medium' });
  }

  debug(message: string, context?: string): void {
    if (this.configService.get<string>('NODE_ENV') !== 'production') {
      this.logInfo({ message, context, severity: 'low' });
    }
  }
}