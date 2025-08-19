import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip || request.connection.remoteAddress;

    const requestId = uuidv4();
    request['requestId'] = requestId;
    response.setHeader('X-Request-ID', requestId);

    const { method, url, body, query, params } = request;
    const user = (request as any).user;

    const startTime = Date.now();

    const shouldLog = url.includes('/auth/') || url.includes('/users/') || method !== 'GET';

    if (shouldLog) {
      this.loggerService.logApiCall(url, method, 0, 0, {
        requestId,
        ipAddress: ip,
        userId: user?.id,
        userAgent,
        message: `API Request: ${method} ${url}`,
        context: 'LoggingInterceptor'
      });
    }

    return next.handle().pipe(
      tap((data) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        if (shouldLog || duration > 1000) {
          this.loggerService.logApiCall(url, method, duration, response.statusCode, {
            requestId,
            ipAddress: ip,
            userId: user?.id,
            userAgent,
            message: `API Response: ${method} ${url} - ${response.statusCode}`,
            context: 'LoggingInterceptor',
            duration
          });
        }
      }),
      catchError((error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        this.loggerService.logError({
          message: `Request Error: ${method} ${url}`,
          context: 'LoggingInterceptor',
          requestId,
          ipAddress: ip,
          userId: user?.id,
          userAgent,
          stackTrace: error.stack,
          severity: 'high',
          duration,
          endpoint: url,
          method,
          metadata: {
            statusCode: error.status || 500,
            errorName: error.name,
            errorMessage: error.message,
            userEmail: user?.email
          }
        });

        throw error;
      }),
    );
  }
}