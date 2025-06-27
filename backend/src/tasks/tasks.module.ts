import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task, SubTask } from './entities';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { Attachment } from '../attachments/entities/attachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, SubTask, User, Attachment]),
    UsersModule
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TypeOrmModule, TasksService]
})
export class TasksModule {}
