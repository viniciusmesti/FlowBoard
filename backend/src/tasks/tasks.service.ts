import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { SubTask } from './entities/subtask.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(SubTask)
    private subtasksRepository: Repository<SubTask>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createTaskDto: Partial<Task> & { assigneeId?: string }): Promise<Task> {
    const { assigneeId, ...rest } = createTaskDto;
    const task = this.tasksRepository.create({
      ...rest,
      tags: rest.tags ?? [],
    });
    if (assigneeId) {
      const found = await this.usersRepository.findOne({ where: { id: assigneeId } });
      task.assignee = found || undefined;
    }
    return this.tasksRepository.save(task);
  }

  async findAll(): Promise<Task[]> {
    return this.tasksRepository.find({
      relations: ['owner', 'requirement', 'subtasks', 'comments', 'attachments', 'activities', 'assignee'],
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['owner', 'requirement', 'subtasks', 'comments', 'attachments', 'activities', 'assignee'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: string, updateTaskDto: Partial<Task> & { assigneeId?: string }): Promise<Task> {
    const { assigneeId, ...rest } = updateTaskDto;
    const task = await this.findOne(id);
    Object.assign(task, rest);
    if (assigneeId) {
      const found = await this.usersRepository.findOne({ where: { id: assigneeId } });
      task.assignee = found || undefined;
    }
    return this.tasksRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
  }

  async addSubtask(taskId: string, subtaskData: Partial<SubTask>): Promise<Task> {
    const task = await this.findOne(taskId);
    const subtask = this.subtasksRepository.create({
      ...subtaskData,
      task,
    });
    await this.subtasksRepository.save(subtask);
    return this.findOne(taskId);
  }

  async updateSubtask(taskId: string, subtaskId: string, subtaskData: Partial<SubTask>): Promise<Task> {
    const task = await this.findOne(taskId);
    const subtask = task.subtasks.find(st => st.id === subtaskId);
    
    if (!subtask) {
      throw new NotFoundException(`Subtask with ID ${subtaskId} not found in task ${taskId}`);
    }

    Object.assign(subtask, subtaskData);
    await this.subtasksRepository.save(subtask);
    return this.findOne(taskId);
  }

  async removeSubtask(taskId: string, subtaskId: string): Promise<Task> {
    const task = await this.findOne(taskId);
    const subtask = task.subtasks.find(st => st.id === subtaskId);
    
    if (!subtask) {
      throw new NotFoundException(`Subtask with ID ${subtaskId} not found in task ${taskId}`);
    }

    await this.subtasksRepository.remove(subtask);
    return this.findOne(taskId);
  }

  async updateStatus(id: string, status: Task['status']): Promise<Task> {
    return this.update(id, { status });
  }

  async updateProgress(id: string, progress: number): Promise<Task> {
    return this.update(id, { progress });
  }
} 