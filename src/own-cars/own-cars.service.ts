import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateOwnCarDto } from './dto/create-own-car.dto';
import { OwnCar } from './entities/own-car.entity';
import { UsersService } from '../users/users.service';
import { OWN_CAR_ERROR_MSG } from './constants/own-cars.constants';

@Injectable()
export class OwnCarsService {
  constructor(
    @InjectRepository(OwnCar) private ownCarsRepository: Repository<OwnCar>,
    private usersService: UsersService,
  ) {}

  async create(
    createOwnCarDto: CreateOwnCarDto,
    userId: string,
  ): Promise<OwnCar> {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new BadRequestException(OWN_CAR_ERROR_MSG.NOT_EXIST_USER);
    }

    return await this.ownCarsRepository.save(
      this.ownCarsRepository.create({
        trimId: createOwnCarDto.trimId,
        user,
      }),
    );
  }
}
