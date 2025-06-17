import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Attachment } from '../../attachments/entities/attachment.entity';
import { Activity } from '../../activities/entities/activity.entity';
import { SubTask } from './subtask.entity';
import { Requirement } from '../../requirements/entities/requirement.entity';
import { Template } from '../../templates/entities/template.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ['planning', 'pending-approval', 'active', 'completed', 'on-hold', 'cancelled'],
    default: 'planning'
  })
  status: 'planning' | 'pending-approval' | 'active' | 'completed' | 'on-hold' | 'cancelled';

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  })
  priority: 'low' | 'medium' | 'high';

  @ManyToOne(() => User)
  @JoinColumn()
  owner: User;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'float', nullable: true })
  estimatedHours?: number;

  @Column({ type: 'float', nullable: true })
  budget?: number;

  @Column({ type: 'float', default: 0 })
  progress: number;

  @ManyToOne(() => Requirement, requirement => requirement.tasks)
  @JoinColumn({ name: 'requirementId' })
  requirement: Requirement;

  @Column({ nullable: true })
  requirementId: string;

  @ManyToOne(() => Template, template => template.defaultTasks)
  template: Template;

  @OneToMany(() => SubTask, subtask => subtask.task)
  subtasks: SubTask[];

  @Column('simple-array')
  dependencies: string[]; // IDs of tasks this depends on

  @Column({ nullable: true })
  category?: string;

  @Column('simple-array')
  tags: string[];

  @OneToMany(() => Comment, comment => comment.task)
  comments: Comment[];

  @OneToMany(() => Attachment, attachment => attachment.task)
  attachments: Attachment[];

  @OneToMany(() => Activity, activity => activity.task)
  activities: Activity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 