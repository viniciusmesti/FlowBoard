import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Requirement } from '../../requirements/entities/requirement.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed'],
    default: 'pending'
  })
  status: 'pending' | 'completed';

  @ManyToOne(() => Requirement, requirement => requirement.milestones)
  requirement: Requirement;

  @ManyToMany(() => Task)
  @JoinTable()
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 