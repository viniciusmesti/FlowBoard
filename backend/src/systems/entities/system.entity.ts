import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Requirement } from '../../requirements/entities/requirement.entity';

@Entity('systems')
export class System {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column()
  color: string;

  @ManyToOne(() => User)
  @JoinColumn()
  owner: User;

  @Column('simple-array')
  requirementTypes: string[]; // ["CURIA", "MITRA", "NP", "MAPA"]

  @OneToMany(() => Requirement, requirement => requirement.system)
  requirements: Requirement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

