import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(CustomThrottlerGuard.name);

  protected async getTracker(req: Request): Promise<string> {

    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = (req as any).user?.id || 'anonymous';
    return `${ip}-${userId}`;
  }

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.url?.includes('/health')) {
      return true;
    }

    return false;
  }

  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
    throttler: any,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    try {
      const canProceed = await super.handleRequest(context, limit, ttl, throttler, this.getTracker, this.generateKey);

      if (!canProceed) {
        const tracker = await this.getTracker(request);

        this.logger.warn('Rate limit exceeded', {
          tracker,
          url: request.url,
          method: request.method,
          userAgent: request.get('User-Agent'),
          limit,
          ttl,
          throttlerName: throttler.name,
        });

        response.setHeader('X-RateLimit-Limit', limit);
        response.setHeader('X-RateLimit-Remaining', 0);
        response.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttl * 1000));
      }

      return canProceed;
    } catch (error) {
      this.logger.error('Error in rate limiting', {
        error: error.message,
        url: request.url,
        method: request.method,
        stack: error.stack,
      });

      return true;
    }
  }
}