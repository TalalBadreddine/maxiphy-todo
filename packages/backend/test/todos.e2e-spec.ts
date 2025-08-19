import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { setupTestDatabase } from './setup';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';


describe('TodosController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;

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
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();

    // Create a verified user and get access token
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'todo@example.com',
        name: 'Todo User',
        password: 'StrongPassword123!',
      });

    const user = await prisma.user.update({
      where: { email: 'todo@example.com' },
      data: { emailVerified: true },
    });
    userId = user.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'todo@example.com',
        password: 'StrongPassword123!',
      });

    accessToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/todos (POST)', () => {
    const validTodoData = {
      title: 'Test Todo',
      description: 'Test Description',
      priority: 'MEDIUM',
      dueDate: '2024-12-31T23:59:59.000Z',
    };

    it('should create a todo successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validTodoData)
        .expect(201);

      expect(response.body).toEqual({
        id: expect.any(String),
        title: validTodoData.title,
        description: validTodoData.description,
        priority: validTodoData.priority,
        completed: false,
        pinned: false,
        dueDate: validTodoData.dueDate,
        userId: userId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      // Verify todo was created in database
      const todo = await prisma.todo.findFirst({
        where: { title: validTodoData.title },
      });
      expect(todo).toBeTruthy();
      expect(todo?.userId).toBe(userId);
    });

    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer())
        .post('/todos')
        .send(validTodoData)
        .expect(401);
    });

    it('should return 400 for invalid data', async () => {
      const invalidTodoData = {
        title: '', // empty title
        priority: 'INVALID', // invalid priority
      };

      await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidTodoData)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteTodoData = {
        description: 'Missing title and other required fields',
      };

      await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(incompleteTodoData)
        .expect(400);
    });
  });

  describe('/todos (GET)', () => {
    beforeEach(async () => {
      // Create test todos
      await prisma.todo.createMany({
        data: [
          {
            title: 'High Priority Todo',
            description: 'Important task',
            priority: 'HIGH',
            dueDate: new Date('2024-12-31'),
            userId: userId,
            completed: false,
            pinned: true,
          },
          {
            title: 'Completed Todo',
            description: 'Done task',
            priority: 'LOW',
            dueDate: new Date('2024-11-30'),
            userId: userId,
            completed: true,
            pinned: false,
          },
          {
            title: 'Medium Priority Todo',
            description: 'Regular task',
            priority: 'MEDIUM',
            dueDate: new Date('2024-10-15'),
            userId: userId,
            completed: false,
            pinned: false,
          },
        ],
      });
    });

    it('should get all todos for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/todos')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual({
        todos: expect.arrayContaining([
          expect.objectContaining({
            title: 'High Priority Todo',
            priority: 'HIGH',
            completed: false,
            pinned: true,
          }),
          expect.objectContaining({
            title: 'Completed Todo',
            priority: 'LOW',
            completed: true,
          }),
          expect.objectContaining({
            title: 'Medium Priority Todo',
            priority: 'MEDIUM',
            completed: false,
          }),
        ]),
        total: 3,
        filtered: 3,
        counts: {
          all: 3,
          active: 2,
          completed: 1,
        },
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter todos by priority', async () => {
      const response = await request(app.getHttpServer())
        .get('/todos?priority=HIGH')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.todos).toHaveLength(1);
      expect(response.body.todos[0].priority).toBe('HIGH');
      expect(response.body.filtered).toBe(1);
    });

    it('should filter todos by completion status', async () => {
      const response = await request(app.getHttpServer())
        .get('/todos?completed=true')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.todos).toHaveLength(1);
      expect(response.body.todos[0].completed).toBe(true);
      expect(response.body.filtered).toBe(1);
    });

    it('should search todos by title', async () => {
      const response = await request(app.getHttpServer())
        .get('/todos?search=High')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.todos).toHaveLength(1);
      expect(response.body.todos[0].title).toContain('High');
    });

    it('should paginate results', async () => {
      const response = await request(app.getHttpServer())
        .get('/todos?page=1&limit=2')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.todos).toHaveLength(2);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(2);
      expect(response.body.totalPages).toBe(2);
    });

    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer())
        .get('/todos')
        .expect(401);
    });
  });

  describe('/todos/:id (GET)', () => {
    let todoId: string;

    beforeEach(async () => {
      const todo = await prisma.todo.create({
        data: {
          title: 'Specific Todo',
          description: 'Specific Description',
          priority: 'MEDIUM',
          dueDate: new Date('2024-12-31'),
          userId: userId,
        },
      });
      todoId = todo.id;
    });

    it('should get specific todo by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual({
        id: todoId,
        title: 'Specific Todo',
        description: 'Specific Description',
        priority: 'MEDIUM',
        completed: false,
        pinned: false,
        dueDate: '2024-12-31T00:00:00.000Z',
        userId: userId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should return 404 for non-existent todo', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174999';
      await request(app.getHttpServer())
        .get(`/todos/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 400 for invalid todo id format', async () => {
      await request(app.getHttpServer())
        .get('/todos/invalid-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer())
        .get(`/todos/${todoId}`)
        .expect(401);
    });
  });

  describe('/todos/:id (PATCH)', () => {
    let todoId: string;

    beforeEach(async () => {
      const todo = await prisma.todo.create({
        data: {
          title: 'Original Title',
          description: 'Original Description',
          priority: 'LOW',
          dueDate: new Date('2024-12-31'),
          userId: userId,
          completed: false,
          pinned: false,
        },
      });
      todoId = todo.id;
    });

    it('should update todo successfully', async () => {
      const updateData = {
        title: 'Updated Title',
        priority: 'HIGH',
        completed: true,
      };

      const response = await request(app.getHttpServer())
        .patch(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        id: todoId,
        title: 'Updated Title',
        description: 'Original Description',
        priority: 'HIGH',
        completed: true,
        pinned: false,
        dueDate: '2024-12-31T00:00:00.000Z',
        userId: userId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      // Verify update in database
      const updatedTodo = await prisma.todo.findUnique({
        where: { id: todoId },
      });
      expect(updatedTodo?.title).toBe('Updated Title');
      expect(updatedTodo?.priority).toBe('HIGH');
      expect(updatedTodo?.completed).toBe(true);
    });

    it('should return 404 for non-existent todo', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174999';
      await request(app.getHttpServer())
        .patch(`/todos/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'New Title' })
        .expect(404);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        priority: 'INVALID_PRIORITY',
      };

      await request(app.getHttpServer())
        .patch(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('/todos/:id (DELETE)', () => {
    let todoId: string;

    beforeEach(async () => {
      const todo = await prisma.todo.create({
        data: {
          title: 'Todo to Delete',
          description: 'Will be deleted',
          priority: 'MEDIUM',
          dueDate: new Date('2024-12-31'),
          userId: userId,
        },
      });
      todoId = todo.id;
    });

    it('should delete todo successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Todo deleted successfully',
      });

      // Verify deletion in database
      const deletedTodo = await prisma.todo.findUnique({
        where: { id: todoId },
      });
      expect(deletedTodo).toBeNull();
    });

    it('should return 404 for non-existent todo', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174999';
      await request(app.getHttpServer())
        .delete(`/todos/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/todos/:id/toggle-complete (PATCH)', () => {
    let todoId: string;

    beforeEach(async () => {
      const todo = await prisma.todo.create({
        data: {
          title: 'Todo to Toggle',
          description: 'Will be toggled',
          priority: 'MEDIUM',
          dueDate: new Date('2024-12-31'),
          userId: userId,
          completed: false,
        },
      });
      todoId = todo.id;
    });

    it('should toggle completion status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/todos/${todoId}/toggle-complete`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.completed).toBe(true);

      // Verify in database
      const updatedTodo = await prisma.todo.findUnique({
        where: { id: todoId },
      });
      expect(updatedTodo?.completed).toBe(true);
    });
  });

  describe('/todos/:id/toggle-pin (PATCH)', () => {
    let todoId: string;

    beforeEach(async () => {
      const todo = await prisma.todo.create({
        data: {
          title: 'Todo to Pin',
          description: 'Will be pinned',
          priority: 'MEDIUM',
          dueDate: new Date('2024-12-31'),
          userId: userId,
          pinned: false,
        },
      });
      todoId = todo.id;
    });

    it('should toggle pin status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/todos/${todoId}/toggle-pin`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.pinned).toBe(true);

      // Verify in database
      const updatedTodo = await prisma.todo.findUnique({
        where: { id: todoId },
      });
      expect(updatedTodo?.pinned).toBe(true);
    });
  });

  describe('/todos/counts (GET)', () => {
    beforeEach(async () => {
      // Create test todos with different statuses
      await prisma.todo.createMany({
        data: [
          {
            title: 'Active Todo 1',
            description: 'Description 1',
            priority: 'LOW',
            dueDate: new Date('2024-12-31'),
            userId: userId,
            completed: false,
          },
          {
            title: 'Active Todo 2',
            description: 'Description 2',
            priority: 'MEDIUM',
            dueDate: new Date('2024-12-31'),
            userId: userId,
            completed: false,
          },
          {
            title: 'Completed Todo 1',
            description: 'Description 3',
            priority: 'HIGH',
            dueDate: new Date('2024-12-31'),
            userId: userId,
            completed: true,
          }
        ]
      });
    });

    it('should return correct todo counts', async () => {
      const response = await request(app.getHttpServer())
        .get('/todos/counts')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          all: 3,
          active: 2,
          completed: 1,
        },
        message: 'Todo counts retrieved successfully',
      });
    });

    it('should return zero counts for user with no todos', async () => {
      // Clear all todos
      await prisma.todo.deleteMany({ where: { userId } });

      const response = await request(app.getHttpServer())
        .get('/todos/counts')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          all: 0,
          active: 0,
          completed: 0,
        },
        message: 'Todo counts retrieved successfully',
      });
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/todos/counts')
        .expect(401);
    });
  });
});