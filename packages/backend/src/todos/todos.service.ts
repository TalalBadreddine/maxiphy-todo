import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/services/logger.service';
import { Prisma, Todo } from '@prisma/client';
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoQueryDto,
  TodoResponseDto,
  TodoListResponseDto,
  TodoCountsDto,
  Priority,
  TodoStatus
} from './dto/todo.dto';

@Injectable()
export class TodosService {
  private readonly logger = new Logger(TodosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly loggerService: LoggerService
  ) { }

  async createTodo(userId: string, createTodoDto: CreateTodoDto): Promise<TodoResponseDto> {
    const startTime = Date.now();
    try {
      this.loggerService.logInfo({
        message: 'Creating new todo',
        context: 'TodosService',
        userId,
        metadata: {
          title: createTodoDto.title,
          priority: createTodoDto.priority,
          hasDueDate: !!createTodoDto.dueDate
        }
      });

      const todo = await this.prisma.todo.create({
        data: {
          title: createTodoDto.title,
          description: createTodoDto.description,
          priority: createTodoDto.priority,
          dueDate: new Date(createTodoDto.dueDate),
          userId,
        },
      });

      const duration = Date.now() - startTime;
      this.loggerService.logPerformance({
        message: 'Todo created successfully',
        context: 'TodosService',
        category: 'performance',
        performanceMetric: 'database_query',
        value: duration,
        unit: 'ms',
        userId,
        metadata: {
          todoId: todo.id,
          operation: 'create_todo'
        }
      });

      return this.mapToResponseDto(todo);
    } catch (error) {
      this.loggerService.logError({
        message: 'Failed to create todo',
        context: 'TodosService',
        userId,
        stackTrace: error.stack,
        severity: 'high',
        metadata: {
          operation: 'create_todo',
          error: error.message,
          title: createTodoDto.title
        }
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to create todo: ${error.message}`);
      }
      throw error;
    }
  }

  async getTodoCounts(userId: string): Promise<TodoCountsDto> {
    const startTime = Date.now();
    try {
      this.loggerService.logInfo({
        message: 'Fetching todo counts',
        context: 'TodosService',
        userId,
        metadata: { operation: 'get_todo_counts' }
      });

      const [totalCount, activeCount, completedCount] = await Promise.all([
        this.prisma.todo.count({ where: { userId } }),
        this.prisma.todo.count({ where: { userId, completed: false } }),
        this.prisma.todo.count({ where: { userId, completed: true } }),
      ]);

      const duration = Date.now() - startTime;
      this.loggerService.logPerformance({
        message: 'Todo counts fetched successfully',
        context: 'TodosService',
        category: 'performance',
        performanceMetric: 'database_query',
        value: duration,
        unit: 'ms',
        userId,
        metadata: {
          operation: 'get_todo_counts',
          totalCount,
          activeCount,
          completedCount
        }
      });

      return {
        all: totalCount,
        active: activeCount,
        completed: completedCount,
      };
    } catch (error) {
      this.loggerService.logError({
        message: 'Failed to fetch todo counts',
        context: 'TodosService',
        userId,
        stackTrace: error.stack,
        severity: 'medium',
        metadata: {
          operation: 'get_todo_counts',
          error: error.message
        }
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to fetch todo counts: ${error.message}`);
      }
      throw error;
    }
  }

  async getTodos(userId: string, query: TodoQueryDto): Promise<TodoListResponseDto> {
    const startTime = Date.now();
    const {
      search,
      priority,
      completed,
      status,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    try {
      this.loggerService.logInfo({
        message: 'Fetching todos',
        context: 'TodosService',
        userId,
        metadata: {
          search: search || null,
          priority,
          completed,
          status,
          sortBy,
          sortOrder,
          page,
          limit
        }
      });

      const where: Prisma.TodoWhereInput = {
        userId,
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(priority && priority !== 'ALL' && { priority }),
        ...(completed !== undefined && completed !== 'ALL' && { completed }),
        ...(status && status !== 'ALL' && { status }),
      };

      const orderBy: Prisma.TodoOrderByWithRelationInput = this.buildOrderBy(sortBy, sortOrder);
      const skip = (page - 1) * limit;

      const baseWhere: Prisma.TodoWhereInput = {
        userId,
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(priority && priority !== 'ALL' && { priority }),
      };

      const [todos, filteredCount, totalCount, activeCount, completedCount] = await Promise.all([
        this.prisma.todo.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.todo.count({ where }),
        this.prisma.todo.count({ where: baseWhere }),
        this.prisma.todo.count({ where: { ...baseWhere, completed: false } }),
        this.prisma.todo.count({ where: { ...baseWhere, completed: true } }),
      ]);

      const duration = Date.now() - startTime;
      const totalPages = Math.ceil(filteredCount / limit);

      this.loggerService.logPerformance({
        message: 'Todos fetched successfully',
        context: 'TodosService',
        category: 'performance',
        performanceMetric: 'database_query',
        value: duration,
        unit: 'ms',
        userId,
        metadata: {
          operation: 'get_todos',
          totalCount,
          filteredCount,
          page,
          limit,
          hasSearch: !!search
        }
      });

      return {
        todos: todos.map(todo => this.mapToResponseDto(todo)),
        total: totalCount,
        filtered: filteredCount,
        counts: {
          all: totalCount,
          active: activeCount,
          completed: completedCount,
        },
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.loggerService.logError({
        message: 'Failed to fetch todos',
        context: 'TodosService',
        userId,
        stackTrace: error.stack,
        severity: 'high',
        metadata: {
          operation: 'get_todos',
          error: error.message,
          query: query
        }
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to fetch todos: ${error.message}`);
      }
      throw error;
    }
  }

  async getTodoById(userId: string, todoId: string): Promise<TodoResponseDto> {
    try {
      this.loggerService.logInfo({
        message: 'Fetching todo by ID',
        context: 'TodosService',
        userId,
        metadata: { todoId, operation: 'get_todo_by_id' }
      });

      const todo = await this.prisma.todo.findFirst({
        where: {
          id: todoId,
          userId,
        },
      });

      if (!todo) {
        this.loggerService.logSecurity({
          message: 'Todo not found or access denied',
          context: 'TodosService',
          category: 'security',
          securityEvent: 'unauthorized_access',
          threatLevel: 'low',
          userId,
          metadata: { todoId, operation: 'get_todo_by_id' }
        });
        throw new NotFoundException('Todo not found');
      }

      return this.mapToResponseDto(todo);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.loggerService.logError({
        message: 'Failed to fetch todo by ID',
        context: 'TodosService',
        userId,
        stackTrace: error.stack,
        severity: 'medium',
        metadata: {
          todoId,
          operation: 'get_todo_by_id',
          error: error.message
        }
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to fetch todo: ${error.message}`);
      }
      throw error;
    }
  }

  async updateTodo(
    userId: string,
    todoId: string,
    updateTodoDto: UpdateTodoDto
  ): Promise<TodoResponseDto> {
    const startTime = Date.now();

    await this.getTodoById(userId, todoId);

    try {
      this.loggerService.logInfo({
        message: 'Updating todo',
        context: 'TodosService',
        userId,
        metadata: {
          todoId,
          operation: 'update_todo',
          updates: Object.keys(updateTodoDto)
        }
      });

      const updateData: Prisma.TodoUpdateInput = {
        ...(updateTodoDto.title !== undefined && { title: updateTodoDto.title }),
        ...(updateTodoDto.description !== undefined && { description: updateTodoDto.description }),
        ...(updateTodoDto.priority !== undefined && { priority: updateTodoDto.priority }),
        ...(updateTodoDto.completed !== undefined && { completed: updateTodoDto.completed }),
        ...(updateTodoDto.pinned !== undefined && { pinned: updateTodoDto.pinned }),
        ...(updateTodoDto.status !== undefined && { status: updateTodoDto.status }),
        ...(updateTodoDto.dueDate !== undefined && { dueDate: new Date(updateTodoDto.dueDate) }),
      };

      const todo = await this.prisma.todo.update({
        where: { id: todoId },
        data: updateData,
      });

      const duration = Date.now() - startTime;
      this.loggerService.logPerformance({
        message: 'Todo updated successfully',
        context: 'TodosService',
        category: 'performance',
        performanceMetric: 'database_query',
        value: duration,
        unit: 'ms',
        userId,
        metadata: {
          todoId,
          operation: 'update_todo'
        }
      });

      return this.mapToResponseDto(todo);
    } catch (error) {
      this.loggerService.logError({
        message: 'Failed to update todo',
        context: 'TodosService',
        userId,
        stackTrace: error.stack,
        severity: 'high',
        metadata: {
          todoId,
          operation: 'update_todo',
          error: error.message,
          updates: updateTodoDto
        }
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to update todo: ${error.message}`);
      }
      throw error;
    }
  }

  async deleteTodo(userId: string, todoId: string): Promise<{ success: boolean; message: string }> {
    await this.getTodoById(userId, todoId);

    try {
      this.loggerService.logInfo({
        message: 'Deleting todo',
        context: 'TodosService',
        userId,
        metadata: { todoId, operation: 'delete_todo' }
      });

      await this.prisma.todo.delete({
        where: { id: todoId },
      });

      this.loggerService.logInfo({
        message: 'Todo deleted successfully',
        context: 'TodosService',
        userId,
        metadata: { todoId, operation: 'delete_todo' }
      });

      return {
        success: true,
        message: 'Todo deleted successfully',
      };
    } catch (error) {
      this.loggerService.logError({
        message: 'Failed to delete todo',
        context: 'TodosService',
        userId,
        stackTrace: error.stack,
        severity: 'high',
        metadata: {
          todoId,
          operation: 'delete_todo',
          error: error.message
        }
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to delete todo: ${error.message}`);
      }
      throw error;
    }
  }

  async toggleComplete(userId: string, todoId: string): Promise<TodoResponseDto> {

    const currentTodo = await this.getTodoById(userId, todoId);

    try {
      const todo_updated = await this.prisma.todo.update({
        where: { id: todoId },
        data: { completed: !currentTodo.completed },
      });

      return this.mapToResponseDto(todo_updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to toggle todo completion: ${error.message}`);
      }
      throw error;
    }
  }

  async togglePin(userId: string, todoId: string): Promise<TodoResponseDto> {
    const currentTodo = await this.getTodoById(userId, todoId);

    try {
      const todo = await this.prisma.todo.update({
        where: { id: todoId },
        data: { pinned: !currentTodo.pinned },
      });

      return this.mapToResponseDto(todo);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to toggle todo pin: ${error.message}`);
      }
      throw error;
    }
  }

  async updateStatus(userId: string, todoId: string, status: TodoStatus): Promise<TodoResponseDto> {
    await this.getTodoById(userId, todoId);

    try {
      const todo = await this.prisma.todo.update({
        where: { id: todoId },
        data: { status },
      });

      return this.mapToResponseDto(todo);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to update todo status: ${error.message}`);
      }
      throw error;
    }
  }

  private buildOrderBy(sortBy: string, sortOrder: string): Prisma.TodoOrderByWithRelationInput {
    const order = sortOrder === 'asc' ? 'asc' : 'desc';

    switch (sortBy) {
      case 'priority':
        return [
          { pinned: 'desc' },
          {
            priority: {
              sort: order,
              nulls: 'last',
            } as any
          },
          { createdAt: 'desc' },
        ] as any;
      case 'title':
        return [
          { pinned: 'desc' },
          { title: order },
          { createdAt: 'desc' },
        ] as any;
      case 'date':
      default:
        return [
          { pinned: 'desc' },
          { createdAt: order },
        ] as any;
    }
  }

  private mapToResponseDto(todo: Todo): TodoResponseDto {
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      priority: todo.priority as Priority,
      status: todo.status as TodoStatus,
      completed: todo.completed,
      pinned: todo.pinned,
      dueDate: todo.dueDate,
      userId: todo.userId,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };
  }
}