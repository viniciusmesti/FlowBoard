import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './entities/template.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private readonly templatesRepository: Repository<Template>,
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async create(
    createDto: CreateTemplateDto,
    user: User
  ): Promise<Template> {
    const template = this.templatesRepository.create({
      ...createDto,
      createdBy: user,
    });
    return this.templatesRepository.save(template);
  }

  async findAll(): Promise<Template[]> {
    return this.templatesRepository.find({
      relations: ['createdBy', 'defaultTasks'],
    });
  }

  async findOne(id: string): Promise<Template> {
    const template = await this.templatesRepository.findOne({
      where: { id },
      relations: ['createdBy', 'defaultTasks'],
    });
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return template;
  }

  async update(
    id: string,
    updateDto: UpdateTemplateDto
  ): Promise<Template> {
    const template = await this.findOne(id);
    Object.assign(template, updateDto);
    return this.templatesRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.templatesRepository.remove(template);
  }

  /**
   * Clona as defaultTasks do template e cria novas tasks vinculadas ao requirement
   */
  async applyTemplate(
    templateId: string,
    requirementId: string,
    userId: string
  ): Promise<Task[]> {
    const template = await this.findOne(templateId);
    if (!template.defaultTasks?.length) {
      throw new NotFoundException('Este template não tem tasks padrão');
    }

    const tasksToCreate = template.defaultTasks.map(dt =>
      this.tasksRepository.create({
        title: dt.title,
        description: dt.description,
        status: dt.status,
        priority: dt.priority,
        owner: { id: userId } as User,
        tags: dt.tags,
        dependencies: dt.dependencies,
        subtasks: dt.subtasks,
        template: { id: templateId } as Template,
        requirement: { id: requirementId } as any,
      }),
    );

    return this.tasksRepository.save(tasksToCreate);
  }

  /**
   * Cria uma única task baseada no template, usada internamente se necessário
   */
  async createTaskFromTemplate(
    templateId: string,
    userId: string
  ): Promise<Task> {
    const template = await this.findOne(templateId);
    const task = this.tasksRepository.create({
      title: template.name,
      description: template.description,
      status: 'planning',
      priority: template.priority,
      owner: { id: userId } as User,
      progress: 0,
      template,
    });
    return this.tasksRepository.save(task);
  }
}
