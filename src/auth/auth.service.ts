import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.usersService.findOne(loginUserDto.userId);
    if (
      user &&
      (await this.usersService.compareHash(user, loginUserDto.password))
    ) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async signin(user: User): Promise<{ access_token: string }> {
    const payload = { userId: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
