import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'user_id',
      passwordField: 'password',
    });
  }

  async validate(user_id: string, password: string) {
    const loginUserDto = { user_id, password };
    const user = await this.authService.validateUser(loginUserDto);

    if (!user) {
      throw new UnauthorizedException('유효하지 않은 회원 정보입니다');
    }
    return user;
  }
}
