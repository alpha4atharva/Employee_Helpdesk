import { IsNumber } from 'class-validator';

export class AssignTicketDto {
  @IsNumber()
  userId: number;
}