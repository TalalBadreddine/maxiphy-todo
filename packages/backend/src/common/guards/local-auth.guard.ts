import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  private readonly logger = new Logger(LocalAuthGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { email } = request.body;

    this.logger.log('Login attempt', {
      email: email || 'unknown',
      url: request.url,
      method: request.method,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
    });

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const { email } = request.body;

    if (err || !user) {
      this.logger.warn('Login failed', {
        email: email || 'unknown',
        error: err?.message,
        info: info?.message,
        url: request.url,
        method: request.method,
        ip: request.ip,
        userAgent: request.get('User-Agent'),
      });

      throw err || new UnauthorizedException('Login failed');
    }

    this.logger.log('Login successful', {
      userId: user.id,
      email: user.email,
      url: request.url,
      method: request.method,
      ip: request.ip,
    });

    return user;
  }
}