import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';


// Represents "message" table in the database
@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @ManyToOne(() => User, (user) => user.messages, { eager: true, nullable: true, onDelete: 'SET NULL' })
  sender: User;

  @ManyToOne(() => Ticket, (ticket) => ticket.messages, {
    onDelete: 'CASCADE',
  })
  ticket: Ticket;


    // Automatically store the time message was created
  @CreateDateColumn()
  createdAt: Date;
}