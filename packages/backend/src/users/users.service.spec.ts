import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/services/logger.service';
import { CreateUserData } from '../types';


describe('UsersService', () => {
  let service: UsersService;
  let prismaService: any;
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

  const mockCreateUserData: CreateUserData = {
    email: 'new@example.com',
    name: 'New User',
    password: '$2b$10$hashedPassword',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    } as any;

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
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService) as any;
    loggerService = module.get(LoggerService);
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const expectedUser = { ...mockUser, ...mockCreateUserData };
      prismaService.user.create.mockResolvedValue(expectedUser);

      const result = await service.create(mockCreateUserData);

      expect(result).toEqual({ ...expectedUser, password: undefined });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: mockCreateUserData.email.toLowerCase().trim(),
          name: mockCreateUserData.name.trim(),
          password: mockCreateUserData.password,
        },
      });
    });

    it('should handle database errors during creation', async () => {
      prismaService.user.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(mockCreateUserData))
        .rejects.toThrow(InternalServerErrorException);
    });

    it('should trim and lowercase email', async () => {
      const userData = {
        ...mockCreateUserData,
        email: '  TEST@EXAMPLE.COM  ',
        name: '  Test User  ',
      };

      prismaService.user.create.mockResolvedValue(mockUser);

      await service.create(userData);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: userData.password,
        },
      });
    });
  });

  describe('findById', () => {
    it('should find user by id successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id'))
        .rejects.toThrow(NotFoundException);
    });

    it('should handle database errors', async () => {
      prismaService.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(service.findById(mockUser.id))
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email.toLowerCase().trim() },
      });
    });

    it('should return null when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      prismaService.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(service.findByEmail(mockUser.email))
        .rejects.toThrow(InternalServerErrorException);
    });

    it('should trim and lowercase email before search', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await service.findByEmail('  TEST@EXAMPLE.COM  ');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login successfully', async () => {
      const updatedUser = { ...mockUser, lastLoginAt: new Date() };
      prismaService.user.update.mockResolvedValue(updatedUser);

      await service.updateLastLogin(mockUser.id);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { lastLoginAt: expect.any(Date) },
      });
    });

    it('should handle database errors', async () => {
      prismaService.user.update.mockRejectedValue(new Error('Database error'));

      await expect(service.updateLastLogin(mockUser.id))
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updatePassword', () => {
    const newHashedPassword = '$2b$10$newHashedPassword';

    it('should update password successfully', async () => {
      const updatedUser = { ...mockUser, password: newHashedPassword };
      prismaService.user.update.mockResolvedValue(updatedUser);

      await service.updatePassword(mockUser.id, newHashedPassword);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { password: newHashedPassword },
      });
    });

    it('should handle database errors', async () => {
      prismaService.user.update.mockRejectedValue(new Error('Database error'));

      await expect(service.updatePassword(mockUser.id, newHashedPassword))
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const verifiedUser = {
        ...mockUser,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      };
      prismaService.user.update.mockResolvedValue(verifiedUser);

      const result = await service.verifyEmail(mockUser.id);

      expect(result).toEqual({ ...verifiedUser, password: undefined });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: expect.any(Date),
        },
      });
    });

    it('should handle database errors', async () => {
      prismaService.user.update.mockRejectedValue(new Error('Database error'));

      await expect(service.verifyEmail(mockUser.id))
        .rejects.toThrow(InternalServerErrorException);
    });
  });
});