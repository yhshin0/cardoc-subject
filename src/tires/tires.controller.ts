import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TIRE_CONSTANTS, TIRE_ERROR_MSG } from './constants/tire.constants';
import { CreateTireDto } from './dto/create-tire.dto';
import { TiresService } from './tires.service';

@UseGuards(JwtAuthGuard)
@Controller('tires')
export class TiresController {
  constructor(private readonly tiresService: TiresService) {}

  @Get('/:user_id')
  async findByUserId(
    @Param('user_id') user_id: string,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ) {
    return await this.tiresService.findByUserId(user_id, +page, +pageSize);
  }

  @Post()
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

  private checkArray(body): void {
    if (!(body instanceof Array)) {
      throw new BadRequestException(TIRE_ERROR_MSG.INVALID_INPUT_DATA);
    }
    if (body.length <= 0 || body.length > 5) {
      throw new BadRequestException(TIRE_ERROR_MSG.INVALID_INPUT_DATA);
    }
  }
}