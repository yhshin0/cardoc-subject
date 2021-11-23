import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signin')
  async signin(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.validateUser(loginUserDto);
  }
}
