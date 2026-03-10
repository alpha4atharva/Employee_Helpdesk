import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateMessageDto } from './entities/create-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post(':ticketId')
  async sendMessage(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Body() createMessageDto: CreateMessageDto,
    @Request() req,
  ) {
    console.log("Logging in controller",req.user);
    
    return this.messagesService.sendMessage(
      ticketId,
      createMessageDto.content,
      req.user,
    );
  }

  @Get(':ticketId')
  async getMessages(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Request() req,
  ) {
    return this.messagesService.getMessages(ticketId, req.user);
  }
}