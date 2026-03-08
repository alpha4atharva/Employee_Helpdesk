import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Patch,
  Param,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { TicketStatus } from '../common/enums/ticket-status.enum';
import { ParseIntPipe } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.entity';
@Controller('tickets')
export class TicketsController {

  constructor(private readonly ticketsService: TicketsService) {}

  // Employee create
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYEE)
  @Post()
  create( @Body() dto: CreateTicketDto, @Request() req, ){
    console.log("Controller hit");
    return this.ticketsService.createTicket(dto, req.user);
  }

  // Agent update status
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.IT_AGENT)
  @Patch(':id/status')
  updateStatus(
    @Param('id',ParseIntPipe) id: number,
    @Body('status') status: TicketStatus,
    @Request() req,
  ) {
    return this.ticketsService.updateStatus(+id, status, req.user);
  }
}