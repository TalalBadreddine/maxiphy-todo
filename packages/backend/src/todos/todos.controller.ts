import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TodosService } from './todos.service';
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoQueryDto,
  TodoResponseDto,
  TodoListResponseDto,
  TodoCountsDto,
  UpdateTodoStatusDto,
} from './dto/todo.dto';

@ApiTags('todos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new todo',
    description: 'Creates a new todo item for the authenticated user'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Todo created successfully',
    type: TodoResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async createTodo(
    @CurrentUser('id') userId: string,
    @Body() createTodoDto: CreateTodoDto,
  ): Promise<{ success: boolean; data: TodoResponseDto; message: string }> {
    const todo = await this.todosService.createTodo(userId, createTodoDto);

    return {
      success: true,
      data: todo,
      message: 'Todo created successfully',
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all todos',
    description: 'Retrieves all todos for the authenticated user with optional filtering and pagination'
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for title or description' })
  @ApiQuery({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'ALL'] })
  @ApiQuery({ name: 'completed', required: false, type: 'boolean' })
  @ApiQuery({ name: 'status', required: false, enum: ['TODO', 'IN_PROGRESS', 'DONE', 'ALL'] })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['date', 'priority', 'title'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, type: 'number', schema: { minimum: 1 } })
  @ApiQuery({ name: 'limit', required: false, type: 'number', schema: { minimum: 1, maximum: 100 } })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todos retrieved successfully',
    type: TodoListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async getTodos(
    @CurrentUser('id') userId: string,
    @Query() query: TodoQueryDto,
  ): Promise<{ success: boolean; data: TodoListResponseDto; message: string }> {
    const result = await this.todosService.getTodos(userId, query);

    return {
      success: true,
      data: result,
      message: 'Todos retrieved successfully',
    };
  }

  @Get('counts')
  @ApiOperation({
    summary: 'Get todo counts',
    description: 'Retrieves todo counts (all, active, completed) for the authenticated user'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todo counts retrieved successfully',
    type: TodoCountsDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async getTodoCounts(
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: TodoCountsDto; message: string }> {
    const counts = await this.todosService.getTodoCounts(userId);

    return {
      success: true,
      data: counts,
      message: 'Todo counts retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get todo by ID',
    description: 'Retrieves a specific todo by ID for the authenticated user'
  })
  @ApiParam({ name: 'id', description: 'Todo UUID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todo retrieved successfully',
    type: TodoResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Todo not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async getTodoById(
    @CurrentUser('id') userId: string,
    @Param() params: { id: string },
  ): Promise<{ success: boolean; data: TodoResponseDto; message: string }> {
    const todo = await this.todosService.getTodoById(userId, params.id);

    return {
      success: true,
      data: todo,
      message: 'Todo retrieved successfully',
    };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update todo',
    description: 'Updates a todo item for the authenticated user'
  })
  @ApiParam({ name: 'id', description: 'Todo UUID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todo updated successfully',
    type: TodoResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Todo not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async updateTodo(
    @CurrentUser('id') userId: string,
    @Param() params: { id: string },
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<{ success: boolean; data: TodoResponseDto; message: string }> {
    const todo = await this.todosService.updateTodo(userId, params.id, updateTodoDto);

    return {
      success: true,
      data: todo,
      message: 'Todo updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete todo',
    description: 'Deletes a todo item for the authenticated user'
  })
  @ApiParam({ name: 'id', description: 'Todo UUID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todo deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Todo deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Todo not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async deleteTodo(
    @CurrentUser('id') userId: string,
    @Param() params: { id: string },
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.todosService.deleteTodo(userId, params.id);

    return {
      success: result.success,
      message: result.message,
    };
  }

  @Patch(':id/toggle')
  @ApiOperation({
    summary: 'Toggle todo completion',
    description: 'Toggles the completion status of a todo item'
  })
  @ApiParam({ name: 'id', description: 'Todo UUID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todo completion status toggled successfully',
    type: TodoResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Todo not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async toggleComplete(
    @CurrentUser('id') userId: string,
    @Param() params: { id: string },
  ): Promise<{ success: boolean; data: TodoResponseDto; message: string }> {
    const todo = await this.todosService.toggleComplete(userId, params.id);

    return {
      success: true,
      data: todo,
      message: 'Todo completion status toggled successfully',
    };
  }

  @Patch(':id/pin')
  @ApiOperation({
    summary: 'Toggle todo pin status',
    description: 'Toggles the pin status of a todo item'
  })
  @ApiParam({ name: 'id', description: 'Todo UUID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todo pin status toggled successfully',
    type: TodoResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Todo not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async togglePin(
    @CurrentUser('id') userId: string,
    @Param() params: { id: string },
  ): Promise<{ success: boolean; data: TodoResponseDto; message: string }> {
    const todo = await this.todosService.togglePin(userId, params.id);

    return {
      success: true,
      data: todo,
      message: 'Todo pin status toggled successfully',
    };
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update todo status',
    description: 'Updates the status of a todo item'
  })
  @ApiParam({ name: 'id', description: 'Todo UUID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todo status updated successfully',
    type: TodoResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid status value',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Todo not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async updateStatus(
    @CurrentUser('id') userId: string,
    @Param() params: { id: string },
    @Body() updateStatusDto: UpdateTodoStatusDto,
  ): Promise<{ success: boolean; data: TodoResponseDto; message: string }> {
    const todo = await this.todosService.updateStatus(userId, params.id, updateStatusDto.status);

    return {
      success: true,
      data: todo,
      message: 'Todo status updated successfully',
    };
  }
}