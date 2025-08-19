import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
  requestId: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest();
    const requestId = request['requestId'] || 'unknown';

    return next.handle().pipe(
      map((data) => {

        if (data && typeof data === 'object' && 'data' in data && 'message' in data) {
          return {
            ...data,
            success: true,
            timestamp: new Date().toISOString(),
            requestId,
          };
        }

        return {
          data,
          message: this.getSuccessMessage(context, response.statusCode),
          success: true,
          timestamp: new Date().toISOString(),
          requestId,
        };
      }),
    );
  }

  private getSuccessMessage(context: ExecutionContext, statusCode: number): string {
    const handler = context.getHandler().name;
    const controller = context.getClass().name;

    const defaultMessages: Record<number, string> = {
      200: 'Request completed successfully',
      201: 'Resource created successfully',
      202: 'Request accepted for processing',
      204: 'Request completed successfully',
    };

    const handlerMessages: Record<string, string> = {
      login: 'Login successful',
      register: 'Registration successful',
      logout: 'Logout successful',
      changePassword: 'Password changed successfully',
      forgotPassword: 'Password reset email sent',
      resetPassword: 'Password reset successful',
      verifyEmail: 'Email verified successfully',
      getCurrentUser: 'User profile retrieved successfully',
      updateProfile: 'Profile updated successfully',
      deleteAccount: 'Account deleted successfully',
    };

    return handlerMessages[handler] || defaultMessages[statusCode] || 'Operation completed successfully';
  }
}