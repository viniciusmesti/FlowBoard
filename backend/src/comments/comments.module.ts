import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, User, Task])
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [TypeOrmModule, CommentsService]
})
export class CommentsModule {}
