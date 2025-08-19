import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { AUTH_ERRORS } from './auth.errors';

@Injectable()
export class BcryptService {
  private readonly logger = new Logger(BcryptService.name);
  private readonly bcryptRounds: number;

  constructor(private readonly configService: ConfigService) {
    this.bcryptRounds = this.configService.get<number>('app.bcryptRounds', 12);
  }

  async hashPassword(password: string): Promise<string> {
    try {
      const hashedPassword = await bcrypt.hash(password, this.bcryptRounds);
      this.logger.debug('Password hashed successfully');
      return hashedPassword;
    } catch (error) {
      this.logger.error('Error hashing password', { error: error.message });
      throw new InternalServerErrorException(AUTH_ERRORS.HASHING_FAILED);
    }
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      this.logger.debug('Password comparison completed', { isMatch });
      return isMatch;
    } catch (error) {
      this.logger.error('Error comparing password', { error: error.message });
      throw new InternalServerErrorException(AUTH_ERRORS.HASHING_FAILED);
    }
  }

  async validatePasswordStrength(password: string): Promise<boolean> {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }
}