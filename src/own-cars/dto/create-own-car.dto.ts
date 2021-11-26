import { IsNumber } from 'class-validator';

export class CreateOwnCarDto {
  @IsNumber()
  trimId: number;
}
