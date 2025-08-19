import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';

import { TokenService } from './token.service';
import { BcryptService } from './bcrypt.service';
import { AuthEmailService } from './email-queue.service';
import { LoggerService } from '../common/services/logger.service';
import { UsersService } from '../users/users.service';
import { AppConfigService } from '../config/config.service';
import { LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';
import {
  UserProfile,
  ApiResponse,
} from '../types';;
import { AUTH_ERRORS } from './auth.errors';
import { COMMON_ERRORS } from '../common/common.errors';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly bcryptService: BcryptService,
    private readonly emailService: AuthEmailService,
    private readonly loggerService: LoggerService,
    private readonly configService: AppConfigService
  ) { }

  async validateUser(email: string, password: string): Promise<UserProfile | null> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user || !user.isActive) {

        this.loggerService.logAuthFailure(
          !user ? 'user_not_found' : 'account_inactive',
          {
            message: 'Login attempt failed',
            context: 'AuthService',
            metadata: { email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') }
          }
        );
        return null;
      }

      const isPasswordValid = await this.bcryptService.comparePassword(password, user.password);
      if (!isPasswordValid) {
        this.loggerService.logAuthFailure('invalid_password', {
          message: 'Invalid password attempt',
          context: 'AuthService',
          userId: user.id,
          metadata: { email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') }
        });
        return null;
      }

      if (!user.emailVerified) {
        this.loggerService.logAuthFailure('email_not_verified', {
          message: 'Login attempt with unverified email',
          context: 'AuthService',
          userId: user.id
        });
        throw new UnauthorizedException(AUTH_ERRORS.EMAIL_NOT_VERIFIED);
      }

      return this.mapToUserProfile(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.loggerService.logError({
        message: 'Authentication service error',
        context: 'AuthService',
        stackTrace: error.stack,
        severity: 'critical',
        metadata: {
          operation: 'user_validation',
          email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
          error: error.message
        }
      });
      throw new InternalServerErrorException(COMMON_ERRORS.UNAVAILABLE);
    }
  }

  async login(payload: LoginDto, ipAddress?: string, userAgent?: string): Promise<ApiResponse<{
    user: UserProfile;
    accessToken: string;
  }>> {
    try {
      const user = await this.usersService.findByEmail(payload?.email);

      if (!user || !user?.id) {
        throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
      }

      if (!user.isActive) {
        throw new UnauthorizedException(AUTH_ERRORS.ACCOUNT_DEACTIVATED);
      }

      if (!user.emailVerified) {
        throw new UnauthorizedException(AUTH_ERRORS.EMAIL_NOT_VERIFIED);
      }

      const password_match = await this.bcryptService.comparePassword(payload.password, user.password);

      if (!password_match) {
        throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
      }

      const { accessToken } = await this.tokenService.generateAccessToken(user);

      await this.usersService.updateLastLogin(user.id);

      this.loggerService.logAuth('login', {
        message: 'User logged in successfully',
        context: 'AuthService',
        userId: user.id,
        ipAddress,
        userAgent,
        metadata: {
          email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
        }
      });

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          accessToken: accessToken,
        }
      };
    } catch (error) {
      if (error instanceof UnauthorizedException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException) {
        throw error;
      }

      this.loggerService.logError({
        message: 'Login service error',
        context: 'AuthService',
        stackTrace: error.stack,
        severity: 'critical',
        ipAddress,
        userAgent,
        metadata: {
          operation: 'login',
          email: payload.email || 'unknown',
          error: error.message
        }
      });
      throw new InternalServerErrorException(COMMON_ERRORS.INTERNAL_ERROR);
    }
  }

  async register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string): Promise<ApiResponse<UserProfile>> {
    try {

      const existingUser = await this.usersService.findByEmail(registerDto.email);
      if (existingUser) {
        this.loggerService.logSecurity({
          message: 'Registration failed: email already exists',
          context: 'AuthService',
          category: 'security',
          securityEvent: 'suspicious_activity',
          threatLevel: 'low',
          ipAddress,
          userAgent,
          metadata: {
            email: registerDto.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
          }
        });
        throw new ConflictException(AUTH_ERRORS.EMAIL_EXISTS);
      }

      const isStrongPassword = await this.bcryptService.validatePasswordStrength(registerDto.password);

      if (!isStrongPassword) {
        this.loggerService.logSecurity({
          message: 'Registration failed: weak password',
          context: 'AuthService',
          category: 'security',
          securityEvent: 'suspicious_activity',
          threatLevel: 'low',
          ipAddress,
          userAgent,
          metadata: {
            email: registerDto.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
          }
        });
        throw new BadRequestException(AUTH_ERRORS.WEAK_PASSWORD);
      }

      const hashedPassword = await this.bcryptService.hashPassword(registerDto.password);

      const user = await this.usersService.create({
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
        emailVerified: !this.configService.app.useDocker,
      });

      if (this.configService.app.useDocker) {
        const verificationToken = await this.tokenService.generateEmailVerificationToken(user.id, user.email);
        await this.emailService.sendVerificationEmail(user.email, verificationToken);
      }

      this.loggerService.logAuth('register', {
        message: 'User registered successfully',
        context: 'AuthService',
        userId: user.id,
        ipAddress,
        userAgent,
        metadata: {
          email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
        }
      });

      const message = this.configService.app.useDocker 
        ? 'Registration successful. Please check your email to verify your account.'
        : 'Registration successful. Your account is ready to use.';

      return {
        success: true,
        message,
        data: this.mapToUserProfile(user),
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      this.loggerService.logError({
        message: 'Registration error',
        context: 'AuthService',
        stackTrace: error.stack,
        severity: 'critical',
        ipAddress,
        userAgent,
        metadata: {
          email: registerDto.email,
          error: error.message
        }
      });
      throw new InternalServerErrorException(COMMON_ERRORS.INTERNAL_ERROR);
    }
  }

  async logout(userId: string, ipAddress?: string, userAgent?: string): Promise<ApiResponse<null>> {
    try {

      this.loggerService.logAuth('logout', {
        message: 'User logged out successfully',
        context: 'AuthService',
        userId,
        ipAddress,
        userAgent
      });

      return {
        success: true,
        message: 'Logout successful',
        data: null,
      };
    } catch (error) {
      this.loggerService.logError({
        message: 'Logout service error',
        context: 'AuthService',
        userId,
        stackTrace: error.stack,
        severity: 'high',
        ipAddress,
        userAgent,
        metadata: {
          operation: 'logout',
          error: error.message
        }
      });
      throw new InternalServerErrorException(COMMON_ERRORS.UNAVAILABLE);
    }
  }

  async verifyEmail(token: string): Promise<ApiResponse<{ isVerified: boolean; isAlreadyVerified: boolean }>> {
    try {
      const user = await this.tokenService.validateEmailVerificationToken(token);

      let isVerified = (await this.usersService.findById(user.id)).emailVerified;

      if (isVerified) {
        return {
          success: true,
          message: 'Email already verified',
          data: { isVerified: true, isAlreadyVerified: true },
        };
      }

      await this.usersService.verifyEmail(user.id);

      this.loggerService.logAuth('verify', {
        message: 'Email verified successfully',
        context: 'AuthService',
        userId: user.id
      });

      return {
        success: true,
        message: 'Email verified successfully',
        data: { isVerified: true, isAlreadyVerified: false },
      };
    } catch (error) {
      this.loggerService.logError({
        message: 'Email verification service error',
        context: 'AuthService',
        stackTrace: error.stack,
        severity: 'high',
        metadata: {
          operation: 'email_verification',
          error: error.message
        }
      });
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_VERIFICATION_TOKEN);
    }
  }

  private mapToUserProfile(user: any): UserProfile {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}