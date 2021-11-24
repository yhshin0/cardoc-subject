import { Module } from '@nestjs/common';
import { OwnCarsService } from './own-cars.service';
import { OwnCarsController } from './own-cars.controller';

@Module({
  providers: [OwnCarsService],
  controllers: [OwnCarsController],
})
export class OwnCarsModule {}
