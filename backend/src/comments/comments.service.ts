import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Task)
    private readonly tasksRepo: Repository<Task>,
  ) {}

  async create(taskId: string, authorId: string, content: string): Promise<Comment> {
    const task = await this.tasksRepo.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    const author = await this.usersRepo.findOne({ where: { id: authorId } });
    if (!author) {
      throw new NotFoundException(`User with ID ${authorId} not found`);
    }
    const comment = this.commentsRepo.create({ content, task, author });
    return this.commentsRepo.save(comment);
  }
}