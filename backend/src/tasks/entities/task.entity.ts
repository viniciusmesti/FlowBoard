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
    enum: ['backlog', 'todo', 'progress', 'review', 'done'],
    default: 'backlog'
  })
  status: 'backlog' | 'todo' | 'progress' | 'review' | 'done';

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  })
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @ManyToOne(() => User)
  @JoinColumn()
  owner: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  assignee?: User;

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

  @ManyToOne(() => Requirement, requirement => requirement.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requirementId' })
  requirement: Requirement;

  @Column({ nullable: true })
  requirementId: string;

  @ManyToOne(() => Template, template => template.defaultTasks)
  template: Template;

  @OneToMany(() => SubTask, subtask => subtask.task, { onDelete: 'CASCADE' })
  subtasks: SubTask[];

  @Column('simple-array')
  dependencies: string[]; // IDs of tasks this depends on

  @Column({ nullable: true })
  category?: string;

  @Column('simple-array', { default: '' })
  tags: string[];  

  @OneToMany(() => Comment, comment => comment.task, { onDelete: 'CASCADE' })
  comments: Comment[];

  @OneToMany(() => Attachment, attachment => attachment.task, { onDelete: 'CASCADE' })
  attachments: Attachment[];

  @OneToMany(() => Activity, activity => activity.task, { onDelete: 'CASCADE' })
  activities: Activity[];

  @Column({ type: 'float', nullable: true })
  actualHours?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 