import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities';
import { Milestone } from '../../milestones/entities';
import { RequirementComment, ApprovalRequest } from '.';

@Entity('requirements')
export class Requirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  color: string;

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

  @OneToMany(() => Task, task => task.requirement, { cascade: ['remove'], onDelete: 'CASCADE' })
  tasks: Task[];

  @OneToMany(() => Milestone, milestone => milestone.requirement, { cascade: ['remove'], onDelete: 'CASCADE' })
  milestones: Milestone[];

  @OneToMany(() => RequirementComment, comment => comment.requirement, { cascade: ['remove'], onDelete: 'CASCADE' })
  comments: RequirementComment[];

  @Column('simple-array')
  dependencies: string[]; // IDs of requirements this depends on

  @Column({ nullable: true })
  category?: string;

  @Column('simple-array')
  tags: string[];

  @Column({ default: false })
  approvalRequired: boolean;

  @OneToMany(() => ApprovalRequest, approvalRequest => approvalRequest.requirement, { cascade: ['remove'], onDelete: 'CASCADE' })
  approvalRequests: ApprovalRequest[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 