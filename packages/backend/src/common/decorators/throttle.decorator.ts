import { applyDecorators, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CustomThrottlerGuard } from '../guards/throttle.guard';

export function ApiThrottle(limit: number, ttl: number, name?: string) {
  return applyDecorators(
    Throttle({ default: { limit, ttl } }),
    UseGuards(CustomThrottlerGuard),
  );
}