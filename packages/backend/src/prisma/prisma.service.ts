import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Successfully connected to database');
    } catch (error) {
      this.logger.error('❌ Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('🔌 Database connection closed');
    } catch (error) {
      this.logger.error('❌ Error disconnecting from database', error);
    }
  }

  handleDatabaseError(error: any, context?: string): never {
    const contextMessage = context ? ` in ${context}` : '';

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          this.logger.error(`🔒 Unique constraint violation${contextMessage}`, {
            code: error.code,
            meta: error.meta,
            stack: error.stack,
          });
          throw new Error(`A record with this ${error.meta?.target} already exists`);

        case 'P2025':
          this.logger.error(`🔍 Record not found${contextMessage}`, {
            code: error.code,
            meta: error.meta,
            stack: error.stack,
          });
          throw new Error('Record not found');

        case 'P2003':
          this.logger.error(`🔗 Foreign key constraint violation${contextMessage}`, {
            code: error.code,
            meta: error.meta,
            stack: error.stack,
          });
          throw new Error('Related record not found');

        case 'P2014':
          this.logger.error(`⚠️ Invalid relation${contextMessage}`, {
            code: error.code,
            meta: error.meta,
            stack: error.stack,
          });
          throw new Error('Invalid relation in the request');

        default:
          this.logger.error(`💥 Database error${contextMessage}`, {
            code: error.code,
            message: error.message,
            meta: error.meta,
            stack: error.stack,
          });
          throw new Error('Database operation failed');
      }
    }

    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      this.logger.error(`❓ Unknown database error${contextMessage}`, {
        message: error.message,
        stack: error.stack,
      });
      throw new Error('Unknown database error occurred');
    }

    if (error instanceof Prisma.PrismaClientRustPanicError) {
      this.logger.error(`💥 Database engine panic${contextMessage}`, {
        message: error.message,
        stack: error.stack,
      });
      throw new Error('Database engine error');
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      this.logger.error(`🚫 Database initialization error${contextMessage}`, {
        message: error.message,
        errorCode: error.errorCode,
        stack: error.stack,
      });
      throw new Error('Database initialization failed');
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      this.logger.error(`✅ Database validation error${contextMessage}`, {
        message: error.message,
        stack: error.stack,
      });
      throw new Error('Invalid data provided to database');
    }

    // Generic error handling
    this.logger.error(`💥 Unexpected error${contextMessage}`, {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }

  async executeTransaction<T>(
    operations: (prisma: Prisma.TransactionClient) => Promise<T>,
    context?: string,
  ): Promise<T> {
    try {
      return await this.$transaction(operations);
    } catch (error) {
      this.handleDatabaseError(error, context);
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    try {
      await this.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      throw new Error('Database is unhealthy');
    }
  }

  async getDatabaseStats() {
    try {
      const [
        userCount,
        activeUsers,
      ] = await Promise.all([
        this.user.count(),
        this.user.count({ where: { isActive: true } }),
      ]);

      return {
        users: {
          total: userCount,
          active: activeUsers,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      this.handleDatabaseError(error, 'getDatabaseStats');
    }
  }
}