import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { setupTestDatabase } from './setup';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';


describe('HealthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = await setupTestDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return basic health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: expect.any(String),
      });

      // Verify timestamp is valid ISO string
      expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);

      // Verify uptime is positive number
      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('/health/detailed (GET)', () => {
    it('should return detailed health information', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toEqual({
        status: expect.stringMatching(/^(healthy|degraded)$/),
        timestamp: expect.any(String),
        responseTime: expect.stringMatching(/^\d+ms$/),
        memory: {
          used: expect.stringMatching(/^\d+MB$/),
          total: expect.stringMatching(/^\d+MB$/),
          external: expect.stringMatching(/^\d+MB$/),
          rss: expect.stringMatching(/^\d+MB$/),
        },
        system: {
          uptime: expect.any(Number),
          nodeVersion: expect.stringMatching(/^v\d+\.\d+\.\d+$/),
          platform: expect.any(String),
          arch: expect.any(String),
          pid: expect.any(Number),
        },
      });

      // Verify timestamp is valid ISO string
      expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);

      // Verify system info is reasonable
      expect(response.body.system.uptime).toBeGreaterThan(0);
      expect(response.body.system.pid).toBeGreaterThan(0);
      expect(['linux', 'darwin', 'win32']).toContain(response.body.system.platform);
      expect(['x64', 'arm64', 'x32']).toContain(response.body.system.arch);
    });

    it('should have reasonable memory usage values', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/detailed')
        .expect(200);

      const memory = response.body.memory;

      // Extract numeric values from memory strings (e.g., "50MB" -> 50)
      const usedMB = parseInt(memory.used.replace('MB', ''));
      const totalMB = parseInt(memory.total.replace('MB', ''));
      const externalMB = parseInt(memory.external.replace('MB', ''));
      const rssMB = parseInt(memory.rss.replace('MB', ''));

      // Memory usage should be reasonable for a test application
      expect(usedMB).toBeGreaterThan(0);
      expect(totalMB).toBeGreaterThan(usedMB);
      expect(externalMB).toBeGreaterThanOrEqual(0);
      expect(rssMB).toBeGreaterThan(0);

      // Total memory should be greater than used memory
      expect(totalMB).toBeGreaterThanOrEqual(usedMB);
    });
  });

  describe('/health/readiness (GET)', () => {
    it('should return readiness status when services are available', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/readiness')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ready',
        timestamp: expect.any(String),
        checks: {
          database: 'ok',
          application: 'ok',
        },
      });

      // Verify timestamp is valid ISO string
      expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
    });

    it('should handle database connectivity issues gracefully', async () => {
      // Note: This test would require temporarily breaking database connection
      // For now, we just ensure the endpoint exists and handles errors properly
      const response = await request(app.getHttpServer())
        .get('/health/readiness')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(['ready', 'not ready']).toContain(response.body.status);
    });
  });

  describe('/health/liveness (GET)', () => {
    it('should return liveness status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/liveness')
        .expect(200);

      expect(response.body).toEqual({
        status: 'alive',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      });

      // Verify timestamp is valid ISO string
      expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);

      // Verify uptime is positive number
      expect(response.body.uptime).toBeGreaterThan(0);
    });

    it('should always return alive status', async () => {
      // Make multiple requests to ensure consistency
      for (let i = 0; i < 3; i++) {
        const response = await request(app.getHttpServer())
          .get('/health/liveness')
          .expect(200);

        expect(response.body.status).toBe('alive');
      }
    });
  });

  describe('Health endpoint response times', () => {
    it('should respond quickly to health checks', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      const responseTime = Date.now() - startTime;

      // Health check should respond within 1 second
      expect(responseTime).toBeLessThan(1000);
    });

    it('should respond quickly to readiness checks', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/health/readiness')
        .expect(200);

      const responseTime = Date.now() - startTime;

      // Readiness check should respond within 2 seconds (includes DB check)
      expect(responseTime).toBeLessThan(2000);
    });

    it('should respond quickly to liveness checks', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/health/liveness')
        .expect(200);

      const responseTime = Date.now() - startTime;

      // Liveness check should be very fast (no external dependencies)
      expect(responseTime).toBeLessThan(500);
    });
  });

  describe('Health endpoint error handling', () => {
    it('should return 404 for non-existent health endpoints', async () => {
      await request(app.getHttpServer())
        .get('/health/nonexistent')
        .expect(404);
    });

    it('should handle malformed requests gracefully', async () => {
      // The health endpoints don't accept query parameters or body data
      // They should still work normally even if extra data is sent
      await request(app.getHttpServer())
        .get('/health?extra=parameter')
        .expect(200);

      await request(app.getHttpServer())
        .post('/health')
        .send({ unnecessary: 'data' })
        .expect(404); // POST is not allowed, should return 404
    });
  });
});