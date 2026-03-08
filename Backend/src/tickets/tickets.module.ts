import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { User } from '../users/entities/user.entity';
import { SlaCronService } from './sla.cron';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, User])],
  providers: [TicketsService, SlaCronService],
  controllers: [TicketsController],
})
export class TicketsModule {}