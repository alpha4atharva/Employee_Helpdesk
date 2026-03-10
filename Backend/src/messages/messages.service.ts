import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Message } from './entities/message.entity';
import { Ticket } from '../tickets/entities/ticket.entity';


// Service handles application logic
@Injectable()
export class MessagesService {

  constructor(
    // Repository gives access to message table
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,


// Repository for ticket table
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,

  async sendMessage(ticketId: number, content: string, user: { userId: number; role: string }) {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: ['createdBy', 'assignedTo'],
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    // Only the ticket creator or assigned agent can chat
    if (
      ticket.createdBy.id !== user.userId &&
      ticket.assignedTo?.id !== user.userId
    ) {
      throw new ForbiddenException('Not allowed to chat on this ticket');
    }
    
    const sender = await this.userRepo.findOne({
      where: { id: user.userId },
    });

    if (!sender) {
      throw new NotFoundException('User not found');
    }

    const message = this.messageRepo.create({
      content,
      sender: { id: user.userId } as any,
      ticket,
    });

    const saved = await this.messageRepo.save(message);

    // Return with sender relation loaded
    return this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['sender'],
    });
  }

  async getMessages(ticketId: number, user: { userId: number; role: string }) {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: ['createdBy', 'assignedTo'],
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    // Only the ticket creator or assigned agent can view messages
    if (
      ticket.createdBy.id !== user.userId &&
      ticket.assignedTo?.id !== user.userId
    ) {
      throw new ForbiddenException('Not allowed to view messages on this ticket');
    }

    return this.messageRepo.find({
      where: { ticket: { id: ticketId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }
}