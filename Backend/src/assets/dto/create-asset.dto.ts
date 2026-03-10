import { IsString, IsOptional } from 'class-validator';

export class CreateAssetDto {

  @IsString()
  name: string;

  @IsString()
  serial_number: string;

  @IsOptional()
  @IsString()
  description?: string;
}