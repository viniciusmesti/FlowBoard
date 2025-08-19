import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['created', 'updated', 'moved', 'commented', 'assigned']
  })
  type: 'created' | 'updated' | 'moved' | 'commented' | 'assigned';

  @Column('text')
  description: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Task, task => task.activities, { onDelete: 'CASCADE' })
  task: Task;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;
} 