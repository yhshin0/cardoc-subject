import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TIRE_CONSTANTS, TIRE_ERROR_MSG } from './constants/tire.constants';
import { CreateTireDto } from './dto/create-tire.dto';
import { Tire } from './entities/tire.entity';
import { TiresService } from './tires.service';

@UseGuards(JwtAuthGuard)
@Controller('tires')
export class TiresController {
  constructor(private readonly tiresService: TiresService) {}

  @Get('/:userId')
  @HttpCode(200)
  async findByUserId(
    @Param('userId') userId: string,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ totalCount: number; data: Tire[] }> {
    return await this.tiresService.findByUserId(userId, +page, +pageSize);
  }

  @Post()
  @HttpCode(200)
  async create(
    @Body() body,
  ): Promise<{ createdTireCount: number; result: any }> {
    this.checkArray(body);

    const createdTireList = [];
    for (const elem of body) {
      const createTireDto = new CreateTireDto({ ...elem });
      createdTireList.push(await this.tiresService.create(createTireDto));
    }

    return {
      createdTireCount: createdTireList.filter(
        (item) => item.status === TIRE_CONSTANTS.VALID_TIRE_STATUS,
      ).length,
      result: createdTireList,
    };
  }

  private checkArray(body: any): void {
    if (!(body instanceof Array)) {
      throw new BadRequestException(TIRE_ERROR_MSG.INVALID_INPUT_DATA);
    }
    if (body.length === 0) {
      throw new BadRequestException(TIRE_ERROR_MSG.NO_INPUT_DATA);
    } else if (body.length > TIRE_CONSTANTS.MAX_NUM_OF_INPUT_DATA) {
      throw new BadRequestException(TIRE_ERROR_MSG.EXCEED_INPUT_DATA);
    }
  }
}
