import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.usersService.findOne(loginUserDto.user_id);
    if (
      user &&
      (await this.usersService.compareHash(user, loginUserDto.password))
    ) {
      const { USER_PASSWORD, ...result } = user;
      return result;
    }
    return null;
  }

  async signin(user: any): Promise<{ access_token: string }> {
    const payload = { user_id: user.user_id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
