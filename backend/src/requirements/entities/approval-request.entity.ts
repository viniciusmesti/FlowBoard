import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Requirement } from './requirement.entity';

@Entity('approval_requests')
export class ApprovalRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Requirement, requirement => requirement.approvalRequests)
  requirement: Requirement;

  @ManyToOne(() => User)
  requestedBy: User;

  @ManyToMany(() => User)
  @JoinTable()
  approvers: User[];

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  })
  status: 'pending' | 'approved' | 'rejected';

  @Column({ nullable: true })
  reason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  resolvedBy?: User;
} 