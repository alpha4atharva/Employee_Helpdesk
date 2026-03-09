import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { User } from '../users/entities/user.entity';
import { TicketStatus } from '../common/enums/ticket-status.enum';
import { Role } from '../common/enums/role.enum';
import { ForbiddenException } from '@nestjs/common';
@Injectable()
export class TicketsService {

  constructor(
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) { }

  async createTicket(dto, user) {
    console.log("FULL USER OBJECT:", user);
    const freeAgent = await this.userRepo.findOne({
      where: {
        role: Role.IT_AGENT,
        isAvailable: true,
      },
    });

    console.log("FOUND AGENT:", freeAgent);

    if (!freeAgent) {
      throw new NotFoundException('No IT Agent available');
    }

    console.log("STEP 1 OK");

    freeAgent.isAvailable = false;

    console.log("STEP 2 BEFORE SAVE");

    await this.userRepo.save(freeAgent);

    console.log("STEP 2 AFTER SAVE");
    console.log("User ID:", user.userId);
    console.log("Agent ID:", freeAgent.id);

    const ticket = this.ticketRepo.create({
      ...dto,
      createdBy: { id: user.userId },
      assignedTo: { id: freeAgent.id },
      status: TicketStatus.IN_PROGRESS,
      slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
    });

    console.log("STEP 3 BEFORE SAVE");

    const savedTicket = await this.ticketRepo.save(ticket);

    console.log("STEP 3 AFTER SAVE");

    return savedTicket;
  }

  // 🔥 Agent updates status
  async updateStatus(ticketId: number, status: TicketStatus, user: User) {

    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: ['assignedTo'],
    });
    

    if (!ticket) throw new NotFoundException('Ticket not found');

    if (!ticket.assignedTo || ticket.assignedTo.id !== user.id) {
      throw new ForbiddenException('Not authorized');
    }

    if (ticket.status === status) {
      console.log("Status already same. No update needed.");
      return ticket;
    }

    ticket.status = status;

    if (status === TicketStatus.RESOLVED) {
      ticket.assignedTo.isAvailable = true;
      await this.userRepo.save(ticket.assignedTo);
    }

    return this.ticketRepo.save(ticket);
  }
}