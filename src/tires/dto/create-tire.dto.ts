import { IsNumber, IsString } from 'class-validator';

export class CreateTireDto {
  constructor({ user_id, trim_id }) {
    this.user_id = user_id;
    this.trim_id = trim_id;
  }

  @IsString()
  user_id: string;

  @IsNumber()
  trim_id: number;
}
