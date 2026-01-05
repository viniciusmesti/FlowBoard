import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { System } from './entities/system.entity';
import { CreateSystemDto } from './dto/create-system.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SystemsService {
  constructor(
    @InjectRepository(System)
    private readonly repo: Repository<System>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateSystemDto): Promise<System> {
    try {
      const { ownerId, ...rest } = dto;

      if (!ownerId) {
        throw new BadRequestException('ownerId é obrigatório para criar um sistema');
      }

      const owner = await this.userRepo.findOne({ where: { id: ownerId } });
      if (!owner) {
        throw new NotFoundException(`Usuário com ID ${ownerId} não encontrado`);
      }

      const system = this.repo.create({
        ...rest,
        owner,
        requirementTypes: dto.requirementTypes || [],
      });

      const saved = await this.repo.save(system);

      return this.repo.findOneOrFail({
        where: { id: saved.id },
        relations: ['owner', 'requirements'],
      });
    } catch (error) {
      console.error('❌ Erro ao criar sistema:', error);
      throw error;
    }
  }

  findAll(): Promise<System[]> {
    return this.repo.find({
      relations: ['owner', 'requirements'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<System> {
    const system = await this.repo.findOne({
      where: { id },
      relations: ['owner', 'requirements'],
    });
    if (!system) throw new NotFoundException(`System ${id} not found`);
    return system;
  }

  async update(id: string, dto: UpdateSystemDto): Promise<System> {
    const system = await this.findOne(id);
    const patch: any = { ...dto };

    if ((dto as any).ownerId) {
      const owner = await this.userRepo.findOne({ where: { id: (dto as any).ownerId } });
      if (!owner) {
        throw new NotFoundException(`Usuário com ID ${(dto as any).ownerId} não encontrado`);
      }
      system.owner = owner;
    }

    Object.assign(system, patch);
    return this.repo.save(system);
  }

  async remove(id: string): Promise<void> {
    const system = await this.findOne(id);
    
    // Verificar se há requisitos associados
    if (system.requirements && system.requirements.length > 0) {
      throw new BadRequestException('Não é possível deletar um sistema que possui requisitos associados');
    }

    await this.repo.remove(system);
  }
}

