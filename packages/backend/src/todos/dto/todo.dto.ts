import {
  IsString,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  Max
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum TodoStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export class CreateTodoDto {
  @ApiProperty({
    description: 'Todo title',
    example: 'Complete project documentation',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @MinLength(1, { message: 'Title must not be empty' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title: string;

  @ApiProperty({
    description: 'Todo description',
    example: 'Write comprehensive documentation for the new features',
    maxLength: 1000,
  })
  @IsString()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description: string;

  @ApiProperty({
    description: 'Todo priority level',
    enum: Priority,
    example: Priority.MEDIUM,
  })
  @IsEnum(Priority, { message: 'Priority must be LOW, MEDIUM, or HIGH' })
  priority: Priority;

  @ApiPropertyOptional({
    description: 'Todo status',
    enum: TodoStatus,
    example: TodoStatus.TODO,
  })
  @IsOptional()
  @IsEnum(TodoStatus, { message: 'Status must be TODO, IN_PROGRESS, or DONE' })
  status?: TodoStatus;

  @ApiProperty({
    description: 'Due date for the todo',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString({}, { message: 'Due date must be a valid ISO date string' })
  dueDate: string;
}

export class UpdateTodoDto {
  @ApiPropertyOptional({
    description: 'Todo title',
    example: 'Updated project documentation',
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Title must not be empty' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Todo description',
    example: 'Updated description for the documentation',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Todo priority level',
    enum: Priority,
    example: Priority.HIGH,
  })
  @IsOptional()
  @IsEnum(Priority, { message: 'Priority must be LOW, MEDIUM, or HIGH' })
  priority?: Priority;

  @ApiPropertyOptional({
    description: 'Todo status',
    enum: TodoStatus,
    example: TodoStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(TodoStatus, { message: 'Status must be TODO, IN_PROGRESS, or DONE' })
  status?: TodoStatus;

  @ApiPropertyOptional({
    description: 'Todo completion status',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Completed must be a boolean value' })
  completed?: boolean;

  @ApiPropertyOptional({
    description: 'Todo pinned status',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Pinned must be a boolean value' })
  pinned?: boolean;

  @ApiPropertyOptional({
    description: 'Due date for the todo',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid ISO date string' })
  dueDate?: string;
}

export class TodoQueryDto {
  @ApiPropertyOptional({
    description: 'Search term for filtering todos by title or description',
    example: 'documentation',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by priority level',
    enum: [...Object.values(Priority), 'ALL'],
    example: Priority.HIGH,
  })
  @IsOptional()
  @IsEnum([...Object.values(Priority), 'ALL'], {
    message: 'Priority must be LOW, MEDIUM, HIGH, or ALL'
  })
  priority?: Priority | 'ALL';

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: [...Object.values(TodoStatus), 'ALL'],
    example: TodoStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum([...Object.values(TodoStatus), 'ALL'], {
    message: 'Status must be TODO, IN_PROGRESS, DONE, or ALL'
  })
  status?: TodoStatus | 'ALL';

  @ApiPropertyOptional({
    description: 'Filter by completion status',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'ALL') return 'ALL';
    return value;
  })
  completed?: boolean | 'ALL';

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['date', 'priority', 'title'],
    example: 'date',
  })
  @IsOptional()
  @IsEnum(['date', 'priority', 'title'], {
    message: 'Sort by must be date, priority, or title'
  })
  sortBy?: 'date' | 'priority' | 'title';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'Sort order must be asc or desc' })
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number;
}

export class TodoParamsDto {
  @ApiProperty({
    description: 'Todo UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'Invalid todo ID format' })
  id: string;
}

export class TodoResponseDto {
  @ApiProperty({
    description: 'Todo UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Todo title',
    example: 'Complete project documentation',
  })
  title: string;

  @ApiProperty({
    description: 'Todo description',
    example: 'Write comprehensive documentation for the new features',
  })
  description: string;

  @ApiProperty({
    description: 'Todo priority level',
    enum: Priority,
    example: Priority.MEDIUM,
  })
  priority: Priority;

  @ApiProperty({
    description: 'Todo status',
    enum: TodoStatus,
    example: TodoStatus.TODO,
  })
  status: TodoStatus;

  @ApiProperty({
    description: 'Todo completion status',
    example: false,
  })
  completed: boolean;

  @ApiProperty({
    description: 'Todo pinned status',
    example: false,
  })
  pinned: boolean;

  @ApiProperty({
    description: 'Due date for the todo',
    example: '2024-12-31T23:59:59.000Z',
  })
  dueDate: Date;

  @ApiProperty({
    description: 'User UUID who owns the todo',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Todo creation date',
    example: '2024-08-16T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Todo last update date',
    example: '2024-08-16T15:30:00.000Z',
  })
  updatedAt: Date;
}

export class UpdateTodoStatusDto {
  @ApiProperty({
    description: 'Todo status',
    enum: TodoStatus,
    example: TodoStatus.IN_PROGRESS,
  })
  @IsEnum(TodoStatus, { message: 'Status must be TODO, IN_PROGRESS, or DONE' })
  status: TodoStatus;
}

export class TodoCountsDto {
  @ApiProperty({
    description: 'Total number of todos',
    example: 25,
  })
  all: number;

  @ApiProperty({
    description: 'Number of active (not completed) todos',
    example: 15,
  })
  active: number;

  @ApiProperty({
    description: 'Number of completed todos',
    example: 10,
  })
  completed: number;
}

export class TodoListResponseDto {
  @ApiProperty({
    description: 'Array of todos',
    type: [TodoResponseDto],
  })
  todos: TodoResponseDto[];

  @ApiProperty({
    description: 'Total number of todos (all todos for user)',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Number of todos matching current filter',
    example: 15,
  })
  filtered: number;

  @ApiProperty({
    description: 'Counts for each tab',
    type: TodoCountsDto,
  })
  counts: TodoCountsDto;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  totalPages: number;
}