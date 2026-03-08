import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketStatus } from '../common/enums/ticket-status.enum';

@Injectable()
export class SlaCronService {

  constructor(
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
  ) {}

  // Runs every 1 minute
  @Cron('0 * * * * *') // every minute
  async handleSlaBreach() {

    const now = new Date();

    const breachedTickets = await this.ticketRepo.find({
      where: {
        slaDeadline: LessThan(now),
        status: TicketStatus.IN_PROGRESS,
      },
    });

    for (const ticket of breachedTickets) {
      ticket.status = TicketStatus.SLA_BREACHED;
      await this.ticketRepo.save(ticket);
    }

    console.log('SLA Check Completed');
  }
}