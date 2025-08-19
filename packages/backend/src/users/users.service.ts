import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  ConflictException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/services/logger.service';
import {
  CreateUserData,
} from '../types';
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITIES,
} from '../constants';
import { USERS_ERRORS } from './users.errors';
import { COMMON_ERRORS } from '../common/common.errors';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly loggerService: LoggerService,
  ) { }

  async create(data: CreateUserData) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          name: data.name.trim(),
          password: data.password,
          emailVerified: data.emailVerified ?? false,
          emailVerifiedAt: data.emailVerified ? new Date() : null,
        },
      });

      this.loggerService.logInfo({
        message: 'User created successfully',
        context: 'UsersService',
        userId: user.id,
        metadata: {
          email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
          operation: 'create_user'
        }
      });

      const { password, ...result } = user;
      return result;
    } catch (error) {
      this.loggerService.logError({
        message: 'User creation failed',
        context: 'UsersService',
        stackTrace: error.stack,
        severity: 'critical',
        metadata: {
          email: data.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
          operation: 'create_user',
          error: error.message
        }
      });
      throw new InternalServerErrorException(USERS_ERRORS.CREATION_FAILED);
    }
  }

  async findById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        this.loggerService.logSecurity({
          message: 'User not found by ID',
          context: 'UsersService',
          category: 'security',
          securityEvent: 'unauthorized_access',
          threatLevel: 'low',
          metadata: {
            userId: id,
            operation: 'find_by_id'
          }
        });
        throw new NotFoundException(USERS_ERRORS.NOT_FOUND);
      }

      this.loggerService.debug('User found by ID', 'UsersService');

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.loggerService.logError({
        message: 'Database error finding user by ID',
        context: 'UsersService',
        stackTrace: error.stack,
        severity: 'critical',
        metadata: {
          userId: id,
          operation: 'find_by_id',
          error: error.message
        }
      });
      throw new InternalServerErrorException(COMMON_ERRORS.DATABASE_ERROR);
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (user) {
        this.loggerService.debug('User found by email', 'UsersService');
      } else {
        this.loggerService.debug('No user found by email', 'UsersService');
      }

      return user;
    } catch (error) {
      this.loggerService.logError({
        message: 'Database error finding user by email',
        context: 'UsersService',
        stackTrace: error.stack,
        severity: 'critical',
        metadata: {
          email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
          operation: 'find_by_email',
          error: error.message
        }
      });
      throw new InternalServerErrorException(COMMON_ERRORS.DATABASE_ERROR);
    }
  }

  async updateLastLogin(id: string) {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { lastLoginAt: new Date() },
      });

      this.loggerService.debug('User last login updated', 'UsersService');
    } catch (error) {
      this.loggerService.logError({
        message: 'Database error updating last login',
        context: 'UsersService',
        userId: id,
        stackTrace: error.stack,
        severity: 'high',
        metadata: {
          operation: 'update_last_login',
          error: error.message
        }
      });
      throw new InternalServerErrorException(COMMON_ERRORS.DATABASE_ERROR);
    }
  }

  async updatePassword(id: string, hashedPassword: string) {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });

      this.loggerService.logSecurity({
        message: 'User password updated successfully',
        context: 'UsersService',
        category: 'security',
        securityEvent: 'login_attempt',
        threatLevel: 'low',
        userId: id,
        metadata: {
          operation: 'update_password'
        }
      });
    } catch (error) {
      this.loggerService.logError({
        message: 'Database error updating password',
        context: 'UsersService',
        userId: id,
        stackTrace: error.stack,
        severity: 'critical',
        metadata: {
          operation: 'update_password',
          error: error.message
        }
      });
      throw new InternalServerErrorException(USERS_ERRORS.UPDATE_FAILED);
    }
  }

  async verifyEmail(id: string) {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });


      this.loggerService.logSecurity({
        message: 'User email verified successfully',
        context: 'UsersService',
        category: 'security',
        securityEvent: 'login_attempt',
        threatLevel: 'low',
        userId: id,
        metadata: {
          operation: 'verify_email'
        }
      });

      const { password, ...result } = user;
      return result;
    } catch (error) {
      this.loggerService.logError({
        message: 'Database error verifying email',
        context: 'UsersService',
        userId: id,
        stackTrace: error.stack,
        severity: 'critical',
        metadata: {
          operation: 'verify_email',
          error: error.message
        }
      });
      throw new InternalServerErrorException(USERS_ERRORS.UPDATE_FAILED);
    }
  }

}