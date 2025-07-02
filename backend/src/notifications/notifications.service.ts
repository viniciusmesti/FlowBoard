import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Requirement } from '../requirements/entities/requirement.entity';
import { Task } from '../tasks/entities/task.entity';
import { NotificationItemDto } from './dto/notification-item.dto';
import { LessThan, Not } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Requirement)
    private readonly requirementsRepo: Repository<Requirement>,
    @InjectRepository(Task)
    private readonly tasksRepo: Repository<Task>,
  ) {}

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private getMockNotifications(): NotificationItemDto[] {
    const now = new Date();
    return [
      {
        id: 'demo-overdue-1',
        type: 'overdue',
        title: 'Task Atrasada',
        description: '"Configurar CI/CD Pipeline" está 2 dias atrasada',
        requirementId: 'demo-req-1',
        taskId: 'demo-task-1',
        priority: 'high',
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'demo-approval-1',
        type: 'approval',
        title: 'Aprovação Pendente',
        description: 'Requisito "Sistema de Autenticação" aguarda aprovação',
        requirementId: 'demo-req-2',
        priority: 'high',
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'demo-due-soon-1',
        type: 'due-soon',
        title: 'Prazo Próximo',
        description: '"Escrever testes unitários" vence em 5h',
        requirementId: 'demo-req-3',
        taskId: 'demo-task-2',
        priority: 'medium',
        timestamp: new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'demo-completed-1',
        type: 'completed',
        title: 'Requisito Concluído',
        description: '"Interface do usuário" foi finalizado com sucesso',
        requirementId: 'demo-req-4',
        priority: 'medium',
        timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'demo-overdue-2',
        type: 'overdue',
        title: 'Task Atrasada',
        description: '"Documentação da API" está 1 dia atrasada',
        requirementId: 'demo-req-5',
        taskId: 'demo-task-3',
        priority: 'high',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }

  async getNotifications(userId?: string): Promise<NotificationItemDto[]> {
    console.log(`[NotificationsService] getNotifications chamado para userId:`, userId);
    if (!userId || userId === 'demo' || userId === 'guest') {
      return this.getMockNotifications();
    }

    if (!this.isValidUUID(userId)) {
      console.warn(`Invalid UUID provided: ${userId}, returning mock notifications`);
      return this.getMockNotifications();
    }

    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 1) DEBUG: troque o find por um QueryBuilder e logue o resultado
    const userTasks = await this.tasksRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.requirement', 'requirement')
      .leftJoinAndSelect('task.owner', 'owner')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .where('owner.id = :userId', { userId })
      .orWhere('assignee.id = :userId', { userId })
      .getMany();

    console.log(`🔎 [NotificationsService] userTasks encontrados para ${userId}:`, userTasks.map(t => ({
      id: t.id,
      endDate: t.endDate,
      status: t.status,
      owner: t.owner?.id,
      assignee: t.assignee?.id
    })));

      const items: NotificationItemDto[] = [];

      // Notificações de tasks (atrasadas e prazo próximo)
      for (const task of userTasks) {
        const dueDate = task.endDate ? new Date(task.endDate) : null;
        if (!dueDate) continue;

        // Task atrasada
        if (dueDate < now && task.status !== 'done') {
          const daysLate = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          items.push({
            id: `overdue-${task.id}`,
            type: 'overdue',
            title: 'Task Atrasada',
            description: `"${task.title}" está ${daysLate} dia(s) atrasada`,
            requirementId: task.requirement?.id || 'independent',
            taskId: task.id,
            priority: task.priority,
            timestamp: dueDate.toISOString(),
          });
        }
        // Task com prazo próximo
        else if (dueDate <= tomorrow && dueDate >= now && task.status !== 'done') {
          const hoursLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
          items.push({
            id: `due-soon-${task.id}`,
            type: 'due-soon',
            title: 'Prazo Próximo',
            description: `"${task.title}" vence em ${hoursLeft}h`,
            requirementId: task.requirement?.id || 'independent',
            taskId: task.id,
            priority: task.priority,
            timestamp: dueDate.toISOString(),
          });
        }
      }

      // Notificações de requirements (apenas se o usuário for owner)
      const requirements = await this.requirementsRepo.find({
        where: { owner: { id: userId } },
        relations: ['tasks', 'owner'],
      });

      for (const req of requirements) {
        // Aprovação pendente
        if (req.status === 'pending-approval') {
          items.push({
            id: `approval-${req.id}`,
            type: 'approval',
            title: 'Aprovação Pendente',
            description: `${req.title} aguarda aprovação para iniciar`,
            requirementId: req.id,
            priority: 'high',
            timestamp: req.updatedAt.toISOString(),
          });
        }

        // Requisito concluído nas últimas 24h
        if (
          req.status === 'completed' &&
          req.updatedAt >= new Date(now.getTime() - 24 * 60 * 60 * 1000)
        ) {
          items.push({
            id: `completed-${req.id}`,
            type: 'completed',
            title: 'Requisito Concluído',
            description: `${req.title} foi finalizado com sucesso`,
            requirementId: req.id,
            priority: 'medium',
            timestamp: req.updatedAt.toISOString(),
          });
        }
      }

      // Ordena por timestamp (mais recentes primeiro)
      return items.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return this.getMockNotifications();
    }
  }

  async getNotificationsForUser(userId: string) {
    const now = new Date();
    const tasks = await this.tasksRepo.find({
      where: [
        { owner: { id: userId }, endDate: LessThan(now), status: Not('done') },
        { assignee: { id: userId }, endDate: LessThan(now), status: Not('done') },
      ],
      relations: ['requirement', 'owner', 'assignee'],
    });

    // Gera uma notificação para cada task atrasada
    const notifications = tasks.map(task => ({
      id: task.id,
      type: 'overdue',
      title: 'Task Atrasada',
      description: `"${task.title}" está atrasada!`,
      requirementId: task.requirement?.id,
      priority: task.priority,
      timestamp: task.endDate,
    }));

    return notifications;
  }
}
