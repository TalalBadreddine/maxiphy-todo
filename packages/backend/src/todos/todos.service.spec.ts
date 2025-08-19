import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TodosService } from './todos.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/services/logger.service';
import { Prisma } from '@prisma/client';
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoQueryDto,
  Priority
} from './dto/todo.dto';

describe('TodosService', () => {
  let service: TodosService;
  let prismaService: any;

  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockTodoId = '123e4567-e89b-12d3-a456-426614174001';

  const mockTodo = {
    id: mockTodoId,
    title: 'Test Todo',
    description: 'Test Description',
    priority: 'MEDIUM' as Priority,
    completed: false,
    pinned: false,
    dueDate: new Date('2024-12-31'),
    userId: mockUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateTodoDto: CreateTodoDto = {
    title: 'New Todo',
    description: 'New Description',
    priority: 'HIGH' as Priority,
    dueDate: '2024-12-31',
  };

  const mockUpdateTodoDto: UpdateTodoDto = {
    title: 'Updated Todo',
    completed: true,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      todo: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    } as any;

    const mockLoggerService = {
      logInfo: jest.fn(),
      logError: jest.fn(),
      logPerformance: jest.fn(),
      logSecurity: jest.fn(),
      debug: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    prismaService = module.get(PrismaService) as any;
  });

  describe('createTodo', () => {
    it('should create todo successfully', async () => {
      const expectedTodo = {
        ...mockTodo,
        title: mockCreateTodoDto.title,
        description: mockCreateTodoDto.description,
        priority: mockCreateTodoDto.priority,
      };

      prismaService.todo.create.mockResolvedValue(expectedTodo);

      const result = await service.createTodo(mockUserId, mockCreateTodoDto);

      expect(result).toEqual({
        id: expectedTodo.id,
        title: expectedTodo.title,
        description: expectedTodo.description,
        priority: expectedTodo.priority,
        completed: expectedTodo.completed,
        pinned: expectedTodo.pinned,
        dueDate: expectedTodo.dueDate,
        userId: expectedTodo.userId,
        createdAt: expectedTodo.createdAt,
        updatedAt: expectedTodo.updatedAt,
      });

      expect(prismaService.todo.create).toHaveBeenCalledWith({
        data: {
          title: mockCreateTodoDto.title,
          description: mockCreateTodoDto.description,
          priority: mockCreateTodoDto.priority,
          dueDate: new Date(mockCreateTodoDto.dueDate),
          userId: mockUserId,
        },
      });
    });

    it('should handle Prisma errors during creation', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Database error',
        { code: 'P2002', clientVersion: '5.0.0' }
      );
      prismaService.todo.create.mockRejectedValue(prismaError);

      await expect(service.createTodo(mockUserId, mockCreateTodoDto))
        .rejects.toThrow('Failed to create todo');
    });
  });

  describe('getTodos', () => {
    const mockQuery: TodoQueryDto = {
      search: 'test',
      priority: 'HIGH' as Priority,
      completed: false,
      sortBy: 'date',
      sortOrder: 'desc',
      page: 1,
      limit: 10,
    };

    const mockTodos = [mockTodo];
    const mockCounts = {
      total: 5,
      filtered: 1,
      active: 3,
      completed: 2,
    };

    it('should get todos with filters and pagination', async () => {
      prismaService.todo.findMany.mockResolvedValue(mockTodos);
      prismaService.todo.count
        .mockResolvedValueOnce(mockCounts.filtered) // filtered count
        .mockResolvedValueOnce(mockCounts.total) // total count
        .mockResolvedValueOnce(mockCounts.active) // active count
        .mockResolvedValueOnce(mockCounts.completed); // completed count

      const result = await service.getTodos(mockUserId, mockQuery);

      expect(result).toEqual({
        todos: mockTodos.map(todo => ({
          id: todo.id,
          title: todo.title,
          description: todo.description,
          priority: todo.priority,
          completed: todo.completed,
          pinned: todo.pinned,
          dueDate: todo.dueDate,
          userId: todo.userId,
          createdAt: todo.createdAt,
          updatedAt: todo.updatedAt,
        })),
        total: mockCounts.total,
        filtered: mockCounts.filtered,
        counts: {
          all: mockCounts.total,
          active: mockCounts.active,
          completed: mockCounts.completed,
        },
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      expect(prismaService.todo.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
          priority: 'HIGH',
          completed: false,
        },
        orderBy: [
          { pinned: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: 0,
        take: 10,
      });
    });

    it('should handle empty query parameters', async () => {
      const emptyQuery: TodoQueryDto = {};

      prismaService.todo.findMany.mockResolvedValue([]);
      prismaService.todo.count.mockResolvedValue(0);

      const result = await service.getTodos(mockUserId, emptyQuery);

      expect(result.todos).toEqual([]);
      expect(prismaService.todo.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: [
          { pinned: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: 0,
        take: 10,
      });
    });

    it('should handle Prisma errors during fetch', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Database error',
        { code: 'P2001', clientVersion: '5.0.0' }
      );
      prismaService.todo.findMany.mockRejectedValue(prismaError);

      await expect(service.getTodos(mockUserId, mockQuery))
        .rejects.toThrow('Failed to fetch todos');
    });
  });

  describe('getTodoById', () => {
    it('should get todo by id successfully', async () => {
      prismaService.todo.findFirst.mockResolvedValue(mockTodo);

      const result = await service.getTodoById(mockUserId, mockTodoId);

      expect(result).toEqual({
        id: mockTodo.id,
        title: mockTodo.title,
        description: mockTodo.description,
        priority: mockTodo.priority,
        completed: mockTodo.completed,
        pinned: mockTodo.pinned,
        dueDate: mockTodo.dueDate,
        userId: mockTodo.userId,
        createdAt: mockTodo.createdAt,
        updatedAt: mockTodo.updatedAt,
      });

      expect(prismaService.todo.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockTodoId,
          userId: mockUserId,
        },
      });
    });

    it('should throw NotFoundException when todo not found', async () => {
      prismaService.todo.findFirst.mockResolvedValue(null);

      await expect(service.getTodoById(mockUserId, 'nonexistent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTodo', () => {
    it('should update todo successfully', async () => {
      const updatedTodo = { ...mockTodo, ...mockUpdateTodoDto };

      prismaService.todo.findFirst.mockResolvedValue(mockTodo);
      prismaService.todo.update.mockResolvedValue(updatedTodo);

      const result = await service.updateTodo(mockUserId, mockTodoId, mockUpdateTodoDto);

      expect(result.title).toBe(mockUpdateTodoDto.title);
      expect(result.completed).toBe(mockUpdateTodoDto.completed);

      expect(prismaService.todo.update).toHaveBeenCalledWith({
        where: { id: mockTodoId },
        data: {
          title: mockUpdateTodoDto.title,
          completed: mockUpdateTodoDto.completed,
        },
      });
    });

    it('should throw NotFoundException when todo not found', async () => {
      prismaService.todo.findFirst.mockResolvedValue(null);

      await expect(service.updateTodo(mockUserId, 'nonexistent-id', mockUpdateTodoDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTodo', () => {
    it('should delete todo successfully', async () => {
      prismaService.todo.findFirst.mockResolvedValue(mockTodo);
      prismaService.todo.delete.mockResolvedValue(mockTodo);

      const result = await service.deleteTodo(mockUserId, mockTodoId);

      expect(result).toEqual({
        success: true,
        message: 'Todo deleted successfully',
      });

      expect(prismaService.todo.delete).toHaveBeenCalledWith({
        where: { id: mockTodoId },
      });
    });

    it('should throw NotFoundException when todo not found', async () => {
      prismaService.todo.findFirst.mockResolvedValue(null);

      await expect(service.deleteTodo(mockUserId, 'nonexistent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleComplete', () => {
    it('should toggle todo completion status', async () => {
      const toggledTodo = { ...mockTodo, completed: true };

      prismaService.todo.findFirst.mockResolvedValue(mockTodo);
      prismaService.todo.update.mockResolvedValue(toggledTodo);

      const result = await service.toggleComplete(mockUserId, mockTodoId);

      expect(result.completed).toBe(true);

      expect(prismaService.todo.update).toHaveBeenCalledWith({
        where: { id: mockTodoId },
        data: { completed: true },
      });
    });
  });

  describe('togglePin', () => {
    it('should toggle todo pin status', async () => {
      const pinnedTodo = { ...mockTodo, pinned: true };

      prismaService.todo.findFirst.mockResolvedValue(mockTodo);
      prismaService.todo.update.mockResolvedValue(pinnedTodo);

      const result = await service.togglePin(mockUserId, mockTodoId);

      expect(result.pinned).toBe(true);

      expect(prismaService.todo.update).toHaveBeenCalledWith({
        where: { id: mockTodoId },
        data: { pinned: true },
      });
    });
  });
});