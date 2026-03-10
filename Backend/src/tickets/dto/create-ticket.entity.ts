import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { TicketPriority } from '../../common/enums/ticket-priority.enum';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @IsString()
  @IsOptional()
  assetType?: string;
}