import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'developer', 'designer', 'tester'],
    default: 'developer'
  })
  role: 'admin' | 'developer' | 'designer' | 'tester';

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Este hook roda **antes** de INSERT no banco
  @BeforeInsert()
  @BeforeUpdate()  // opcional, se você permitir update de senha
  async hashPassword() {
    // só re-hash se a senha foi alterada (útil no BeforeUpdate)
    if (!this.password) return;
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
}
