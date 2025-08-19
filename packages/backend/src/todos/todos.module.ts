import { Module } from '@nestjs/common';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerService } from '../common/services/logger.service';

@Module({
  imports: [PrismaModule],
  controllers: [TodosController],
  providers: [TodosService, LoggerService],
  exports: [TodosService],
})
export class TodosModule {}