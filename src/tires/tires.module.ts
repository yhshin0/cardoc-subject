import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TiresService } from './tires.service';
import { TiresController } from './tires.controller';
import { Tire } from './entities/tire.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tire]), HttpModule],
  controllers: [TiresController],
  providers: [TiresService],
})
export class TiresModule {}
