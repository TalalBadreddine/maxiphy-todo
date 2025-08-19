import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { LoggerService } from '../services/logger.service';

interface ErrorResponse {
  success: boolean;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
  path: string;
  requestId: string;
  validationErrors?: string[];
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly loggerService: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    this.logError(exception, request, errorResponse);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, request: Request): ErrorResponse {
    const requestId = request['requestId'] || 'unknown';
    const timestamp = new Date().toISOString();
    const path = request.url;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'INTERNAL_SERVER_ERROR';
    let validationErrors: string[] | undefined = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      error = exception.constructor.name.replace('Exception', '').toUpperCase();

      if (statusCode === HttpStatus.BAD_REQUEST) {
        const exceptionResponse = exception.getResponse();

        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
          const response = exceptionResponse as any;

          if (Array.isArray(response.message)) {
            message = 'Validation failed';
            validationErrors = response.message;
            error = 'VALIDATION_ERROR';
          } else if (response.message) {
            message = Array.isArray(response.message) ? response.message.join(', ') : response.message;
          } else {
            message = exception.message;
          }
        } else {
          message = exception.message;
        }
      } else {
        message = exception.message;
      }
    } else if (exception instanceof PrismaClientKnownRequestError) {
      statusCode = this.getPrismaErrorStatus(exception.code);
      message = this.getPrismaErrorMessage(exception);
      error = 'DATABASE_ERROR';
    } else if (exception instanceof PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Invalid request data';
      error = 'VALIDATION_ERROR';
    } else if (exception instanceof Error) {
      // Handle specific JWT error types
      if (exception.name === 'JsonWebTokenError') {
        statusCode = HttpStatus.UNAUTHORIZED;
        message = 'Authentication required';
        error = 'INVALID_TOKEN';
      } else if (exception.name === 'TokenExpiredError') {
        statusCode = HttpStatus.UNAUTHORIZED;
        message = 'Session expired, please login again';
        error = 'TOKEN_EXPIRED';
      } else if (exception.name === 'NotBeforeError') {
        statusCode = HttpStatus.UNAUTHORIZED;
        message = 'Authentication required';
        error = 'TOKEN_NOT_ACTIVE';
      } else {
        message = 'An unexpected error occurred';
        error = 'INTERNAL_ERROR';
      }
    }

    const response: ErrorResponse = {
      success: false,
      message,
      error,
      statusCode,
      timestamp,
      path,
      requestId,
    };

    if (validationErrors && validationErrors.length > 0) {
      response.validationErrors = validationErrors;
    }

    return response;
  }

  private getPrismaErrorStatus(code: string): number {
    const statusMap: Record<string, number> = {
      P2002: HttpStatus.CONFLICT, // Unique constraint violation
      P2025: HttpStatus.NOT_FOUND, // Record not found
      P2003: HttpStatus.BAD_REQUEST, // Foreign key constraint violation
      P2014: HttpStatus.BAD_REQUEST, // Invalid relation
      P2021: HttpStatus.NOT_FOUND, // Table does not exist
      P2022: HttpStatus.NOT_FOUND, // Column does not exist
    };

    return statusMap[code] || HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getPrismaErrorMessage(exception: PrismaClientKnownRequestError): string {
    const messageMap: Record<string, string> = {
      P2002: 'A record with this information already exists',
      P2025: 'The requested record could not be found',
      P2003: 'Invalid request - related data not found',
      P2014: 'Invalid request data provided',
      P2021: 'Service temporarily unavailable',
      P2022: 'Service temporarily unavailable',
    };

    return messageMap[exception.code] || 'Service temporarily unavailable';
  }

  private logError(exception: unknown, request: Request, errorResponse: ErrorResponse): void {
    const { method, url } = request;
    const user = (request as any).user;
    const ip = request.ip || request.connection.remoteAddress;
    const userAgent = request.get('User-Agent') || '';

    if (errorResponse.statusCode >= 500) {
      this.loggerService.logError({
        message: `${method} ${url} - ${errorResponse.statusCode}`,
        context: 'AllExceptionsFilter',
        requestId: errorResponse.requestId,
        ipAddress: ip,
        userId: user?.id,
        userAgent,
        stackTrace: exception instanceof Error ? exception.stack : undefined,
        severity: 'critical',
        endpoint: url,
        method,
        metadata: {
          error: errorResponse.error,
          statusCode: errorResponse.statusCode,
          errorMessage: errorResponse.message,
          userEmail: user?.email,
          validationErrors: errorResponse.validationErrors
        }
      });
    } else if (errorResponse.statusCode >= 400 && errorResponse.statusCode !== 400) {
      this.loggerService.logSecurity({
        message: `${method} ${url} - ${errorResponse.statusCode}`,
        context: 'AllExceptionsFilter',
        category: 'security',
        securityEvent: 'unauthorized_access',
        threatLevel: 'medium',
        requestId: errorResponse.requestId,
        ipAddress: ip,
        userId: user?.id,
        userAgent,
        endpoint: url,
        method,
        metadata: {
          error: errorResponse.error,
          statusCode: errorResponse.statusCode,
          errorMessage: errorResponse.message
        }
      });
    }
  }
}