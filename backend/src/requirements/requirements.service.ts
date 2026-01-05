import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateRequirementDto): Promise<Requirement> {
    try {
      console.log('📝 RequirementsService.create - Dados recebidos:', {
        title: dto.title,
        description: dto.description,
        color: dto.color,
        status: dto.status,
        priority: dto.priority,
        ownerId: dto.ownerId,
      });

      const { ownerId, ...rest } = dto;
      
      // Validar que ownerId foi fornecido
      if (!ownerId) {
        throw new BadRequestException('ownerId é obrigatório para criar um requisito');
      }

      // Verificar se o ownerId existe
      console.log('🔍 Verificando se usuário existe:', ownerId);
      const owner = await this.userRepo.findOne({ where: { id: ownerId } });
      if (!owner) {
        console.error('❌ Usuário não encontrado:', ownerId);
        throw new NotFoundException(`Usuário com ID ${ownerId} não encontrado`);
      }
      console.log('✅ Usuário encontrado:', owner.email);

      const req = this.repo.create({
        ...rest,
        startDate: normalizeDateOnly(dto.startDate),
        endDate: normalizeDateOnly(dto.endDate),
        owner,
        dependencies: dto.dependencies || [],
        tags: dto.tags || [],
        approvalRequired: dto.approvalRequired ?? false,
        progress: 0, // Garantir que progress sempre tenha valor
        systemId: dto.systemId,
        requirementType: dto.requirementType,
      });

      console.log('💾 Salvando requisito no banco...');
      const saved = await this.repo.save(req);
      console.log('✅ Requisito salvo com ID:', saved.id);

      console.log('🔍 Buscando requisito com relações...');
      const result = await this.repo.findOneOrFail({
        where: { id: saved.id },
        relations: [
          'owner',
          'system',
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
      console.log('✅ Requisito encontrado com sucesso');
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar requisito:', error);
      console.error('❌ Stack trace:', error.stack);
      
      // Log detalhado do erro do banco
      if (error.code) {
        console.error('❌ Código do erro:', error.code);
      }
      if (error.detail) {
        console.error('❌ Detalhes do erro:', error.detail);
      }
      if (error.message) {
        console.error('❌ Mensagem do erro:', error.message);
      }
      if (error.table) {
        console.error('❌ Tabela relacionada:', error.table);
      }

      // Re-lançar o erro para que o NestJS possa tratá-lo
      throw error;
    }
  }

  findAll(): Promise<Requirement[]> {
    return this.repo.find({
      relations: [
        'owner',
        'system',
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
        'system',
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
    console.log('🔄 [RequirementsService] Atualizando requisito:', id, dto);
    const req = await this.findOne(id);
    const patch: any = { ...dto };
    if (dto.startDate) patch.startDate = normalizeDateOnly(dto.startDate);
    if (dto.endDate) patch.endDate = normalizeDateOnly(dto.endDate);
    Object.assign(req, patch);
    // se vier ownerId em dto, atualiza a relação
    if ((dto as any).ownerId) {
      req.owner = { id: (dto as any).ownerId } as User;
    }
    console.log('💾 [RequirementsService] Salvando requisito com status:', req.status);
    const saved = await this.repo.save(req);
    console.log('✅ [RequirementsService] Requisito salvo com sucesso:', saved.id, saved.status);
    
    // Buscar novamente com todas as relações
    return this.repo.findOneOrFail({
      where: { id: saved.id },
      relations: [
        'owner',
        'system',
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

  async remove(id: string): Promise<void> {
    const requirement = await this.findOne(id);
    await this.repo.remove(requirement);
  }
}
