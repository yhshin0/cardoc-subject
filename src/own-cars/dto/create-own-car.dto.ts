import { IsNumber } from 'class-validator';

export class CreateOwnCarDto {
  @IsNumber()
  trim_id: number;
}
