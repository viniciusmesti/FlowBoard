import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository }           from '@nestjs/typeorm';
import { Repository }                from 'typeorm';
import { Requirement }               from './entities/requirement.entity';
import { CreateRequirementDto }      from './dto/create-requirement.dto';
import { UpdateRequirementDto }      from './dto/update-requirement.dto';
import { User }                      from '../users/entities/user.entity';

function normalizeDateOnly(dateString?: string): Date | undefined {
  if (!dateString) return undefined;
  // Interpreta YYYY-MM-DD como data local ao meio-dia para evitar fuso UTC -1 dia
  const [y, m, d] = dateString.split('-').map(Number);
  if (!y || !m || !d) return new Date(dateString);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

@Injectable()
export class RequirementsService {
  constructor(
    @InjectRepository(Requirement)
    private readonly repo: Repository<Requirement>,
  ) {}

  async create(dto: CreateRequirementDto): Promise<Requirement> {
    const { ownerId, ...rest } = dto;
    const req = this.repo.create({
      ...rest,
      startDate: normalizeDateOnly(dto.startDate),
      endDate: normalizeDateOnly(dto.endDate),
      ...(ownerId && { owner: { id: ownerId } as User }),
      dependencies: dto.dependencies || [],
      tags: dto.tags || [],
      approvalRequired: dto.approvalRequired ?? false,
    });
    const saved = await this.repo.save(req);
    return this.repo.findOneOrFail({
      where: { id: saved.id },
      relations: [
        'owner',
        'tasks',
        'tasks.subtasks',
        'tasks.comments',
        'tasks.comments.author',
        'tasks.attachments',
        'tasks.activities',
        'tasks.assignee',
        'comments',
        'comments.author',
        'approvalRequests'
      ]
    });
  }

  findAll(): Promise<Requirement[]> {
    return this.repo.find({
      relations: [
        'owner',
        'tasks',
        'tasks.subtasks',
        'tasks.comments',
        'tasks.comments.author',
        'tasks.attachments',
        'tasks.activities',
        'tasks.assignee',
        'comments',
        'comments.author',
        'approvalRequests'
      ]
    });
  }

  async findOne(id: string): Promise<Requirement> {
    const req = await this.repo.findOne({ 
      where: { id }, 
      relations: [
        'owner',
        'tasks',
        'tasks.subtasks',
        'tasks.comments',
        'tasks.comments.author',
        'tasks.attachments',
        'tasks.activities',
        'tasks.assignee',
        'comments',
        'comments.author',
        'approvalRequests'
      ]
    });
    if (!req) throw new NotFoundException(`Requirement ${id} not found`);
    return req;
  }

  async update(id: string, dto: UpdateRequirementDto): Promise<Requirement> {
    const req = await this.findOne(id);
    const patch: any = { ...dto };
    if (dto.startDate) patch.startDate = normalizeDateOnly(dto.startDate);
    if (dto.endDate) patch.endDate = normalizeDateOnly(dto.endDate);
    Object.assign(req, patch);
    // se vier ownerId em dto, atualiza a relação
    if ((dto as any).ownerId) {
      req.owner = { id: (dto as any).ownerId } as User;
    }
    return this.repo.save(req);
  }

  async remove(id: string): Promise<void> {
    const requirement = await this.findOne(id);
    await this.repo.remove(requirement);
  }
}
