import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from './task.entity';

@Entity('subtasks')
export class SubTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: false })
  completed: boolean;

  @ManyToOne(() => User, { nullable: true })
  assignee?: User;

  @ManyToOne(() => Task, task => task.subtasks, { onDelete: 'CASCADE' })
  task: Task;
} 