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

    // Criar usuário de exemplo
    const user = await this.userRepo.findOne({ where: { email: 'test@flowboard.com' } });
    if (!user) {
      console.log('Creating test user...');
      const newUser = this.userRepo.create({
        name: 'Test User',
        email: 'test@flowboard.com',
        password: 'password123', // Será hasheada automaticamente
        role: 'developer',
      });
      await this.userRepo.save(newUser);
      console.log('Test user created with ID:', newUser.id);
    }

    const testUser = await this.userRepo.findOne({ where: { email: 'test@flowboard.com' } });
    if (!testUser) {
      throw new Error('Failed to create or find test user');
    }

    // Criar requirement com aprovação pendente
    const pendingRequirement = await this.requirementRepo.findOne({ 
      where: { title: 'Sistema de Autenticação' } 
    });
    if (!pendingRequirement) {
      console.log('Creating pending approval requirement...');
      const newReq = this.requirementRepo.create({
        title: 'Sistema de Autenticação',
        description: 'Implementar sistema de login e registro',
        color: '#3b82f6',
        status: 'pending-approval',
        priority: 'high',
        owner: testUser,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        tags: ['auth', 'security'],
        approvalRequired: true,
        dependencies: [],
      });
      await this.requirementRepo.save(newReq);
      console.log('Pending requirement created with ID:', newReq.id);
    }

    // Criar requirement ativo com tasks atrasadas
    const activeRequirement = await this.requirementRepo.findOne({ 
      where: { title: 'Interface do Usuário' } 
    });
    if (!activeRequirement) {
      console.log('Creating active requirement with overdue tasks...');
      const newReq = this.requirementRepo.create({
        title: 'Interface do Usuário',
        description: 'Desenvolver interface responsiva',
        color: '#10b981',
        status: 'active',
        priority: 'medium',
        owner: testUser,
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 dias
        tags: ['ui', 'frontend'],
        approvalRequired: false,
        dependencies: [],
      });
      const savedReq = await this.requirementRepo.save(newReq);

      // Criar task atrasada
      const overdueTask = this.taskRepo.create({
        title: 'Configurar CI/CD Pipeline',
        description: 'Implementar pipeline de integração contínua',
        status: 'active',
        priority: 'high',
        owner: testUser,
        requirement: savedReq,
        requirementId: savedReq.id,
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
        endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás (atrasada)
        estimatedHours: 8,
        progress: 60,
        dependencies: [],
      });
      await this.taskRepo.save(overdueTask);

      // Criar task com prazo próximo
      const dueSoonTask = this.taskRepo.create({
        title: 'Escrever testes unitários',
        description: 'Criar testes para componentes principais',
        status: 'active',
        priority: 'medium',
        owner: testUser,
        requirement: savedReq,
        requirementId: savedReq.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 horas (próximo)
        estimatedHours: 4,
        progress: 20,
        dependencies: [],
      });
      await this.taskRepo.save(dueSoonTask);

      console.log('Active requirement with tasks created');
    }

    // Criar requirement concluído recentemente
    const completedRequirement = await this.requirementRepo.findOne({ 
      where: { title: 'Documentação da API' } 
    });
    if (!completedRequirement) {
      console.log('Creating recently completed requirement...');
      const newReq = this.requirementRepo.create({
        title: 'Documentação da API',
        description: 'Criar documentação completa da API',
        color: '#f59e0b',
        status: 'completed',
        priority: 'medium',
        owner: testUser,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
        endDate: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás (recentemente concluído)
        tags: ['docs', 'api'],
        approvalRequired: false,
        progress: 100,
        dependencies: [],
      });
      await this.requirementRepo.save(newReq);
      console.log('Completed requirement created');
    }

    console.log('Sample data creation completed!');
    console.log('Test user ID:', testUser.id);
    console.log('You can now test notifications with this user ID');
  }
} 