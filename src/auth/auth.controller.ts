import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('/signup')
  @HttpCode(200)
  async signup(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ access_token: string }> {
    const createdUser = await this.usersService.create(createUserDto);
    return await this.authService.signin(createdUser);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  @HttpCode(200)
  async signin(@Request() req): Promise<{ access_token: string }> {
    return this.authService.signin(req.user);
  }
}
