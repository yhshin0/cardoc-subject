import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TIRE_CONSTANTS, TIRE_ERROR_MSG } from './constants/tire.constants';
import { CreateTireDto } from './dto/create-tire.dto';
import { TiresService } from './tires.service';

@Controller('tires')
export class TiresController {
  constructor(private readonly tiresService: TiresService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() body,
  ): Promise<{ createdTireCount: number; result: any }> {
    this.checkArrayType(body);

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

  private checkArrayType(body): void {
    if (!(body instanceof Array)) {
      throw new BadRequestException(TIRE_ERROR_MSG.INVALID_INPUT_DATA);
    }
  }
}
