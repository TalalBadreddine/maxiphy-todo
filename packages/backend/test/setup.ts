import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { jest } from '@jest/globals';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test helpers
export const createTestingModule = async (imports: any[], providers: any[] = []) => {
  return await Test.createTestingModule({
    imports,
    providers,
  }).compile();
};

export const setupTestDatabase = async (app: INestApplication) => {
  const prisma = app.get(PrismaService);

  // Clean database before each test
  await prisma.$transaction([
    prisma.todo.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  return prisma;
};

// Mock data helpers
export const mockUser = {
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

export const mockTodo = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  title: 'Test Todo',
  description: 'Test Description',
  priority: 'MEDIUM',
  completed: false,
  pinned: false,
  dueDate: new Date(),
  userId: mockUser.id,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// JWT Mock
export const mockJwtPayload = {
  sub: mockUser.id,
  email: mockUser.email,
  iat: Date.now(),
  exp: Date.now() + 3600000,
};