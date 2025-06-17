import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task, SubTask } from './entities';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, SubTask])
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TypeOrmModule, TasksService]
})
export class TasksModule {}
