import { Injectable } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

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
}
