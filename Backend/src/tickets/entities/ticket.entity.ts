import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketPriority } from '../../common/enums/ticket-priority.enum';
import { Message } from 'src/messages/entities/message.entity';
import { Asset } from 'src/assets/entities/asset.entity';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @Column({ nullable: true })
  assetType: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  @ManyToOne(() => User, (user) => user.createdTickets, { eager: true, nullable: true, onDelete: 'SET NULL' })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.assignedTickets, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  assignedTo: User;

  @Column({ type: 'timestamp', nullable: true })
  slaDeadline: Date;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Message, (message) => message.ticket)
  messages: Message[];

  @ManyToOne(() => Asset, { nullable: true, eager: true, onDelete: 'SET NULL' })
  asset: Asset;
}