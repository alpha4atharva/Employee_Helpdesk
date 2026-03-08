import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateMessageDto } from './entities/create-message.dto';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post(':ticketId')
  async sendMessage(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: RequestWithUser,
  ) {
    return this.messagesService.sendMessage(
      ticketId,
      createMessageDto.content,
      req.user,
    );
  }

  @Get(':ticketId')
  async getMessages(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.messagesService.getMessages(ticketId, req.user);
  }
}