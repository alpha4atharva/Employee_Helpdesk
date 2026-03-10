import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Patch,
  Param,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { TicketStatus } from '../common/enums/ticket-status.enum';
import { CreateTicketDto } from './dto/create-ticket.entity';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {

  constructor(private readonly ticketsService: TicketsService) {}

  // Employee creates a ticket
  @UseGuards(RolesGuard)
  @Roles(Role.EMPLOYEE)
  @Post()
  create(@Body() dto: CreateTicketDto, @Request() req) {
    return this.ticketsService.createTicket(dto, req.user);
  }

  // All authenticated users can list tickets
  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  // Employee gets their own tickets
  @UseGuards(RolesGuard)
  @Roles(Role.EMPLOYEE)
  @Get('my-tickets/list')
  findByEmployee(@Request() req) {
    return this.ticketsService.findByEmployee(req.user.userId);
  }

  // Single ticket by ID
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.findById(id);
  }

  // Agent updates ticket status
  @UseGuards(RolesGuard)
  @Roles(Role.IT_AGENT)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: TicketStatus,
    @Request() req,
  ) {
    return this.ticketsService.updateStatus(id, status, req.user);
  }

  // IT Agent assigns an asset to a ticket
  @UseGuards(RolesGuard)
  @Roles(Role.IT_AGENT)
  @Patch(':id/assign-asset')
  assignAsset(
    @Param('id', ParseIntPipe) id: number,
    @Body('assetId', ParseIntPipe) assetId: number,
    @Request() req,
  ) {
    return this.ticketsService.assignAssetToTicket(id, assetId, req.user.userId);
  }
}