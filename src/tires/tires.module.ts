import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TiresService } from './tires.service';
import { TiresController } from './tires.controller';
import { Tire } from './entities/tire.entity';
import { UsersModule } from '../users/users.module';
import { OwnCarsModule } from '../own-cars/own-cars.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tire]),
    HttpModule,
    UsersModule,
    OwnCarsModule,
  ],
  controllers: [TiresController],
  providers: [TiresService],
})
export class TiresModule {}
