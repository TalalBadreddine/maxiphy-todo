import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { setupTestDatabase } from './setup';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));

    await app.init();
    prisma = await setupTestDatabase(app);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    const validRegisterData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'StrongPassword123!',
    };

    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: expect.stringContaining('Registration successful'),
        data: {
          id: expect.any(String),
          email: validRegisterData.email,
          name: validRegisterData.name,
          emailVerified: false,
          isActive: true,
          lastLoginAt: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: validRegisterData.email },
      });
      expect(user).toBeTruthy();
      expect(user?.email).toBe(validRegisterData.email);
    });

    it('should return 409 when email already exists', async () => {
      // Create user first
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterData)
        .expect(201);

      // Try to register with same email
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterData)
        .expect(409);

      expect(response.body.message).toContain('email already exists');
    });

    it('should return 400 for weak password', async () => {
      const weakPasswordData = {
        ...validRegisterData,
        password: '123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body.message).toContain('weak password');
    });

    it('should return 400 for invalid email format', async () => {
      const invalidEmailData = {
        ...validRegisterData,
        email: 'invalid-email',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidEmailData)
        .expect(400);

      expect(response.body.message).toContain('validation');
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        email: 'test@example.com',
        // missing name and password
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(incompleteData)
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    let verifiedUser: any;
    const loginData = {
      email: 'verified@example.com',
      password: 'StrongPassword123!',
    };

    beforeEach(async () => {
      // Create and verify a user for login tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: loginData.email,
          name: 'Verified User',
          password: loginData.password,
        });

      verifiedUser = await prisma.user.update({
        where: { email: loginData.email },
        data: { emailVerified: true },
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: verifiedUser.id,
            email: verifiedUser.email,
            name: verifiedUser.name,
            emailVerified: true,
            isActive: true,
            lastLoginAt: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
          accessToken: expect.any(String),
        },
      });

      // Verify token is a valid JWT format
      expect(response.body.data.accessToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: loginData.password,
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: loginData.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return 401 for unverified email', async () => {
      // Create unverified user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'unverified@example.com',
          name: 'Unverified User',
          password: loginData.password,
        });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'unverified@example.com',
          password: loginData.password,
        })
        .expect(401);

      expect(response.body.message).toContain('email not verified');
    });

    it('should return 401 for inactive account', async () => {
      // Deactivate user
      await prisma.user.update({
        where: { id: verifiedUser.id },
        data: { isActive: false },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toContain('account deactivated');
    });
  });

  describe('/auth/logout (POST)', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login to get access token
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'logout@example.com',
          name: 'Logout User',
          password: 'StrongPassword123!',
        });

      await prisma.user.update({
        where: { email: 'logout@example.com' },
        data: { emailVerified: true },
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'logout@example.com',
          password: 'StrongPassword123!',
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Logout successful',
        data: null,
      });
    });

    it('should return 401 without authorization header', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/auth/verify-email (GET)', () => {
    it('should return 401 for invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/verify-email?token=invalid-token')
        .expect(401);
    });

    // Note: Valid email verification would require generating a real token
    // which involves the TokenService. This could be extended with proper
    // token generation for more comprehensive testing.
  });

  describe('/auth/forgot-password (POST)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'forgot@example.com',
          name: 'Forgot User',
          password: 'StrongPassword123!',
        });
    });

    it('should return 400 for invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);
    });

    it('should return 400 for missing email', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({})
        .expect(400);
    });
  });

  describe('/auth/reset-password (POST)', () => {
    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'some-token',
          // missing password and confirmPassword
        })
        .expect(400);
    });

    it('should return 400 for password mismatch', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'some-token',
          password: 'NewPassword123!',
          confirmPassword: 'DifferentPassword123!',
        })
        .expect(400);
    });

    it('should return 401 for invalid token', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        })
        .expect(401);
    });
  });
});