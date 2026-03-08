import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { OneToMany } from 'typeorm';
import { Message } from 'src/messages/entities/message.entity';
@Entity()
export class Ticket {
  @OneToMany(() => Message, (message) => message.ticket)
messages: Message[];

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  @ManyToOne(() => User, (user) => user.createdTickets, { eager: true })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.assignedTickets, {
  nullable: true,
  eager: true,
   })
    assignedTo: User;

  @Column({ type: 'timestamp', nullable: true })
  slaDeadline: Date;

  @CreateDateColumn()
  createdAt: Date;
}