import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Requirement } from '../requirements/entities/requirement.entity';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class SeedDataService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Requirement)
    private readonly requirementRepo: Repository<Requirement>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  async createSampleData() {
    console.log('Creating sample data for notifications...');

    const fixedUserId = '56ee4874-c672-4ffa-a131-ffcd7cd706b9';

    let testUser = await this.userRepo.findOne({ where: { id: fixedUserId } });
    if (!testUser) {
      console.log('Creating test user with fixed ID...');
      const newUser = this.userRepo.create({
        id: fixedUserId,
        name: 'Test User',
        email: 'test@flowboard.com',
        password: 'password123', // Será hasheada automaticamente
        role: 'developer',
        avatar: '/avatars/user.png',
      });
      testUser = await this.userRepo.save(newUser);
      console.log('Test user created with ID:', testUser.id);
    }

    // Criar requirement com aprovação pendente
    const pendingRequirement = await this.requirementRepo.findOne({ 
      where: { title: 'Sistema de Autenticação' } 
    });
    if (!pendingRequirement) {
      const newReq = this.requirementRepo.create({
        title: 'Sistema de Autenticação',
        description: 'Implementar sistema de login e registro',
        color: '#3b82f6',
        status: 'pending-approval',
        priority: 'high',
        owner: testUser,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        tags: ['auth', 'security'],
        approvalRequired: true,
        dependencies: [],
      });
      await this.requirementRepo.save(newReq);
    }

    // Criar requirement ativo com tasks
    const activeRequirement = await this.requirementRepo.findOne({ 
      where: { title: 'Interface do Usuário' } 
    });
    if (!activeRequirement) {
      const newReq = this.requirementRepo.create({
        title: 'Interface do Usuário',
        description: 'Desenvolver interface responsiva',
        color: '#10b981',
        status: 'active',
        priority: 'medium',
        owner: testUser,
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        tags: ['ui', 'frontend'],
        approvalRequired: false,
        dependencies: [],
      });
      const savedReq = await this.requirementRepo.save(newReq);

      const overdueTask = this.taskRepo.create({
        title: 'Configurar CI/CD Pipeline',
        description: 'Implementar pipeline de integração contínua',
        status: 'active',
        priority: 'high',
        owner: testUser,
        requirement: savedReq,
        requirementId: savedReq.id,
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        estimatedHours: 8,
        progress: 60,
        dependencies: [],
      });
      await this.taskRepo.save(overdueTask);

      const dueSoonTask = this.taskRepo.create({
        title: 'Escrever testes unitários',
        description: 'Criar testes para componentes principais',
        status: 'active',
        priority: 'medium',
        owner: testUser,
        requirement: savedReq,
        requirementId: savedReq.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 5 * 60 * 60 * 1000),
        estimatedHours: 4,
        progress: 20,
        dependencies: [],
      });
      await this.taskRepo.save(dueSoonTask);
    }

    // Criar requirement concluído recentemente
    const completedRequirement = await this.requirementRepo.findOne({ 
      where: { title: 'Documentação da API' } 
    });
    if (!completedRequirement) {
      const newReq = this.requirementRepo.create({
        title: 'Documentação da API',
        description: 'Criar documentação completa da API',
        color: '#f59e0b',
        status: 'completed',
        priority: 'medium',
        owner: testUser,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
        tags: ['docs', 'api'],
        approvalRequired: false,
        progress: 100,
        dependencies: [],
      });
      await this.requirementRepo.save(newReq);
    }

    console.log('Sample data creation completed!');
    console.log('Test user ID:', testUser.id);
  }
}
