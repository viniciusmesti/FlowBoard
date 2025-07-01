import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { SubTask } from './entities/subtask.entity';
import { User } from '../users/entities/user.entity';
import { Attachment } from '../attachments/entities/attachment.entity';
import { File as MulterFile } from 'multer';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(SubTask)
    private subtasksRepository: Repository<SubTask>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
  ) {}

  async create(createTaskDto: Partial<Task> & { assigneeId?: string }): Promise<Task> {
    const { assigneeId, ...rest } = createTaskDto;
    const task = this.tasksRepository.create(rest);
    if (assigneeId) {
      const assignee = await this.usersRepository.findOne({ where: { id: assigneeId } });
      if (assignee) {
        task.assignee = assignee;
      }
    }
    const savedTask = await this.tasksRepository.save(task);
    const result = await this.tasksRepository.findOne({
      where: { id: savedTask.id },
      relations: ['assignee', 'owner', 'requirement'],
    });
    if (!result) {
      throw new NotFoundException(`Task with ID ${savedTask.id} not found after save`);
    }
    return result;
  }

  async findAll(): Promise<Task[]> {
    return this.tasksRepository.find({
      relations: ['owner', 'requirement', 'subtasks', 'comments', 'attachments', 'activities', 'assignee'],
    });
  }

  async findOne(id: string): Promise<Task> {
    if (!id) {
      throw new BadRequestException('Task ID is required');
    }

    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['owner', 'requirement', 'subtasks', 'comments', 'attachments', 'activities', 'assignee'],
    });
    
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: string, updateTaskDto: Partial<Task> & { assigneeId?: string, ownerId?: string }): Promise<Task> {
    const { assigneeId, ownerId, ...rest } = updateTaskDto;
    const task = await this.findOne(id);
    Object.assign(task, rest);
    if (ownerId) {
      const owner = await this.usersRepository.findOne({ where: { id: ownerId } });
      if (owner) {
        task.owner = owner;
      }
    }
    if (assigneeId) {
      const assignee = await this.usersRepository.findOne({ where: { id: assigneeId } });
      if (assignee) {
        task.assignee = assignee;
      }
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

  async addAttachments(taskId: string, files: MulterFile[]): Promise<Attachment[]> {
    // Validate input
    if (!taskId) {
      throw new BadRequestException('Task ID is required');
    }
    
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    console.log(`Adding attachments to task ${taskId}`, files.map(f => f.originalname));

    // Check if task exists
    const task = await this.findOne(taskId);
    
    const attachments: Attachment[] = [];
    
    try {
      for (const file of files) {
        const attachment = this.attachmentsRepository.create({
          name: file.originalname,
          url: `/uploads/tasks/${taskId}/${file.filename}`,
          size: file.size,
          type: 'document',
          task,
        });
        
        const savedAttachment = await this.attachmentsRepository.save(attachment);
        attachments.push(savedAttachment);
      }
      
      console.log(`Successfully added ${attachments.length} attachments to task ${taskId}`);
      
      // Return all attachments for this task
      return this.attachmentsRepository.find({ 
        where: { task: { id: taskId } },
        relations: ['task']
      });
    } catch (error) {
      console.error(`Error adding attachments to task ${taskId}:`, error);
      throw new BadRequestException(`Failed to add attachments: ${error.message}`);
    }
  }

  // Helper method to check if task exists (useful for debugging)
  async taskExists(id: string): Promise<boolean> {
    const count = await this.tasksRepository.count({ where: { id } });
    return count > 0;
  }

  // Helper method to get task without throwing error
  async findOneOrNull(id: string): Promise<Task | null> {
    return this.tasksRepository.findOne({
      where: { id },
      relations: ['owner', 'requirement', 'subtasks', 'comments', 'attachments', 'activities', 'assignee'],
    });
  }
}