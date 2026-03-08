import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Message } from './entities/message.entity';
import { Ticket } from '../tickets/entities/ticket.entity';

import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Ticket])],
  providers: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}