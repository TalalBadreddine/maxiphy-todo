import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

describe('HealthService', () => {
  let service: HealthService;
  let configService: jest.Mocked<ConfigService>;
  let prismaService: any;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const mockPrismaService = {
      $queryRaw: jest.fn(),
      getDatabaseStats: jest.fn(),
    } as any;

    const mockUsersService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    configService = module.get(ConfigService);
    prismaService = module.get(PrismaService) as any;

    // Mock process.uptime
    jest.spyOn(process, 'uptime').mockReturnValue(1234.56);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getBasicHealth', () => {
    it('should return basic health check successfully', async () => {
      prismaService.$queryRaw.mockResolvedValue([{ 1: 1 }]);
      configService.get.mockReturnValue('test');

      const result = await service.getBasicHealth();

      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: 1234.56,
        environment: 'test',
      });

      expect(prismaService.$queryRaw).toHaveBeenCalledWith(expect.anything());
      expect(configService.get).toHaveBeenCalledWith('app.environment', 'development');
    });

    it('should throw InternalServerErrorException when database fails', async () => {
      prismaService.$queryRaw.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.getBasicHealth())
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getDetailedHealth', () => {
    beforeEach(() => {
      // Mock memory usage
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        rss: 104857600, // 100MB
        heapTotal: 83886080, // 80MB
        heapUsed: 52428800, // 50MB
        external: 10485760, // 10MB
        arrayBuffers: 0,
      });

      // Mock process properties
      Object.defineProperty(process, 'version', { value: 'v18.17.0' });
      Object.defineProperty(process, 'platform', { value: 'linux' });
      Object.defineProperty(process, 'arch', { value: 'x64' });
      Object.defineProperty(process, 'pid', { value: 12345 });
    });

    it('should return detailed health check successfully', async () => {
      prismaService.$queryRaw.mockResolvedValue([{ 1: 1 }]);
      prismaService.getDatabaseStats.mockResolvedValue({
        userCount: 10,
        todoCount: 25,
      });

      const result = await service.getDetailedHealth();

      expect(result).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        responseTime: expect.stringMatching(/\d+ms/),
        memory: {
          used: '50MB',
          total: '80MB',
          external: '10MB',
          rss: '100MB',
        },
        system: {
          uptime: 1234.56,
          nodeVersion: 'v18.17.0',
          platform: 'linux',
          arch: 'x64',
          pid: 12345,
        },
      });
    });

    it('should return degraded status when database is unhealthy', async () => {
      prismaService.$queryRaw.mockRejectedValue(new Error('Database error'));
      prismaService.getDatabaseStats.mockRejectedValue(new Error('Stats error'));

      const result = await service.getDetailedHealth();

      expect(result.status).toBe('degraded');
    });

    it('should return degraded status when database fails', async () => {
      prismaService.$queryRaw.mockRejectedValue(new Error('Unexpected error'));

      const result = await service.getDetailedHealth();

      expect(result.status).toBe('degraded');
      expect(result).toHaveProperty('memory');
      expect(result).toHaveProperty('system');
    });
  });

  describe('getReadiness', () => {
    it('should return ready status when database is accessible', async () => {
      prismaService.$queryRaw.mockResolvedValue([{ 1: 1 }]);

      const result = await service.getReadiness();

      expect(result).toEqual({
        status: 'ready',
        timestamp: expect.any(String),
        checks: {
          database: 'ok',
          application: 'ok',
        },
      });
    });

    it('should return not ready status when database fails', async () => {
      const error = new Error('Database connection failed');
      prismaService.$queryRaw.mockRejectedValue(error);

      const result = await service.getReadiness();

      expect(result).toEqual({
        status: 'not ready',
        timestamp: expect.any(String),
        error: 'Database connection failed',
      });
    });
  });

  describe('getLiveness', () => {
    it('should always return alive status', async () => {
      const result = await service.getLiveness();

      expect(result).toEqual({
        status: 'alive',
        timestamp: expect.any(String),
        uptime: 1234.56,
      });
    });
  });
});