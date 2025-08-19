export type NotificationType = 'overdue' | 'due-soon' | 'approval' | 'completed' | 'urgent';

export interface NotificationItemDto {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  requirementId: string;
  taskId?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;   // virá como ISO string
}