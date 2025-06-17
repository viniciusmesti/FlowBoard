import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Requirement } from '../requirements/entities/requirement.entity';
import { Task } from '../tasks/entities/task.entity';
import { NotificationItemDto } from './dto/notification-item.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Requirement)
    private readonly requirementsRepo: Repository<Requirement>,
    @InjectRepository(Task)
    private readonly tasksRepo: Repository<Task>,
  ) {}

  async getNotifications(userId: string): Promise<NotificationItemDto[]> {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // fetch requirements belonging to user, including tasks
    const requirements = await this.requirementsRepo.find({
      where: { owner: { id: userId } },
      relations: ['tasks'],
    });

    const items: NotificationItemDto[] = [];

    for (const req of requirements) {
      // approval
      if (req.status === 'pending-approval') {
        items.push({
          id: `approval-${req.id}`,
          type: 'approval',
          title: 'Aprovação Pendente',
          description: `${req.title} aguarda aprovação para iniciar`,
          requirementId: req.id,
          priority: 'high',
          timestamp: req.updatedAt,
        });
      }

      // requirement completed in last 24h
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
          timestamp: req.updatedAt,
        });
      }

      // tasks
      for (const task of req.tasks) {
        const dueDate = task.endDate;
        if (!dueDate) continue;

        // overdue
        if (dueDate < now && task.status !== 'completed') {
          const daysLate = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          items.push({
            id: `overdue-${task.id}`,
            type: 'overdue',
            title: 'Task Atrasada',
            description: `"${task.title}" está ${daysLate} dia(s) atrasada`,
            requirementId: req.id,
            taskId: task.id,
            priority: 'high',
            timestamp: dueDate,
          });
        }
        // due soon
        else if (dueDate <= tomorrow && dueDate >= now && task.status !== 'completed') {
          const hoursLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
          items.push({
            id: `due-soon-${task.id}`,
            type: 'due-soon',
            title: 'Prazo Próximo',
            description: `"${task.title}" vence em ${hoursLeft}h`,
            requirementId: req.id,
            taskId: task.id,
            priority: 'medium',
            timestamp: dueDate,
          });
        }
      }
    }

    // sort desc by timestamp
    return items.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }
}
