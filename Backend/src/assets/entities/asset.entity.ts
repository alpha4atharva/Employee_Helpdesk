import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('asset')
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  serial_number: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'AVAILABLE' })
  status: string;

  @Column({ nullable: true })
  assigned_to: number;

  /** Eager relation to the User this asset is assigned to */
  @ManyToOne(() => User, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_to' })
  assignedUser: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}