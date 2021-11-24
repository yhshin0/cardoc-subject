import { IsString } from 'class-validator';

export class CreateOwnCarDto {
  @IsString()
  trim_id: string;
}
