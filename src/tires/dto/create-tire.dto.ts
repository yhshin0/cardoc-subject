import { IsNumber, IsString } from 'class-validator';

export class CreateTireDto {
  constructor({ userId, trimId }) {
    this.userId = userId;
    this.trimId = trimId;
  }

  @IsString()
  userId: string;

  @IsNumber()
  trimId: number;
}
