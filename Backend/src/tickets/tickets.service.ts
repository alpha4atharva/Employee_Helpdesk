import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { User } from '../users/entities/user.entity';
import { Asset } from '../assets/entities/asset.entity';
import { TicketStatus } from '../common/enums/ticket-status.enum';
import { TicketPriority } from '../common/enums/ticket-priority.enum';
import { Role } from '../common/enums/role.enum';
import { CreateTicketDto } from './dto/create-ticket.entity';

@Injectable()
export class TicketsService {

  constructor(
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Asset)
    private assetRepo: Repository<Asset>,
  ) { }

  async createTicket(dto: CreateTicketDto, user: { userId: number; role: string }) {
    const freeAgent = await this.userRepo.findOne({
      where: {
        role: Role.IT_AGENT,
        isAvailable: true,
      },
    });

    const ticketData: Partial<Ticket> = {
      title: dto.title,
      description: dto.description,
      priority: dto.priority || TicketPriority.MEDIUM,
      assetType: dto.assetType || undefined,
      createdBy: { id: user.userId } as User,
    };

    if (freeAgent) {
      ticketData.assignedTo = { id: freeAgent.id } as User;
      ticketData.status = TicketStatus.IN_PROGRESS;
      ticketData.slaDeadline = new Date(Date.now() + 4 * 60 * 60 * 1000);
      await this.userRepo.save(freeAgent);
    } else {
      ticketData.status = TicketStatus.OPEN;
    }

    const ticket = this.ticketRepo.create(ticketData);
    const savedTicket = await this.ticketRepo.save(ticket);

    return this.ticketRepo.findOne({
      where: { id: savedTicket.id },
      relations: ['createdBy', 'assignedTo', 'asset'],
    });
  }

  async findAll() {
    return this.ticketRepo.find({
      relations: ['createdBy', 'assignedTo', 'asset'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number) {
    const ticket = await this.ticketRepo.findOne({
      where: { id },
      relations: ['createdBy', 'assignedTo', 'asset'],
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async findByEmployee(userId: number) {
    return this.ticketRepo.find({
      where: { createdBy: { id: userId } },
      relations: ['createdBy', 'assignedTo', 'asset'],
      order: { createdAt: 'DESC' },
    });
  }

  // Agent updates ticket status
  async updateStatus(ticketId: number, status: TicketStatus, user: { userId: number; role: string }) {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: ['assignedTo', 'asset'],
    });
    

    if (!ticket) throw new NotFoundException('Ticket not found');

    if (!ticket.assignedTo || ticket.assignedTo.id !== user.userId) {
      throw new ForbiddenException('Not authorized to update this ticket');
    }

    if (ticket.status === status) {
      return ticket;
    }

    ticket.status = status;

    if (status === TicketStatus.RESOLVED) {
      ticket.assignedTo.isAvailable = true;
      await this.userRepo.save(ticket.assignedTo);
      // Asset stays ASSIGNED to the employee — it does not go back to AVAILABLE
    }

    return this.ticketRepo.save(ticket);
  }

  /**
   * IT Agent assigns an asset to a ticket.
   * Sets the asset status to ASSIGNED and assigned_to = ticket creator's ID.
   */
  async assignAssetToTicket(
    ticketId: number,
    assetId: number,
    userId: number,
  ) {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: ['createdBy', 'assignedTo', 'asset'],
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    // Only the assigned IT agent can assign assets
    if (!ticket.assignedTo || ticket.assignedTo.id !== userId) {
      throw new ForbiddenException('Only the assigned IT agent can assign assets');
    }

    // If there was a previously assigned asset, unassign it
    if (ticket.asset) {
      ticket.asset.assigned_to = null as any;
      ticket.asset.status = 'AVAILABLE';
      await this.assetRepo.save(ticket.asset);
    }

    // Assign the new asset
    const asset = await this.assetRepo.findOneBy({ id: assetId });
    if (!asset) throw new NotFoundException('Asset not found');

    asset.status = 'ASSIGNED';
    asset.assigned_to = ticket.createdBy?.id ?? 0;
    await this.assetRepo.save(asset);

    ticket.asset = asset;
    await this.ticketRepo.save(ticket);

    return this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: ['createdBy', 'assignedTo', 'asset'],
    });
  }
}