import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/users/users.service';
import { LoggerService } from '@/common/services/logger.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService, UsersService, PrismaService, LoggerService],
})
export class HealthModule { }