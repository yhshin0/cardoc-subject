import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OwnCar } from './entities/own-car.entity';
import { OwnCarsService } from './own-cars.service';
import { OwnCarsController } from './own-cars.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([OwnCar]), UsersModule],
  providers: [OwnCarsService],
  controllers: [OwnCarsController],
})
export class OwnCarsModule {}
