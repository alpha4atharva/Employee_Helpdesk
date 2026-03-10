import { IsNumber } from 'class-validator';

export class AssignAssetDto {
  @IsNumber()
  userId: number;
}