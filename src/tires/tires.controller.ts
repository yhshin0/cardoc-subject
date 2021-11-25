import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { validate } from 'class-validator';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
      await this.validateCreateTireDto(createTireDto);

      createdTireList.push(await this.tiresService.create(createTireDto));
    }

    return {
      createdTireCount: createdTireList.filter(
        (item) => item.status === 'success',
      ).length,
      result: createdTireList,
    };
  }

  private checkArrayType(body): void {
    if (!(body instanceof Array)) {
      throw new BadRequestException('입력 정보가 잘못되었습니다');
    }
  }

  private async validateCreateTireDto(
    createTireDto: CreateTireDto,
  ): Promise<void> {
    const res = await validate(createTireDto);
    if (res.length > 0) {
      throw new BadRequestException('입력 정보가 잘못되었습니다');
    }
  }
}
