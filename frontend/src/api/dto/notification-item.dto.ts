export type NotificationType = 'overdue' | 'due-soon' | 'approval' | 'completed';

export interface NotificationItemDto {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  requirementId: string;
  taskId?: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;   // virá como ISO string
}