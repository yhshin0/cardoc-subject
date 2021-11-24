import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorator/get-user.decorator';
import { CreateOwnCarDto } from './dto/create-own-car.dto';
import { OwnCarsService } from './own-cars.service';

@Controller('own-cars')
export class OwnCarsController {
  constructor(private readonly ownCarsService: OwnCarsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createOwnCarDto: CreateOwnCarDto, @GetUser() user) {
    return await this.ownCarsService.create(createOwnCarDto, user.user_id);
  }
}
