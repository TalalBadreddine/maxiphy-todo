import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { BcryptService } from './bcrypt.service';
import { EmailService } from './email.service';
import { AuthEmailService } from './email-queue.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersModule } from '../users/users.module';
import { LoggerService } from '../common/services/logger.service';
import { QueueModule } from '../queue/queue.module';
import { AppConfigService } from '@/config/config.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwt.secret') || 'secret',
        signOptions: {
          expiresIn: configService.get<string>('auth.jwt.accessTokenExpiresIn') || '20d',
          issuer: configService.get<string>('auth.jwt.issuer') || 'issuer',
          audience: configService.get<string>('auth.jwt.audience') || 'audience',
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    forwardRef(() => QueueModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    BcryptService,
    EmailService,
    AuthEmailService,
    JwtStrategy,
    LocalStrategy,
    LoggerService,
    AppConfigService
  ],
  exports: [AuthService, TokenService, BcryptService, EmailService, AuthEmailService],
})
export class AuthModule { }