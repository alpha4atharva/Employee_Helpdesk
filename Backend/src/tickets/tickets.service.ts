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
  ) {}

  // 🔥 Employee creates ticket
  async createTicket(dto, user) {

    // 1️⃣ find free IT agent
    const freeAgent = await this.userRepo.findOne({
      where: {
        role: Role.IT_AGENT,
        isAvailable: true,
      },
    });

    if (!freeAgent) {
      throw new NotFoundException('No IT Agent available');
    }

    // 2️⃣ set agent unavailable
    freeAgent.isAvailable = false;
    await this.userRepo.save(freeAgent);

    // 3️⃣ create ticket
    const ticket = this.ticketRepo.create({
      ...dto,
      createdBy: user,
      assignedTo: freeAgent,
      status: TicketStatus.IN_PROGRESS,
      slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours SLA
    });

    return this.ticketRepo.save(ticket);
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

    ticket.status = status;

    // If resolved → free agent
    if (status === TicketStatus.RESOLVED) {
      ticket.assignedTo.isAvailable = true;
      await this.userRepo.save(ticket.assignedTo);
    }

    return this.ticketRepo.save(ticket);
  }
}