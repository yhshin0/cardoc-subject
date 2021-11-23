import { IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  user_id: string;

  @IsString()
  password: string;
}
