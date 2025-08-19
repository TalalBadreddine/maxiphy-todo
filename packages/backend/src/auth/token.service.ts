import { Injectable, UnauthorizedException, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { TOKEN_TYPES } from '../constants';
import { AUTH_ERRORS } from './auth.errors';
import { PrismaService } from '@/prisma/prisma.service';
import { UserTokenType } from '@prisma/client';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) { }

  async generateAccessToken(user: any) {
    try {
      const now = Math.floor(Date.now() / 1000);

      const accessPayload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        type: TOKEN_TYPES.ACCESS_TOKEN,
        iat: now,
      };

      const accessToken = await this.jwtService.signAsync(accessPayload, {
        expiresIn: this.configService.get<string>('auth.jwt.accessTokenExpiresIn') || '20d',
      })

      this.logger.debug('Token generated successfully', {
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      return { accessToken };
    } catch (error) {
      this.logger.error('Token generation failed', {
        userId: user?.id || 'unknown',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw new InternalServerErrorException(AUTH_ERRORS.TOKEN_GENERATION_FAILED);
    }
  }

  async generateEmailVerificationToken(userId: string, email: string): Promise<string> {
    try {

      let currentToken = await this.prismaService.userToken.findFirst({
        where: {
          userId,
          type: UserTokenType.EMAIL_VERIFICATION,
        },
      });

      if (currentToken && currentToken.expiresAt && currentToken.expiresAt > new Date()) {
        return currentToken.token;
      }

      if (currentToken) {
        await this.prismaService.userToken.delete({
          where: { id: currentToken.id },
        });
      }

      const payload = {
        sub: userId,
        email,
        type: UserTokenType.EMAIL_VERIFICATION,
        iat: Math.floor(Date.now() / 1000),
      };

      const token = await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('auth.emailVerification.tokenExpiresIn') || '1h',
      });

      await this.prismaService.userToken.create({
        data: {
          userId,
          token,
          type: UserTokenType.EMAIL_VERIFICATION,
          expiresAt: new Date(Date.now() + 1 * 60 * 1000),
        },
      });

      this.logger.debug('Email verification token generated', {
        userId,
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        timestamp: new Date().toISOString()
      });

      return token;
    } catch (error) {
      this.logger.error('Email verification token generation failed', {
        userId,
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw new InternalServerErrorException(AUTH_ERRORS.TOKEN_GENERATION_FAILED);
    }
  }

  async validateEmailVerificationToken(token: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(token);

      if (decoded.type !== UserTokenType.EMAIL_VERIFICATION) {
        this.logger.warn('Invalid email verification token type', {
          expectedType: UserTokenType.EMAIL_VERIFICATION,
          receivedType: decoded.type || 'unknown',
          timestamp: new Date().toISOString()
        });
        throw new UnauthorizedException(AUTH_ERRORS.INVALID_VERIFICATION_TOKEN);
      }

      const token_fetched = await this.prismaService.userToken.findFirst({
        where: {
          userId: decoded.sub,
          type: UserTokenType.EMAIL_VERIFICATION,
          token: token
        },
      });

      if (token_fetched?.isUsed) {
        throw new UnauthorizedException(AUTH_ERRORS.VERIFICATION_TOKEN_ALREADY_USED);
      }

      await this.prismaService.userToken.update({
        where: { id: token_fetched.id },
        data: { isUsed: true },
      });

      this.logger.debug('Email verification token validated successfully', {
        userId: decoded.sub,
        email: decoded.email?.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        timestamp: new Date().toISOString()
      });

      return {
        id: decoded.sub,
        email: decoded.email,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error.name === 'TokenExpiredError') {
        this.logger.warn('Expired email verification token attempt', {
          error: error.message,
          timestamp: new Date().toISOString()
        });
        throw new UnauthorizedException(AUTH_ERRORS.INVALID_VERIFICATION_TOKEN);
      }

      this.logger.warn('Invalid email verification token validation attempt', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_VERIFICATION_TOKEN);
    }
  }

}