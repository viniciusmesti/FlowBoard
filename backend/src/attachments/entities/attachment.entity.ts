import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column({
    type: 'enum',
    enum: ['image', 'document', 'link'],
    default: 'document'
  })
  type: 'image' | 'document' | 'link';

  @Column({ type: 'float', nullable: true })
  size?: number;

  @ManyToOne(() => Task, task => task.attachments, { onDelete: 'CASCADE' })
  task: Task;
} 