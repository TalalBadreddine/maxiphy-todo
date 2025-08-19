import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import {
  BasicHealthCheck,
  DetailedHealthCheck
} from '../types';
import { HEALTH_ERRORS } from './health.errors';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) { }

  async getBasicHealth(): Promise<BasicHealthCheck> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: this.configService.get('app.environment', 'development'),
      };
    } catch (error) {
      this.logger.error('Health check failed', { error: error.message });
      throw new InternalServerErrorException(HEALTH_ERRORS.BASIC_CHECK_FAILED);
    }
  }

  async getDetailedHealth(): Promise<DetailedHealthCheck> {
    try {
      const startTime = Date.now();

      const dbHealth = await this.checkDatabaseHealth();

      const memoryUsage = process.memoryUsage();

      const systemMetrics = {
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      };

      const responseTime = Date.now() - startTime;

      return {
        status: dbHealth.status === 'healthy' ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        memory: {
          used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        },
        system: systemMetrics
      };
    } catch (error) {
      this.logger.error('Detailed health check failed', {
        error: error.message,
        stack: error.stack
      });
      throw error
    }
  }

  private async checkDatabaseHealth() {
    try {
      const startTime = Date.now();

      await this.prisma.$queryRaw`SELECT 1`;

      const stats = await this.prisma.getDatabaseStats();

      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Database health check failed', { error: error.message });
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getReadiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok',
          application: 'ok',
        },
      };
    } catch (error) {
      this.logger.error('Readiness check failed', { error: error.message });
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  async getLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}