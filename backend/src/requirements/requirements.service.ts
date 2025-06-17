import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository }           from '@nestjs/typeorm';
import { Repository }                from 'typeorm';

import { Requirement }               from './entities/requirement.entity';
import { CreateRequirementDto }      from './dto/create-requirement.dto';
import { UpdateRequirementDto }      from './dto/update-requirement.dto';
import { User }                      from '../users/entities/user.entity';

@Injectable()
export class RequirementsService {
  constructor(
    @InjectRepository(Requirement)
    private readonly repo: Repository<Requirement>,
  ) {}

  async create(dto: CreateRequirementDto): Promise<Requirement> {
    const req = this.repo.create({
      title: dto.title,
      description: dto.description,
      color: dto.color,
      status: dto.status,
      priority: dto.priority,
      // relaciona apenas por id, o TypeORM resolve
      owner: { id: dto.ownerId } as User,
      startDate: dto.startDate,
      endDate: dto.endDate,
      estimatedHours: dto.estimatedHours,
      budget: dto.budget,
      dependencies: dto.dependencies || [],
      category: dto.category,
      tags: dto.tags || [],
      approvalRequired: dto.approvalRequired ?? false,
    });
    return this.repo.save(req);
  }

  findAll(): Promise<Requirement[]> {
    return this.repo.find({ relations: ['owner', 'tasks', 'comments', 'approvalRequests'] });
  }

  async findOne(id: string): Promise<Requirement> {
    const req = await this.repo.findOne({ 
      where: { id }, 
      relations: ['owner', 'tasks', 'comments', 'approvalRequests']
    });
    if (!req) throw new NotFoundException(`Requirement ${id} not found`);
    return req;
  }

  async update(id: string, dto: UpdateRequirementDto): Promise<Requirement> {
    const req = await this.findOne(id);
    Object.assign(req, dto);
    // se vier ownerId em dto, atualiza a relação
    if ((dto as any).ownerId) {
      req.owner = { id: (dto as any).ownerId } as User;
    }
    return this.repo.save(req);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
