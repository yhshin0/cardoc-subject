import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';
import { AUTH_ERROR_MSG } from '../constants/auth.constants';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'userId',
      passwordField: 'password',
    });
  }

  async validate(userId: string, password: string): Promise<any> {
    const loginUserDto = { userId, password };
    const user = await this.authService.validateUser(loginUserDto);

    if (!user) {
      throw new UnauthorizedException(AUTH_ERROR_MSG.INVALID_USER);
    }
    return user;
  }
}
