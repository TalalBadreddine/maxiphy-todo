import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { BcryptService } from './bcrypt.service';
import { AuthEmailService } from './email-queue.service';
import { LoggerService } from '../common/services/logger.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';
import { AUTH_ERRORS } from './auth.errors';
import { COMMON_ERRORS } from '../common/common.errors';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let tokenService: jest.Mocked<TokenService>;
  let bcryptService: jest.Mocked<BcryptService>;
  let emailService: jest.Mocked<AuthEmailService>;
  let loggerService: jest.Mocked<LoggerService>;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    password: '$2b$10$hashedPassword',
    emailVerified: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    emailVerifiedAt: new Date(),
  };

  const mockUserProfile = {
    id: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
    emailVerified: mockUser.emailVerified,
    isActive: mockUser.isActive,
    lastLoginAt: mockUser.lastLoginAt,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateLastLogin: jest.fn(),
      updatePassword: jest.fn(),
      verifyEmail: jest.fn(),
    };

    const mockTokenService = {
      generateAccessToken: jest.fn(),
      generateEmailVerificationToken: jest.fn(),
      validatePasswordResetToken: jest.fn(),
      validateEmailVerificationToken: jest.fn(),
    };

    const mockBcryptService = {
      comparePassword: jest.fn(),
      hashPassword: jest.fn(),
      validatePasswordStrength: jest.fn(),
    };

    const mockEmailService = {
      sendVerificationEmail: jest.fn(),
    };

    const mockLoggerService = {
      logInfo: jest.fn(),
      logError: jest.fn(),
      logSecurity: jest.fn(),
      logPerformance: jest.fn(),
      logAuth: jest.fn(),
      logAuthFailure: jest.fn(),
      logUnauthorizedAccess: jest.fn(),
      logApiCall: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      getInfoLogger: jest.fn(),
      getErrorLogger: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: BcryptService, useValue: mockBcryptService },
        { provide: AuthEmailService, useValue: mockEmailService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    tokenService = module.get(TokenService);
    bcryptService = module.get(BcryptService);
    emailService = module.get(AuthEmailService);
    loggerService = module.get(LoggerService);
  });

  describe('validateUser', () => {
    it('should return user profile when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      bcryptService.comparePassword.mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual(mockUserProfile);
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcryptService.comparePassword).toHaveBeenCalledWith('password123', mockUser.password);
    });

    it('should return null when user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.findByEmail.mockResolvedValue(inactiveUser);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      bcryptService.comparePassword.mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should throw UnauthorizedException when email is not verified', async () => {
      const unverifiedUser = { ...mockUser, emailVerified: false };
      usersService.findByEmail.mockResolvedValue(unverifiedUser);
      bcryptService.comparePassword.mockResolvedValue(true);

      await expect(service.validateUser('test@example.com', 'password123'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      const accessToken = 'jwt-token';
      usersService.findByEmail.mockResolvedValue(mockUser);
      bcryptService.comparePassword.mockResolvedValue(true);
      tokenService.generateAccessToken.mockResolvedValue({ accessToken });
      usersService.updateLastLogin.mockResolvedValue(undefined);

      const result = await service.login(loginDto);

      expect(result.success).toBe(true);
      expect(result.data.user).toEqual(mockUserProfile);
      expect(result.data.accessToken).toBe(accessToken);
      expect(usersService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.findByEmail.mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when email is not verified', async () => {
      const unverifiedUser = { ...mockUser, emailVerified: false };
      usersService.findByEmail.mockResolvedValue(unverifiedUser);

      await expect(service.login(loginDto))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      bcryptService.comparePassword.mockResolvedValue(false);

      await expect(service.login(loginDto))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'new@example.com',
      name: 'New User',
      password: 'strongPassword123!',
    };

    it('should register user successfully', async () => {
      const hashedPassword = '$2b$10$hashedNewPassword';
      const verificationToken = 'verification-token';

      registerDto.password = hashedPassword;
      usersService.findByEmail.mockResolvedValue(null);
      bcryptService.validatePasswordStrength.mockResolvedValue(true);
      bcryptService.hashPassword.mockResolvedValue(hashedPassword);
      usersService.create.mockResolvedValue({ ...mockUser, ...registerDto });
      tokenService.generateEmailVerificationToken.mockResolvedValue(verificationToken);
      emailService.sendVerificationEmail.mockResolvedValue(undefined);

      const result = await service.register(registerDto);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Registration successful');
      expect(usersService.create).toHaveBeenCalledWith({
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
      });
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(registerDto.email, verificationToken);
    });

    it('should throw ConflictException when email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto))
        .rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when password is weak', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      bcryptService.validatePasswordStrength.mockResolvedValue(false);

      await expect(service.register(registerDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyEmail', () => {
    const token = 'verification-token';

    it('should verify email successfully', async () => {
      const unverifiedUser = { ...mockUser, emailVerified: false };
      tokenService.validateEmailVerificationToken.mockResolvedValue(unverifiedUser);
      usersService.findById.mockResolvedValue(unverifiedUser);
      usersService.verifyEmail.mockResolvedValue({ ...mockUser, emailVerified: true });

      const result = await service.verifyEmail(token);

      expect(result.success).toBe(true);
      expect(result.data.isVerified).toBe(true);
      expect(result.data.isAlreadyVerified).toBe(false);
      expect(usersService.verifyEmail).toHaveBeenCalledWith(unverifiedUser.id);
    });

    it('should handle already verified email', async () => {
      tokenService.validateEmailVerificationToken.mockResolvedValue(mockUser);
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.verifyEmail(token);

      expect(result.success).toBe(true);
      expect(result.data.isVerified).toBe(true);
      expect(result.data.isAlreadyVerified).toBe(true);
      expect(usersService.verifyEmail).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      tokenService.validateEmailVerificationToken.mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyEmail(token))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const result = await service.logout(mockUser.id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Logout successful');
      expect(result.data).toBeNull();
    });
  });
});