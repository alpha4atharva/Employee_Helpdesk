import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { OneToMany } from 'typeorm';
import { Message } from '../../messages/entities/message.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity({ name: 'user' })
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

 @Column({ })
  password: string;
  
  @Column({
    enum: Role,
    default: Role.EMPLOYEE,
  })
  role: Role;

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToMany(() => Ticket, (ticket) => ticket.createdBy)
  createdTickets: Ticket[];

  @OneToMany(() => Ticket, (ticket) => ticket.assignedTo)
  assignedTickets: Ticket[];
  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: 0 })
  activeTicketsCount: number;
}