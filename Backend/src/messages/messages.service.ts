import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Message } from './entities/message.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MessagesService {

  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,

    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
  ) {}

  async sendMessage(ticketId: number, content: string, user: User) {

    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: ['createdBy', 'assignedTo'],
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    // Only employee or assigned agent can chat
    if (
      ticket.createdBy.id !== user.id &&
      ticket.assignedTo?.id !== user.id
    ) {
      throw new ForbiddenException('Not allowed to chat on this ticket');
    }

    const message = this.messageRepo.create({
      content,
      sender: user,
      ticket,
    });

    return this.messageRepo.save(message);
  }

  async getMessages(ticketId: number, user: User) {
  const ticket = await this.ticketRepo.findOne({
    where: { id: ticketId },
    relations: ['createdBy', 'assignedTo'],
  });

  if (!ticket) throw new NotFoundException();

  if (
    ticket.createdBy.id !== user.id &&
    ticket.assignedTo?.id !== user.id
  ) {
    throw new ForbiddenException();
  }

  return this.messageRepo.find({
    where: { ticket: { id: ticketId } },
    order: { createdAt: 'ASC' },
  });
}
}